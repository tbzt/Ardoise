/* Groupes — la liste des équipes et sections qu'on entraîne. */
import { Store } from "../core/store.js";
import { esc, formaterDate, formaterDuree } from "../core/dom.js";
import { NIVEAUX } from "../data/catalogue.js";
import { seancesDuGroupe, seancesFaites, repartition, estFaite, aRevoir, cycleCourant, formaterCourt } from "../core/analyse.js";

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

/* La carte portait le nom, trois chiffres et la date de la prochaine
   séance : de quoi savoir que le groupe existe, pas de quoi décider
   quoi que ce soit. Elle porte maintenant ce qui déclenche un geste —
   la prochaine séance et son état, le cycle en cours, et ce que le
   dernier bilan a laissé à revoir. */
function carte(g) {
  const toutes = seancesDuGroupe(g.id);
  const faites = toutes.filter(estFaite);
  const { total } = repartition(faites);
  const prochaine = toutes.filter((s) => !estFaite(s)).sort((a, b) => (a.date || "").localeCompare(b.date || ""))[0];
  const cycle = cycleCourant(g);
  const revoir = aRevoir(faites, 2);
  const sansBilan = faites.filter((s) => !(s.bilan && s.bilan.fait)).length;

  return `
    <article class="carte carte-seance carte-groupe">
      <h3><a class="couverture" href="#/groupe/${g.id}">${esc(g.nom) || "<em>Groupe sans nom</em>"}</a></h3>
      <p class="meta">
        <span>${esc(NIVEAUX[g.niveau] || "")}</span>
        <span>${faites.length} séance${faites.length > 1 ? "s" : ""} faite${faites.length > 1 ? "s" : ""}</span>
        <span>${formaterDuree(total)} de glace</span>
      </p>
      ${cycle ? `<p class="carte-cycle">Cycle « ${esc(cycle.nom || "en cours")} » jusqu'au ${esc(formaterCourt(cycle.fin))}</p>` : ""}
      ${
        prochaine
          ? `<p class="objectif"><strong>Prochaine :</strong> ${esc(formaterDate(prochaine.date, { year: undefined }))}${prochaine.titre ? ` — ${esc(prochaine.titre)}` : ""} <span class="etiquette ${prochaine.blocs.length ? "etat-ok" : "etat-vide"}">${prochaine.blocs.length ? "prête" : "déroulé vide"}</span></p>`
          : `<p class="objectif">Aucune séance prévue.</p>`
      }
      ${revoir.length ? `<p class="carte-revoir">↻ À revoir : ${revoir.slice(0, 2).map((r) => esc(r.titre)).join(" · ")}</p>` : ""}
      ${sansBilan ? `<p class="carte-pied"><a class="carte-lien" href="#/groupe/${g.id}">${sansBilan} bilan${sansBilan > 1 ? "s" : ""} à faire →</a></p>` : ""}
    </article>`;
}
