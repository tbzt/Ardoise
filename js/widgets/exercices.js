/* Exercices — la bibliothèque : des cartes, un filtre, un bouton. */
import { Store } from "../core/store.js";
import { esc, formaterDuree } from "../core/dom.js";
import { chip, libelleNiveau, vignette, barreFiltres, filtrer, trier } from "./communs.js";

const filtre = { q: "", categorie: "" };

export const Exercices = {
  afficher(main) {
    const sec = document.createElement("section");
    sec.className = "ecran ecran-liste";
    main.replaceChildren(sec);

    const rendre = () => {
      const tous = Store.exercices.tous();
      const liste = trier(filtrer(tous, filtre));
      sec.innerHTML = `
        <div class="entete">
          <h1>Exercices <span class="compte">${tous.length}</span></h1>
          <span class="spacer"></span>
          <button type="button" class="primaire" data-act="nouveau">+ Nouvel exercice</button>
        </div>
        ${barreFiltres(filtre)}
        ${
          tous.length === 0
            ? `<p class="vide">Aucun exercice pour l'instant. Créez-en un, ou installez le <strong>Catalogue</strong> (bouton en haut) pour partir d'une quinzaine d'exercices pour adultes débutants.</p>`
            : liste.length === 0
              ? `<p class="vide">Rien ne correspond à ce filtre.</p>`
              : `<div class="cartes">${liste.map(carte).join("")}</div>`
        }`;
      const q = sec.querySelector('input[name="q"]');
      if (filtre._focus && q) {
        q.focus();
        q.setSelectionRange(q.value.length, q.value.length);
      }
    };

    sec.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "nouveau") {
        const ex = Store.exercices.creer();
        location.hash = `#/exercice/${ex.id}`;
      } else if (b.dataset.cat !== undefined) {
        filtre.categorie = b.dataset.cat;
        filtre._focus = false;
        rendre();
      }
    });
    sec.addEventListener("input", (e) => {
      if (e.target.name === "q") {
        filtre.q = e.target.value;
        filtre._focus = true;
        rendre();
      }
    });

    const off = Store.abonner(rendre);
    rendre();
    return { detruire: off };
  },
};

function carte(e) {
  return `
    <a class="carte" href="#/exercice/${e.id}">
      ${vignette(e.schema)}
      <div class="carte-corps">
        <h3>${esc(e.nom) || "<em>Sans nom</em>"}</h3>
        <p class="meta">${chip(e.categorie)} <span>${formaterDuree(e.duree)}</span> <span>${esc(libelleNiveau(e.niveau))}</span></p>
        ${e.objectif ? `<p class="objectif">${esc(e.objectif)}</p>` : ""}
      </div>
    </a>`;
}
