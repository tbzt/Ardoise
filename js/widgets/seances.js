/* Séances — l'écran d'accueil, et la réponse à « qu'est-ce qui vient ? ».

   C'est ici qu'on arrive désormais, et non plus dans la bibliothèque :
   un coach ouvre Ardoise pour préparer ou pour mener sa prochaine
   séance, pas pour parcourir cent soixante-sept exercices. La
   bibliothèque est une ressource où l'on pioche ; elle ne pouvait pas
   être la porte d'entrée.

   Trois choses que l'écran doit dire sans qu'on ouvre quoi que ce soit :
   — quelle est la prochaine séance, et est-elle prête ;
   — ce qui vient après, pour que « préparer les prochaines semaines »
     devienne un parcours et non une reconstitution ;
   — ce qui reste à faire, et qui se perd sinon : un bilan qu'on n'a pas
     rempli, un déroulé resté vide, un point à revoir qu'aucune séance à
     venir ne reprend.

   Le dernier point est le seul endroit de l'appli où l'on interpelle le
   coach. Il est donc court, et chaque ligne porte le geste qui la
   règle. */

import { Store } from "../core/store.js";
import { esc, formaterDate, formaterDuree } from "../core/dom.js";
import { estFaite, aRevoir, seancesFaites, cycleCourant, formaterCourt } from "../core/analyse.js";

let onglet = "avenir";

export const Seances = {
  afficher(main) {
    const sec = document.createElement("section");
    sec.className = "ecran ecran-liste ecran-seances";
    main.replaceChildren(sec);

    const rendre = () => {
      const toutes = Store.seances.toutes();
      const avenir = toutes.filter((s) => !estFaite(s)).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      const passees = toutes.filter(estFaite).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      const liste = onglet === "avenir" ? avenir : passees;

      sec.innerHTML = `
        <div class="entete">
          <h1>Séances</h1>
          <span class="spacer"></span>
          <button type="button" class="primaire" data-act="nouvelle">+ Nouvelle séance</button>
        </div>

        <div class="onglets" role="tablist">
          <button type="button" role="tab" data-onglet="avenir" class="${onglet === "avenir" ? "actif" : ""}" aria-selected="${onglet === "avenir"}">À venir <span class="compte">${avenir.length}</span></button>
          <button type="button" role="tab" data-onglet="passees" class="${onglet === "passees" ? "actif" : ""}" aria-selected="${onglet === "passees"}">Passées <span class="compte">${passees.length}</span></button>
        </div>

        ${onglet === "avenir" ? bandeauCycle(avenir[0]) : ""}

        ${
          toutes.length === 0
            ? `<p class="vide">Aucune séance. Créez-en une : la proposition de déroulé la remplit d'un coup, et il n'y a plus qu'à retoucher.</p>`
            : liste.length === 0
              ? `<p class="vide">${onglet === "avenir" ? "Rien à venir. La prochaine séance se crée avec le bouton en haut." : "Aucune séance passée pour l'instant."}</p>`
              : `<div class="cartes cartes-seances">${liste.map((s, i) => carte(s, onglet === "avenir" && i === 0)).join("")}</div>`
        }

        ${aFaire(toutes, avenir)}`;
    };

    sec.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "nouvelle") {
        const se = Store.seances.creer();
        location.hash = `#/seance/${se.id}`;
      } else if (b.dataset.onglet) {
        onglet = b.dataset.onglet;
        rendre();
      }
    });

    const off = Store.abonner(rendre);
    rendre();
    return { detruire: off };
  },
};

/* ── L'état d'une séance, lisible sans l'ouvrir ───────────────── */

function etat(s) {
  const total = Store.dureeSeance(s);
  const glace = Number(s.duree_glace) || 0;
  if (!s.blocs.length) return { mot: "déroulé vide", classe: "etat-vide" };
  if (glace && total > glace) return { mot: `dépasse de ${formaterDuree(total - glace)}`, classe: "etat-alerte" };
  if (estFaite(s) && !(s.bilan && s.bilan.fait)) return { mot: "bilan à faire", classe: "etat-attente" };
  if (estFaite(s)) return { mot: `★ ${s.bilan.note || "—"}`, classe: "etat-ok" };
  return { mot: "prête", classe: "etat-ok" };
}

/* La carte n'est pas un <a> : elle en contient plusieurs, et un lien
   dans un lien est du HTML invalide — le parseur ferme le premier au
   second et la carte se disloque. C'est donc un <article> avec un lien
   de couverture étendu par CSS, et les autres posés au-dessus. */
