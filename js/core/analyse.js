/* Analyse — ce qu'un groupe a déjà fait, et ce que ça dit.
   Rien n'est stocké ici : tout se recalcule à partir des séances et des
   bilans. Les règles sont volontairement simples et lisibles ; un coach
   doit pouvoir comprendre pourquoi l'appli lui dit quelque chose. */
import { Store } from "./store.js";
import { CATEGORIES } from "../data/catalogue.js";

/* Part de temps de glace conseillée, par catégorie, pour un groupe
   d'adultes débutants. Ce n'est pas une loi : c'est le point de départ
   des conseils, et il se lit dans l'écran du groupe. */
export const CIBLE = { echauffement: 8, patinage: 30, maniement: 15, passe: 15, tir: 12, jeu: 15, retour: 5 };

function aujourdhui() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* Une séance compte comme faite si son bilan le dit, ou si sa date est
   passée et qu'elle avait un déroulé. */
export function estFaite(se) {
  if (se.bilan && se.bilan.fait) return true;
  return !!(se.date && se.date < aujourdhui() && se.blocs && se.blocs.length);
}

export function seancesDuGroupe(groupeId) {
  return Store.seances
    .toutes()
    .filter((s) => s.groupeId === groupeId)
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || a.cree - b.cree);
}

export function seancesFaites(groupeId) {
  return seancesDuGroupe(groupeId).filter(estFaite);
}

/* Les blocs réellement faits : le bilan peut en avoir décoché. */
export function blocsFaits(se) {
  const b = (se.bilan && se.bilan.blocs) || {};
  return (se.blocs || []).filter((x) => !(b[x.id] && b[x.id].fait === false));
}

/* Minutes par catégorie sur une liste de séances. Les blocs libres vont
   dans « libre ». */
export function repartition(seances) {
  const minutes = {};
  let total = 0;
  for (const se of seances) {
    for (const b of blocsFaits(se)) {
      const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
      const cat = ex ? ex.categorie : "libre";
      const d = Number(b.duree) || 0;
      minutes[cat] = (minutes[cat] || 0) + d;
      total += d;
    }
  }
  return { minutes, total };
}

/* Pour chaque exercice : combien de fois, la dernière date, il y a
   combien de séances, et les notes de bilan reçues. */
export function usageExercices(seances) {
  const faites = seances.filter(estFaite);
  const carte = new Map();
  faites.forEach((se, i) => {
    const rang = faites.length - 1 - i; // 0 = la plus récente
    const notes = (se.bilan && se.bilan.blocs) || {};
    for (const b of blocsFaits(se)) {
      if (!b.exerciceId) continue;
      if (!carte.has(b.exerciceId)) carte.set(b.exerciceId, { exerciceId: b.exerciceId, titre: b.titre, fois: 0, derniere: null, rang: null, notes: [], minutes: 0 });
      const u = carte.get(b.exerciceId);
      u.fois++;
      u.minutes += Number(b.duree) || 0;
      u.derniere = se.date;
      u.rang = rang;
      u.titre = b.titre || u.titre;
      const n = notes[b.id] && notes[b.id].note;
      if (n) u.notes.push(n);
    }
  });
  return carte;
}

/* À quel point une séance ressemble aux autres du groupe : part des
   exercices déjà dans une même autre séance. */
export function recouvrement(se, autres) {
  const ids = new Set((se.blocs || []).map((b) => b.exerciceId).filter(Boolean));
  if (!ids.size) return { ratio: 0, communs: 0, avec: null };
  let meilleur = { ratio: 0, communs: 0, avec: null };
  for (const autre of autres) {
    if (autre.id === se.id) continue;
    const autresIds = new Set((autre.blocs || []).map((b) => b.exerciceId).filter(Boolean));
    let communs = 0;
    for (const id of ids) if (autresIds.has(id)) communs++;
    const ratio = communs / ids.size;
    if (ratio > meilleur.ratio) meilleur = { ratio, communs, avec: autre };
  }
  return meilleur;
}

