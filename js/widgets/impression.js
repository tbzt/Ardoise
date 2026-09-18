/* Impression — la feuille de séance : le plan en tête, puis chaque
   exercice avec son schéma. Pensée pour tenir dans la poche du coach,
   ou sur son téléphone au bord de la glace. */
import { Store } from "../core/store.js";
import { esc, formaterDate, formaterDuree, heureA } from "../core/dom.js";
import { CATEGORIES } from "../data/catalogue.js";
import { chip, vignette, exporterPdf } from "./communs.js";

export const Impression = {
  afficher(main, id) {
    const se = Store.seances.get(id);
    const sec = document.createElement("section");
    sec.className = "ecran ecran-impression";
    main.replaceChildren(sec);
    if (!se) {
      sec.innerHTML = `<p class="vide">Cette séance n'existe pas. <a href="#/seances">Retour aux séances.</a></p>`;
      return { detruire() {} };
    }

    const total = Store.dureeSeance(se);
    let t = 0;
    const lignes = se.blocs.map((b) => {
      const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
      const debut = t;
      t += Number(b.duree) || 0;
      return { b, ex, debut };
    });

    sec.innerHTML = `
      <div class="entete no-print">
        <a class="retour" href="#/seance/${se.id}">← Retour à la séance</a>
        <span class="spacer"></span>
        <button type="button" data-act="pdf" title="Télécharger cette feuille en PDF">Télécharger en PDF</button>
        <button type="button" class="primaire" data-act="imprimer">Imprimer</button>
      </div>
      <article class="feuille">
        <header>
          <h1>${esc(se.titre) || "Séance"}</h1>
          <p class="meta">${[formaterDate(se.date), se.heure, se.groupe, se.lieu, `${formaterDuree(se.duree_glace)} de glace`]
            .filter(Boolean)
            .map(esc)
            .join(" · ")}</p>
          ${se.objectif ? `<p class="objectif">${esc(se.objectif)}</p>` : ""}
        </header>

        <table class="plan">
          <thead><tr><th>Heure</th><th>Durée</th><th>Bloc</th><th>Note</th></tr></thead>
          <tbody>
            ${lignes
              .map(
                ({ b, ex, debut }, i) => `
              <tr>
                <td class="mono">${esc(heureA(se.heure, debut))}</td>
                <td class="mono">${b.duree}'</td>
                <td><strong>${i + 1}. ${esc(b.titre || (ex && ex.nom) || "")}</strong>${ex ? ` ${chip(ex.categorie)}` : ""}</td>
                <td>${esc(b.note)}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
          <tfoot><tr><td></td><td class="mono">${total}'</td><td colspan="2">${total > se.duree_glace ? `<span class="alerte">Dépasse le temps de glace de ${total - se.duree_glace} min</span>` : `Total`}</td></tr></tfoot>
        </table>

        ${lignes
          .filter(({ ex }) => ex)
          .map(
            ({ b, ex, debut }, k) => `
          <section class="fiche-impr">
            ${vignette(ex.schema)}
            <div class="fiche-texte">
              <h2>${esc(b.titre || ex.nom)} <small>${esc(heureA(se.heure, debut))} · ${b.duree} min · ${esc((CATEGORIES[ex.categorie] || {}).libelle || "")}</small></h2>
              ${ex.objectif ? `<p class="objectif">${esc(ex.objectif)}</p>` : ""}
              ${ex.description ? `<p class="description">${esc(ex.description).replace(/\n/g, "<br>")}</p>` : ""}
              ${ex.points_cles && ex.points_cles.length ? `<ul class="points">${ex.points_cles.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
              ${ex.materiel ? `<p class="materiel"><strong>Matériel :</strong> ${esc(ex.materiel)}</p>` : ""}
              ${b.note ? `<p class="note"><strong>Pour cette séance :</strong> ${esc(b.note)}</p>` : ""}
            </div>
          </section>`,
          )
          .join("")}

        ${se.notes ? `<footer><h2>Notes</h2><p>${esc(se.notes).replace(/\n/g, "<br>")}</p></footer>` : ""}
      </article>`;

    sec.querySelector("[data-act='imprimer']").addEventListener("click", () => window.print());
    sec.querySelector("[data-act='pdf']").addEventListener("click", (e) => exporterPdf(se, e.currentTarget));
    return { detruire() {} };
  },
};
