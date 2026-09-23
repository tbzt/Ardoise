/* Distant — le seul module qui parle à un serveur.

   Tout le reste d'Ardoise continue de fonctionner s'il est absent ou
   muet : la vérité de l'appli reste le localStorage, et cette couche
   n'est qu'un moyen de la retrouver sur un autre appareil et de la
   partager avec un autre coach. Sans compte, rien ici ne s'exécute.

   Realtime Database, et pas Firestore : son API REST se consomme au
   simple `fetch`, donc la promesse « aucune dépendance, aucune étape
   de build » tient. Rien n'est importé d'un SDK ici.

   CE QUI EST PUBLIC, ET POURQUOI CE N'EST PAS UN OUBLI
   Les deux constantes ci-dessous sont en clair, et c'est la manière
   normale : dans une application web, la configuration Firebase est un
   identifiant, pas un mot de passe. Elle est lisible dans le trafic
   réseau de n'importe quel visiteur, quoi qu'on fasse. Ce qui protège
   les données est ailleurs — dans `firebase.rules.json`, appliqué côté
   serveur, qui n'accorde la lecture d'un espace qu'à son propriétaire
   et celle d'un groupe qu'aux coachs qu'il a acceptés. Le mot de passe,
   lui, n'entre jamais ici : il est tapé par la personne, et seul le
   jeton qui en résulte est conservé.

   Qui reprend ce dépôt remplace ces deux valeurs par les siennes, et
   publie les règles du dépôt dans sa propre console. */

import { Storage } from "./storage.js";

const BASE = "https://ardoise-24778-default-rtdb.europe-west1.firebasedatabase.app";
const CLE_API = "AIzaSyD44O36wrg2pID4x-cEH8v6SSx8n7mrEYQ";

const IDENTITE = "https://identitytoolkit.googleapis.com/v1/accounts";
const CONNEXION = `${IDENTITE}:signInWithPassword?key=${CLE_API}`;
const INSCRIPTION = `${IDENTITE}:signUp?key=${CLE_API}`;
const COURRIEL = `${IDENTITE}:sendOobCode?key=${CLE_API}`;
const COMPTE = `${IDENTITE}:lookup?key=${CLE_API}`;
const RAFRAICHIR = `https://securetoken.googleapis.com/v1/token?key=${CLE_API}`;

/* Le jeton dure une heure. On le renouvelle un peu avant l'échéance :
   à la seconde près, une requête partie juste avant expirerait en vol. */
const MARGE = 5 * 60 * 1000;

export function configure() {
  return Boolean(BASE && CLE_API);
}

/* ── Les erreurs ────────────────────────────────────────────────
   Firebase répond des codes en majuscules, utiles au développeur et
   opaques à qui prépare une séance. On traduit ceux qu'une personne
   réelle peut rencontrer, et on laisse passer les autres tels quels
   plutôt que d'inventer un message qui masquerait la cause. */

const MESSAGES = {
  EMAIL_NOT_FOUND: "Adresse inconnue.",
  INVALID_PASSWORD: "Mot de passe incorrect.",
  INVALID_LOGIN_CREDENTIALS: "Adresse ou mot de passe incorrect.",
  USER_DISABLED: "Ce compte a été désactivé.",
  TOO_MANY_ATTEMPTS_TRY_LATER: "Trop de tentatives. Réessayez dans quelques minutes.",
  INVALID_EMAIL: "Cette adresse n'est pas une adresse e-mail.",
  MISSING_EMAIL: "Il manque l'adresse e-mail.",
  MISSING_PASSWORD: "Il manque le mot de passe.",
  EMAIL_EXISTS: "Cette adresse a déjà un compte. Connectez-vous.",
  WEAK_PASSWORD: "Mot de passe trop court : six caractères au minimum.",
  "WEAK_PASSWORD : Password should be at least 6 characters": "Mot de passe trop court : six caractères au minimum.",
  UNAUTHORIZED_DOMAIN: "Ce domaine n'est pas autorisé dans le projet Firebase.",
  INVALID_CONTINUE_URI: "Adresse de retour invalide.",
  TOKEN_EXPIRED: "Session expirée. Reconnectez-vous.",
  USER_NOT_FOUND: "Session expirée. Reconnectez-vous.",
  INVALID_REFRESH_TOKEN: "Session expirée. Reconnectez-vous.",
};

export class ErreurDistante extends Error {
  constructor(message, code = "") {
    super(message);
    this.name = "ErreurDistante";
    this.code = code;
  }
}

