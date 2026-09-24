/* Vérifier — la page de contrôle.

   `ARCHITECTURE.md` disait : « Il n'y a pas de suite de tests : on
   ouvre l'appli, on dessine, on compose, on imprime, on regarde la
   console. » C'est tenable pour du rendu, qui se voit. Ça ne l'est
   plus pour de la synchronisation, des conflits et des règles de
   sécurité : là, une régression est silencieuse et coûte des données.

   Cette page est donc le filet, dans l'idiome du projet : un fichier
   statique de plus, aucune dépendance, aucune étape de build. Elle
   vérifie trois choses :
   — le catalogue (intégrité, sans réseau) ;
   — la recherche (accents, mots) ;
   — les règles de la base et l'aller-retour, si un compte est ouvert.

   Les objets d'épreuve portent un identifiant en « _verif_ » et sont
   effacés dans tous les cas. S'il en reste un, la page le dit avec son
   identifiant plutôt que de faire comme si de rien n'était. */

import { CATEGORIES } from "./data/catalogue.js";
import { exercicesDeBase } from "./data/catalogue.js";
import { FICHES } from "./data/referentiel.js";
import { OBJETS, FORMES as FORMES_PATINOIRE, STYLES_TRAIT } from "./widgets/patinoire.js";
import { filtrer } from "./widgets/communs.js";
import { seanceSaine, groupeSain, exerciceSain } from "./core/store.js";
import { memeContenu } from "./core/synchro.js";
import { Distant, HorsLigne, clefCourriel } from "./core/distant.js";

/* Les listes viennent de patinoire.js, qui fait foi : recopiées ici,
   elles se seraient démenties au premier symbole ajouté — et l'épreuve
   aurait continué de passer en vert sur un schéma que plus rien ne
   dessine. Un objet dont le type est inconnu ne lève aucune erreur :
   il ne se rend simplement pas. */
const STYLES = Object.keys(STYLES_TRAIT);
const TYPES = ["joueur", "trait", ...Object.keys(OBJETS)];
const COULEURS = ["noir", "rouge", "bleu", "vert", "orange"];
const FORMES_JOUEUR = Object.keys(FORMES_PATINOIRE);
const FORMES = ["", "actif", "vagues", "groupes3", "parcours", "duo", "relais"];
const NIVEAUX = ["debutant", "intermediaire", "tous"];

let sortie = null;
let restes = [];

function groupe(titre) {
  const h = document.createElement("h2");
  h.textContent = titre;
  sortie.appendChild(h);
}

function dire(ok, titre, detail = "") {
  const li = document.createElement("li");
  li.className = ok === null ? "passe" : ok ? "vert" : "rouge";
  li.innerHTML = `<span class="marque">${ok === null ? "–" : ok ? "✓" : "✗"}</span><span><strong>${titre}</strong>${detail ? `<small>${detail}</small>` : ""}</span>`;
  (sortie.lastElementChild.tagName === "UL" ? sortie.lastElementChild : sortie.appendChild(document.createElement("ul"))).appendChild(li);
  return ok;
}

function compter() {
  const tous = [...sortie.querySelectorAll("li")];
  return {
    total: tous.length,
    ok: tous.filter((l) => l.classList.contains("vert")).length,
    ko: tous.filter((l) => l.classList.contains("rouge")).length,
    passes: tous.filter((l) => l.classList.contains("passe")).length,
  };
}

/* ── Ce qui entre dans le Store ───────────────────────────────

   Née d'un incident : une base Realtime ne stocke ni tableau vide ni
   `null`. Une séance au déroulé vide est repartie avec `blocs: []` et
   revenue SANS `blocs` ; `se.blocs.length` a levé une TypeError qui a
   emporté le rendu de tout l'écran Séances, et le coach a vu une page
   blanche avec son groupe et sa séance dedans. Une régression ici est
   silencieuse jusqu'à ce qu'elle coûte une soirée. */

