/* Entraîner — la séance depuis le banc, en plein écran.

   Ce n'est pas un écran de l'appli avec une barre de navigation : c'est
   un MODE. On y entre, on en sort. Debout, une main gantée, l'écran à
   bout de bras, trente secondes entre deux blocs, du bruit et du froid
   — et une seule question : « maintenant, je fais quoi, et il me reste
   combien ? »

   UN BLOC, UN ÉCRAN. L'ancien bord de glace empilait tout : la liste de
   matériel, les rappels, puis les neuf blocs à la suite. L'appli savait
   quel bloc était en cours — elle affichait « en cours · reste 10 min »
   — mais laissait le coach le chercher à une vingtaine de crans de
   défilement, derrière quatre blocs déjà passés. Ici le bloc courant
   est l'écran, entier, sans défiler.

   LE RAIL, ET LE RECALAGE. Une séance ne se déroule jamais à l'heure.
   Une interface qui ne sait afficher que « le bloc que le minuteur
   désigne » se trompe au bout de dix minutes, et le coach cesse de lui
   faire confiance. Le rail montre donc DEUX choses : le bloc qu'on
   regarde, et celui où l'horloge en est. Quand les deux divergent, une
   bande le dit et propose de se recaler — le coach reste maître de la
   position, l'horloge devient un conseil visible plutôt qu'une
   autorité. */

import { Store } from "../core/store.js";
import { Storage } from "../core/storage.js";
import { esc, statut, formaterDuree, heureA, aujourdhuiIso } from "../core/dom.js";
import { pastille, blocTechnique } from "./communs.js";
import { cumulMateriel, libelleMateriel } from "../core/materiel.js";
import { svg } from "./patinoire.js";