/* Un conflit n'est pas une panne : c'est deux versions d'un même
   objet. L'appelant reçoit la version distante pour la montrer. */
export class Conflit extends Error {
  constructor(collection, id, distant) {
    super("Cet objet a changé ailleurs.");
    this.name = "Conflit";
    this.collection = collection;
    this.id = id;
    this.distant = distant;
  }
}

export class HorsLigne extends Error {
  constructor() {
    super("Pas de réseau.");
    this.name = "HorsLigne";
  }
}

function lisible(code) {
  if (!code) return "Le serveur n'a pas répondu comme prévu.";
  const exact = MESSAGES[code];
  if (exact) return exact;
  // Firebase suffixe parfois le code : « WEAK_PASSWORD : Password… »
  const tete = String(code).split(" :")[0].trim();
  return MESSAGES[tete] || code;
}

/* ── La session ─────────────────────────────────────────────────
   Le mot de passe n'entre jamais dans le stockage : seulement le
   jeton qu'il a produit, qui expire, et de quoi le renouveler.
   Effacer les données du site déconnecte — c'est le comportement
   attendu, et c'est aussi la porte de sortie. */

let session = Storage.lire("session", null);
const ecoutes = new Set();

function poserSession(s) {
  session = s;
  if (s) Storage.ecrire("session", s);
  else Storage.effacer("session");
  for (const f of ecoutes) f(s);
}

