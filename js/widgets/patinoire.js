/* Patinoire — dessine la glace et ce qu'on pose dessus.
   Unité : le décimètre. Une patinoire IIHF fait 60 × 30 m, donc
   600 × 300. Les objets d'un schéma sont stockés dans ce repère,
   quelle que soit la vue (entière ou demi-glace) ; une vue n'est
   qu'un cadrage.

   Le module ne connaît ni le DOM interactif ni le Store : il rend
   une chaîne SVG à partir d'un schéma. L'éditeur, les vignettes et
   l'impression s'en servent tous — un seul dessin, trois usages. */

export const VUES = {
  entiere: { x: 0, y: 0, w: 600, h: 300, libelle: "Patinoire entière" },
  moitie: { x: 0, y: 0, w: 310, h: 300, libelle: "Demi-patinoire" },
};

export const COULEURS = {
  noir: "#1b1f24",
  rouge: "#c62828",
  bleu: "#1565c0",
  vert: "#2e7d32",
  orange: "#ef6c00",
};

export const FORMES = {
  X: "Joueur (X)",
  O: "Joueur (O)",
  G: "Gardien",
  C: "Coach",
};

export const STYLES_TRAIT = {
  patin: "Patinage",
  conduite: "Patinage avec palet",
  passe: "Passe",
  tir: "Tir",
  arriere: "Marche arrière",
  libre: "Trait libre",
};

const GLACE = "#f6fafc";
const BANDE = "#3a4a58";
const ROUGE = "#d23c3c";
const BLEU = "#2b62c4";

let compteurSvg = 0;

/* ── La glace ─────────────────────────────────────────────────── */

function fond() {
  const cercle = (cx, cy, c) =>
    `<circle cx="${cx}" cy="${cy}" r="45" fill="none" stroke="${c}" stroke-width="1.5"/>` +
    `<circle cx="${cx}" cy="${cy}" r="3" fill="${c}"/>`;
  const point = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3" fill="${ROUGE}"/>`;
  return [
    `<rect x="1.5" y="1.5" width="597" height="297" rx="85" fill="${GLACE}" stroke="${BANDE}" stroke-width="3"/>`,
    // lignes de but (4 m des bandes) — elles s'arrêtent dans l'arrondi
    `<line x1="40" y1="13" x2="40" y2="287" stroke="${ROUGE}" stroke-width="1.5"/>`,
    `<line x1="560" y1="13" x2="560" y2="287" stroke="${ROUGE}" stroke-width="1.5"/>`,
    // lignes bleues et ligne centrale
    `<rect x="227" y="1.5" width="4" height="297" fill="${BLEU}"/>`,
    `<rect x="369" y="1.5" width="4" height="297" fill="${BLEU}"/>`,
    `<rect x="298" y="1.5" width="4" height="297" fill="${ROUGE}"/>`,
    // cercles
    cercle(300, 150, BLEU),
    cercle(100, 80, ROUGE),
    cercle(100, 220, ROUGE),
    cercle(500, 80, ROUGE),
    cercle(500, 220, ROUGE),
    point(244, 80),
    point(244, 220),
    point(356, 80),
    point(356, 220),
    // zones de but
    `<path d="M40,132 A18,18 0 0 1 40,168 Z" fill="#cfe3f7" stroke="${ROUGE}" stroke-width="1.2"/>`,
    `<path d="M560,168 A18,18 0 0 1 560,132 Z" fill="#cfe3f7" stroke="${ROUGE}" stroke-width="1.2"/>`,
    // cages
    `<rect x="28" y="141" width="12" height="18" fill="#e9eef2" stroke="${ROUGE}" stroke-width="1.5"/>`,
    `<rect x="560" y="141" width="12" height="18" fill="#e9eef2" stroke="${ROUGE}" stroke-width="1.5"/>`,
  ].join("");
}

/* ── Géométrie des traits ─────────────────────────────────────── */

