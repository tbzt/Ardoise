/* Storage — la seule porte vers localStorage.
   Tout ce qui persiste passe par ici : une clé, un préfixe, JSON.
   Si le navigateur refuse (quota, mode privé), on le dit et on
   continue — l'appli reste utilisable, elle oublie juste en fermant. */

const PREFIXE = "ardoise_v1_";

export const Storage = {
  lire(cle, defaut = null) {
    try {
      const brut = localStorage.getItem(PREFIXE + cle);
      return brut === null ? defaut : JSON.parse(brut);
    } catch (e) {
      console.warn("Storage.lire :", cle, e);
      return defaut;
    }
  },

  ecrire(cle, valeur) {
    try {
      localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
      return true;
    } catch (e) {
      console.warn("Storage.ecrire :", cle, e);
      return false;
    }
  },

  effacer(cle) {
    try {
      localStorage.removeItem(PREFIXE + cle);
    } catch (e) {
      /* rien à faire */
    }
  },

  /* Toutes les clés de l'appli, sans le préfixe. */
  cles() {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIXE)) out.push(k.slice(PREFIXE.length));
      }
    } catch (e) {
      /* rien */
    }
    return out;
  },
};
