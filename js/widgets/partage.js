/* Partage — confier un groupe à un autre coach.

   La maille est le GROUPE, et c'est le point du dessin : co-coacher,
   c'est partager une équipe, pas des objets. Yann voit les U13 en
   entier — séances, cycles, bilans — et ne sait pas que les U11
   existent.

   Deux gestes à ne pas confondre, et le vocabulaire les sépare :
   — CONFIER un groupe : l'autre coach le prépare, le mène, le
     débriefe. Il n'a accès à rien d'autre.
   — ma BIBLIOTHÈQUE reste à moi. Le co-coach ne voit que les exercices
     employés dans les séances de ce groupe-là. */

import { Distant, HorsLigne } from "../core/distant.js";
import { Synchro } from "../core/synchro.js";
import { Store } from "../core/store.js";
import { esc, statut, formaterDate } from "../core/dom.js";

const MOT = `Un coach invité voit et modifie ce groupe : ses séances, ses cycles, ses bilans.
Il ne voit pas vos autres groupes, ni votre bibliothèque — seulement les exercices
utilisés dans les séances de ce groupe.`;

/* ── Le panneau des coachs d'un groupe ────────────────────────── */

export function panneauCoachs(groupe) {
  return new Promise((resoudre) => {
    const d = document.createElement("dialog");
    d.className = "dialogue dialogue-coachs";
    const moi = Distant.monEspace();
    const proprietaire = Synchro.espaceDuGroupe(groupe.id);
    const jeSuisProprietaire = proprietaire === moi;

    d.innerHTML = `
      <form method="dialog">
        <h2>« ${esc(groupe.nom || "Groupe sans nom")} » — coachs</h2>
        <div data-corps><p class="compte-aide">Chargement…</p></div>
        <p class="compte-aide mot-du-partage">${esc(MOT)}</p>
        <div class="dialogue-pied"><button type="submit" value="">Fermer</button></div>
      </form>`;

    const corps = d.querySelector("[data-corps]");

    async function peindre() {
      let coachs = [];
      let invitations = [];
      try {
        coachs = await Distant.coachs(proprietaire, groupe.id);
        if (jeSuisProprietaire) invitations = await Distant.invitationsEnvoyees(moi, groupe.id);
      } catch (e) {
        corps.innerHTML = `<p class="alerte">${esc(e instanceof HorsLigne ? "Pas de réseau : la liste des coachs ne peut pas être lue." : e.message)}</p>`;
        return;
      }

      corps.innerHTML = `
        <ul class="coachs">
          <li>
            <span><strong>${esc(nomDeMoi())}</strong> <small>${esc(Distant.session().courriel)}</small></span>
            <span class="role">${jeSuisProprietaire ? "propriétaire" : "co-coach"}</span>
            ${jeSuisProprietaire ? "" : `<button type="button" data-act="rendre">Rendre ce groupe</button>`}
          </li>
          ${coachs
            .filter((c) => c.uid !== moi)
            .map(
              (c) => `
            <li>
              <span><strong>${esc(c.nom || c.courriel)}</strong> <small>${esc(c.courriel || "")}</small></span>
              <span class="role">depuis le ${esc(formaterDate(isoDe(c.depuis), { weekday: undefined, year: undefined }))}</span>
              ${jeSuisProprietaire ? `<button type="button" class="danger" data-retirer="${esc(c.uid)}">Retirer</button>` : ""}
            </li>`,
            )
            .join("")}
        </ul>
        ${
          jeSuisProprietaire
            ? `
          ${
            invitations.length
              ? `<p class="mini-titre">Invitations en attente</p>
                 <ul class="coachs">${invitations
                   .map(
                     (i) => `<li><span>${esc(i.courriel)}</span><span class="role">envoyée le ${esc(formaterDate(isoDe(i.le), { weekday: undefined, year: undefined }))}</span><button type="button" data-annuler="${esc(i.courriel)}">Annuler</button></li>`,
                   )
                   .join("")}</ul>`
              : ""
          }
          <div class="inviter">
            <label>Inviter un coach
              <input type="email" name="courriel" placeholder="adresse@exemple.fr" autocomplete="off">
            </label>
            <button type="button" class="primaire" data-act="inviter">Inviter</button>
          </div>
          <p class="compte-aide">Retirer un coach lui enlève l'accès immédiatement. Ce qu'il a écrit dans le groupe reste.</p>`
            : `<p class="compte-aide">Ce groupe vous a été confié. Seul son propriétaire peut inviter ou retirer quelqu'un.</p>`
        }`;
    }

    d.addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b || b.type === "submit") return;
      try {
        if (b.dataset.act === "inviter") {
          const champ = d.querySelector('input[name="courriel"]');
          const courriel = champ.value.trim();
          if (!courriel || !courriel.includes("@")) return statut("Il faut une adresse e-mail.");
          if (courriel.toLowerCase() === (Distant.session().courriel || "").toLowerCase()) return statut("C'est votre propre adresse.");
          b.disabled = true;
          await Distant.inviter(Distant.monEspace(), groupe.id, groupe.nom || "Groupe", courriel, nomDeMoi());
          statut(`Invitation envoyée à ${courriel}. Elle apparaîtra chez lui à sa prochaine ouverture d'Ardoise.`, { duree: 6000 });
          champ.value = "";
          b.disabled = false;
          await peindre();
          await Synchro.relireLesPartages();
        } else if (b.dataset.retirer) {
          await Distant.retirerCoach(Distant.monEspace(), groupe.id, b.dataset.retirer);
          statut("Coach retiré. Il perd l'accès immédiatement.");
          await peindre();
          await Synchro.relireLesPartages();
        } else if (b.dataset.annuler) {
          await Distant.annulerInvitation(Distant.monEspace(), groupe.id, b.dataset.annuler);
          statut("Invitation annulée.");
          await peindre();
        } else if (b.dataset.act === "rendre") {
          await Distant.rendreGroupe(proprietaire, groupe.id);
          statut(`Groupe rendu. Ce qui est sur cet appareil y reste.`, { duree: 5000 });
          await Synchro.relireLesPartages();
          d.close();
        }
      } catch (err) {
        statut(err instanceof HorsLigne ? "Pas de réseau : réessayez plus tard." : err.message, { duree: 6000 });
      }
    });

    d.addEventListener("close", () => {
      d.remove();
      Synchro.maintenant();
      resoudre();
    });
    document.body.appendChild(d);
    d.showModal();
    peindre();
  });
}

