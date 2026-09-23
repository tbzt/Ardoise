/* Progression — la mémoire d'un groupe, rangée par question.

   L'écran était un rouleau de huit sections dans un ordre fixe :
   chiffres, conseils, pour la prochaine séance, équilibre, cycles,
   trente-trois fiches techniques, séances, exercices faits, jamais
   faits. La liste des séances — ce qu'on vient chercher neuf fois sur
   dix — arrivait en septième position, après une matrice de trente-
   trois lignes qui ne menait nulle part.

   Trois onglets, et ce sont trois questions :

   — CE QUI VIENT : où j'en suis dans mon cycle, à quoi je fais
     attention, qu'est-ce qui est prévu. C'est l'onglet de la
     préparation, donc celui qui s'ouvre.
   — CE QU'ON A FAIT : combien, quoi, comment c'est équilibré.
   — CE QU'ON N'A PAS FAIT : et c'est le seul qui ait changé de nature.
     La matrice des techniques était un tableau de bord ; elle devient
     un point de départ, où chaque manque porte le geste qui le comble.

   Les « conseils » disparaissent en tant que liste. Chaque constat
   migre là où il sert, et le bruit part : « 126 exercices de la
   bibliothèque n'ont jamais été faits » n'est pas un conseil, c'est une
   statistique, et une analyse d'équilibre sur une seule séance est du
   bruit affiché comme un signal. */

import { Store, cycleVierge, GLACE_PAR_DEFAUT } from "../core/store.js";
import { proposerDeroule } from "../core/brouillon.js";
import { esc, debounce, statut, formaterDate, formaterDuree } from "../core/dom.js";
import { CATEGORIES, NIVEAUX } from "../data/catalogue.js";
import { pastille, mention } from "./communs.js";
import { choisir } from "./dialogue.js";
import { panneauCoachs, badgePartage, nomDuProprietaire } from "./partage.js";
import { FICHES, FAMILLES, fichesParFamille } from "../data/referentiel.js";
import { CIBLE, seancesDuGroupe, seancesFaites, estFaite, repartition, usageExercices, aRevoir, noteMoyenne, blocsFaits, formaterCourt, cycleCourant } from "../core/analyse.js";

/* Sous ce seuil, une analyse d'équilibre ne mesure rien : elle décrit
   une séance et la présente comme une tendance. */
const SEUIL_EQUILIBRE = 3;

const etoiles = (n) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "");
const moy = (l) => (l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0);

