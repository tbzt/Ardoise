/* Exercice — la fiche, en LECTURE d'abord.

   Ouvrir un exercice ouvrait jusqu'ici un atelier de dessin : trois
   rangées d'outils, treize glyphes, treize icônes de trait sans
   libellé, cinq couleurs — trente-cinq contrôles avant la première
   ligne de texte. Or on ouvre un exercice dix fois pour le relire et
   une fois pour le retoucher. Retrouver n'est pas modifier.

   La fiche montre donc le schéma en grand et les mots ; l'éditeur
   arrive derrière « Modifier », à sa propre adresse, si bien que le
   bouton « précédent » du navigateur en sort. Et la lecture ajoute ce
   qui manquait : dans quelles séances cet exercice a servi, et comment
   ça s'est passé — l'appli le savait déjà, elle ne le disait nulle
   part. */

import { Store, blocDepuisExercice } from "../core/store.js";
import { esc, debounce, statut, formaterDate } from "../core/dom.js";
import { Archive } from "../core/archive.js";
import { CATEGORIES, NIVEAUX } from "../data/catalogue.js";
import { FORMES_TRAVAIL, FAMILLES, fichesParFamille } from "../data/referentiel.js";
import { creerEditeur } from "./editeur.js";
import { choisir } from "./dialogue.js";
import { exporterFicheAtelier, chip, blocTechnique } from "./communs.js";
import { svg } from "./patinoire.js";
import { estFaite, formaterCourt } from "../core/analyse.js";

export const Exercice = {
  afficher(main, id, action) {
    const ex = Store.exercices.get(id);
    const sec = document.createElement("section");
    sec.className = "ecran ecran-fiche";
    main.replaceChildren(sec);
    if (!ex) {
      sec.innerHTML = `<p class="vide">Cet exercice n'existe pas (ou plus). <a href="#/exercices">Retour à la bibliothèque.</a></p>`;
      return { detruire() {} };
    }
    return action === "modifier" ? modifier(sec, ex) : lire(sec, ex);
  },
};

/* ── Lecture ──────────────────────────────────────────────────── */

