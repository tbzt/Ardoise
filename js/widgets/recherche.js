/* Recherche — atteindre une chose en disant son nom.

   C'était le manque net de l'appli : un seul champ de recherche dans
   toute l'interface, qui ne cherchait que des exercices, et seulement
   depuis deux écrans. Pour retrouver « la séance de mardi dernier avec
   les ados » il fallait naviguer, changer d'onglet, et faire défiler.

   Trois types d'objets, et des ACTIONS sur le résultat — pas seulement
   une destination : « Ajouter au déroulé du 30 sept. » est ce qu'on
   veut faire neuf fois sur dix quand on cherche un exercice, et cela
   n'existait nulle part. C'est aussi ce qui autorise la barre à ne
   garder que trois entrées : « Bibliothèque » et « Groupes » cessent
   d'être des endroits où il faut se rendre à la main. */

import { Store, blocDepuisExercice } from "../core/store.js";
import { esc, statut, formaterDuree, formaterJour, sansAccents, debounce } from "../core/dom.js";
import { pastille, mention, exporterFicheAtelier } from "./communs.js";
import { estFaite, libelleUsage, usageExercices, seancesFaites, formaterCourt } from "../core/analyse.js";

const MAX = 6;

/* La séance vers laquelle « ajouter » pointe : la prochaine non faite,
   celle qu'on est en train de préparer neuf fois sur dix. */
function prochaine() {
  return Store.seances
    .toutes()
    .filter((s) => !estFaite(s))
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))[0];
}

/* Tous les mots doivent être présents, chacun où il veut, et sans
   accents : un coach tape « echauffement » et « tir revers ». Même
   règle que la bibliothèque — une seule façon de chercher dans
   l'appli. */
function correspond(meule, mots) {
  const m = sansAccents(meule);
  return mots.every((x) => m.includes(x));
}

function chercher(q) {
  const mots = sansAccents(q).split(/\s+/).filter(Boolean);
  if (!mots.length) return { exercices: [], seances: [], groupes: [] };

  const cible = prochaine();
  const usage = cible && cible.groupeId ? usageExercices(seancesFaites(cible.groupeId)) : null;

  const exercices = Store.exercices
    .tous()
    .filter((e) =>
      correspond(
        [e.nom, e.objectif, e.description, e.materiel, (e.points_cles || []).join(" ")].join(" "),
        mots,
      ),
    )
    .slice(0, MAX)
    .map((e) => ({
      type: "exercice",
      id: e.id,
      nom: e.nom || "Sans nom",
      detail: `${pastille(e.categorie)}<span class="sep">·</span>${mention(formaterDuree(e.duree))}${
        usage ? `<span class="sep">·</span>${mention(libelleUsage(usage.get(e.id)), usage.get(e.id) ? "" : "attire")}` : ""
      }`,
    }));

  const seances = Store.seances
    .toutes()
    .filter((s) => correspond([s.titre, s.groupe, s.lieu, s.objectif, s.date].join(" "), mots))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, MAX)
    .map((s) => ({
      type: "seance",
      id: s.id,
      nom: s.titre || "Séance sans titre",
      detail: `${mention(formaterJour(s.date) || "sans date")}${s.groupe ? `<span class="sep">·</span>${mention(s.groupe)}` : ""}${
        estFaite(s) ? `<span class="sep">·</span>${mention("faite")}` : ""
      }`,
    }));

  const groupes = Store.groupes
    .tous()
    .filter((g) => correspond([g.nom, g.description].join(" "), mots))
    .slice(0, MAX)
    .map((g) => ({
      type: "groupe",
      id: g.id,
      nom: g.nom || "Groupe sans nom",
      detail: mention(`${seancesFaites(g.id).length} séances faites`),
    }));

  return { exercices, seances, groupes };
}

/* Les actions possibles sur un résultat. La première est celle
   qu'« Entrée » déclenche : ouvrir. Les autres s'atteignent par la
   flèche droite, et portent le nom de ce qu'elles font. */
function actions(r) {
  if (r.type === "exercice") {
    const cible = prochaine();
    const liste = [{ id: "ouvrir", libelle: "Ouvrir la fiche" }];
    if (cible)
      liste.push({
        id: "ajouter",
        libelle: `Ajouter au déroulé du ${formaterCourt(cible.date) || "prochain"}`,
      });
    liste.push({ id: "atelier", libelle: "Fiche atelier (PDF)" });
    return liste;
  }
  if (r.type === "seance") {
    const s = Store.seances.get(r.id);
    const liste = [{ id: "ouvrir", libelle: "Préparer" }];
    if (s && s.blocs.length) liste.push({ id: "glace", libelle: "Bord de glace" });
    liste.push({ id: "bilan", libelle: s && s.bilan && s.bilan.fait ? "Voir le bilan" : "Faire le bilan" });
    return liste;
  }
  return [{ id: "ouvrir", libelle: "Ouvrir le groupe" }];
}

function agir(r, quoi, d) {
  if (r.type === "exercice") {
    if (quoi === "ajouter") {
      const cible = prochaine();
      const ex = Store.exercices.get(r.id);
      if (!cible || !ex) return;
      const bloc = blocDepuisExercice(ex);
      cible.blocs.push(bloc);
      Store.seances.sauver(cible);
      statut(`« ${ex.nom} » ajouté à la séance du ${formaterCourt(cible.date)}.`, {
        annuler: () => {
          cible.blocs = cible.blocs.filter((b) => b.id !== bloc.id);
          Store.seances.sauver(cible);
        },
      });
      return;
    }
    if (quoi === "atelier") {
      const ex = Store.exercices.get(r.id);
      if (ex) exporterFicheAtelier(ex, null);
      return;
    }
    location.hash = `#/exercice/${r.id}`;
    return;
  }
  if (r.type === "seance") {
    location.hash = quoi === "glace" ? `#/seance/${r.id}/glace` : quoi === "bilan" ? `#/seance/${r.id}/bilan` : `#/seance/${r.id}`;
    return;
  }
  location.hash = `#/groupe/${r.id}`;
}