let onglet = "vient";

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
      const avenir = toutes.filter((s) => !estFaite(s)).sort((a, b) => (a.date || "").localeCompare(b.date || ""));

      sec.innerHTML = `
        <div class="entete">
          <a class="retour" href="#/groupes">← Groupes</a>
          <span class="spacer"></span>
          <span class="etat" data-etat>Enregistré</span>
          <button type="button" class="primaire" data-act="proposer-seance" title="Une séance proposée d'après l'historique, à retoucher">✦ Proposer une séance</button>
          ${badgePartage(g)}
          <details class="menu">
            <summary class="bouton" aria-label="Autres actions" title="Autres actions">⋯</summary>
            <div class="menu-liste">
              <button type="button" data-act="nouvelle-seance">+ Séance vide</button>
              <button type="button" data-act="rattacher">Rattacher une séance…</button>
              <button type="button" data-act="reglages">⚙ Réglages du groupe</button>
              <hr />
              <button type="button" class="danger" data-act="supprimer">Supprimer le groupe</button>
            </div>
          </details>
        </div>

        <h1 class="fiche-titre">${esc(g.nom) || "<em>Groupe sans nom</em>"}</h1>
        <p class="fiche-meta">${[NIVEAUX[g.niveau] || "", `${g.duree_glace || GLACE_PAR_DEFAUT} min de glace`, g.description].filter(Boolean).map(esc).join(" · ")}</p>
        ${nomDuProprietaire(g.id) ? `<p class="avis">Ce groupe vous a été confié. Vous le préparez et le menez comme les vôtres ; son propriétaire garde la main sur qui y participe.</p>` : ""}

        <div class="onglets" role="tablist">
          <button type="button" role="tab" data-onglet="vient" class="${onglet === "vient" ? "actif" : ""}">Ce qui vient</button>
          <button type="button" role="tab" data-onglet="fait" class="${onglet === "fait" ? "actif" : ""}">Ce qu'on a fait</button>
          <button type="button" role="tab" data-onglet="pas" class="${onglet === "pas" ? "actif" : ""}">Ce qu'on n'a pas fait</button>
        </div>

        ${onglet === "vient" ? ceQuiVient(g, faites, avenir) : onglet === "fait" ? ceQuOnAFait(g, faites, tri) : ceQuOnNaPasFait(g, faites)}`;
    };

    /* ── L'enregistrement ────────────────────────────────────── */

    const etatEl = () => sec.querySelector("[data-etat]");
    const marquerEtat = (t) => {
      const el = etatEl();
      if (!el) return;
      el.textContent = t;
      el.classList.toggle("touche", t !== "Enregistré");
    };
    const sauver = debounce(() => {
      Store.groupes.sauver(g);
      // garder le nom en texte sur les séances : impression et PDF le lisent
      for (const s of seancesDuGroupe(g.id)) {
        if (s.groupe !== g.nom) {
          s.groupe = g.nom;
          Store.seances.sauver(s);
        }
      }
      marquerEtat("Enregistré");
    }, 500);

    sec.addEventListener("input", (e) => {
      const c = e.target;
      if (!c.name) return;
      const art = c.closest("[data-cycle]");
      if (art) {
        const cy = (g.cycles || []).find((x) => x.id === art.dataset.cycle);
        if (!cy) return;
        if (c.name === "categories") {
          cy.categories = [...art.querySelectorAll('input[name="categories"]:checked')].map((x) => x.value);
          if (c.closest("label")) c.closest("label").classList.toggle("actif", c.checked);
        } else if (c.name === "techniques") {
          cy.techniques = [...art.querySelectorAll('input[name="techniques"]:checked')].map((x) => x.value);
          const sm = art.querySelector(".techniques summary small");
          if (sm) sm.textContent = cy.techniques.length || "aucune";
        } else cy[c.name] = c.value;
        const titre = art.querySelector("summary strong");
        if (titre && c.name === "nom") titre.textContent = cy.nom || "Cycle sans nom";
      } else g[c.name] = c.value;
      marquerEtat("Modification…");
      sauver();
    });

    /* ── Les gestes ──────────────────────────────────────────── */

    sec.addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const menu = b.closest("details.menu");
      if (menu) menu.open = false;

      if (b.dataset.onglet) {
        onglet = b.dataset.onglet;
        rendre();
      } else if (b.dataset.tri) {
        tri = b.dataset.tri;
        rendre();
      } else if (b.dataset.act === "coachs") {
        Store.groupes.sauver(g);
        await panneauCoachs(g);
        rendre();
      } else if (b.dataset.act === "reglages") {
        await reglages(g);
        sauver();
        rendre();
      } else if (b.dataset.act === "nouveau-cycle") {
        nouveauCycle(g);
        onglet = "vient";
        rendre();
        const inp = sec.querySelector(`[data-cycle] input[name="nom"]`);
        if (inp) inp.focus();
      } else if (b.dataset.act === "supprimer-cycle") {
        const art = b.closest("[data-cycle]");
        const i = (g.cycles || []).findIndex((x) => x.id === art.dataset.cycle);
        if (i < 0) return;
        const [cy] = g.cycles.splice(i, 1);
        Store.groupes.sauver(g);
        rendre();
        statut(`Cycle « ${cy.nom || "sans nom"} » supprimé.`, {
          annuler: () => {
            g.cycles.splice(i, 0, cy);
            Store.groupes.sauver(g);
            rendre();
            statut("Cycle rétabli.");
          },
        });
      } else if (b.dataset.act === "proposer-seance") {
        Store.groupes.sauver(g);
        const se = Store.seances.creer({ groupeId: g.id, groupe: g.nom });
        const r = proposerDeroule(se);
        se.blocs = r.blocs;
        se.objectif = r.objectif;
        se.notes = "Brouillon proposé d'après l'historique du groupe. « Autre proposition » dans le déroulé en fait une autre.";
        Store.seances.sauver(se);
        statut("Séance proposée — à retoucher.");
        location.hash = `#/seance/${se.id}`;
      } else if (b.dataset.act === "nouvelle-seance") {
        Store.groupes.sauver(g);
        const se = Store.seances.creer({ groupeId: g.id, groupe: g.nom });
        location.hash = `#/seance/${se.id}`;
      } else if (b.dataset.act === "rattacher") {
        await rattacher(g);
        rendre();
      } else if (b.dataset.act === "supprimer") {
        Store.groupes.sauver(g);
        const copie = JSON.parse(JSON.stringify(g));
        const detachees = seancesDuGroupe(g.id).map((s) => s.id);
        Store.groupes.supprimer(g.id);
        statut(`Groupe « ${g.nom || "sans nom"} » supprimé. Ses ${detachees.length} séance${detachees.length > 1 ? "s sont conservées" : " est conservée"}.`, {
          annuler: () => {
            Store.groupes.installer([copie]);
            for (const id of detachees) {
              const se = Store.seances.get(id);
              if (se && !se.groupeId) {
                se.groupeId = copie.id;
                se.groupe = copie.nom;
                Store.seances.sauver(se);
              }
            }
            statut("Groupe rétabli, séances rattachées.");
            location.hash = `#/groupe/${copie.id}`;
          },
        });
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

/* ── Onglet 1 : ce qui vient ──────────────────────────────────── */

function ceQuiVient(g, faites, avenir) {
  const revoir = aRevoir(faites, 3);
  const retenir = faites.filter((s) => s.bilan && s.bilan.fait && s.bilan.retenir).slice(-1)[0];
  return `
    ${cyclesHtml(g)}

    ${
      revoir.length
        ? `<section class="groupe-section">
             <h2>À revoir <small>d'après les ${Math.min(faites.length, 3)} derniers bilans</small></h2>
             <ul class="revoir">${revoir
               .map(
                 (r) =>
                   `<li>${r.exerciceId && Store.exercices.get(r.exerciceId) ? `<a href="#/exercice/${r.exerciceId}">${esc(r.titre)}</a>` : esc(r.titre)} <small>${esc(formaterCourt(r.date))}${r.commentaire ? ` — ${esc(r.commentaire)}` : ""}</small></li>`,
               )
               .join("")}</ul>
           </section>`
        : ""
    }

    ${
      retenir
        ? `<section class="groupe-section"><h2>Dernier « à retenir » <small>${esc(formaterCourt(retenir.date))}</small></h2><p class="retenir">${esc(retenir.bilan.retenir)}</p></section>`
        : ""
    }

    <section class="groupe-section">
      <h2>Prochaines séances <small>${avenir.length}</small></h2>
      ${
        avenir.length
          ? `<ul class="groupe-seances">${avenir
              .map(
                (s) =>
                  `<li class="a-venir"><a href="#/seance/${s.id}"><span class="date">${esc(formaterDate(s.date, { year: undefined }))}</span><strong>${esc(s.titre) || "Séance sans titre"}</strong></a><span class="meta">${s.blocs.length ? `${formaterDuree(Store.dureeSeance(s))} · prête` : `${mention("déroulé vide", "attire")}`}</span></li>`,
              )
              .join("")}</ul>`
          : `<p class="vide">Rien de prévu. « ✦ Proposer une séance » en compose une d'après l'historique, à retoucher.</p>`
      }
    </section>`;
}

/* ── Onglet 2 : ce qu'on a fait ───────────────────────────────── */

function ceQuOnAFait(g, faites, tri) {
  const { total } = repartition(faites);
  const usage = usageExercices(faites);
  const lignes = [...usage.values()].map((u) => ({ ...u, ex: Store.exercices.get(u.exerciceId) }));
  lignes.sort((a, b) => {
    if (tri === "fois") return b.fois - a.fois || (b.derniere || "").localeCompare(a.derniere || "");
    if (tri === "note") return moy(b.notes) - moy(a.notes);
    return (b.derniere || "").localeCompare(a.derniere || "");
  });

  return `
    <div class="groupe-chiffres">
      <div><strong>${faites.length}</strong><span>séance${faites.length > 1 ? "s" : ""} faite${faites.length > 1 ? "s" : ""}</span></div>
      <div><strong>${formaterDuree(total)}</strong><span>de glace</span></div>
      <div><strong>${usage.size}</strong><span>exercice${usage.size > 1 ? "s" : ""} différent${usage.size > 1 ? "s" : ""}</span></div>
      <div><strong>${etoiles(Math.round(moy(faites.filter((s) => s.bilan && s.bilan.note).map((s) => s.bilan.note)))) || "—"}</strong><span>note moyenne</span></div>
    </div>

    <section class="groupe-section">
      <h2>Équilibre <small>${faites.length >= SEUIL_EQUILIBRE ? `sur les ${Math.min(faites.length, 4)} dernières séances` : ""}</small></h2>
      ${
        faites.length < SEUIL_EQUILIBRE
          ? `<p class="vide">L'équilibre se mesure à partir de ${SEUIL_EQUILIBRE} séances faites — ${faites.length ? `il y en a ${faites.length}` : "il n'y en a aucune"}. Avant, ce n'est pas une tendance, c'est une séance.</p>`
          : equilibre(faites.slice(-4))
      }
    </section>

    <section class="groupe-section">
      <h2>Séances passées <small>${faites.length}</small></h2>
      ${
        faites.length
          ? `<ul class="groupe-seances">${faites
              .slice()
              .reverse()
              .map((s) => {
                const bilan = s.bilan && s.bilan.fait;
                const nm = noteMoyenne(s);
                return `<li class="faite"><a href="#/seance/${s.id}"><span class="date">${esc(formaterDate(s.date, { year: undefined }))}</span><strong>${esc(s.titre) || "Séance sans titre"}</strong></a><span class="meta">${formaterDuree(Store.dureeSeance(s))}${bilan ? ` · ${etoiles(s.bilan.note)}${nm ? ` · blocs ${nm.toFixed(1)}/3` : ""}` : ` · <a href="#/seance/${s.id}/bilan">bilan à faire</a>`}</span></li>`;
              })
              .join("")}</ul>`
          : `<p class="vide">Aucune séance faite pour l'instant.</p>`
      }
    </section>

    <details class="groupe-section">
      <summary><h2>Exercices déjà faits <small>${usage.size}</small></h2></summary>
      <p class="tri">Trier : <button type="button" data-tri="recent" class="${tri === "recent" ? "actif" : ""}">récents</button><button type="button" data-tri="fois" class="${tri === "fois" ? "actif" : ""}">fréquence</button><button type="button" data-tri="note" class="${tri === "note" ? "actif" : ""}">note</button></p>
      ${
        lignes.length
          ? `<table class="usage"><thead><tr><th>Exercice</th><th>Fois</th><th>Dernière</th><th>Temps</th><th>Bilan</th></tr></thead><tbody>${lignes
              .map(
                (u) =>
                  `<tr><td>${u.ex ? `<a href="#/exercice/${u.exerciceId}">${esc(u.titre)}</a> ${pastille(u.ex.categorie)}` : esc(u.titre)}</td><td class="mono">${u.fois}</td><td class="mono">${esc(formaterCourt(u.derniere))}</td><td class="mono">${u.minutes}'</td><td>${noteBlocs(u.notes)}</td></tr>`,
              )
              .join("")}</tbody></table>`
          : `<p class="vide">Rien encore : l'historique se remplit avec les séances faites.</p>`
      }
    </details>`;
}

/* ── Onglet 3 : ce qu'on n'a pas fait ─────────────────────────── */

/* Le seul onglet qui ait changé de nature. Chaque manque y porte le
   geste qui le comble : un lien vers la bibliothèque déjà filtrée, ou
   la création d'un cycle qui vise ces techniques-là. */
function ceQuOnNaPasFait(g, faites) {
  const trois = faites.slice(-3);
  const absentes = [];
  if (trois.length >= 2) {
    for (const cat of Object.keys(CATEGORIES)) {
      if (cat === "gardien" || cat === "retour") continue;
      const presente = trois.some((se) => blocsFaits(se).some((b) => {
        const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
        return ex && ex.categorie === cat;
      }));
      if (!presente) absentes.push(cat);
    }
  }

  const usage = usageExercices(faites);
  const jamais = Store.exercices.tous().filter((e) => !usage.has(e.id));

  return `
    ${
      absentes.length
        ? `<section class="groupe-section">
             <h2>Catégories absentes <small>des ${trois.length} dernières séances</small></h2>
             <ul class="manques">${absentes
               .map((cat) => {
                 const n = jamais.filter((e) => e.categorie === cat).length;
                 return `<li>${pastille(cat)} <span>rien depuis ${trois.length} séances</span><a class="bouton" href="#/exercices">voir ${n} exercice${n > 1 ? "s" : ""} jamais fait${n > 1 ? "s" : ""}</a></li>`;
               })
               .join("")}</ul>
           </section>`
        : ""
    }

    ${techniques(g, faites)}

    <details class="groupe-section">
      <summary><h2>Exercices jamais faits <small>${jamais.length}</small></h2></summary>
      <ul class="jamais">${Object.keys(CATEGORIES)
        .map((cat) => {
          const liste = jamais.filter((e) => e.categorie === cat);
          return liste.length ? `<li>${pastille(cat)} ${liste.map((e) => `<a href="#/exercice/${e.id}">${esc(e.nom)}</a>`).join(" · ")}</li>` : "";
        })
        .join("")}</ul>
    </details>`;
}

/* Le référentiel ne couvre que les fondamentaux, le patinage et le
   maniement : afficher « 10 sur 33 » à côté de l'équilibre laissait
   croire à une mesure globale, alors que ce score ne parle que de
   patinage. On compte donc PAR FAMILLE, on annonce les familles encore
   vides — d'autres viendront pour les passes et les tirs — et le
   dénominateur ne retient que ce qui est atteignable : une fiche
   qu'aucun exercice ne vise ne peut pas se remplir, et c'est une
   invitation à en écrire un, pas une lacune du coach. */
function techniques(g, faites) {
  const compte = {};
  for (const se of faites) {
    const vus = new Set();
    for (const b of blocsFaits(se)) {
      const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
      for (const code of (ex && ex.techniques) || []) vus.add(code);
    }
    for (const code of vus) compte[code] = (compte[code] || 0) + 1;
  }
  const visees = new Set(Store.exercices.tous().flatMap((e) => e.techniques || []));
  const parFamille = fichesParFamille();
  const couvertes = FICHES.filter((f) => compte[f.code]).length;
  const atteignables = FICHES.filter((f) => visees.has(f.code)).length;
  const orphelines = FICHES.filter((f) => !visees.has(f.code));

  return `
    <section class="groupe-section">
      <h2>Techniques travaillées <small>${couvertes} sur ${atteignables} accessibles dans votre bibliothèque</small></h2>
      <div class="familles">
        ${Object.entries(parFamille)
          .map(([fam, liste]) => {
            const acc = liste.filter((f) => visees.has(f.code));
            const vues = acc.filter((f) => compte[f.code]).length;
            const manquantes = acc.filter((f) => !compte[f.code]);
            return `
              <div class="famille">
                <h4>${esc(FAMILLES[fam])} <span class="mono">${vues} / ${acc.length}</span></h4>
                <div class="jauge"><i style="width:${acc.length ? (vues / acc.length) * 100 : 0}%"></i></div>
                ${
                  manquantes.length
                    ? `<ul class="manquantes">${manquantes.map((f) => `<li class="${f.socle ? "" : "avance"}">${esc(f.nom)}${f.socle ? "" : ` <small>avancé</small>`}</li>`).join("")}</ul>`
                    : `<p class="tout-vu">Toutes travaillées.</p>`
                }
              </div>`;
          })
          .join("")}
      </div>
      <p class="legende">
        Les fiches marquées « avancé » sont celles qu'on garde pour plus tard : patinage arrière,
        freinages arrière, pivots. Le référentiel ne couvre pour l'instant que les fondamentaux,
        le patinage et le maniement — <strong>pas encore de fiche pour les passes ni les tirs</strong>.
        ${orphelines.length ? `<br>${orphelines.length} fiche${orphelines.length > 1 ? "s ne sont visées" : " n'est visée"} par aucun exercice de votre bibliothèque : ${orphelines.map((f) => esc(f.nom)).join(", ")}.` : ""}
      </p>
      <p><button type="button" data-act="nouveau-cycle">+ Construire un cycle pour en viser</button></p>
    </section>`;
}

/* ── Les cycles ───────────────────────────────────────────────── */

function nouveauCycle(g) {
  if (!Array.isArray(g.cycles)) g.cycles = [];
  const dernier = g.cycles[g.cycles.length - 1];
  const cy = cycleVierge();
  const d = new Date(dernier && dernier.fin ? dernier.fin : Date.now());
  if (dernier && dernier.fin) d.setDate(d.getDate() + 1);
  const p = (n) => String(n).padStart(2, "0");
  cy.debut = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const f = new Date(d);
  f.setDate(f.getDate() + 34);
  cy.fin = `${f.getFullYear()}-${p(f.getMonth() + 1)}-${p(f.getDate())}`;
  g.cycles.push(cy);
  Store.groupes.sauver(g);
}

/* Un cycle sait maintenant où il en est : combien de ses séances sont
   faites, et lesquelles de ses techniques visées ont été touchées. Il
   était jusqu'ici une note dans un repli, sans lien avec le travail
   réel — donc sans moyen de savoir s'il tenait. */
function cyclesHtml(g) {
  const cycles = (g.cycles || []).slice().sort((a, b) => (a.debut || "").localeCompare(b.debut || ""));
  const courant = cycleCourant(g);
  if (!cycles.length) {
    return `<section class="groupe-section"><h2>Cycles</h2><p class="vide">Aucun cycle. Un cycle, c'est quatre à six semaines avec un thème — « freiner des deux côtés », « passes en mouvement » — des catégories à pousser et des techniques à viser : le brouillon de séance s'y cale.</p><p><button type="button" data-act="nouveau-cycle">+ Nouveau cycle</button></p></section>`;
  }
  return `
    <section class="groupe-section">
      <h2>Cycles <small>un thème pour quelques semaines</small></h2>
      <div class="cycles">
        ${cycles.map((cy) => unCycle(g, cy, courant && courant.id === cy.id)).join("")}
      </div>
      <p><button type="button" data-act="nouveau-cycle">+ Nouveau cycle</button></p>
    </section>`;
}

function unCycle(g, cy, enCours) {
  const dans = seancesDuGroupe(g.id).filter((s) => s.date && s.date >= (cy.debut || "") && s.date <= (cy.fin || "9999-12-31"));
  const faites = dans.filter(estFaite);
  const touchees = new Set();
  for (const se of faites) {
    for (const b of blocsFaits(se)) {
      const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
      for (const code of (ex && ex.techniques) || []) touchees.add(code);
    }
  }
  const visees = cy.techniques || [];
  return `
    <details class="cycle ${enCours ? "en-cours" : ""}" data-cycle="${cy.id}" ${enCours ? "open" : ""}>
      <summary>
        <strong>${esc(cy.nom) || "Cycle sans nom"}</strong>
        <span class="meta">${esc(formaterCourt(cy.debut))} → ${esc(formaterCourt(cy.fin))}${enCours ? " · en cours" : ""}</span>
        <span class="cycle-avance"><span class="jauge"><i style="width:${dans.length ? (faites.length / dans.length) * 100 : 0}%"></i></span> ${faites.length} / ${dans.length} séance${dans.length > 1 ? "s" : ""}</span>
      </summary>
      <div class="cycle-corps">
        ${
          visees.length
            ? `<p class="mini-titre">Techniques visées</p>
               <ul class="visees">${visees
                 .map((code) => {
                   const fi = FICHES.find((f) => f.code === code);
                   const n = touchees.has(code);
                   return `<li class="${n ? "vu" : "pas-vu"}">${n ? "✓" : "—"} ${esc(fi ? fi.nom : code)}</li>`;
                 })
                 .join("")}</ul>`
            : ""
        }
        <div class="rangee">
          <label>Thème <input name="nom" value="${esc(cy.nom)}" placeholder="Freiner des deux côtés"></label>
          <label>Du <input type="date" name="debut" value="${esc(cy.debut)}"></label>
          <label>Au <input type="date" name="fin" value="${esc(cy.fin)}"></label>
        </div>
        <p class="mini-titre">Catégories à pousser</p>
        <div class="pastilles">${Object.entries(CATEGORIES)
          .filter(([k]) => k !== "gardien")
          .map(([k, c]) => `<label class="pastille pastille-case ${(cy.categories || []).includes(k) ? "actif" : ""}" style="--c:${c.couleur}"><input type="checkbox" name="categories" value="${k}" ${(cy.categories || []).includes(k) ? "checked" : ""}> ${esc(c.libelle)}</label>`)
          .join("")}</div>
        <details class="techniques"><summary>Techniques à viser <small>${visees.length || "aucune"}</small></summary>
          ${Object.entries(fichesParFamille())
            .map(([fam, liste]) => `<div class="techniques-famille"><h4>${esc(FAMILLES[fam])}</h4>${liste.map((fi) => `<label class="technique"><input type="checkbox" name="techniques" value="${fi.code}" ${visees.includes(fi.code) ? "checked" : ""}> ${esc(fi.nom)}</label>`).join("")}</div>`)
            .join("")}
        </details>
        <label>Note <input name="note" value="${esc(cy.note || "")}" placeholder="Ce qu'on veut voir à la fin du cycle"></label>
        <div class="cycle-pied"><button type="button" class="danger" data-act="supprimer-cycle">Supprimer ce cycle</button></div>
      </div>
    </details>`;
}

/* ── Le reste ─────────────────────────────────────────────────── */

function noteBlocs(notes) {
  if (!notes.length) return mention("—");
  const m = moy(notes);
  const lib = m >= 2.5 ? "bien" : m >= 1.75 ? "correct" : "à revoir";
  return `${mention(lib, m >= 2.5 ? "bien" : m >= 1.75 ? "" : "alerte")} ${mention(`${m.toFixed(1)}/3 sur ${notes.length}`)}`;
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

async function rattacher(g) {
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
}

/* Nom, niveau, description : de l'administration, pas de la mémoire.
   Ça encombrait le haut de l'écran entre le titre et les chiffres. */
function reglages(g) {
  return new Promise((resoudre) => {
    const d = document.createElement("dialog");
    d.className = "dialogue dialogue-compte";
    d.innerHTML = `
      <form method="dialog" class="compte-forme">
        <h2>Réglages du groupe</h2>
        <label>Nom <input name="nom" value="${esc(g.nom)}" placeholder="Adultes débutants, U11, Loisir mardi…"></label>
        <label>Niveau <select name="niveau">${Object.entries(NIVEAUX)
          .map(([k, v]) => `<option value="${k}"${g.niveau === k ? " selected" : ""}>${esc(v)}</option>`)
          .join("")}</select></label>
        <label>Description <input name="description" value="${esc(g.description)}" placeholder="Effectif, créneau, ce qui caractérise ce groupe…"></label>
        <label>Temps de glace <input type="number" name="duree_glace" min="5" max="240" value="${esc(g.duree_glace || GLACE_PAR_DEFAUT)}">
          <small>Le créneau habituel, en minutes. Toute nouvelle séance du groupe part de là.</small></label>
        <div class="dialogue-pied"><button type="submit" value="" class="primaire">Terminé</button></div>
      </form>`;
    d.addEventListener("input", (e) => {
      if (!e.target.name) return;
      g[e.target.name] = e.target.name === "duree_glace" ? Math.max(5, Number(e.target.value) || GLACE_PAR_DEFAUT) : e.target.value;
    });
    d.addEventListener("close", () => {
      d.remove();
      resoudre();
    });
    document.body.appendChild(d);
    d.showModal();
  });
}