function lire(sec, ex) {
  const cat = CATEGORIES[ex.categorie] || { libelle: ex.categorie, couleur: "#888" };
  sec.classList.add("fiche-lecture");
  sec.innerHTML = `
    <div class="entete">
      <a class="retour" href="#/exercices">← Bibliothèque</a>
      <span class="spacer"></span>
      <button type="button" data-act="seance">+ Ajouter à une séance…</button>
      <a class="bouton primaire" href="#/exercice/${ex.id}/modifier">✎ Modifier</a>
      <details class="menu">
        <summary class="bouton" aria-label="Autres actions" title="Autres actions">⋯</summary>
        <div class="menu-liste">
          <button type="button" data-act="atelier" title="Une page pour celui qui tient cet atelier">Fiche atelier (PDF)</button>
          <button type="button" data-act="exporter" title="Télécharger cet exercice seul, en JSON">Exporter cet exercice</button>
          <button type="button" data-act="dupliquer">Dupliquer</button>
          <hr />
          <button type="button" class="danger" data-act="supprimer">Supprimer</button>
        </div>
      </details>
    </div>

    <h1 class="fiche-titre">${esc(ex.nom) || "<em>Sans nom</em>"}</h1>
    <p class="fiche-meta">${chip(ex.categorie)} <span>${ex.duree} min</span> <span>${esc(NIVEAUX[ex.niveau] || "")}</span></p>

    <div class="fiche-corps">
      <div class="fiche-schema-lecture">
        <div class="vignette vignette-${ex.schema && ex.schema.vue === "moitie" ? "moitie" : "entiere"}">${svg(ex.schema)}</div>
      </div>
      <div class="fiche-texte">
        ${ex.objectif ? `<p class="mini-titre">Objectif</p><p class="objectif">${esc(ex.objectif)}</p>` : ""}
        ${ex.description ? `<p class="mini-titre">Déroulé</p><p>${esc(ex.description).replace(/\n/g, "<br>")}</p>` : ""}
        ${ex.points_cles && ex.points_cles.length ? `<p class="mini-titre">Points clés</p><ul>${ex.points_cles.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
        ${ex.materiel ? `<p class="materiel"><strong>Matériel :</strong> ${esc(ex.materiel)}</p>` : ""}
        ${ex.variantes ? `<details><summary>Variantes</summary><p>${esc(ex.variantes).replace(/\n/g, "<br>")}</p></details>` : ""}
        ${blocTechnique(ex)}
      </div>
    </div>

    ${historique(ex)}`;

  sec.addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const menu = b.closest("details.menu");
    if (menu) menu.open = false;
    await agir(b.dataset.act, ex, b);
  });

  return { detruire() {} };
}

/* Ce que l'appli savait déjà et ne disait nulle part : dans quelles
   séances cet exercice a servi, avec qui, et ce que le bilan en a dit. */
function historique(ex) {
  const lignes = [];
  for (const se of Store.seances.toutes()) {
    if (!estFaite(se)) continue;
    const bloc = (se.blocs || []).find((b) => b.exerciceId === ex.id);
    if (!bloc) continue;
    const r = se.bilan && se.bilan.blocs && se.bilan.blocs[bloc.id];
    if (r && r.fait === false) continue;
    const mot = r && r.note === 1 ? "à revoir" : r && r.note === 2 ? "correct" : r && r.note === 3 ? "bien" : "";
    lignes.push({ se, mot, commentaire: (r && r.commentaire) || "" });
  }
  if (!lignes.length) return "";
  lignes.sort((a, b) => (b.se.date || "").localeCompare(a.se.date || ""));
  const groupes = [...new Set(lignes.map((l) => l.se.groupe).filter(Boolean))];
  return `
    <section class="fiche-historique">
      <h2>Déjà fait ${groupes.length ? `avec ${groupes.map(esc).join(", ")}` : ""} <small>${lignes.length} fois</small></h2>
      <ul>
        ${lignes
          .slice(0, 8)
          .map(
            (l) =>
              `<li><a href="#/seance/${l.se.id}">${esc(formaterCourt(l.se.date))}${l.se.titre ? ` · ${esc(l.se.titre)}` : ""}</a>${l.mot ? ` <span class="note-${l.mot.replace(/\W/g, "")}">${esc(l.mot)}</span>` : ""}${l.commentaire ? ` <small>${esc(l.commentaire)}</small>` : ""}</li>`,
          )
          .join("")}
      </ul>
    </section>`;
}

/* ── Modification ─────────────────────────────────────────────── */

function modifier(sec, ex) {
  sec.classList.add("fiche-edition");
  // de quoi revenir en arrière : un exercice créé par mégarde
  // s'annule, et une retouche regrettée aussi
  const avant = JSON.parse(JSON.stringify(ex));
  const etaitVierge = !ex.nom && !ex.description && !(ex.schema.objets || []).length;

  sec.innerHTML = `
    <div class="entete">
      <button type="button" class="retour" data-act="annuler">← Annuler</button>
      <span class="spacer"></span>
      <span class="etat" data-etat>Enregistré</span>
      <a class="bouton primaire" href="#/exercice/${ex.id}">Terminé</a>
    </div>
    <input class="nom" name="nom" placeholder="Nom de l'exercice" value="${esc(ex.nom)}" aria-label="Nom de l'exercice">
    <div class="fiche-corps">
      <div class="fiche-schema" data-editeur></div>
      <form class="fiche-form" autocomplete="off">
        <div class="rangee">
          <label>Catégorie
            <select name="categorie">${Object.entries(CATEGORIES)
              .map(([k, c]) => `<option value="${k}"${ex.categorie === k ? " selected" : ""}>${esc(c.libelle)}</option>`)
              .join("")}</select>
          </label>
          <label>Niveau
            <select name="niveau">${Object.entries(NIVEAUX)
              .map(([k, v]) => `<option value="${k}"${ex.niveau === k ? " selected" : ""}>${esc(v)}</option>`)
              .join("")}</select>
          </label>
          <label>Durée (min)
            <input type="number" name="duree" min="1" max="180" value="${esc(ex.duree)}">
          </label>
        </div>
        <label>Objectif <input name="objectif" value="${esc(ex.objectif)}" placeholder="Ce que les joueurs doivent avoir appris à la fin"></label>
        <label>Description <textarea name="description" rows="8" placeholder="Mise en place, déroulé, consignes…">${esc(ex.description)}</textarea></label>
        <label>Points clés <small>un par ligne</small> <textarea name="points_cles" rows="4" placeholder="Genoux fléchis&#10;Regard devant">${esc((ex.points_cles || []).join("\n"))}</textarea></label>
        <label>Corrections <small>erreur → correction, une par ligne</small> <textarea name="corrections" rows="3" placeholder="Dos rond → genoux fléchis, regard loin devant">${esc((ex.corrections || []).join("\n"))}</textarea></label>
        <label>Forme de travail
          <select name="forme"><option value="">—</option>${Object.entries(FORMES_TRAVAIL)
            .map(([k, v]) => `<option value="${k}"${ex.forme === k ? " selected" : ""}>${esc(v)}</option>`)
            .join("")}</select>
        </label>
        <details class="techniques" ${(ex.techniques || []).length ? "open" : ""}>
          <summary>Fiches techniques <small>${(ex.techniques || []).length ? `${ex.techniques.length} rattachée${ex.techniques.length > 1 ? "s" : ""}` : "aucune"}</small></summary>
          ${lesFiches(ex)}
        </details>
        <label>Matériel <input name="materiel" value="${esc(ex.materiel)}" placeholder="Cônes, palets, chasubles…"></label>
        <label>Variantes <textarea name="variantes" rows="3" placeholder="Plus facile, plus dur, pour les gardiens…">${esc(ex.variantes)}</textarea></label>
      </form>
    </div>`;

  const etat = sec.querySelector("[data-etat]");
  const marquer = (txt) => {
    etat.textContent = txt;
    etat.classList.toggle("touche", txt !== "Enregistré");
  };
  const sauver = debounce(() => {
    Store.exercices.sauver(ex);
    marquer("Enregistré");
  }, 400);
  const toucher = () => {
    marquer("Modification…");
    sauver();
  };

  const editeur = creerEditeur(sec.querySelector("[data-editeur]"), ex.schema, {
    onChange(schema) {
      ex.schema = schema;
      toucher();
    },
  });

  sec.querySelector(".nom").addEventListener("input", (e) => {
    ex.nom = e.target.value;
    toucher();
  });
  sec.querySelector(".fiche-form").addEventListener("input", (e) => {
    const c = e.target;
    if (!c.name) return;
    if (c.name === "points_cles") ex.points_cles = decouper(c.value);
    else if (c.name === "corrections") ex.corrections = decouper(c.value);
    else if (c.name === "techniques") {
      ex.techniques = [...sec.querySelectorAll('input[name="techniques"]:checked')].map((x) => x.value);
      const sm = sec.querySelector(".techniques summary small");
      if (sm) sm.textContent = ex.techniques.length ? `${ex.techniques.length} rattachée${ex.techniques.length > 1 ? "s" : ""}` : "aucune";
    } else if (c.name === "duree") ex.duree = Math.max(1, Number(c.value) || 1);
    else ex[c.name] = c.value;
    toucher();
  });

  sec.querySelector("[data-act='annuler']").addEventListener("click", () => {
    if (etaitVierge) {
      Store.exercices.supprimer(ex.id);
      statut("Exercice abandonné.");
      location.hash = "#/exercices";
      return;
    }
    Store.exercices.sauver(avant);
    statut("Modifications annulées.");
    location.hash = `#/exercice/${ex.id}`;
  });

  return {
    detruire() {
      editeur.detruire();
      // ne rien perdre si on quitte pendant le délai d'enregistrement
      if (etat.textContent !== "Enregistré" && Store.exercices.get(ex.id)) Store.exercices.sauver(ex);
    },
  };
}

