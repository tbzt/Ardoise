/* Petits outils de rendu : échapper, formater, débouncer. */

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function debounce(fn, ms = 300) {
  let h = null;
  return (...args) => {
    clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  };
}

/* "2026-09-18" → "vendredi 18 septembre 2026". */
export function formaterDate(iso, opts = {}) {
  if (!iso) return "";
  const [a, m, j] = iso.split("-").map(Number);
  if (!a || !m || !j) return iso;
  const d = new Date(a, m - 1, j);
  const t = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", ...opts });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* La date du jour en ISO. Elle était réécrite à l'identique dans
   quatre fichiers (analyse, glace, bilan, seance) : quatre endroits
   où un fuseau mal choisi se corrigerait trois fois sur quatre. */
export function aujourdhuiIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* « Mar. 30 sept. » — la date en colonne vertébrale de l'écran
   Séances : elle y porte la structure, et doit tenir en deux mots
   sans que la ligne se replie sur un téléphone. */
export function formaterJour(iso) {
  if (!iso) return "";
  const [a, m, j] = iso.split("-").map(Number);
  if (!a || !m || !j) return iso;
  const t = new Date(a, m - 1, j).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* 75 → "1 h 15", 45 → "45 min". */
export function formaterDuree(min) {
  min = Math.round(Number(min) || 0);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} h ${String(r).padStart(2, "0")}` : `${h} h`;
}

/* "20:30" + 15 → "20:45". Sans heure de départ, renvoie "+15'". */
export function heureA(depart, decalageMin) {
  if (!depart) return `${decalageMin}'`;
  const [h, m] = depart.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return `${decalageMin}'`;
  const total = h * 60 + m + decalageMin;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/* Le mot de l'appli, en bas à gauche. Avec `annuler`, il porte un
   bouton qui défait ce qui vient d'être fait : c'est ce qui permet
   d'agir tout de suite plutôt que de demander « êtes-vous sûr ? »
   avant chaque geste. Cinq secondes, le temps de se raviser.

   Un seul message à la fois : un nouveau remplace le précédent, et
   l'annulation du précédent est alors perdue — c'est voulu, une pile
   de regrets serait pire que pas de regret du tout. */
export function statut(message, options = {}) {
  const duree = typeof options === "number" ? options : options.duree || (options.annuler ? 5000 : 2500);
  const annuler = typeof options === "number" ? null : options.annuler;
  const p = document.getElementById("statut");
  if (!p) return;
  clearTimeout(statut._h);
  p.replaceChildren(document.createTextNode(message));
  if (annuler) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "annuler";
    b.textContent = "Annuler";
    b.addEventListener("click", () => {
      clearTimeout(statut._h);
      p.hidden = true;
      annuler();
    });
    p.appendChild(b);
  }
  p.hidden = false;
  statut._h = setTimeout(() => (p.hidden = true), duree);
}

/* Enveloppe un rendu dans une transition de vue quand le navigateur
   sait le faire. Sans elle, le rendu a lieu exactement comme avant :
   l'appel est toujours sûr, et le résultat toujours le même à
   l'écran une fois la transition finie.

   Trois cas où l'on rend sans transition, parce qu'il n'y a rien à
   fondre et que le navigateur rejetterait : le tout premier rendu,
   un onglet en arrière-plan, et un rendu qui en interrompt un autre.
   Les promesses de la transition sont toujours consommées : une
   transition interrompue rejette `ready`, et un rejet non traité
   remonte en erreur dans la console sans que rien n'ait mal
   tourné. */
let enTransition = false;
let premierRendu = true;

export function transition(rendre) {
  const possible =
    typeof document.startViewTransition === "function" && !premierRendu && !enTransition && document.visibilityState === "visible";
  premierRendu = false;
  if (!possible) {
    rendre();
    return;
  }
  enTransition = true;
  const vt = document.startViewTransition(rendre);
  vt.ready.catch(() => {});
  vt.finished.catch(() => {}).finally(() => (enTransition = false));
}

/* « Échauffement » et « echauffement » doivent se trouver l'un
   l'autre : un coach tape sans accent, surtout au téléphone. */
export function sansAccents(texte) {
  return String(texte ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function telechargerBlob(nom, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* Nom de fichier sûr à partir d'un titre. */
export function slug(texte) {
  return String(texte || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
