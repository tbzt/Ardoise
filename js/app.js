/* App — le démarrage et le routage. Un écran à la fois, choisi par le
   fragment d'URL : #/exercices, #/exercice/<id>, #/seances,
   #/seance/<id>, #/seance/<id>/imprimer, #/seance/<id>/glace. Le bouton « précédent » du
   navigateur marche donc tout seul. */
import { Storage } from "./core/storage.js";
import { Store } from "./core/store.js";
import { Theme } from "./core/theme.js";
import { Archive } from "./core/archive.js";
import { statut, transition } from "./core/dom.js";
import { exercicesDeBase, seancesDeBase } from "./data/catalogue.js";
import { Exercices } from "./widgets/exercices.js";
import { Exercice } from "./widgets/exercice.js";
import { Seances } from "./widgets/seances.js";
import { Seance } from "./widgets/seance.js";
import { Impression } from "./widgets/impression.js";
import { Glace } from "./widgets/glace.js";
import { Bilan } from "./widgets/bilan.js";
import { Groupes } from "./widgets/groupes.js";
import { Groupe } from "./widgets/groupe.js";
import { choisir } from "./widgets/dialogue.js";
import { brancherCompte } from "./widgets/compte.js";
import { brancherRecherche } from "./widgets/recherche.js";

const main = document.getElementById("main");
let ecran = null;

function installerCatalogue(silencieux = false) {
  const n = Store.exercices.installer(exercicesDeBase()).ajoutes;
  const s = Store.seances.installer(seancesDeBase()).ajoutes;
  if (silencieux) return;
  if (n || s) statut(`Catalogue installé : ${n} exercice${n > 1 ? "s" : ""}${s ? ` et ${s} séance${s > 1 ? "s" : ""} type` : ""}.`, { duree: 4000 });
  else statut("Le catalogue est déjà entièrement présent.");
}

function router() {
  // Le montage d'un écran est un remplacement brutal du contenu de
  // <main>. Enveloppé dans une transition de vue, il devient un fondu ;
  // sans elle, c'est exactement le comportement d'avant.
  transition(monter);
}

function monter() {
  // un second « # » désigne une ancre dans l'écran (#/seance/x/bilan)
  const h = location.hash.replace(/^#\/?/, "").split("#")[0];
  const [nom, id, action] = h.split("/");
  if (ecran && ecran.detruire) ecran.detruire();
  ecran = null;
  if (!location.hash.includes("#", 1)) window.scrollTo(0, 0);

  /* L'accueil est « Séances », et non plus la bibliothèque : on ouvre
     Ardoise pour préparer ou mener sa prochaine séance, pas pour
     parcourir toute la bibliothèque. */
  let actif = "seances";
  if (nom === "exercices") {
    ecran = Exercices.afficher(main);
    actif = "exercices";
  } else if (nom === "exercice" && id) {
    ecran = Exercice.afficher(main, id, action);
    actif = "exercices";
  } else if (nom === "seances") {
    ecran = Seances.afficher(main);
    actif = "seances";
  } else if (nom === "seance" && id && action === "imprimer") {
    ecran = Impression.afficher(main, id);
    actif = "seances";
  } else if (nom === "seance" && id && action === "glace") {
    // l'ancienne ancre #bilan menait au bas du bord de glace ; le bilan
    // a maintenant son écran, et les liens d'avant continuent d'y mener
    if (location.hash.endsWith("#bilan")) {
      location.replace(`#/seance/${id}/bilan`);
      return;
    }
    ecran = Glace.afficher(main, id);
    actif = "seances";
  } else if (nom === "seance" && id && action === "bilan") {
    ecran = Bilan.afficher(main, id);
    actif = "seances";
  } else if (nom === "seance" && id) {
    ecran = Seance.afficher(main, id);
    actif = "seances";
  } else if (nom === "groupes") {
    ecran = Groupes.afficher(main);
    actif = "groupes";
  } else if (nom === "groupe" && id) {
    ecran = Groupe.afficher(main, id);
    actif = "groupes";
  } else ecran = Seances.afficher(main);

  document.querySelectorAll("#modes a").forEach((a) => a.classList.toggle("actif", a.dataset.ecran === actif));
  /* Le mode « Entraîner » masque la barre de l'appli : il lui faut donc
     un nom à lui, et non celui de la première partie de l'adresse, qui
     vaut « seance » aussi bien pour la préparation que pour le banc. */
  document.body.dataset.ecran = (nom === "seance" && action) || nom || "seances";
}


/* ── Démarrage ─────────────────────────────────────────────────── */

Theme.brancher(document.getElementById("act-theme"));
brancherRecherche(document.getElementById("act-recherche"));

/* Le compte est facultatif : sans lui, rien de ce qui suit ne
   s'exécute et l'appli est exactement celle d'avant. */
brancherCompte({
  bouton: document.getElementById("act-compte"),
  indicateur: document.getElementById("etat-synchro"),
  entree: document.getElementById("entree-compte"),
});

if (!Storage.lire("initialise", false)) {
  installerCatalogue(true);
  Storage.ecrire("initialise", true);
}
// les séances d'avant les groupes portaient un nom en texte libre
Store.rattacherGroupes();

/* Le menu se referme dès qu'on y a choisi quelque chose, et au clic
   dehors ou sur Échap : un <details> ouvert qui reste ouvert donne
   l'impression que le clic n'a pas été pris. */
const menuSysteme = document.getElementById("menu-systeme");
const fermerMenu = () => (menuSysteme.open = false);
menuSysteme.addEventListener("click", (e) => {
  if (e.target.closest(".menu-liste button")) fermerMenu();
});
document.addEventListener("click", (e) => {
  if (menuSysteme.open && !menuSysteme.contains(e.target)) fermerMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuSysteme.open) fermerMenu();
});

