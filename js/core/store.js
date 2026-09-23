/* Store — la vérité de l'appli : les exercices et les séances.
   Deux collections en mémoire, recopiées dans Storage à chaque
   écriture, et un signal « ça a changé » pour les écrans. */
import { Storage } from "./storage.js";
import { nouvelId } from "./ids.js";
import { aujourdhuiIso, sansAccents } from "./dom.js";

let exercices = Storage.lire("exercices", []);
let seances = Storage.lire("seances", []);
let groupes = Storage.lire("groupes", []);
const abonnes = new Set();

function notifier(quoi) {
  for (const f of abonnes) f(quoi);
}

function persisterExercices() {
  Storage.ecrire("exercices", exercices);
  notifier("exercices");
}
function persisterSeances() {
  Storage.ecrire("seances", seances);
  notifier("seances");
}
function persisterGroupes() {
  Storage.ecrire("groupes", groupes);
  notifier("groupes");
}

/* Un exercice vide, complet : chaque champ existe, même vide, pour que
   les écrans n'aient jamais à tester l'absence. */
export function exerciceVierge() {
  return {
    id: nouvelId("ex"),
    nom: "",
    categorie: "patinage",
    niveau: "debutant",
    duree: 10,
    objectif: "",
    description: "",
    points_cles: [],
    corrections: [],
    techniques: [],
    forme: "",
    materiel: "",
    variantes: "",
    schema: { vue: "entiere", objets: [] },
    cree: Date.now(),
    modifie: Date.now(),
  };
}

/* La durée de glace d'une séance sans groupe. Avec un groupe, c'est
   la sienne qui vaut : un créneau ne change pas d'une semaine sur
   l'autre, et la retaper à chaque fois est une corvée qui finit par
   se tromper. */
export const GLACE_PAR_DEFAUT = 60;

export function seanceVierge() {
  return {
    id: nouvelId("se"),
    titre: "",
    date: aujourdhuiIso(),
    heure: "",
    groupe: "",
    groupeId: null,
    lieu: "",
    duree_glace: GLACE_PAR_DEFAUT,
    objectif: "",
    notes: "",
    blocs: [],
    bilan: null,
    cree: Date.now(),
    modifie: Date.now(),
  };
}

/* Un groupe (une équipe, une section) : c'est par lui qu'on garde
   l'historique — ce qu'on a déjà fait ensemble, comment ça s'est passé. */
export function groupeVierge() {
  return {
    id: nouvelId("gr"),
    nom: "",
    niveau: "debutant",
    description: "",
    // le créneau du groupe : repris par toutes ses séances
    duree_glace: GLACE_PAR_DEFAUT,
    cycles: [],
    cree: Date.now(),
    modifie: Date.now(),
  };
}

/* Un cycle : quelques semaines avec un thème, des catégories à
   pousser et des techniques à viser. Le brouillon s'y cale. */
export function cycleVierge() {
  return { id: nouvelId("cy"), nom: "", debut: "", fin: "", categories: [], techniques: [], note: "" };
}

/* Le bilan d'une séance, rempli après coup. Par bloc : fait ou non,
   une note à trois crans (1 à revoir, 2 correct, 3 bien) et un mot.
   Global : présents, une note sur cinq, et ce qu'il faut retenir. */
export function bilanVierge() {
  return { fait: false, date: null, presents: null, note: null, retenir: "", blocs: {} };
}

/* Un bloc de séance : soit un exercice de la bibliothèque (exerciceId
   renseigné, titre recopié pour survivre à sa suppression), soit un
   bloc libre (pause, échauffement hors glace, mot du coach). */
export function blocDepuisExercice(ex) {
  return { id: nouvelId("bl"), exerciceId: ex.id, titre: ex.nom, duree: ex.duree || 5, note: "" };
}
export function blocLibre(titre = "", duree = 5) {
  return { id: nouvelId("bl"), exerciceId: null, titre, duree, note: "" };
}