function verifierAssainissement() {
  groupe("Ce qui entre dans le Store");

  const amputee = seanceSaine({ id: "se_x", titre: "Sans blocs", date: "2026-09-19" });
  dire(Array.isArray(amputee.blocs) && amputee.blocs.length === 0, "Séance sans « blocs » : tableau vide rendu");
  dire(amputee.bilan === null, "Séance sans « bilan » : null rendu");
  dire(amputee.id === "se_x", "L'identifiant est conservé");

  // une base Realtime rend un tableau à trous sous forme d'objet indexé
  const indexee = seanceSaine({ id: "se_y", blocs: { 0: { id: "b0", duree: 5 }, 2: { id: "b2", duree: 7 } } });
  dire(Array.isArray(indexee.blocs) && indexee.blocs.length === 2, "« blocs » en objet indexé : retransformé en tableau");

  const sansId = seanceSaine({ id: "se_z", blocs: [{ duree: 5 }] });
  dire(!!sansId.blocs[0].id, "Un bloc sans identifiant en reçoit un");

  const g = groupeSain({ id: "gr_x", nom: "A" });
  dire(Array.isArray(g.cycles), "Groupe sans « cycles » : tableau vide rendu");

  const e = exerciceSain({ id: "ex_x", nom: "A" });
  dire(
    Array.isArray(e.points_cles) && Array.isArray(e.corrections) && Array.isArray(e.techniques) && Array.isArray(e.schema.objets),
    "Exercice : points clés, corrections, techniques et objets du schéma sont des tableaux",
  );

  dire(seanceSaine(null) === null && groupeSain(undefined) === null, "Une entrée qui n'est pas un objet est écartée");

  // ce que l'écran Séances fait vraiment, et qui plantait
  const total = [amputee, indexee].reduce((t, s) => t + s.blocs.length, 0);
  dire(total === 2, "« blocs.length » ne lève plus sur une donnée revenue amputée");
}

/* ── Ce qui mérite qu'on dérange le coach ─────────────────────

   La file dit « j'ai quelque chose à pousser », pas « le contenu
   diverge ». Après un miroir vide, TOUT est en file : le premier
   tirage demandait de trancher entre deux versions identiques, autant
   de fois qu'il y a d'objets. On ne se tait QUE si l'on est sûr —
   l'épreuve vérifie les deux sens. */

function verifierConflits() {
  groupe("Conflits");

  const se = { id: "se_1", titre: "A", date: "2026-09-19", duree_glace: 60, blocs: [{ id: "b1", duree: 5 }], bilan: null, cree: 1, modifie: 10 };

  dire(memeContenu("seances", se, { ...se, rev: 7, updatedBy: "autre", modifie: 99 }), "Même contenu malgré rev, updatedBy et modifie différents : pas de conflit");

  // ce que rend vraiment une base Realtime : ni tableau vide ni null
  const vide = { id: "se_2", titre: "A", date: "2026-09-19", duree_glace: 60, blocs: [], bilan: null, cree: 1, modifie: 10 };
  const revenue = { id: "se_2", titre: "A", date: "2026-09-19", duree_glace: 60, cree: 1, modifie: 55, rev: 3 };
  dire(memeContenu("seances", vide, revenue), "Séance vide revenue sans « blocs » ni « bilan » : pas de conflit");

  dire(!memeContenu("seances", se, { ...se, titre: "B", rev: 7 }), "Un titre différent EST un conflit");
  dire(!memeContenu("seances", se, { ...se, blocs: [{ id: "b1", duree: 9 }], rev: 7 }), "Une durée de bloc différente EST un conflit");
  dire(!memeContenu("seances", se, { ...se, blocs: [], rev: 7 }), "Un déroulé vidé pour de bon EST un conflit");
  dire(!memeContenu("seances", se, null) && !memeContenu("seances", null, se), "Un côté absent n'est jamais « identique »");

  const g = { id: "gr_1", nom: "Adultes", niveau: "debutant", description: "", duree_glace: 60, cycles: [], cree: 1, modifie: 10 };
  dire(memeContenu("groupes", g, { id: "gr_1", nom: "Adultes", niveau: "debutant", description: "", duree_glace: 60, cree: 1, modifie: 88, rev: 2 }), "Groupe revenu sans « cycles » : pas de conflit");
  dire(!memeContenu("groupes", g, { ...g, nom: "Ados", rev: 2 }), "Un nom de groupe différent EST un conflit");

  const ex = { id: "ex_1", nom: "Tir", categorie: "tir", points_cles: [], corrections: [], techniques: [], schema: { vue: "entiere", objets: [] }, cree: 1, modifie: 10 };
  dire(memeContenu("exercices", ex, { id: "ex_1", nom: "Tir", categorie: "tir", schema: { vue: "entiere" }, cree: 1, modifie: 12, rev: 4 }), "Exercice revenu sans ses tableaux vides : pas de conflit");

  // l'ordre des clés d'un objet ne veut rien dire ; celui d'un tableau, si
  const a = { id: "se_3", titre: "A", blocs: [{ id: "b1" }, { id: "b2" }], cree: 1 };
  dire(memeContenu("seances", a, { blocs: [{ id: "b1" }, { id: "b2" }], titre: "A", id: "se_3", cree: 1, rev: 1 }), "L'ordre des champs n'invente pas un conflit");
  dire(!memeContenu("seances", a, { ...a, blocs: [{ id: "b2" }, { id: "b1" }], rev: 1 }), "Deux blocs intervertis SONT un conflit");
}

