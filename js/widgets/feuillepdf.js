/* FeuillePdf — la feuille de séance en PDF, fabriquée dans le
   navigateur : le plan en tête, puis chaque exercice avec son schéma
   (rendu en image), sa description et ses points clés. Même contenu
   que l'écran d'impression, mais un vrai fichier qu'on envoie au groupe
   ou qu'on garde sur le téléphone. */
import { Store } from "../core/store.js";
import { nouveauDocument, couperLignes, largeurTexte } from "../core/pdf.js";
import { formaterDate, formaterDuree, heureA } from "../core/dom.js";
import { CATEGORIES } from "../data/catalogue.js";
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
