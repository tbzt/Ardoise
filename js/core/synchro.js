/* Synchro — le local d'abord, le distant ensuite.

   Règle unique, et elle décide de tout le reste : la vérité de l'appli
   qui tourne reste le localStorage. On ne lit jamais le réseau pour
   afficher un écran. Le bord de la glace a du mauvais wifi, et une
   séance qui attend une requête pour s'afficher est une séance perdue.

   TROIS NOTIONS, et tout découle d'elles :

   — le MIROIR : ce que le serveur avait la dernière fois, objet par
     objet (révision, horodatage, rayon), rangé PAR ESPACE. Il permet
     de savoir ce qui a changé sans instrumenter le Store : on compare
     la collection à ce qu'on avait poussé. Un objet absent du local
     mais présent au miroir a été supprimé ; un objet dont
     l'horodatage a bougé a été modifié. Et surtout ça rattrape ce qui
     a été fait pendant que ce module ne tournait pas.

   — la FILE : ce qui est modifié ici et pas encore parti. Elle survit
     à la fermeture de l'onglet, donc une retouche faite en mode avion
     au bord de la glace part au retour du réseau, même le lendemain.

   — l'ÉTAT : à jour, N en attente, hors ligne, conflit. La barre
     l'affiche, et il ne dit rien quand il n'a rien à dire.

   DEUX RANGEMENTS qui ne sont pas des détails de stockage :

   1. LES SÉANCES SONT RANGÉES PAR GROUPE. Un co-coach doit pouvoir
      lire les séances d'un groupe sans lire les autres. Or une base
      Realtime accorde une permission sur un CHEMIN, pas sur le
      résultat d'une requête : demander « les séances dont le groupe
      est X » suppose de lire la collection entière, ce qu'il faut
      justement interdire. Ranger les séances sous leur groupe met la
      frontière là où la règle sait la poser.

   2. UN GROUPE PARTAGÉ PORTE LES EXERCICES DE SES SÉANCES. Ma
      bibliothèque reste à moi seul ; mais un bloc qui renvoie à un
      exercice que le co-coach n'a pas lui donnerait un titre et rien
      dedans. Les exercices employés par les séances d'un groupe
      partagé sont donc recopiés à côté du groupe, et c'est cette
      copie que le co-coach lit — et garde, même si je retouche la
      mienne ensuite. */

import { Storage } from "./storage.js";
import { Store, seanceSaine, groupeSain, exerciceSain } from "./store.js";
import { Distant, HorsLigne } from "./distant.js";

/* Une séance sans groupe existe encore (elles précèdent les groupes).
   Elle a besoin d'un rayon : celui-là n'est le groupe de personne,
   donc aucun co-coach n'y accède jamais. */
const SANS_GROUPE = "sans-groupe";

const COLLECTIONS = {
  exercices: {
    tous: () => Store.exercices.tous(),
    get: (id) => Store.exercices.get(id),
    installer: (liste) => Store.exercices.installer(liste, { mettreAJour: true }),
    supprimer: (id) => Store.exercices.supprimer(id),
    rayon: null,
  },
  groupes: {
    tous: () => Store.groupes.tous(),
    get: (id) => Store.groupes.get(id),
    installer: (liste) => Store.groupes.installer(liste, { mettreAJour: true }),
    supprimer: (id) => Store.groupes.supprimer(id),
    rayon: null,
  },
  seances: {
    tous: () => Store.seances.toutes(),
    get: (id) => Store.seances.get(id),
    installer: (liste) => Store.seances.installer(liste, { mettreAJour: true }),
    supprimer: (id) => Store.seances.supprimer(id),
    rayon: (se) => se.groupeId || SANS_GROUPE,
  },
};

const PERIODE = 3 * 60 * 1000;
const DELAI_POUSSEE = 1500;
const PAR_LOT = 40;

let miroir = Storage.lire("miroir3", {});
let file = Storage.lire("file3", []);
let confies = Storage.lire("confies", []);
let etat = { code: "inactif", enAttente: 0, message: "" };
let conflits = [];
let enApplication = false;
let minuteur = null;
let desabonner = null;
let pousseeEnCours = null;
let horlogePoussee = null;