/* ── Le catalogue ─────────────────────────────────────────────── */

function verifierCatalogue() {
  groupe("Catalogue");
  const ex = exercicesDeBase();
  const codes = new Set(FICHES.map((f) => f.code));

  dire(ex.length > 0, `${ex.length} exercices chargés`);

  const ids = ex.map((e) => e.id);
  dire(new Set(ids).size === ids.length, "Identifiants uniques", doublons(ids));

  const cats = [...new Set(ex.map((e) => e.categorie))].filter((c) => !CATEGORIES[c]);
  dire(!cats.length, "Catégories connues", cats.join(", "));

  const tech = [...new Set(ex.flatMap((e) => e.techniques || []))].filter((t) => !codes.has(t));
  dire(!tech.length, "Codes de fiches techniques connus", tech.join(", "));

  const formes = [...new Set(ex.map((e) => e.forme))].filter((f) => !FORMES.includes(f));
  dire(!formes.length, "Formes de travail connues", formes.join(", "));

  const niv = [...new Set(ex.map((e) => e.niveau))].filter((n) => !NIVEAUX.includes(n));
  dire(!niv.length, "Niveaux connus", niv.join(", "));

  const sansSchema = ex.filter((e) => !e.schema || !Array.isArray(e.schema.objets) || !e.schema.objets.length);
  dire(!sansSchema.length, "Tous les exercices ont un schéma", sansSchema.map((e) => e.id).join(", "));

  const mauvaisStyle = new Set();
  const mauvaisType = new Set();
  const mauvaiseCouleur = new Set();
  const mauvaiseForme = new Set();
  const hors = [];
  for (const e of ex) {
    const limite = e.schema.vue === "moitie" ? 310 : 600;
    for (const o of e.schema.objets) {
      if (!TYPES.includes(o.t)) mauvaisType.add(`${e.id} : ${o.t}`);
      if (o.t === "trait" && !STYLES.includes(o.style)) mauvaisStyle.add(o.style);
      if (o.couleur && !COULEURS.includes(o.couleur)) mauvaiseCouleur.add(o.couleur);
      if (o.t === "joueur" && !FORMES_JOUEUR.includes(o.forme)) mauvaiseForme.add(o.forme);
      const points = o.t === "trait" ? o.pts : [{ x: o.x, y: o.y }];
      for (const p of points || []) {
        if (p.x < 0 || p.x > limite || p.y < 0 || p.y > 300) hors.push(`${e.id} (${p.x},${p.y})`);
      }
    }
  }
  dire(!mauvaisType.size, "Types d'objet connus", [...mauvaisType].join(" · "));
  dire(!mauvaisStyle.size, "Styles de trait connus", [...mauvaisStyle].join(", "));
  dire(!mauvaiseCouleur.size, "Couleurs connues", [...mauvaiseCouleur].join(", "));
  dire(!mauvaiseForme.size, "Formes de joueur connues", [...mauvaiseForme].join(", "));
  dire(!hors.length, "Aucun objet hors du cadre de la patinoire", hors.slice(0, 5).join(" · "));

  const utilisees = new Set(ex.flatMap((e) => e.techniques || []));
  const jamais = FICHES.filter((f) => !utilisees.has(f.code));
  dire(
    !jamais.length,
    "Chaque fiche technique est atteignable",
    jamais.length ? `${jamais.length} fiche(s) qu'aucun exercice ne vise : ${jamais.map((f) => f.code).join(", ")} — le compteur du groupe ne pourra jamais se remplir` : "",
  );
}

function doublons(liste) {
  const vus = new Set();
  const deux = new Set();
  for (const x of liste) (vus.has(x) ? deux : vus).add(x);
  return [...deux].join(", ");
}

/* ── La recherche ─────────────────────────────────────────────── */

function verifierRecherche() {
  groupe("Recherche");
  const ex = exercicesDeBase();
  const combien = (q) => filtrer(ex, { q, categorie: "" }).length;

  const sansAccent = combien("echauffement");
  const avecAccent = combien("échauffement");
  dire(sansAccent > 0 && sansAccent === avecAccent, "Les accents ne comptent pas", `« echauffement » : ${sansAccent} · « échauffement » : ${avecAccent}`);

  const a = combien("tir revers");
  const b = combien("revers tir");
  dire(a > 0 && a === b, "L'ordre des mots ne compte pas", `« tir revers » : ${a} · « revers tir » : ${b}`);

  dire(combien("GARDIEN") === combien("gardien"), "La casse ne compte pas");
  dire(combien("") === ex.length, "Une recherche vide ne filtre rien");
  dire(combien("zzzzz") === 0, "Une recherche sans résultat n'en invente pas");
}

