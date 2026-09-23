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
3. Écrans          js/widgets/groupes.js    la liste des groupes
                   js/widgets/groupe.js     la fiche d'un groupe : historique, équilibre, conseils, bilans
                   js/widgets/exercices.js  la bibliothèque (cartes, filtre)
                   js/widgets/exercice.js   la fiche (éditeur + formulaire, auto-enregistrement)
                   js/widgets/seances.js    la liste des séances
                   js/widgets/seance.js     le déroulé (blocs, frise, bibliothèque latérale)
                   js/widgets/bordglace.js  la séance vue du banc : matériel, points clés, bloc en cours
                   js/widgets/impression.js la feuille de séance imprimable
                   js/widgets/feuillepdf.js la même feuille en PDF (schémas rendus en JPEG via canvas)
2. Composants      js/widgets/editeur.js    l'éditeur de schéma (outils, gestes, historique)
                   js/widgets/patinoire.js  le rendu SVG : la glace et les objets
                   js/widgets/communs.js    pastilles, filtres, vignettes partagés
                   js/widgets/dialogue.js   une boîte de choix modale
                   js/widgets/compte.js     la porte, l'indicateur de synchro, l'arbitrage des conflits
                   js/widgets/partage.js    confier un groupe : coachs, invitations, réception
1. Noyau           js/core/brouillon.js     propose un déroulé : structure, parts de temps, cycle, score des exercices, raisons
                   js/core/materiel.js      lit « 10 plots », « 1 palet par joueur » et cumule le matériel d'une séance
                   js/core/analyse.js       ce qu'un groupe a fait : répartition, usage, répétition, conseils
                   js/core/pdf.js           un générateur PDF minimal : Helvetica, traits, rectangles, JPEG
                   js/core/store.js         la vérité : exercices + séances, signal de changement
                   js/core/synchro.js       le local d'abord : miroir, file d'attente, conflits, groupes confiés
                   js/core/distant.js       le SEUL module qui parle au réseau : comptes, jetons, base, invitations
                   js/core/storage.js       la seule porte vers localStorage
                   js/core/archive.js       export / import JSON
                   js/core/theme.js         clair / sombre / système
                   js/core/dom.js           esc, debounce, formats de date et de durée, statut (avec « Annuler »), transition de vue, recherche sans accents
                   js/core/ids.js           identifiants courts
0. Données         js/data/catalogue.js     catégories, niveaux, exercices et séances fournis
                   js/data/referentiel.js   fiches techniques (codes, points clés, corrections), formes de travail
```

`patinoire.js` ne connaît ni le DOM interactif ni le Store : il transforme un schéma en chaîne SVG. L'éditeur, les vignettes des cartes, l'impression et le PDF s'en servent tous — un seul dessin, quatre usages. Les zones de saisie et halos de sélection ne sont émis qu'en mode interactif (`objet(o, uid, true)`), si bien que le SVG reste juste même sans la feuille de style — c'est ce qui permet de le rendre dans un `<img>` puis un canvas pour le PDF.

`pdf.js` écrit le fichier à la main : polices standard (jamais embarquées), texte encodé en Windows-1252, images en `DCTDecode` (les octets JPEG tels quels), table `xref` calculée. Il ne sait rien d'une séance ; `feuillepdf.js` fait la mise en page.

---

## 3. Le modèle de données

### Exercice
```js
{
  id, nom, categorie, niveau, duree,          // durée en minutes
  objectif, description, points_cles: [],     // texte
  corrections: [],                            // « erreur → correction »
  techniques: [],                             // codes de fiches techniques : "TS.P 15", "TS.M 1"…
  forme: "" | actif|vagues|groupes3|parcours|duo|relais,   // forme de travail
  materiel, variantes,
  schema: { vue: "entiere" | "moitie", objets: [ ... ] },
  cree, modifie                               // horodatages
}
```

### Objets d'un schéma
Le repère est la patinoire entière en décimètres : `600 × 300`, origine en haut à gauche. La vue n'est qu'un cadrage (`viewBox`).

| `t`       | champs                                                   |
|-----------|----------------------------------------------------------|
| `joueur`  | `x, y, forme: X\|O\|F\|D\|G\|C, label, couleur`           |
| `palet`   | `x, y`                                                   |
| `cone`    | `x, y, couleur`                                          |
| `cerceau` | `x, y, couleur`                                          |
| `passeur` | `x, y, angle: 0\|45\|90\|135, couleur`                  |
| `fantome` | `x, y, couleur`                                          |
| `cage`    | `x, y, sens: gauche\|droite\|haut\|bas`                  |
| `texte`   | `x, y, texte, taille: petit\|moyen\|grand, couleur`       |
| `trait`   | `pts: [{x,y}…], style, couleur`                          |

Styles de trait, d'après la légende usuelle des schémas : `patin`, `conduite` (ondulé), `arriere` (ondulation large), `arriere_palet` (boucles), `freinage` (flèche et deux barres), `glisse` (double trait sans flèche), `acceleration` (hachures), `pivot` (boucle en bout), `passe` (pointillé), `echange` (pointillé à deux pointes), `tir` (double trait), `depose` (palet et barre), `libre`. `legende()` rend chaque symbole en vignette pour l'éditeur et la feuille imprimée. Les points d'un trait sont ceux que l'utilisateur a tracés, simplifiés (Ramer-Douglas-Peucker) ; le lissage, l'ondulation et les arcs sont recalculés au rendu.

### Séance
```js
{
  id, titre, date: "AAAA-MM-JJ", heure: "HH:MM", groupe, groupeId, lieu,
  duree_glace, objectif, notes,
  blocs: [ { id, exerciceId | null, titre, duree, note } ],
  bilan: null | { fait, date, presents, note (1-5), retenir,
                  blocs: { [blocId]: { fait, note (1-3), commentaire } } },
  cree, modifie
}
```
Un bloc recopie le **titre** de l'exercice au moment de l'ajout : si l'exercice est supprimé plus tard, la séance garde son sens. `groupe` (le nom en texte) reste renseigné à côté de `groupeId` : l'impression et le PDF le lisent, et c'est par lui que les séances d'avant les groupes ont été rattachées (`Store.rattacherGroupes()`, idempotent, appelé au démarrage).

### Groupe
```js
{ id, nom, niveau, description,
  cycles: [ { id, nom, debut, fin, categories: [], techniques: [], note } ],
  cree, modifie }