const ecoutes = new Set();

function annoncer(code, message = "") {
  etat = { code, enAttente: file.length, message, confies: confies.length };
  for (const f of ecoutes) f(etat);
}

const garderMiroir = () => Storage.ecrire("miroir3", miroir);
const garderFile = () => Storage.ecrire("file3", file);
const empreinte = (o) => (o ? o.modifie || 0 : null);

function vus(espace, nom) {
  const e = miroir[espace] || (miroir[espace] = {});
  return e[nom] || (e[nom] = {});
}

function chemin(espace, nom, rayon, id) {
  return rayon ? `espaces/${espace}/${nom}/${rayon}/${id}` : `espaces/${espace}/${nom}/${id}`;
}
function cheminRayon(espace, nom, rayon) {
  return rayon ? `espaces/${espace}/${nom}/${rayon}` : `espaces/${espace}/${nom}`;
}

/* ── À qui appartient quoi ────────────────────────────────────── */

/* Un objet vit dans un espace et un seul. Trois règles, dans l'ordre :
   ma bibliothèque est à moi ; un groupe appartient à l'espace où on l'a
   déjà vu, sinon au mien ; une séance suit son groupe. C'est ce qui
   fait qu'une retouche apportée à une séance des U13 repart chez celui
   qui m'a confié le groupe, et pas chez moi. */
function espaceDuGroupe(groupeId) {
  if (!groupeId) return Distant.monEspace();
  for (const [espace, branches] of Object.entries(miroir)) {
    if (branches.groupes && branches.groupes[groupeId]) return espace;
  }
  const confie = confies.find((c) => c.groupe === groupeId);
  return confie ? confie.espace : Distant.monEspace();
}

function espaceDe(nom, objet) {
  if (nom === "exercices") return Distant.monEspace();
  if (nom === "groupes") return espaceDuGroupe(objet.id);
  return espaceDuGroupe(objet.groupeId);
}

const rayonDe = (nom, objet) => (COLLECTIONS[nom].rayon ? COLLECTIONS[nom].rayon(objet) : null);

/* Les groupes partagés : ceux qu'on m'a confiés, et les miens qui ont
   au moins un co-coach. Seuls ceux-là portent une copie des exercices
   de leurs séances — on ne recopie rien pour un groupe privé. */
let partages = new Set(Storage.lire("partages", []));

function marquerPartages(liste) {
  partages = new Set(liste);
  Storage.ecrire("partages", [...partages]);
}

/* ── La file ──────────────────────────────────────────────────── */

function cleTache(espace, nom, id) {
  return `${espace}|${nom}|${id}`;
}

function enfiler(espace, nom, id, action, rayon = null) {
  const cle = cleTache(espace, nom, id);
  const i = file.findIndex((t) => cleTache(t.espace, t.collection, t.id) === cle);
  const tache = { espace, collection: nom, id, action, rayon };
  if (i >= 0) file[i] = tache;
  else file.push(tache);
  garderFile();
}

function defiler(espace, nom, id) {
  const cle = cleTache(espace, nom, id);
  file = file.filter((t) => cleTache(t.espace, t.collection, t.id) !== cle);
  garderFile();
}

const enFile = (espace, nom, id) => file.some((t) => t.espace === espace && t.collection === nom && t.id === id);

/* Compare l'état local à ce que le serveur avait, et met dans la file
   ce qui a bougé.

   Deux cas méritent leur nom :
   — une séance qui CHANGE DE GROUPE change de chemin. Il ne suffit pas
     de la réécrire : il faut l'effacer là où elle était, sinon elle
     reste visible des coachs de l'ancien groupe — exactement ce que le
     partage doit empêcher.
   — un exercice employé par un GROUPE PARTAGÉ doit être recopié à côté
     du groupe, sans quoi le co-coach voit un bloc vide. */
