# Ardoise

**L'ardoise du coach de hockey — dessiner ses exercices, ranger sa bibliothèque, composer et imprimer ses séances.**

Application web à page unique, **100 % locale** : aucun serveur, aucune dépendance, aucune donnée transmise. Tout tourne dans le navigateur et se range dans son `localStorage`. Pensée pour préparer la séance à la maison sur l'ordinateur, et la relire au bord de la glace sur le téléphone.

→ [tbzt.github.io/Ardoise](https://tbzt.github.io/Ardoise)

Livrée avec **84 exercices** et deux séances types pour **adultes débutants**, du tout premier pas sur la glace au match en travers : marcher puis glisser, tomber et se relever, pousser, freiner des deux côtés, reculer, croiser, conduire le palet tête haute, passer (coup droit, revers, bande), tirer (poignet, revers, en mouvement), les bases du gardien, des jeux qui font travailler sans le dire (feu rouge feu vert, requins et sardines, chat glacé, gardez le palet), et finir au calme.

---

## Ce qu'on y fait

### Dessiner — l'éditeur de schémas
- Une patinoire aux proportions IIHF (60 × 30 m), **entière ou demi-glace**.
- On **pose** d'un clic : joueurs `X` et `O`, gardien `G`, coach `C`, palets, cônes, textes, et des **cages mobiles** orientables pour les matchs en travers.
- On **trace** d'un glissé, au doigt, au stylet ou à la souris : patinage, patinage avec palet (ondulé), passe (pointillé), tir (double trait), marche arrière (petits arcs), trait libre.
- Cinq couleurs, sélection, déplacement, étiquettes sur les joueurs, annuler / rétablir, raccourcis (`Suppr`, `Ctrl+Z`, `Ctrl+Y`, `Échap`).

### Ranger — la bibliothèque
- Chaque exercice a sa fiche : catégorie, niveau, durée, objectif, description, points clés, matériel, variantes, et son schéma.
- Huit catégories : échauffement, patinage, maniement, passes, tirs, jeu, gardien, retour au calme.
- Recherche plein texte et filtre par catégorie ; duplication pour décliner un exercice.
- Tout s'enregistre tout seul, un instant après la frappe.

### Composer — les séances
- Date, heure, groupe, lieu, temps de glace, objectif, notes.
- Un **déroulé** de blocs : des exercices piochés dans la bibliothèque, ou des blocs libres (pause eau, mot du coach).
- Durée par bloc, note par bloc, **réordonnancement par glisser-déposer** (ou avec les flèches), **heure de début calculée** pour chaque bloc.
- Depuis la bibliothèque, un clic sur un exercice ouvre son **aperçu** (schéma, objectif, description, points clés) avant de l'ajouter.
- Une **frise** colorée montre où passe le temps, et prévient quand on dépasse la glace.

### Au bord de la glace
- Une fois la séance prête, le mode **Bord de glace** la montre depuis le banc, sur téléphone : le **matériel à sortir** (une liste à cocher, agrégée depuis les exercices), les notes à avoir en tête, puis chaque bloc avec ses horaires, son objectif et ses **points clés** — le schéma et le déroulé complet restent à un clic.
- Si la séance a une heure et qu'on est le bon jour, le **bloc en cours** est mis en avant avec le temps restant, les blocs passés s'estompent, et l'écran reste allumé.

### Suivre — les groupes et leur historique
- Chaque séance se rattache à un **groupe** (une équipe, une section). Le groupe garde la mémoire : séances faites, temps de glace, exercices déjà faits (combien de fois, la dernière date, comment ça s'est passé), et ceux jamais essayés.
- Un **bilan** se remplit en deux minutes au bas du bord de glace : par bloc, fait ou non, à revoir / correct / bien, un mot ; pour la séance, présents, une note sur cinq, et ce qu'il faut retenir.
- La fiche du groupe **analyse** l'historique : équilibre du temps par catégorie face à une part conseillée pour des adultes débutants, catégories absentes depuis plusieurs séances, séance qui en répète une autre, blocs à retravailler d'après les bilans.
- En préparant une séance, la bibliothèque indique **« jamais fait »** ou **« fait il y a N séances »** pour ce groupe, un panneau rappelle la **dernière fois** (ce qui a été fait, à retenir, à revoir), et une alerte signale une séance qui **répète** une précédente.

### Imprimer — la feuille de séance
- Le plan en tête (heure, durée, bloc, note), puis chaque exercice avec son schéma, sa description et ses points clés.
- Mise en page prévue pour A4 ; lisible aussi à l'écran, sur téléphone.
- **Export PDF** en un clic, fabriqué dans le navigateur sans aucune bibliothèque : un vrai fichier à envoyer au groupe ou à garder sur le téléphone.

### Système
- **Exporter / Importer** toutes les données en un fichier JSON (fusion ou remplacement), ou **un exercice seul** depuis sa fiche — le fichier se réimporte chez soi ou chez un autre coach, et met à jour l'exercice s'il est plus récent.
- **Catalogue** : réinstalle les exercices fournis sans toucher aux vôtres.
- Thème clair / sombre / automatique.

---

## Lancer en local

Site statique : servez le dossier avec n'importe quel serveur HTTP (les modules ES ne se chargent pas depuis `file://`).

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déployer

Sur GitHub Pages, branche `main`, dossier racine. Rien à construire.

---

## Licence

MIT — voir [LICENSE](LICENSE). Les exercices du catalogue sont libres de reprise et de modification ; ils sont écrits pour des adultes qui débutent, adaptez-les à votre groupe.
