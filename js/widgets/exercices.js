/* Bibliothèque — tous les exercices, et de quoi s'y retrouver.

   Deux choses manquaient, et c'est tout ce que cet écran ajoute :

   — DES REPÈRES. Les cartes étaient triées par catégorie, mais sans
     aucun en-tête : on faisait défiler des dizaines de patinoires
     qui se ressemblent toutes, sans jamais savoir où l'on était. Les
     titres de catégorie collent maintenant sous la barre.

   — LE CONTEXTE DU GROUPE. « Jamais fait », « à revoir » : l'appli
     connaissait déjà ces informations, mais ne les montrait que dans
     la colonne latérale d'une séance. Choisir un groupe ici les
     rapporte, et permet de chercher par elles — ce qui est la vraie
     question d'un coach qui prépare : non pas « quels exercices de
     tir existent », mais « lesquels n'ai-je jamais essayés avec eux ». */

import { Store } from "../core/store.js";
import { esc, formaterDuree } from "../core/dom.js";
import { pastille, mention, libelleNiveau, vignette, barreFiltres, filtrer, trier } from "./communs.js";
import { CATEGORIES } from "../data/catalogue.js";
import { seancesFaites, usageExercices, aRevoir, libelleUsage } from "../core/analyse.js";

const filtre = { q: "", categorie: "", groupeId: "", usage: "" };

