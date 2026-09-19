/* Groupe — la fiche d'une équipe : ce qu'on a fait ensemble, comment
   c'est équilibré, ce qui revient trop, ce qu'il reste à essayer, et ce
   que disent les bilans. C'est la mémoire du coach. */
import { Store } from "../core/store.js";
import { proposerDeroule } from "../core/brouillon.js";
import { esc, debounce, statut, formaterDate, formaterDuree } from "../core/dom.js";
import { CATEGORIES, NIVEAUX } from "../data/catalogue.js";
import { chip } from "./communs.js";
import { choisir } from "./dialogue.js";
import { CIBLE, seancesDuGroupe, seancesFaites, estFaite, repartition, usageExercices, conseils, aRevoir, noteMoyenne, formaterCourt } from "../core/analyse.js";

const etoiles = (n) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "");

export const Groupe = {
  afficher(main, id) {
    const g = Store.groupes.get(id);
    const sec = document.createElement("section");
    sec.className = "ecran ecran-groupe";
    main.replaceChildren(sec);
    if (!g) {
      sec.innerHTML = `<p class="vide">Ce groupe n'existe pas. <a href="#/groupes">Retour aux groupes.</a></p>`;
      return { detruire() {} };
    }

    let tri = "recent";

    const rendre = () => {
      const toutes = seancesDuGroupe(g.id);
      const faites = toutes.filter(estFaite);
      const aVenir = toutes.filter((s) => !estFaite(s));
      const { minutes, total } = repartition(faites);
      const usage = usageExercices(faites);
      const avis = conseils(g.id);
      const revoir = aRevoir(faites, 3);
      const bibli = Store.exercices.tous();
      const jamais = bibli.filter((e) => !usage.has(e.id));

      const lignesUsage = [...usage.values()].map((u) => ({ ...u, ex: Store.exercices.get(u.exerciceId) }));
      lignesUsage.sort((a, b) => {
        if (tri === "fois") return b.fois - a.fois || (b.derniere || "").localeCompare(a.derniere || "");
        if (tri === "note") return moy(b.notes) - moy(a.notes);
        return (b.derniere || "").localeCompare(a.derniere || "");
      });

      sec.innerHTML = `
        <div class="entete">
          <a class="retour" href="#/groupes">← Groupes</a>
          <span class="etat" data-etat>Enregistré</span>
          <span class="spacer"></span>
          <button type="button" class="primaire" data-act="proposer-seance" title="Une séance de 60 minutes proposée d'après l'historique, à retoucher">✦ Proposer une séance</button>
          <button type="button" data-act="nouvelle-seance">+ Séance vide</button>
          <button type="button" data-act="rattacher" title="Pousser une séance existante dans ce groupe">Rattacher une séance…</button>
          <button type="button" class="danger" data-act="supprimer">Supprimer</button>
        </div>
        <input class="nom" name="nom" placeholder="Nom du groupe (Adultes débutants, U11, Loisir mardi…)" value="${esc(g.nom)}" aria-label="Nom du groupe">
        <form class="groupe-champs" autocomplete="off">
          <label>Niveau <select name="niveau">${Object.entries(NIVEAUX)
            .map(([k, v]) => `<option value="${k}"${g.niveau === k ? " selected" : ""}>${esc(v)}</option>`)
            .join("")}</select></label>
          <label class="large">Description <input name="description" value="${esc(g.description)}" placeholder="Effectif, créneau, ce qui caractérise ce groupe…"></label>
        </form>

        <div class="groupe-chiffres">
          <div><strong>${faites.length}</strong><span>séance${faites.length > 1 ? "s" : ""} faite${faites.length > 1 ? "s" : ""}</span></div>
          <div><strong>${formaterDuree(total)}</strong><span>de glace</span></div>
          <div><strong>${usage.size}</strong><span>exercice${usage.size > 1 ? "s" : ""} différent${usage.size > 1 ? "s" : ""}</span></div>
          <div><strong>${jamais.length}</strong><span>jamais fait${jamais.length > 1 ? "s" : ""}</span></div>
        </div>

        ${avis.length ? `<section class="groupe-section"><h2>Ce que dit l'historique</h2><ul class="conseils">${avis.map((a) => `<li class="conseil conseil-${a.type}">${esc(a.texte)}</li>`).join("")}</ul></section>` : ""}

        ${
          revoir.length
            ? `<section class="groupe-section"><h2>Pour la prochaine séance</h2><ul class="revoir">${revoir
                .map((r) => `<li>${r.exerciceId && Store.exercices.get(r.exerciceId) ? `<a href="#/exercice/${r.exerciceId}">${esc(r.titre)}</a>` : esc(r.titre)} <small>${esc(formaterCourt(r.date))}${r.commentaire ? ` — ${esc(r.commentaire)}` : ""}</small></li>`)
                .join("")}</ul>${dernierRetenir(faites)}</section>`
            : dernierRetenir(faites)
              ? `<section class="groupe-section"><h2>Pour la prochaine séance</h2>${dernierRetenir(faites)}</section>`
              : ""
        }

        <section class="groupe-section">
          <h2>Équilibre <small>${faites.length ? `sur ${Math.min(faites.length, 4)} dernière${faites.length > 1 ? "s" : ""} séance${faites.length > 1 ? "s" : ""}` : ""}</small></h2>
          ${equilibre(faites.slice(-4))}
        </section>

        <section class="groupe-section">
          <h2>Séances <small>${toutes.length}</small></h2>
          ${
            toutes.length
              ? `<ul class="groupe-seances">${toutes
                  .slice()
                  .reverse()
                  .map((s) => {
                    const faite = estFaite(s);
                    const bilan = s.bilan && s.bilan.fait;
                    const nm = noteMoyenne(s);
                    return `<li class="${faite ? "faite" : "a-venir"}"><a href="#/seance/${s.id}"><span class="date">${esc(formaterDate(s.date, { year: undefined }))}</span><strong>${esc(s.titre) || "Séance sans titre"}</strong></a><span class="meta">${formaterDuree(Store.dureeSeance(s))}${faite ? (bilan ? ` · ${etoiles(s.bilan.note)}${nm ? ` · blocs ${nm.toFixed(1)}/3` : ""}` : ` · <a href="#/seance/${s.id}/glace#bilan">bilan à faire</a>`) : " · à venir"}</span></li>`;
                  })
                  .join("")}</ul>`
              : `<p class="vide">Aucune séance pour ce groupe. Créez-en une avec le bouton en haut, ou rattachez des séances existantes depuis leur écran.</p>`
          }
        </section>

        <section class="groupe-section">
          <h2>Exercices déjà faits <small>${usage.size}</small>
            <span class="tri">Trier : <button type="button" data-tri="recent" class="${tri === "recent" ? "actif" : ""}">récents</button><button type="button" data-tri="fois" class="${tri === "fois" ? "actif" : ""}">fréquence</button><button type="button" data-tri="note" class="${tri === "note" ? "actif" : ""}">note</button></span>
          </h2>
          ${
            lignesUsage.length
              ? `<table class="usage"><thead><tr><th>Exercice</th><th>Fois</th><th>Dernière</th><th>Temps</th><th>Bilan</th></tr></thead><tbody>${lignesUsage
                  .map(
                    (u) => `<tr><td>${u.ex ? `<a href="#/exercice/${u.exerciceId}">${esc(u.titre)}</a> ${chip(u.ex.categorie)}` : esc(u.titre)}</td><td class="mono">${u.fois}</td><td class="mono">${esc(formaterCourt(u.derniere))}</td><td class="mono">${u.minutes}'</td><td>${noteBlocs(u.notes)}</td></tr>`,
                  )
                  .join("")}</tbody></table>`
              : `<p class="vide">Rien encore : l'historique se remplit avec les séances faites.</p>`
          }
        </section>

        ${
          jamais.length
            ? `<details class="groupe-section"><summary><h2>Jamais faits avec ce groupe <small>${jamais.length}</small></h2></summary><ul class="jamais">${Object.keys(CATEGORIES)
                .map((cat) => {
                  const liste = jamais.filter((e) => e.categorie === cat);
                  return liste.length ? `<li>${chip(cat)} ${liste.map((e) => `<a href="#/exercice/${e.id}">${esc(e.nom)}</a>`).join(" · ")}</li>` : "";
                })
                .join("")}</ul></details>`
            : ""
        }`;
    };

    const etatEl = () => sec.querySelector("[data-etat]");
    const sauver = debounce(() => {
      Store.groupes.sauver(g);
      // garder le nom en texte sur les séances : impression et PDF le lisent
      for (const s of seancesDuGroupe(g.id)) {
        if (s.groupe !== g.nom) {
          s.groupe = g.nom;
          Store.seances.sauver(s);
        }
      }
      etatEl().textContent = "Enregistré";
    }, 500);

    sec.addEventListener("input", (e) => {
      const c = e.target;
      if (!c.name) return;
      g[c.name] = c.value;
      etatEl().textContent = "Modification…";
      sauver();
    });

    sec.addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.tri) {
        tri = b.dataset.tri;
        rendre();
      } else if (b.dataset.act === "proposer-seance") {
        Store.groupes.sauver(g);
        const se = Store.seances.creer({ groupeId: g.id, groupe: g.nom });
        const r = proposerDeroule(se);
        se.blocs = r.blocs;
        se.objectif = r.objectif;
        se.notes = "Brouillon proposé d'après l'historique du groupe. Le bouton « Autre proposition » dans le déroulé en fait une autre.";
        Store.seances.sauver(se);
        statut("Séance proposée — à retoucher.");
        location.hash = `#/seance/${se.id}`;
      } else if (b.dataset.act === "rattacher") {
        const candidates = Store.seances
          .toutes()
          .filter((s) => s.groupeId !== g.id)
          .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        const choix = await choisir({
          titre: `Rattacher une séance à « ${g.nom || "ce groupe"} »`,
          options: candidates.map((s) => {
            const autre = s.groupeId ? Store.groupes.get(s.groupeId) : null;
            return { id: s.id, libelle: s.titre || "Séance sans titre", detail: `${formaterDate(s.date)} · ${autre ? `actuellement dans « ${autre.nom} »` : "sans groupe"}` };
          }),
          vide: "Toutes les séances sont déjà dans ce groupe.",
        });
        if (!choix) return;
        const s = Store.seances.get(choix);
        if (!s) return;
        s.groupeId = g.id;
        s.groupe = g.nom;
        Store.seances.sauver(s);
        statut(`« ${s.titre || "Séance"} » rattachée à « ${g.nom} ».`);
      } else if (b.dataset.act === "nouvelle-seance") {
        Store.groupes.sauver(g);
        const se = Store.seances.creer({ groupeId: g.id, groupe: g.nom });
        location.hash = `#/seance/${se.id}`;
      } else if (b.dataset.act === "supprimer") {
        if (!confirm(`Supprimer le groupe « ${g.nom || "sans nom"} » ? Ses séances sont conservées, simplement détachées.`)) return;
        Store.groupes.supprimer(g.id);
        statut("Groupe supprimé, séances conservées.");
        location.hash = "#/groupes";
      }
    });

    const off = Store.abonner((quoi) => {
      if (quoi !== "groupes") rendre();
    });
    rendre();
    return {
      detruire() {
        off();
        if (etatEl() && etatEl().textContent !== "Enregistré") Store.groupes.sauver(g);
      },
    };
  },
};

