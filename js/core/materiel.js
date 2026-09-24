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

/* Le cumul pour une séance : UNE ligne par objet, et qui le demande.

   Le cumul se faisait par objet ET par unité, si bien qu'une séance
   ordinaire affichait trois lignes de palets — « 20 palets », « 1 palet
   par joueur », « 1 palet par duo ». Or au vestiaire, la question n'est
   pas « combien » : un coach ne compte pas ses palets, il prend le seau.
   La question est QUOI — ai-je besoin de chasubles, de crosses à poser
   au sol, des gros boudins de la fédération ? Ce sont ces objets-là
   qu'on oublie, pas les palets.

   Le chiffre ne s'affiche donc que s'il est honnête : quand toutes les
   demandes d'un objet sont des comptes absolus, on donne le maximum (on
   sort les plots une fois, il en faut autant que l'exercice le plus
   gourmand). Dès qu'une demande est « par joueur », « par duo », « par
   file », le total dépend d'un effectif qu'on n'a pas — on nomme alors
   l'objet, et on laisse le détail dire le reste. Mieux vaut « Palets »
   qu'un nombre inventé.

   `exercices` : [{ titre, materiel }]. */
export function cumulMateriel(exercices) {
  const carte = new Map();
  for (const { titre, materiel } of exercices) {
    for (const item of analyserMateriel(materiel)) {
      const k = cle(item.objet);
      if (!carte.has(k)) carte.set(k, { objet: item.objet, n: null, chiffrable: true, exercices: [], details: [] });
      const c = carte.get(k);
      // le pluriel l'emporte : « des palets », pas « du palet »
      if (item.objet.length > c.objet.length) c.objet = item.objet;
      if (item.par || item.n === null) c.chiffrable = false;
      else if (c.n === null || item.n > c.n) c.n = item.n;
      if (!c.exercices.includes(titre)) c.exercices.push(titre);
      c.details.push({ titre, texte: detail(item) });
    }
  }
  /* Par ordre alphabétique, et rien d'autre. Trier par quantité mettait
     « 1 sifflet » avant « chasubles » parce qu'il portait un chiffre —
     un ordre qui prétend hiérarchiser et se trompe. La liste est courte,
     et un ordre stable se retient d'une séance à l'autre. */
  const liste = [...carte.values()].map((c) => ({ ...c, n: c.chiffrable ? c.n : null }));
  liste.sort((a, b) => a.objet.localeCompare(b.objet, "fr"));
  return liste;
}

/* Ce qu'un exercice demande, dit en clair : c'est le détail sous la
   ligne qui rattrape le chiffre qu'on n'affiche plus. */
function detail(item) {
  const quoi = item.n !== null ? `${item.n} ${item.objet}` : item.objet;
  return item.par ? `${quoi} par ${item.par}` : quoi;
}

export function libelleMateriel(c) {
  if (c.n !== null) return `${c.n} ${c.objet}`;
  return c.objet.charAt(0).toUpperCase() + c.objet.slice(1);
}
