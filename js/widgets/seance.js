/* Séance — composer le déroulé : des blocs dans l'ordre, chacun avec
   sa durée, et la bibliothèque à côté pour piocher. La frise en haut
   du déroulé montre d'un coup d'œil où passe le temps de glace. */
import { Store, blocLibre, blocDepuisExercice } from "../core/store.js";
import { esc, debounce, statut, formaterDuree, heureA, formaterDate } from "../core/dom.js";
import { CATEGORIES } from "../data/catalogue.js";
import { chip, barreFiltres, filtrer, trier, exporterPdf, exporterCarte, exporterFicheAtelier } from "./communs.js";
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
        <span class="etat" data-etat>Enregistré</span>
        <span class="spacer"></span>
        <a class="bouton primaire" href="#/seance/${se.id}/glace" title="La séance vue du banc : matériel, points clés, bloc en cours">Bord de glace</a>
        <a class="bouton" href="#/seance/${se.id}/glace#bilan" title="Noter comment ça s'est passé">${se.bilan && se.bilan.fait ? "Bilan ✓" : "Bilan"}</a>
        <a class="bouton" href="#/seance/${se.id}/imprimer">Imprimer</a>
        <details class="menu">
          <summary class="bouton" title="Télécharger en PDF">PDF ▾</summary>
          <div class="menu-liste">
            <button type="button" data-act="carte" title="Une page, gros caractères, sans schéma : à plier dans la poche">Carte de poche</button>
            <button type="button" data-act="pdf" title="Le plan et chaque exercice avec son schéma">Feuille complète</button>
          </div>
        </details>
        <button type="button" data-act="dupliquer">Dupliquer</button>
        <button type="button" data-act="vers-groupe" title="Copier cette séance dans un groupe, ou la déplacer">Vers un groupe…</button>
        <button type="button" class="danger" data-act="supprimer">Supprimer</button>
      </div>
      <input class="nom" name="titre" placeholder="Titre de la séance" value="${esc(se.titre)}" aria-label="Titre de la séance">
      <form class="seance-champs" autocomplete="off">
        <label>Date <input type="date" name="date" value="${esc(se.date)}"></label>
        <label>Heure <input type="time" name="heure" value="${esc(se.heure)}"></label>
        <label>Groupe <select name="groupeId" data-groupe>${optionsGroupes(se)}</select></label>
        <label>Lieu <input name="lieu" value="${esc(se.lieu)}" placeholder="Patinoire"></label>
        <label>Glace (min) <input type="number" name="duree_glace" min="5" max="240" value="${esc(se.duree_glace)}"></label>
        <label class="large">Objectif <input name="objectif" value="${esc(se.objectif)}" placeholder="Le fil rouge de la séance"></label>
      </form>
      <div data-derniere></div>
      <div class="seance-corps">
        <div class="deroule">
          <p class="avis" data-repetition hidden></p>
          <div class="deroule-entete">
            <h2>Déroulé</h2>
            <span class="total" data-total></span>
          </div>
          <div class="frise" data-frise aria-hidden="true"></div>
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
      // seules les rangées de bloc portent une heure — pas le message
      // « le déroulé est vide », qui est aussi un <li>
      blocsEl.querySelectorAll("li[data-id]").forEach((li) => {
        const b = se.blocs.find((x) => x.id === li.dataset.id);
        if (!b) return;
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
                  <button type="button" class="poignee" data-poignee title="Glisser pour déplacer" aria-label="Déplacer ce bloc">⋮⋮</button>
                  <span class="heure"></span>
                  <div class="bloc-titre">${titre}</div>
                  <label class="duree"><input type="number" name="duree" min="1" max="120" value="${esc(b.duree)}" aria-label="Durée en minutes"> min</label>
                  <input class="note" name="note" value="${esc(b.note)}" placeholder="Consigne, variante, remarque…" aria-label="Note">
                  <div class="bloc-actions">
                    ${ex ? `<button type="button" data-act="atelier" title="Fiche atelier (PDF) pour celui qui tient l'atelier, avec la note de ce bloc">Fiche</button>` : ""}
                    <button type="button" data-act="monter" title="Monter" ${i === 0 ? "disabled" : ""}>▲</button>
                    <button type="button" data-act="descendre" title="Descendre" ${i === se.blocs.length - 1 ? "disabled" : ""}>▼</button>
                    <button type="button" data-act="retirer" class="danger" title="Retirer de la séance">×</button>
                  </div>
                </li>`;
            })
            .join("")
        : `<li class="vide">Le déroulé est vide : ajoutez des exercices depuis la bibliothèque, ou un bloc libre.</li>`;
      peindreTemps();
      peindreRepetition();
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
      const btn = e.target.closest("button[data-act]");
      const li = e.target.closest("li[data-id]");
      if (!btn || !li) return;
      const i = se.blocs.findIndex((x) => x.id === li.dataset.id);
      if (i < 0) return;
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
        se.blocs.splice(i, 1);
      }
      peindreBlocs();
      toucher();
    });

    function proposer() {
      if (se.blocs.length && !confirm("Remplacer le déroulé actuel par une proposition ? (Ctrl+Z ne marche pas ici : dupliquez la séance avant si vous voulez garder l'actuel.)")) return;
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
        <ul>${r.explications.map((x) => `<li>${chip(x.categorie)} <strong>${esc(x.titre)}</strong> <small>— ${esc(x.raisons.join(", "))}</small></li>`).join("")}</ul>
        <p class="legende">${se.groupeId ? "Parts de temps : la cible pour des adultes débutants, corrigée par ce que ce groupe a peu travaillé sur ses quatre dernières séances. " : "Sans groupe rattaché, la proposition ne connaît pas votre historique : rattachez la séance à un groupe pour qu'elle en tienne compte. "}Retouchez librement : c'est un point de départ, pas une consigne.</p>`;
      el.hidden = false;
      statut("Déroulé proposé — à retoucher.");
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
      se.blocs.push(blocLibre(b.dataset.titre || "", Number(b.dataset.duree) || 5));
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

    function peindreRepetition() {
      const el = sec.querySelector("[data-repetition]");
      const autres = autresSeances().filter(estFaite);
      const r = recouvrement(se, autres);
      if (r.avec && r.ratio >= 0.6 && r.communs >= 3) {
        el.innerHTML = `Cette séance reprend <strong>${r.communs} exercice${r.communs > 1 ? "s" : ""}</strong> de celle du ${esc(formaterCourt(r.avec.date))}${r.avec.titre ? ` (« ${esc(r.avec.titre)} »)` : ""}. Volontaire ? Sinon, la bibliothèque marque ce qui n'a jamais été fait avec ce groupe.`;
        el.hidden = false;
      } else el.hidden = true;
    }

    function peindreDerniere() {
      const el = sec.querySelector("[data-derniere]");
      if (!se.groupeId) {
        el.innerHTML = "";
        return;
      }
      const groupe = Store.groupes.get(se.groupeId);
      const cycle = cycleCourant(groupe, se.date);
      const cycleHtml = cycle
        ? `<p class="cycle-en-cours"><strong>Cycle « ${esc(cycle.nom || "en cours")} »</strong> ${esc(formaterCourt(cycle.debut))} → ${esc(formaterCourt(cycle.fin))}${cycle.categories && cycle.categories.length ? ` · ${cycle.categories.map((c) => chip(c)).join(" ")}` : ""}${cycle.note ? ` · ${esc(cycle.note)}` : ""} <a href="#/groupe/${se.groupeId}">modifier</a></p>`
        : "";
      const faites = seancesFaites(se.groupeId).filter((s) => s.id !== se.id && (!se.date || (s.date || "") <= se.date));
      const derniere = faites[faites.length - 1];
      if (!derniere) {
        el.innerHTML = cycleHtml;
        return;
      }
      const revoir = aRevoir(faites, 2);
      const bilan = derniere.bilan && derniere.bilan.fait ? derniere.bilan : null;
      el.innerHTML = cycleHtml + `
        <details class="derniere">
          <summary><strong>Dernière fois avec ce groupe</strong> — ${esc(formaterCourt(derniere.date))}${derniere.titre ? ` · ${esc(derniere.titre)}` : ""}${bilan && bilan.note ? ` · ${"★".repeat(bilan.note)}` : ""}${bilan ? "" : " · sans bilan"}</summary>
          <div class="derniere-corps">
            <p><strong>Fait :</strong> ${derniere.blocs.map((b) => esc(b.titre)).join(" · ") || "—"}</p>
            ${bilan && bilan.retenir ? `<p><strong>À retenir :</strong> ${esc(bilan.retenir)}</p>` : ""}
            ${revoir.length ? `<p><strong>À revoir :</strong> ${revoir.map((r) => esc(r.titre) + (r.commentaire ? ` <small>(${esc(r.commentaire)})</small>` : "")).join(" · ")}</p>` : ""}
            <p><a href="#/groupe/${se.groupeId}">Voir tout l'historique du groupe →</a></p>
          </div>
        </details>`;
    }

    /* ── La bibliothèque ────────────────────────────────────── */

    function peindreBibli() {
      const liste = trier(filtrer(Store.exercices.tous(), filtre));
      const usage = se.groupeId ? usageExercices(autresSeances()) : null;
      bibliEl.innerHTML =
        barreFiltres(filtre) +
        (liste.length
          ? `<ul class="bibli-liste">${liste
              .map((ex) => {
                const u = usage ? usage.get(ex.id) : undefined;
                const indice = usage ? `<span class="indice ${u ? (u.rang === 0 ? "recent" : "") : "jamais"}">${esc(libelleUsage(u))}</span>` : "";
                return `
              <li>
                <button type="button" class="bibli-titre" data-apercu="${ex.id}" title="Voir l'exercice"><strong>${esc(ex.nom) || "<em>Sans nom</em>"}</strong><span class="meta">${chip(ex.categorie)} ${formaterDuree(ex.duree)} ${indice}</span></button>
                <button type="button" data-ajouter="${ex.id}" title="Ajouter au déroulé">+</button>
              </li>`;
              })
              .join("")}</ul>`
          : `<p class="vide">Rien ne correspond.</p>`);
      const q = bibliEl.querySelector('input[name="q"]');
      if (filtre._focus && q) {
        q.focus();
        q.setSelectionRange(q.value.length, q.value.length);
      }
    }

    function ajouterAuDeroule(ex) {
      se.blocs.push(blocDepuisExercice(ex));
      peindreBlocs();
      toucher();
      statut(`« ${ex.nom} » ajouté au déroulé.`);
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
        }
        peindreDerniere();
        peindreBibli();
        peindreRepetition();
      } else se[c.name] = c.value;
      if (c.name === "duree_glace" || c.name === "heure") peindreTemps();
      if (c.name === "date") peindreDerniere();
      toucher();
    });
    sec.querySelector(".seance-champs").addEventListener("submit", (e) => e.preventDefault());
    sec.querySelector("textarea[name='notes']").addEventListener("input", (e) => {
      se.notes = e.target.value;
      toucher();
    });

    sec.querySelector(".entete").addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "vers-groupe") {
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
          peindreDerniere();
          peindreBibli();
          peindreRepetition();
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
        if (b.closest("details")) b.closest("details").open = false;
        if (b.dataset.act === "carte") await exporterCarte(se, b);
        else await exporterPdf(se, b);
      } else if (b.dataset.act === "dupliquer") {
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
    peindreDerniere();

    return {
      detruire() {
        off();
        if (etat.textContent !== "Enregistré" && Store.seances.get(se.id)) Store.seances.sauver(se);
      },
    };
  },
};

function optionsGroupes(se) {
  const groupes = Store.groupes.tous();
  return (
    `<option value=""${se.groupeId ? "" : " selected"}>— aucun —</option>` +
    groupes.map((g) => `<option value="${g.id}"${se.groupeId === g.id ? " selected" : ""}>${esc(g.nom || "Groupe sans nom")}</option>`).join("") +
    `<option value="__nouveau">+ Nouveau groupe…</option>`
  );
}
