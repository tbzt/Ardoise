/* Matériel — lire « 10 plots », « 1 palet par joueur », « chasubles »
   dans le texte libre des exercices, et en faire une liste chiffrée
   pour la séance. Le matériel ne s'additionne pas d'un exercice à
   l'autre : on sort les plots une fois, et il en faut autant que
   l'exercice le plus gourmand — donc le maximum, pas la somme. */

const NOMBRES = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, douze: 12, quinze: 15, vingt: 20, trente: 30, quarante: 40, cinquante: 50 };
const SYNONYMES = { cone: "plot", cones: "plots", "cône": "plot", "cônes": "plots" };
const PAR = ["joueur", "joueuse", "duo", "trio", "équipe", "equipe", "groupe", "file", "cercle", "coach", "paire", "atelier", "gardien"];

function normaliser(objet) {
  let o = objet.trim().toLowerCase().replace(/[.\s]+$/, "");
  o = o
    .split(/\s+/)
    .map((m) => SYNONYMES[m] || m)
    .join(" ");
  return o;
}

/* La clé de regroupement : sans pluriel, sans accents. */
function cle(objet) {
  return normaliser(objet)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/(\w)s\b/g, "$1")
    .replace(/\s+/g, " ");
}

/* « Vingt palets, deux tas. » → [{ n: 20, objet: "palets" }, { n: 2, objet: "tas" }] */
export function analyserMateriel(texte) {
  const out = [];
  const morceaux = String(texte || "")
    .split(/\r?\n|;|,\s+(?=(?:\d+|un|une|deux|trois|quatre|cinq|six|dix|douze|quinze|vingt|trente)\b)/i)
    .map((m) => m.trim().replace(/[.\s]+$/, ""))
    .filter(Boolean);
  for (const m of morceaux) {
    if (/^aucun/i.test(m)) continue;
    const re = new RegExp(`^(\\d+|${Object.keys(NOMBRES).join("|")})\\s+(.+?)(?:\\s+par\\s+(${PAR.join("|")}))?$`, "i");
    const r = re.exec(m);
    if (r) {
      const n = /^\d+$/.test(r[1]) ? Number(r[1]) : NOMBRES[r[1].toLowerCase()];
      out.push({ n, objet: normaliser(r[2]), par: r[3] ? r[3].toLowerCase() : null, brut: m });
    } else {
      const rp = new RegExp(`^(.+?)\\s+par\\s+(${PAR.join("|")})$`, "i").exec(m);
      if (rp) out.push({ n: 1, objet: normaliser(rp[1]), par: rp[2].toLowerCase(), brut: m });
      else out.push({ n: null, objet: normaliser(m), par: null, brut: m });
    }
  }
  return out;
}

/* Le cumul pour une séance : par objet, le maximum demandé, et qui le
   demande. `exercices` : [{ titre, materiel }]. */
export function cumulMateriel(exercices) {
  const carte = new Map();
  for (const { titre, materiel } of exercices) {
    for (const item of analyserMateriel(materiel)) {
      const k = `${cle(item.objet)}|${item.par || ""}`;
      if (!carte.has(k)) carte.set(k, { objet: item.objet, par: item.par, n: item.n, exercices: [], details: [] });
      const c = carte.get(k);
      if (item.n !== null && (c.n === null || item.n > c.n)) {
        c.n = item.n;
        c.objet = item.objet;
      }
      if (!c.exercices.includes(titre)) c.exercices.push(titre);
      c.details.push({ titre, n: item.n });
    }
  }
  const liste = [...carte.values()];
  liste.sort((a, b) => (b.n !== null) - (a.n !== null) || (b.n || 0) - (a.n || 0) || a.objet.localeCompare(b.objet, "fr"));
  return liste;
}

export function libelleMateriel(c) {
  const quoi = c.n !== null ? `${c.n} ${c.objet}` : c.objet.charAt(0).toUpperCase() + c.objet.slice(1);
  return c.par ? `${quoi} par ${c.par}` : quoi;
}
