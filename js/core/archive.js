/* Archive — export et import de toutes les données en un fichier JSON.
   Le format porte sa version : on saura le relire demain. */
import { Store } from "./store.js";

const FORMAT = "ardoise/1";

function telecharger(nom, donnees) {
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slug(texte) {
  return String(texte || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export const Archive = {
  exporter() {
    const donnees = { format: FORMAT, exporte: new Date().toISOString(), ...Store.tout() };
    telecharger(`ardoise-${donnees.exporte.slice(0, 10)}.json`, donnees);
  },

  /* Un exercice seul, dans le même format qu'une archive complète : le
     fichier se réimporte avec le bouton Importer, chez soi ou chez un
     autre coach, sans rien d'autre à savoir. */
  exporterExercice(ex) {
    const donnees = { format: FORMAT, exporte: new Date().toISOString(), exercices: [ex], seances: [] };
    telecharger(`ardoise-exercice-${slug(ex.nom) || ex.id}.json`, donnees);
  },

  /* mode : "fusion" ajoute ce qui manque et met à jour ce qui est plus
     récent ; "remplacer" écrase tout. */
  async importer(fichier, mode = "fusion") {
    const texte = await fichier.text();
    let d;
    try {
      d = JSON.parse(texte);
    } catch (e) {
      throw new Error("Ce fichier n'est pas du JSON lisible.");
    }
    if (!d || d.format !== FORMAT || !Array.isArray(d.exercices) || !Array.isArray(d.seances)) {
      throw new Error("Ce fichier n'est pas une archive Ardoise.");
    }
    if (mode === "remplacer") {
      Store.remplacerTout({ exercices: d.exercices, seances: d.seances });
      return { exercices: { ajoutes: d.exercices.length, misAJour: 0 }, seances: { ajoutes: d.seances.length, misAJour: 0 } };
    }
    return {
      exercices: Store.exercices.installer(d.exercices, { mettreAJour: true }),
      seances: Store.seances.installer(d.seances, { mettreAJour: true }),
    };
  },
};
