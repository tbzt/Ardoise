/* Store — la vérité de l'appli : les exercices et les séances.
   Deux collections en mémoire, recopiées dans Storage à chaque
   écriture, et un signal « ça a changé » pour les écrans. */
import { Storage } from "./storage.js";
import { nouvelId } from "./ids.js";

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

export function seanceVierge() {
  return {
    id: nouvelId("se"),
    titre: "",
    date: aujourdhui(),
    heure: "",
    groupe: "",
    groupeId: null,
    lieu: "",
    duree_glace: 60,
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
    cree: Date.now(),
    modifie: Date.now(),
  };
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