/* Les blocs notés « à revoir » dans les dernières séances faites. */
export function aRevoir(seances, n = 3) {
  const faites = seances.filter(estFaite).slice(-n);
  const out = [];
  for (const se of faites) {
    const notes = (se.bilan && se.bilan.blocs) || {};
    for (const b of se.blocs || []) {
      const r = notes[b.id];
      if (r && r.note === 1) out.push({ titre: b.titre, exerciceId: b.exerciceId, date: se.date, commentaire: r.commentaire || "" });
    }
  }
  return out;
}

/* Note moyenne des blocs d'une séance (1 à 3), ou null. */
export function noteMoyenne(se) {
  const notes = Object.values((se.bilan && se.bilan.blocs) || {})
    .map((r) => r.note)
    .filter(Boolean);
  if (!notes.length) return null;
  return notes.reduce((a, b) => a + b, 0) / notes.length;
}

/* Les conseils : des phrases, chacune issue d'une règle nommée. */
export function conseils(groupeId) {
  const faites = seancesFaites(groupeId);
  const out = [];
  if (!faites.length) {
    out.push({ type: "info", texte: "Aucune séance faite avec ce groupe pour l'instant : l'analyse commencera après la première." });
    return out;
  }
  const recentes = faites.slice(-4);
  const { minutes, total } = repartition(recentes);
  if (total) {
    for (const [cat, cible] of Object.entries(CIBLE)) {
      if (cible < 10) continue;
      const part = ((minutes[cat] || 0) / total) * 100;
      if (part < cible / 2) {
        out.push({
          type: "equilibre",
          texte: `Peu de ${CATEGORIES[cat].libelle.toLowerCase()} ${recentes.length > 1 ? `sur les ${recentes.length} dernières séances` : "sur la dernière séance"} : ${Math.round(part)} % du temps, contre ${cible} % conseillé.`,
          categorie: cat,
        });
      }
    }
  }
  // une catégorie absente des trois dernières séances
  const trois = faites.slice(-3);
  if (trois.length >= 2) {
    for (const cat of ["patinage", "passe", "tir", "jeu"]) {
      const presente = trois.some((se) => blocsFaits(se).some((b) => {
        const ex = b.exerciceId ? Store.exercices.get(b.exerciceId) : null;
        return ex && ex.categorie === cat;
      }));
      if (!presente) out.push({ type: "absence", texte: `Pas de ${CATEGORIES[cat].libelle.toLowerCase()} depuis ${trois.length} séances.`, categorie: cat });
    }
  }
  // répétition
  if (faites.length >= 2) {
    const derniere = faites[faites.length - 1];
    const r = recouvrement(derniere, faites.slice(0, -1));
    if (r.ratio >= 0.6) out.push({ type: "repetition", texte: `La dernière séance reprenait ${r.communs} exercice${r.communs > 1 ? "s" : ""} de celle du ${formaterCourt(r.avec.date)} : varier la prochaine.` });
  }
  // à revoir
  const rev = aRevoir(faites, 2);
  if (rev.length) out.push({ type: "revoir", texte: `À retravailler d'après les derniers bilans : ${[...new Set(rev.map((x) => x.titre))].slice(0, 4).join(", ")}.` });
  // exercices jamais faits
  const usage = usageExercices(faites);
  const jamais = Store.exercices.tous().filter((e) => !usage.has(e.id)).length;
  if (jamais) out.push({ type: "info", texte: `${jamais} exercice${jamais > 1 ? "s" : ""} de la bibliothèque n'${jamais > 1 ? "ont" : "a"} jamais été fait${jamais > 1 ? "s" : ""} avec ce groupe.` });
  // bilans manquants
  const sansBilan = faites.filter((se) => !(se.bilan && se.bilan.fait)).length;
  if (sansBilan) out.push({ type: "info", texte: `${sansBilan} séance${sansBilan > 1 ? "s" : ""} passée${sansBilan > 1 ? "s" : ""} sans bilan : deux minutes chacune suffisent pour nourrir l'historique.` });
  return out;
}

export function formaterCourt(iso) {
  if (!iso) return "";
  const [a, m, j] = iso.split("-");
  return `${j}/${m}/${a}`;
}

/* « fait il y a 2 séances », « jamais fait », pour la bibliothèque. */
export function libelleUsage(u) {
  if (!u) return "jamais fait";
  if (u.rang === 0) return `fait la dernière fois`;
  return `fait il y a ${u.rang + 1} séances · ${u.fois}×`;
}
