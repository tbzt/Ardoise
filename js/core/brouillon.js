/* Brouillon — propose un déroulé de séance à partir de la bibliothèque
   et de l'historique du groupe. Ce n'est pas une IA : c'est une suite
   de règles qu'un coach reconnaît, et chaque choix vient avec sa raison.

   La structure suit ce que font les fédérations pour des débutants :
   échauffement court, un gros bloc de patinage, trois habiletés
   (palet, passes, tirs), du jeu, un retour au calme. Les parts de temps
   viennent de CIBLE, corrigées par ce que le groupe a peu travaillé
   récemment. Dans chaque catégorie, on préfère ce qui n'a jamais été
   fait, ce que le dernier bilan a marqué « à revoir », ce qui est du
   niveau du groupe — et on évite ce qu'on a fait la dernière fois. */
import { Store, blocDepuisExercice, blocLibre } from "./store.js";
import { CATEGORIES } from "../data/catalogue.js";
import { CIBLE, seancesFaites, repartition, usageExercices, formaterCourt } from "./analyse.js";

const ORDRE = ["echauffement", "patinage", "maniement", "passe", "tir", "jeu", "retour"];
const MAXIMUM = { echauffement: 1, patinage: 3, maniement: 2, passe: 2, tir: 2, jeu: 2, retour: 1 };

function melange(n) {
  return (Math.random() - 0.5) * n;
}

/* Les minutes visées par catégorie : la cible, corrigée par les
   déficits des quatre dernières séances, puis ramenée au temps dispo. */
function objectifsMinutes(dispo, faites) {
  const recentes = faites.slice(-4);
  const { minutes, total } = repartition(recentes);
  // une seule séance d'historique ne justifie pas de tout basculer :
  // la correction monte en puissance avec le nombre de séances connues
  const confiance = Math.min(1, recentes.length / 3);
  const poids = {};
  const accents = [];
  for (const cat of ORDRE) {
    let p = CIBLE[cat];
    if (total && CIBLE[cat] >= 10) {
      const part = ((minutes[cat] || 0) / total) * 100;
      const ecart = (CIBLE[cat] - part) / CIBLE[cat]; // > 0 : sous-servi
      const correction = Math.max(-0.3, Math.min(0.5, ecart)) * confiance;
      p = CIBLE[cat] * (1 + correction);
      if (correction >= 0.25) accents.push(cat);
    }
    // le patinage est le socle des débutants : jamais sous 22 % du temps
    if (cat === "patinage") p = Math.max(p, 22);
    poids[cat] = p;
  }
  const somme = Object.values(poids).reduce((a, b) => a + b, 0);
  const out = {};
  for (const cat of ORDRE) out[cat] = (poids[cat] / somme) * dispo;
  return { objectifs: out, accents };
}

function score(ex, u, groupe, nbFaites) {
  let s = 0;
  const raisons = [];
  if (!u) {
    s += 3;
    raisons.push("jamais fait avec ce groupe");
  } else {
    if (u.rang === 0) {
      s -= 3;
      raisons.push("fait la dernière fois");
    } else if (u.rang === 1) s -= 1;
    else if (u.rang >= 3) {
      s += 1;
      raisons.push(`pas fait depuis ${u.rang + 1} séances`);
    }
    const derniereNote = u.notes[u.notes.length - 1];
    if (derniereNote === 1 && u.rang <= 1) {
      s += 3;
      raisons.push(`« à revoir » au bilan du ${formaterCourt(u.derniere)}`);
    } else if (u.notes.length >= 2 && u.notes.every((n) => n === 3) && u.fois >= 3) {
      s -= 1;
      raisons.push("déjà bien acquis");
    }
  }
  const niveauGroupe = groupe ? groupe.niveau : "debutant";
  if (ex.niveau === "intermediaire" && niveauGroupe === "debutant") {
    s -= nbFaites >= 6 ? 1.5 : 4;
    if (nbFaites >= 6) raisons.push("intermédiaire : le groupe a déjà six séances");
  } else if (ex.niveau === "debutant" && niveauGroupe === "intermediaire") s -= 1;
  else if (ex.niveau === niveauGroupe || ex.niveau === "tous") s += 0.5;
  s += melange(1.2); // un peu de hasard : deux propositions ne sont pas identiques
  return { s, raisons };
}