function lisser(pts) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  if (pts.length === 2) return `M${pts[0].x},${pts[0].y} L${pts[1].x},${pts[1].y}`;
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${r(c1x)},${r(c1y)} ${r(c2x)},${r(c2y)} ${p2.x},${p2.y}`;
  }
  return d;
}
const r = (n) => Math.round(n * 10) / 10;

/* Rééchantillonne une polyligne tous les `pas` décimètres. */
function reechantillonner(pts, pas) {
  if (pts.length < 2) return pts.slice();
  const out = [{ ...pts[0] }];
  let reste = pas;
  for (let i = 0; i < pts.length - 1; i++) {
    let a = pts[i];
    const b = pts[i + 1];
    let seg = Math.hypot(b.x - a.x, b.y - a.y);
    while (seg >= reste) {
      const t = reste / seg;
      a = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      out.push(a);
      seg -= reste;
      reste = pas;
    }
    reste -= seg;
  }
  const fin = pts[pts.length - 1];
  const dern = out[out.length - 1];
  if (Math.hypot(fin.x - dern.x, fin.y - dern.y) > pas / 3) out.push({ ...fin });
  else out[out.length - 1] = { ...fin };
  return out;
}

/* Une ondulation le long du chemin : la conduite de palet. */
function vague(pts, pas = 8, amp = 3.5) {
  const ech = reechantillonner(pts, pas);
  if (ech.length < 3) return lisser(pts);
  const out = [ech[0]];
  for (let i = 1; i < ech.length - 1; i++) {
    const p = ech[i - 1];
    const q = ech[i + 1];
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const n = Math.hypot(dx, dy) || 1;
    const s = i % 2 ? amp : -amp;
    out.push({ x: r(ech[i].x - (dy / n) * s), y: r(ech[i].y + (dx / n) * s) });
  }
  out.push(ech[ech.length - 1]);
  return lisser(out);
}

/* Une suite de petits arcs : la marche arrière (poussées en C). */
function arcs(pts, pas = 9) {
  const ech = reechantillonner(pts, pas);
  if (ech.length < 2) return lisser(pts);
  let d = `M${ech[0].x},${ech[0].y}`;
  for (let i = 1; i < ech.length; i++) {
    const rayon = Math.hypot(ech[i].x - ech[i - 1].x, ech[i].y - ech[i - 1].y) / 2;
    d += ` A${r(rayon)},${r(rayon)} 0 0 1 ${r(ech[i].x)},${r(ech[i].y)}`;
  }
  return d;
}

/* ── Les objets ───────────────────────────────────────────────── */

function couleurDe(o) {
  return COULEURS[o.couleur] || COULEURS.noir;
}

function joueur(o, uid) {
  const c = couleurDe(o);
  const halo = `<circle class="halo" r="15" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  let corps;
  switch (o.forme) {
    case "G":
      corps =
        `<circle r="8.5" fill="#fff" stroke="${c}" stroke-width="2.2"/>` +
        `<text y="0.5" font-size="11" font-weight="700" fill="${c}" text-anchor="middle" dominant-baseline="central">G</text>`;
      break;
    case "C":
      corps =
        `<rect x="-8" y="-8" width="16" height="16" rx="3" fill="${c}"/>` +
        `<text y="0.5" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">C</text>`;
      break;
    case "O":
      corps = `<circle r="7.5" fill="#fff" fill-opacity="0.85" stroke="${c}" stroke-width="3"/>`;
      break;
    default:
      corps =
        `<path d="M-6.5,-6.5 L6.5,6.5 M-6.5,6.5 L6.5,-6.5" stroke="#fff" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M-6.5,-6.5 L6.5,6.5 M-6.5,6.5 L6.5,-6.5" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
  }
  const etiquette = o.label
    ? `<text x="9" y="-7" font-size="8.5" font-weight="700" fill="${c}" paint-order="stroke" stroke="#fff" stroke-width="2.5" stroke-linejoin="round">${esc(o.label)}</text>`
    : "";
  return `<g class="obj obj-joueur" data-id="${o.id}" transform="translate(${o.x},${o.y})"><circle r="12" fill="transparent"/>${halo}${corps}${etiquette}</g>`;
}

function palet(o) {
  return `<g class="obj obj-palet" data-id="${o.id}" transform="translate(${o.x},${o.y})"><circle r="8" fill="transparent"/><circle class="halo" r="9" fill="none" stroke="#1b1f24" stroke-width="1.5" stroke-dasharray="3 3"/><circle r="3.5" fill="#1b1f24"/></g>`;
}

function cone(o) {
  const c = o.couleur ? couleurDe(o) : COULEURS.orange;
  return `<g class="obj obj-cone" data-id="${o.id}" transform="translate(${o.x},${o.y})"><circle r="10" fill="transparent"/><circle class="halo" r="11" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M0,-7 L6,5 L-6,5 Z" fill="${c}" stroke="#fff" stroke-width="1"/></g>`;
}

/* Une cage mobile, pour les matchs en travers ou les cages décalées.
   `sens` dit vers où elle s'ouvre : gauche, droite, haut, bas. */
const ROTATIONS = { gauche: 0, droite: 180, haut: 90, bas: 270 };
function cage(o) {
  const rot = ROTATIONS[o.sens] ?? 0;
  return `<g class="obj obj-cage" data-id="${o.id}" transform="translate(${o.x},${o.y}) rotate(${rot})"><rect x="-10" y="-13" width="20" height="26" fill="transparent"/><rect class="halo" x="-10" y="-13" width="20" height="26" fill="none" stroke="${ROUGE}" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M0,-9 L-12,-9 L-12,9 L0,9" fill="#e9eef2" stroke="${ROUGE}" stroke-width="1.8" stroke-linejoin="round"/><line x1="0" y1="-9" x2="0" y2="9" stroke="${ROUGE}" stroke-width="2.4"/></g>`;
}

