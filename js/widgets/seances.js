/* Séances — l'écran d'accueil, et la réponse à « qu'est-ce qui vient ? ».

   C'est ici qu'on arrive, et non plus dans la bibliothèque : un coach
   ouvre Ardoise pour préparer ou pour mener sa prochaine séance, pas
   pour parcourir toute la bibliothèque.

   Trois choses que l'écran doit dire sans qu'on ouvre quoi que ce soit :
   — quelle est la prochaine séance, et est-elle prête ;
   — ce qui vient après, pour que « préparer les prochaines semaines »
     devienne un parcours et non une reconstitution ;
   — ce qui reste à faire, et qui se perd sinon.

   UNE COLONNE, PAS UNE GRILLE. C'étaient des cartes à bordure et
   ombre, portant jusqu'à huit atomes d'information pour répondre à
   une question qui en vaut deux. Une poignée de séances ordonnées
   par date n'est pas un catalogue à parcourir : c'est une liste, et
   c'est la DATE qui doit porter la structure. Elle passe donc en
   marge, et le reste se range derrière elle.

   LE GESTE DU JOUR. L'appli sait quel jour on est ; ses boutons
   doivent le dire. Le mardi à 19 h 40, « Bord de glace » n'est pas
   une action parmi d'autres, c'est la seule qui existe — elle devient
   le bouton principal, et seulement ce jour-là. */