/* Une pause occupe du temps de glace, mais il n'y a rien à y juger :
   « Pause eau — à revoir » ne veut rien dire, et la ligne encombrait un
   bilan qu'on remplit debout, en deux minutes, avec des gants.

   On la reconnaît à son intitulé plutôt qu'à un champ de type : un bloc
   libre n'a que son titre, et une pause écrite l'an dernier n'aurait
   pas eu le champ. Rien à migrer, donc, et les séances déjà bilanées se
   corrigent toutes seules. Un bloc rattaché à un exercice n'est jamais
   une pause, quel que soit son nom. */
const MOTS_PAUSE = /(^|\W)(pause|eau|boire|hydrat|recup|repos|souffler|gourde)/;

export function estPause(b) {
  return !!b && !b.exerciceId && MOTS_PAUSE.test(sansAccents(b.titre || ""));
}

export const Store = {
  abonner(f) {
    abonnes.add(f);
    return () => abonnes.delete(f);
  },

  exercices: {
    tous() {
      return exercices.slice();
    },
    get(id) {
      return exercices.find((e) => e.id === id) || null;
    },
    sauver(ex) {
      ex.modifie = Date.now();
      const i = exercices.findIndex((e) => e.id === ex.id);
      if (i < 0) exercices.push(ex);
      else exercices[i] = ex;
      persisterExercices();
      return ex;
    },
    creer(base = {}) {
      return this.sauver({ ...exerciceVierge(), ...base });
    },
    dupliquer(id) {
      const src = this.get(id);
      if (!src) return null;
      const copie = JSON.parse(JSON.stringify(src));
      copie.id = nouvelId("ex");
      copie.nom = src.nom ? `${src.nom} (copie)` : "";
      copie.cree = Date.now();
      return this.sauver(copie);
    },
    supprimer(id) {
      exercices = exercices.filter((e) => e.id !== id);
      persisterExercices();
    },
    /* Ajoute les exercices absents (par id). Avec `mettreAJour`, remplace
       aussi ceux dont la version importée est plus récente — c'est le cas
       d'un exercice exporté seul, retouché ailleurs, puis rapporté. */
    installer(liste, { mettreAJour = false } = {}) {
      let ajoutes = 0;
      let misAJour = 0;
      for (const ex of liste) {
        const i = exercices.findIndex((e) => e.id === ex.id);
        if (i < 0) {
          exercices.push(ex);
          ajoutes++;
        } else if (mettreAJour && (ex.modifie || 0) > (exercices[i].modifie || 0)) {
          exercices[i] = ex;
          misAJour++;
        }
      }
      if (ajoutes || misAJour) persisterExercices();
      return { ajoutes, misAJour };
    },
  },

  seances: {
    toutes() {
      return seances.slice();
    },
    get(id) {
      return seances.find((s) => s.id === id) || null;
    },
    sauver(se) {
      se.modifie = Date.now();
      const i = seances.findIndex((s) => s.id === se.id);
      if (i < 0) seances.push(se);
      else seances[i] = se;
      persisterSeances();
      return se;
    },
    /* Créée depuis un groupe, une séance prend son créneau. C'est le
       seul endroit où la valeur par défaut se décide : partout
       ailleurs (brouillon, frise, dépassement) elle est déjà là. */
    creer(base = {}) {
      const g = base.groupeId ? Store.groupes.get(base.groupeId) : null;
      const glace = g && Number(g.duree_glace) > 0 ? { duree_glace: Number(g.duree_glace) } : {};
      return this.sauver({ ...seanceVierge(), ...glace, ...base });
    },
    dupliquer(id) {
      const src = this.get(id);
      if (!src) return null;
      const copie = JSON.parse(JSON.stringify(src));
      copie.id = nouvelId("se");
      copie.titre = src.titre ? `${src.titre} (copie)` : "";
      copie.date = aujourdhuiIso();
      copie.blocs.forEach((b) => (b.id = nouvelId("bl")));
      copie.cree = Date.now();
      return this.sauver(copie);
    },
    supprimer(id) {
      seances = seances.filter((s) => s.id !== id);
      persisterSeances();
    },
    installer(liste, { mettreAJour = false } = {}) {
      let ajoutes = 0;
      let misAJour = 0;
      for (const se of liste) {
        const i = seances.findIndex((s) => s.id === se.id);
        if (i < 0) {
          seances.push(se);
          ajoutes++;
        } else if (mettreAJour && (se.modifie || 0) > (seances[i].modifie || 0)) {
          seances[i] = se;
          misAJour++;
        }
      }
      if (ajoutes || misAJour) persisterSeances();
      return { ajoutes, misAJour };
    },
  },

  groupes: {
    tous() {
      return groupes.slice().sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
    },
    get(id) {
      return groupes.find((g) => g.id === id) || null;
    },
    parNom(nom) {
      const n = (nom || "").trim().toLowerCase();
      return n ? groupes.find((g) => (g.nom || "").trim().toLowerCase() === n) || null : null;
    },
    sauver(g) {
      g.modifie = Date.now();
      const i = groupes.findIndex((x) => x.id === g.id);
      if (i < 0) groupes.push(g);
      else groupes[i] = g;
      persisterGroupes();
      return g;
    },
    creer(base = {}) {
      return this.sauver({ ...groupeVierge(), ...base });
    },
    /* Supprimer un groupe détache ses séances, il ne les efface pas. */
    supprimer(id) {
      groupes = groupes.filter((g) => g.id !== id);
      let touche = false;
      for (const se of seances) {
        if (se.groupeId === id) {
          se.groupeId = null;
          touche = true;
        }
      }
      if (touche) Storage.ecrire("seances", seances);
      persisterGroupes();
    },
    installer(liste, { mettreAJour = false } = {}) {
      let ajoutes = 0;
      let misAJour = 0;
      for (const g of liste) {
        const i = groupes.findIndex((x) => x.id === g.id);
        if (i < 0) {
          groupes.push(g);
          ajoutes++;
        } else if (mettreAJour && (g.modifie || 0) > (groupes[i].modifie || 0)) {
          groupes[i] = g;
          misAJour++;
        }
      }
      if (ajoutes || misAJour) persisterGroupes();
      return { ajoutes, misAJour };
    },
  },

  /* Les séances qui ont encore un nom de groupe en texte libre (avant
     l'existence des groupes) sont rattachées à un groupe du même nom,
     créé au besoin. Idempotent : on peut l'appeler à chaque démarrage. */
  rattacherGroupes() {
    let n = 0;
    for (const se of seances) {
      if (se.groupeId && this.groupes.get(se.groupeId)) continue;
      const nom = (se.groupe || "").trim();
      if (!nom) continue;
      let g = this.groupes.parNom(nom);
      if (!g) g = this.groupes.creer({ nom });
      se.groupeId = g.id;
      n++;
    }
    if (n) Storage.ecrire("seances", seances);
    return n;
  },

  /* Durée totale d'une séance, en minutes. */
  dureeSeance(se) {
    return (se.blocs || []).reduce((t, b) => t + (Number(b.duree) || 0), 0);
  },

  tout() {
    return { exercices: exercices.slice(), seances: seances.slice(), groupes: groupes.slice() };
  },

  remplacerTout({ exercices: ex = [], seances: se = [], groupes: gr = [] }) {
    exercices = ex;
    seances = se;
    groupes = gr;
    Storage.ecrire("exercices", exercices);
    Storage.ecrire("seances", seances);
    Storage.ecrire("groupes", groupes);
    notifier("tout");
  },

  vider() {
    this.remplacerTout({ exercices: [], seances: [], groupes: [] });
  },
};