/* ── Les règles et l'aller-retour ─────────────────────────────── */

async function verifierDistant() {
  groupe("Base distante");

  if (!Distant.configure()) return dire(false, "Configuration Firebase absente");
  if (!Distant.connecte()) {
    dire(null, "Aucun compte ouvert sur cet appareil", "Connectez-vous dans Ardoise, puis relancez cette page : les épreuves des règles seront jouées.");
    return;
  }

  const moi = Distant.monEspace();
  dire(true, "Session ouverte", `espace : ${moi}`);

  const id = `_verif_${Date.now().toString(36)}`;
  const chemin = `espaces/${moi}/exercices/${id}`;
  const objet = (rev, extra = {}) => ({ id, nom: "Vérification — à effacer", categorie: "patinage", duree: 5, rev, updatedBy: moi, modifie: Date.now(), ...extra });
  restes.push(chemin);

  try {
    // 1. écriture initiale
    await Distant.ecrire(chemin, objet(1));
    dire(true, "Écriture dans mon espace acceptée");

    // 2. relecture fidèle
    const relu = await Distant.lire(chemin);
    dire(relu && relu.id === id && relu.rev === 1, "Relecture fidèle", relu ? `rev ${relu.rev}` : "rien relu");

    // 3. la garde de révision refuse une révision qui ne progresse pas
    dire(await refuse(() => Distant.ecrire(chemin, objet(1))), "Une révision qui ne progresse pas est refusée", "c'est ce qui empêche deux appareils de s'écraser en silence");

    // 4. une révision qui saute est refusée aussi
    dire(await refuse(() => Distant.ecrire(chemin, objet(5))), "Une révision qui saute est refusée");

    // 5. la révision suivante passe
    await Distant.ecrire(chemin, objet(2));
    dire(true, "La révision suivante est acceptée", "rev 2");

    // 6. on ne peut pas signer à la place d'un autre
    dire(await refuse(() => Distant.ecrire(chemin, objet(3, { updatedBy: "quelquun-dautre" }))), "Signer au nom d'un autre est refusé");

    // 7. l'identifiant doit correspondre à sa clé
    dire(await refuse(() => Distant.ecrire(chemin, objet(3, { id: "autre-chose" }))), "Un identifiant qui ne correspond pas à sa clé est refusé");

    // 8. l'espace d'un autre reste fermé
    dire(await refuse(() => Distant.lire(`espaces/un-autre-coach/exercices`)), "L'espace d'un autre coach est fermé en lecture");
    dire(await refuse(() => Distant.ecrire(`espaces/un-autre-coach/exercices/${id}`, objet(1))), "L'espace d'un autre coach est fermé en écriture");

    // 9. l'envoi groupé — c'est ainsi que part la première synchronisation
    const lot = {};
    const cheminsLot = [];
    for (let i = 0; i < 3; i++) {
      const lid = `${id}_lot${i}`;
      lot[lid] = { ...objet(1), id: lid };
      cheminsLot.push(`espaces/${moi}/exercices/${lid}`);
      restes.push(`espaces/${moi}/exercices/${lid}`);
    }
    await Distant.fusionner(`espaces/${moi}/exercices`, lot);
    dire(true, "Envoi groupé accepté", "trois objets en une requête — la première synchronisation pousse toute la bibliothèque ainsi");

    // 10. un lot dont un membre est invalide est refusé EN ENTIER
    const lotSale = { [`${id}_sale`]: { ...objet(1), id: "pas-la-bonne-cle" } };
    dire(await refuse(() => Distant.fusionner(`espaces/${moi}/exercices`, lotSale)), "Un lot invalide est refusé en entier");

    // 11. effacement
    await Distant.fusionner(`espaces/${moi}/exercices`, Object.fromEntries(cheminsLot.map((c) => [c.split("/").pop(), null])));
    await Distant.effacer(chemin);
    const apres = await Distant.lire(chemin);
    dire(apres === null, "Effacement effectif", apres === null ? "" : "l'objet est encore là");
    restes = [];

    await verifierPartage(moi, id);
  } catch (e) {
    if (e instanceof HorsLigne) dire(false, "Pas de réseau", "impossible de jouer les épreuves des règles");
    else dire(false, "Épreuve interrompue", e.message);
  } finally {
    await nettoyer();
  }
}