document.getElementById("act-exporter").addEventListener("click", () => Archive.exporter());
const fichier = document.getElementById("fichier-archive");
document.getElementById("act-importer").addEventListener("click", () => fichier.click());
fichier.addEventListener("change", async () => {
  const f = fichier.files[0];
  fichier.value = "";
  if (!f) return;
  // « OK pour remplacer, Annuler pour fusionner » : une confirmation qui
  // demande de choisir entre deux actions par oui et non se lit à
  // l'envers une fois sur deux. Deux boutons nommés, donc.
  const mode = await choisir({
    titre: "Importer ce fichier",
    options: [
      { id: "fusion", libelle: "Fusionner", detail: "ajoute ce qui manque et met à jour ce qui est plus récent — vos données restent" },
      { id: "remplacer", libelle: "Remplacer tout", detail: "efface vos exercices, séances et groupes, et met ceux du fichier à la place" },
    ],
  });
  if (!mode) return;
  try {
    const r = await Archive.importer(f, mode);
    const bilan = (c, mot) => `${c.ajoutes} ${mot}${c.ajoutes > 1 ? "s" : ""} ajouté${c.ajoutes > 1 ? "s" : ""}${c.misAJour ? `, ${c.misAJour} mis à jour` : ""}`;
    statut(`Import terminé : ${bilan(r.exercices, "exercice")} ; ${bilan(r.seances, "séance")}.`, { duree: 5000 });
    router();
  } catch (e) {
    statut(e.message, { duree: 6000 });
  }
});
document.getElementById("act-catalogue").addEventListener("click", () => installerCatalogue());
/* Le seul geste qui garde une confirmation explicite : il est global,
   il n'a pas d'objet à ramener, et un « Annuler » de cinq secondes ne
   protège pas d'une saison entière perdue. On propose d'exporter
   d'abord, dans le même dialogue. */
document.getElementById("act-vider").addEventListener("click", async () => {
  const quoi = Store.tout();
  const choix = await choisir({
    titre: "Tout effacer de ce navigateur ?",
    options: [
      { id: "exporter", libelle: "Exporter d'abord", detail: `télécharge vos ${quoi.exercices.length} exercices, ${quoi.seances.length} séances et ${quoi.groupes.length} groupes, puis revient ici` },
      { id: "effacer", libelle: "Effacer maintenant", detail: "sans retour possible" },
    ],
  });
  if (choix === "exporter") {
    Archive.exporter();
    statut("Données exportées. Relancez « Tout effacer » si vous voulez toujours effacer.", { duree: 6000 });
    return;
  }
  if (choix !== "effacer") return;
  Store.vider();
  statut("Tout est vide. « Réinstaller le catalogue » remet les exercices fournis.", { duree: 5000 });
  location.hash = "#/exercices";
});

/* Les en-têtes de rayon de la bibliothèque collent SOUS la barre, dont
   la hauteur change quand elle se replie sur un téléphone. On la mesure
   plutôt que de l'écrire en dur, où elle se démentirait au premier
   changement de libellé. */
const barre = document.querySelector(".barre");
function mesurerLaBarre() {
  document.documentElement.style.setProperty("--haut-barre", `${Math.round(barre.getBoundingClientRect().height)}px`);
}
mesurerLaBarre();
if (window.ResizeObserver) new ResizeObserver(mesurerLaBarre).observe(barre);
else window.addEventListener("resize", mesurerLaBarre);

window.addEventListener("hashchange", router);
router();
