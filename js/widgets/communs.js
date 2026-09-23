/* Ce que plusieurs écrans partagent : la pastille de catégorie, le
   filtre de bibliothèque (recherche + catégories), les vignettes. */
import { esc, statut, telechargerBlob, slug, sansAccents } from "../core/dom.js";
import { seanceEnPdf, carteDePoche, ficheAtelier } from "./feuillepdf.js";
import { CATEGORIES, NIVEAUX } from "../data/catalogue.js";
import { FORMES_TRAVAIL, fiche } from "../data/referentiel.js";
import { svg } from "./patinoire.js";

export function chip(categorie) {
  const c = CATEGORIES[categorie] || { libelle: categorie, couleur: "#888" };
  return `<span class="chip" style="--c:${c.couleur}">${esc(c.libelle)}</span>`;
}

export function libelleNiveau(n) {
  return NIVEAUX[n] || n || "";
}

/* La vignette annonce son format par une classe. C'est ce qui permet au
   navigateur de lui réserver sa place sans rendre le schéma : sans
   cela, les cartes hors champ se déplient en arrivant et la page
   s'allonge sous le pouce pendant qu'on descend. */
export function vignette(schema) {
  const vue = schema && schema.vue === "moitie" ? "moitie" : "entiere";
  return `<div class="vignette vignette-${vue}">${svg(schema, { classe: "mini" })}</div>`;
}

export function barreFiltres(filtre) {
  return `
    <div class="filtres">
      <input type="search" name="q" placeholder="Chercher un exercice…" value="${esc(filtre.q)}" aria-label="Recherche">
      <div class="chips" role="group" aria-label="Catégories">
        <button type="button" class="chip ${filtre.categorie ? "" : "actif"}" data-cat="" style="--c:#5a6b7a">Toutes</button>
        ${Object.entries(CATEGORIES)
          .map(([k, c]) => `<button type="button" class="chip ${filtre.categorie === k ? "actif" : ""}" data-cat="${k}" style="--c:${c.couleur}">${esc(c.libelle)}</button>`)
          .join("")}
      </div>
    </div>`;
}

/* La recherche pardonne deux choses, parce qu'un coach fait les deux :
   il tape sans accent (« echauffement »), et il tape des mots dans
   l'ordre qui lui vient (« tir revers » pour « Réception en revers et
   tir »). Tous les mots doivent être présents, chacun où il veut. */
export function filtrer(exercices, filtre) {
  const mots = sansAccents(filtre.q || "")
    .split(/\s+/)
    .filter(Boolean);
  return exercices
    .filter((e) => !filtre.categorie || e.categorie === filtre.categorie)
    .filter((e) => {
      if (!mots.length) return true;
      const meule = sansAccents(
        [e.nom, e.objectif, e.description, e.materiel, e.variantes, (e.points_cles || []).join(" "), (e.corrections || []).join(" ")].join(" "),
      );
      return mots.every((m) => meule.includes(m));
    });
}

/* Ordre d'affichage : par catégorie (dans l'ordre du catalogue), puis
   par nom. Un coach cherche « un exercice de tir », pas un exercice
   modifié mardi. */
export function trier(exercices) {
  const rang = Object.keys(CATEGORIES);
  return exercices.slice().sort((a, b) => {
    const ra = rang.indexOf(a.categorie);
    const rb = rang.indexOf(b.categorie);
    if (ra !== rb) return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb);
    return (a.nom || "").localeCompare(b.nom || "", "fr");
  });
}

/* Fabrique et télécharge la feuille de séance en PDF. Le bouton est
   désactivé pendant la fabrication : sur un téléphone, rendre dix
   schémas prend une ou deux secondes. */
export async function exporterPdf(se, bouton) {
  const libelle = bouton ? bouton.textContent : "";
  if (bouton) {
    bouton.disabled = true;
    bouton.textContent = "Fabrication…";
  }
  try {
    const blob = await seanceEnPdf(se);
    telechargerBlob(`seance-${slug(se.titre) || se.id}${se.date ? `-${se.date}` : ""}.pdf`, blob);
    statut("PDF téléchargé.");
  } catch (e) {
    console.error(e);
    statut(`Le PDF n'a pas pu être fabriqué : ${e.message}`, { duree: 6000 });
  } finally {
    if (bouton) {
      bouton.disabled = false;
      bouton.textContent = libelle;
    }
  }
}

/* La carte de poche : une page, gros caractères, sans schéma. */
export async function exporterCarte(se, bouton) {
  const libelle = bouton ? bouton.textContent : "";
  if (bouton) {
    bouton.disabled = true;
    bouton.textContent = "Fabrication…";
  }
  try {
    const blob = await carteDePoche(se);
    telechargerBlob(`carte-${slug(se.titre) || se.id}${se.date ? `-${se.date}` : ""}.pdf`, blob);
    statut("Carte de poche téléchargée.");
  } catch (e) {
    console.error(e);
    statut(`La carte n'a pas pu être fabriquée : ${e.message}`, { duree: 6000 });
  } finally {
    if (bouton) {
      bouton.disabled = false;
      bouton.textContent = libelle;
    }
  }
}

/* Ce qu'un exercice doit à ses fiches techniques : les codes, et, repliés,
   les points clés et corrections de chaque fiche. */
export function blocTechnique(ex, { ouvert = false } = {}) {
  const codes = (ex.techniques || []).map(fiche).filter(Boolean);
  const forme = ex.forme && FORMES_TRAVAIL[ex.forme];
  if (!codes.length && !forme && !(ex.corrections && ex.corrections.length)) return "";
  return `
    <div class="technique-bloc">
      ${forme ? `<p class="forme-travail"><strong>Forme de travail :</strong> ${esc(forme)}</p>` : ""}
      ${ex.corrections && ex.corrections.length ? `<p class="corrections-titre"><strong>Corrections</strong></p><ul class="corrections">${ex.corrections.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
      ${codes
        .map(
          (fi) => `<details class="fiche-technique" ${ouvert ? "open" : ""}><summary>${esc(fi.nom)} <small>fiche technique</small></summary>
            ${fi.points.length ? `<p class="mini-titre">Points clés</p><ul>${fi.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
            ${fi.corrections.length ? `<p class="mini-titre">Corrections</p><ul class="corrections">${fi.corrections.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
          </details>`,
        )
        .join("")}
    </div>`;
}

export function codesTechniques(ex) {
  return (ex.techniques || []).map(fiche).filter(Boolean);
}

/* La fiche atelier d'un exercice, pour celui qui tient l'atelier. */
export async function exporterFicheAtelier(ex, bouton, opts = {}) {
  const libelle = bouton ? bouton.textContent : "";
  if (bouton) {
    bouton.disabled = true;
    bouton.textContent = "Fabrication…";
  }
  try {
    const blob = await ficheAtelier(ex, opts);
    telechargerBlob(`atelier-${slug(ex.nom) || ex.id}.pdf`, blob);
    statut("Fiche atelier téléchargée.");
  } catch (e) {
    console.error(e);
    statut(`La fiche n'a pas pu être fabriquée : ${e.message}`, { duree: 6000 });
  } finally {
    if (bouton) {
      bouton.disabled = false;
      bouton.textContent = libelle;
    }
  }
}
