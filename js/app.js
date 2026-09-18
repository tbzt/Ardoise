/* App — le démarrage et le routage. Un écran à la fois, choisi par le
   fragment d'URL : #/exercices, #/exercice/<id>, #/seances,
   #/seance/<id>, #/seance/<id>/imprimer. Le bouton « précédent » du
   navigateur marche donc tout seul. */
import { Storage } from "./core/storage.js";
import { Store } from "./core/store.js";
import { Theme } from "./core/theme.js";
import { Archive } from "./core/archive.js";
import { statut } from "./core/dom.js";
import { exercicesDeBase, seanceDeBase } from "./data/catalogue.js";
import { Exercices } from "./widgets/exercices.js";
import { Exercice } from "./widgets/exercice.js";
import { Seances } from "./widgets/seances.js";
import { Seance } from "./widgets/seance.js";
import { Impression } from "./widgets/impression.js";

const main = document.getElementById("main");
let ecran = null;

function installerCatalogue(silencieux = false) {
  const n = Store.exercices.installer(exercicesDeBase());
  const s = Store.seances.installer([seanceDeBase()]);
  if (silencieux) return;
  if (n || s) statut(`Catalogue installé : ${n} exercice${n > 1 ? "s" : ""}${s ? " et une séance type" : ""}.`, 4000);
  else statut("Le catalogue est déjà entièrement présent.");
}

function router() {
  const h = location.hash.replace(/^#\/?/, "");
  const [nom, id, action] = h.split("/");
  if (ecran && ecran.detruire) ecran.detruire();
  ecran = null;
  window.scrollTo(0, 0);

  let actif = "exercices";
  if (nom === "exercice" && id) ecran = Exercice.afficher(main, id);
  else if (nom === "seances") {
    ecran = Seances.afficher(main);
    actif = "seances";
  } else if (nom === "seance" && id && action === "imprimer") {
    ecran = Impression.afficher(main, id);
    actif = "seances";
  } else if (nom === "seance" && id) {
    ecran = Seance.afficher(main, id);
    actif = "seances";
  } else ecran = Exercices.afficher(main);

  document.querySelectorAll("#modes a").forEach((a) => a.classList.toggle("actif", a.dataset.ecran === actif));
  document.body.dataset.ecran = nom || "exercices";
}

function compteurs() {
  const e = Store.exercices.tous().length;
  const s = Store.seances.toutes().length;
  document.getElementById("compteurs").textContent = `${e} exercice${e > 1 ? "s" : ""} · ${s} séance${s > 1 ? "s" : ""}`;
}

/* ── Démarrage ─────────────────────────────────────────────────── */

Theme.brancher(document.getElementById("act-theme"));

if (!Storage.lire("initialise", false)) {
  installerCatalogue(true);
  Storage.ecrire("initialise", true);
}

document.getElementById("act-exporter").addEventListener("click", () => Archive.exporter());
const fichier = document.getElementById("fichier-archive");
document.getElementById("act-importer").addEventListener("click", () => fichier.click());
fichier.addEventListener("change", async () => {
  const f = fichier.files[0];
  fichier.value = "";
  if (!f) return;
  const remplacer = confirm("Remplacer toutes vos données par celles du fichier ?\n\n« OK » : remplacer. « Annuler » : fusionner (n'ajouter que ce qui manque).");
  try {
    const r = await Archive.importer(f, remplacer ? "remplacer" : "fusion");
    statut(`Import terminé : ${r.exercices} exercice(s), ${r.seances} séance(s).`, 4000);
    router();
  } catch (e) {
    alert(e.message);
  }
});
document.getElementById("act-catalogue").addEventListener("click", () => installerCatalogue());
document.getElementById("act-vider").addEventListener("click", () => {
  if (!confirm("Tout effacer ? Exercices et séances seront supprimés de ce navigateur. Pensez à exporter avant.")) return;
  Store.vider();
  statut("Tout est vide. Le bouton Catalogue réinstalle les exercices fournis.", 4000);
  location.hash = "#/exercices";
});

Store.abonner(compteurs);
compteurs();
window.addEventListener("hashchange", router);
router();