export const Distant = {
  /* ── État ──────────────────────────────────────────────────── */

  configure,

  session() {
    return session;
  },

  connecte() {
    return Boolean(session && session.uid);
  },

  /* L'espace d'un coach, c'est son identifiant de compte : il n'y a
     rien à créer ni à nommer, il naît avec le compte. */
  monEspace() {
    return session ? session.uid : null;
  },

  surSession(f) {
    ecoutes.add(f);
    return () => ecoutes.delete(f);
  },

  /* ── Comptes ───────────────────────────────────────────────── */

  async connexion(courriel, motDePasse) {
    const r = await appelIdentite(CONNEXION, { email: courriel, password: motDePasse, returnSecureToken: true });
    poserSession(depuisReponse(r));
    return session;
  },

  async inscription(courriel, motDePasse) {
    const r = await appelIdentite(INSCRIPTION, { email: courriel, password: motDePasse, returnSecureToken: true });
    poserSession(depuisReponse(r));
    await this.envoyerVerification();
    return session;
  },

  deconnexion() {
    poserSession(null);
  },

  /* Le courriel de vérification, et celui de réinitialisation. Le
     `continueUrl` ramène à l'appli : il doit être servi par un domaine
     autorisé dans la console, sinon Firebase refuse. */
  async envoyerVerification() {
    const jeton = await idToken();
    await appelIdentite(COURRIEL, { requestType: "VERIFY_EMAIL", idToken: jeton, continueUrl: location.origin + location.pathname });
  },

  async envoyerMotDePasseOublie(courriel) {
    await appelIdentite(COURRIEL, { requestType: "PASSWORD_RESET", email: courriel, continueUrl: location.origin + location.pathname });
  },

  /* Firebase ne pousse rien : tant qu'on n'interroge pas, le jeton
     continue d'affirmer que l'adresse n'est pas vérifiée. On le
     demande, et on renouvelle le jeton si ça a changé — les règles
     lisent `email_verified` dans le jeton, pas dans la base. */
  async adresseVerifiee() {
    if (!session) return false;
    if (session.verifie) return true;
    const jeton = await idToken();
    const r = await appelIdentite(COMPTE, { idToken: jeton });
    const verifie = Boolean(r.users && r.users[0] && r.users[0].emailVerified);
    if (verifie && !session.verifie) {
      await renouveler(true);
      poserSession({ ...session, verifie: true });
    }
    return verifie;
  },

  /* ── La base ───────────────────────────────────────────────── */

  async lire(chemin) {
    return await appelBase("GET", chemin);
  },

  async ecrire(chemin, valeur) {
    return await appelBase("PUT", chemin, valeur);
  },

  async fusionner(chemin, valeur) {
    return await appelBase("PATCH", chemin, valeur);
  },

  async effacer(chemin) {
    return await appelBase("DELETE", chemin);
  },

  /* ── Confier un groupe ─────────────────────────────────────── */

  /* Les coachs d'un groupe : le propriétaire, et ceux qui ont accepté.
     Lisible des seuls coachs du groupe. */
  async coachs(espace, groupe) {
    const d = await appelBase("GET", `espaces/${espace}/coachs/${groupe}`);
    return Object.entries(d || {}).map(([uid, c]) => ({ uid, ...c }));
  },

  /* Inviter s'écrit à deux endroits, et les deux servent :
     — le JETON, à la racine, indexé par adresse : c'est le seul endroit
       où l'invité peut trouver une invitation sans connaître d'avance
       l'identifiant de celui qui l'invite ;
     — le SOUVENIR, dans mon espace : c'est le seul endroit où moi je
       peux lister ce que j'ai envoyé, puisque la branche racine est
       indexée par une adresse que je ne peux pas énumérer. */
  async inviter(espace, groupe, nomGroupe, courriel, nomPar) {
    const cle = clefCourriel(courriel);
    const jeton = { nomGroupe, par: espace, nomPar: nomPar || "", le: Date.now() };
    await appelBase("PUT", `invitations/${cle}/${espace}/${groupe}`, jeton);
    await appelBase("PUT", `espaces/${espace}/invitations/${groupe}/${cle}`, { courriel, le: jeton.le });
    return jeton;
  },

  async invitationsEnvoyees(espace, groupe) {
    const d = await appelBase("GET", `espaces/${espace}/invitations/${groupe}`);
    return Object.entries(d || {}).map(([cle, v]) => ({ cle, ...v }));
  },

  async annulerInvitation(espace, groupe, courriel) {
    const cle = clefCourriel(courriel);
    await appelBase("DELETE", `invitations/${cle}/${espace}/${groupe}`);
    await appelBase("DELETE", `espaces/${espace}/invitations/${groupe}/${cle}`);
  },

  /* Retirer un coach lui enlève l'accès à la requête suivante : c'est
     la règle qui le refuse, pas l'interface. Le pointeur qu'il garde
     dans « confiés » est effacé au passage ; s'il échoue (il est chez
     lui, pas chez moi), son appli le nettoiera en constatant que le
     groupe ne se lit plus. */
  async retirerCoach(espace, groupe, uid) {
    await appelBase("DELETE", `espaces/${espace}/coachs/${groupe}/${uid}`);
    try {
      await appelBase("DELETE", `confies/${uid}/${espace}/${groupe}`);
    } catch (e) {
      /* sans importance : son appli s'en apercevra */
    }
  },

  /* Ce qu'on m'a proposé. La branche n'est lisible que par celui dont
     c'est l'adresse vérifiée — d'où la vérification préalable. */
  async mesInvitations() {
    if (!session || !session.courriel) return [];
    if (!(await this.adresseVerifiee())) return [];
    const d = await appelBase("GET", `invitations/${clefCourriel(session.courriel)}`);
    const out = [];
    for (const [espace, groupes] of Object.entries(d || {})) {
      for (const [groupe, v] of Object.entries(groupes || {})) out.push({ espace, groupe, ...v });
    }
    return out;
  },

  /* Accepter, c'est se déposer soi-même dans la liste des coachs — la
     règle vérifie qu'une invitation existe bien pour mon adresse. On
     pose ensuite le pointeur qui me permettra de retrouver ce groupe,
     et on retire le jeton, qui a servi. */
  async accepter(espace, groupe, nom) {
    const moi = session.uid;
    await appelBase("PUT", `espaces/${espace}/coachs/${groupe}/${moi}`, {
      nom: nom || session.courriel,
      courriel: session.courriel,
      depuis: Date.now(),
    });
    const fiche = await appelBase("GET", `espaces/${espace}/groupes/${groupe}`);
    await appelBase("PUT", `confies/${moi}/${espace}/${groupe}`, {
      nom: (fiche && fiche.nom) || "Groupe",
      par: espace,
      le: Date.now(),
    });
    await appelBase("DELETE", `invitations/${clefCourriel(session.courriel)}/${espace}/${groupe}`);
    return fiche;
  },

  async refuser(espace, groupe) {
    await appelBase("DELETE", `invitations/${clefCourriel(session.courriel)}/${espace}/${groupe}`);
  },

  /* Les groupes qu'on m'a confiés, et que je dois donc aller chercher
     dans l'espace de quelqu'un d'autre. */
  async groupesConfies() {
    if (!session) return [];
    const d = await appelBase("GET", `confies/${session.uid}`);
    const out = [];
    for (const [espace, groupes] of Object.entries(d || {})) {
      for (const [groupe, v] of Object.entries(groupes || {})) out.push({ espace, groupe, ...v });
    }
    return out;
  },

  /* Je rends un groupe qu'on m'avait confié : je me retire moi-même
     de la liste des coachs, ce que la règle autorise. */
  async rendreGroupe(espace, groupe) {
    await appelBase("DELETE", `espaces/${espace}/coachs/${groupe}/${session.uid}`);
    await appelBase("DELETE", `confies/${session.uid}/${espace}/${groupe}`);
  },
};