```
Supprimer un groupe détache ses séances, il ne les efface pas. Un **cycle** est une période avec un thème ; `cycleCourant(groupe, date)` donne celui qui couvre une date, et le brouillon multiplie par 1,5 le poids de ses catégories et favorise les exercices qui visent ses techniques.

### Matériel
Le champ `materiel` d'un exercice reste du texte, une ligne par objet. `js/core/materiel.js` y lit une quantité, un objet et un éventuel « par joueur / duo / équipe… », et `cumulMateriel()` regroupe par objet en gardant le **maximum** demandé (le matériel se réutilise d'un exercice à l'autre, il ne s'additionne pas). Les lignes qu'il ne sait pas chiffrer restent listées telles quelles.

### Brouillon
`js/core/brouillon.js` compose un déroulé en trois temps : (1) les minutes visées par catégorie — `CIBLE` corrigée par l'écart des quatre dernières séances, correction amortie tant que l'historique est court, patinage jamais sous 22 % ; (2) dans chaque catégorie, les exercices classés par un score lisible (jamais fait +3, fait la dernière fois −3, « à revoir » au dernier bilan +3, niveau inadapté −4, un peu de hasard) et pris tant que le temps reste ; (3) un ajustement au temps de glace qui donne le reste à la catégorie la plus en dessous de son objectif et rogne celles qui dépassent le plus. Chaque bloc ressort avec ses raisons, affichées au coach.

### Référentiel
`js/data/referentiel.js` décrit les fiches techniques de patinage et de maniement : code, nom, points clés, corrections, et un drapeau `socle` pour celles par lesquelles on commence avec des débutants. Il est purement descriptif : les exercices s'y rattachent par code, et tout ce qui en découle (affichage, couverture par groupe, bonus dans le brouillon) se calcule.

### Analyse
`js/core/analyse.js` ne stocke rien : tout se recalcule depuis les séances et leurs bilans. Une séance est **faite** si son bilan le dit, ou si sa date est passée avec un déroulé. Les blocs décochés dans le bilan sont exclus des comptes. `CIBLE` donne la part de temps conseillée par catégorie pour des adultes débutants ; chaque conseil de `conseils()` vient d'une règle nommée (équilibre, absence, répétition, à revoir).

### Le distant — facultatif, et jamais dans le chemin d'affichage

Sans compte, rien de cette couche ne s'exécute et l'appli est celle
d'avant : cent pour cent locale. Avec un compte, `localStorage` **reste
la vérité de l'appli qui tourne** ; le distant n'est qu'une couche de
synchronisation. On ne lit jamais le réseau pour peindre un écran — le
mode bord de glace fonctionne intégralement hors ligne, bilan compris.

`distant.js` parle à Firebase en REST pur (Realtime Database, pas
Firestore : son API se consomme au simple `fetch`, donc pas de SDK et
pas d'étape de build). La clé API et l'URL sont en clair : dans une
application web, c'est un identifiant, pas un secret. Ce qui protège est
dans `firebase.rules.json`, appliqué côté serveur.

```
/espaces/$uid/                     un espace par coach ; sa clé EST son compte
    identite                       { nom }
    exercices/$id                  ma bibliothèque — moi seul
    groupes/$g                     la fiche du groupe
    coachs/$g/$uid                 qui co-coache — écriture réservée au propriétaire
    bibliotheques/$g/$exId         les exercices employés par les séances du groupe
    seances/$g/$s                  les séances, rangées PAR GROUPE
    invitations/$g/<courriel>      mon souvenir de ce que j'ai envoyé
    corbeille/$type/$id            purge à 30 jours

