/* Séance — composer le déroulé : des blocs dans l'ordre, chacun avec
   sa durée, et la bibliothèque à côté pour piocher. La frise en haut
   du déroulé montre d'un coup d'œil où passe le temps de glace. */
import { Store, blocLibre, blocDepuisExercice } from "../core/store.js";
import { esc, debounce, statut, formaterDuree, heureA } from "../core/dom.js";
import { CATEGORIES } from "../data/catalogue.js";
import { chip, barreFiltres, filtrer, trier } from "./communs.js";

const filtre = { q: "", categorie: "" };

export const Seance = {
  afficher(main, id) {
    const se = Store.seances.get(id);
    const sec = document.createElement("section");
    sec.className = "ecran ecran-seance";
    main.replaceChildren(sec);
    if (!se) {
      sec.innerHTML = `<p class="vide">Cette séance n'existe pas (ou plus). <a href="#/seances">Retour aux séances.</a></p>`;
      return { detruire() {} };
    }

    sec.innerHTML = `
      <div class="entete">
        <a class="retour" href="#/seances">← Séances</a>
        <span class="etat" data-etat>Enregistré</span>
        <span class="spacer"></span>
        <a class="bouton" href="#/seance/${se.id}/imprimer">Imprimer</a>
        <button type="button" data-act="dupliquer">Dupliquer</button>
        <button type="button" class="danger" data-act="supprimer">Supprimer</button>
      </div>
      <input class="nom" name="titre" placeholder="Titre de la séance" value="${esc(se.titre)}" aria-label="Titre de la séance">
      <form class="seance-champs" autocomplete="off">
        <label>Date <input type="date" name="date" value="${esc(se.date)}"></label>
        <label>Heure <input type="time" name="heure" value="${esc(se.heure)}"></label>
        <label>Groupe <input name="groupe" value="${esc(se.groupe)}" placeholder="Adultes débutants"></label>
        <label>Lieu <input name="lieu" value="${esc(se.lieu)}" placeholder="Patinoire"></label>
        <label>Glace (min) <input type="number" name="duree_glace" min="5" max="240" value="${esc(se.duree_glace)}"></label>
        <label class="large">Objectif <input name="objectif" value="${esc(se.objectif)}" placeholder="Le fil rouge de la séance"></label>
      </form>
      <div class="seance-corps">
        <div class="deroule">
          <div class="deroule-entete">
            <h2>Déroulé</h2>
            <span class="total" data-total></span>
          </div>
          <div class="frise" data-frise aria-hidden="true"></div>
          <ol class="blocs" data-blocs></ol>
          <div class="ajouts">
            <button type="button" data-act="libre" data-titre="">+ Bloc libre</button>
            <button type="button" data-act="libre" data-titre="Pause eau" data-duree="2">+ Pause eau</button>
            <button type="button" data-act="libre" data-titre="Mot du coach" data-duree="3">+ Mot du coach</button>
          </div>
          <label class="notes">Notes <textarea name="notes" rows="4" placeholder="Matériel à sortir, joueurs à surveiller, ce qu'on refera…">${esc(se.notes)}</textarea></label>
        </div>
        <aside class="bibli">
          <h2>Bibliothèque</h2>
          <div data-bibli></div>
        </aside>
      </div>`;

    const etat = sec.querySelector("[data-etat]");
    const marquer = (t) => (etat.textContent = t);
    const sauver = debounce(() => {
      Store.seances.sauver(se);
      marquer("Enregistré");
    }, 400);
    const toucher = () => {
      marquer("Modification…");
      sauver();
    };

    const blocsEl = sec.querySelector("[data-blocs]");
    const friseEl = sec.querySelector("[data-frise]");
    const totalEl = sec.querySelector("[data-total]");
    const bibliEl = sec.querySelector("[data-bibli]");

    /* ── Le déroulé ─────────────────────────────────────────── */

    function exerciceDe(b) {
      return b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
    }

    function peindreTemps() {
      const total = Store.dureeSeance(se);
      const glace = Number(se.duree_glace) || 0;
      const depasse = total > glace;
      totalEl.textContent = `${formaterDuree(total)} sur ${formaterDuree(glace)}${depasse ? " — dépassement" : glace - total > 0 ? ` — reste ${formaterDuree(glace - total)}` : ""}`;
      totalEl.classList.toggle("alerte", depasse);
      const base = Math.max(total, glace) || 1;
      friseEl.innerHTML =
        se.blocs
          .map((b) => {
            const ex = exerciceDe(b);
            const c = ex ? (CATEGORIES[ex.categorie] || {}).couleur : "#8a97a3";
            return `<span style="width:${((Number(b.duree) || 0) / base) * 100}%;background:${c}" title="${esc(b.titre)} — ${b.duree} min"></span>`;
          })
          .join("") + (depasse ? `<i class="limite" style="left:${(glace / base) * 100}%"></i>` : "");
      let t = 0;
      blocsEl.querySelectorAll("li").forEach((li, i) => {
        const b = se.blocs[i];
        li.querySelector(".heure").textContent = heureA(se.heure, t);
        t += Number(b.duree) || 0;
      });
    }

    function peindreBlocs() {
      blocsEl.innerHTML = se.blocs.length
        ? se.blocs
            .map((b, i) => {
              const ex = exerciceDe(b);
              const titre = ex
                ? `<a href="#/exercice/${ex.id}">${esc(b.titre || ex.nom)}</a> ${chip(ex.categorie)}`
                : b.exerciceId
                  ? `<span>${esc(b.titre)}</span> <span class="chip" style="--c:#8a97a3">exercice supprimé</span>`
                  : `<input name="titre" value="${esc(b.titre)}" placeholder="Titre du bloc" aria-label="Titre du bloc">`;
              return `
                <li class="bloc" data-id="${b.id}">
                  <span class="heure"></span>
                  <div class="bloc-titre">${titre}</div>
                  <label class="duree"><input type="number" name="duree" min="1" max="120" value="${esc(b.duree)}" aria-label="Durée en minutes"> min</label>
                  <input class="note" name="note" value="${esc(b.note)}" placeholder="Consigne, variante, remarque…" aria-label="Note">
                  <div class="bloc-actions">
                    <button type="button" data-act="monter" title="Monter" ${i === 0 ? "disabled" : ""}>▲</button>
                    <button type="button" data-act="descendre" title="Descendre" ${i === se.blocs.length - 1 ? "disabled" : ""}>▼</button>
                    <button type="button" data-act="retirer" class="danger" title="Retirer de la séance">×</button>
                  </div>
                </li>`;
            })
            .join("")
        : `<li class="vide">Le déroulé est vide : ajoutez des exercices depuis la bibliothèque, ou un bloc libre.</li>`;
      peindreTemps();
    }

    blocsEl.addEventListener("input", (e) => {
      const li = e.target.closest("li[data-id]");
      if (!li) return;
      const b = se.blocs.find((x) => x.id === li.dataset.id);
      if (!b) return;
      const c = e.target;
      if (c.name === "duree") b.duree = Math.max(1, Number(c.value) || 1);
      else if (c.name === "note") b.note = c.value;
      else if (c.name === "titre") b.titre = c.value;
      peindreTemps();
      toucher();
    });

    blocsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      const li = e.target.closest("li[data-id]");
      if (!btn || !li) return;
      const i = se.blocs.findIndex((x) => x.id === li.dataset.id);
      if (i < 0) return;
      if (btn.dataset.act === "monter" && i > 0) {
        [se.blocs[i - 1], se.blocs[i]] = [se.blocs[i], se.blocs[i - 1]];
      } else if (btn.dataset.act === "descendre" && i < se.blocs.length - 1) {
        [se.blocs[i + 1], se.blocs[i]] = [se.blocs[i], se.blocs[i + 1]];
      } else if (btn.dataset.act === "retirer") {
        se.blocs.splice(i, 1);
      }
      peindreBlocs();
      toucher();
    });

    sec.querySelector(".ajouts").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-act='libre']");
      if (!b) return;
      se.blocs.push(blocLibre(b.dataset.titre || "", Number(b.dataset.duree) || 5));
      peindreBlocs();
      toucher();
      if (!b.dataset.titre) {
        const inp = blocsEl.querySelector("li:last-child input[name='titre']");
        inp && inp.focus();
      }
    });

    /* ── La bibliothèque ────────────────────────────────────── */

    function peindreBibli() {
      const liste = trier(filtrer(Store.exercices.tous(), filtre));
      bibliEl.innerHTML =
        barreFiltres(filtre) +
        (liste.length
          ? `<ul class="bibli-liste">${liste
              .map(
                (ex) => `
              <li>
                <div class="bibli-titre"><strong>${esc(ex.nom) || "<em>Sans nom</em>"}</strong><span class="meta">${chip(ex.categorie)} ${formaterDuree(ex.duree)}</span></div>
                <button type="button" data-ajouter="${ex.id}" title="Ajouter au déroulé">+</button>
              </li>`,
              )
              .join("")}</ul>`
          : `<p class="vide">Rien ne correspond.</p>`);
      const q = bibliEl.querySelector('input[name="q"]');
      if (filtre._focus && q) {
        q.focus();
        q.setSelectionRange(q.value.length, q.value.length);
      }
    }

    bibliEl.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.ajouter) {
        const ex = Store.exercices.get(b.dataset.ajouter);
        if (!ex) return;
        se.blocs.push(blocDepuisExercice(ex));
        peindreBlocs();
        toucher();
        statut(`« ${ex.nom} » ajouté au déroulé.`);
      } else if (b.dataset.cat !== undefined) {
        filtre.categorie = b.dataset.cat;
        filtre._focus = false;
        peindreBibli();
      }
    });
    bibliEl.addEventListener("input", (e) => {
      if (e.target.name === "q") {
        filtre.q = e.target.value;
        filtre._focus = true;
        peindreBibli();
      }
    });

    /* ── Les champs de tête ─────────────────────────────────── */

    sec.querySelector(".nom").addEventListener("input", (e) => {
      se.titre = e.target.value;
      toucher();
    });
    sec.querySelector(".seance-champs").addEventListener("input", (e) => {
      const c = e.target;
      if (!c.name) return;
      if (c.name === "duree_glace") se.duree_glace = Math.max(1, Number(c.value) || 1);
      else se[c.name] = c.value;
      if (c.name === "duree_glace" || c.name === "heure") peindreTemps();
      toucher();
    });
    sec.querySelector(".seance-champs").addEventListener("submit", (e) => e.preventDefault());
    sec.querySelector("textarea[name='notes']").addEventListener("input", (e) => {
      se.notes = e.target.value;
      toucher();
    });

    sec.querySelector(".entete").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "dupliquer") {
        Store.seances.sauver(se);
        const copie = Store.seances.dupliquer(se.id);
        statut("Séance dupliquée.");
        location.hash = `#/seance/${copie.id}`;
      } else if (b.dataset.act === "supprimer") {
        if (!confirm(`Supprimer « ${se.titre || "cette séance"} » ?`)) return;
        Store.seances.supprimer(se.id);
        statut("Séance supprimée.");
        location.hash = "#/seances";
      }
    });

    const off = Store.abonner((quoi) => {
      if (quoi === "exercices" || quoi === "tout") {
        peindreBibli();
        peindreBlocs();
      }
    });

    peindreBlocs();
    peindreBibli();

    return {
      detruire() {
        off();
        if (etat.textContent !== "Enregistré" && Store.seances.get(se.id)) Store.seances.sauver(se);
      },
    };
  },
};