function carte(s, prochaine) {
  const total = Store.dureeSeance(s);
  const e = etat(s);
  const faite = estFaite(s);
  return `
    <article class="carte carte-seance ${prochaine ? "prochaine" : ""}">
      <p class="date">${esc(formaterDate(s.date))}${s.heure ? ` · ${esc(s.heure)}` : ""}${prochaine ? `<span class="marqueur">prochaine</span>` : ""}</p>
      <h3><a class="couverture" href="#/seance/${s.id}">${esc(s.titre) || "<em>Séance sans titre</em>"}</a></h3>
      <p class="meta">
        ${s.groupe ? `<span>${esc(s.groupe)}</span>` : ""}
        <span>${s.blocs.length} bloc${s.blocs.length > 1 ? "s" : ""}</span>
        <span>${formaterDuree(total)}${s.duree_glace ? ` / ${formaterDuree(s.duree_glace)}` : ""}</span>
        <span class="etiquette ${e.classe}">${esc(e.mot)}</span>
      </p>
      ${s.objectif ? `<p class="objectif">${esc(s.objectif)}</p>` : ""}
      <p class="carte-pied">
        ${
          faite
            ? `<a class="carte-lien" href="#/seance/${s.id}/glace#bilan">${s.bilan && s.bilan.fait ? "Voir le bilan" : "Faire le bilan"} →</a>`
            : s.blocs.length
              ? `<a class="carte-lien" href="#/seance/${s.id}/glace" title="La séance vue du banc">Bord de glace →</a>`
              : `<a class="carte-lien" href="#/seance/${s.id}">Composer le déroulé →</a>`
        }
      </p>
    </article>`;
}

/* ── Le cycle en cours, en bandeau ────────────────────────────── */

function bandeauCycle(prochaine) {
  if (!prochaine || !prochaine.groupeId) return "";
  const g = Store.groupes.get(prochaine.groupeId);
  const cy = g && cycleCourant(g, prochaine.date);
  if (!cy) return "";
  const dans = Store.seances
    .toutes()
    .filter((s) => s.groupeId === g.id && s.date >= (cy.debut || "") && s.date <= (cy.fin || "9999"));
  const faites = dans.filter(estFaite).length;
  return `
    <p class="bandeau-cycle">
      <strong>Cycle « ${esc(cy.nom || "en cours")} »</strong>
      <span>${esc(formaterCourt(cy.debut))} → ${esc(formaterCourt(cy.fin))}</span>
      <span>${faites} séance${faites > 1 ? "s" : ""} sur ${dans.length}</span>
      ${cy.note ? `<span class="note">${esc(cy.note)}</span>` : ""}
      <a href="#/groupe/${g.id}">voir le groupe →</a>
    </p>`;
}

/* ── À faire ──────────────────────────────────────────────────── */

/* Le seul endroit où l'appli interpelle le coach. Trois motifs, pas un
   de plus, et chacun porte le geste qui le règle. Un rappel qu'on ne
   peut pas traiter d'un clic n'a rien à faire ici. */
function aFaire(toutes, avenir) {
  const lignes = [];

  for (const s of toutes.filter((s) => estFaite(s) && !(s.bilan && s.bilan.fait)).slice(-3)) {
    lignes.push(
      `<li><span>Bilan manquant — ${esc(formaterCourt(s.date))}${s.titre ? ` · ${esc(s.titre)}` : ""}</span><a class="bouton" href="#/seance/${s.id}/glace#bilan">Faire le bilan</a></li>`,
    );
  }

  const vides = avenir.filter((s) => !s.blocs.length);
  for (const s of vides.slice(0, 2)) {
    lignes.push(
      `<li><span>Déroulé vide — ${esc(formaterCourt(s.date))}${s.titre ? ` · ${esc(s.titre)}` : ""}</span><a class="bouton" href="#/seance/${s.id}">Préparer</a></li>`,
    );
  }

  // ce que le dernier bilan a marqué « à revoir » et qu'aucune séance à
  // venir ne reprend : c'est exactement ce qui se perd d'une semaine sur
  // l'autre, et l'appli est la seule à pouvoir s'en souvenir
  for (const g of Store.groupes.tous()) {
    const revoir = aRevoir(seancesFaites(g.id), 2);
    if (!revoir.length) continue;
    const prevus = new Set(
      avenir.filter((s) => s.groupeId === g.id).flatMap((s) => (s.blocs || []).map((b) => b.exerciceId).filter(Boolean)),
    );
    const oublies = [...new Set(revoir.filter((r) => r.exerciceId && !prevus.has(r.exerciceId)).map((r) => r.titre))];
    if (!oublies.length) continue;
    lignes.push(
      `<li><span>À revoir avec ${esc(g.nom || "ce groupe")}, dans aucune séance à venir : ${oublies.slice(0, 3).map(esc).join(" · ")}</span><a class="bouton" href="#/groupe/${g.id}">Voir le groupe</a></li>`,
    );
  }

  if (!lignes.length) return "";
  return `<section class="a-faire"><h2>À faire</h2><ul>${lignes.join("")}</ul></section>`;
}