function nomDeMoi() {
  const s = Distant.session();
  if (!s) return "moi";
  return (s.courriel || "").split("@")[0];
}

function isoDe(ms) {
  const d = new Date(Number(ms) || Date.now());
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ── Recevoir ─────────────────────────────────────────────────── */

/* Appelé au démarrage, une fois la session ouverte. Silencieux quand
   il n'y a rien : une application qui annonce « aucune invitation »
   fait du bruit pour rien. */
export async function verifierInvitations() {
  if (!Distant.connecte()) return;
  let invitations = [];
  try {
    invitations = await Distant.mesInvitations();
  } catch (e) {
    return;
  }
  for (const inv of invitations) await proposer(inv);
}

function proposer(inv) {
  return new Promise((resoudre) => {
    const d = document.createElement("dialog");
    d.className = "dialogue dialogue-invitation";
    d.innerHTML = `
      <form method="dialog">
        <h2>On vous confie un groupe</h2>
        <p class="invitation-groupe">${esc(inv.nomGroupe || "Un groupe")}</p>
        <p class="compte-aide">
          ${inv.nomPar ? `<strong>${esc(inv.nomPar)}</strong> vous propose de co-coacher ce groupe.` : "Un autre coach vous propose de co-coacher ce groupe."}
          Vous pourrez préparer ses séances, les mener et remplir les bilans, comme pour vos propres groupes.
          Il garde la main sur qui participe.
        </p>
        <div class="dialogue-pied">
          <button type="submit" value="refuser">Refuser</button>
          <span class="spacer"></span>
          <button type="submit" value="plus-tard">Plus tard</button>
          <button type="submit" value="accepter" class="primaire">Accepter</button>
        </div>
      </form>`;

    d.addEventListener("close", async () => {
      const choix = d.returnValue;
      d.remove();
      try {
        if (choix === "accepter") {
          await Distant.accepter(inv.espace, inv.groupe, nomDeMoi());
          statut(`« ${inv.nomGroupe || "Groupe"} » ajouté à vos groupes.`, { duree: 5000 });
          await Synchro.maintenant();
        } else if (choix === "refuser") {
          await Distant.refuser(inv.espace, inv.groupe);
          statut("Invitation refusée.");
        }
      } catch (e) {
        statut(e instanceof HorsLigne ? "Pas de réseau : réessayez plus tard." : e.message, { duree: 6000 });
      }
      resoudre();
    });
    document.body.appendChild(d);
    d.showModal();
  });
}

/* Ce qu'on affiche sur la fiche d'un groupe : qui le partage, et
   l'accès au panneau. Sans compte, rien du tout. */
export function badgePartage(groupe) {
  if (!Distant.connecte()) return "";
  const confie = Synchro.confies().find((c) => c.groupe === groupe.id);
  const partage = Synchro.estPartage(groupe.id);
  if (!partage && !confie) return `<button type="button" data-act="coachs" title="Confier ce groupe à un autre coach">Coachs…</button>`;
  return `<button type="button" data-act="coachs" class="actif" title="${confie ? "Groupe confié par un autre coach" : "Groupe partagé avec un autre coach"}">↔ ${confie ? "Confié" : "Partagé"}</button>`;
}

export function estConfie(groupeId) {
  return Boolean(Synchro.confies().find((c) => c.groupe === groupeId));
}

export function nomDuProprietaire(groupeId) {
  const c = Synchro.confies().find((x) => x.groupe === groupeId);
  return c ? c.nom : null;
}

/* Les groupes qu'on m'a confiés mais dont la fiche n'est pas encore
   descendue : utile pour ne pas les laisser invisibles. */
export function groupesConfiesManquants() {
  return Synchro.confies().filter((c) => !Store.groupes.get(c.groupe));
}
