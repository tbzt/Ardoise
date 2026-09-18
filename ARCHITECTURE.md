# Architecture d'Ardoise — la carte du code

Ce document répond à une seule question : **« où est quoi, et qui appelle qui ? »**

---

## 1. Le modèle mental en 30 secondes

- **Vanilla JavaScript, aucun build.** Pas de bundler, pas de `npm`. On sert le dossier, ça marche. Déploiement GitHub Pages : on édite, on pousse, terminé.
- **Chaque fichier est un module ES natif**, qui `export`e son objet et `import`e ses dépendances par chemin relatif explicite. Pour savoir de quoi dépend un fichier, lisez ses `import`.
- **Un fichier = un domaine = un objet**, du nom du fichier : `store.js` exporte `Store`, `patinoire.js` exporte les fonctions de dessin.
- **Les dépendances ne descendent que vers le bas.** Une couche basse ne connaît jamais une couche haute.
- **100 % local.** Toute la persistance est dans le `localStorage`, derrière `Storage`, et nulle part ailleurs.

Le patron vient de [GNomon](https://github.com/tbzt/GNomon) et de [ShadowHerds](https://github.com/tbzt/ShadowHerds) : mêmes couches, même idiome de store, même thème à trois états. C'est une copie, pas un fork.

---

## 2. Les couches

```
4. Orchestration   js/app.js               démarrage, routage par fragment d'URL, barre
3. Écrans          js/widgets/exercices.js  la bibliothèque (cartes, filtre)
                   js/widgets/exercice.js   la fiche (éditeur + formulaire, auto-enregistrement)
                   js/widgets/seances.js    la liste des séances
                   js/widgets/seance.js     le déroulé (blocs, frise, bibliothèque latérale)
                   js/widgets/impression.js la feuille de séance imprimable
2. Composants      js/widgets/editeur.js    l'éditeur de schéma (outils, gestes, historique)
                   js/widgets/patinoire.js  le rendu SVG : la glace et les objets
                   js/widgets/communs.js    pastilles, filtres, vignettes partagés
                   js/widgets/dialogue.js   une boîte de choix modale
1. Noyau           js/core/store.js         la vérité : exercices + séances, signal de changement
                   js/core/storage.js       la seule porte vers localStorage
                   js/core/archive.js       export / import JSON
                   js/core/theme.js         clair / sombre / système
                   js/core/dom.js           esc, debounce, formats de date et de durée, statut
                   js/core/ids.js           identifiants courts
0. Données         js/data/catalogue.js     catégories, niveaux, exercices et séance fournis
```

`patinoire.js` ne connaît ni le DOM interactif ni le Store : il transforme un schéma en chaîne SVG. L'éditeur, les vignettes des cartes et l'impression s'en servent tous — un seul dessin, trois usages.

---

## 3. Le modèle de données

### Exercice
```js
{
  id, nom, categorie, niveau, duree,          // durée en minutes
  objectif, description, points_cles: [],     // texte
  materiel, variantes,
  schema: { vue: "entiere" | "moitie", objets: [ ... ] },
  cree, modifie                               // horodatages
}
```

### Objets d'un schéma
Le repère est la patinoire entière en décimètres : `600 × 300`, origine en haut à gauche. La vue n'est qu'un cadrage (`viewBox`).

| `t`      | champs                                             |
|----------|----------------------------------------------------|
| `joueur` | `x, y, forme: X\|O\|G\|C, label, couleur`           |
| `palet`  | `x, y`                                             |
| `cone`   | `x, y, couleur`                                    |
| `cage`   | `x, y, sens: gauche\|droite\|haut\|bas`            |
| `texte`  | `x, y, texte, taille: petit\|moyen\|grand, couleur` |
| `trait`  | `pts: [{x,y}…], style, couleur`                    |

Styles de trait : `patin`, `conduite` (ondulé), `passe` (pointillé), `tir` (double), `arriere` (arcs), `libre` (sans flèche). Les points d'un trait sont ceux que l'utilisateur a tracés, simplifiés (Ramer-Douglas-Peucker) ; le lissage, l'ondulation et les arcs sont recalculés au rendu.

### Séance
```js
{
  id, titre, date: "AAAA-MM-JJ", heure: "HH:MM", groupe, lieu,
  duree_glace, objectif, notes,
  blocs: [ { id, exerciceId | null, titre, duree, note } ],
  cree, modifie
}
```
Un bloc recopie le **titre** de l'exercice au moment de l'ajout : si l'exercice est supprimé plus tard, la séance garde son sens.

### Persistance
Clés `ardoise_v1_exercices`, `ardoise_v1_seances`, `ardoise_v1_theme`, `ardoise_v1_initialise`. L'export JSON porte `format: "ardoise/1"`.

---

## 4. Les conventions

- **Pas d'accès direct à `localStorage` hors de `js/core/storage.js`.**
- **Pas de `onclick` dans les gabarits** : délégation d'événements sur `data-act`, `data-outil`, `data-prop`.
- **Les écrans rendent des chaînes** (`innerHTML`) et échappent tout texte utilisateur avec `esc()`. Les identifiants internes ne sont jamais saisis par l'utilisateur.
- **Un écran renvoie `{ detruire() }`** ; le routeur l'appelle avant d'en monter un autre (désabonnement du Store, sauvegarde en attente, écouteurs clavier).
- **Le catalogue a des identifiants fixes** (`cat_…`) : le réinstaller ajoute ce qui manque et n'écrase rien. L'import d'un fichier, lui, ajoute ce qui manque **et** remplace ce dont la version importée est plus récente (`modifie`) — c'est ce qui permet d'exporter un exercice seul, de le retoucher ailleurs et de le rapporter.
- **Un seul auteur dans l'historique git.** Pas de `Co-Authored-By`, pas de pied de message généré.

---

## 5. Vérifier

Il n'y a pas de suite de tests : on ouvre l'appli, on dessine, on compose, on imprime, on regarde la console. Les modules ES se mettent en cache : un rechargement forcé (ou un autre port) avant de conclure qu'un changement « ne fait rien ».
