/* Dialogue — une boîte modale native, pour choisir dans une liste.
   Renvoie une promesse : l'identifiant choisi, ou null si on referme. */
import { esc } from "../core/dom.js";

export function choisir({ titre, options, vide = "Rien à proposer." }) {
  return new Promise((resoudre) => {
    const d = document.createElement("dialog");
    d.className = "dialogue";
    d.innerHTML = `
      <form method="dialog">
        <h2>${esc(titre)}</h2>
        ${
          options.length
            ? `<ul class="choix">${options
                .map(
                  (o) =>
                    `<li><button type="submit" value="${esc(o.id)}"><strong>${esc(o.libelle)}</strong>${o.detail ? `<small>${esc(o.detail)}</small>` : ""}</button></li>`,
                )
                .join("")}</ul>`
            : `<p class="vide">${esc(vide)}</p>`
        }
        <div class="dialogue-pied"><button type="submit" value="">Annuler</button></div>
      </form>`;
    document.body.appendChild(d);
    d.addEventListener("close", () => {
      const v = d.returnValue;
      d.remove();
      resoudre(v || null);
    });
    d.showModal();
  });
}
