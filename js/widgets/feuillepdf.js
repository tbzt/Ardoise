/* FeuillePdf — la feuille de séance en PDF, fabriquée dans le
   navigateur : le plan en tête, puis chaque exercice avec son schéma
   (rendu en image), sa description et ses points clés. Même contenu
   que l'écran d'impression, mais un vrai fichier qu'on envoie au groupe
   ou qu'on garde sur le téléphone. */
import { Store } from "../core/store.js";
import { nouveauDocument, couperLignes, largeurTexte } from "../core/pdf.js";
import { formaterDate, formaterDuree, heureA } from "../core/dom.js";
import { CATEGORIES, NIVEAUX } from "../data/catalogue.js";
import { FORMES_TRAVAIL, fiche } from "../data/referentiel.js";
import { cumulMateriel, libelleMateriel } from "../core/materiel.js";
import { svg, VUES } from "./patinoire.js";

const ENCRE = [24, 35, 46];
const GRIS = [100, 112, 124];
const REGLE = [205, 212, 218];
const ROUGE = [179, 38, 30];

const A4 = { largeur: 595.28, hauteur: 841.89 };
const MARGE = 42;
const HAUT = 46;
const BAS = A4.hauteur - 44;
const LARGEUR_UTILE = A4.largeur - 2 * MARGE;
const LARGEUR_IMAGE = 172;
const ECART = 14;

function hex(c) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c || "");
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : GRIS;
}

