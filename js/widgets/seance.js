/* Séance — composer le déroulé : des blocs dans l'ordre, chacun avec
   sa durée, et la bibliothèque à côté pour piocher. La frise en haut
   du déroulé montre d'un coup d'œil où passe le temps de glace. */
import { Store, blocLibre, blocDepuisExercice, GLACE_PAR_DEFAUT } from "../core/store.js";
import { esc, debounce, statut, formaterDuree, heureA, formaterDate, aujourdhuiIso } from "../core/dom.js";
import { CATEGORIES } from "../data/catalogue.js";
import { pastille, mention, vignette, codesTechniques, barreFiltres, filtrer, trier, exporterPdf, exporterCarte, exporterFicheAtelier } from "./communs.js";
import { svg } from "./patinoire.js";
import { seancesDuGroupe, seancesFaites, usageExercices, recouvrement, aRevoir, libelleUsage, formaterCourt, estFaite, cycleCourant } from "../core/analyse.js";
import { apercu, choisir } from "./dialogue.js";
import { proposerDeroule } from "../core/brouillon.js";

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
        <span class="spacer"></span>
        <span class="etat" data-etat>Enregistré</span>
        ${actionPrincipale(se)}
        <details class="menu">
          <summary class="bouton" title="Imprimer, télécharger">Exporter ▾</summary>
          <div class="menu-liste">
            <a href="#/seance/${se.id}/imprimer">Imprimer la feuille…</a>
            <button type="button" data-act="pdf" title="Le plan et chaque exercice avec son schéma">Feuille de séance (PDF)</button>
            <button type="button" data-act="carte" title="Une page, gros caractères, sans schéma : à plier dans la poche">Carte de poche (PDF)</button>
          </div>
        </details>
        <details class="menu">
          <summary class="bouton" aria-label="Autres actions" title="Autres actions">⋯</summary>
          <div class="menu-liste">
            <a href="#/seance/${se.id}/bilan">${se.bilan && se.bilan.fait ? "Modifier le bilan" : "Faire le bilan"}</a>
            <button type="button" data-act="dupliquer">Dupliquer</button>
            <button type="button" data-act="vers-groupe" title="Copier cette séance dans un groupe, ou la déplacer">Vers un groupe…</button>
            <hr />
            <button type="button" class="danger" data-act="supprimer">Supprimer la séance</button>
          </div>
        </details>
      </div>
      <nav class="moments" aria-label="Les trois moments de la séance">
        <span class="actif" aria-current="step">1 · Préparer</span>
        <a href="#/seance/${se.id}/glace">2 · Bord de glace</a>
        <a href="#/seance/${se.id}/bilan">3 · Bilan${se.bilan && se.bilan.fait ? " ✓" : ""}</a>
      </nav>

      <input class="titre-champ" name="titre" placeholder="Titre de la séance" value="${esc(se.titre)}" aria-label="Titre de la séance">

      <!-- Les six champs administratifs se remplissent une fois et
           occupaient tout le premier écran, devant le déroulé, qui est
           le travail. Ils tiennent en une ligne, qu'on déplie. -->
      <details class="seance-reglages" data-reglages ${se.date && se.heure ? "" : "open"}>
        <summary><span data-resume></span><span class="crayon">✎</span></summary>
        <form class="seance-champs" autocomplete="off">
          <label>Date <input type="date" name="date" value="${esc(se.date)}"></label>
          <label>Heure <input type="time" name="heure" value="${esc(se.heure)}"></label>
          <label>Groupe <select name="groupeId" data-groupe>${optionsGroupes(se)}</select></label>
          <label>Lieu <input name="lieu" value="${esc(se.lieu)}" placeholder="Patinoire"></label>
          <label>Glace (min) <input type="number" name="duree_glace" min="5" max="240" value="${esc(se.duree_glace)}"></label>
        </form>
      </details>
      <label class="objectif-champ">Fil rouge <input name="objectif" value="${esc(se.objectif)}" placeholder="Le fil rouge de la séance"></label>

      <div class="contexte" data-contexte hidden></div>
      <div class="etabli">
        <div class="deroule">
          <div class="deroule-entete">
            <h2>Déroulé</h2>
            <span class="spacer"></span>
            <span class="total" data-total></span>
          </div>
          <!-- La frise dit les PROPORTIONS et la limite de glace ; le
               trait de couleur en marge d'un bloc dit la SUITE des
               catégories. Les deux ne font pas le même métier, et on a
               besoin des deux. La légende chiffre ce que la barre
               montre : « où passe le temps » devient une réponse, et
               plus une impression. -->
          <div class="frise-boite">
            <div class="frise" data-frise aria-hidden="true"></div>
            <i class="limite" data-limite hidden aria-hidden="true"></i>
            <p class="frise-legende" data-frise-legende></p>
          </div>
          <div class="explication" data-explication hidden></div>
          <ol class="blocs" data-blocs></ol>
          <div class="ajouts">
            <button type="button" class="proposer" data-act="proposer" title="Un déroulé complet, calé sur le temps de glace et l'historique du groupe, à retoucher">✦ Proposer un déroulé</button>
            <button type="button" data-act="libre" data-titre="">+ Bloc libre</button>
            <button type="button" data-act="libre" data-titre="Pause eau" data-duree="2">+ Pause eau</button>
            <button type="button" data-act="libre" data-titre="Mot du coach" data-duree="3">+ Mot du coach</button>
          </div>
          <label class="notes">Notes <textarea name="notes" rows="4" placeholder="Matériel à sortir, joueurs à surveiller, ce qu'on refera…">${esc(se.notes)}</textarea></label>
        </div>
        <!-- La colonne reste, et elle reste à demeure : une recherche
             au point d'insertion ne permet de choisir que ce qu'on
             sait déjà nommer, et un coach qui prépare cherche
             justement ce à quoi il n'a pas pensé. Parcourir n'est pas
             chercher. Sous 980 px elle ne tombe plus SOUS le déroulé,
             hors de portée : elle devient un panneau qu'on appelle. -->
        <details class="bibli" data-panneau>
          <summary>
            <span class="bibli-nom">Bibliothèque</span>
            <span class="ou" data-ou></span>
            <span class="fleche" aria-hidden="true">▾</span>
          </summary>
          <div data-bibli></div>
        </details>
      </div>`;

    const etat = sec.querySelector("[data-etat]");
    const marquer = (t) => {
      etat.textContent = t;
      etat.classList.toggle("touche", t !== "Enregistré");
    };
    const sauver = debounce(() => {
      Store.seances.sauver(se);
      marquer("Enregistré");
    }, 400);
    const toucher = () => {
      marquer("Modification…");
      sauver();
    };

    /* Le « + » de la bibliothèque ajoutait toujours à la fin : pour
       glisser un exercice au milieu, il fallait l'ajouter puis le faire
       remonter à coups de flèche. On pose un point d'insertion entre
       deux blocs, et tout ce qu'on ajoute y va. */
    let insertion = null;

    const blocsEl = sec.querySelector("[data-blocs]");
    const friseEl = sec.querySelector("[data-frise]");
    const limiteEl = sec.querySelector("[data-limite]");
    const legendeEl = sec.querySelector("[data-frise-legende]");
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
      totalEl.innerHTML = `<b>${esc(formaterDuree(total))}</b> sur ${esc(formaterDuree(glace))}${depasse ? " — dépassement" : glace - total > 0 ? ` — reste ${esc(formaterDuree(glace - total))}` : " — le compte est juste"}`;
      totalEl.classList.toggle("alerte", depasse);
      const base = Math.max(total, glace) || 1;
      friseEl.innerHTML = se.blocs
        .map((b) => {
          const ex = exerciceDe(b);
          const c = ex ? (CATEGORIES[ex.categorie] || {}).couleur : "#8a97a3";
          return `<i style="width:${((Number(b.duree) || 0) / base) * 100}%;background:${c}" title="${esc(b.titre)} — ${b.duree} min"></i>`;
        })
        .join("");
      limiteEl.hidden = !depasse;
      if (depasse) limiteEl.style.left = `${(glace / base) * 100}%`;

      /* Ce que la barre montre, chiffré : combien de minutes sont
         parties dans quoi. C'est la question qu'un coach se pose en
         relisant son déroulé, et la barre seule n'y répond pas. */
      const parCat = new Map();
      for (const b of se.blocs) {
        const ex = exerciceDe(b);
        const cle = ex ? ex.categorie : "libre";
        parCat.set(cle, (parCat.get(cle) || 0) + (Number(b.duree) || 0));
      }
      legendeEl.innerHTML = [...parCat]
        .sort((a, b) => b[1] - a[1])
        .map(([cle, min]) =>
          cle === "libre"
            ? `<span class="pastille" style="--c:#8a97a3">libre ${esc(formaterDuree(min))}</span>`
            : `<span class="pastille" style="--c:${(CATEGORIES[cle] || {}).couleur || "#888"}">${esc((CATEGORIES[cle] || {}).libelle || cle)} ${esc(formaterDuree(min))}</span>`,
        )
        .join("");

      let t = 0;
      // seules les rangées de bloc portent une heure — pas le message
      // « le déroulé est vide », qui est aussi un <li>
      blocsEl.querySelectorAll("li[data-id]").forEach((li) => {
        const b = se.blocs.find((x) => x.id === li.dataset.id);
        if (!b) return;
        li.querySelector(".heure").textContent = heureA(se.heure, t);
        t += Number(b.duree) || 0;
      });
    }

    /* Les blocs dépliés. Vérifier un exercice ne doit pas coûter
       l'écran : aujourd'hui il faut ouvrir la fiche — et perdre le
       déroulé, la frise et la colonne — ou passer par l'aperçu de la
       bibliothèque, qui ne parle que de ce qui n'est pas encore
       ajouté. Ici le bloc s'ouvre sur place. */
    const ouverts = new Set();

    function apercuBloc(b, ex) {
      const codes = codesTechniques(ex);
      const points = ex.points_cles || [];
      return `
        <li class="bloc-apercu" data-apercu-de="${b.id}" style="--c:${(CATEGORIES[ex.categorie] || {}).couleur || "#888"}">
          <div class="vue">${svg(ex.schema, { classe: "mini" })}</div>
          <div class="dit">
            ${ex.objectif ? `<p class="mini-titre">Objectif</p><p class="apercu-objectif">${esc(ex.objectif)}</p>` : ""}
            ${points.length ? `<p class="mini-titre">Points clés</p><ul>${points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
            ${ex.materiel ? `<p class="mini-titre">Matériel</p><p>${esc(ex.materiel).replace(/\n/g, " · ")}</p>` : ""}
            ${codes.length ? `<p class="mini-titre">Fiches techniques</p><p>${codes.map((fi) => esc(fi.nom)).join(" · ")}</p>` : ""}
            <p class="liens">
              <a class="lien" href="#/exercice/${ex.id}">Ouvrir la fiche</a>
              <button type="button" class="lien" data-act="atelier">Fiche atelier (PDF)</button>
            </p>
          </div>
        </li>`;
    }

    /* UNE LIGNE DE DOCUMENT, PAS UNE RANGÉE DE TABLEUR.
       C'était une grille de six colonnes — poignée, heure, titre,
       [durée] min, note, quatre boutons — et chaque rangée portait
       fond, bordure et rayon : neuf boîtes empilées pour ce qui est
       un déroulé, c'est-à-dire un document avec un axe de temps.
       L'heure passe en marge, en chasse fixe ; le titre est du corps
       de texte ; la note se pose dessous et ne montre son champ qu'au
       toucher ; la couleur de catégorie devient un trait de marge. */
    function peindreBlocs() {
      blocsEl.innerHTML = se.blocs.length
        ? se.blocs
            .map((b, i) => {
              const ex = exerciceDe(b);
              const c = ex ? (CATEGORIES[ex.categorie] || {}).couleur || "#888" : "var(--rule)";
              const ouvert = ex && ouverts.has(b.id);
              const titre = ex
                ? `<a href="#/exercice/${ex.id}">${esc(b.titre || ex.nom)}</a>`
                : b.exerciceId
                  ? `<span>${esc(b.titre)}</span> ${mention("exercice supprimé", "alerte")}`
                  : `<input class="titre-libre" name="titre" value="${esc(b.titre)}" placeholder="Titre du bloc" aria-label="Titre du bloc">`;
              return `
                <li class="bloc ${b.exerciceId ? "" : "bloc-libre"}" data-id="${b.id}" style="--c:${c}">
                  <button type="button" class="poignee" data-poignee title="Glisser pour déplacer" aria-label="Déplacer ce bloc">⋮⋮</button>
                  <span class="heure"></span>
                  <div class="bloc-titre">
                    ${titre}
                    <input class="note" name="note" value="${esc(b.note)}" placeholder="Ajouter une consigne, une variante…" aria-label="Note du bloc">
                  </div>
                  <label class="duree"><input type="number" name="duree" min="1" max="120" value="${esc(b.duree)}" aria-label="Durée en minutes"><span>min</span></label>
                  <div class="bloc-actions">
                    ${ex ? `<button type="button" class="voir" data-act="voir" aria-expanded="${ouvert}" title="Le schéma et les points clés, sans quitter le déroulé">${ouvert ? "▾" : "▸"} Voir</button>` : ""}
                    ${ex ? `<button type="button" data-act="atelier" title="Fiche atelier (PDF) pour celui qui tient l'atelier, avec la note de ce bloc">Fiche</button>` : ""}
                    <button type="button" data-act="monter" title="Monter" aria-label="Monter" ${i === 0 ? "disabled" : ""}>↑</button>
                    <button type="button" data-act="descendre" title="Descendre" aria-label="Descendre" ${i === se.blocs.length - 1 ? "disabled" : ""}>↓</button>
                    <button type="button" data-act="retirer" class="danger" title="Retirer de la séance" aria-label="Retirer">×</button>
                  </div>
                </li>
                ${ouvert ? apercuBloc(b, ex) : ""}
                <li class="entre ${insertion === i + 1 ? "vise" : ""}"><button type="button" data-inserer="${i + 1}" title="Insérer ici ce qu'on ajoutera">${insertion === i + 1 ? "on insère ici — cliquer pour annuler" : "insérer ici"}</button></li>`;
            })
            .join("")
        : `<li class="vide">Le déroulé est vide : piochez dans la bibliothèque, ajoutez un bloc libre, ou faites-vous proposer un déroulé complet.</li>`;
      peindreTemps();
      peindreContexte();
      peindreActionPrincipale();
      peindreOu();
    }

    /* Le bouton primaire dépend de l'état de la séance : il change quand
       le déroulé se remplit ou quand le bilan se fait. */
    function peindreActionPrincipale() {
      const actuel = sec.querySelector(".entete .primaire");
      const html = actionPrincipale(se);
      if (!actuel || actuel.outerHTML === html) return;
      actuel.outerHTML = html;
    }

    /* Glisser-déposer : on attrape la poignée, la rangée suit le
       pointeur en se réinsérant dans la liste au fil du mouvement, et
       l'ordre du DOM devient l'ordre des blocs au relâcher. Les
       événements pointeur couvrent la souris, le doigt et le stylet ;
       les flèches ▲▼ restent pour le clavier. */
    blocsEl.addEventListener("pointerdown", (e) => {
      const poignee = e.target.closest("[data-poignee]");
      const li = poignee && poignee.closest("li[data-id]");
      if (!li) return;
      e.preventDefault();
      try {
        poignee.setPointerCapture(e.pointerId);
      } catch (err) {
        /* sans capture, les écouteurs sur le document suffisent */
      }
      li.classList.add("en-glisse");
      const deplacer = (ev) => {
        const sous = document.elementFromPoint(ev.clientX, ev.clientY);
        const autre = sous && sous.closest("li[data-id]");
        if (!autre || autre === li || autre.parentElement !== blocsEl) return;
        const r = autre.getBoundingClientRect();
        if (ev.clientY < r.top + r.height / 2) blocsEl.insertBefore(li, autre);
        else blocsEl.insertBefore(li, autre.nextSibling);
      };
      const finir = () => {
        document.removeEventListener("pointermove", deplacer);
        document.removeEventListener("pointerup", finir);
        document.removeEventListener("pointercancel", finir);
        li.classList.remove("en-glisse");
        const ordre = [...blocsEl.querySelectorAll("li[data-id]")].map((x) => x.dataset.id);
        insertion = null;
        const avant = se.blocs.map((b) => b.id).join();
        se.blocs.sort((a, b) => ordre.indexOf(a.id) - ordre.indexOf(b.id));
        if (se.blocs.map((b) => b.id).join() !== avant) {
          peindreBlocs();
          toucher();
        } else peindreTemps();
      };
      document.addEventListener("pointermove", deplacer);
      document.addEventListener("pointerup", finir);
      document.addEventListener("pointercancel", finir);
    });

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
      const marque = e.target.closest("button[data-inserer]");
      if (marque) {
        const i = Number(marque.dataset.inserer);
        insertion = insertion === i ? null : i;
        peindreBlocs();
        return;
      }
      const btn = e.target.closest("button[data-act]");
      const li = e.target.closest("li[data-id], li[data-apercu-de]");
      if (!btn || !li) return;
      const id = li.dataset.id || li.dataset.apercuDe;
      const i = se.blocs.findIndex((x) => x.id === id);
      if (i < 0) return;
      if (btn.dataset.act === "voir") {
        // déplier ne touche pas la séance : rien à enregistrer
        if (ouverts.has(id)) ouverts.delete(id);
        else ouverts.add(id);
        peindreBlocs();
        return;
      }
      if (btn.dataset.act === "atelier") {
        const ex = Store.exercices.get(se.blocs[i].exerciceId);
        if (ex) exporterFicheAtelier(ex, btn, { duree: se.blocs[i].duree, note: se.blocs[i].note });
        return;
      }
      if (btn.dataset.act === "monter" && i > 0) {
        [se.blocs[i - 1], se.blocs[i]] = [se.blocs[i], se.blocs[i - 1]];
      } else if (btn.dataset.act === "descendre" && i < se.blocs.length - 1) {
        [se.blocs[i + 1], se.blocs[i]] = [se.blocs[i], se.blocs[i + 1]];
      } else if (btn.dataset.act === "retirer") {
        const [parti] = se.blocs.splice(i, 1);
        peindreBlocs();
        toucher();
        statut(`« ${parti.titre || "Bloc"} » retiré du déroulé.`, {
          annuler: () => {
            se.blocs.splice(i, 0, parti);
            peindreBlocs();
            toucher();
          },
        });
        return;
      }
      peindreBlocs();
      toucher();
    });

    function proposer() {
      // Le déroulé remplacé se retient, donc plus de confirmation — et
      // surtout plus le conseil de « dupliquer la séance avant », qui
      // demandait à l'utilisateur de faire lui-même une sauvegarde.
      const avant = { blocs: JSON.parse(JSON.stringify(se.blocs)), objectif: se.objectif };
      const r = proposerDeroule(se);
      se.blocs = r.blocs;
      if (!se.objectif && r.objectif) {
        se.objectif = r.objectif;
        sec.querySelector('input[name="objectif"]').value = r.objectif;
      }
      peindreBlocs();
      toucher();
      const el = sec.querySelector("[data-explication]");
      el.innerHTML = `
        <div class="explication-tete"><strong>Pourquoi ce brouillon</strong><span class="spacer"></span><button type="button" data-act="proposer">Autre proposition</button><button type="button" data-act="fermer-explication" aria-label="Fermer">×</button></div>
        <ul>${r.explications.map((x) => `<li>${pastille(x.categorie)} <strong>${esc(x.titre)}</strong> <small>— ${esc(x.raisons.join(", "))}</small></li>`).join("")}</ul>
        <p class="legende">${se.groupeId ? "Parts de temps : la cible pour des adultes débutants, corrigée par ce que ce groupe a peu travaillé sur ses quatre dernières séances. " : "Sans groupe rattaché, la proposition ne connaît pas votre historique : rattachez la séance à un groupe pour qu'elle en tienne compte. "}Retouchez librement : c'est un point de départ, pas une consigne.</p>`;
      el.hidden = false;
      statut(
        avant.blocs.length ? "Déroulé remplacé par une proposition — à retoucher." : "Déroulé proposé — à retoucher.",
        avant.blocs.length
          ? {
              annuler: () => {
                se.blocs = avant.blocs;
                se.objectif = avant.objectif;
                sec.querySelector('input[name="objectif"]').value = avant.objectif;
                el.hidden = true;
                peindreBlocs();
                toucher();
                statut("Déroulé précédent rétabli.");
              },
            }
          : {},
      );
    }

    sec.querySelector(".deroule").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      if (b.dataset.act === "proposer") proposer();
      else if (b.dataset.act === "fermer-explication") sec.querySelector("[data-explication]").hidden = true;
    });

    sec.querySelector(".ajouts").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-act='libre']");
      if (!b) return;
      const ou = insertion === null ? se.blocs.length : insertion;
      se.blocs.splice(ou, 0, blocLibre(b.dataset.titre || "", Number(b.dataset.duree) || 5));
      if (insertion !== null) insertion = ou + 1;
      peindreBlocs();
      toucher();
      if (!b.dataset.titre) {
        const inp = blocsEl.querySelector("li:last-child input[name='titre']");
        inp && inp.focus();
      }
    });

    /* ── L'historique du groupe, au service de la préparation ── */

    function autresSeances() {
      return se.groupeId ? seancesDuGroupe(se.groupeId).filter((s) => s.id !== se.id) : [];
    }

    /* Une seule bande, en haut, pour tout ce que le groupe apprend
       sur cette séance-là. Il y avait trois affichages redondants : le
       panneau replié « dernière fois », le rappel de cycle, et l'alerte
       de répétition — plus, ailleurs dans l'appli, la section « pour la
       prochaine séance » de la fiche du groupe. Le coach ne savait pas
       laquelle faisait autorité. Une source, à l'endroit où elle sert. */
    function peindreContexte() {
      const el = sec.querySelector("[data-contexte]");
      if (!se.groupeId) {
        el.hidden = true;
        el.innerHTML = "";
        return;
      }
      const groupe = Store.groupes.get(se.groupeId);
      const cycle = cycleCourant(groupe, se.date);
      const faites = seancesFaites(se.groupeId).filter((x) => x.id !== se.id && (!se.date || (x.date || "") <= se.date));
      const derniere = faites[faites.length - 1];
      const revoir = aRevoir(faites, 2);
      const r = recouvrement(se, autresSeances().filter(estFaite));
      const repete = r.avec && r.ratio >= 0.6 && r.communs >= 3;
      const bilan = derniere && derniere.bilan && derniere.bilan.fait ? derniere.bilan : null;

      const lignes = [];
      if (cycle) {
        lignes.push(
          `<p class="contexte-ligne"><span class="contexte-quoi">Cycle</span><span>« ${esc(cycle.nom || "en cours")} » ${esc(formaterCourt(cycle.debut))} → ${esc(formaterCourt(cycle.fin))}${cycle.categories && cycle.categories.length ? ` · ${cycle.categories.map((c) => pastille(c)).join(" ")}` : ""}${cycle.note ? ` · <em>${esc(cycle.note)}</em>` : ""}</span></p>`,
        );
      }
      if (derniere) {
        lignes.push(
          `<p class="contexte-ligne"><span class="contexte-quoi">Dernière fois</span><span>${esc(formaterCourt(derniere.date))}${derniere.titre ? ` · ${esc(derniere.titre)}` : ""}${bilan && bilan.note ? ` · ${"★".repeat(bilan.note)}` : " · sans bilan"}${bilan && bilan.retenir ? ` — « ${esc(bilan.retenir)} »` : ""}</span></p>`,
        );
      }
      if (revoir.length) {
        lignes.push(
          `<p class="contexte-ligne contexte-revoir"><span class="contexte-quoi">↻ À revoir</span><span>${revoir.map((x) => esc(x.titre) + (x.commentaire ? ` <small>(${esc(x.commentaire)})</small>` : "")).join(" · ")}</span></p>`,
        );
      }
      if (repete) {
        lignes.push(
          `<p class="contexte-ligne contexte-alerte"><span class="contexte-quoi">⚠ Répétition</span><span>Cette séance reprend ${r.communs} exercices de celle du ${esc(formaterCourt(r.avec.date))}. Volontaire ? Sinon, la bibliothèque marque ce qui n'a jamais été fait avec ce groupe.</span></p>`,
        );
      }
      if (!lignes.length) {
        el.hidden = true;
        el.innerHTML = "";
        return;
      }
      el.innerHTML = lignes.join("") + `<p class="contexte-pied"><a href="#/groupe/${se.groupeId}">Tout l'historique de ${esc(groupe && groupe.nom ? groupe.nom : "ce groupe")} →</a></p>`;
      el.hidden = false;
    }

    /* La colonne dit où ira ce qu'on y ajoute : le « + » d'un exercice
       et le point d'insertion du déroulé sont le même geste vu des
       deux bouts, et il n'y avait rien pour le relier. */
    function peindreOu() {
      const el = sec.querySelector("[data-ou]");
      if (!el) return;
      el.textContent =
        insertion === null || insertion >= se.blocs.length
          ? se.blocs.length
            ? "↳ ajouter à la fin"
            : ""
          : `↳ insérer en ${insertion + 1}ᵉ position`;
    }

    /* Au bureau la colonne est ouverte et le reste ; sous 980 px, elle
       devient un panneau posé en bas, replié, qu'on appelle d'un doigt.
       Elle ne tombe plus SOUS le déroulé, où elle était hors de portée
       exactement quand l'écran est petit. */
    const panneau = sec.querySelector("[data-panneau]");
    const large = window.matchMedia("(min-width: 981px)");
    const accorderPanneau = () => (panneau.open = large.matches);
    accorderPanneau();
    large.addEventListener("change", accorderPanneau);

    /* Rattacher une séance à un groupe lui donne son créneau — mais
       seulement si la durée n'a pas déjà été choisie à la main. Un
       réglage par défaut qui écrase une décision n'est plus un défaut,
       c'est une surprise. */
    function appliquerCreneau(g) {
      if (!g || !(Number(g.duree_glace) > 0)) return;
      if (Number(se.duree_glace) !== GLACE_PAR_DEFAUT) return;
      se.duree_glace = Number(g.duree_glace);
      const champ = sec.querySelector('input[name="duree_glace"]');
      if (champ) champ.value = se.duree_glace;
      peindreTemps();
      statut(`Temps de glace repris du groupe : ${formaterDuree(se.duree_glace)}.`);
    }

    /* La ligne de résumé des réglages, quand ils sont repliés. */
    function peindreResume() {
      const g = se.groupeId ? Store.groupes.get(se.groupeId) : null;
      sec.querySelector("[data-resume]").textContent =
        [se.date ? formaterDate(se.date, { year: undefined }) : "sans date", se.heure, g && g.nom, se.lieu, `${se.duree_glace} min de glace`]
          .filter(Boolean)
          .join(" · ");
    }

    /* ── La bibliothèque ────────────────────────────────────── */

    /* Comme sur l'écran Exercices : le filtre est posé une fois, seule
       la liste se repeint à la frappe. Le champ de saisie n'est jamais
       remplacé sous les doigts de celui qui tape. */
    function peindreBibli() {
      bibliEl.innerHTML = barreFiltres(filtre) + `<div data-bibli-liste></div>`;
      peindreBibliListe();
    }

    /* Les vignettes coûtent : cent soixante-sept patinoires en SVG font
       quatorze mille nœuds, et la liste se repeint à chaque frappe. La
       colonne sert à PIOCHER, pas à tout parcourir — la planche-contact
       de la bibliothèque est là pour ça. On en montre donc une page, et
       on dit combien il en reste. */
    const PAGE_COLONNE = 40;

    function peindreBibliListe() {
      const tout = trier(filtrer(Store.exercices.tous(), filtre));
      const liste = tout.slice(0, PAGE_COLONNE);
      const reste = tout.length - liste.length;
      const usage = se.groupeId ? usageExercices(autresSeances()) : null;
      bibliEl.querySelector("[data-bibli-liste]").innerHTML = liste.length
        ? `<ul class="bibli-liste">${liste
            .map((ex) => {
              const u = usage ? usage.get(ex.id) : undefined;
              const indice = usage ? mention(libelleUsage(u), u ? "" : "attire") : "";
              return `
              <li>
                <button type="button" class="bibli-vue" data-apercu="${ex.id}" tabindex="-1" aria-hidden="true">${vignette(ex.schema)}</button>
                <button type="button" class="bibli-titre" data-apercu="${ex.id}" title="Voir l'exercice">
                  <span class="nom">${esc(ex.nom) || "Sans nom"}</span>
                  <span class="meta">${pastille(ex.categorie)}<span class="sep">·</span>${mention(formaterDuree(ex.duree))}${indice ? `<span class="sep">·</span>${indice}` : ""}</span>
                </button>
                <button type="button" class="ajouter" data-ajouter="${ex.id}" title="Ajouter au déroulé" aria-label="Ajouter « ${esc(ex.nom)} » au déroulé">+</button>
              </li>`;
            })
            .join("")}</ul>${
              reste
                ? `<p class="bibli-reste">${reste} autre${reste > 1 ? "s" : ""} — affinez la recherche, ou ouvrez la <a href="#/exercices">bibliothèque</a>.</p>`
                : ""
            }`
        : `<p class="vide">Rien ne correspond.</p>`;
    }

    function ajouterAuDeroule(ex) {
      const ou = insertion === null ? se.blocs.length : insertion;
      se.blocs.splice(ou, 0, blocDepuisExercice(ex));
      // le point d'insertion avance : on enchaîne deux ajouts d'affilée
      if (insertion !== null) insertion = ou + 1;
      peindreBlocs();
      toucher();
      statut(`« ${ex.nom} » ajouté${ou < se.blocs.length - 1 ? ` en ${ou + 1}ᵉ position` : " au déroulé"}.`);
    }

    bibliEl.addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.apercu) {
        const ex = Store.exercices.get(b.dataset.apercu);
        if (!ex) return;
        const choix = await apercu(ex);
        if (choix === "ajouter") ajouterAuDeroule(ex);
        else if (choix === "fiche") {
          Store.seances.sauver(se);
          location.hash = `#/exercice/${ex.id}`;
        }
      } else if (b.dataset.ajouter) {
        const ex = Store.exercices.get(b.dataset.ajouter);
        if (ex) ajouterAuDeroule(ex);
      } else if (b.dataset.cat !== undefined) {
        filtre.categorie = b.dataset.cat;
        bibliEl.querySelectorAll(".filtres .jeu [data-cat]").forEach((c) => c.classList.toggle("actif", c.dataset.cat === filtre.categorie));
        peindreBibliListe();
      }
    });
    const repeindreBibli = debounce(peindreBibliListe, 160);
    bibliEl.addEventListener("input", (e) => {
      if (e.target.name === "q") {
        filtre.q = e.target.value;
        repeindreBibli();
      }
    });

    /* ── Les champs de tête ─────────────────────────────────── */

    sec.querySelector(".titre-champ").addEventListener("input", (e) => {
      se.titre = e.target.value;
      toucher();
    });
    sec.querySelector(".seance-champs").addEventListener("input", (e) => {
      const c = e.target;
      if (!c.name) return;
      if (c.name === "duree_glace") se.duree_glace = Math.max(1, Number(c.value) || 1);
      else if (c.name === "groupeId") {
        if (c.value === "__nouveau") {
          const nom = prompt("Nom du nouveau groupe :", "");
          if (nom && nom.trim()) {
            const g = Store.groupes.parNom(nom) || Store.groupes.creer({ nom: nom.trim() });
            se.groupeId = g.id;
            se.groupe = g.nom;
          }
          c.innerHTML = optionsGroupes(se);
        } else {
          se.groupeId = c.value || null;
          const g = se.groupeId ? Store.groupes.get(se.groupeId) : null;
          se.groupe = g ? g.nom : "";
          appliquerCreneau(g);
        }
        peindreContexte();
        peindreBibli();
      } else se[c.name] = c.value;
      if (c.name === "duree_glace" || c.name === "heure") peindreTemps();
      if (c.name === "date") peindreContexte();
      peindreResume();
      toucher();
    });
    sec.querySelector(".seance-champs").addEventListener("submit", (e) => e.preventDefault());
    sec.querySelector(".objectif-champ input").addEventListener("input", (e) => {
      se.objectif = e.target.value;
      toucher();
    });
    sec.querySelector("textarea[name='notes']").addEventListener("input", (e) => {
      se.notes = e.target.value;
      toucher();
    });

    sec.querySelector(".entete").addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const menu = b.closest("details.menu");
      if (menu) menu.open = false;
      if (b.dataset.act === "proposer") {
        proposer();
      } else if (b.dataset.act === "vers-groupe") {
        Store.seances.sauver(se);
        const groupes = Store.groupes.tous();
        const choix = await choisir({
          titre: "Pousser cette séance dans un groupe",
          options: [
            ...groupes.map((g) => ({ id: `copie:${g.id}`, libelle: `Copier dans « ${g.nom || "sans nom"} »`, detail: "une copie datée d'aujourd'hui, sans bilan ; l'originale ne bouge pas" })),
            ...groupes.filter((g) => g.id !== se.groupeId).map((g) => ({ id: `deplace:${g.id}`, libelle: `Déplacer vers « ${g.nom || "sans nom"} »`, detail: "la séance elle-même change de groupe" })),
            { id: "nouveau", libelle: "Nouveau groupe…", detail: "créer le groupe, puis y copier la séance" },
          ],
          vide: "Aucun groupe pour l'instant.",
        });
        if (!choix) return;
        let [mode, gid] = choix.split(":");
        if (mode === "nouveau") {
          const nom = prompt("Nom du nouveau groupe :", "");
          if (!nom || !nom.trim()) return;
          gid = (Store.groupes.parNom(nom) || Store.groupes.creer({ nom: nom.trim() })).id;
          mode = "copie";
        }
        const g = Store.groupes.get(gid);
        if (!g) return;
        if (mode === "deplace") {
          se.groupeId = g.id;
          se.groupe = g.nom;
          Store.seances.sauver(se);
          sec.querySelector("select[name=groupeId]").innerHTML = optionsGroupes(se);
          peindreContexte();
          peindreBibli();
          peindreResume();
          statut(`Séance déplacée dans « ${g.nom} ».`);
        } else {
          const copie = Store.seances.dupliquer(se.id);
          copie.titre = se.titre;
          copie.groupeId = g.id;
          copie.groupe = g.nom;
          copie.bilan = null;
          Store.seances.sauver(copie);
          statut(`Séance copiée dans « ${g.nom} ».`);
          location.hash = `#/seance/${copie.id}`;
        }
      } else if (b.dataset.act === "pdf" || b.dataset.act === "carte") {
        Store.seances.sauver(se);
        if (b.dataset.act === "carte") await exporterCarte(se, b);
        else await exporterPdf(se, b);
      } else if (b.dataset.act === "dupliquer") {
        Store.seances.sauver(se);
        const copie = Store.seances.dupliquer(se.id);
        statut("Séance dupliquée.");
        location.hash = `#/seance/${copie.id}`;
      } else if (b.dataset.act === "supprimer") {
        Store.seances.sauver(se);
        const copie = JSON.parse(JSON.stringify(se));
        Store.seances.supprimer(se.id);
        statut(`« ${se.titre || "Séance"} » supprimée.`, {
          annuler: () => {
            Store.seances.installer([copie]);
            statut("Séance rétablie.");
            location.hash = `#/seance/${copie.id}`;
          },
        });
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
    peindreContexte();
    peindreResume();

    return {
      detruire() {
        off();
        large.removeEventListener("change", accorderPanneau);
        if (etat.textContent !== "Enregistré" && Store.seances.get(se.id)) Store.seances.sauver(se);
      },
    };
  },
};

/* Un seul bouton primaire, et il dépend du moment de la séance.
   « Bord de glace » en bleu sur une séance vide mettait en avant
   l'action finale au moment de commencer. */
function actionPrincipale(se) {
  const passee = (se.date || "") < aujourdhuiIso();
  if (!se.blocs.length) return `<button type="button" class="primaire" data-act="proposer">✦ Proposer un déroulé</button>`;
  if (passee && !(se.bilan && se.bilan.fait)) return `<a class="bouton primaire" href="#/seance/${se.id}/bilan" title="Noter comment ça s'est passé">Faire le bilan</a>`;
  return `<a class="bouton primaire" href="#/seance/${se.id}/glace" title="La séance vue du banc : matériel, points clés, bloc en cours">Bord de glace</a>`;
}

function optionsGroupes(se) {
  const groupes = Store.groupes.tous();
  return (
    `<option value=""${se.groupeId ? "" : " selected"}>— aucun —</option>` +
    groupes.map((g) => `<option value="${g.id}"${se.groupeId === g.id ? " selected" : ""}>${esc(g.nom || "Groupe sans nom")}</option>`).join("") +
    `<option value="__nouveau">+ Nouveau groupe…</option>`
  );
}
