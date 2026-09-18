/* Éditeur — dessiner un exercice sur la glace, au doigt, au stylet ou
   à la souris. Il ne connaît que son schéma ; l'écran qui l'héberge
   reçoit un signal à chaque modification et décide quoi en faire.

   Deux familles d'outils : on POSE (un joueur, un palet, un cône, un
   texte : un clic) ou on TRACE (un trait : on glisse). L'outil
   « sélection » sert à déplacer et à modifier ce qui est déjà là.
   Toute l'histoire tient dans deux piles de copies du schéma —
   annuler et rétablir sont donc infaillibles, à défaut d'être
   économes, et à cette échelle ça n'a aucune importance. */

import { VUES, COULEURS, FORMES, STYLES_TRAIT, contenu, viewBox } from "./patinoire.js";
import { nouvelId } from "../core/ids.js";
import { esc } from "../core/dom.js";

const UID = "ed";
const LARGEUR = 600;
const HAUTEUR = 300;

const clone = (o) => JSON.parse(JSON.stringify(o));
const arrondi = (n) => Math.round(n * 2) / 2;

const ICONES_TRAIT = {
  patin: '<path d="M2,7 L28,7"/><path d="M27,3 L35,7 L27,11 Z" class="pointe"/>',
  conduite: '<path d="M2,7 q3,-6 6,0 t6,0 t6,0 t6,0"/><path d="M27,3 L35,7 L27,11 Z" class="pointe"/>',
  passe: '<path d="M2,7 L28,7" stroke-dasharray="5 3"/><path d="M27,3 L35,7 L27,11 Z" class="pointe"/>',
  tir: '<path d="M2,5 L27,5 M2,9 L27,9"/><path d="M27,2 L36,7 L27,12 Z" class="pointe"/>',
  arriere: '<path d="M2,8 a3,3 0 0 1 6,0 a3,3 0 0 1 6,0 a3,3 0 0 1 6,0 a3,3 0 0 1 6,0"/><path d="M27,4 L35,8 L27,12 Z" class="pointe"/>',
  libre: '<path d="M2,9 c4,-8 8,-8 12,-2 s8,6 12,-2 s6,-4 9,0"/>',
};

function icone(style) {
  return `<svg class="icone-trait" viewBox="0 0 38 14" aria-hidden="true">${ICONES_TRAIT[style]}</svg>`;
}

/* Ramer-Douglas-Peucker : garde les points qui comptent. */
function simplifier(pts, tol) {
  if (pts.length < 3) return pts;
  const a = pts[0];
  const b = pts[pts.length - 1];
  let imax = 0;
  let dmax = 0;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const n = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d = Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / n;
    if (d > dmax) {
      dmax = d;
      imax = i;
    }
  }
  if (dmax <= tol) return [a, b];
  const g = simplifier(pts.slice(0, imax + 1), tol);
  const d = simplifier(pts.slice(imax), tol);
  return g.slice(0, -1).concat(d);
}

function longueur(pts) {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return l;
}