/* ── Jetons ───────────────────────────────────────────────────── */

function depuisReponse(r) {
  return {
    uid: r.localId,
    courriel: r.email,
    idToken: r.idToken,
    refreshToken: r.refreshToken,
    expireLe: Date.now() + Number(r.expiresIn || 3600) * 1000,
    verifie: false,
  };
}

async function renouveler(force = false) {
  if (!session) throw new ErreurDistante("Pas de session.", "TOKEN_EXPIRED");
  if (!force && Date.now() < session.expireLe - MARGE) return session.idToken;
  const corps = new URLSearchParams({ grant_type: "refresh_token", refresh_token: session.refreshToken });
  let r;
  try {
    r = await fetch(RAFRAICHIR, { method: "POST", body: corps });
  } catch (e) {
    throw new HorsLigne();
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    // un jeton de renouvellement refusé ne se rattrape pas : la session
    // est morte, on la retire plutôt que de boucler sur des 401
    poserSession(null);
    throw new ErreurDistante(lisible((d.error && d.error.message) || "TOKEN_EXPIRED"), "TOKEN_EXPIRED");
  }
  poserSession({
    ...session,
    idToken: d.id_token,
    refreshToken: d.refresh_token,
    expireLe: Date.now() + Number(d.expires_in || 3600) * 1000,
  });
  return session.idToken;
}

/* Un seul renouvellement à la fois : dix requêtes parties ensemble au
   réveil de l'onglet ne doivent pas en déclencher dix. */
let renouvellementEnCours = null;
async function idToken() {
  if (!session) throw new ErreurDistante("Pas de session.", "TOKEN_EXPIRED");
  if (Date.now() < session.expireLe - MARGE) return session.idToken;
  if (!renouvellementEnCours) {
    renouvellementEnCours = renouveler().finally(() => (renouvellementEnCours = null));
  }
  return await renouvellementEnCours;
}

/* ── Appels ───────────────────────────────────────────────────── */

async function appelIdentite(url, corps) {
  let r;
  try {
    r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps),
    });
  } catch (e) {
    throw new HorsLigne();
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const code = (d.error && d.error.message) || `HTTP ${r.status}`;
    throw new ErreurDistante(lisible(code), code);
  }
  return d;
}

async function appelBase(methode, chemin, valeur) {
  const jeton = await idToken();
  const url = `${BASE}/${chemin}.json?auth=${encodeURIComponent(jeton)}`;
  let r;
  try {
    r = await fetch(url, {
      method: methode,
      headers: valeur === undefined ? undefined : { "Content-Type": "application/json" },
      body: valeur === undefined ? undefined : JSON.stringify(valeur),
    });
  } catch (e) {
    throw new HorsLigne();
  }
  if (r.status === 401 || r.status === 403) {
    // Deux causes très différentes sous le même code : un jeton périmé
    // (on le renouvelle et on repasse une fois), ou une règle qui
    // refuse (on ne réessaie pas, ce serait une boucle).
    const texte = await r.text().catch(() => "");
    if (/expired|invalid.*token/i.test(texte)) {
      await renouveler(true);
      return await appelBase(methode, chemin, valeur);
    }
    throw new ErreurDistante("Accès refusé : ce contenu ne vous est pas ouvert.", "PERMISSION_DENIED");
  }
  if (!r.ok) {
    const texte = await r.text().catch(() => "");
    throw new ErreurDistante(`Le serveur a refusé (${r.status}). ${texte.slice(0, 200)}`, `HTTP_${r.status}`);
  }
  if (methode === "DELETE") return null;
  return await r.json().catch(() => null);
}

/* Une adresse ne peut pas servir de clé telle quelle : le point est un
   séparateur de chemin dans Realtime Database. La règle qui lit les
   invitations applique exactement la même substitution. */
export function clefCourriel(courriel) {
  return String(courriel || "")
    .trim()
    .toLowerCase()
    .split(".")
    .join(",");
}