function repérerLesChangements() {
  if (enApplication || !Distant.connecte()) return;

  for (const [nom, acces] of Object.entries(COLLECTIONS)) {
    const locaux = acces.tous();
    const parEspace = new Map();
    for (const o of locaux) {
      const espace = espaceDe(nom, o);
      if (!parEspace.has(espace)) parEspace.set(espace, new Map());
      parEspace.get(espace).set(o.id, o);
    }

    for (const [espace, objets] of parEspace) {
      const connus = vus(espace, nom);
      for (const [id, o] of objets) {
        const connu = connus[id];
        const rayon = rayonDe(nom, o);
        if (!connu) enfiler(espace, nom, id, "ecrire", rayon);
        else if (connu.rayon !== rayon) enfiler(espace, nom, id, "demenager", rayon);
        else if (connu.modifie !== empreinte(o)) enfiler(espace, nom, id, "ecrire", rayon);
      }
    }

    // disparus : connus du miroir, absents du local
    const vivants = new Set(locaux.map((o) => o.id));
    for (const espace of Object.keys(miroir)) {
      const connus = vus(espace, nom);
      for (const id of Object.keys(connus)) {
        if (!vivants.has(id)) enfiler(espace, nom, id, "effacer", connus[id].rayon);
      }
    }
  }

  repérerLesBibliotheques();
  annoncer(file.length ? "enAttente" : conflits.length ? "conflit" : "aJour");
  if (file.length) poussée();
}

/* Pour chaque groupe partagé : les exercices que ses séances emploient
   doivent exister à côté du groupe. On compare à ce qu'on y a déjà mis. */
function repérerLesBibliotheques() {
  for (const groupeId of partages) {
    const espace = espaceDuGroupe(groupeId);
    if (!espace) continue;
    const connus = vus(espace, "bibliotheques");
    const voulus = new Map();
    for (const se of Store.seances.toutes()) {
      if (se.groupeId !== groupeId) continue;
      for (const b of se.blocs || []) {
        const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
        if (ex) voulus.set(ex.id, ex);
      }
    }
    for (const [id, ex] of voulus) {
      const cle = `${groupeId}/${id}`;
      const connu = connus[cle];
      if (!connu || connu.modifie !== empreinte(ex)) enfiler(espace, "bibliotheques", cle, "ecrire", groupeId);
    }
    for (const cle of Object.keys(connus)) {
      if (!cle.startsWith(`${groupeId}/`)) continue;
      if (!voulus.has(cle.slice(groupeId.length + 1))) enfiler(espace, "bibliotheques", cle, "effacer", groupeId);
    }
  }
}

/* ── Pousser ──────────────────────────────────────────────────── */

function poussée() {
  clearTimeout(horlogePoussee);
  horlogePoussee = setTimeout(() => {
    if (!pousseeEnCours) pousseeEnCours = pousser().finally(() => (pousseeEnCours = null));
  }, DELAI_POUSSEE);
}

/* On envoie par rayon, pas par objet. La première synchronisation
   d'une bibliothèque installée pousse tous les exercices fournis :
   un par requête, ce sont autant d'allers-retours, soit une
   minute pendant laquelle rien n'a l'air de marcher. En un PATCH par
   rayon, c'est une poignée de requêtes. Les règles valident chaque
   enfant du lot séparément, donc la garde de révision tient exactement
   pareil, et un effacement voyage dans le même lot en `null`. */
async function pousser() {
  if (!Distant.connecte() || !file.length) return;
  annoncer("envoi");

  for (const t of file.filter((x) => x.action === "demenager").slice()) {
    const ancien = vus(t.espace, t.collection)[t.id];
    if (!ancien || !ancien.rayon) continue;
    try {
      await Distant.effacer(chemin(t.espace, t.collection, ancien.rayon, t.id));
      delete vus(t.espace, t.collection)[t.id];
      garderMiroir();
    } catch (e) {
      if (e instanceof HorsLigne) return annoncer("horsLigne");
      return annoncer("erreur", e.message);
    }
  }

  const paquets = new Map();
  for (const t of file) {
    const cle = `${t.espace}|${t.collection}|${t.rayon || ""}`;
    if (!paquets.has(cle)) paquets.set(cle, { espace: t.espace, collection: t.collection, rayon: t.rayon, taches: [] });
    paquets.get(cle).taches.push(t);
  }
  for (const p of paquets.values()) {
    for (let i = 0; i < p.taches.length; i += PAR_LOT) {
      if (!(await envoyerLot(p.espace, p.collection, p.rayon, p.taches.slice(i, i + PAR_LOT)))) return;
    }
  }
  annoncer(conflits.length ? "conflit" : "aJour");
}

