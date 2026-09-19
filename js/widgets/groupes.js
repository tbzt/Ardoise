/* Groupes — la liste des équipes et sections qu'on entraîne. */
import { Store } from "../core/store.js";
import { esc, formaterDate, formaterDuree } from "../core/dom.js";
import { NIVEAUX } from "../data/catalogue.js";
import { seancesDuGroupe, seancesFaites, repartition } from "../core/analyse.js";

export const Groupes = {
  afficher(main) {
    const sec = document.createElement("section");
    sec.className = "ecran ecran-liste";
    main.replaceChildren(sec);

    const rendre = () => {
      const tous = Store.groupes.tous();
      const sansGroupe = Store.seances.toutes().filter((s) => !s.groupeId).length;
      sec.innerHTML = `
        <div class="entete">
          <h1>Groupes <span class="compte">${tous.length}</span></h1>
          <span class="spacer"></span>
          <button type="button" class="primaire" data-act="nouveau">+ Nouveau groupe</button>
        </div>
        ${
          tous.length === 0
            ? `<p class="vide">Aucun groupe. Un groupe, c'est une équipe ou une section : ses séances s'y rattachent, et l'appli garde l'historique de ce que vous avez fait ensemble.</p>`
            : `<div class="cartes cartes-seances">${tous.map(carte).join("")}</div>`
        }
        ${sansGroupe ? `<p class="avis">${sansGroupe} séance${sansGroupe > 1 ? "s" : ""} sans groupe : ouvrez-les pour les rattacher, l'historique sera plus juste.</p>` : ""}`;
    };

    sec.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b && b.dataset.act === "nouveau") {
        const g = Store.groupes.creer();
        location.hash = `#/groupe/${g.id}`;
      }
    });

    const off = Store.abonner(rendre);
    rendre();
    return { detruire: off };
  },
};

function carte(g) {
  const toutes = seancesDuGroupe(g.id);
  const faites = seancesFaites(g.id);
  const { total } = repartition(faites);
  const prochaine = toutes.find((s) => !faites.includes(s));
  return `
    <a class="carte carte-seance" href="#/groupe/${g.id}">
      <h3>${esc(g.nom) || "<em>Groupe sans nom</em>"}</h3>
      <p class="meta"><span>${esc(NIVEAUX[g.niveau] || "")}</span><span>${faites.length} séance${faites.length > 1 ? "s" : ""} faite${faites.length > 1 ? "s" : ""}</span><span>${formaterDuree(total)} de glace</span></p>
      ${prochaine ? `<p class="objectif">Prochaine : ${esc(formaterDate(prochaine.date))}${prochaine.titre ? ` — ${esc(prochaine.titre)}` : ""}</p>` : g.description ? `<p class="objectif">${esc(g.description)}</p>` : ""}
    </a>`;
}