/* ── La palette ──────────────────────────────────────────────── */

let ouverte = null;

export function ouvrirRecherche(depart = "") {
  if (ouverte) return;
  const d = document.createElement("dialog");
  d.className = "palette";
  d.innerHTML = `
    <div class="palette-saisie">
      <span class="mention">⌘K</span>
      <input type="search" placeholder="Chercher un exercice, une séance, un groupe…" aria-label="Recherche" value="${esc(depart)}">
    </div>
    <div class="palette-corps" data-corps></div>
    <p class="palette-pied" data-pied></p>`;
  document.body.appendChild(d);
  ouverte = d;

  const champ = d.querySelector("input");
  const corps = d.querySelector("[data-corps]");
  const pied = d.querySelector("[data-pied]");

  let plats = [];
  let sel = 0;
  let mode = "resultats"; // "resultats" | "actions"
  let actionsEnCours = [];
  let selAction = 0;

  function peindre() {
    const r = chercher(champ.value);
    plats = [
      ...r.exercices.map((x) => ({ ...x, groupe: "Exercices" })),
      ...r.seances.map((x) => ({ ...x, groupe: "Séances" })),
      ...r.groupes.map((x) => ({ ...x, groupe: "Groupes" })),
    ];
    if (sel >= plats.length) sel = Math.max(0, plats.length - 1);

    if (!champ.value.trim()) {
      corps.innerHTML = `<p class="palette-vide">Tapez quelques lettres. La recherche pardonne les accents et l'ordre des mots : « tir revers » trouve « Réception en revers et tir ».</p>`;
      pied.innerHTML = "";
      return;
    }
    if (!plats.length) {
      corps.innerHTML = `<p class="palette-vide">Rien ne correspond.</p>`;
      pied.innerHTML = "";
      return;
    }

    let html = "";
    let dernier = null;
    plats.forEach((x, i) => {
      if (x.groupe !== dernier) {
        if (dernier) html += `</ul>`;
        html += `<p class="palette-groupe">${x.groupe}</p><ul>`;
        dernier = x.groupe;
      }
      html += `<li class="${i === sel ? "sel" : ""}" data-i="${i}"><span class="nom">${esc(x.nom)}</span><span class="detail">${x.detail}</span></li>`;
    });
    html += `</ul>`;
    corps.innerHTML = html;
    peindrePied();
    const el = corps.querySelector("li.sel");
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  function peindrePied() {
    const r = plats[sel];
    if (!r) return (pied.innerHTML = "");
    actionsEnCours = actions(r);
    if (mode === "actions") {
      pied.innerHTML =
        `<span class="palette-touche"><kbd>↵</kbd>valider</span><span class="palette-touche"><kbd>←</kbd>retour</span>` +
        `<span class="palette-actions">${actionsEnCours
          .map((a, i) => `<button type="button" data-action="${a.id}" class="${i === selAction ? "sel" : ""}">${esc(a.libelle)}</button>`)
          .join("")}</span>`;
    } else {
      pied.innerHTML =
        `<span class="palette-touche"><kbd>↵</kbd>${esc(actionsEnCours[0].libelle)}</span>` +
        (actionsEnCours.length > 1 ? `<span class="palette-touche"><kbd>→</kbd>${actionsEnCours.length - 1} autre${actionsEnCours.length > 2 ? "s" : ""} action${actionsEnCours.length > 2 ? "s" : ""}</span>` : "");
    }
  }

  const rafraichir = debounce(peindre, 120);
  champ.addEventListener("input", () => {
    mode = "resultats";
    sel = 0;
    rafraichir();
  });

  function valider(quoi) {
    const r = plats[sel];
    if (!r) return;
    d.close();
    agir(r, quoi, d);
  }

  d.addEventListener("keydown", (e) => {
    if (mode === "actions") {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        selAction = (selAction + 1) % actionsEnCours.length;
        peindrePied();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (selAction === 0) {
          mode = "resultats";
          peindrePied();
        } else {
          selAction--;
          peindrePied();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        valider(actionsEnCours[selAction].id);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      sel = Math.min(sel + 1, plats.length - 1);
      peindre();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      sel = Math.max(sel - 1, 0);
      peindre();
    } else if (e.key === "ArrowRight" && plats.length && actionsEnCours.length > 1) {
      // la flèche droite ne prend la main que si le curseur est au bout
      // du texte : sinon on empêche de se déplacer dans sa propre saisie
      if (champ.selectionStart !== champ.value.length) return;
      e.preventDefault();
      mode = "actions";
      selAction = 0;
      peindrePied();
    } else if (e.key === "Enter") {
      e.preventDefault();
      valider("ouvrir");
    }
  });

  corps.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-i]");
    if (!li) return;
    sel = Number(li.dataset.i);
    valider("ouvrir");
  });
  pied.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-action]");
    if (b) valider(b.dataset.action);
  });

  d.addEventListener("close", () => {
    d.remove();
    ouverte = null;
  });
  // cliquer dehors referme : la zone du ::backdrop est la boîte elle-même
  d.addEventListener("click", (e) => {
    if (e.target === d) d.close();
  });

  d.showModal();
  champ.focus();
  champ.select();
  peindre();
}

/* Le raccourci vit au niveau du document et non d'un écran : c'est la
   promesse de la chose — elle répond partout. */
export function brancherRecherche(bouton) {
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      ouvrirRecherche();
    }
  });
  if (bouton) bouton.addEventListener("click", () => ouvrirRecherche());
}
