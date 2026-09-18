/* Theme — trois positions : système (défaut, aucun attribut posé),
   clair, sombre. Le bouton tourne dans cet ordre. */
import { Storage } from "./storage.js";

const ORDRE = ["systeme", "clair", "sombre"];
const LIBELLES = { systeme: "Auto", clair: "Clair", sombre: "Sombre" };

function appliquer(choix) {
  const racine = document.documentElement;
  if (choix === "clair") racine.setAttribute("data-theme", "light");
  else if (choix === "sombre") racine.setAttribute("data-theme", "dark");
  else racine.removeAttribute("data-theme");
}

export const Theme = {
  courant() {
    const v = Storage.lire("theme", "systeme");
    return ORDRE.includes(v) ? v : "systeme";
  },
  suivant() {
    const i = ORDRE.indexOf(this.courant());
    const choix = ORDRE[(i + 1) % ORDRE.length];
    Storage.ecrire("theme", choix);
    appliquer(choix);
    return choix;
  },
  brancher(bouton) {
    const peindre = () => {
      const c = this.courant();
      bouton.textContent = LIBELLES[c];
      bouton.title = `Thème : ${LIBELLES[c].toLowerCase()} — cliquer pour changer`;
    };
    appliquer(this.courant());
    peindre();
    bouton.addEventListener("click", () => {
      this.suivant();
      peindre();
    });
  },
};