const decouper = (v) =>
  v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/* Les fiches se pré-filtrent sur la catégorie : le référentiel ne
   couvre que les fondamentaux, le patinage et le maniement, et montrer
   trente-trois cases à un exercice de gardien n'aide personne. Les
   familles vides le disent, plutôt que de disparaître : d'autres
   viendront pour les passes et les tirs. */
function lesFiches(ex) {
  const pertinent = ["patinage", "maniement", "echauffement"].includes(ex.categorie);
  const familles = Object.entries(fichesParFamille());
  return (
    (pertinent
      ? ""
      : `<p class="compte-aide">Le référentiel ne couvre pour l'instant que les fondamentaux, le patinage et le maniement. Rien à rattacher ici — d'autres fiches viendront.</p>`) +
    familles
      .map(
        ([fam, liste]) =>
          `<div class="techniques-famille"><h4>${esc(FAMILLES[fam])}</h4>${liste
            .map(
              (fi) =>
                `<label class="technique"><input type="checkbox" name="techniques" value="${fi.code}" ${(ex.techniques || []).includes(fi.code) ? "checked" : ""}> ${esc(fi.nom)}</label>`,
            )
            .join("")}</div>`,
      )
      .join("")
  );
}

/* ── Les actions, communes aux deux modes ─────────────────────── */

async function agir(quoi, ex, bouton) {
  if (quoi === "atelier") {
    Store.exercices.sauver(ex);
    await exporterFicheAtelier(ex, bouton);
  } else if (quoi === "exporter") {
    Store.exercices.sauver(ex);
    Archive.exporterExercice(ex);
    statut("Exercice exporté.");
  } else if (quoi === "dupliquer") {
    Store.exercices.sauver(ex);
    const copie = Store.exercices.dupliquer(ex.id);
    statut("Exercice dupliqué.");
    location.hash = `#/exercice/${copie.id}/modifier`;
  } else if (quoi === "supprimer") {
    Store.exercices.sauver(ex);
    const copie = JSON.parse(JSON.stringify(ex));
    Store.exercices.supprimer(ex.id);
    statut(`« ${ex.nom || "Exercice"} » supprimé. Les séances qui l'utilisent gardent son titre.`, {
      annuler: () => {
        Store.exercices.installer([copie]);
        statut("Exercice rétabli.");
        location.hash = `#/exercice/${copie.id}`;
      },
    });
    location.hash = "#/exercices";
  } else if (quoi === "seance") {
    Store.exercices.sauver(ex);
    const seances = Store.seances.toutes().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const choix = await choisir({
      titre: "Ajouter à quelle séance ?",
      options: [
        { id: "__nouvelle", libelle: "Nouvelle séance", detail: "créée avec cet exercice" },
        ...seances.map((s) => ({ id: s.id, libelle: s.titre || "Séance sans titre", detail: formaterDate(s.date) })),
      ],
    });
    if (!choix) return;
    const se = choix === "__nouvelle" ? Store.seances.creer() : Store.seances.get(choix);
    if (!se) return;
    se.blocs.push(blocDepuisExercice(ex));
    Store.seances.sauver(se);
    statut(`Ajouté à « ${se.titre || "la séance"} ».`);
    location.hash = `#/seance/${se.id}`;
  }
}
