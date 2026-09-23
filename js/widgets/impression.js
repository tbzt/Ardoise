/* Impression — la feuille de séance, posée en HTML.

   Ce fichier ne décide plus de ce que porte la feuille : il reçoit le
   document de `core/feuille.js` et le met en page. Son jumeau
   `feuillepdf.js` reçoit exactement le même et le pose en PDF. Ajouter
   une partie à la feuille se fait donc à un seul endroit, et les deux
   sorties la portent du même coup — elles avaient dérivé tant qu'elles
   décidaient chacune de son côté.

   La seule chose qu'il montre de plus que le PDF est la LÉGENDE des
   schémas, et c'est délibéré : elle vaut vingt-cinq vignettes, qu'il
   faudrait rasteriser une à une pour le PDF, pour une page qu'on lit à
   l'écran ou qu'on imprime une fois. */

import { Store } from "../core/store.js";
import { Storage } from "../core/storage.js";
import { esc } from "../core/dom.js";
import { feuille } from "../core/feuille.js";
import { pastille, vignette, exporterPdf, exporterCarte } from "./communs.js";
import { legende } from "./patinoire.js";

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

    const d = feuille(se);
    const avecLegende = Storage.lire("legende_feuille", true);

    sec.innerHTML = `
      <div class="entete no-print">
        <a class="retour" href="#/seance/${se.id}">← Retour à la séance</a>
        <span class="spacer"></span>
        <label class="case"><input type="checkbox" data-legende ${avecLegende ? "checked" : ""}> Légende</label>
        <button type="button" data-act="carte" title="Une page, gros caractères, sans schéma">Carte de poche (PDF)</button>
        <button type="button" data-act="pdf" title="Télécharger cette feuille en PDF">Feuille de séance (PDF)</button>
        <button type="button" class="primaire" data-act="imprimer">Imprimer</button>
      </div>
      <article class="feuille">
        <header>
          <h1>${esc(d.titre)}</h1>
          <p class="meta">${d.meta.map(esc).join(" · ")}</p>
          ${d.objectif ? `<p class="objectif">${esc(d.objectif)}</p>` : ""}
        </header>

        <table class="plan">
          <thead><tr>${d.plan.colonnes.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
          <tbody>
            ${d.plan.lignes
              .map(
                (l) => `
              <tr>
                <td class="mono">${esc(l.heure)}</td>
                <td class="mono">${l.duree}'</td>
                <td><strong>${l.numero}. ${esc(l.titre)}</strong>${l.categorie ? ` ${pastille(l.categorie.cle)}` : ""}</td>
                <td>${esc(l.note)}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
          <tfoot><tr><td></td><td class="mono">${d.plan.total.minutes}'</td><td colspan="2">${d.plan.total.depasse ? `<span class="alerte">${esc(d.plan.total.libelle)}</span>` : esc(d.plan.total.libelle)}</td></tr></tfoot>
        </table>

        ${d.fiches
          .map(
            (f) => `
          <section class="fiche-impr">
            ${vignette(f.schema)}
            <div class="fiche-texte">
              <h2>${esc(f.titre)} <small>${esc(f.situation)}</small></h2>
              ${f.objectif ? `<p class="objectif">${esc(f.objectif)}</p>` : ""}
              ${f.description ? `<p class="description">${esc(f.description).replace(/\n/g, "<br>")}</p>` : ""}
              ${f.points.length ? `<ul class="points">${f.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
              ${f.parties
                .map(
                  (p) =>
                    `<p class="${p.appuye ? "note" : "materiel"}"><strong>${esc(p.etiquette)} :</strong> ${(Array.isArray(p.valeur) ? p.valeur : [p.valeur]).map(esc).join(" · ")}</p>`,
                )
                .join("")}
            </div>
          </section>`,
          )
          .join("")}

        <section class="legende legende-impr" data-legende-bloc ${avecLegende ? "" : "hidden"}>
          <div class="legende-col"><h4>Symboles</h4><ul>${legende().symboles.map((x) => `<li>${x.svg}<span>${esc(x.nom)}</span></li>`).join("")}</ul></div>
          <div class="legende-col"><h4>Déplacements et passes</h4><ul>${legende().traits.map((x) => `<li>${x.svg}<span>${esc(x.nom)}</span></li>`).join("")}</ul></div>
        </section>

        ${d.notes ? `<footer><h2>Notes</h2><p>${esc(d.notes).replace(/\n/g, "<br>")}</p></footer>` : ""}
      </article>`;

    sec.querySelector("[data-act='imprimer']").addEventListener("click", () => window.print());
    sec.querySelector("[data-legende]").addEventListener("change", (e) => {
      sec.querySelector("[data-legende-bloc]").hidden = !e.target.checked;
      Storage.ecrire("legende_feuille", e.target.checked);
    });
    sec.querySelector("[data-act='pdf']").addEventListener("click", (e) => exporterPdf(se, e.currentTarget));
    sec.querySelector("[data-act='carte']").addEventListener("click", (e) => exporterCarte(se, e.currentTarget));
    return { detruire() {} };
  },
};
