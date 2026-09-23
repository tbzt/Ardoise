/* Bilan — le troisième moment, et son propre écran.

   Il vivait au bas du bord de glace, après les neuf blocs : pour le
   remplir, il fallait retraverser toute la séance. Or on le remplit
   après, dans le vestiaire ou la voiture, quand la séance est finie —
   pas en la parcourant. Il a donc son adresse, et on y arrive par les
   trois chemins qui correspondent à un vrai moment : la fin du mode
   Entraîner, le menu de la séance, et la liste « à faire » de
   l'accueil.

   Deux minutes, et c'est ce qui nourrit tout le reste : l'historique du
   groupe, les marqueurs « à revoir » de la bibliothèque, la bande de
   contexte de la prochaine séance, et le brouillon. Un bilan non rempli
   est la seule chose qui rende l'appli amnésique. */

import { Store, bilanVierge, estPause } from "../core/store.js";
import { esc, debounce, statut, formaterDate, aujourdhuiIso } from "../core/dom.js";
import { pastille, mention } from "./communs.js";

export const Bilan = {
  afficher(main, id) {
    const se = Store.seances.get(id);
    const sec = document.createElement("section");
    sec.className = "ecran ecran-bilan";
    main.replaceChildren(sec);
    if (!se) {
      sec.innerHTML = `<p class="vide">Cette séance n'existe pas. <a href="#/seances">Retour aux séances.</a></p>`;
      return { detruire() {} };
    }
    if (!se.bilan) se.bilan = bilanVierge();

    const lignes = se.blocs.map((b) => ({ b, ex: b.exerciceId ? Store.exercices.get(b.exerciceId) : null, pause: estPause(b) }));
    const de = (blocId) => {
      if (!se.bilan.blocs[blocId]) se.bilan.blocs[blocId] = { fait: true, note: null, commentaire: "" };
      return se.bilan.blocs[blocId];
    };

    sec.innerHTML = `
      <div class="entete">
        <a class="retour" href="#/seance/${se.id}">← Séance</a>
        <span class="spacer"></span>
        <span class="etat" data-etat>${se.bilan.fait ? `Enregistré le ${esc(formaterDate(se.bilan.date))}` : "Pas encore enregistré"}</span>
      </div>
      <nav class="moments" aria-label="Les trois moments de la séance">
        <a href="#/seance/${se.id}">1 · Préparer</a>
        <a href="#/seance/${se.id}/glace">2 · Bord de glace</a>
        <span class="actif" aria-current="step">3 · Bilan</span>
      </nav>

      <h1>${esc(se.titre) || "Séance"}</h1>
      <p class="fiche-meta">${[formaterDate(se.date), se.groupe].filter(Boolean).map(esc).join(" · ")}</p>
      <p class="compte-aide">
        Deux minutes, maintenant ou ce soir. C'est ce qui nourrit l'historique du groupe :
        ce qu'on refait, ce qu'on retravaille, ce qu'on laisse.
      </p>

      <section class="bilan-global">
        <div class="bilan-note">
          <span class="mini-titre">La séance</span>
          <div class="bilan-etoiles" role="group" aria-label="Note de la séance">
            ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-etoile="${n}" class="${se.bilan.note >= n ? "actif" : ""}" aria-label="${n} sur 5">★</button>`).join("")}
          </div>
        </div>
        <label>Présents <input type="number" name="presents" min="0" max="60" value="${esc(se.bilan.presents != null ? se.bilan.presents : "")}"></label>
      </section>

      <h2 class="mini-titre">Bloc par bloc <small>décochez ce qui n'a pas été fait</small></h2>
      <ol class="bilan-blocs">
        ${lignes
          .map(({ b, ex, pause }, i) =>
            /* Une pause garde sa place et son numéro — le bilan doit se
               lire dans l'ordre de la séance — mais ne porte aucun
               contrôle : il n'y a rien à y juger. */
            pause
              ? `
          <li class="bilan-pause"><span>${i + 1}. ${esc(b.titre || "Pause")}</span>${mention(`${b.duree} min`)}</li>`
              : `
          <li data-bloc="${b.id}">
            <div class="bilan-titre">
              <label class="bilan-fait"><input type="checkbox" name="fait" ${de(b.id).fait === false ? "" : "checked"}> <strong>${i + 1}. ${esc(b.titre || (ex && ex.nom) || "")}</strong></label>
              ${ex ? pastille(ex.categorie) : ""}
            </div>
            <div class="bilan-notes" role="group" aria-label="Comment ça s'est passé">
              <button type="button" data-note="1" class="${de(b.id).note === 1 ? "actif" : ""}">À revoir</button>
              <button type="button" data-note="2" class="${de(b.id).note === 2 ? "actif" : ""}">Correct</button>
              <button type="button" data-note="3" class="${de(b.id).note === 3 ? "actif" : ""}">Bien</button>
            </div>
            <input name="commentaire" value="${esc(de(b.id).commentaire || "")}" placeholder="Un mot : trop long, à refaire avec palet, X a eu peur…">
          </li>`,
          )
          .join("")}
      </ol>

      <label class="bilan-retenir">À retenir pour la prochaine fois
        <textarea name="retenir" rows="3" placeholder="Ce qui a marché, ce qu'on refera, ce qu'on changera…">${esc(se.bilan.retenir || "")}</textarea>
      </label>

      <div class="bilan-pied">
        ${se.groupeId ? `<a class="bouton" href="#/groupe/${se.groupeId}">Historique du groupe</a>` : ""}
        <span class="spacer"></span>
        <button type="button" class="primaire" data-act="valider">${se.bilan.fait ? "Mettre à jour le bilan" : "Enregistrer le bilan"}</button>
      </div>`;

    const etat = sec.querySelector("[data-etat]");
    const sauver = debounce(() => Store.seances.sauver(se), 500);

    sec.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.note) {
        const r = de(b.closest("li[data-bloc]").dataset.bloc);
        const n = Number(b.dataset.note);
        r.note = r.note === n ? null : n;
        b.parentElement.querySelectorAll("button").forEach((x) => x.classList.toggle("actif", Number(x.dataset.note) === r.note));
        sauver();
      } else if (b.dataset.etoile) {
        const n = Number(b.dataset.etoile);
        se.bilan.note = se.bilan.note === n ? null : n;
        b.parentElement.querySelectorAll("button").forEach((x) => x.classList.toggle("actif", se.bilan.note >= Number(x.dataset.etoile)));
        sauver();
      } else if (b.dataset.act === "valider") {
        se.bilan.fait = true;
        se.bilan.date = aujourdhuiIso();
        Store.seances.sauver(se);
        etat.textContent = `Enregistré le ${formaterDate(se.bilan.date)}`;
        b.textContent = "Mettre à jour le bilan";
        statut("Bilan enregistré : l'historique du groupe est à jour.", { duree: 4000 });
      }
    });

    sec.addEventListener("input", (e) => {
      const c = e.target;
      if (c.name === "commentaire") de(c.closest("li[data-bloc]").dataset.bloc).commentaire = c.value;
      else if (c.name === "fait") de(c.closest("li[data-bloc]").dataset.bloc).fait = c.checked;
      else if (c.name === "presents") se.bilan.presents = c.value === "" ? null : Number(c.value);
      else if (c.name === "retenir") se.bilan.retenir = c.value;
      else return;
      sauver();
    });

    return {
      detruire() {
        if (Store.seances.get(se.id)) Store.seances.sauver(se);
      },
    };
  },
};
