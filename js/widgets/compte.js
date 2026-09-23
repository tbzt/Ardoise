/* Compte — la porte, et l'indicateur de synchronisation.

   La porte n'est jamais un mur : « Continuer sans compte » est aussi
   visible que le formulaire. Préparer une séance seul ne demande
   toujours rien, et c'est le cas par défaut. Un compte ne sert qu'à
   deux choses : retrouver ses données sur un autre appareil, et
   co-coacher un groupe avec quelqu'un.

   L'indicateur ne parle que quand il a quelque chose à dire. « À
   jour » est discret ; « hors ligne » rassure au lieu d'alerter, parce
   qu'au bord de la glace un avertissement qu'on ne peut pas traiter
   est une nuisance. */

import { Distant, HorsLigne } from "../core/distant.js";
import { Synchro } from "../core/synchro.js";
import { esc, statut } from "../core/dom.js";
import { verifierInvitations } from "./partage.js";

const LIBELLES = {
  inactif: { texte: "", titre: "" },
  aJour: { texte: "à jour", titre: "Tout est enregistré sur vos autres appareils." },
  enAttente: { texte: "en attente", titre: "Des modifications attendent d'être envoyées." },
  envoi: { texte: "envoi…", titre: "Envoi en cours." },
  horsLigne: { texte: "hors ligne", titre: "Vos modifications partiront dès le retour du réseau." },
  conflit: { texte: "à trancher", titre: "Un objet a changé sur deux appareils." },
  erreur: { texte: "erreur", titre: "La synchronisation a échoué." },
};

export function brancherCompte({ bouton, indicateur, entree }) {
  function peindre() {
    const s = Distant.session();
    if (s) {
      entree.textContent = `Se déconnecter — ${s.courriel}`;
      entree.dataset.act = "deconnexion";
      bouton.hidden = false;
      bouton.textContent = initiales(s.courriel);
      bouton.title = `${s.courriel} — compte et synchronisation`;
    } else {
      entree.textContent = "Se connecter…";
      entree.dataset.act = "connexion";
      bouton.hidden = true;
    }
    peindreEtat(Synchro.etat());
  }

  function peindreEtat(e) {
    const l = LIBELLES[e.code] || LIBELLES.inactif;
    const visible = Boolean(Distant.connecte()) && e.code !== "inactif";
    indicateur.hidden = !visible;
    if (!visible) return;
    const n = e.code === "enAttente" && e.enAttente ? ` ${e.enAttente}` : "";
    indicateur.textContent = `⟳ ${l.texte}${n}`;
    indicateur.title = e.message || l.titre;
    indicateur.className = `synchro synchro-${e.code}`;
  }

  entree.addEventListener("click", async () => {
    if (entree.dataset.act === "deconnexion") {
      Synchro.oublier();
      Distant.deconnexion();
      statut("Déconnecté. Vos données restent sur cet appareil.", { duree: 4000 });
    } else {
      const ok = await porte();
      if (ok) await demarrerSynchro();
    }
    peindre();
  });

  indicateur.addEventListener("click", async () => {
    const conflits = Synchro.conflits();
    if (conflits.length) return void (await dialogueConflits());
    statut("Synchronisation…");
    await Synchro.maintenant();
  });

  Distant.surSession(peindre);
  Synchro.surEtat(peindreEtat);
  peindre();

  // reprise d'une session déjà ouverte au chargement de la page
  if (Distant.connecte()) demarrerSynchro();
}

async function demarrerSynchro() {
  try {
    await Synchro.demarrer();
    // après le premier tour : y a-t-il un groupe qu'on me confie ?
    await verifierInvitations();
  } catch (e) {
    if (!(e instanceof HorsLigne)) statut(e.message, { duree: 6000 });
  }
}

function initiales(courriel) {
  const n = String(courriel || "").trim();
  return (n.slice(0, 2) || "?").toUpperCase();
}

/* ── La porte ─────────────────────────────────────────────────── */