import { Store, blocDepuisExercice } from "../core/store.js";
import { esc, formaterJour, formaterDuree, aujourdhuiIso, statut } from "../core/dom.js";
import { mention } from "./communs.js";
import { proposerDeroule } from "../core/brouillon.js";
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
          <button type="button" class="primaire" data-act="nouvelle">Nouvelle séance</button>
        </div>

        <div class="filtres filtres-seances" role="tablist">
          <div class="jeu">
            <button type="button" role="tab" data-onglet="avenir" class="${onglet === "avenir" ? "actif" : ""}" aria-selected="${onglet === "avenir"}">À venir ${mention(avenir.length)}</button>
            <button type="button" role="tab" data-onglet="passees" class="${onglet === "passees" ? "actif" : ""}" aria-selected="${onglet === "passees"}">Passées ${mention(passees.length)}</button>
          </div>
          <span class="spacer"></span>
          ${onglet === "avenir" ? ligneCycle(avenir[0]) : ""}
        </div>

        ${
          toutes.length === 0
            ? `<p class="vide">Aucune séance. Créez-en une : la proposition de déroulé la remplit d'un coup, et il n'y a plus qu'à retoucher.</p>`
            : liste.length === 0
              ? `<p class="vide">${onglet === "avenir" ? "Rien à venir. La prochaine séance se crée avec le bouton en haut." : "Aucune séance passée pour l'instant."}</p>`
              : `<div class="spine">${liste.map((s) => rangee(s, onglet === "passees")).join("")}</div>`
        }

        ${aFaire(toutes, avenir)}`;
    };

    sec.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "nouvelle") {
        const se = Store.seances.creer();
        location.hash = `#/seance/${se.id}`;
      } else if (b.dataset.act === "proposer" && b.dataset.id) {
        proposerPour(b.dataset.id);
      } else if (b.dataset.act === "reprendre") {
        reprendre(b.dataset.seance, b.dataset.exercice);
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

/* ── Deux gestes que l'écran peut rendre lui-même ─────────────── */

/* Un déroulé vide porte le geste qui le remplit : on n'envoie pas le
   coach ouvrir la séance pour y trouver un bouton. */
function proposerPour(id) {
  const se = Store.seances.get(id);
  if (!se) return;
  const r = proposerDeroule(se);
  se.blocs = r.blocs;
  if (!se.objectif && r.objectif) se.objectif = r.objectif;
  Store.seances.sauver(se);
  statut(`Déroulé proposé pour le ${formaterCourt(se.date)} — à retoucher.`, {
    annuler: () => {
      se.blocs = [];
      Store.seances.sauver(se);
    },
  });
}

/* « À revoir, et dans aucune séance à venir » : le geste qui comble
   ce manque est de le remettre au programme, pas d'aller consulter
   une fiche de groupe. */
function reprendre(seanceId, exerciceId) {
  const se = Store.seances.get(seanceId);
  const ex = Store.exercices.get(exerciceId);
  if (!se || !ex) return;
  const bloc = blocDepuisExercice(ex);
  se.blocs.push(bloc);
  Store.seances.sauver(se);
  statut(`« ${ex.nom} » ajouté à la séance du ${formaterCourt(se.date)}.`, {
    annuler: () => {
      se.blocs = se.blocs.filter((b) => b.id !== bloc.id);
      Store.seances.sauver(se);
    },
  });
}

/* ── L'état d'une séance, lisible sans l'ouvrir ───────────────── */

/* Le TON ne sert qu'à ce qui appelle un geste : « prête » se dit en
   vert parce que c'est une bonne nouvelle qu'on cherche du regard,
   le reste se tait. */
function etat(s) {
  const total = Store.dureeSeance(s);
  const glace = Number(s.duree_glace) || 0;
  if (!s.blocs.length) return { mot: "déroulé vide", ton: "attire" };
  if (glace && total > glace) return { mot: `dépasse de ${formaterDuree(total - glace)}`, ton: "alerte" };
  if (estFaite(s) && !(s.bilan && s.bilan.fait)) return { mot: "bilan à faire", ton: "tiede" };
  if (estFaite(s)) return { mot: s.bilan.note ? `${"★".repeat(s.bilan.note)}` : "bilan fait", ton: "" };
  return { mot: "prête", ton: "bien" };
}

/* ── Une rangée ───────────────────────────────────────────────── */

function rangee(s, passee) {
  const e = etat(s);
  const total = Store.dureeSeance(s);
  const aujourdhui = !passee && s.date === aujourdhuiIso();

  const meta = [
    s.groupe ? esc(s.groupe) : "",
    s.blocs.length ? `${s.blocs.length} bloc${s.blocs.length > 1 ? "s" : ""}` : "",
    s.blocs.length ? `${formaterDuree(total)}${s.duree_glace ? ` sur ${formaterDuree(s.duree_glace)}` : ""}` : "",
  ]
    .filter(Boolean)
    .map((x) => mention(x))
    .concat(mention(e.mot, e.ton))
    .join(`<span class="sep">·</span>`);

  return `
    <article class="rang ${aujourdhui ? "aujourdhui" : ""} ${passee ? "passee" : ""}">
      <p class="quand">
        ${aujourdhui ? `<span class="jour">Aujourd'hui</span>` : `<span class="jour">${esc(formaterJour(s.date))}</span>`}
        ${aujourdhui ? `${esc(formaterJour(s.date))} · ` : ""}${s.heure ? esc(s.heure.replace(":", " h ")) : ""}
      </p>
      <div class="quoi">
        <h3><a href="#/seance/${s.id}">${esc(s.titre) || "Séance sans titre"}</a></h3>
        <p class="ligne-meta">${meta}</p>
        ${s.objectif && !passee ? `<p class="objectif">${esc(s.objectif)}</p>` : ""}
        <p class="gestes">${gestes(s, aujourdhui, passee)}</p>
      </div>
    </article>`;
}

/* Un seul geste est primaire, et il dépend du jour. */
function gestes(s, aujourdhui, passee) {
  if (passee || estFaite(s)) {
    const fait = s.bilan && s.bilan.fait;
    return `<a class="${fait ? "lien" : "bouton primaire"}" href="#/seance/${s.id}/bilan">${fait ? "Voir le bilan" : "Faire le bilan"}</a>
            <a class="lien" href="#/seance/${s.id}">Revoir le déroulé</a>`;
  }
  if (!s.blocs.length) {
    return `<a class="lien" href="#/seance/${s.id}">Préparer</a>
            <button type="button" class="lien" data-act="proposer" data-id="${s.id}" title="Un déroulé complet calé sur le temps de glace et l'historique du groupe, à retoucher">✦ Proposer un déroulé</button>`;
  }
  return aujourdhui
    ? `<a class="bouton primaire" href="#/seance/${s.id}/glace" title="La séance vue du banc">Bord de glace</a>
       <a class="lien" href="#/seance/${s.id}">Préparer</a>`
    : `<a class="lien" href="#/seance/${s.id}">Préparer</a>
       <a class="lien" href="#/seance/${s.id}/glace" title="La séance vue du banc">Bord de glace</a>`;
}

/* ── Le cycle en cours ────────────────────────────────────────── */

/* C'était une manchette encadrée en haut de l'écran. C'est du
   contexte : ça se range en fin de ligne de filtres, en gris. */
function ligneCycle(prochaine) {
  if (!prochaine || !prochaine.groupeId) return "";
  const g = Store.groupes.get(prochaine.groupeId);
  const cy = g && cycleCourant(g, prochaine.date);
  if (!cy) return "";
  const dans = Store.seances
    .toutes()
    .filter((s) => s.groupeId === g.id && s.date >= (cy.debut || "") && s.date <= (cy.fin || "9999"));
  const faites = dans.filter(estFaite).length;
  return `
    <p class="ligne-cycle">
      Cycle <b>« ${esc(cy.nom || "en cours")} »</b><span class="sep">·</span>${faites} sur ${dans.length}<span class="sep">·</span>jusqu'au ${esc(formaterCourt(cy.fin))}<span class="sep">·</span><a class="lien" href="#/groupe/${g.id}">le groupe</a>
    </p>`;
}

/* ── À faire ──────────────────────────────────────────────────── */

/* Le seul endroit où l'appli interpelle le coach. Trois motifs, pas un
   de plus, et chacun porte le geste qui le règle — le geste lui-même,
   pas un lien vers l'écran où il se trouve. */
function aFaire(toutes, avenir) {
  const lignes = [];

  for (const s of toutes.filter((s) => estFaite(s) && !(s.bilan && s.bilan.fait)).slice(-3)) {
    lignes.push(
      `<li><span>${mention("Bilan manquant", "tiede")}<span class="sep">·</span>${esc(formaterCourt(s.date))}${s.titre ? `<span class="sep">·</span>${esc(s.titre)}` : ""}</span><a class="lien" href="#/seance/${s.id}/bilan">Faire le bilan</a></li>`,
    );
  }

  for (const s of avenir.filter((s) => !s.blocs.length).slice(0, 2)) {
    lignes.push(
      `<li><span>${mention("Déroulé vide", "attire")}<span class="sep">·</span>${esc(formaterCourt(s.date))}${s.titre ? `<span class="sep">·</span>${esc(s.titre)}` : ""}</span><button type="button" class="lien" data-act="proposer" data-id="${s.id}">✦ Proposer un déroulé</button></li>`,
    );
  }

  // ce que le dernier bilan a marqué « à revoir » et qu'aucune séance à
  // venir ne reprend : c'est exactement ce qui se perd d'une semaine sur
  // l'autre, et l'appli est la seule à pouvoir s'en souvenir
  for (const g of Store.groupes.tous()) {
    const revoir = aRevoir(seancesFaites(g.id), 2);
    if (!revoir.length) continue;
    const suivantes = avenir.filter((s) => s.groupeId === g.id);
    const prevus = new Set(suivantes.flatMap((s) => (s.blocs || []).map((b) => b.exerciceId).filter(Boolean)));
    const oublies = revoir.filter((r) => r.exerciceId && !prevus.has(r.exerciceId));
    if (!oublies.length) continue;
    const cible = suivantes[0];
    const noms = [...new Set(oublies.map((r) => r.titre))].slice(0, 3).map(esc).join(" · ");
    lignes.push(
      `<li><span>${mention("↻ À revoir", "alerte")} avec ${esc(g.nom || "ce groupe")}, dans aucune séance à venir<span class="sep">·</span>${noms}</span>${
        cible
          ? `<button type="button" class="lien" data-act="reprendre" data-seance="${cible.id}" data-exercice="${oublies[0].exerciceId}" title="Ajouter « ${esc(oublies[0].titre)} » au déroulé">Le mettre au ${esc(formaterCourt(cible.date))}</button>`
          : `<a class="lien" href="#/groupe/${g.id}">Voir le groupe</a>`
      }</li>`,
    );
  }

  if (!lignes.length) return "";
  return `<section class="a-faire"><h2>À faire</h2><ul>${lignes.join("")}</ul></section>`;
}