/* Un exercice de bibliothèque de groupe est identifié « groupe/id »
   dans la file : c'est ce qui permet au même exercice d'être suivi
   séparément dans chaque groupe partagé où il sert. */
function objetDeLaTache(nom, id) {
  if (nom !== "bibliotheques") return COLLECTIONS[nom].get(id);
  return Store.exercices.get(id.split("/").slice(1).join("/"));
}

async function envoyerLot(espace, nom, rayon, lot) {
  const connus = vus(espace, nom);
  const charge = {};
  const revs = {};
  for (const { id, action } of lot) {
    const cleDistante = nom === "bibliotheques" ? id.split("/").slice(1).join("/") : id;
    if (action === "effacer") {
      charge[cleDistante] = null;
      continue;
    }
    const local = objetDeLaTache(nom, id);
    if (!local) {
      defiler(espace, nom, id);
      continue;
    }
    const rev = ((connus[id] && connus[id].rev) || 0) + 1;
    charge[cleDistante] = { ...local, rev, updatedBy: Distant.monEspace() };
    revs[id] = { rev, modifie: empreinte(local), rayon };
  }
  if (!Object.keys(charge).length) return true;

  try {
    await Distant.fusionner(cheminRayon(espace, nom, rayon), charge);
  } catch (e) {
    if (e instanceof HorsLigne) {
      annoncer("horsLigne");
      return false;
    }
    if (e.code === "PERMISSION_DENIED") {
      // On m'a retiré ce groupe pendant que j'écrivais. Ce n'est pas une
      // panne : on oublie ces tâches et le prochain tirage nettoiera.
      for (const { id } of lot) defiler(espace, nom, id);
      return true;
    }
    if (e.code && e.code.startsWith("HTTP_4")) {
      // Le lot est refusé en bloc et le serveur ne dit pas lequel : on
      // rejoue un par un pour trouver celui dont la révision a bougé
      // ailleurs, et les autres passent quand même.
      if (lot.length > 1) {
        for (const t of lot) if (!(await envoyerLot(espace, nom, rayon, [t]))) return false;
        return true;
      }
      await signalerConflit(espace, nom, lot[0].id);
      return false;
    }
    annoncer("erreur", e.message);
    return false;
  }

  for (const [id, v] of Object.entries(revs)) connus[id] = v;
  for (const { id, action } of lot) {
    if (action === "effacer") delete connus[id];
    defiler(espace, nom, id);
  }
  garderMiroir();
  return true;
}

/* ── Tirer ────────────────────────────────────────────────────── */

function aplatir(nom, branche) {
  const out = [];
  if (!branche) return out;
  if (!COLLECTIONS[nom] || !COLLECTIONS[nom].rayon) {
    for (const objet of Object.values(branche)) if (objet && objet.id) out.push({ rayon: null, objet });
    return out;
  }
  for (const [rayon, contenu] of Object.entries(branche)) {
    for (const objet of Object.values(contenu || {})) if (objet && objet.id) out.push({ rayon, objet });
  }
  return out;
}