function porte() {
  return new Promise((resoudre) => {
    const d = document.createElement("dialog");
    d.className = "dialogue dialogue-compte";
    d.innerHTML = `
      <form method="dialog" class="compte-forme">
        <h2 data-titre>Se connecter</h2>
        <p class="compte-aide">
          Un compte sert à retrouver vos séances sur votre téléphone au bord de la glace,
          et à co-coacher un groupe avec quelqu'un. Préparer seul n'en demande aucun.
        </p>
        <label>Adresse e-mail
          <input name="courriel" type="email" autocomplete="username" required placeholder="adresse@exemple.fr">
        </label>
        <label>Mot de passe
          <input name="motdepasse" type="password" autocomplete="current-password" required minlength="6">
        </label>
        <p class="alerte" role="alert" data-erreur hidden></p>
        <div class="compte-actions">
          <button type="button" class="primaire" data-act="valider">Se connecter</button>
        </div>
        <p class="compte-bascule">
          <button type="button" class="lien" data-act="basculer">Pas encore de compte ? En créer un</button>
          <button type="button" class="lien" data-act="oubli">Mot de passe oublié</button>
        </p>
        <hr>
        <div class="dialogue-pied">
          <button type="submit" value="">Continuer sans compte →</button>
        </div>
      </form>`;

    const q = (s) => d.querySelector(s);
    const erreur = q("[data-erreur]");
    const valider = q('[data-act="valider"]');
    let mode = "connexion";

    const montrer = (m) => {
      erreur.textContent = m;
      erreur.hidden = !m;
    };

    const basculer = () => {
      mode = mode === "connexion" ? "inscription" : "connexion";
      q("[data-titre]").textContent = mode === "connexion" ? "Se connecter" : "Créer un compte";
      valider.textContent = mode === "connexion" ? "Se connecter" : "Créer le compte";
      q('[data-act="basculer"]').textContent = mode === "connexion" ? "Pas encore de compte ? En créer un" : "J'ai déjà un compte";
      q('input[name="motdepasse"]').autocomplete = mode === "connexion" ? "current-password" : "new-password";
      montrer("");
    };

    const envoyer = async () => {
      const courriel = q('input[name="courriel"]').value.trim();
      const motdepasse = q('input[name="motdepasse"]').value;
      if (!courriel || !motdepasse) return montrer("Adresse et mot de passe sont demandés.");
      valider.disabled = true;
      montrer("");
      try {
        if (mode === "connexion") await Distant.connexion(courriel, motdepasse);
        else {
          await Distant.inscription(courriel, motdepasse);
          statut("Compte créé. Un courriel de vérification vient de partir.", { duree: 6000 });
        }
        d.returnValue = "ok";
        d.close();
      } catch (e) {
        montrer(e instanceof HorsLigne ? "Pas de réseau : impossible de se connecter pour l'instant." : e.message);
        valider.disabled = false;
        q('input[name="motdepasse"]').select();
      }
    };

    d.addEventListener("click", async (e) => {
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      if (b.dataset.act === "basculer") basculer();
      else if (b.dataset.act === "valider") await envoyer();
      else if (b.dataset.act === "oubli") {
        const courriel = q('input[name="courriel"]').value.trim();
        if (!courriel) return montrer("Écrivez d'abord votre adresse, le courriel part vers elle.");
        try {
          await Distant.envoyerMotDePasseOublie(courriel);
          montrer("");
          statut("Un courriel vient de partir vers cette adresse.", { duree: 5000 });
        } catch (err) {
          montrer(err.message);
        }
      }
    });
    d.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT") {
        e.preventDefault();
        envoyer();
      }
    });
    d.addEventListener("close", () => {
      const v = d.returnValue;
      d.remove();
      resoudre(v === "ok");
    });
    document.body.appendChild(d);
    d.showModal();
    q('input[name="courriel"]').focus();
  });
}

/* ── Les conflits ─────────────────────────────────────────────── */

const NOMS = { exercices: "Exercice", groupes: "Groupe", seances: "Séance" };

function resume(collection, o) {
  if (!o) return "<em>supprimé</em>";
  if (collection === "seances") return `${esc(o.titre || "sans titre")} — ${(o.blocs || []).length} bloc${(o.blocs || []).length > 1 ? "s" : ""}${o.bilan && o.bilan.fait ? ", bilan rempli" : ""}`;
  if (collection === "groupes") return `${esc(o.nom || "sans nom")} — ${(o.cycles || []).length} cycle${(o.cycles || []).length > 1 ? "s" : ""}`;
  return `${esc(o.nom || "sans nom")} — ${o.duree || "?"} min`;
}

export function dialogueConflits() {
  return new Promise((resoudre) => {
    const conflits = Synchro.conflits();
    const d = document.createElement("dialog");
    d.className = "dialogue dialogue-conflits";
    d.innerHTML = `
      <form method="dialog">
        <h2>Modifié à deux endroits</h2>
        <p class="compte-aide">
          ${conflits.length > 1 ? "Ces objets ont" : "Cet objet a"} changé ici et sur un autre appareil.
          Rien n'est écrasé tant que vous n'avez pas choisi.
        </p>
        <ul class="conflits">
          ${conflits
            .map(
              (c) => `
            <li data-collection="${esc(c.collection)}" data-id="${esc(c.id)}">
              <p class="conflit-titre">${esc(NOMS[c.collection] || c.collection)}</p>
              <div class="conflit-cotes">
                <div><span class="conflit-ou">Ici</span>${resume(c.collection, c.local)}</div>
                <div><span class="conflit-ou">Là-bas</span>${resume(c.collection, c.distant)}</div>
              </div>
              <div class="conflit-actions">
                <button type="button" data-garder="local">Garder celui d'ici</button>
                <button type="button" data-garder="distant">Prendre celui de là-bas</button>
              </div>
            </li>`,
            )
            .join("")}
        </ul>
        <div class="dialogue-pied"><button type="submit" value="">Plus tard</button></div>
      </form>`;

    d.addEventListener("click", async (e) => {
      const b = e.target.closest("button[data-garder]");
      if (!b) return;
      const li = b.closest("li");
      await Synchro.resoudre(li.dataset.collection, li.dataset.id, b.dataset.garder);
      li.remove();
      statut(b.dataset.garder === "local" ? "Version d'ici conservée." : "Version de l'autre appareil reprise.");
      if (!d.querySelector(".conflits li")) d.close();
    });
    d.addEventListener("close", () => {
      d.remove();
      resoudre();
    });
    document.body.appendChild(d);
    d.showModal();
  });
}