function texte(o) {
  const c = couleurDe(o);
  const taille = o.taille === "grand" ? 15 : o.taille === "petit" ? 9 : 11.5;
  const lignes = String(o.texte || "").split("\n");
  const spans = lignes
    .map((l, i) => `<tspan x="0" dy="${i === 0 ? 0 : taille * 1.2}">${esc(l) || " "}</tspan>`)
    .join("");
  const larg = Math.max(...lignes.map((l) => l.length), 2) * taille * 0.55;
  const haut = lignes.length * taille * 1.2;
  return `<g class="obj obj-texte" data-id="${o.id}" transform="translate(${o.x},${o.y})"><rect x="-4" y="${-taille}" width="${r(larg + 8)}" height="${r(haut + 6)}" fill="transparent"/><rect class="halo" x="-4" y="${-taille}" width="${r(larg + 8)}" height="${r(haut + 6)}" fill="none" stroke="${c}" stroke-width="1.2" stroke-dasharray="3 3"/><text font-size="${taille}" font-weight="600" fill="${c}" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round" dominant-baseline="middle">${spans}</text></g>`;
}

function trait(o, uid) {
  const c = couleurDe(o);
  const pts = o.pts || [];
  if (pts.length < 2) return "";
  const fleche = `marker-end="url(#fl-${uid}-${o.couleur || "noir"})"`;
  let d, corps;
  switch (o.style) {
    case "conduite":
      d = vague(pts);
      corps = `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ${fleche}/>`;
      break;
    case "passe":
      d = lisser(pts);
      corps = `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-dasharray="8 6" stroke-linecap="round" ${fleche}/>`;
      break;
    case "tir":
      d = lisser(pts);
      corps =
        `<path d="${d}" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="butt" stroke-linejoin="round" ${fleche}/>` +
        `<path d="${d}" fill="none" stroke="${GLACE}" stroke-width="2" stroke-linecap="butt" stroke-linejoin="round"/>`;
      break;
    case "arriere":
      d = arcs(pts);
      corps = `<path d="${d}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" ${fleche}/>`;
      break;
    case "libre":
      d = lisser(pts);
      corps = `<path d="${d}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    default: // patin
      d = lisser(pts);
      corps = `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ${fleche}/>`;
  }
  const guide = lisser(pts);
  return `<g class="obj obj-trait" data-id="${o.id}"><path class="hit" d="${guide}" fill="none" stroke="transparent" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path class="halo" d="${guide}" fill="none" stroke="${c}" stroke-opacity="0.35" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>${corps}</g>`;
}

export function objet(o, uid) {
  switch (o.t) {
    case "joueur":
      return joueur(o, uid);
    case "palet":
      return palet(o);
    case "cone":
      return cone(o);
    case "cage":
      return cage(o);
    case "texte":
      return texte(o);
    case "trait":
      return trait(o, uid);
    default:
      return "";
  }
}

function defs(uid) {
  return (
    "<defs>" +
    Object.entries(COULEURS)
      .map(
        ([nom, c]) =>
          `<marker id="fl-${uid}-${nom}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${c}"/></marker>`,
      )
      .join("") +
    "</defs>"
  );
}

/* ── L'assemblage ─────────────────────────────────────────────── */

/* Rend un schéma complet. `opts.classe` habille le <svg>, `opts.uid`
   force l'identifiant des marqueurs (l'éditeur en garde un stable). */
export function svg(schema, opts = {}) {
  const vue = VUES[schema?.vue] || VUES.entiere;
  const uid = opts.uid || `p${++compteurSvg}`;
  const objets = (schema?.objets || []).map((o) => objet(o, uid)).join("");
  return (
    `<svg class="patinoire ${opts.classe || ""}" viewBox="${vue.x} ${vue.y} ${vue.w} ${vue.h}" xmlns="http://www.w3.org/2000/svg" data-uid="${uid}" role="img" aria-label="Schéma d'exercice">` +
    defs(uid) +
    `<g class="glace">${fond()}</g>` +
    `<g class="objets">${objets}</g>` +
    `</svg>`
  );
}

/* Le contenu seul (sans la balise <svg>), pour que l'éditeur
   rafraîchisse sans recréer l'élément. */
export function contenu(schema, uid) {
  return defs(uid) + `<g class="glace">${fond()}</g>` + `<g class="objets">${(schema.objets || []).map((o) => objet(o, uid)).join("")}</g>`;
}

export function viewBox(vue) {
  const v = VUES[vue] || VUES.entiere;
  return `${v.x} ${v.y} ${v.w} ${v.h}`;
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
