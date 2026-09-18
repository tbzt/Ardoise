/* Séances — la liste, la plus proche en premier. */
import { Store } from "../core/store.js";
import { esc, formaterDate, formaterDuree } from "../core/dom.js";

export const Seances = {
  afficher(main) {
    const sec = document.createElement("section");
    sec.className = "ecran ecran-liste";
    main.replaceChildren(sec);

    const rendre = () => {
      const toutes = Store.seances.toutes().sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.modifie - a.modifie);
      sec.innerHTML = `
        <div class="entete">
          <h1>Séances <span class="compte">${toutes.length}</span></h1>
          <span class="spacer"></span>
          <button type="button" class="primaire" data-act="nouvelle">+ Nouvelle séance</button>
        </div>
        ${
          toutes.length === 0
            ? `<p class="vide">Aucune séance. Créez-en une, puis piochez dans la bibliothèque d'exercices pour la composer.</p>`
            : `<div class="cartes cartes-seances">${toutes.map(carte).join("")}</div>`
        }`;
    };

    sec.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b && b.dataset.act === "nouvelle") {
        const se = Store.seances.creer();
        location.hash = `#/seance/${se.id}`;
      }
    });

    const off = Store.abonner(rendre);
    rendre();
    return { detruire: off };
  },
};

function carte(s) {
  const total = Store.dureeSeance(s);
  const depasse = total > (Number(s.duree_glace) || 0);
  return `
    <a class="carte carte-seance" href="#/seance/${s.id}">
      <p class="date">${esc(formaterDate(s.date))}${s.heure ? ` · ${esc(s.heure)}` : ""}</p>
      <h3>${esc(s.titre) || "<em>Séance sans titre</em>"}</h3>
      <p class="meta">${s.groupe ? `<span>${esc(s.groupe)}</span>` : ""}<span>${s.blocs.length} bloc${s.blocs.length > 1 ? "s" : ""}</span><span class="${depasse ? "alerte" : ""}">${formaterDuree(total)} / ${formaterDuree(s.duree_glace)}</span><a class="carte-lien" href="#/seance/${s.id}/glace" title="Bord de glace">Bord de glace →</a></p>
      ${s.objectif ? `<p class="objectif">${esc(s.objectif)}</p>` : ""}
    </a>`;
}
