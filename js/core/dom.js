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

export function statut(message, duree = 2500) {
  const p = document.getElementById("statut");
  if (!p) return;
  p.textContent = message;
  p.hidden = false;
  clearTimeout(statut._h);
  statut._h = setTimeout(() => (p.hidden = true), duree);
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