function moy(notes) {
  return notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
}

function noteBlocs(notes) {
  if (!notes.length) return `<span class="faible">—</span>`;
  const m = moy(notes);
  const lib = m >= 2.5 ? "bien" : m >= 1.75 ? "correct" : "à revoir";
  return `<span class="note-${lib.replace(/\W/g, "")}">${lib}</span> <small>${m.toFixed(1)}/3 sur ${notes.length}</small>`;
}

function dernierRetenir(faites) {
  const avec = faites.filter((s) => s.bilan && s.bilan.fait && s.bilan.retenir);
  if (!avec.length) return "";
  const s = avec[avec.length - 1];
  return `<p class="retenir"><strong>Dernier bilan (${esc(formaterCourt(s.date))}) :</strong> ${esc(s.bilan.retenir)}</p>`;
}

function equilibre(seances) {
  const { minutes, total } = repartition(seances);
  if (!total) return `<p class="vide">L'équilibre se mesure sur les séances faites.</p>`;
  const cats = [...Object.keys(CATEGORIES), "libre"];
  return `<div class="equilibre">${cats
    .filter((c) => minutes[c] || CIBLE[c])
    .map((c) => {
      const part = ((minutes[c] || 0) / total) * 100;
      const cible = CIBLE[c];
      const lib = c === "libre" ? "Blocs libres" : CATEGORIES[c].libelle;
      const coul = c === "libre" ? "#8a97a3" : CATEGORIES[c].couleur;
      return `<div class="equilibre-ligne"><span class="lib">${esc(lib)}</span><span class="barre"><i style="width:${Math.min(100, part)}%;background:${coul}"></i>${cible ? `<b style="left:${cible}%" title="conseillé : ${cible} %"></b>` : ""}</span><span class="mono val">${Math.round(part)} %${cible ? ` <small>/ ${cible}</small>` : ""}</span></div>`;
    })
    .join("")}<p class="legende">La barre pleine, c'est le temps réellement passé ; le trait, la part conseillée pour des adultes débutants. Un écart n'est pas une faute : c'est une information.</p></div>`;
}
