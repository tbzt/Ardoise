/* Exercice — la fiche : le schéma à gauche, les mots à droite.
   Tout s'enregistre tout seul, un instant après la frappe. */
import { Store, blocDepuisExercice } from "../core/store.js";
import { esc, debounce, statut, formaterDate } from "../core/dom.js";
import { Archive } from "../core/archive.js";
import { CATEGORIES, NIVEAUX } from "../data/catalogue.js";
import { FORMES_TRAVAIL, FAMILLES, fichesParFamille } from "../data/referentiel.js";
import { creerEditeur } from "./editeur.js";
import { choisir } from "./dialogue.js";
import { exporterFicheAtelier } from "./communs.js";

export const Exercice = {
  afficher(main, id) {
    const ex = Store.exercices.get(id);
    const sec = document.createElement("section");
    sec.className = "ecran ecran-fiche";
    main.replaceChildren(sec);
    if (!ex) {
      sec.innerHTML = `<p class="vide">Cet exercice n'existe pas (ou plus). <a href="#/exercices">Retour à la bibliothèque.</a></p>`;
      return { detruire() {} };
    }

    sec.innerHTML = `
      <div class="entete">
        <a class="retour" href="#/exercices">← Exercices</a>
        <span class="etat" data-etat>Enregistré</span>
        <span class="spacer"></span>
        <button type="button" data-act="seance">Ajouter à une séance…</button>
        <button type="button" data-act="atelier" title="Une page pour l'aide-entraîneur qui tient cet atelier : schéma, organisation, points clés, corrections">Fiche atelier (PDF)</button>
        <button type="button" data-act="exporter" title="Télécharger cet exercice seul, en JSON, pour le partager ou le garder">Exporter</button>
        <button type="button" data-act="dupliquer">Dupliquer</button>
        <button type="button" class="danger" data-act="supprimer">Supprimer</button>
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
          <label>Forme de travail <small>Module A fédéral</small>
            <select name="forme"><option value="">—</option>${Object.entries(FORMES_TRAVAIL)
              .map(([k, v]) => `<option value="${k}"${ex.forme === k ? " selected" : ""}>${esc(v)}</option>`)
              .join("")}</select>
          </label>
          <details class="techniques" ${(ex.techniques || []).length ? "open" : ""}>
            <summary>Fiches techniques FFHG <small>${(ex.techniques || []).length ? `${ex.techniques.length} rattachée${ex.techniques.length > 1 ? "s" : ""}` : "aucune"}</small></summary>
            ${Object.entries(fichesParFamille())
              .map(
                ([fam, liste]) => `<div class="techniques-famille"><h4>${esc(FAMILLES[fam])}</h4>${liste
                  .map((fi) => `<label class="technique"><input type="checkbox" name="techniques" value="${fi.code}" ${(ex.techniques || []).includes(fi.code) ? "checked" : ""}> <b>${fi.code}</b> ${esc(fi.nom)}</label>`)
                  .join("")}</div>`,
              )
              .join("")}
          </details>
          <label>Matériel <input name="materiel" value="${esc(ex.materiel)}" placeholder="Cônes, palets, chasubles…"></label>
          <label>Variantes <textarea name="variantes" rows="3" placeholder="Plus facile, plus dur, pour les gardiens…">${esc(ex.variantes)}</textarea></label>
        </form>
      </div>`;

    const etat = sec.querySelector("[data-etat]");
    const marquer = (txt) => (etat.textContent = txt);
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
      if (c.name === "points_cles") ex.points_cles = c.value.split("\n").map((l) => l.trim()).filter(Boolean);
      else if (c.name === "corrections") ex.corrections = c.value.split("\n").map((l) => l.trim()).filter(Boolean);
      else if (c.name === "techniques") {
        ex.techniques = [...sec.querySelectorAll('input[name="techniques"]:checked')].map((x) => x.value);
        const sm = sec.querySelector(".techniques summary small");
        if (sm) sm.textContent = ex.techniques.length ? `${ex.techniques.length} rattachée${ex.techniques.length > 1 ? "s" : ""}` : "aucune";
      } else if (c.name === "duree") ex.duree = Math.max(1, Number(c.value) || 1);
      else ex[c.name] = c.value;
      toucher();
    });

    sec.querySelector(".entete").addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "atelier") {
        Store.exercices.sauver(ex);
        await exporterFicheAtelier(ex, b);
      } else if (b.dataset.act === "exporter") {
        Store.exercices.sauver(ex);
        Archive.exporterExercice(ex);
        statut("Exercice exporté.");
      } else if (b.dataset.act === "dupliquer") {
        Store.exercices.sauver(ex);
        const copie = Store.exercices.dupliquer(ex.id);
        statut("Exercice dupliqué.");
        location.hash = `#/exercice/${copie.id}`;
      } else if (b.dataset.act === "supprimer") {
        if (!confirm(`Supprimer « ${ex.nom || "cet exercice"} » ? Les séances qui l'utilisent garderont son titre.`)) return;
        Store.exercices.supprimer(ex.id);
        statut("Exercice supprimé.");
        location.hash = "#/exercices";
      } else if (b.dataset.act === "seance") {
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
        let se = choix === "__nouvelle" ? Store.seances.creer() : Store.seances.get(choix);
        if (!se) return;
        se.blocs.push(blocDepuisExercice(ex));
        Store.seances.sauver(se);
        statut(`Ajouté à « ${se.titre || "la séance"} ».`);
        location.hash = `#/seance/${se.id}`;
      }
    });

    return {
      detruire() {
        editeur.detruire();
        // ne rien perdre si on quitte pendant le délai d'enregistrement
        if (etat.textContent !== "Enregistré" && Store.exercices.get(ex.id)) Store.exercices.sauver(ex);
      },
    };
  },
};
