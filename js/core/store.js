/* Store — la vérité de l'appli : les exercices et les séances.
   Deux collections en mémoire, recopiées dans Storage à chaque
   écriture, et un signal « ça a changé » pour les écrans. */
import { Storage } from "./storage.js";
import { nouvelId } from "./ids.js";

let exercices = Storage.lire("exercices", []);
let seances = Storage.lire("seances", []);
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

function aujourdhui() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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
    materiel: "",
    variantes: "",
    schema: { vue: "entiere", objets: [] },
    cree: Date.now(),
    modifie: Date.now(),
  };
}

export function seanceVierge() {
  return {
    id: nouvelId("se"),
    titre: "",
    date: aujourdhui(),
    heure: "",
    groupe: "",
    lieu: "",
    duree_glace: 60,
    objectif: "",
    notes: "",
    blocs: [],
    cree: Date.now(),
    modifie: Date.now(),
  };
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
    /* Ajoute les exercices absents (par id) sans écraser les présents. */
    installer(liste) {
      let n = 0;
      for (const ex of liste) {
        if (!exercices.some((e) => e.id === ex.id)) {
          exercices.push(ex);
          n++;
        }
      }
      if (n) persisterExercices();
      return n;
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
    creer(base = {}) {
      return this.sauver({ ...seanceVierge(), ...base });
    },
    dupliquer(id) {
      const src = this.get(id);
      if (!src) return null;
      const copie = JSON.parse(JSON.stringify(src));
      copie.id = nouvelId("se");
      copie.titre = src.titre ? `${src.titre} (copie)` : "";
      copie.date = aujourdhui();
      copie.blocs.forEach((b) => (b.id = nouvelId("bl")));
      copie.cree = Date.now();
      return this.sauver(copie);
    },
    supprimer(id) {
      seances = seances.filter((s) => s.id !== id);
      persisterSeances();
    },
    installer(liste) {
      let n = 0;
      for (const se of liste) {
        if (!seances.some((s) => s.id === se.id)) {
          seances.push(se);
          n++;
        }
      }
      if (n) persisterSeances();
      return n;
    },
  },

  /* Durée totale d'une séance, en minutes. */
  dureeSeance(se) {
    return (se.blocs || []).reduce((t, b) => t + (Number(b.duree) || 0), 0);
  },

  tout() {
    return { exercices: exercices.slice(), seances: seances.slice() };
  },

  remplacerTout({ exercices: ex = [], seances: se = [] }) {
    exercices = ex;
    seances = se;
    Storage.ecrire("exercices", exercices);
    Storage.ecrire("seances", seances);
    notifier("tout");
  },

  vider() {
    this.remplacerTout({ exercices: [], seances: [] });
  },
};
