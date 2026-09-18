/* Ce que plusieurs écrans partagent : la pastille de catégorie, le
   filtre de bibliothèque (recherche + catégories), les vignettes. */
import { esc } from "../core/dom.js";
import { CATEGORIES, NIVEAUX } from "../data/catalogue.js";
import { svg } from "./patinoire.js";

export function chip(categorie) {
  const c = CATEGORIES[categorie] || { libelle: categorie, couleur: "#888" };
  return `<span class="chip" style="--c:${c.couleur}">${esc(c.libelle)}</span>`;
}

export function libelleNiveau(n) {
  return NIVEAUX[n] || n || "";
}

export function vignette(schema) {
  return `<div class="vignette">${svg(schema, { classe: "mini" })}</div>`;
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

export function filtrer(exercices, filtre) {
  const q = (filtre.q || "").trim().toLowerCase();
  return exercices
    .filter((e) => !filtre.categorie || e.categorie === filtre.categorie)
    .filter((e) => {
      if (!q) return true;
      const meule = [e.nom, e.objectif, e.description, e.materiel, (e.points_cles || []).join(" ")].join(" ").toLowerCase();
      return meule.includes(q);
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