export function creerEditeur(conteneur, schemaInitial, { onChange } = {}) {
  let schema = clone(schemaInitial || {});
  if (!VUES[schema.vue]) schema.vue = "entiere";
  if (!Array.isArray(schema.objets)) schema.objets = [];

  let outil = "sel";
  let couleur = "noir";
  let selection = null;
  const passe = [];
  const futur = [];

  /* état transitoire d'un geste en cours */
  let trace = null; // { style, pts, el }
  let glisse = null; // { id, depart:{x,y}, avant, bouge }

  conteneur.classList.add("editeur");
  conteneur.innerHTML = `
    <div class="outils" role="toolbar" aria-label="Outils de dessin">
      <select class="vue" title="Cadrage de la glace">
        ${Object.entries(VUES)
          .map(([k, v]) => `<option value="${k}">${v.libelle}</option>`)
          .join("")}
      </select>
      <div class="groupe" role="group" aria-label="Sélection">
        <button type="button" class="outil" data-outil="sel" title="Sélectionner, déplacer (Échap)">Sélection</button>
      </div>
      <div class="groupe" role="group" aria-label="Poser">
        <button type="button" class="outil glyphe" data-outil="jX" title="Joueur X">X</button>
        <button type="button" class="outil glyphe" data-outil="jO" title="Joueur O">O</button>
        <button type="button" class="outil glyphe" data-outil="jG" title="Gardien">G</button>
        <button type="button" class="outil glyphe" data-outil="jC" title="Coach">C</button>
        <button type="button" class="outil glyphe" data-outil="palet" title="Palet">●</button>
        <button type="button" class="outil glyphe" data-outil="cone" title="Cône">▲</button>
        <button type="button" class="outil glyphe" data-outil="texte" title="Texte">Aa</button>
      </div>
      <div class="groupe" role="group" aria-label="Tracer">
        ${Object.entries(STYLES_TRAIT)
          .map(([k, v]) => `<button type="button" class="outil trait" data-outil="l:${k}" title="${v}">${icone(k)}</button>`)
          .join("")}
      </div>
      <div class="groupe couleurs" role="group" aria-label="Couleur">
        ${Object.entries(COULEURS)
          .map(([k, c]) => `<button type="button" class="couleur" data-couleur="${k}" style="--c:${c}" title="${k}"></button>`)
          .join("")}
      </div>
      <div class="groupe" role="group" aria-label="Historique">
        <button type="button" data-act="annuler" title="Annuler (Ctrl+Z)">Annuler</button>
        <button type="button" data-act="retablir" title="Rétablir (Ctrl+Y)">Rétablir</button>
        <button type="button" data-act="effacer" title="Repartir d'une glace vierge">Tout effacer</button>
      </div>
    </div>
    <div class="props" hidden></div>
    <div class="cadre"><svg class="patinoire interactive" data-uid="${UID}" xmlns="http://www.w3.org/2000/svg"></svg></div>
    <p class="aide">Un clic pose l'objet choisi ; un glissé trace le trait choisi. En sélection : cliquer pour choisir, glisser pour déplacer, Suppr pour retirer.</p>
  `;

  const svg = conteneur.querySelector("svg.interactive");
  const outilsEl = conteneur.querySelector(".outils");
  const propsEl = conteneur.querySelector(".props");
  const vueEl = conteneur.querySelector(".vue");

  /* ── Rendu ─────────────────────────────────────────────────── */

  function objetSel() {
    return selection ? schema.objets.find((o) => o.id === selection) || null : null;
  }

  function rendre() {
    svg.setAttribute("viewBox", viewBox(schema.vue));
    svg.innerHTML = contenu(schema, UID);
    if (selection) {
      const g = svg.querySelector(`[data-id="${selection}"]`);
      if (g) g.classList.add("sel");
      else selection = null;
    }
    peindreOutils();
    peindreProps();
  }

  function peindreOutils() {
    outilsEl.querySelectorAll(".outil").forEach((b) => b.classList.toggle("actif", b.dataset.outil === outil));
    outilsEl.querySelectorAll(".couleur").forEach((b) => b.classList.toggle("actif", b.dataset.couleur === couleur));
    outilsEl.querySelector('[data-act="annuler"]').disabled = passe.length === 0;
    outilsEl.querySelector('[data-act="retablir"]').disabled = futur.length === 0;
    vueEl.value = schema.vue;
    svg.dataset.outil = outil;
  }

  function peindreProps() {
    const o = objetSel();
    if (!o) {
      propsEl.hidden = true;
      propsEl.innerHTML = "";
      return;
    }
    let champs = "";
    if (o.t === "joueur") {
      champs +=
        `<span class="prop-nom">Joueur</span>` +
        `<div class="groupe" role="group" aria-label="Forme">${Object.entries(FORMES)
          .map(([k, v]) => `<button type="button" class="glyphe ${o.forme === k ? "actif" : ""}" data-prop="forme" data-val="${k}" title="${v}">${k}</button>`)
          .join("")}</div>` +
        `<label>Étiquette <input name="label" value="${esc(o.label || "")}" maxlength="6" placeholder="1, D, A…"></label>`;
    } else if (o.t === "texte") {
      champs +=
        `<span class="prop-nom">Texte</span>` +
        `<label>Texte <input name="texte" value="${esc(o.texte || "")}" placeholder="Consigne, numéro d'étape…"></label>` +
        `<label>Taille <select name="taille"><option value="petit"${o.taille === "petit" ? " selected" : ""}>Petit</option><option value="moyen"${!o.taille || o.taille === "moyen" ? " selected" : ""}>Moyen</option><option value="grand"${o.taille === "grand" ? " selected" : ""}>Grand</option></select></label>`;
    } else if (o.t === "trait") {
      champs +=
        `<span class="prop-nom">Trait</span>` +
        `<label>Style <select name="style">${Object.entries(STYLES_TRAIT)
          .map(([k, v]) => `<option value="${k}"${o.style === k ? " selected" : ""}>${v}</option>`)
          .join("")}</select></label>`;
    } else if (o.t === "cone") {
      champs += `<span class="prop-nom">Cône</span>`;
    } else {
      champs += `<span class="prop-nom">Palet</span>`;
    }
    if (o.t !== "palet") {
      champs += `<div class="groupe couleurs" role="group" aria-label="Couleur de l'objet">${Object.entries(COULEURS)
        .map(([k, c]) => `<button type="button" class="couleur ${(o.couleur || (o.t === "cone" ? "orange" : "noir")) === k ? "actif" : ""}" data-prop="couleur" data-val="${k}" style="--c:${c}" title="${k}"></button>`)
        .join("")}</div>`;
    }
    champs += `<span class="spacer"></span><button type="button" class="danger" data-act="supprimer" title="Supprimer (Suppr)">Supprimer</button>`;
    propsEl.innerHTML = champs;
    propsEl.hidden = false;
  }

  /* ── Histoire ──────────────────────────────────────────────── */

  function commettre(avant) {
    passe.push(avant);
    if (passe.length > 100) passe.shift();
    futur.length = 0;
    rendre();
    onChange && onChange(clone(schema));
  }

  function annuler() {
    if (!passe.length) return;
    futur.push(clone(schema));
    schema = passe.pop();
    selection = null;
    rendre();
    onChange && onChange(clone(schema));
  }

  function retablir() {
    if (!futur.length) return;
    passe.push(clone(schema));
    schema = futur.pop();
    selection = null;
    rendre();
    onChange && onChange(clone(schema));
  }

  /* ── Géométrie écran → glace ───────────────────────────────── */

  function point(e) {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return {
      x: arrondi(Math.max(0, Math.min(LARGEUR, p.x))),
      y: arrondi(Math.max(0, Math.min(HAUTEUR, p.y))),
    };
  }

  function idSous(e) {
    const g = e.target.closest && e.target.closest(".obj[data-id]");
    return g ? g.dataset.id : null;
  }

  /* ── Gestes ────────────────────────────────────────────────── */

  function poser(pt) {
    const base = { id: nouvelId("o"), x: pt.x, y: pt.y };
    let o;
    switch (outil) {
      case "jX":
      case "jO":
      case "jG":
      case "jC":
        o = { ...base, t: "joueur", forme: outil[1], label: "", couleur };
        break;
      case "palet":
        o = { ...base, t: "palet" };
        break;
      case "cone":
        o = { ...base, t: "cone", couleur: couleur === "noir" ? "orange" : couleur };
        break;
      case "texte":
        o = { ...base, t: "texte", texte: "Texte", taille: "moyen", couleur };
        break;
      default:
        return;
    }
    const avant = clone(schema);
    schema.objets.push(o);
    selection = o.id;
    commettre(avant);
    if (o.t === "texte") {
      const inp = propsEl.querySelector('input[name="texte"]');
      if (inp) {
        inp.focus();
        inp.select();
      }
    }
  }

  svg.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const pt = point(e);
    if (outil.startsWith("l:")) {
      trace = { style: outil.slice(2), pts: [pt], el: null };
      trace.el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      trace.el.setAttribute("class", "en-cours");
      trace.el.setAttribute("fill", "none");
      trace.el.setAttribute("stroke", COULEURS[couleur]);
      trace.el.setAttribute("stroke-width", "2");
      trace.el.setAttribute("stroke-linecap", "round");
      trace.el.setAttribute("stroke-linejoin", "round");
      trace.el.setAttribute("stroke-dasharray", "4 3");
      svg.appendChild(trace.el);
      svg.setPointerCapture(e.pointerId);
      return;
    }
    if (outil === "sel") {
      const id = idSous(e);
      if (id) {
        selection = id;
        glisse = { id, depart: pt, avant: clone(schema), bouge: false };
        svg.setPointerCapture(e.pointerId);
      } else {
        selection = null;
      }
      rendre();
      return;
    }
    poser(pt);
  });

  svg.addEventListener("pointermove", (e) => {
    if (trace) {
      const pt = point(e);
      const d = trace.pts[trace.pts.length - 1];
      if (Math.hypot(pt.x - d.x, pt.y - d.y) < 1.5) return;
      trace.pts.push(pt);
      trace.el.setAttribute("d", "M" + trace.pts.map((p) => `${p.x},${p.y}`).join(" L"));
      return;
    }
    if (glisse) {
      const pt = point(e);
      const dx = pt.x - glisse.depart.x;
      const dy = pt.y - glisse.depart.y;
      if (!glisse.bouge && Math.hypot(dx, dy) < 1) return;
      glisse.bouge = true;
      const orig = glisse.avant.objets.find((o) => o.id === glisse.id);
      const o = schema.objets.find((o) => o.id === glisse.id);
      if (!orig || !o) return;
      if (o.t === "trait") {
        o.pts = orig.pts.map((p) => ({ x: arrondi(p.x + dx), y: arrondi(p.y + dy) }));
      } else {
        o.x = arrondi(orig.x + dx);
        o.y = arrondi(orig.y + dy);
      }
      const g = svg.querySelector(`[data-id="${o.id}"]`);
      if (g) {
        // remplacer l'élément seul, sans redessiner la glace
        const t = document.createElementNS("http://www.w3.org/2000/svg", "g");
        t.innerHTML = "";
        const wrap = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        wrap.innerHTML = contenu({ vue: schema.vue, objets: [o] }, UID);
        const neuf = wrap.querySelector(".obj");
        if (neuf) {
          neuf.classList.add("sel");
          g.replaceWith(neuf);
        }
      }
    }
  });

  function finir(e) {
    if (trace) {
      trace.el.remove();
      const pts = simplifier(trace.pts, 3);
      const t = trace;
      trace = null;
      if (pts.length >= 2 && longueur(pts) >= 8) {
        const avant = clone(schema);
        const o = { id: nouvelId("o"), t: "trait", style: t.style, pts, couleur };
        schema.objets.push(o);
        selection = o.id;
        commettre(avant);
      }
      return;
    }
    if (glisse) {
      const g = glisse;
      glisse = null;
      if (g.bouge) commettre(g.avant);
      else rendre();
    }
  }
  svg.addEventListener("pointerup", finir);
  svg.addEventListener("pointercancel", finir);

  /* ── Barre d'outils ────────────────────────────────────────── */

  outilsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.outil) {
      outil = b.dataset.outil;
      if (outil !== "sel") selection = null;
      rendre();
      return;
    }
    if (b.dataset.couleur) {
      couleur = b.dataset.couleur;
      const o = objetSel();
      if (o && o.t !== "palet") {
        const avant = clone(schema);
        o.couleur = couleur;
        commettre(avant);
      } else peindreOutils();
      return;
    }
    if (b.dataset.act === "annuler") annuler();
    else if (b.dataset.act === "retablir") retablir();
    else if (b.dataset.act === "effacer") {
      if (!schema.objets.length) return;
      if (!confirm("Effacer tout le schéma ?")) return;
      const avant = clone(schema);
      schema.objets = [];
      selection = null;
      commettre(avant);
    }
  });

  vueEl.addEventListener("change", () => {
    const avant = clone(schema);
    schema.vue = vueEl.value;
    commettre(avant);
  });

  /* ── Propriétés de la sélection ────────────────────────────── */

  propsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const o = objetSel();
    if (!o) return;
    if (b.dataset.act === "supprimer") {
      supprimerSelection();
      return;
    }
    if (b.dataset.prop) {
      const avant = clone(schema);
      o[b.dataset.prop] = b.dataset.val;
      if (b.dataset.prop === "couleur") couleur = b.dataset.val;
      commettre(avant);
    }
  });

  let avantSaisie = null;
  propsEl.addEventListener("input", (e) => {
    const o = objetSel();
    const c = e.target;
    if (!o || !c.name) return;
    if (!avantSaisie) avantSaisie = clone(schema);
    o[c.name] = c.value;
    const g = svg.querySelector(`[data-id="${o.id}"]`);
    if (g) {
      const wrap = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      wrap.innerHTML = contenu({ vue: schema.vue, objets: [o] }, UID);
      const neuf = wrap.querySelector(".obj");
      if (neuf) {
        neuf.classList.add("sel");
        g.replaceWith(neuf);
      }
    }
    if (c.tagName === "SELECT") {
      commettre(avantSaisie);
      avantSaisie = null;
    }
  });
  propsEl.addEventListener("change", () => {
    if (avantSaisie) {
      const a = avantSaisie;
      avantSaisie = null;
      commettre(a);
    }
  });

  function supprimerSelection() {
    const o = objetSel();
    if (!o) return;
    const avant = clone(schema);
    schema.objets = schema.objets.filter((x) => x.id !== o.id);
    selection = null;
    commettre(avant);
  }

  /* ── Clavier ───────────────────────────────────────────────── */

  function surTouche(e) {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    if (!document.body.contains(conteneur)) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      e.shiftKey ? retablir() : annuler();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      retablir();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (selection) {
        e.preventDefault();
        supprimerSelection();
      }
    } else if (e.key === "Escape") {
      outil = "sel";
      selection = null;
      rendre();
    }
  }
  document.addEventListener("keydown", surTouche);

  rendre();

  return {
    schema: () => clone(schema),
    detruire() {
      document.removeEventListener("keydown", surTouche);
    },
  };
}