function minutesDe(heure) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(heure || "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/* Le matériel de tous les exercices, chiffré : par objet, le maximum
   demandé par un exercice — on ne sort les plots qu'une fois. */
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

export const Glace = {
  afficher(main, id) {
    const se = Store.seances.get(id);
    const sec = document.createElement("section");
    sec.className = "ecran ecran-glace";
    main.replaceChildren(sec);
    if (!se) {
      sec.innerHTML = `<p class="vide">Cette séance n'existe pas. <a href="#/seances">Retour aux séances.</a></p>`;
      return { detruire() {} };
    }
    if (!se.blocs.length) {
      sec.innerHTML = `<p class="vide">Le déroulé est vide : il n'y a rien à mener. <a href="#/seance/${se.id}">Le composer.</a></p>`;
      return { detruire() {} };
    }

    const cleCoches = `coches_${se.id}`;
    let coches = new Set(Storage.lire(cleCoches, []));
    const materiel = materielDe(se);
    const total = Store.dureeSeance(se);
    const depart = minutesDe(se.heure);
    const bonJour = se.date === aujourdhuiIso();
    const horloge = depart !== null && bonJour;

    let t = 0;
    const lignes = se.blocs.map((b) => {
      const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
      const debut = t;
      t += Number(b.duree) || 0;
      return { b, ex, debut, fin: t };
    });

    /* Avant la glace, on coche le matériel au vestiaire ; une fois
       commencé, on mène. L'écran d'accueil du mode suit donc l'heure. */
    let vue = horloge && ecoule() >= 0 ? "bloc" : "avant";
    let courant = Math.max(0, indexHorloge());

    function ecoule() {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 - depart;
    }
    function indexHorloge() {
      if (!horloge) return 0;
      const e = ecoule();
      const i = lignes.findIndex((l) => e >= l.debut && e < l.fin);
      return i >= 0 ? i : e >= total ? lignes.length - 1 : 0;
    }

    sec.innerHTML = `
      <div class="glace-barre">
        <a class="glace-sortir" href="#/seance/${se.id}" aria-label="Quitter le mode">✕</a>
        <button type="button" class="glace-rang" data-act="ensemble"><span data-rang></span></button>
        <span class="spacer"></span>
        <details class="menu">
          <summary class="bouton" aria-label="Menu" title="Menu">⋯</summary>
          <div class="menu-liste">
            <button type="button" data-act="avant">Matériel <span data-coches></span></button>
            ${se.notes ? `<button type="button" data-act="notes">Notes de la séance</button>` : ""}
            <button type="button" data-act="ensemble">Vue d'ensemble</button>
            <hr />
            <a href="#/seance/${se.id}/bilan">Faire le bilan</a>
            <a href="#/seance/${se.id}">Quitter le mode</a>
          </div>
        </details>
      </div>
      <div class="glace-rail" data-rail></div>
      <div class="glace-recalage" data-recalage hidden></div>
      <div class="glace-vue" data-vue></div>`;

    const railEl = sec.querySelector("[data-rail]");
    const vueEl = sec.querySelector("[data-vue]");
    const recalageEl = sec.querySelector("[data-recalage]");

    /* ── Le rail ─────────────────────────────────────────────── */

    function peindreRail() {
      const h = horloge ? indexHorloge() : -1;
      railEl.innerHTML = lignes
        .map(
          (l, i) =>
            `<button type="button" data-aller="${i}" class="${i === courant ? "vise" : ""} ${horloge && i === h ? "horloge" : ""} ${horloge && ecoule() >= l.fin ? "passe" : ""}" title="${esc(l.b.titre || "")}">${i + 1}</button>`,
        )
        .join("");
      sec.querySelector("[data-rang]").textContent = `${courant + 1} / ${lignes.length}`;
      const n = materiel.length;
      const el = sec.querySelector("[data-coches]");
      if (el) el.textContent = n ? `${[...coches].length} / ${n}` : "";
    }

    /* La bande de recalage : elle n'apparaît que lorsque le bloc qu'on
       regarde et celui où l'horloge en est ne sont plus le même. */
    function peindreRecalage() {
      if (!horloge || vue !== "bloc") {
        recalageEl.hidden = true;
        return;
      }
      const h = indexHorloge();
      const e = ecoule();
      if (h === courant || e < 0 || e >= total) {
        recalageEl.hidden = true;
        return;
      }
      recalageEl.innerHTML = `<span>⟳ L'horloge en est au bloc ${h + 1} — ${esc(lignes[h].b.titre || "")}</span><button type="button" data-aller="${h}">Me recaler</button>`;
      recalageEl.hidden = false;
    }

    /* ── Le bloc courant ─────────────────────────────────────── */

    function peindreBloc() {
      const { b, ex, debut, fin } = lignes[courant];
      const suivant = lignes[courant + 1];
      vueEl.innerHTML = `
        <article class="glace-carte">
          <p class="glace-horaire">
            <span>${esc(heureA(se.heure, debut))}${se.heure ? ` → ${esc(heureA(se.heure, fin))}` : ""}</span>
            <span class="glace-duree">${b.duree} min</span>
          </p>
          <p class="glace-reste" data-reste hidden></p>
          <h1>${courant + 1}. ${esc(b.titre || (ex && ex.nom) || "")}</h1>
          ${ex ? `<p class="glace-cat">${pastille(ex.categorie)}</p>` : ""}
          ${ex && ex.objectif ? `<p class="glace-objectif">${esc(ex.objectif)}</p>` : ""}
          ${ex && ex.points_cles && ex.points_cles.length ? `<ul class="glace-points">${ex.points_cles.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
          ${ex ? `<button type="button" class="glace-schema" data-act="schema"><span class="vignette vignette-${ex.schema && ex.schema.vue === "moitie" ? "moitie" : "entiere"}">${svg(ex.schema)}</span><span class="glace-agrandir">⤢ plein écran</span></button>` : ""}
          ${ex && ex.corrections && ex.corrections.length ? `<details class="glace-corr"><summary>Corrections <small>${ex.corrections.length}</small></summary><ul>${ex.corrections.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></details>` : ""}
          ${ex ? blocTechnique({ ...ex, corrections: [] }) : ""}
          ${b.note ? `<p class="glace-manote">${esc(b.note)}</p>` : ""}
        </article>
        <nav class="glace-suite">
          ${courant > 0 ? `<button type="button" data-aller="${courant - 1}" class="glace-prec">◀ ${courant}. ${esc(lignes[courant - 1].b.titre || "")}</button>` : `<span></span>`}
          ${
            suivant
              ? `<button type="button" data-aller="${courant + 1}" class="glace-suiv"><small>suivant</small> ${courant + 2}. ${esc(suivant.b.titre || "")} · ${suivant.b.duree} min ▶</button>`
              : `<a class="bouton primaire glace-suiv" href="#/seance/${se.id}/bilan">Séance terminée — faire le bilan →</a>`
          }
        </nav>`;
      peindreReste();
    }

    /* Le temps restant est épinglé dans la carte, pas en tête de page :
       en haut, il disparaissait au premier défilement. */
    function peindreReste() {
      const el = vueEl.querySelector("[data-reste]");
      if (!el) return;
      if (!horloge) {
        el.hidden = true;
        return;
      }
      const e = ecoule();
      const { debut, fin } = lignes[courant];
      if (e < debut) el.textContent = `commence dans ${Math.ceil(debut - e)} min`;
      else if (e >= fin) el.textContent = `passé de ${Math.floor(e - fin)} min`;
      else el.textContent = `reste ${Math.max(1, Math.ceil(fin - e))} min`;
      el.classList.toggle("urgent", e >= debut && e < fin && fin - e <= 1);
      el.classList.toggle("depasse", e >= fin);
      el.hidden = false;
    }

    /* ── Avant la glace, et la vue d'ensemble ────────────────── */

    function peindreAvant() {
      vueEl.innerHTML = `
        <article class="glace-carte glace-avant">
          <h1>${esc(se.titre) || "Séance"}</h1>
          <p class="glace-objectif">${[se.date, se.heure, se.groupe, se.lieu, `${formaterDuree(total)} de glace`].filter(Boolean).map(esc).join(" · ")}</p>
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
        </article>
        <nav class="glace-suite">
          <span></span>
          <button type="button" class="bouton primaire glace-suiv" data-act="commencer">Entrer dans la séance ▶</button>
        </nav>`;
    }

    function peindreEnsemble() {
      const h = horloge ? indexHorloge() : -1;
      vueEl.innerHTML = `
        <article class="glace-carte glace-ensemble">
          <h1>${esc(se.titre) || "Séance"} <small>${formaterDuree(total)}</small></h1>
          <ol class="glace-liste">
            ${lignes
              .map(
                (l, i) => `
              <li class="${i === h ? "en-cours" : ""} ${horloge && ecoule() >= l.fin ? "passe" : ""}">
                <button type="button" data-aller="${i}">
                  <span class="glace-heure">${esc(heureA(se.heure, l.debut))}</span>
                  <span class="glace-nom">${i + 1}. ${esc(l.b.titre || "")}</span>
                  <span class="glace-duree">${l.b.duree}′</span>
                </button>
              </li>`,
              )
              .join("")}
          </ol>
        </article>
        <nav class="glace-suite">
          <span></span>
          <a class="bouton primaire glace-suiv" href="#/seance/${se.id}/bilan">Terminer la séance →</a>
        </nav>`;
    }

    function peindre() {
      if (vue === "avant") peindreAvant();
      else if (vue === "ensemble") peindreEnsemble();
      else peindreBloc();
      peindreRail();
      peindreRecalage();
    }

    /* ── Les gestes ──────────────────────────────────────────── */

    function aller(i) {
      courant = Math.max(0, Math.min(lignes.length - 1, i));
      vue = "bloc";
      peindre();
    }

    sec.addEventListener("click", (e) => {
      const b = e.target.closest("button, a");
      if (!b) return;
      const menu = b.closest("details.menu");
      if (menu) menu.open = false;
      if (b.dataset.aller !== undefined) aller(Number(b.dataset.aller));
      else if (b.dataset.act === "avant") {
        vue = "avant";
        peindre();
      } else if (b.dataset.act === "ensemble") {
        vue = vue === "ensemble" ? "bloc" : "ensemble";
        peindre();
      } else if (b.dataset.act === "commencer") aller(horloge ? indexHorloge() : 0);
      else if (b.dataset.act === "notes") {
        vue = "avant";
        peindre();
      } else if (b.dataset.act === "schema") {
        const ex = lignes[courant].ex;
        if (ex) pleinEcran(ex);
      }
    });

    sec.addEventListener("change", (e) => {
      const c = e.target;
      if (c.dataset.coche === undefined) return;
      if (c.checked) coches.add(c.dataset.coche);
      else coches.delete(c.dataset.coche);
      Storage.ecrire(cleCoches, [...coches]);
      peindreRail();
    });

    /* Balayage : le geste le plus naturel avec un gant. Seuil large et
       pente franche, pour ne pas déclencher sur un défilement. */
    let depart2 = null;
    vueEl.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a, input, details")) return;
      depart2 = { x: e.clientX, y: e.clientY };
    });
    vueEl.addEventListener("pointerup", (e) => {
      if (!depart2 || vue !== "bloc") return (depart2 = null);
      const dx = e.clientX - depart2.x;
      const dy = e.clientY - depart2.y;
      depart2 = null;
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      aller(courant + (dx < 0 ? 1 : -1));
    });

    const clavier = (e) => {
      if (e.target.matches("input, textarea")) return;
      if (e.key === "ArrowRight") aller(courant + 1);
      else if (e.key === "ArrowLeft") aller(courant - 1);
      else if (e.key === "Escape") (location.hash = `#/seance/${se.id}`);
    };
    document.addEventListener("keydown", clavier);

    /* ── L'horloge, et l'écran qui reste allumé ──────────────── */

    const minuteur = horloge
      ? setInterval(() => {
          peindreReste();
          peindreRail();
          peindreRecalage();
        }, 15000)
      : null;

    let verrou = null;
    if (navigator.wakeLock && navigator.wakeLock.request) {
      navigator.wakeLock
        .request("screen")
        .then((v) => (verrou = v))
        .catch(() => {});
    }

    peindre();

    return {
      detruire() {
        if (minuteur) clearInterval(minuteur);
        document.removeEventListener("keydown", clavier);
        if (verrou) verrou.release().catch(() => {});
      },
    };
  },
};

/* Le schéma en grand : c'est la même image, en plus gros. En portrait
   sur un téléphone, une patinoire entière tient sur un tiers de la
   hauteur — on invite à tourner l'appareil plutôt que de plisser. */
function pleinEcran(ex) {
  const d = document.createElement("dialog");
  d.className = "dialogue dialogue-schema";
  d.innerHTML = `
    <form method="dialog">
      <div class="schema-tete"><strong>${esc(ex.nom)}</strong><button type="submit" value="" aria-label="Fermer">✕</button></div>
      <div class="schema-grand">${svg(ex.schema)}</div>
      ${ex.points_cles && ex.points_cles.length ? `<ul class="glace-points">${ex.points_cles.slice(0, 3).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
    </form>`;
  d.addEventListener("close", () => d.remove());
  document.body.appendChild(d);
  d.showModal();
}

export { materielDe };