/* ── Confier un groupe ────────────────────────────────────────
   Ces épreuves se jouent avec un seul compte : elles vérifient qu'on
   ne peut PAS faire ce qu'il ne faut pas. Le partage lui-même demande
   deux comptes ; ce qui se teste seul, c'est la fermeture. */
async function verifierPartage(moi, marque) {
  groupe("Confier un groupe");

  const groupeEpreuve = `_verif_g_${marque.slice(7)}`;
  const monMail = Distant.session().courriel;
  const cleMail = clefCourriel(monMail);
  const autreEspace = "un-autre-coach-imaginaire";
  const cheminJeton = `invitations/${cleMail}/${moi}/${groupeEpreuve}`;
  restes.push(cheminJeton);

  // j'invite chez moi : accepté
  await Distant.ecrire(cheminJeton, { nomGroupe: "Épreuve", par: moi, le: Date.now() });
  dire(true, "Je peux déposer une invitation dans mon espace");

  // et je la relis, parce que c'est mon adresse
  const relu = await Distant.lire(cheminJeton);
  dire(relu && relu.par === moi, "Je relis l'invitation qui m'est adressée", "c'est ce qui permet à l'invité de la trouver sans connaître l'identifiant de qui l'invite");

  // l'invitation de quelqu'un d'autre reste fermée
  dire(
    await refuse(() => Distant.lire(`invitations/${clefCourriel("quelquun-dautre@exemple.fr")}`)),
    "Les invitations adressées à un autre restent fermées",
  );

  // je ne peux pas inviter au nom d'un autre coach
  dire(
    await refuse(() => Distant.ecrire(`invitations/${cleMail}/${autreEspace}/${groupeEpreuve}`, { nomGroupe: "X", par: autreEspace, le: Date.now() })),
    "Inviter au nom d'un autre coach est refusé",
  );

  // ★ l'épreuve qui compte : se déclarer co-coach sans invitation
  dire(
    await refuse(() =>
      Distant.ecrire(`espaces/${autreEspace}/coachs/${groupeEpreuve}/${moi}`, { nom: "moi", courriel: monMail, depuis: Date.now() }),
    ),
    "Se déclarer co-coach sans invitation est refusé",
    "c'est la seule chose qui sépare un groupe privé d'un groupe ouvert à tous",
  );

  // les séances d'un groupe qu'on ne m'a pas confié
  dire(await refuse(() => Distant.lire(`espaces/${autreEspace}/seances/${groupeEpreuve}`)), "Les séances d'un groupe non confié sont fermées");
  dire(await refuse(() => Distant.lire(`espaces/${autreEspace}/bibliotheques/${groupeEpreuve}`)), "La bibliothèque d'un groupe non confié est fermée");
  dire(await refuse(() => Distant.lire(`confies/un-autre-identifiant`)), "La liste des groupes confiés à un autre est fermée");

  // je retire mon invitation d'épreuve
  await Distant.effacer(cheminJeton);
  dire((await Distant.lire(cheminJeton)) === null, "Une invitation s'annule");
  restes = restes.filter((c) => c !== cheminJeton);
}

/* Vrai si l'appel est refusé — c'est le résultat attendu de ces
   épreuves-là. Un appel qui PASSE alors qu'il devrait être refusé est
   le pire des cas : la règle ne protège pas ce qu'on croit. */
async function refuse(appel) {
  try {
    await appel();
    return false;
  } catch (e) {
    if (e instanceof HorsLigne) throw e;
    return true;
  }
}

async function nettoyer() {
  const echecs = [];
  for (const chemin of restes) {
    try {
      await Distant.effacer(chemin);
    } catch (e) {
      echecs.push(chemin);
    }
  }
  if (echecs.length) dire(false, "Objets d'épreuve non effacés", `à supprimer à la main : ${echecs.join(", ")}`);
  restes = [];
}

/* ── Le tour complet ──────────────────────────────────────────── */

export async function lancer(conteneur, resume) {
  sortie = conteneur;
  sortie.replaceChildren();
  restes = [];
  resume.textContent = "Épreuves en cours…";
  resume.className = "resume";

  verifierCatalogue();
  verifierAssainissement();
  verifierConflits();
  verifierRecherche();
  await verifierDistant();

  const c = compter();
  resume.textContent = c.ko
    ? `${c.ko} épreuve${c.ko > 1 ? "s" : ""} en échec sur ${c.total}.`
    : `${c.ok} épreuve${c.ok > 1 ? "s" : ""} passée${c.ok > 1 ? "s" : ""}${c.passes ? `, ${c.passes} non jouée${c.passes > 1 ? "s" : ""}` : ""}.`;
  resume.className = `resume ${c.ko ? "rouge" : "vert"}`;
}