async function tirer() {
  if (!Distant.connecte()) return;
  const moi = Distant.monEspace();
  const recus = [];

  // mon espace, en une requête
  try {
    const mien = await Distant.lire(`espaces/${moi}`);
    if (mien) recus.push({ espace: moi, branches: mien, complet: true });
  } catch (e) {
    if (e instanceof HorsLigne) return annoncer("horsLigne");
    return annoncer("erreur", e.message);
  }

  // les groupes qu'on m'a confiés, chacun dans l'espace de son
  // propriétaire : deux requêtes par groupe, plus une pour ses exercices
  const vivants = [];
  for (const c of confies) {
    try {
      const [fiche, seances, biblio] = await Promise.all([
        Distant.lire(`espaces/${c.espace}/groupes/${c.groupe}`),
        Distant.lire(`espaces/${c.espace}/seances/${c.groupe}`),
        Distant.lire(`espaces/${c.espace}/bibliotheques/${c.groupe}`),
      ]);
      if (!fiche) continue; // le groupe a disparu
      vivants.push(c);
      recus.push({
        espace: c.espace,
        branches: {
          groupes: { [c.groupe]: fiche },
          seances: { [c.groupe]: seances || {} },
          bibliotheques: { [c.groupe]: biblio || {} },
        },
        complet: false,
      });
    } catch (e) {
      if (e instanceof HorsLigne) return annoncer("horsLigne");
      // accès retiré : le groupe sort de ma liste, ses données restent
      // sur mon appareil — on ne retire pas du travail sous les pieds
    }
  }
  if (vivants.length !== confies.length) {
    confies = vivants;
    Storage.ecrire("confies", confies);
  }

  const aAppliquer = { exercices: [], groupes: [], seances: [] };
  const aEffacer = { exercices: [], groupes: [], seances: [] };

  for (const { espace, branches, complet } of recus) {
    for (const nom of ["exercices", "groupes", "seances", "bibliotheques"]) {
      const cible = nom === "bibliotheques" ? "exercices" : nom;
      const connus = vus(espace, nom);
      const arrives = aplatir(nom, branches[nom]);
      const presents = new Set();

      for (const { rayon, objet } of arrives) {
        const cle = nom === "bibliotheques" ? `${rayon}/${objet.id}` : objet.id;
        presents.add(cle);
        const connu = connus[cle];
        if (connu && connu.rev >= objet.rev && connu.rayon === rayon) continue;
        if (enFile(espace, nom, cle)) {
          await signalerConflit(espace, nom, cle, objet);
          continue;
        }
        aAppliquer[cible].push(objet);
        connus[cle] = { rev: objet.rev, modifie: objet.modifie || 0, rayon };
      }

      // un tirage partiel ne prouve rien sur ce qu'il n'a pas demandé
      if (!complet && nom !== "bibliotheques") continue;
      for (const cle of Object.keys(connus)) {
        if (presents.has(cle)) continue;
        if (enFile(espace, nom, cle)) continue;
        if (nom !== "bibliotheques") aEffacer[cible].push(cle);
        delete connus[cle];
      }
    }
  }

  const rien = !Object.values(aAppliquer).some((l) => l.length) && !Object.values(aEffacer).some((l) => l.length);
  garderMiroir();
  if (rien) return annoncer(file.length ? "enAttente" : conflits.length ? "conflit" : "aJour");

  // Le miroir est posé AVANT d'écrire dans le Store : le signal que
  // l'écriture déclenche repasserait sinon par le diff, qui remettrait
  // aussitôt en file ce qu'on vient de recevoir.
  enApplication = true;
  try {
    for (const [nom, liste] of Object.entries(aAppliquer)) {
      if (liste.length) COLLECTIONS[nom].installer(liste.map(nettoyer));
    }
    for (const id of aEffacer.seances) COLLECTIONS.seances.supprimer(id);
    for (const id of aEffacer.exercices) COLLECTIONS.exercices.supprimer(id);
    for (const id of aEffacer.groupes) COLLECTIONS.groupes.supprimer(id);
  } finally {
    enApplication = false;
  }
  annoncer(file.length ? "enAttente" : conflits.length ? "conflit" : "aJour");
}

/* `rev` et `updatedBy` appartiennent au transport, pas à l'exercice.
   On les retire avant d'entrer dans le Store : ils ressortiraient sinon
   dans l'export JSON, où ils ne veulent rien dire. */
function nettoyer(o) {
  const { rev, updatedBy, ...reste } = o;
  return reste;
}

/* ── Conflits ─────────────────────────────────────────────────── */

const NOM_LOCAL = (nom, id) => (nom === "bibliotheques" ? id.split("/").slice(1).join("/") : id);

