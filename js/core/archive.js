/* Archive — export et import de toutes les données en un fichier JSON.
   Le format porte sa version : on saura le relire demain. */
import { Store } from "./store.js";

const FORMAT = "ardoise/1";

export const Archive = {
  exporter() {
    const donnees = { format: FORMAT, exporte: new Date().toISOString(), ...Store.tout() };
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ardoise-${donnees.exporte.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  /* mode : "fusion" ajoute ce qui manque, "remplacer" écrase tout. */
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
      return { exercices: d.exercices.length, seances: d.seances.length };
    }
    return {
      exercices: Store.exercices.installer(d.exercices),
      seances: Store.seances.installer(d.seances),
    };
  },
};
