/* Dialogue — une boîte modale native, pour choisir dans une liste.
   Renvoie une promesse : l'identifiant choisi, ou null si on referme. */
import { esc, formaterDuree } from "../core/dom.js";
import { svg } from "./patinoire.js";
import { CATEGORIES, NIVEAUX } from "../data/catalogue.js";
import { blocTechnique } from "./communs.js";

export function choisir({ titre, options, vide = "Rien à proposer." }) {
  return new Promise((resoudre) => {
    const d = document.createElement("dialog");
    d.className = "dialogue";
    d.innerHTML = `
      <form method="dialog">
        <h2>${esc(titre)}</h2>
        ${
          options.length
            ? `<ul class="choix">${options
                .map(
                  (o) =>
                    `<li><button type="submit" value="${esc(o.id)}"><strong>${esc(o.libelle)}</strong>${o.detail ? `<small>${esc(o.detail)}</small>` : ""}</button></li>`,
                )
                .join("")}</ul>`
            : `<p class="vide">${esc(vide)}</p>`
        }
        <div class="dialogue-pied"><button type="submit" value="">Annuler</button></div>
      </form>`;
    document.body.appendChild(d);
    d.addEventListener("close", () => {
      const v = d.returnValue;
      d.remove();
      resoudre(v || null);
    });
    d.showModal();
  });
}

/* L'aperçu d'un exercice : le schéma et l'essentiel du texte, sans
   quitter l'écran. Renvoie "ajouter", "fiche" ou null. */
export function apercu(ex) {
  return new Promise((resoudre) => {
    const cat = CATEGORIES[ex.categorie] || { libelle: ex.categorie, couleur: "#888" };
    const d = document.createElement("dialog");
    d.className = "dialogue dialogue-apercu";
    d.innerHTML = `
      <form method="dialog">
        <div class="apercu-entete">
          <h2>${esc(ex.nom) || "<em>Sans nom</em>"}</h2>
          <p class="meta"><span class="pastille" style="--c:${cat.couleur}">${esc(cat.libelle)}</span> <span>${formaterDuree(ex.duree)}</span> <span>${esc(NIVEAUX[ex.niveau] || "")}</span></p>
        </div>
        <div class="apercu-corps">
          <div class="vignette">${svg(ex.schema)}</div>
          <div class="apercu-texte">
            ${ex.objectif ? `<p class="objectif">${esc(ex.objectif)}</p>` : ""}
            ${ex.description ? `<p>${esc(ex.description).replace(/\n/g, "<br>")}</p>` : ""}
            ${ex.points_cles && ex.points_cles.length ? `<ul>${ex.points_cles.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
            ${ex.materiel ? `<p class="materiel"><strong>Matériel :</strong> ${esc(ex.materiel)}</p>` : ""}
            ${ex.variantes ? `<p class="materiel"><strong>Variantes :</strong> ${esc(ex.variantes)}</p>` : ""}
            ${blocTechnique(ex)}
          </div>
        </div>
        <div class="dialogue-pied">
          <button type="submit" value="fiche">Ouvrir la fiche</button>
          <span class="spacer"></span>
          <button type="submit" value="">Fermer</button>
          <button type="submit" value="ajouter" class="primaire">+ Ajouter au déroulé</button>
        </div>
      </form>`;
    document.body.appendChild(d);
    d.addEventListener("close", () => {
      const v = d.returnValue;
      d.remove();
      resoudre(v || null);
    });
    d.showModal();
  });
}