/* ── Deux objets identiques ne sont pas un conflit ──────────────

   La file dit « j'ai quelque chose à pousser », pas « le contenu
   diverge ». Après un miroir vide — nouvel appareil, navigateur
   changé, session réouverte, `oublier()` puis reconnexion — TOUT part
   en file, parce qu'aucun objet n'est « connu ». Le premier tirage
   demandait alors de trancher entre deux versions rigoureusement
   identiques, autant de fois qu'il y a d'objets. On compare donc les
   deux côtés avant de déranger le coach.

   La comparaison passe par les réparateurs du Store, DES DEUX CÔTÉS :
   une base Realtime ne renvoie ni tableau vide ni `null`, si bien
   qu'une séance identique revient sans son `blocs` et paraîtrait
   différente. Elle ignore aussi ce qui appartient au transport
   (`rev`, `updatedBy`) et l'horodatage : deux enregistrements sans
   retouche donnent deux `modifie` différents pour un même contenu, et
   il n'y a rien à trancher là.

   Elle n'ignore rien d'autre. Dans le doute — un champ absent d'un
   côté, une date de création manquante — les empreintes diffèrent et
   le conflit s'affiche : on ne se tait que lorsqu'on est sûr. */

const SAINS = { exercices: exerciceSain, groupes: groupeSain, seances: seanceSaine };
const HORS_COMPARAISON = new Set(["rev", "updatedBy", "modifie"]);