/* Le brouillon : blocs, objectif suggéré, et une explication par bloc. */
export function proposerDeroule(se) {
  const groupe = se.groupeId ? Store.groupes.get(se.groupeId) : null;
  const faites = se.groupeId ? seancesFaites(se.groupeId).filter((s) => s.id !== se.id) : [];
  const usage = usageExercices(faites);
  // les fiches FFHG déjà travaillées par le groupe, via les exercices faits
  const techniquesVues = new Set();
  for (const u of usage.values()) {
    const ex = Store.exercices.get(u.exerciceId);
    for (const code of (ex && ex.techniques) || []) techniquesVues.add(code);
  }
  const D = Math.max(20, Number(se.duree_glace) || 60);
  const pause = D >= 50 ? 2 : 0;
  const dispo = D - pause;
  const { objectifs, accents } = objectifsMinutes(dispo, faites);

  const bibli = Store.exercices.tous().filter((e) => e.categorie !== "gardien");
  const pris = new Set();
  const blocs = [];
  const explications = [];
  const reprises = [];

  for (const cat of ORDRE) {
    let restant = objectifs[cat];
    let n = 0;
    const candidats = bibli
      .filter((e) => e.categorie === cat && !pris.has(e.id))
      .map((e) => {
        const sc = score(e, usage.get(e.id), groupe, faites.length);
        const neuves = (e.techniques || []).filter((c) => !techniquesVues.has(c));
        if (neuves.length && faites.length) {
          sc.s += 1;
          sc.raisons.push(`technique FFHG pas encore travaillée (${neuves[0]})`);
        }
        return { e, ...sc };
      })
      .sort((a, b) => b.s - a.s);
    while (restant > 2 && n < MAXIMUM[cat] && candidats.length) {
      // le meilleur qui tient dans le temps restant (avec une tolérance
      // pour le premier bloc de la catégorie), sinon le meilleur tout court
      const tolerance = n === 0 ? 3 : 1;
      let i = candidats.findIndex((c) => (c.e.duree || 5) <= restant + tolerance);
      if (i < 0) i = 0;
      // un exercice franchement déconseillé (niveau, fait la dernière fois)
      // ne sert pas à boucher un trou : on laisse le temps à l'ajustement
      if (n > 0 && candidats[i].s < -1.5) break;
      const [c] = candidats.splice(i, 1);
      const duree = Math.max(3, Math.min(c.e.duree || 5, Math.round(restant + tolerance)));
      const b = blocDepuisExercice(c.e);
      b.duree = duree;
      blocs.push(b);
      pris.add(c.e.id);
      explications.push({ titre: c.e.nom, categorie: cat, raisons: c.raisons.length ? c.raisons : ["complète la catégorie"] });
      if (c.raisons.some((r) => r.startsWith("« à revoir »"))) reprises.push(c.e.nom);
      restant -= duree;
      n++;
    }
  }

  // la pause eau après les habiletés, avant le jeu
  if (pause) {
    const iJeu = blocs.findIndex((b) => {
      const ex = Store.exercices.get(b.exerciceId);
      return ex && ex.categorie === "jeu";
    });
    const p = blocLibre("Pause eau", pause);
    if (iJeu >= 0) blocs.splice(iJeu, 0, p);
    else blocs.splice(Math.max(0, blocs.length - 1), 0, p);
  }

  // ajuster au temps de glace : on donne le reste au jeu, on rogne sur le patinage
  let total = blocs.reduce((t, b) => t + b.duree, 0);
  const parCat = (cat) =>
    blocs.filter((b) => {
      const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
      return ex && ex.categorie === cat;
    });
  if (total < D) {
    // le reste va à ce qui est le plus en dessous de son objectif
    const sous = ORDRE.filter((cat) => parCat(cat).length)
      .map((cat) => ({ cat, manque: objectifs[cat] - parCat(cat).reduce((t, b) => t + b.duree, 0) }))
      .sort((a, b) => b.manque - a.manque);
    const cible = sous.length ? parCat(sous[0].cat)[0] : null;
    if (cible) cible.duree += D - total;
  } else if (total > D) {
    // on rogne d'abord les catégories qui dépassent le plus leur objectif,
    // une minute à la fois, jamais sous quatre minutes par bloc
    let exces = total - D;
    let garde = 200;
    while (exces > 0 && garde-- > 0) {
      const depassements = ORDRE.map((cat) => ({ cat, sur: parCat(cat).reduce((t, b) => t + b.duree, 0) - objectifs[cat] }))
        .filter((x) => parCat(x.cat).some((b) => b.duree > 4))
        .sort((a, b) => b.sur - a.sur);
      if (!depassements.length) break;
      const bloc = parCat(depassements[0].cat)
        .filter((b) => b.duree > 4)
        .sort((a, b) => b.duree - a.duree)[0];
      bloc.duree -= 1;
      exces -= 1;
    }
  }

  const morceaux = [];
  const lister = (l) => (l.length > 1 ? `${l.slice(0, -1).join(", ")} et ${l[l.length - 1]}` : l[0]);
  if (accents.length) morceaux.push(`Accent sur ${lister(accents.map((c) => CATEGORIES[c].libelle.toLowerCase()))} (peu travaillé récemment)`);
  if (reprises.length) morceaux.push(`reprise de « ${reprises.slice(0, 2).join(" », « ")} » (à revoir)`);
  if (!faites.length) morceaux.push("Première séance du groupe : une base équilibrée, à ajuster à ce que vous verrez");
  if (!morceaux.length) {
    const neufs = explications.filter((x) => x.raisons.includes("jamais fait avec ce groupe")).length;
    morceaux.push(`Séance équilibrée${neufs ? ` · ${neufs} exercice${neufs > 1 ? "s" : ""} jamais fait${neufs > 1 ? "s" : ""} avec ce groupe` : ""}`);
  }
  const objectif = morceaux.join(" · ");

  return { blocs, objectif, explications, accents, reprises, pause: !!pause };
}