export const Exercices = {
  afficher(main) {
    const sec = document.createElement("section");
    sec.className = "ecran ecran-liste ecran-bibli";
    main.replaceChildren(sec);

    /* L'écran se peint en deux temps : le cadre une fois, la liste à
       chaque frappe. Le champ de saisie n'est jamais remplacé sous les
       doigts de celui qui tape. */
    const rendre = () => {
      const tous = Store.exercices.tous();
      const groupes = Store.groupes.tous();
      sec.innerHTML = `
        <div class="entete">
          <h1>Bibliothèque ${mention(tous.length)}</h1>
          <span class="spacer"></span>
          <button type="button" class="primaire" data-act="nouveau">Nouvel exercice</button>
        </div>
        ${barreFiltres(filtre)}
        ${
          groupes.length
            ? `<div class="filtres filtres-groupe">
                 <label>Avec
                   <select name="groupeId">
                     <option value="">— aucun groupe —</option>
                     ${groupes.map((g) => `<option value="${g.id}"${filtre.groupeId === g.id ? " selected" : ""}>${esc(g.nom || "Groupe sans nom")}</option>`).join("")}
                   </select>
                 </label>
                 <div class="jeu" role="group" aria-label="Usage">
                   <button type="button" class="${filtre.usage === "" ? "actif" : ""}" data-usage="">Tous</button>
                   <button type="button" class="${filtre.usage === "jamais" ? "actif" : ""}" data-usage="jamais">Jamais fait</button>
                   <button type="button" class="${filtre.usage === "revoir" ? "actif" : ""}" data-usage="revoir">À revoir</button>
                 </div>
               </div>`
            : ""
        }
        <div data-liste></div>`;
      rendreListe();
    };

    const rendreListe = () => {
      const tous = Store.exercices.tous();
      const contexte = contexteGroupe();
      let liste = trier(filtrer(tous, filtre));
      if (contexte && filtre.usage === "jamais") liste = liste.filter((e) => !contexte.usage.has(e.id));
      if (contexte && filtre.usage === "revoir") liste = liste.filter((e) => contexte.revoir.has(e.id));

      const cible = sec.querySelector("[data-liste]");
      if (!tous.length) {
        cible.innerHTML = `<p class="vide">Aucun exercice. Créez-en un, ou réinstallez le <strong>catalogue</strong> (menu ⋯, en haut à droite) pour partir d'une bibliothèque complète pour adultes débutants.</p>`;
        return;
      }
      if (!liste.length) {
        cible.innerHTML = `<p class="vide">Rien ne correspond${filtre.usage ? " à ce filtre pour ce groupe" : " à ce filtre"}.</p>`;
        return;
      }

      // groupées par catégorie, dans l'ordre du catalogue : c'est ce
      // tri-là qui donne son sens aux en-têtes collants
      const parCategorie = new Map();
      for (const e of liste) {
        if (!parCategorie.has(e.categorie)) parCategorie.set(e.categorie, []);
        parCategorie.get(e.categorie).push(e);
      }
      cible.innerHTML = [...parCategorie]
        .map(
          ([cat, exos]) => `
        <section class="rayon">
          <h2 class="tete-rayon" style="--c:${(CATEGORIES[cat] || {}).couleur || "#888"}">
            ${esc((CATEGORIES[cat] || {}).libelle || cat)} ${mention(exos.length)}
          </h2>
          <div class="planche">${exos.map((e) => carte(e, contexte)).join("")}</div>
        </section>`,
        )
        .join("");
    };

    /* Ce que le groupe choisi apprend sur chaque exercice : combien de
       fois il a servi, quand, et si le dernier bilan l'a marqué à
       revoir. Recalculé à chaque rendu — c'est une poignée de séances. */
    function contexteGroupe() {
      if (!filtre.groupeId || !Store.groupes.get(filtre.groupeId)) return null;
      const faites = seancesFaites(filtre.groupeId);
      return {
        usage: usageExercices(faites),
        revoir: new Set(aRevoir(faites, 3).map((r) => r.exerciceId).filter(Boolean)),
      };
    }

    sec.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "nouveau") {
        // un exercice neuf n'a rien à lire : on ouvre l'éditeur
        const ex = Store.exercices.creer();
        location.hash = `#/exercice/${ex.id}/modifier`;
      } else if (b.dataset.cat !== undefined) {
        filtre.categorie = b.dataset.cat;
        sec.querySelectorAll(".filtres .jeu [data-cat]").forEach((c) => c.classList.toggle("actif", c.dataset.cat === filtre.categorie));
        rendreListe();
      } else if (b.dataset.usage !== undefined) {
        filtre.usage = b.dataset.usage;
        sec.querySelectorAll("[data-usage]").forEach((c) => c.classList.toggle("actif", c.dataset.usage === filtre.usage));
        rendreListe();
      }
    });

    sec.addEventListener("input", (e) => {
      if (e.target.name === "q") {
        filtre.q = e.target.value;
        rendreListe();
      }
    });
    sec.addEventListener("change", (e) => {
      if (e.target.name === "groupeId") {
        filtre.groupeId = e.target.value;
        if (!filtre.groupeId) filtre.usage = "";
        rendre();
      }
    });

    const off = Store.abonner(rendre);
    rendre();
    return { detruire: off };
  },
};

/* LA PLANCHE-CONTACT. Cent soixante-sept schémas de patinoire
   dessinés à la main sont l'actif le plus singulier d'Ardoise, et ils
   étaient des vignettes secondaires posées au-dessus d'un bloc de
   texte, dans une carte à bordure et ombre. Ici le schéma EST
   l'objet : plus de cadre, plus d'ombre, la légende dessous. */
function carte(e, contexte) {
  let indice = "";
  if (contexte) {
    const u = contexte.usage.get(e.id);
    const revoir = contexte.revoir.has(e.id);
    indice = mention(libelleUsage(u), u ? "" : "attire") + (revoir ? `<span class="sep">·</span>${mention("↻ à revoir", "alerte")}` : "");
  }
  return `
    <a class="planche-vue" href="#/exercice/${e.id}">
      <div class="vue">${vignette(e.schema)}</div>
      <h3>${esc(e.nom) || "Sans nom"}</h3>
      <p class="sous">${pastille(e.categorie)}<span class="sep">·</span>${mention(formaterDuree(e.duree))}<span class="sep">·</span>${mention(libelleNiveau(e.niveau))}${indice ? `<span class="sep">·</span>${indice}` : ""}</p>
    </a>`;
}
