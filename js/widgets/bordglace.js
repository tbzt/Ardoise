/* BordGlace — la séance une fois prête, vue depuis le banc : ce qu'il
   faut sortir, ce qu'il faut avoir en tête, et où on en est. Pensé pour
   un téléphone tenu d'une main, un gant dans l'autre : gros caractères,
   une colonne, l'essentiel d'abord, le reste replié.

   Si la séance a une heure et qu'on est le bon jour, le bloc en cours
   est mis en avant et le temps restant se met à jour tout seul. */
import { Store } from "../core/store.js";
import { Storage } from "../core/storage.js";
import { esc, formaterDate, formaterDuree, heureA } from "../core/dom.js";
import { chip, vignette } from "./communs.js";
import { exporterPdf } from "./communs.js";

function minutesDe(heure) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(heure || "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function aujourdhuiIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* Le matériel de tous les exercices, dédoublonné, avec qui en a besoin. */
function materielDe(se) {
  const carte = new Map();
  for (const b of se.blocs) {
    const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
    if (!ex || !ex.materiel) continue;
    const brut = ex.materiel.trim().replace(/[.\s]+$/, "");
    if (!brut || /^aucun/i.test(brut)) continue;
    const cle = brut.toLowerCase();
    if (!carte.has(cle)) carte.set(cle, { texte: brut, exercices: [] });
    carte.get(cle).exercices.push(b.titre || ex.nom);
  }
  return [...carte.values()];
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
        <button type="button" data-act="pdf">PDF</button>
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
              <li><label><input type="checkbox" data-coche="${i}" ${coches.has(String(i)) ? "checked" : ""}> <span><strong>${esc(m.texte)}</strong><small>${esc(m.exercices.join(" · "))}</small></span></label></li>`,
                )
                .join("")}</ul>`
            : `<p class="glace-rien">Rien à sortir : les exercices choisis n'ont pas de matériel.</p>`
        }
        ${se.notes ? `<h2>À avoir en tête</h2><p class="glace-notes">${esc(se.notes).replace(/\n/g, "<br>")}</p>` : ""}
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
                ? `<details class="glace-details"><summary>Schéma et déroulé</summary>${vignette(ex.schema)}${ex.description ? `<p>${esc(ex.description).replace(/\n/g, "<br>")}</p>` : ""}${ex.materiel ? `<p class="glace-materiel-ex"><strong>Matériel :</strong> ${esc(ex.materiel)}</p>` : ""}${ex.variantes ? `<p class="glace-materiel-ex"><strong>Variantes :</strong> ${esc(ex.variantes)}</p>` : ""}</details>`
                : ""
            }
          </li>`,
          )
          .join("")}
      </ol>
      ${lignes.length ? "" : `<p class="vide">Le déroulé est vide. <a href="#/seance/${se.id}">Retour à la préparation.</a></p>`}`;

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