/invitations/<courriel>/$espace/$g le jeton, trouvable par l'invité seul
/confies/$uid/$espace/$g           les groupes qu'on m'a confiés
```

Deux rangements qui ne sont pas des détails de stockage :

- **Les séances sont sous leur groupe.** Une base Realtime accorde une
  permission sur un *chemin*, pas sur le résultat d'une requête :
  demander « les séances dont le groupe est X » suppose de lire la
  collection entière, ce qu'il faut justement interdire. Ranger les
  séances sous leur groupe met la frontière là où la règle sait la
  poser, et le co-coach lit tout son groupe en une requête.
- **Les invitations sont à la racine, indexées par adresse.** Sous
  l'espace, l'invité ne pourrait pas les trouver : il faudrait qu'il
  connaisse d'avance l'identifiant de compte de celui qui l'invite.

Chaque objet porte `rev` et `updatedBy`, que la règle contrôle
(`rev === ancien + 1`) et que `synchro.js` retire avant de faire entrer
l'objet dans le Store — ils appartiennent au transport, pas à
l'exercice, et ressortiraient sinon dans l'export JSON. **Aucune fusion
automatique** : un conflit ouvre une boîte où le coach tranche.

### Persistance
Clés `ardoise_v1_exercices`, `ardoise_v1_seances`, `ardoise_v1_groupes`, `ardoise_v1_theme`, `ardoise_v1_initialise`, et `ardoise_v1_coches_<id de séance>` pour la liste de matériel cochée au bord de la glace. L'export JSON porte `format: "ardoise/1"`.

---

## 4. Les conventions

- **Pas d'accès direct à `localStorage` hors de `js/core/storage.js`.**
- **Ni `confirm()`, ni `alert()`, ni `prompt()` du navigateur.** Un geste destructeur s'exécute, et `statut(message, { annuler })` laisse cinq secondes pour le défaire ; un choix se pose avec `choisir()` de `dialogue.js`, dont les boutons portent le nom de ce qu'ils font. Seul « Tout effacer » garde une confirmation : il est global et n'a rien à ramener. (Reste deux `prompt()` pour nommer un groupe depuis une séance ; ils disparaissent avec le `<select>` Groupe.)
- **Le mouvement passe par les jetons de `:root`** (`--dur-*`, `--sortie`, `--spring`) et jamais par une durée écrite en dur : `prefers-reduced-motion` est traité une seule fois, sur les jetons. Même règle pour `z-index`, qui prend une bande nommée (`--plan-*`).
- **Un rendu d'écran passe par `transition(rendre)`** : le fondu est gratuit là où le navigateur le sait, et identique à avant ailleurs.
- **Un champ de saisie ne se reconstruit pas sous les doigts.** Une liste filtrable se peint en deux temps : le cadre (champ, filtres) une fois, la liste à chaque frappe.
- **Pas de `onclick` dans les gabarits** : délégation d'événements sur `data-act`, `data-outil`, `data-prop`.
- **Les écrans rendent des chaînes** (`innerHTML`) et échappent tout texte utilisateur avec `esc()`. Les identifiants internes ne sont jamais saisis par l'utilisateur.
- **Un écran renvoie `{ detruire() }`** ; le routeur l'appelle avant d'en monter un autre (désabonnement du Store, sauvegarde en attente, écouteurs clavier).
- **Le catalogue a des identifiants fixes** (`cat_…`) : le réinstaller ajoute ce qui manque et n'écrase rien. L'import d'un fichier, lui, ajoute ce qui manque **et** remplace ce dont la version importée est plus récente (`modifie`) — c'est ce qui permet d'exporter un exercice seul, de le retoucher ailleurs et de le rapporter.
- **Pas d'accès réseau hors de `js/core/distant.js`.** Même loi que pour `localStorage`, même raison.
- **Rien du distant dans le chemin d'affichage.** Un écran se peint depuis le Store, toujours.
- **`verifier.html` est le filet.** Toute règle de sécurité ou de synchronisation ajoutée s'y accompagne d'une épreuve — une régression y est silencieuse et coûte des données. On y vérifie surtout ce qui doit être REFUSÉ : une épreuve qui passe alors qu'elle devrait échouer est le pire des cas.
- **Un seul auteur dans l'historique git.** Pas de `Co-Authored-By`, pas de pied de message généré.

---

## 5. Vérifier

Il n'y a pas de suite de tests : on ouvre l'appli, on dessine, on compose, on imprime, on regarde la console. Les modules ES se mettent en cache : un rechargement forcé (ou un autre port) avant de conclure qu'un changement « ne fait rien ».
