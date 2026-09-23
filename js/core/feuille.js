/* Feuille — ce que porte une feuille de séance, et dans quel ordre.

   Il y avait deux feuilles de séance : celle de l'écran d'impression et
   celle du PDF, écrites séparément, chacune décidant de son côté ce
   qu'elle montrait. Toute modification devait donc être faite deux
   fois, à la main, sans rien pour signaler l'oubli — et elles avaient
   dérivé : la feuille à l'écran portait les fiches techniques et les
   corrections de chaque exercice, le PDF non.

   Ce module décide du CONTENU : quelles parties, dans quel ordre, avec
   quels libellés. Il ne sait rien du HTML ni du PostScript. Les deux
   moteurs de rendu ne font plus que poser des pixels ou des points.

   Il vit dans le noyau, donc il ne connaît aucun écran : un schéma en
   ressort tel qu'il est stocké, et c'est à celui qui rend de le
   dessiner. */

import { Store } from "./store.js";
import { formaterDate, formaterDuree, heureA } from "./dom.js";
import { CATEGORIES } from "../data/catalogue.js";
import { fiche } from "../data/referentiel.js";

/* Le document, prêt à poser. Les champs vides ne sont pas là : un
   moteur de rendu n'a jamais à tester l'absence, il parcourt ce qu'on
   lui donne. */
export function feuille(se) {
  const total = Store.dureeSeance(se);
  const glace = Number(se.duree_glace) || 0;

  let t = 0;
  const blocs = (se.blocs || []).map((b, i) => {
    const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
    const debut = t;
    t += Number(b.duree) || 0;
    const cat = ex ? CATEGORIES[ex.categorie] : null;
    return {
      numero: i + 1,
      heure: heureA(se.heure, debut),
      duree: Number(b.duree) || 0,
      titre: b.titre || (ex && ex.nom) || "",
      note: b.note || "",
      categorie: cat ? { cle: ex.categorie, libelle: cat.libelle, couleur: cat.couleur } : null,
      exercice: ex,
    };
  });

  return {
    titre: se.titre || "Séance",
    meta: [formaterDate(se.date), se.heure, se.groupe, se.lieu, glace ? `${formaterDuree(glace)} de glace` : ""].filter(Boolean),
    objectif: se.objectif || "",

    plan: {
      colonnes: ["Heure", "Durée", "Bloc", "Note"],
      lignes: blocs.map(({ numero, heure, duree, titre, note, categorie }) => ({ numero, heure, duree, titre, note, categorie })),
      total: {
        minutes: total,
        depasse: glace > 0 && total > glace,
        ecart: glace > 0 ? total - glace : 0,
        libelle: glace > 0 && total > glace ? `Dépasse le temps de glace de ${total - glace} min` : "Total",
      },
    },

    /* Une fiche par bloc qui renvoie à un exercice. Un bloc libre n'a
       rien à détailler : il figure au plan et s'arrête là. */
    fiches: blocs.filter((b) => b.exercice).map(ficheDeBloc),

    notes: se.notes || "",
  };
}

function ficheDeBloc({ heure, duree, titre, note, categorie, exercice: ex }) {
  const parties = [];
  const ajouter = (etiquette, valeur) => {
    if (valeur && (!Array.isArray(valeur) || valeur.length)) parties.push({ etiquette, valeur });
  };

  ajouter("Matériel", ex.materiel);
  ajouter(
    "Fiches techniques",
    (ex.techniques || [])
      .map(fiche)
      .filter(Boolean)
      .map((f) => f.nom),
  );
  ajouter("Corrections", ex.corrections);
  if (note) parties.push({ etiquette: "Pour cette séance", valeur: note, appuye: true });

  return {
    titre,
    /* La ligne qui situe la fiche dans la séance. Elle se compose ici
       une fois, et les deux moteurs la posent telle quelle. */
    situation: [heure, `${duree} min`, categorie ? categorie.libelle : ""].filter(Boolean).join("  ·  "),
    categorie,
    schema: ex.schema,
    objectif: ex.objectif || "",
    description: ex.description || "",
    points: ex.points_cles || [],
    /* Matériel, fiches techniques, corrections, note du bloc : des
       couples étiquette-valeur, dans cet ordre. Les ajouter ici les
       ajoute aux deux sorties du même coup — c'est tout l'objet de ce
       module. */
    parties,
  };
}