/* Le schéma → JPEG, en passant par un <img> SVG et un canvas. */
async function rasteriser(schema, echelle = 2.5, qualite = 0.88) {
  const vue = VUES[schema?.vue] || VUES.entiere;
  const w = Math.round(vue.w * echelle);
  const h = Math.round(vue.h * echelle);
  const source = svg(schema, { taille: { w, h } });
  const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    await new Promise((ok, ko) => {
      img.onload = ok;
      img.onerror = () => ko(new Error("Le schéma n'a pas pu être rendu en image."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const base64 = canvas.toDataURL("image/jpeg", qualite).split(",")[1];
    const bin = atob(base64);
    const octets = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
    return { octets, w, h, ratio: h / w };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function seanceEnPdf(se, { echelle = 2.5 } = {}) {
  const doc = nouveauDocument(A4);
  let page = doc.nouvellePage();
  let y = HAUT;

  const nouvellePage = () => {
    page = doc.nouvellePage();
    y = HAUT;
  };
  const place = (h) => {
    if (y + h > BAS) nouvellePage();
  };

  /* ── En-tête ────────────────────────────────────────────── */
  const titre = se.titre || "Séance";
  const lignesTitre = couperLignes(titre, "gras", 20, LARGEUR_UTILE);
  y += 14;
  y = page.lignes(MARGE, y, lignesTitre, { police: "gras", taille: 20, couleur: ENCRE, interligne: 1.15 });
  const meta = [formaterDate(se.date), se.heure, se.groupe, se.lieu, `${formaterDuree(se.duree_glace)} de glace`].filter(Boolean).join("  ·  ");
  y = page.lignes(MARGE, y + 2, couperLignes(meta, "normal", 10, LARGEUR_UTILE), { taille: 10, couleur: GRIS });
  if (se.objectif) {
    y = page.lignes(MARGE, y + 2, couperLignes(se.objectif, "oblique", 10.5, LARGEUR_UTILE), { police: "oblique", taille: 10.5, couleur: ENCRE });
  }
  y += 6;
  page.ligne(MARGE, y, MARGE + LARGEUR_UTILE, y, { epaisseur: 1.2, couleur: ENCRE });
  y += 14;

  /* ── Le plan ────────────────────────────────────────────── */
  const total = Store.dureeSeance(se);
  let t = 0;
  const lignesPlan = se.blocs.map((b) => {
    const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
    const debut = t;
    t += Number(b.duree) || 0;
    return { b, ex, debut };
  });

  const colonnes = { heure: MARGE, duree: MARGE + 48, bloc: MARGE + 84, note: MARGE + 320 };
  const largeurBloc = colonnes.note - colonnes.bloc - 10;
  const largeurNote = MARGE + LARGEUR_UTILE - colonnes.note;

  /* Dans le tableau, `y` est le HAUT de la rangée ; la ligne de base du
     texte est un peu plus bas, et le filet se trace sous la rangée. */
  const entetePlan = () => {
    const yb = y + 7;
    page.texte(colonnes.heure, yb, "HEURE", { police: "gras", taille: 7.5, couleur: GRIS });
    page.texte(colonnes.duree, yb, "DURÉE", { police: "gras", taille: 7.5, couleur: GRIS });
    page.texte(colonnes.bloc, yb, "BLOC", { police: "gras", taille: 7.5, couleur: GRIS });
    page.texte(colonnes.note, yb, "NOTE", { police: "gras", taille: 7.5, couleur: GRIS });
    y += 12;
    page.ligne(MARGE, y, MARGE + LARGEUR_UTILE, y, { epaisseur: 0.6, couleur: REGLE });
    y += 2;
  };
  entetePlan();

  lignesPlan.forEach(({ b, ex, debut }, i) => {
    const titreBloc = `${i + 1}. ${b.titre || (ex && ex.nom) || ""}`;
    const lTitre = couperLignes(titreBloc, "gras", 10, largeurBloc);
    const lNote = couperLignes(b.note || "", "normal", 9, largeurNote);
    const cat = ex ? CATEGORIES[ex.categorie] : null;
    const hauteur = Math.max(lTitre.length * 12 + (cat ? 10 : 0), lNote.length * 11.5, 12) + 10;
    if (y + hauteur > BAS) {
      nouvellePage();
      entetePlan();
    }
    const yb = y + 13;
    page.texte(colonnes.heure, yb, heureA(se.heure, debut), { taille: 9.5, couleur: GRIS });
    page.texte(colonnes.duree, yb, `${b.duree}'`, { taille: 9.5, couleur: GRIS });
    const yFin = page.lignes(colonnes.bloc, yb, lTitre, { police: "gras", taille: 10, couleur: ENCRE, interligne: 1.2 });
    if (cat) page.texte(colonnes.bloc, yFin - 1, cat.libelle, { taille: 8, couleur: hex(cat.couleur) });
    if (lNote.length && lNote[0]) page.lignes(colonnes.note, yb, lNote, { taille: 9, couleur: ENCRE, interligne: 1.28 });
    y += hauteur;
    page.ligne(MARGE, y, MARGE + LARGEUR_UTILE, y, { epaisseur: 0.4, couleur: REGLE });
  });
  place(24);
  page.ligne(MARGE, y, MARGE + LARGEUR_UTILE, y, { epaisseur: 1, couleur: ENCRE });
  y += 14;
  page.texte(colonnes.duree, y, `${total}'`, { police: "gras", taille: 9.5, couleur: ENCRE });
  const depasse = total > (Number(se.duree_glace) || 0);
  page.texte(colonnes.bloc, y, depasse ? `Dépasse le temps de glace de ${total - se.duree_glace} min` : "Total", {
    police: "gras",
    taille: 9.5,
    couleur: depasse ? ROUGE : ENCRE,
  });
  y += 26;

  /* ── Les exercices ──────────────────────────────────────── */
  const xTexte = MARGE + LARGEUR_IMAGE + ECART;
  const largeurTexteCol = LARGEUR_UTILE - LARGEUR_IMAGE - ECART;

  for (const { b, ex, debut } of lignesPlan) {
    if (!ex) continue;
    const image = await rasteriser(ex.schema, echelle);
    const idImage = doc.ajouterImage(image.octets, image.w, image.h);
    const hImage = LARGEUR_IMAGE * image.ratio;

    // on prépare tout le texte pour connaître la hauteur du bloc
    const parties = [];
    const ajouter = (texte, opts, avant = 0) => {
      const lignes = couperLignes(texte, opts.police || "normal", opts.taille, largeurTexteCol - (opts.retrait || 0));
      parties.push({ lignes, opts, avant });
    };
    ajouter(b.titre || ex.nom, { police: "gras", taille: 12.5, couleur: ENCRE, interligne: 1.15 });
    const catLib = (CATEGORIES[ex.categorie] || {}).libelle || "";
    ajouter(`${heureA(se.heure, debut)}  ·  ${b.duree} min  ·  ${catLib}`, { taille: 8.5, couleur: GRIS }, 1);
    if (ex.objectif) ajouter(ex.objectif, { police: "oblique", taille: 9.5, couleur: ENCRE }, 5);
    if (ex.description) ajouter(ex.description, { taille: 9.2, couleur: ENCRE, interligne: 1.32 }, 5);
    if (ex.points_cles && ex.points_cles.length) {
      parties.push({ lignes: [], opts: {}, avant: 4 });
      for (const p of ex.points_cles) ajouter(p, { taille: 9.2, couleur: ENCRE, retrait: 10, puce: true, interligne: 1.32 }, 0);
    }
    if (ex.materiel) ajouter(`Matériel : ${ex.materiel}`, { taille: 8.8, couleur: GRIS }, 5);
    if (b.note) ajouter(`Pour cette séance : ${b.note}`, { police: "gras", taille: 9, couleur: ENCRE }, 4);

    const hTexte = parties.reduce((h, p) => h + p.avant + p.lignes.length * (p.opts.taille || 9) * (p.opts.interligne || 1.3), 0);
    /* Un bloc commence sur la page s'il y a la place du schéma et de
       quelques lignes ; le texte, lui, peut continuer sur la suivante.
       Sans cette tolérance, chaque exercice un peu long sautait de
       page entier et laissait la moitié de la précédente vide. */
    const hBloc = Math.max(hImage, hTexte) + 16;
    const hMinimum = Math.min(hBloc, hImage + 24);
    if (y + hMinimum > BAS && y > HAUT + 40) nouvellePage();

    page.ligne(MARGE, y - 2, MARGE + LARGEUR_UTILE, y - 2, { epaisseur: 0.5, couleur: REGLE });
    y += 10;
    page.image(idImage, MARGE, y, LARGEUR_IMAGE, hImage);
    page.rect(MARGE, y, LARGEUR_IMAGE, hImage, { contour: REGLE, epaisseur: 0.5 });

    let yt = y + 9;
    for (const p of parties) {
      yt += p.avant;
      if (p.opts.puce) {
        if (yt > BAS) {
          nouvellePage();
          yt = y = HAUT;
        }
        page.texte(xTexte, yt, "•", { taille: 9.2, couleur: GRIS });
        yt = page.lignes(xTexte + 10, yt, p.lignes, p.opts);
      } else {
        for (const l of p.lignes) {
          if (yt > BAS) {
            nouvellePage();
            yt = y = HAUT;
          }
          if (l) page.texte(xTexte, yt, l, p.opts);
          yt += (p.opts.taille || 9) * (p.opts.interligne || 1.3);
        }
      }
    }
    y = Math.max(y + hImage, yt) + 12;
  }

  /* ── Notes ──────────────────────────────────────────────── */
  if (se.notes) {
    const lignes = couperLignes(se.notes, "normal", 9.5, LARGEUR_UTILE);
    place(30 + lignes.length * 12.5);
    page.ligne(MARGE, y, MARGE + LARGEUR_UTILE, y, { epaisseur: 1, couleur: ENCRE });
    y += 16;
    page.texte(MARGE, y, "Notes", { police: "gras", taille: 12, couleur: ENCRE });
    y += 15;
    y = page.lignes(MARGE, y, lignes, { taille: 9.5, couleur: ENCRE, interligne: 1.32 });
  }

  /* ── Pied de page ───────────────────────────────────────── */
  const n = doc.pages.length;
  doc.pages.forEach((p, i) => {
    const pied = `${titre}  ·  Ardoise`;
    p.texte(MARGE, A4.hauteur - 24, pied, { taille: 7.5, couleur: GRIS });
    const num = `${i + 1} / ${n}`;
    p.texte(MARGE + LARGEUR_UTILE - largeurTexte(num, "normal", 7.5), A4.hauteur - 24, num, { taille: 7.5, couleur: GRIS });
  });

  return new Blob([doc.generer()], { type: "application/pdf" });
}

/* ── La carte de poche ──────────────────────────────────────────
   Une seule page, gros caractères, pas de schéma : ce qu'on lit d'un
   coup d'œil au banc, un gant à la main. Si la séance est longue, la
   mise en page se resserre d'elle-même (un point clé au lieu de deux,
   puis des caractères plus petits) plutôt que de déborder. */

function materielDe(se) {
  return cumulMateriel(
    se.blocs
      .map((b) => {
        const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
        return ex && ex.materiel ? { titre: b.titre || ex.nom, materiel: ex.materiel } : null;
      })
      .filter(Boolean),
  ).map(libelleMateriel);
}

export async function carteDePoche(se) {
  const total = Store.dureeSeance(se);
  let t = 0;
  const lignes = se.blocs.map((b) => {
    const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
    const debut = t;
    t += Number(b.duree) || 0;
    return { b, ex, debut };
  });
  const materiel = materielDe(se);

  /* On essaie des réglages de plus en plus serrés jusqu'à tenir. */
  const reglages = [
    { points: 2, k: 1 },
    { points: 2, k: 0.92 },
    { points: 1, k: 0.92 },
    { points: 1, k: 0.84 },
    { points: 0, k: 0.84 },
    { points: 0, k: 0.76 },
  ];
  let doc;
  for (const r of reglages) {
    doc = composerCarte(se, lignes, materiel, total, r);
    if (doc.pages.length === 1) break;
  }
  return new Blob([doc.generer()], { type: "application/pdf" });
}

function composerCarte(se, lignes, materiel, total, { points, k }) {
  const doc = nouveauDocument(A4);
  let page = doc.nouvellePage();
  const M = 36;
  const L = A4.largeur - 2 * M;
  const BASF = A4.hauteur - 30;
  let y = 40;
  const T = (n) => n * k; // taille de caractère mise à l'échelle

  const ecrire = (x, yy, texte, opts) => page.texte(x, yy, texte, opts);

  // en-tête : titre, méta, objectif
  const lignesTitre = couperLignes(se.titre || "Séance", "gras", T(22), L);
  y += T(20);
  y = page.lignes(M, y, lignesTitre, { police: "gras", taille: T(22), couleur: ENCRE, interligne: 1.12 });
  const meta = [formaterDate(se.date), se.heure ? `${se.heure} – ${heureA(se.heure, total)}` : "", se.groupe, se.lieu, `${formaterDuree(total)} sur ${formaterDuree(se.duree_glace)}`].filter(Boolean).join("  ·  ");
  y = page.lignes(M, y + 2, couperLignes(meta, "normal", T(11), L), { taille: T(11), couleur: GRIS });
  if (se.objectif) y = page.lignes(M, y + 2, couperLignes(se.objectif, "oblique", T(11.5), L), { police: "oblique", taille: T(11.5), couleur: ENCRE });
  y += 6;
  page.ligne(M, y, M + L, y, { epaisseur: 1.4, couleur: ENCRE });
  y += 12;

  // à sortir + à avoir en tête, dans un cadre
  const encadre = [];
  if (materiel.length) encadre.push({ titre: "À SORTIR", lignes: couperLignes(materiel.join("  ·  "), "gras", T(11), L - 20) });
  if (se.notes) encadre.push({ titre: "EN TÊTE", lignes: couperLignes(se.notes, "normal", T(10.5), L - 20).slice(0, 4) });
  if (encadre.length) {
    const h = encadre.reduce((a, e) => a + 14 + e.lignes.length * T(11) * 1.3, 0) + 12;
    page.rect(M, y, L, h, { remplissage: [242, 245, 248], contour: REGLE, epaisseur: 0.6 });
    let yy = y + 13;
    for (const e of encadre) {
      ecrire(M + 10, yy, e.titre, { police: "gras", taille: T(7.5), couleur: GRIS });
      yy += 12;
      yy = page.lignes(M + 10, yy, e.lignes, { police: e.titre === "À SORTIR" ? "gras" : "normal", taille: T(e.titre === "À SORTIR" ? 11 : 10.5), couleur: ENCRE, interligne: 1.3 });
      yy += 2;
    }
    y += h + 14;
  }

  // les blocs
  const xHeure = M;
  const xTexte = M + 62;
  const largeurTexte = L - 62;
  lignes.forEach(({ b, ex, debut }, i) => {
    const titre = `${i + 1}. ${b.titre || (ex && ex.nom) || ""}`;
    const lTitre = couperLignes(titre, "gras", T(13), largeurTexte);
    const cles = ex && ex.points_cles ? ex.points_cles.slice(0, points) : [];
    const lCles = cles.map((c) => couperLignes(c, "normal", T(10.5), largeurTexte - 12));
    const lNote = b.note ? couperLignes(b.note, "gras", T(10.5), largeurTexte - 12) : [];
    const libre = !ex;
    const hauteur = libre
      ? T(13) * 1.2 + 10
      : lTitre.length * T(13) * 1.2 + lCles.reduce((a, l) => a + l.length * T(10.5) * 1.3, 0) + lNote.length * T(10.5) * 1.3 + 12;
    if (y + hauteur > BASF) {
      page = doc.nouvellePage();
      y = 40;
    }
    page.ligne(M, y, M + L, y, { epaisseur: libre ? 0.4 : 0.6, couleur: REGLE });
    y += 6;
    const yb = y + T(13);
    ecrire(xHeure, yb, heureA(se.heure, debut), { police: "gras", taille: T(13), couleur: libre ? GRIS : ENCRE });
    ecrire(xHeure, yb + T(10) * 1.2, `${b.duree} min`, { taille: T(9), couleur: GRIS });
    let yt = page.lignes(xTexte, yb, lTitre, { police: "gras", taille: T(13), couleur: libre ? GRIS : ENCRE, interligne: 1.2 });
    for (const l of lCles) {
      ecrire(xTexte, yt, "•", { taille: T(10.5), couleur: GRIS });
      yt = page.lignes(xTexte + 12, yt, l, { taille: T(10.5), couleur: ENCRE, interligne: 1.3 });
    }
    if (lNote.length) {
      ecrire(xTexte, yt, "»", { police: "gras", taille: T(10.5), couleur: [154, 98, 0] });
      yt = page.lignes(xTexte + 12, yt, lNote, { police: "gras", taille: T(10.5), couleur: [154, 98, 0], interligne: 1.3 });
    }
    y = Math.max(y + hauteur, yt - T(13) + 6);
  });
  page.ligne(M, y, M + L, y, { epaisseur: 1.2, couleur: ENCRE });

  // pied
  doc.pages.forEach((p, i) => {
    p.texte(M, A4.hauteur - 16, `${se.titre || "Séance"}  ·  carte de poche  ·  Ardoise`, { taille: 7, couleur: GRIS });
    if (doc.pages.length > 1) {
      const num = `${i + 1} / ${doc.pages.length}`;
      p.texte(M + L - largeurTexte(num, "normal", 7), A4.hauteur - 16, num, { taille: 7, couleur: GRIS });
    }
  });
  return doc;
}

/* ── La fiche atelier ───────────────────────────────────────────
   Une page par exercice, pour celui qui tient l'atelier : le schéma en
   grand, l'objectif, l'organisation, les points clés, les corrections,
   le matériel — et les repères pour bien le mener (forme de travail,
   temps d'activité, feedback). C'est la fiche qu'on lui donne quinze
   minutes avant. */
export async function ficheAtelier(ex, { duree = null, note = "" } = {}) {
  const doc = nouveauDocument(A4);
  const page = doc.nouvellePage();
  const M = 40;
  const L = A4.largeur - 2 * M;
  let y = 40;

  const cat = CATEGORIES[ex.categorie] || { libelle: ex.categorie, couleur: "#888" };
  y += 18;
  y = page.lignes(M, y, couperLignes(ex.nom || "Exercice", "gras", 20, L - 120), { police: "gras", taille: 20, couleur: ENCRE, interligne: 1.12 });
  const bandeau = [cat.libelle, NIVEAUX[ex.niveau] || "", `${duree || ex.duree} min`].filter(Boolean).join("  ·  ");
  page.texte(M, y, bandeau, { police: "gras", taille: 10, couleur: hex(cat.couleur) });
  page.texte(M + L - largeurTexte("FICHE ATELIER", "gras", 9), 52, "FICHE ATELIER", { police: "gras", taille: 9, couleur: GRIS });
  y += 14;
  if (ex.objectif) y = page.lignes(M, y, couperLignes(ex.objectif, "oblique", 11.5, L), { police: "oblique", taille: 11.5, couleur: ENCRE });
  y += 4;
  page.ligne(M, y, M + L, y, { epaisseur: 1.2, couleur: ENCRE });
  y += 12;

  // le schéma en grand
  const image = await rasteriser(ex.schema, 3);
  const largeurImage = Math.min(L, 320 / image.ratio);
  const hImage = largeurImage * image.ratio;
  const xImage = M + (L - largeurImage) / 2;
  page.image(doc.ajouterImage(image.octets, image.w, image.h), xImage, y, largeurImage, hImage);
  page.rect(xImage, y, largeurImage, hImage, { contour: REGLE, epaisseur: 0.5 });
  y += hImage + 14;

  // deux colonnes : organisation à gauche, points clés et corrections à droite
  const colG = M;
  const colD = M + L / 2 + 10;
  const largeurCol = L / 2 - 10;
  const bas = A4.hauteur - 60;
  let yG = y;
  let yD = y;
  const titre = (x, yy, t) => {
    page.texte(x, yy, t.toUpperCase(), { police: "gras", taille: 7.5, couleur: GRIS });
    return yy + 11;
  };
  const para = (x, yy, texte, opts = {}) => {
    const lignes = couperLignes(texte, opts.police || "normal", opts.taille || 9.5, largeurCol - (opts.retrait || 0));
    for (const l of lignes) {
      if (yy > bas) break;
      if (l) page.texte(x + (opts.retrait || 0), yy, l, { police: opts.police || "normal", taille: opts.taille || 9.5, couleur: opts.couleur || ENCRE });
      yy += (opts.taille || 9.5) * 1.32;
    }
    return yy;
  };
  const puces = (x, yy, liste, couleur = ENCRE, puce = "•") => {
    for (const item of liste) {
      if (yy > bas) break;
      page.texte(x, yy, puce, { taille: 9.5, couleur: GRIS });
      yy = para(x, yy, item, { retrait: 11, couleur });
    }
    return yy;
  };

  // gauche
  if (ex.description) {
    yG = titre(colG, yG, "Organisation et déroulé");
    yG = para(colG, yG, ex.description) + 6;
  }
  if (ex.forme && FORMES_TRAVAIL[ex.forme]) {
    yG = titre(colG, yG, "Forme de travail");
    yG = para(colG, yG, FORMES_TRAVAIL[ex.forme]) + 6;
  }
  if (ex.materiel) {
    yG = titre(colG, yG, "Matériel");
    yG = para(colG, yG, ex.materiel) + 6;
  }
  if (ex.variantes) {
    yG = titre(colG, yG, "Adapter : plus facile, plus dur");
    yG = para(colG, yG, ex.variantes) + 6;
  }
  if (note) {
    yG = titre(colG, yG, "Pour cette séance");
    yG = para(colG, yG, note, { police: "gras", couleur: [154, 98, 0] }) + 6;
  }

  // droite
  if (ex.points_cles && ex.points_cles.length) {
    yD = titre(colD, yD, "Points clés — ce qu'on dit, ce qu'on regarde");
    yD = puces(colD, yD, ex.points_cles) + 6;
  }
  const fiches = (ex.techniques || []).map(fiche).filter(Boolean);
  const corrections = [...(ex.corrections || [])];
  for (const fi of fiches) for (const c of fi.corrections.slice(0, 3)) corrections.push(c);
  if (corrections.length) {
    yD = titre(colD, yD, "Corrections — ce qu'on voit souvent");
    yD = puces(colD, yD, corrections.slice(0, 8), ROUGE, "✗".normalize ? "x" : "x") + 6;
  }
  if (fiches.length) {
    yD = titre(colD, yD, "Fiches techniques");
    yD = para(colD, yD, fiches.map((fi) => fi.nom).join(" · "), { taille: 9, couleur: GRIS }) + 6;
  }

  // pied : les repères pour tenir l'atelier
  const reperes = couperLignes(
    "Sur place 15 min avant, matériel prêt · une consigne d'une phrase pour lancer · temps d'attente 30 % au plus · feedback : 1 collectif, 3 individuels · se placer pour voir tout l'atelier",
    "normal",
    7.5,
    L,
  );
  const yPied = A4.hauteur - 34 - reperes.length * 10;
  page.ligne(M, yPied - 10, M + L, yPied - 10, { epaisseur: 0.6, couleur: REGLE });
  const yFin = page.lignes(M, yPied, reperes, { taille: 7.5, couleur: GRIS, interligne: 1.33 });
  page.texte(M, yFin + 2, `${ex.nom || "Exercice"}  ·  fiche atelier  ·  Ardoise`, { taille: 7, couleur: GRIS });

  return new Blob([doc.generer()], { type: "application/pdf" });
}