function empreinteContenu(v) {
  if (Array.isArray(v)) return `[${v.map(empreinteContenu).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .filter((k) => !HORS_COMPARAISON.has(k))
      .sort()
      .map((k) => `${JSON.stringify(k)}:${empreinteContenu(v[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v === undefined ? null : v);
}

export function memeContenu(collection, local, distant) {
  if (!local || !distant) return false;
  const sain = SAINS[collection];
  if (!sain) return false;
  return empreinteContenu(sain(local)) === empreinteContenu(sain(distant));
}

/* Le distant est pris sans rien demander : c'est le cas où il n'y a
   rien à décider, parce que les deux côtés disent la même chose. */
function accepterDistant(espace, nom, cle, distant) {
  const collection = nom === "bibliotheques" ? "exercices" : nom;
  const connus = vus(espace, nom);
  const rayon = nom === "bibliotheques" ? cle.split("/")[0] : connus[cle] ? connus[cle].rayon : rayonDe(collection, distant);
  defiler(espace, nom, cle);
  connus[cle] = { rev: distant.rev, modifie: distant.modifie || 0, rayon };
  enApplication = true;
  try {
    COLLECTIONS[collection].installer([nettoyer(distant)]);
  } finally {
    enApplication = false;
  }
  garderMiroir();
}

async function signalerConflit(espace, nom, id, distantConnu = null) {
  let distant = distantConnu;
  if (!distant) {
    const connu = vus(espace, nom)[id];
    try {
      distant = await Distant.lire(chemin(espace, nom, connu && connu.rayon, NOM_LOCAL(nom, id)));
    } catch (e) {
      distant = null;
    }
  }
  const collection = nom === "bibliotheques" ? "exercices" : nom;
  const idLocal = NOM_LOCAL(nom, id);

  // rien à trancher si les deux versions disent la même chose
  if (distant && memeContenu(collection, COLLECTIONS[collection].get(idLocal), distant)) {
    accepterDistant(espace, nom, id, distant);
    annoncer(file.length ? "enAttente" : conflits.length ? "conflit" : "aJour");
    return;
  }

  if (!conflits.some((c) => c.espace === espace && c.branche === nom && c.id === idLocal)) {
    conflits.push({ espace, branche: nom, collection, id: idLocal, cle: id, distant, local: COLLECTIONS[collection].get(idLocal) });
  }
  annoncer("conflit");
}

/* Deux issues, et c'est le coach qui tranche : on ne fusionne jamais
   deux versions d'une séance à sa place. */
async function resoudre(collection, id, garder) {
  const c = conflits.find((x) => x.collection === collection && x.id === id);
  if (!c) return;
  const connus = vus(c.espace, c.branche);
  if (garder === "distant") {
    defiler(c.espace, c.branche, c.cle);
    if (c.distant) {
      connus[c.cle] = { rev: c.distant.rev, modifie: c.distant.modifie || 0, rayon: connus[c.cle] ? connus[c.cle].rayon : null };
      enApplication = true;
      try {
        COLLECTIONS[collection].installer([nettoyer(c.distant)]);
      } finally {
        enApplication = false;
      }
    }
  } else {
    const local = COLLECTIONS[collection].get(id);
    const rayon = c.branche === "bibliotheques" ? c.cle.split("/")[0] : rayonDe(collection, local || {});
    connus[c.cle] = { rev: c.distant ? c.distant.rev : 0, modifie: -1, rayon };
    enfiler(c.espace, c.branche, c.cle, "ecrire", rayon);
  }
  garderMiroir();
  conflits = conflits.filter((x) => !(x.collection === collection && x.id === id));
  annoncer(conflits.length ? "conflit" : file.length ? "enAttente" : "aJour");
  if (!conflits.length && file.length) poussée();
}

/* ── Le cycle ─────────────────────────────────────────────────── */

/* Qui co-coache quoi : les groupes confiés, et les miens qui ont au
   moins un coach en plus de moi. Rafraîchi à chaque tour complet, parce
   que c'est ce qui décide de recopier ou non les exercices d'un groupe. */
async function relireLesPartages() {
  if (!Distant.connecte()) return;
  try {
    confies = await Distant.groupesConfies();
    Storage.ecrire("confies", confies);
  } catch (e) {
    /* on garde la liste connue */
  }
  const ensemble = new Set(confies.map((c) => c.groupe));
  try {
    const miens = await Distant.lire(`espaces/${Distant.monEspace()}/coachs`);
    for (const [groupe, coachs] of Object.entries(miens || {})) {
      if (Object.keys(coachs || {}).length) ensemble.add(groupe);
    }
  } catch (e) {
    /* pas grave : on garde ce qu'on savait */
  }
  marquerPartages([...ensemble]);
}

export const Synchro = {
  etat: () => etat,
  conflits: () => conflits.slice(),
  confies: () => confies.slice(),
  estPartage: (groupeId) => partages.has(groupeId),
  espaceDuGroupe,
  resoudre,
  relireLesPartages,

  surEtat(f) {
    ecoutes.add(f);
    return () => ecoutes.delete(f);
  },

  async demarrer() {
    if (!Distant.connecte() || desabonner) return;
    desabonner = Store.abonner(() => repérerLesChangements());
    window.addEventListener("online", surRetourReseau);
    document.addEventListener("visibilitychange", surReveil);
    minuteur = setInterval(() => this.maintenant(), PERIODE);
    await this.maintenant();
  },

  arreter() {
    if (desabonner) desabonner();
    desabonner = null;
    window.removeEventListener("online", surRetourReseau);
    document.removeEventListener("visibilitychange", surReveil);
    clearInterval(minuteur);
    clearTimeout(horlogePoussee);
    minuteur = null;
    annoncer("inactif");
  },

  /* Un tour complet : qui partage quoi, ce qui a bougé ici, ce qui est
     arrivé, puis l'envoi. Dans cet ordre — sinon une modification
     locale non poussée passerait pour un conflit au premier tirage. */
  async maintenant() {
    if (!Distant.connecte()) return;
    await relireLesPartages();
    repérerLesChangements();
    await tirer();
    if (file.length && !pousseeEnCours) {
      pousseeEnCours = pousser().finally(() => (pousseeEnCours = null));
      await pousseeEnCours;
    }
  },

  /* Se déconnecter n'efface rien : les données restent sur cet
     appareil, exactement comme avant tout compte. Seuls le miroir, la
     file et les pointeurs partent — ils ne veulent plus rien dire. */
  oublier() {
    this.arreter();
    miroir = {};
    file = [];
    confies = [];
    conflits = [];
    marquerPartages([]);
    Storage.effacer("miroir3");
    Storage.effacer("file3");
    Storage.effacer("confies");
  },
};

function surRetourReseau() {
  Synchro.maintenant();
}
function surReveil() {
  if (document.visibilityState === "visible") Synchro.maintenant();
}
