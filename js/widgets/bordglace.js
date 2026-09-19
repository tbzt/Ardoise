/* BordGlace — la séance une fois prête, vue depuis le banc : ce qu'il
   faut sortir, ce qu'il faut avoir en tête, et où on en est. Pensé pour
   un téléphone tenu d'une main, un gant dans l'autre : gros caractères,
   une colonne, l'essentiel d'abord, le reste replié.

   Si la séance a une heure et qu'on est le bon jour, le bloc en cours
   est mis en avant et le temps restant se met à jour tout seul. */
import { Store, bilanVierge } from "../core/store.js";
import { Storage } from "../core/storage.js";
import { esc, debounce, statut, formaterDate, formaterDuree, heureA } from "../core/dom.js";
import { chip, vignette, blocTechnique } from "./communs.js";
import { cumulMateriel, libelleMateriel } from "../core/materiel.js";
import { exporterPdf, exporterCarte } from "./communs.js";

function minutesDe(heure) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(heure || "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function aujourdhuiIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* Le matériel de tous les exercices, chiffré : par objet, le maximum
   demandé par un exercice (on ne sort les plots qu'une fois). */
function materielDe(se) {
  return cumulMateriel(
    se.blocs
      .map((b) => {
        const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
        return ex && ex.materiel ? { titre: b.titre || ex.nom, materiel: ex.materiel } : null;
      })
      .filter(Boolean),
  );
}

function bilanBloc(se, blocId) {
  return (se.bilan && se.bilan.blocs && se.bilan.blocs[blocId]) || {};
}

export const BordGlace = {
  afficher(main, id) {
    const se = Store.seances.get(id);
    const sec = document.createElement("section");
    sec.className = "ecran ecran-glace";
    main.replaceChildren(sec);
    if (!se) {
      sec.innerHTML = `<p class="vide">Cette séance n'existe pas. <a href="#/seances">Retour aux séances.</a></p>`;
      return { detruire() {} };
    }

    const cleCoches = `coches_${se.id}`;
    let coches = new Set(Storage.lire(cleCoches, []));
    const materiel = materielDe(se);
    const total = Store.dureeSeance(se);

    let t = 0;
    const lignes = se.blocs.map((b) => {
      const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
      const debut = t;
      t += Number(b.duree) || 0;
      return { b, ex, debut, fin: t };
    });

    sec.innerHTML = `
      <div class="entete no-print">
        <a class="retour" href="#/seance/${se.id}">← Préparer</a>
        <span class="spacer"></span>
        <a class="bouton" href="#/seance/${se.id}/imprimer">Feuille</a>
        <button type="button" data-act="carte" title="Une page à plier dans la poche">Carte de poche</button>
        <button type="button" data-act="pdf" title="La feuille complète en PDF">PDF</button>
      </div>
      <header class="glace-tete">
        <h1>${esc(se.titre) || "Séance"}</h1>
        <p class="meta">${[formaterDate(se.date), se.heure ? `${esc(se.heure)} → ${esc(heureA(se.heure, total))}` : "", se.groupe, se.lieu, `${formaterDuree(total)} sur ${formaterDuree(se.duree_glace)}`]
          .filter(Boolean)
          .map(esc)
          .join(" · ")}</p>
        ${se.objectif ? `<p class="glace-objectif">${esc(se.objectif)}</p>` : ""}
        <p class="glace-horloge" data-horloge hidden></p>
      </header>

      <section class="glace-panneau">
        <h2>À sortir</h2>
        ${
          materiel.length
            ? `<ul class="glace-materiel" data-materiel>${materiel
                .map(
                  (m, i) => `
              <li><label><input type="checkbox" data-coche="${i}" ${coches.has(String(i)) ? "checked" : ""}> <span><strong>${esc(libelleMateriel(m))}</strong><small>${esc(m.details.map((d) => (d.n !== null && m.n !== null && m.details.length > 1 ? `${d.titre} (${d.n})` : d.titre)).join(" · "))}</small></span></label></li>`,
                )
                .join("")}</ul>`
            : `<p class="glace-rien">Rien à sortir : les exercices choisis n'ont pas de matériel.</p>`
        }
        ${se.notes ? `<h2>À avoir en tête</h2><p class="glace-notes">${esc(se.notes).replace(/\n/g, "<br>")}</p>` : ""}
        <p class="glace-rappels">Feedback : 1 collectif, 3 individuels · le temps d'attente ne dépasse pas 30 % · une consigne d'une phrase pour lancer, puis on corrige en jouant.</p>
      </section>

      <ol class="glace-blocs">
        ${lignes
          .map(
            ({ b, ex, debut, fin }, i) => `
          <li class="glace-bloc ${ex ? "" : "glace-libre"}" data-debut="${debut}" data-fin="${fin}">
            <div class="glace-bloc-tete">
              <span class="glace-heure">${esc(heureA(se.heure, debut))}${se.heure ? ` → ${esc(heureA(se.heure, fin))}` : ""}</span>
              <span class="glace-duree">${b.duree} min</span>
              <span class="glace-badge" data-badge hidden></span>
            </div>
            <h2>${i + 1}. ${esc(b.titre || (ex && ex.nom) || "")} ${ex ? chip(ex.categorie) : ""}</h2>
            ${ex && ex.objectif ? `<p class="glace-bloc-objectif">${esc(ex.objectif)}</p>` : ""}
            ${ex && ex.points_cles && ex.points_cles.length ? `<ul class="glace-points">${ex.points_cles.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
            ${b.note ? `<p class="glace-note">${esc(b.note)}</p>` : ""}
            ${
              ex
                ? `${ex.corrections && ex.corrections.length ? `<ul class="glace-corrections">${ex.corrections.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}<details class="glace-details"><summary>Schéma et déroulé</summary>${vignette(ex.schema)}${ex.description ? `<p>${esc(ex.description).replace(/\n/g, "<br>")}</p>` : ""}${ex.materiel ? `<p class="glace-materiel-ex"><strong>Matériel :</strong> ${esc(ex.materiel)}</p>` : ""}${ex.variantes ? `<p class="glace-materiel-ex"><strong>Variantes :</strong> ${esc(ex.variantes)}</p>` : ""}${blocTechnique({ ...ex, corrections: [] })}</details>`
                : ""
            }
          </li>`,
          )
          .join("")}
      </ol>
      ${lignes.length ? "" : `<p class="vide">Le déroulé est vide. <a href="#/seance/${se.id}">Retour à la préparation.</a></p>`}

      <section class="glace-bilan" id="bilan">
        <h2>Bilan de la séance</h2>
        <p class="glace-bilan-aide">Deux minutes après la glace, ou le soir. C'est ce qui nourrit l'historique du groupe : ce qu'on refait, ce qu'on retravaille, ce qu'on laisse.</p>
        <ol class="bilan-blocs">
          ${lignes
            .map(
              ({ b, ex }, i) => `
            <li data-bloc="${b.id}">
              <div class="bilan-titre"><strong>${i + 1}. ${esc(b.titre || (ex && ex.nom) || "")}</strong>
                <label class="bilan-fait"><input type="checkbox" name="fait" ${bilanBloc(se, b.id).fait === false ? "" : "checked"}> fait</label>
              </div>
              <div class="bilan-notes" role="group" aria-label="Comment ça s'est passé">
                <button type="button" data-note="1" class="${bilanBloc(se, b.id).note === 1 ? "actif" : ""}">À revoir</button>
                <button type="button" data-note="2" class="${bilanBloc(se, b.id).note === 2 ? "actif" : ""}">Correct</button>
                <button type="button" data-note="3" class="${bilanBloc(se, b.id).note === 3 ? "actif" : ""}">Bien</button>
              </div>
              <input name="commentaire" value="${esc(bilanBloc(se, b.id).commentaire || "")}" placeholder="Un mot : trop long, à refaire avec palet, X a eu peur…">
            </li>`,
            )
            .join("")}
        </ol>
        <div class="bilan-global">
          <label>Présents <input type="number" name="presents" min="0" max="60" value="${esc(se.bilan && se.bilan.presents != null ? se.bilan.presents : "")}"></label>
          <div class="bilan-etoiles" role="group" aria-label="Note de la séance">
            <span>Séance</span>
            ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-etoile="${n}" class="${se.bilan && se.bilan.note >= n ? "actif" : ""}" aria-label="${n} sur 5">★</button>`).join("")}
          </div>
        </div>
        <label>À retenir pour la prochaine fois <textarea name="retenir" rows="3" placeholder="Ce qui a marché, ce qu'on refera, ce qu'on changera…">${esc((se.bilan && se.bilan.retenir) || "")}</textarea></label>
        <div class="bilan-pied">
          <span class="etat" data-etat-bilan>${se.bilan && se.bilan.fait ? `Bilan enregistré le ${esc(formaterDate(se.bilan.date))}` : "Pas encore de bilan"}</span>
          <span class="spacer"></span>
          ${se.groupeId ? `<a class="bouton" href="#/groupe/${se.groupeId}">Historique du groupe</a>` : ""}
          <button type="button" class="primaire" data-act="valider-bilan">${se.bilan && se.bilan.fait ? "Mettre à jour le bilan" : "Valider le bilan"}</button>
        </div>
      </section>`;

    /* ── Coches du matériel, mémorisées ────────────────────── */
    const materielEl = sec.querySelector("[data-materiel]");
    if (materielEl) {
      materielEl.addEventListener("change", (e) => {
        const c = e.target;
        if (c.dataset.coche === undefined) return;
        if (c.checked) coches.add(c.dataset.coche);
        else coches.delete(c.dataset.coche);
        Storage.ecrire(cleCoches, [...coches]);
      });
    }

    sec.querySelector("[data-act='pdf']").addEventListener("click", (e) => exporterPdf(se, e.currentTarget));
    sec.querySelector("[data-act='carte']").addEventListener("click", (e) => exporterCarte(se, e.currentTarget));

    /* ── Le bilan ──────────────────────────────────────────── */
    const bilanEl = sec.querySelector(".glace-bilan");
    const etatBilan = sec.querySelector("[data-etat-bilan]");
    if (!se.bilan) se.bilan = bilanVierge();
    const sauverBilan = debounce(() => Store.seances.sauver(se), 500);
    const blocDe = (el) => {
      const li = el.closest("li[data-bloc]");
      if (!li) return null;
      if (!se.bilan.blocs[li.dataset.bloc]) se.bilan.blocs[li.dataset.bloc] = { fait: true, note: null, commentaire: "" };
      return se.bilan.blocs[li.dataset.bloc];
    };
    bilanEl.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.note) {
        const r = blocDe(b);
        const n = Number(b.dataset.note);
        r.note = r.note === n ? null : n;
        b.parentElement.querySelectorAll("button").forEach((x) => x.classList.toggle("actif", Number(x.dataset.note) === r.note));
        sauverBilan();
      } else if (b.dataset.etoile) {
        const n = Number(b.dataset.etoile);
        se.bilan.note = se.bilan.note === n ? null : n;
        b.parentElement.querySelectorAll("button").forEach((x) => x.classList.toggle("actif", se.bilan.note >= Number(x.dataset.etoile)));
        sauverBilan();
      } else if (b.dataset.act === "valider-bilan") {
        se.bilan.fait = true;
        se.bilan.date = aujourdhuiIso();
        Store.seances.sauver(se);
        etatBilan.textContent = `Bilan enregistré le ${formaterDate(se.bilan.date)}`;
        b.textContent = "Mettre à jour le bilan";
        statut("Bilan enregistré : l'historique du groupe est à jour.");
      }
    });
    bilanEl.addEventListener("input", (e) => {
      const c = e.target;
      if (c.name === "commentaire") blocDe(c).commentaire = c.value;
      else if (c.name === "fait") blocDe(c).fait = c.checked;
      else if (c.name === "presents") se.bilan.presents = c.value === "" ? null : Number(c.value);
      else if (c.name === "retenir") se.bilan.retenir = c.value;
      else return;
      sauverBilan();
    });
    if (location.hash.endsWith("#bilan")) setTimeout(() => bilanEl.scrollIntoView({ behavior: "smooth" }), 50);

    /* ── L'horloge : quel bloc, combien de temps ───────────── */
    const horlogeEl = sec.querySelector("[data-horloge]");
    const depart = minutesDe(se.heure);
    const bonJour = se.date === aujourdhuiIso();
    let minuteur = null;

    function peindreHorloge() {
      if (depart === null || !bonJour) return;
      const now = new Date();
      const m = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      const ecoule = m - depart;
      let courant = null;
      let prochain = null;
      sec.querySelectorAll(".glace-bloc").forEach((li) => {
        const debut = Number(li.dataset.debut);
        const fin = Number(li.dataset.fin);
        const badge = li.querySelector("[data-badge]");
        li.classList.remove("en-cours", "passe");
        badge.hidden = true;
        if (ecoule >= debut && ecoule < fin) {
          courant = li;
          li.classList.add("en-cours");
          badge.textContent = `En cours · reste ${Math.max(1, Math.ceil(fin - ecoule))} min`;
          badge.hidden = false;
        } else if (ecoule >= fin) li.classList.add("passe");
        else if (!prochain) prochain = { li, debut };
      });
      horlogeEl.hidden = false;
      if (ecoule < 0) horlogeEl.textContent = `La glace commence dans ${Math.ceil(-ecoule)} min.`;
      else if (ecoule >= total) horlogeEl.textContent = "Séance terminée — bien joué.";
      else {
        horlogeEl.textContent = `${Math.floor(ecoule)} min écoulées, ${Math.ceil(total - ecoule)} min restantes.`;
        if (prochain && !courant) {
          const badge = prochain.li.querySelector("[data-badge]");
          badge.textContent = `Dans ${Math.ceil(prochain.debut - ecoule)} min`;
          badge.hidden = false;
        }
      }
    }
    peindreHorloge();
    if (depart !== null && bonJour) minuteur = setInterval(peindreHorloge, 15000);

    /* ── Écran qui reste allumé au bord de la glace ───────── */
    let verrou = null;
    if (navigator.wakeLock && navigator.wakeLock.request) {
      navigator.wakeLock
        .request("screen")
        .then((v) => (verrou = v))
        .catch(() => {});
    }

    return {
      detruire() {
        if (minuteur) clearInterval(minuteur);
        if (verrou) verrou.release().catch(() => {});
      },
    };
  },
};
