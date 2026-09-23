/* Groupes — la liste des équipes et sections qu'on entraîne. */
import { Store } from "../core/store.js";
import { esc, formaterJour, formaterDuree } from "../core/dom.js";
import { NIVEAUX } from "../data/catalogue.js";
import { mention } from "./communs.js";
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
          <h1>Groupes ${mention(tous.length)}</h1>
          <span class="spacer"></span>
          <button type="button" class="primaire" data-act="nouveau">Nouveau groupe</button>
        </div>
        ${
          tous.length === 0
            ? `<p class="vide">Aucun groupe. Un groupe, c'est une équipe ou une section : ses séances s'y rattachent, et l'appli garde l'historique de ce que vous avez fait ensemble.</p>`
            : `<div class="spine">${tous.map(rangee).join("")}</div>`
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
   quoi que ce soit. La rangée porte maintenant ce qui déclenche un
   geste — la prochaine séance et son état, le cycle en cours, et ce
   que le dernier bilan a laissé à revoir.

   Même colonne vertébrale que l'écran Séances : une poignée d'objets
   homogènes n'est pas un catalogue à parcourir. Ici c'est le NOM qui
   porte la structure, puisqu'un groupe n'a pas de date. */
function rangee(g) {
  const toutes = seancesDuGroupe(g.id);
  const faites = toutes.filter(estFaite);
  const { total } = repartition(faites);
  const prochaine = toutes.filter((s) => !estFaite(s)).sort((a, b) => (a.date || "").localeCompare(b.date || ""))[0];
  const cycle = cycleCourant(g);
  const revoir = aRevoir(faites, 2);
  const sansBilan = faites.filter((s) => !(s.bilan && s.bilan.fait)).length;

  const meta = [
    NIVEAUX[g.niveau] || "",
    `${faites.length} séance${faites.length > 1 ? "s" : ""} faite${faites.length > 1 ? "s" : ""}`,
    `${formaterDuree(total)} de glace`,
  ]
    .filter(Boolean)
    .map((x) => mention(x))
    .join(`<span class="sep">·</span>`);

  return `
    <article class="rang rang-groupe">
      <p class="quand"><span class="jour">${esc(g.nom) || "Sans nom"}</span></p>
      <div class="quoi">
        <p class="ligne-meta">${meta}</p>
        ${
          prochaine
            ? `<p class="objectif">Prochaine : ${esc(formaterJour(prochaine.date))}${prochaine.titre ? ` — ${esc(prochaine.titre)}` : ""}<span class="sep">·</span>${prochaine.blocs.length ? mention("prête", "bien") : mention("déroulé vide", "attire")}</p>`
            : `<p class="objectif">${mention("aucune séance prévue", "attire")}</p>`
        }
        ${cycle ? `<p class="objectif">${mention(`Cycle « ${cycle.nom || "en cours"} » jusqu'au ${formaterCourt(cycle.fin)}`)}</p>` : ""}
        ${revoir.length ? `<p class="objectif">${mention("↻ À revoir", "alerte")} ${revoir.slice(0, 2).map((r) => esc(r.titre)).join(" · ")}</p>` : ""}
        <p class="gestes">
          <a class="lien" href="#/groupe/${g.id}">Ouvrir le groupe</a>
          ${sansBilan ? `<a class="lien" href="#/groupe/${g.id}">${sansBilan} bilan${sansBilan > 1 ? "s" : ""} à faire</a>` : ""}
        </p>
      </div>
    </article>`;
}
