/* Catalogue — les exercices fournis avec l'appli, pensés pour des
   adultes débutants : on apprend à tenir debout, à s'arrêter, à
   tomber sans se faire mal, puis seulement à jouer. Chaque exercice
   a un identifiant fixe : réinstaller le catalogue n'écrase jamais
   ce que le coach a modifié. */

export const CATEGORIES = {
  echauffement: { libelle: "Échauffement", couleur: "#e0a020" },
  patinage: { libelle: "Patinage", couleur: "#2b62c4" },
  maniement: { libelle: "Maniement", couleur: "#7b4fb3" },
  passe: { libelle: "Passes", couleur: "#2e8b57" },
  tir: { libelle: "Tirs", couleur: "#c62828" },
  jeu: { libelle: "Jeu", couleur: "#ef6c00" },
  gardien: { libelle: "Gardien", couleur: "#0e8a8a" },
  retour: { libelle: "Retour au calme", couleur: "#5a6b7a" },
};

export const NIVEAUX = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  tous: "Tous niveaux",
};

let n = 0;
const id = () => "c" + ++n;
const J = (x, y, forme = "X", label = "", couleur = "noir") => ({ id: id(), t: "joueur", x, y, forme, label, couleur });
const P = (x, y) => ({ id: id(), t: "palet", x, y });
const K = (x, y) => ({ id: id(), t: "cone", x, y });
const T = (x, y, texte, couleur = "noir", taille = "moyen") => ({ id: id(), t: "texte", x, y, texte, couleur, taille });
const CG = (x, y, sens = "gauche") => ({ id: id(), t: "cage", x, y, sens });
const L = (style, pts, couleur = "noir") => ({ id: id(), t: "trait", style, pts: pts.map(([x, y]) => ({ x, y })), couleur });

/* Neuf points autour d'un cercle : une boucle complète, lissée ensuite. */
function tour(cx, cy, r, depart = Math.PI / 2, sens = -1) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const a = depart + (sens * i * Math.PI) / 4;
    pts.push([Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]);
  }
  return pts;
}

function ex(base) {
  return {
    niveau: "debutant",
    materiel: "",
    variantes: "",
    points_cles: [],
    corrections: [],
    techniques: [],
    forme: "",
    cree: 0,
    modifie: 0,
    ...base,
  };
}

export function exercicesDeBase() {
  n = 0;
  const t0 = Date.UTC(2026, 8, 1);
  const liste = [
    ex({
      id: "cat_tour_de_piste",
      techniques: ["TS.P 2"],
      forme: "actif",
      nom: "Tour de piste en patinage libre",
      categorie: "echauffement",
      duree: 5,
      objectif: "Se remettre les jambes, sentir la glace, prendre le rythme du groupe.",
      description:
        "Tout le groupe patine dans le même sens, le long des bandes, sans palet. Au coup de sifflet : on change de sens. Deuxième sifflet : on accélère jusqu'à la ligne bleue suivante puis on se laisse glisser.\n\nLe coach reste au centre et observe : qui est raide, qui regarde ses pieds, qui a peur. C'est le moment de repérer à qui parler pendant la séance.",
      points_cles: ["Genoux fléchis, dos droit, regard devant", "Bras détendus, pas de crosse dans les airs", "On ne double pas dans les virages"],
      materiel: "Aucun.",
      variantes: "Avec crosse et palet pour ceux qui sont à l'aise. Un tour en marche arrière pour les plus avancés.",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 200), J(60, 225), J(60, 250), J(300, 150, "C"),
          L("patin", [[70, 240], [300, 258], [520, 240], [565, 150], [520, 60], [300, 42], [80, 60], [35, 150], [55, 215]]),
        ],
      },
    }),

    ex({
      id: "cat_tomber_relever",
      techniques: ["TS.P 1", "TF.A 1"],
      forme: "actif",
      nom: "Tomber et se relever",
      categorie: "patinage",
      duree: 5,
      objectif: "Ne plus avoir peur de la chute : la contrôler, puis se relever seul, vite.",
      description:
        "Les joueurs en ligne, face au coach, crosse au sol. Au signal : chute contrôlée sur le côté (on plie les genoux, on se laisse tomber sur la cuisse et la hanche, jamais sur les mains tendues). Puis relevé : un genou au sol, l'autre patin à plat devant, on pousse sur la jambe avant avec les mains sur le genou.\n\nRépéter dix fois, en alternant le côté de la chute. Le coach montre d'abord, lentement.",
      points_cles: ["Chuter sur le côté, jamais en arrière", "Mains fermées ou sur la crosse, pas les doigts sur la glace", "Se relever : un genou, un patin, on pousse"],
      materiel: "Aucun.",
      variantes: "Chute pendant le patinage lent (au signal). Course de relevés : le premier debout a gagné.",
      schema: {
        vue: "moitie",
        objets: [
          J(200, 60), J(200, 90), J(200, 120), J(200, 150), J(200, 180), J(200, 210), J(200, 240),
          J(110, 150, "C"),
          T(60, 24, "Au signal : chute sur le côté,\npuis relevé sur un genou", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_freinages",
      techniques: ["TS.P 15"],
      forme: "vagues",
      nom: "Freinages de ligne en ligne",
      categorie: "patinage",
      duree: 10,
      objectif: "S'arrêter où on a décidé de s'arrêter — d'abord en chasse-neige, puis en parallèle.",
      description:
        "Chacun dans son couloir. Départ de la ligne de but, on patine jusqu'à la ligne bleue et on s'arrête dessus. Puis jusqu'à la ligne rouge, on s'arrête. Puis la deuxième bleue, puis la ligne de but d'en face.\n\nPremier passage : chasse-neige (pointes vers l'intérieur). Passages suivants : freinage parallèle du côté fort, puis du côté faible. Retour tranquille par les bandes.",
      points_cles: ["Genoux très fléchis au moment du freinage", "Poids sur la jambe avant, l'autre gratte", "On regarde la ligne, pas les patins"],
      materiel: "Aucun.",
      variantes: "Départ au sifflet, freinage au deuxième sifflet (on ne sait pas où). Freinage puis départ immédiat dans l'autre sens.",
      schema: {
        vue: "entiere",
        objets: [
          J(50, 90), J(50, 130), J(50, 170), J(50, 210),
          L("freinage", [[62, 90], [222, 90]]), L("freinage", [[236, 90], [294, 90]]), L("freinage", [[308, 90], [364, 90]]), L("freinage", [[378, 90], [550, 90]]),
          L("freinage", [[62, 130], [222, 130]]), L("freinage", [[236, 130], [294, 130]]), L("freinage", [[308, 130], [364, 130]]), L("freinage", [[378, 130], [550, 130]]),
          T(215, 40, "Stop", "bleu"), T(288, 40, "Stop", "rouge"), T(357, 40, "Stop", "bleu"), T(535, 40, "Stop", "rouge"),
          J(300, 250, "C"),
        ],
      },
    }),

    ex({
      id: "cat_cinq_cercles",
      techniques: ["TS.P 7", "TS.P 9"],
      forme: "parcours",
      nom: "Les cinq cercles",
      categorie: "patinage",
      duree: 8,
      objectif: "Tourner : prendre les carres, garder de la vitesse dans la courbe.",
      description:
        "Départ dans le coin. On fait le tour complet de chaque cercle de mise au jeu, dans l'ordre, en suivant le tracé : les deux cercles du côté gauche, le cercle central, les deux cercles du côté droit. Puis on revient par les bandes et on recommence dans l'autre sens.\n\nUn départ toutes les cinq secondes pour ne pas se rattraper.",
      points_cles: ["Se pencher vers l'intérieur du cercle", "Le patin extérieur pousse, l'intérieur guide", "Croisés pour ceux qui savent, poussées simples pour les autres"],
      materiel: "Aucun.",
      variantes: "Avec palet. Sens inverse (le côté faible de chacun). Un cercle en marche arrière.",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 262), J(80, 276),
          L("patin", [
            [95, 270],
            ...tour(100, 220, 55, Math.PI / 2, -1),
            [100, 190], [100, 140],
            ...tour(100, 80, 55, Math.PI / 2, 1),
            [140, 120], [245, 150],
            ...tour(300, 150, 55, Math.PI, -1),
            [360, 130], [500, 135],
            ...tour(500, 80, 55, Math.PI / 2, -1),
            [500, 140], [500, 165],
            ...tour(500, 220, 55, -Math.PI / 2, 1),
            [520, 270], [560, 240],
          ]),
        ],
      },
    }),

    ex({
      id: "cat_marche_arriere",
      techniques: ["TS.P 3", "TS.P 4"],
      forme: "vagues",
      nom: "Marche arrière — poussées en C",
      categorie: "patinage",
      duree: 8,
      objectif: "Reculer sans regarder ses pieds : les premières poussées en C.",
      description:
        "Départ de la ligne de but, dos à la patinoire. On recule jusqu'à la ligne bleue par poussées en C : un patin dessine un C sur la glace en poussant, l'autre glisse. Arrivé à la bleue, demi-tour et retour en avant tranquillement.\n\nLe coach se place à la ligne bleue : les joueurs reculent vers lui, ça rassure.",
      points_cles: ["Hanches basses, buste droit", "Le patin qui pousse dessine un C, talon vers l'extérieur", "On regarde par-dessus l'épaule, pas les patins"],
      materiel: "Aucun.",
      variantes: "Jusqu'à la ligne rouge. Poussées en C d'un seul côté (le faible). Marche arrière à deux en se tenant la crosse.",
      schema: {
        vue: "entiere",
        objets: [
          J(52, 90), J(52, 130), J(52, 170), J(52, 210),
          L("arriere", [[64, 90], [222, 90]]), L("arriere", [[64, 130], [222, 130]]), L("arriere", [[64, 170], [222, 170]]), L("arriere", [[64, 210], [222, 210]]),
          L("patin", [[236, 250], [64, 250]]),
          T(80, 40, "Marche arrière, poussées en C"), T(250, 275, "retour en avant"),
          J(240, 150, "C"),
        ],
      },
    }),

    ex({
      id: "cat_maniement_sur_place",
      techniques: ["TS.M 1", "TS.M 2"],
      forme: "actif",
      nom: "Maniement sur place — balayages et huit",
      categorie: "maniement",
      duree: 5,
      objectif: "Sentir le palet sur la palette sans avoir à penser à ses patins.",
      description:
        "Chacun avec un palet, bien espacés. Trente secondes par consigne :\n1. Balayages larges gauche-droite, la palette reste au contact du palet.\n2. Balayages courts et rapides devant soi.\n3. Le huit : le palet passe autour du patin droit, puis du patin gauche.\n4. Palet côté revers seulement, puis coup droit seulement.\n\nTête haute sur la dernière minute : le coach lève des doigts, les joueurs annoncent le nombre sans regarder le palet.",
      points_cles: ["Main du haut qui tourne, main du bas qui accompagne", "La palette reste au sol, on ne tape pas le palet", "Tête haute dès que c'est possible"],
      materiel: "1 palet par joueur",
      variantes: "À genoux (les mains seulement). Avec deux palets. En avançant lentement.",
      schema: {
        vue: "moitie",
        objets: [
          J(100, 80), P(108, 92), J(160, 80), P(168, 92), J(220, 80), P(228, 92),
          J(100, 150), P(108, 162), J(160, 150), P(168, 162), J(220, 150), P(228, 162),
          J(100, 220), P(108, 232), J(160, 220), P(168, 232), J(220, 220), P(228, 232),
          J(280, 150, "C"),
          T(60, 26, "Balayages larges, courts,\npuis le huit autour des pieds", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_slalom_cones",
      techniques: ["TS.M 3.1", "TS.M 3.2"],
      forme: "parcours",
      nom: "Slalom de cônes avec palet",
      categorie: "maniement",
      duree: 10,
      objectif: "Conduire le palet en tournant, sans le perdre et sans s'arrêter.",
      description:
        "Deux files, une de chaque côté. Cinq cônes en ligne devant chaque file. On slalome avec le palet jusqu'au bout, on fait demi-tour et on revient en ligne droite par le côté. Départ suivant dès que le précédent a passé le deuxième cône.\n\nPremière série lentement, au contrôle. Deuxième série on accélère. Palet perdu : on le récupère et on continue, on ne saute pas de cône.",
      points_cles: ["Le palet passe devant le cône, le joueur derrière", "Coup droit d'un côté, revers de l'autre", "Le regard sur le cône suivant, pas sur le palet"],
      materiel: "10 plots\n1 palet par joueur",
      variantes: "Cônes plus rapprochés. Sans crosse (le palet aux pieds, pour rire). Retour en marche arrière sans palet.",
      schema: {
        vue: "moitie",
        objets: [
          J(50, 80), J(35, 80), P(60, 84), K(100, 80), K(140, 80), K(180, 80), K(220, 80), K(260, 80),
          L("conduite", [[66, 80], [100, 62], [140, 98], [180, 62], [220, 98], [260, 62], [290, 80]]),
          L("patin", [[290, 100], [280, 115], [60, 115]]),
          J(50, 220), J(35, 220), P(60, 224), K(100, 220), K(140, 220), K(180, 220), K(220, 220), K(260, 220),
          L("conduite", [[66, 220], [100, 202], [140, 238], [180, 202], [220, 238], [260, 202], [290, 220]]),
          L("patin", [[290, 200], [280, 185], [60, 185]]),
          J(160, 150, "C"),
        ],
      },
    }),

    ex({
      id: "cat_passes_paires",
      techniques: [],
      forme: "duo",
      nom: "Passes en paires, à l'arrêt",
      categorie: "passe",
      duree: 8,
      objectif: "Le geste de la passe : balayer, pas taper. Et recevoir avec une palette souple.",
      description:
        "Par deux, face à face, à dix mètres. Passes coup droit pendant deux minutes, puis revers deux minutes, puis on s'éloigne à quinze mètres. Compter les passes réussies d'affilée : le duo qui tient le plus long annonce son score.\n\nLe coach passe derrière chaque duo et corrige la position des mains.",
      points_cles: ["Le palet part du talon de la palette vers la pointe, en balayant", "On vise la palette du partenaire, pas le joueur", "Recevoir : la palette accompagne, elle amortit"],
      materiel: "1 palet par duo",
      variantes: "Passes levées (soulevées) par-dessus une crosse posée au sol. Un pas de côté entre chaque passe.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 70), J(210, 70, "O", "", "bleu"), L("echange", [[102, 70], [198, 70]], "rouge"),
          J(90, 120), J(210, 120, "O", "", "bleu"), L("echange", [[102, 120], [198, 120]], "rouge"),
          J(90, 180), J(210, 180, "O", "", "bleu"), L("echange", [[102, 180], [198, 180]], "rouge"),
          J(90, 230), J(210, 230, "O", "", "bleu"), L("echange", [[102, 230], [198, 230]], "rouge"),
          T(90, 28, "Coup droit deux minutes, puis revers", "noir", "petit"),
          J(270, 150, "C"),
        ],
      },
    }),

    ex({
      id: "cat_passe_et_suit",
      techniques: [],
      forme: "vagues",
      nom: "Passe et suit",
      categorie: "passe",
      duree: 8,
      objectif: "Passer puis bouger : la passe n'est pas la fin de l'action.",
      description:
        "Deux files face à face, à quinze mètres. Le premier de la file A passe au premier de la file B, puis patine pour se ranger derrière la file B. Celui qui a reçu passe au suivant de la file A et suit son palet de la même façon.\n\nUn seul palet en jeu par couple de files. Quand ça tourne bien, on ajoute un deuxième palet.",
      points_cles: ["Passe d'abord, on part ensuite", "On reçoit en mouvement, palette au sol, prêt avant l'arrivée du palet", "On patine large pour ne pas couper la ligne de passe"],
      materiel: "2 palets par couple de files",
      variantes: "Passe puis marche arrière jusqu'à l'autre file. Deux touches maximum avant de passer.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 150), J(45, 150), J(30, 150), P(70, 154),
          J(240, 150, "O", "", "bleu"), J(255, 150, "O", "", "bleu"), J(270, 150, "O", "", "bleu"),
          L("passe", [[72, 150], [228, 150]], "rouge"),
          L("patin", [[65, 165], [150, 190], [235, 165]]),
          T(80, 60, "Passe, puis rejoins la file d'en face", "noir", "petit"),
          J(150, 250, "C"),
        ],
      },
    }),

    ex({
      id: "cat_montee_a_deux",
      techniques: [],
      forme: "duo",
      nom: "Montée à deux avec passes",
      categorie: "passe",
      duree: 10,
      objectif: "Passer en patinant, à un partenaire qui bouge aussi — et finir par un tir.",
      description:
        "Par deux, départ de la ligne de but, un de chaque côté. On monte toute la patinoire en se faisant des passes (au moins quatre). Arrivés dans la zone d'en face, celui qui a le palet tire, l'autre va au rebond. Retour par les bandes, les deux suivants partent quand les premiers passent la ligne rouge.\n\nLe gardien est en cage si vous en avez un ; sinon, une cage vide fait très bien l'affaire.",
      points_cles: ["Passer devant le partenaire, dans sa course", "Rester à la même hauteur que son partenaire", "Le receveur montre sa palette au sol : c'est la cible"],
      materiel: "20 palets",
      variantes: "Passes obligatoirement en revers. Trois joueurs de front.",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 100), J(60, 200), P(72, 104), J(552, 150, "G"),
          L("patin", [[72, 100], [520, 100]]), L("patin", [[72, 200], [520, 200]]),
          L("passe", [[110, 106], [170, 194]], "rouge"), L("passe", [[200, 194], [260, 106]], "rouge"),
          L("passe", [[290, 106], [350, 194]], "rouge"), L("passe", [[380, 194], [440, 106]], "rouge"),
          L("tir", [[500, 106], [556, 145]], "rouge"),
          T(230, 40, "Au moins quatre passes avant la bleue"),
        ],
      },
    }),

    ex({
      id: "cat_tir_poignet",
      techniques: [],
      forme: "vagues",
      nom: "Tirs du poignet depuis le haut du cercle",
      categorie: "tir",
      duree: 10,
      objectif: "Le tir du poignet : transférer le poids, balayer, finir la palette vers la cible.",
      description:
        "Deux files au haut des cercles, un tas de palets à chaque file. Chacun tire à son tour, sans se déplacer, puis va récupérer un palet derrière la cage et rejoint l'autre file.\n\nOn vise d'abord la cage, puis les coins : le coach annonce « en haut à gauche », etc. Les gardiens débutants : uniquement des tirs au sol les cinq premières minutes.",
      points_cles: ["Le palet part de derrière le pied arrière", "Poids qui passe de la jambe arrière à la jambe avant", "La palette finit pointée vers la cible, on « la ferme » sur le palet"],
      materiel: "20 palets",
      variantes: "Tir après une passe du coach. Tir en revers. Tir après un tour sur soi-même.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(150, 80), P(162, 72), P(168, 78), P(163, 85), J(190, 68), J(210, 58),
          J(150, 220), P(162, 228), P(168, 222), P(163, 215), J(190, 232), J(210, 242),
          L("tir", [[140, 86], [46, 143]], "rouge"), L("tir", [[140, 214], [46, 157]], "rouge"),
          L("patin", [[135, 95], [60, 120], [25, 150], [60, 180], [135, 205]]),
          J(240, 150, "C"),
          T(110, 280, "Tirer depuis le haut du cercle, sans avancer", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_cone_et_tir",
      techniques: [],
      forme: "vagues",
      nom: "Contourner le cône et tirer",
      categorie: "tir",
      duree: 10,
      objectif: "Enchaîner : patiner, tourner avec le palet, tirer en mouvement.",
      description:
        "Deux files dans les coins de la zone, un cône devant chacune. Le premier part avec un palet, contourne le cône par l'extérieur, revient vers la cage et tire en mouvement. Il récupère son palet et se range dans l'autre file.\n\nOn alterne les deux files, un joueur à la fois. Le tir part avant la zone de but : pas de collision avec le gardien.",
      points_cles: ["Palet devant soi dans le virage, pas sur le côté", "Deux appuis après le cône, puis on tire", "Tirer en mouvement, sans s'arrêter"],
      materiel: "2 plots\n20 palets",
      variantes: "Deux cônes à contourner. Passe du coach au sortir du cône puis tir.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"), K(155, 115), K(155, 185),
          J(250, 45), J(270, 45), J(290, 45), P(238, 50),
          L("conduite", [[236, 54], [190, 70], [150, 100], [120, 128], [92, 145]]), L("tir", [[88, 147], [46, 150]], "rouge"),
          J(250, 255), J(270, 255), J(290, 255), P(238, 250),
          L("conduite", [[236, 246], [190, 230], [150, 200], [120, 172], [92, 155]]), L("tir", [[88, 153], [46, 150]], "rouge"),
          T(100, 150, "Une file après l'autre,\nun joueur à la fois", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_relais",
      techniques: [],
      forme: "relais",
      nom: "Relais par équipes",
      categorie: "jeu",
      duree: 8,
      objectif: "Patiner vite, freiner, repartir — et rire un peu.",
      description:
        "Deux ou trois équipes, une file par équipe à la ligne de but. Au signal, le premier patine jusqu'au cône au bout, le contourne, revient et tape dans la main du suivant qui part. La première équipe dont tous les joueurs sont passés a gagné.\n\nManches successives : sans palet, avec palet, avec freinage obligatoire à la ligne rouge, en marche arrière sur la bleue-bleue.",
      points_cles: ["On contourne le cône, on ne le pousse pas", "Le suivant ne part qu'après la tape dans la main", "Freiner avant la file, pas dedans"],
      materiel: "1 plot par équipe\n20 palets",
      variantes: "Relais avec obstacle (crosse au sol à enjamber). Relais où l'on transporte un palet sur la palette sans le lâcher.",
      schema: {
        vue: "entiere",
        objets: [
          J(75, 120), J(58, 120), J(41, 120), K(540, 120),
          J(75, 180, "O", "", "bleu"), J(58, 180, "O", "", "bleu"), J(41, 180, "O", "", "bleu"), K(540, 180),
          L("patin", [[88, 114], [530, 112], [550, 120], [530, 128], [95, 126]]),
          L("patin", [[88, 174], [530, 172], [550, 180], [530, 188], [95, 186]], "bleu"),
          T(230, 40, "Autour du cône, retour, tape dans la main"),
          J(300, 250, "C"),
        ],
      },
    }),

    ex({
      id: "cat_trois_contre_trois",
      nom: "Trois contre trois en zone",
      categorie: "jeu",
      duree: 10,
      objectif: "Jouer pour de vrai, dans un espace réduit : se démarquer, passer, tirer.",
      description:
        "Une seule zone, une seule cage, un gardien (ou une cage vide). Trois contre trois, deux minutes par manche, puis on change les équipes. L'équipe qui récupère le palet doit sortir au-dessus du haut des cercles avant d'attaquer.\n\nPas de hors-jeu, pas de mise en échec. Le coach siffle vite et souvent : il vaut mieux relancer que laisser tomber le jeu.",
      points_cles: ["Sans le palet : bouger, offrir une passe", "Avec le palet : tête haute, passe ou tir, on ne s'enferme pas dans un coin", "Le gardien parle : « à gauche ! », « tire ! »"],
      materiel: "Chasubles de deux couleurs",
      variantes: "Deux contre deux. Trois passes obligatoires avant de tirer. Deux cages sur la largeur de la zone.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(120, 100, "X", "", "rouge"), J(140, 185, "X", "", "rouge"), J(200, 140, "X", "", "rouge"),
          J(110, 140, "O", "", "bleu"), J(165, 90, "O", "", "bleu"), J(180, 205, "O", "", "bleu"),
          P(205, 150), J(290, 40, "C"),
          T(70, 270, "Une zone, une cage — on ressort\nau-dessus des cercles pour attaquer", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_retour_au_calme",
      nom: "Retour au calme et étirements",
      categorie: "retour",
      duree: 5,
      objectif: "Finir tranquillement, étirer ce qui a travaillé, dire un mot sur la séance.",
      description:
        "Un tour de piste lent, puis tout le monde en cercle au centre, un genou à terre. Étirements guidés par le coach : adducteurs, fessiers, quadriceps, bas du dos. Dix à quinze secondes par position, sans à-coups.\n\nPendant les étirements, le coach fait le bilan : ce qui a progressé, ce qu'on refera la prochaine fois. Une question à chacun : « qu'est-ce qui était le plus dur aujourd'hui ? »",
      points_cles: ["On respire, on ne force pas", "Chacun parle une fois", "On quitte la glace ensemble"],
      materiel: "Aucun.",
      variantes: "",
      schema: {
        vue: "entiere",
        objets: [
          ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => J(Math.round(300 + 60 * Math.cos((i * Math.PI) / 4)), Math.round(150 + 60 * Math.sin((i * Math.PI) / 4)))),
          J(300, 150, "C"),
          T(215, 50, "Étirements guidés, en cercle, un genou à terre"),
        ],
      },
    }),

    /* ── La gamme — vingt exercices de plus, du premier pas sur la glace
       au match en travers. Progression inspirée des méthodes
       « apprendre à patiner » (tomber, marcher, glisser, pousser, freiner,
       reculer, croiser) et des jeux en espace réduit du modèle de
       développement nord-américain. ── */

    ex({
      id: "cat_echauffement_hors_glace",
      nom: "Échauffement hors glace",
      categorie: "echauffement",
      niveau: "tous",
      duree: 8,
      objectif: "Arriver sur la glace chaud, souple et réveillé — c'est là qu'on évite les blessures.",
      description:
        "Dans le couloir ou le vestiaire, avant de chausser, en tenue :\n1. Deux minutes de trottinement sur place, montées de genoux, talons-fesses.\n2. Balancements de jambes avant-arrière puis latéraux, dix par côté, une main au mur.\n3. Dix fentes avant en marchant, dix squats lents, dix rotations de hanches.\n4. Rotations de chevilles, de poignets, d'épaules.\n5. Trente secondes de sautillements, puis on chausse.\n\nAucun étirement long avant la séance : les étirements, c'est à la fin.",
      points_cles: ["Tout en mouvement, rien de statique", "On transpire un peu avant la glace", "Chevilles et hanches d'abord : c'est ce qui travaille"],
      materiel: "1 couloir",
      variantes: "Avec une balle et la crosse : maniement sur place pendant les sautillements.",
      schema: {
        vue: "entiere",
        objets: [T(150, 100, "Hors glace, avant de chausser :\ntrottiner · balancer les jambes · fentes\nsquats · rotations · sautillements", "noir", "grand")],
      },
    }),

    ex({
      id: "cat_feu_rouge_feu_vert",
      nom: "Feu rouge, feu vert",
      categorie: "echauffement",
      duree: 6,
      objectif: "Partir, s'arrêter, repartir — l'échauffement qui apprend à freiner sans le dire.",
      description:
        "Tous les joueurs sur la ligne de but, le coach au fond de l'autre côté, dos tourné. « Vert ! » : on patine vers lui. « Rouge ! » : le coach se retourne, tout le monde doit être arrêté. Celui qui bouge encore repart à la ligne. Le premier qui touche le coach gagne — et devient le feu.\n\nTrois manches : en avant, puis avec palet, puis en marche arrière pour ceux qui savent.",
      points_cles: ["À « rouge », on freine vraiment : genoux fléchis, patins qui rabotent", "On repart en poussant, pas en marchant", "Regarder le coach, pas ses pieds"],
      materiel: "Aucun.",
      variantes: "« Orange » : un genou au sol. « Bleu » : on s'assoit et on se relève.",
      schema: {
        vue: "entiere",
        objets: [
          J(55, 70), J(55, 110), J(55, 150), J(55, 190), J(55, 230),
          L("patin", [[68, 70], [200, 70]]), L("patin", [[68, 150], [200, 150]]), L("patin", [[68, 230], [200, 230]]),
          J(545, 150, "C"),
          T(230, 40, "Vert : on patine — Rouge : on s'arrête net"),
        ],
      },
    }),

    ex({
      id: "cat_marche_glisse",
      techniques: ["TS.P 1", "TF.M 3"],
      forme: "actif",
      nom: "Marcher, puis glisser",
      categorie: "patinage",
      duree: 8,
      objectif: "Les tout premiers pas : tenir debout, marcher, puis oser glisser.",
      description:
        "Pour ceux qui n'ont jamais patiné. Le long de la bande, une main dessus si besoin :\n1. Marcher sur place, en levant les patins comme des pieds.\n2. Marcher en avant, petits pas, pointes légèrement ouvertes.\n3. Trois pas puis glisser sur les deux pieds, patins parallèles, jusqu'à l'arrêt.\n4. Trois pas puis glisser sur un seul pied, deux secondes, puis l'autre.\n\nLe coach patine à côté du plus inquiet. On ne va pas plus loin que la ligne bleue.",
      points_cles: ["Genoux pliés, mains devant, comme pour s'asseoir sur un tabouret", "Le regard loin devant, jamais sur les patins", "Les bras servent d'équilibre, pas la crosse"],
      materiel: "Aucun (pas de crosse pour cet exercice).",
      variantes: "Glisser en position de gardien (accroupi). Glisser puis toucher la glace d'une main sans tomber.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 60), J(60, 90), J(60, 120), J(60, 150), J(60, 180), J(60, 210), J(60, 240),
          L("patin", [[72, 60], [150, 60]]), L("patin", [[72, 150], [150, 150]]), L("patin", [[72, 240], [150, 240]]),
          J(200, 150, "C"),
          T(70, 26, "Marcher, puis glisser sur deux pieds,\npuis sur un pied", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_trottinette",
      techniques: ["TS.P 2", "TS.P 5", "TF.M 1"],
      forme: "vagues",
      nom: "Poussées en trottinette",
      categorie: "patinage",
      duree: 6,
      objectif: "Comprendre d'où vient la vitesse : la carre interne, pas la pointe du patin.",
      description:
        "Chacun dans son couloir, sur toute la longueur. Un patin reste au sol et glisse, l'autre pousse sur le côté comme sur une trottinette, puis revient sous le corps. Dix poussées du même pied, puis on change au retour.\n\nEnsuite, on alterne : une poussée gauche, une poussée droite, en laissant glisser entre les deux. C'est le vrai pas de patinage.",
      points_cles: ["La poussée part sur le côté, à 45°, pas vers l'arrière", "Le patin qui glisse reste bien à plat, genou fléchi", "Finir chaque poussée jambe tendue, puis ramener le pied sous soi"],
      materiel: "Aucun.",
      variantes: "Compter le nombre de poussées pour traverser : moins il y en a, mieux c'est.",
      schema: {
        vue: "entiere",
        objets: [
          J(50, 80), J(50, 130), J(50, 180), J(50, 230),
          L("patin", [[62, 80], [550, 80]]), L("patin", [[62, 130], [550, 130]]), L("patin", [[62, 180], [550, 180]]), L("patin", [[62, 230], [550, 230]]),
          T(150, 40, "Un patin pousse (carre interne), l'autre glisse — changer de pied au retour"),
        ],
      },
    }),

    ex({
      id: "cat_arret_bandes",
      techniques: ["TS.P 15"],
      forme: "vagues",
      nom: "Arrêt hockey face à la bande",
      categorie: "patinage",
      duree: 8,
      objectif: "Le vrai freinage, des deux côtés, sans peur : la bande est là pour rattraper.",
      description:
        "Départ au milieu de la zone, face à la bande. Trois poussées, puis glisse lente, et on tourne les hanches d'un quart de tour : les deux patins dérapent de côté et rabotent la glace jusqu'à l'arrêt. Si ça ne s'arrête pas, la bande est là — à dix mètres, on a le temps.\n\nCinq arrêts du côté fort, cinq du côté faible, en alternant bande du haut et bande du bas. Puis on augmente la vitesse.",
      points_cles: ["Genoux très fléchis avant de tourner les hanches", "Le poids sur le patin avant, le patin arrière suit", "S'entraîner du côté faible dès le premier jour"],
      materiel: "Aucun.",
      variantes: "Arrêt puis départ immédiat dans l'autre sens. Arrêt sur un seul patin (le pied avant).",
      schema: {
        vue: "moitie",
        objets: [
          J(160, 110), J(160, 150), J(160, 190),
          L("freinage", [[160, 98], [160, 30]]), L("freinage", [[160, 202], [160, 270]]),
          T(175, 45, "Arrêt", "rouge"), T(175, 262, "Arrêt", "rouge"),
          J(240, 150, "C"),
          T(60, 150, "Glisser lentement, tourner\nles hanches, raboter la glace", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_croises_cercle",
      techniques: ["TS.P 9"],
      forme: "groupes3",
      nom: "Croisés sur le cercle",
      categorie: "patinage",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Le pied extérieur passe par-dessus l'intérieur : accélérer dans un virage.",
      description:
        "D'abord à l'arrêt, une main sur la bande : on « marche » de côté en croisant le pied extérieur par-dessus le pied intérieur, dix fois vers la gauche, dix vers la droite.\n\nPuis sur le cercle de mise au jeu : on tourne lentement, penché vers l'intérieur, et on ajoute un croisé tous les deux pas. Cinq tours dans un sens, cinq dans l'autre. On ne cherche pas la vitesse, on cherche à ne pas accrocher.",
      points_cles: ["Se pencher vers l'intérieur du cercle, épaules parallèles à la glace", "Le pied intérieur pousse sur la carre externe — c'est la partie difficile", "Le pied extérieur passe devant, pas derrière"],
      materiel: "Aucun.",
      variantes: "Avec palet. En marche arrière (croisés arrière) pour les plus avancés.",
      schema: {
        vue: "moitie",
        objets: [
          L("patin", [...tour(100, 220, 55, Math.PI / 2, -1), [100, 275]]),
          L("patin", [...tour(100, 80, 55, -Math.PI / 2, 1), [100, 25]]),
          J(170, 275), J(185, 280), J(170, 25), J(185, 20),
          T(175, 150, "D'abord à l'arrêt, une main à la bande :\nle pied extérieur passe par-dessus", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_glisse_un_pied",
      techniques: ["TF.A 1", "TF.M 2", "TF.M 3"],
      forme: "vagues",
      nom: "Glisse sur un pied et serpents",
      categorie: "patinage",
      duree: 6,
      objectif: "Tenir sur un patin, puis sentir les carres interne et externe.",
      description:
        "Élan jusqu'à la ligne bleue, puis glisse sur un seul pied jusqu'à la ligne rouge — d'abord le pied fort, puis l'autre. Celui qui glisse le plus loin sans poser gagne la manche.\n\nDeuxième partie, entre la rouge et la deuxième bleue : les serpents. Patins parallèles, à plat, on ondule en basculant d'une carre à l'autre, sans lever les pieds. Puis les mêmes serpents sur un seul pied.",
      points_cles: ["Genou de la jambe porteuse fléchi, l'autre jambe légèrement devant", "Sur les serpents, ce sont les genoux qui dessinent la courbe", "Bras détendus, buste immobile"],
      materiel: "Aucun.",
      variantes: "Serpents en marche arrière. Glisse sur un pied en position de tir (crosse au sol).",
      schema: {
        vue: "entiere",
        objets: [
          J(50, 100), J(50, 200),
          L("patin", [[62, 100], [225, 100]]), L("patin", [[62, 200], [225, 200]]),
          T(90, 70, "élan", "noir", "petit"),
          L("glisse", [[236, 100], [364, 100]]), L("glisse", [[236, 200], [364, 200]]),
          L("libre", [[236, 100], [260, 88], [290, 112], [320, 88], [350, 112], [368, 100]]),
          L("libre", [[236, 200], [260, 188], [290, 212], [320, 188], [350, 212], [368, 200]]),
          T(240, 150, "glisse sur un pied jusqu'à la rouge, puis serpents", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_virages_serres",
      techniques: ["TS.P 7"],
      forme: "parcours",
      nom: "Virages serrés autour des cônes",
      categorie: "patinage",
      duree: 8,
      objectif: "Tourner court, dans les deux sens, en gardant la vitesse.",
      description:
        "Quatre cônes en quinconce sur toute la longueur. On contourne chaque cône au plus près, en alternant le sens : gauche, droite, gauche, droite. Retour par la bande.\n\nPremier passage lentement, en glissant les deux patins parallèles dans le virage. Deuxième passage avec palet. Troisième : on se chronomètre.",
      points_cles: ["Les deux patins restent au sol dans le virage, celui de l'intérieur devant", "Se pencher vers le cône, la main basse presque à toucher la glace", "Sortir du virage en poussant, pour relancer"],
      materiel: "4 plots",
      variantes: "Virage puis arrêt. Contourner en marche arrière.",
      schema: {
        vue: "entiere",
        objets: [
          K(150, 100), K(250, 200), K(350, 100), K(450, 200),
          J(45, 150), J(30, 150),
          L("patin", [[60, 150], [140, 82], [165, 108], [245, 218], [268, 192], [345, 82], [368, 108], [445, 218], [470, 192], [545, 150]]),
        ],
      },
    }),

    ex({
      id: "cat_transition_avant_arriere",
      techniques: ["TS.P 19", "TS.P 20"],
      forme: "vagues",
      nom: "Avant, demi-tour, arrière",
      categorie: "patinage",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Changer de sens sans s'arrêter : la transition avant-arrière, puis arrière-avant.",
      description:
        "Dans son couloir : patinage avant jusqu'à la première bleue, demi-tour (on ouvre les hanches, les épaules suivent) et marche arrière jusqu'à la deuxième bleue, nouveau demi-tour et patinage avant jusqu'au bout.\n\nDemi-tour vers la gauche à l'aller, vers la droite au retour. Lentement d'abord : le but est de ne pas perdre la glisse pendant le pivot.",
      points_cles: ["Le pivot part des hanches, la tête regarde déjà dans le nouveau sens", "Rester bas pendant le demi-tour", "Ne pas s'arrêter pour se retourner — la glisse continue"],
      materiel: "Aucun.",
      variantes: "Avec palet. Pivot au sifflet, sans savoir où.",
      schema: {
        vue: "entiere",
        objets: [
          J(50, 100), J(50, 200),
          L("pivot", [[62, 100], [225, 100]]), L("arriere", [[236, 100], [364, 100]]), L("pivot", [[368, 100], [550, 100]]),
          L("pivot", [[62, 200], [225, 200]]), L("arriere", [[236, 200], [364, 200]]), L("pivot", [[368, 200], [550, 200]]),
          T(150, 40, "Avant → demi-tour → arrière → demi-tour → avant"),
        ],
      },
    }),

    ex({
      id: "cat_conduite_tete_haute",
      techniques: ["TS.M 1"],
      forme: "actif",
      nom: "Conduite tête haute",
      categorie: "maniement",
      duree: 6,
      objectif: "Patiner avec le palet en regardant le jeu, pas la palette.",
      description:
        "Tout le monde avec un palet, en boucle libre dans la zone, sans se rentrer dedans — c'est déjà un exercice. Le coach au centre lève des doigts, change de main, change de nombre : les joueurs annoncent à voix haute ce qu'ils voient.\n\nPuis le coach donne des consignes : « palet côté revers », « tout le monde s'arrête », « on change de sens ». Celui qui perd son palet le récupère et repart.",
      points_cles: ["Le palet devant soi, un peu sur le côté, pas sous les pieds", "Sentir le palet par la palette, pas par les yeux", "Regarder les autres : c'est le début du jeu"],
      materiel: "1 palet par joueur",
      variantes: "En marche arrière. Deux palets par joueur. Le coach lance une balle de tennis à attraper d'une main.",
      schema: {
        vue: "moitie",
        objets: [
          L("conduite", [[80, 60], [200, 45], [275, 120], [255, 235], [130, 265], [55, 190], [70, 80]]),
          J(160, 150, "C"), J(90, 50), P(98, 58), J(230, 240), P(238, 248), J(60, 170), P(68, 178),
          T(90, 150, "Annoncer les doigts\nlevés par le coach", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_requins_sardines",
      techniques: ["TS.M 3.1"],
      forme: "actif",
      nom: "Requins et sardines",
      categorie: "jeu",
      duree: 8,
      objectif: "Protéger son palet en traversant, voler celui des autres : le jeu qui apprend l'esquive.",
      description:
        "Les sardines, chacune avec un palet, alignées sur la ligne de but. Deux requins sans palet au centre. Au signal, les sardines traversent jusqu'à l'autre ligne de but ; les requins essaient de leur prendre le palet. Une sardine sans palet devient requin.\n\nOn recommence dans l'autre sens jusqu'à ce qu'il ne reste que deux ou trois sardines : ce sont les gagnants, et les premiers requins de la manche suivante.",
      points_cles: ["Le corps entre le requin et le palet", "Changer de vitesse plutôt que de direction", "Les requins : la palette au sol, on soulève la crosse de l'autre"],
      materiel: "1 palet par joueur",
      variantes: "Les requins en marche arrière. Zone réduite (entre les bleues).",
      schema: {
        vue: "entiere",
        objets: [
          J(55, 60), P(66, 66), J(55, 90), P(66, 96), J(55, 120), P(66, 126), J(55, 150), P(66, 156), J(55, 180), P(66, 186), J(55, 210), P(66, 216), J(55, 240), P(66, 246),
          J(300, 110, "O", "", "rouge"), J(300, 190, "O", "", "rouge"),
          L("conduite", [[75, 90], [250, 70], [400, 120], [540, 90]]), L("conduite", [[75, 210], [230, 240], [420, 200], [540, 220]]),
          T(200, 40, "Sardines : traverser avec le palet — Requins : le voler"),
        ],
      },
    }),

    ex({
      id: "cat_gardez_le_palet",
      nom: "Gardez le palet",
      categorie: "jeu",
      duree: 8,
      objectif: "Passer vite et bouger pour offrir une solution : trois contre un dans un cercle.",
      description:
        "Dans chaque cercle de mise au jeu : trois joueurs sur le bord, un défenseur au milieu. Les trois se font des passes sans sortir du cercle ; le défenseur essaie d'intercepter. Trois passes d'affilée = un point. Interception = le passeur devient défenseur.\n\nDeux minutes par cercle, puis les groupes tournent. Les joueurs du bord ont le droit de se déplacer le long du cercle : c'est même le but.",
      points_cles: ["Passer dès que la ligne est ouverte, pas de dribble", "Sans le palet : bouger pour ne pas être caché derrière le défenseur", "Le défenseur : la crosse au sol, dans la ligne de passe"],
      materiel: "1 palet par cercle",
      variantes: "Quatre contre deux dans la zone entière. Passes en revers uniquement.",
      schema: {
        vue: "moitie",
        objets: [
          J(100, 175), J(58, 245), J(142, 245), J(100, 220, "O", "", "rouge"),
          L("passe", [[100, 187], [62, 236]], "bleu"), L("passe", [[70, 250], [130, 250]], "bleu"), L("passe", [[138, 236], [104, 187]], "bleu"),
          J(100, 35), J(58, 105), J(142, 105), J(100, 80, "O", "", "rouge"),
          L("passe", [[100, 47], [62, 96]], "bleu"), L("passe", [[70, 110], [130, 110]], "bleu"), L("passe", [[138, 96], [104, 47]], "bleu"),
          T(175, 150, "3 contre 1 dans le cercle :\ntrois passes = un point", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passes_revers",
      techniques: [],
      forme: "groupes3",
      nom: "Triangle de passes, en revers",
      categorie: "passe",
      duree: 8,
      objectif: "La passe du revers et la réception en mouvement — les deux gestes qu'on oublie toujours.",
      description:
        "Par trois, en triangle, à huit mètres. Le palet tourne dans un sens : chaque passe se fait en revers, chaque réception se fait en coup droit puis on pivote. Une minute, puis on inverse le sens : les passes sont en coup droit, les réceptions en revers.\n\nQuand ça tourne, les trois avancent lentement vers l'autre bout de la glace en gardant le triangle.",
      points_cles: ["Revers : la main du bas tire, la main du haut pousse, le palet part de la pointe", "La réception : palette au sol, inclinée sur le palet, et on amortit", "Se replacer après chaque passe, la palette montre la cible"],
      materiel: "1 palet par trio",
      variantes: "Passes levées. Triangle en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 60), J(180, 60), J(130, 135),
          L("passe", [[92, 60], [168, 60]], "vert"), L("passe", [[172, 72], [138, 124]], "vert"), L("passe", [[120, 124], [86, 72]], "vert"),
          J(80, 190), J(180, 190), J(130, 265),
          L("passe", [[168, 190], [92, 190]], "vert"), L("passe", [[86, 202], [120, 254]], "vert"), L("passe", [[138, 254], [172, 202]], "vert"),
          T(200, 150, "En revers uniquement,\nle triangle tourne dans les deux sens", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passe_bande",
      techniques: [],
      forme: "actif",
      nom: "Passe contre la bande",
      categorie: "passe",
      duree: 6,
      objectif: "Se faire une passe à soi-même par la bande : dosage, angle, et récupération en mouvement.",
      description:
        "Le long de la bande, en patinant à vitesse moyenne : on passe le palet en diagonale vers la bande, devant soi, et on le récupère au rebond sans s'arrêter. Trois ou quatre rebonds sur la longueur, puis retour par le milieu.\n\nLe secret est dans l'angle : plus on passe loin devant, plus le palet revient loin. Les bandes rendent ce qu'on leur donne.",
      points_cles: ["Passer devant soi, jamais à hauteur", "Dosage : le palet doit revenir sur la palette, pas dans les patins", "Regarder la bande, pas le palet"],
      materiel: "1 palet par joueur",
      variantes: "Par deux : l'un passe à la bande, l'autre récupère. En marche arrière.",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 250), P(72, 254),
          L("patin", [[75, 250], [530, 250]]),
          L("passe", [[120, 258], [160, 292]], "vert"), L("passe", [[165, 292], [205, 258]], "vert"),
          L("passe", [[260, 258], [300, 292]], "vert"), L("passe", [[305, 292], [345, 258]], "vert"),
          L("passe", [[400, 258], [440, 292]], "vert"), L("passe", [[445, 292], [485, 258]], "vert"),
          T(150, 200, "Passer contre la bande devant soi, récupérer sans s'arrêter"),
        ],
      },
    }),

    ex({
      id: "cat_tir_revers",
      techniques: [],
      forme: "vagues",
      nom: "Tir du revers",
      categorie: "tir",
      duree: 8,
      objectif: "Tirer du revers depuis l'enclave : le tir que personne ne travaille et que les gardiens détestent.",
      description:
        "Deux files dans l'enclave, un tas de palets chacune. On tire du revers, à l'arrêt d'abord : le palet au milieu de la palette côté revers, le poids qui passe sur la jambe avant, et la palette qui se referme vers le haut pour soulever.\n\nPuis en mouvement : deux poussées, tir. Alterner les files. Le gardien reste au sol les cinq premières minutes.",
      points_cles: ["Palet sur le revers, un peu en arrière du pied", "Poids sur la jambe avant au moment du tir", "La palette suit le palet et se ferme vers la cible"],
      materiel: "20 palets",
      variantes: "Tir du revers après une passe. Coup droit puis revers en enchaînement.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(130, 115), P(140, 106), P(146, 112), P(141, 119), J(175, 105), J(195, 98),
          J(130, 185), P(140, 194), P(146, 188), P(141, 181), J(175, 195), J(195, 202),
          L("tir", [[118, 120], [46, 145]], "rouge"), L("tir", [[118, 180], [46, 155]], "rouge"),
          J(240, 150, "C"),
          T(60, 275, "Palet sur le revers, poids sur la jambe avant,\npalette qui se ferme vers le haut", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passe_coin_tir",
      techniques: [],
      forme: "vagues",
      nom: "Passe du coin, tir en mouvement",
      categorie: "tir",
      duree: 10,
      objectif: "Recevoir en patinant vers la cage et tirer sans s'arrêter — le geste du match.",
      description:
        "Un passeur dans le coin avec les palets. Une file de tireurs à la ligne bleue. Le tireur part, patine vers l'enclave ; le passeur lui donne le palet dans sa course ; le tireur reçoit et tire en mouvement, sans reprise de contrôle.\n\nLe tireur va récupérer son palet et devient passeur ; le passeur rejoint la file. Changer de coin à mi-temps pour travailler l'autre côté.",
      points_cles: ["Le tireur part quand le passeur a le palet sur la palette", "Palette au sol, cible montrée : la passe arrive dans la course", "Recevoir et tirer dans le même mouvement, pas d'arrêt"],
      materiel: "20 palets",
      variantes: "Tir en une touche pour les plus avancés. Deuxième passeur dans l'autre coin, tir sur la deuxième passe.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(60, 250), P(70, 258), P(76, 252),
          J(232, 60), J(250, 52), J(268, 46),
          L("patin", [[225, 70], [130, 132]]),
          L("passe", [[72, 244], [126, 140]], "rouge"),
          L("tir", [[118, 128], [46, 148]], "rouge"),
          T(150, 200, "Le tireur part quand le passeur\na le palet sur la palette", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_deplacements",
      nom: "Le gardien : déplacements de base",
      categorie: "gardien",
      duree: 8,
      objectif: "Poteau à poteau, papillon, relevé : les trois mouvements que le gardien débutant répète.",
      description:
        "Le gardien dans sa zone, le coach devant avec des palets. Sans tir d'abord :\n1. Poussée en T d'un poteau à l'autre, cinq fois : le patin extérieur pousse, l'autre glisse, on s'arrête épaule contre le poteau.\n2. Papillon (les deux genoux au sol, jambières à plat) puis relevé, cinq fois.\n3. Glissade latérale en papillon, d'un poteau à l'autre.\n\nPuis le coach tire doucement au sol, en annonçant le côté, et le gardien fait le mouvement correspondant.",
      points_cles: ["Toujours face au palet, le buste droit", "Les mains devant, jamais collées au corps", "On se relève par la jambe du côté où on doit aller"],
      materiel: "10 palets",
      variantes: "Tirs sans annonce. Tirs à mi-hauteur. Deux tireurs qui se passent le palet avant de tirer.",
      schema: {
        vue: "moitie",
        objets: [
          J(52, 150, "G"),
          L("patin", [[52, 140], [52, 128]], "bleu"), L("patin", [[52, 160], [52, 172]], "bleu"),
          J(110, 150, "C"), P(120, 142), P(126, 148), P(121, 155),
          J(130, 100), J(130, 200),
          L("tir", [[120, 105], [58, 140]], "rouge"), L("tir", [[120, 195], [58, 160]], "rouge"),
          T(150, 260, "Poteau à poteau en poussée en T ;\npapillon puis relevé ; glissade latérale", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_chat_glace",
      techniques: ["TS.P 7", "TS.P 15"],
      forme: "actif",
      nom: "Chat glacé",
      categorie: "jeu",
      duree: 5,
      objectif: "Accélérer, changer de direction, freiner — sans y penser, parce qu'on joue.",
      description:
        "Un ou deux chats avec une chasuble. Les autres s'échappent dans la zone. Touché = on se fige, jambes écartées, crosse en l'air. On est délivré quand un joueur libre passe entre nos patins… en glissant sur les genoux, ou plus simplement en tapant dans la main.\n\nManche de deux minutes, on change les chats. Le dernier libre est le chat suivant.",
      points_cles: ["Pour s'échapper : changer de direction, pas seulement de vitesse", "Freiner pour éviter, c'est permis et c'est le but", "Le chat : couper la trajectoire, ne pas courir derrière"],
      materiel: "2 chasubles",
      variantes: "Avec palet pour tout le monde. Chats en marche arrière.",
      schema: {
        vue: "entiere",
        objets: [
          J(300, 150, "O", "", "rouge"),
          J(120, 80), J(200, 220), J(260, 70), J(380, 250), J(450, 100), J(510, 190), J(150, 250), J(400, 60),
          L("patin", [[312, 142], [430, 108]], "rouge"), L("patin", [[440, 112], [500, 60], [540, 150]]),
          T(170, 40, "Chat glacé : touché = on gèle, délivré par une tape dans la main"),
        ],
      },
    }),

    ex({
      id: "cat_deux_contre_deux_couloir",
      nom: "Deux contre deux dans le couloir",
      categorie: "jeu",
      duree: 8,
      objectif: "Jouer serré le long de la bande : se démarquer, passer court, protéger le palet.",
      description:
        "Un couloir de dix mètres de large entre la bande et une ligne de cônes, sur toute la longueur, avec une petite cage à chaque bout. Deux contre deux, une minute par manche, les suivants attendent à l'extérieur.\n\nDeux couloirs (haut et bas) tournent en même temps : huit joueurs en jeu, les autres en attente courte. Palet sorti du couloir : remise à l'équipe adverse.",
      points_cles: ["Passer court et vite : le couloir ne laisse pas la place de dribbler", "Sans le palet : se démarquer le long de la bande, pas au milieu", "Protéger le palet avec le corps, dos au défenseur"],
      materiel: "10 plots\n4 petites cages",
      variantes: "Trois contre trois. Le but ne compte que sur passe.",
      schema: {
        vue: "entiere",
        objets: [
          K(100, 100), K(200, 100), K(300, 100), K(400, 100), K(500, 100),
          CG(60, 50, "droite"), CG(540, 50, "gauche"),
          J(150, 45, "X", "", "rouge"), J(250, 70, "X", "", "rouge"), J(350, 45, "O", "", "bleu"), J(450, 70, "O", "", "bleu"), P(300, 55),
          K(100, 200), K(200, 200), K(300, 200), K(400, 200), K(500, 200),
          CG(60, 250, "droite"), CG(540, 250, "gauche"),
          J(150, 255, "X", "", "rouge"), J(250, 230, "X", "", "rouge"), J(350, 255, "O", "", "bleu"), J(450, 230, "O", "", "bleu"), P(300, 245),
          T(170, 150, "Deux couloirs entre bande et cônes : 2 contre 2, cages en bout"),
        ],
      },
    }),

    ex({
      id: "cat_mini_match_travers",
      nom: "Match en travers, quatre contre quatre",
      categorie: "jeu",
      duree: 12,
      objectif: "Jouer sur une petite surface : plus de touches de palet, plus de décisions, moins de patinage à vide.",
      description:
        "La zone en travers : deux cages dos aux bandes, face à face sur la largeur. Quatre contre quatre, sans gardien (ou avec, si vous en avez deux), manches de deux minutes, on change les équipes à chaque sifflet.\n\nPas de hors-jeu, pas de dégagement interdit, pas de mise en échec. Le palet qui sort revient par le coach, vite. C'est le moment où tout ce qu'on a travaillé se mélange — on n'arrête pas pour corriger, on note pour la prochaine séance.",
      points_cles: ["Tête haute : sur une petite surface, tout va vite", "Passer dès qu'on est pris", "Revenir défendre en même temps qu'on a perdu le palet"],
      materiel: "2 cages mobiles (ou 4 plots)\nChasubles\n20 palets",
      variantes: "Trois contre trois. Deux touches maximum. Buts comptés double sur passe.",
      schema: {
        vue: "moitie",
        objets: [
          CG(150, 28, "bas"), CG(150, 272, "haut"),
          J(100, 90, "X", "", "rouge"), J(200, 100, "X", "", "rouge"), J(90, 200, "X", "", "rouge"), J(210, 210, "X", "", "rouge"),
          J(130, 130, "O", "", "bleu"), J(180, 170, "O", "", "bleu"), J(60, 150, "O", "", "bleu"), J(240, 150, "O", "", "bleu"),
          P(155, 150), J(290, 150, "C"),
          T(90, 60, "Match en travers de la zone,\n4 contre 4, deux minutes puis on change", "noir", "petit"),
        ],
      },
    }),

    /* ── Troisième fournée : plus de jeux, plus de situations, quelques
       gestes intermédiaires pour les groupes qui avancent. ── */

    ex({
      id: "cat_suivez_le_guide",
      techniques: [],
      forme: "duo",
      nom: "Suivez le guide",
      categorie: "echauffement",
      duree: 5,
      objectif: "S'échauffer en copiant : le guide invente, le suiveur reproduit, personne ne s'ennuie.",
      description:
        "Par deux, l'un derrière l'autre à trois mètres. Le guide patine librement dans la zone et fait ce qu'il veut : virages, arrêts, un genou au sol, marche arrière, tour sur soi-même. Le suiveur reproduit tout, sur la même trajectoire. Au sifflet, on inverse les rôles.\n\nDeux minutes par rôle. Le coach encourage les guides à oser : c'est le suiveur qui apprend le plus.",
      points_cles: ["Le guide choisit des choses que son suiveur peut faire — presque", "Regarder le dos du guide, pas ses patins", "Changer de partenaire à chaque manche"],
      materiel: "Aucun.",
      variantes: "Avec palet pour les deux. Par trois, en file.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 90, "X", "G"), J(60, 110, "O", "", "bleu"),
          L("patin", [[90, 85], [150, 60], [220, 100], [200, 170], [120, 200], [90, 250]]),
          L("patin", [[68, 118], [130, 90], [200, 120], [180, 180], [110, 215], [80, 260]], "bleu"),
          J(230, 230, "X", "G"), J(255, 245, "O", "", "bleu"),
          T(190, 40, "Le guide invente, le suiveur copie,\non inverse au sifflet", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passes_cercle_coach",
      nom: "La ronde des passes",
      categorie: "echauffement",
      duree: 6,
      objectif: "Se réveiller les mains et les jambes en même temps : patiner en rond, recevoir, redonner.",
      description:
        "Tout le groupe patine autour du cercle central, dans le même sens, à distance les uns des autres. Le coach au milieu avec les palets : il passe à chacun à son passage, le joueur reçoit sans s'arrêter et lui redonne aussitôt.\n\nUn tour dans chaque sens, puis on refait en marche arrière pour ceux qui savent — la passe arrive alors de face.",
      points_cles: ["Recevoir en mouvement, palette au sol avant l'arrivée du palet", "Redonner en balayant, pas en tapant", "Garder la distance avec celui de devant"],
      materiel: "10 palets",
      variantes: "Deux coachs dos à dos. Passes en revers.",
      schema: {
        vue: "entiere",
        objets: [
          J(300, 150, "C"), P(310, 142), P(292, 158),
          L("patin", [...tour(300, 150, 62, Math.PI / 2, -1)]),
          J(300, 212), J(240, 130), J(340, 95), J(360, 170),
          L("passe", [[310, 150], [352, 165]], "rouge"), L("passe", [[352, 175], [312, 156]], "rouge"),
          T(200, 50, "Le coach passe à chacun au passage, on lui redonne sans s'arrêter", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_arrets_departs_sifflet",
      techniques: ["TS.P 11", "TS.P 15"],
      forme: "actif",
      nom: "Arrêts-départs au sifflet",
      categorie: "patinage",
      duree: 6,
      objectif: "Le démarrage explosif et l'arrêt net, enchaînés, des deux côtés.",
      description:
        "Tout le monde sur la largeur, face au coach. Sifflet : on démarre à fond. Sifflet : on s'arrête net. Sifflet : on repart. Les arrêts alternent côté gauche et côté droit — le coach l'annonce d'abord, puis ne l'annonce plus.\n\nDeux minutes de travail, une minute de récupération en patinage lent, trois fois.",
      points_cles: ["Départ : premiers pas courts et rapides, sur les pointes, buste penché", "Arrêt : hanches qui tournent, genoux qui plient, les deux patins rabotent", "Le côté faible autant que le fort"],
      materiel: "1 sifflet",
      variantes: "Arrêt puis départ dans l'autre sens. Avec palet.",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 70), J(60, 110), J(60, 150), J(60, 190), J(60, 230),
          L("acceleration", [[72, 70], [160, 70]]), L("freinage", [[175, 70], [260, 70]]), L("acceleration", [[275, 70], [360, 70]]),
          L("acceleration", [[72, 230], [160, 230]]), L("freinage", [[175, 230], [260, 230]]), L("acceleration", [[275, 230], [360, 230]]),
          T(150, 40, "Sifflet : départ — Sifflet : arrêt — gauche, droite, gauche…"),
          J(450, 150, "C"),
        ],
      },
    }),

    ex({
      id: "cat_slalom_marche_arriere",
      techniques: ["TS.P 3", "TS.P 8"],
      forme: "parcours",
      nom: "Slalom en marche arrière",
      categorie: "patinage",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Reculer en changeant de direction : les poussées en C d'un seul côté, puis de l'autre.",
      description:
        "Cinq cônes en ligne, espacés de quatre mètres. On part dos aux cônes et on slalome en marche arrière : autour du premier par poussées en C du pied droit, autour du deuxième par le pied gauche, et ainsi de suite. Retour en avant par le côté.\n\nOn regarde par-dessus l'épaule du côté où on va. Lentement d'abord : le but est de ne pas toucher les cônes.",
      points_cles: ["Hanches basses, dos droit, la tête tourne vers le côté du virage", "Le patin extérieur au virage pousse en C, l'intérieur guide", "Ne pas s'arrêter entre deux cônes — la glisse continue"],
      materiel: "5 plots par file",
      variantes: "Avec palet (le vrai défi). Slalom avant à l'aller, arrière au retour.",
      schema: {
        vue: "entiere",
        objets: [
          K(120, 150), K(200, 150), K(280, 150), K(360, 150), K(440, 150),
          J(60, 150), J(45, 150),
          L("arriere", [[75, 150], [120, 125], [200, 175], [280, 125], [360, 175], [440, 125], [500, 150]]),
          L("patin", [[500, 190], [480, 230], [80, 230], [60, 190]]),
        ],
      },
    }),

    ex({
      id: "cat_parcours_agilite",
      techniques: ["TS.P 7", "TS.P 15", "TS.P 3"],
      forme: "parcours",
      nom: "Le parcours d'agilité",
      categorie: "patinage",
      duree: 10,
      objectif: "Tout enchaîner : slalom, virage serré, arrêt, marche arrière, sprint.",
      description:
        "Un circuit sur toute la glace, un départ toutes les dix secondes :\n1. Slalom entre trois cônes.\n2. Virage serré autour du cône de la ligne rouge.\n3. Arrêt complet sur la deuxième ligne bleue.\n4. Marche arrière jusqu'à la ligne rouge.\n5. Demi-tour et sprint jusqu'à la ligne de but.\n\nDeux passages au contrôle, puis on chronomètre. Chacun note son temps et essaie de le battre à la séance suivante.",
      points_cles: ["Propre avant rapide : un cône touché, on recommence", "Bas sur les patins dans chaque changement de direction", "Le sprint final : petits pas rapides puis grandes poussées"],
      materiel: "4 plots\n1 chronomètre",
      variantes: "Avec palet. En relais par équipes.",
      schema: {
        vue: "entiere",
        objets: [
          J(45, 150), J(30, 150),
          K(110, 120), K(160, 180), K(210, 120), K(300, 150),
          L("patin", [[60, 150], [110, 100], [160, 200], [210, 100], [290, 130], [320, 160], [295, 175], [270, 160], [365, 150]]),
          T(360, 120, "Arrêt", "rouge"),
          L("arriere", [[368, 165], [305, 165]]),
          L("patin", [[300, 190], [320, 205], [555, 205]]),
          T(380, 230, "sprint", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_protection_palet",
      techniques: ["TS.M 3.1"],
      forme: "duo",
      nom: "Protéger le palet, un contre un",
      categorie: "maniement",
      duree: 8,
      objectif: "Garder le palet quand quelqu'un le veut : le corps entre le défenseur et le palet.",
      description:
        "Par deux, le long de la bande, dans un carré de dix mètres. Le porteur garde le palet trente secondes ; le défenseur essaie de le prendre, sans charge, crosse sur crosse autorisée. Puis on inverse.\n\nLe porteur n'a pas le droit de sortir du carré. Il tourne, il se met dos au défenseur, il change de main sur la crosse si besoin. Le coach compte les secondes de possession.",
      points_cles: ["Dos au défenseur, le palet loin de lui, bras tendu", "Genoux fléchis, large sur les patins : on ne se fait pas bouger", "Tourner autour du palet plutôt que fuir avec"],
      materiel: "8 plots\n1 palet par duo",
      variantes: "Deux contre deux dans le même carré. Le porteur doit aussi faire un tour complet du carré.",
      schema: {
        vue: "moitie",
        objets: [
          K(60, 60), K(160, 60), K(60, 140), K(160, 140),
          J(110, 100), P(98, 112), J(130, 90, "O", "", "bleu"),
          L("patin", [[100, 118], [80, 100], [95, 80], [120, 88]]),
          K(60, 170), K(160, 170), K(60, 250), K(160, 250),
          J(110, 210), P(98, 222), J(130, 200, "O", "", "bleu"),
          T(190, 150, "Trente secondes : garder le palet\ndans le carré, dos au défenseur", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_feintes_cone",
      techniques: ["TS.M 2", "TS.M 4"],
      forme: "parcours",
      nom: "Feintes autour du cône",
      categorie: "maniement",
      duree: 6,
      objectif: "Le premier dribble : tirer-pousser, coup droit-revers, en passant un cône immobile.",
      description:
        "Trois cônes en ligne, espacés de six mètres. À chaque cône, une feinte différente :\n1. Coup droit-revers : le palet passe d'un côté du cône, le joueur de l'autre.\n2. Tirer-pousser : on tire le palet vers soi puis on le pousse loin devant.\n3. La feinte de corps : les épaules d'un côté, le palet de l'autre.\n\nLentement, à l'arrêt presque, puis en patinant. Le cône ne bouge pas : c'est le moment d'oser.",
      points_cles: ["Les mains loin du corps pour avoir de l'amplitude", "Le palet passe loin du cône, le corps près", "Tête haute dès que le geste est acquis"],
      materiel: "3 plots par file\n1 palet par joueur",
      variantes: "Le coach remplace le cône et tend la crosse. Les feintes en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(50, 100), J(35, 100), P(60, 104),
          K(110, 100), K(170, 100), K(230, 100),
          L("conduite", [[66, 100], [95, 85], [120, 115], [155, 88], [185, 112], [215, 88], [245, 100], [280, 100]]),
          T(90, 60, "coup droit-revers", "noir", "petit"), T(150, 140, "tirer-pousser", "noir", "petit"), T(215, 60, "feinte de corps", "noir", "petit"),
          J(50, 220), J(35, 220), P(60, 224),
          K(110, 220), K(170, 220), K(230, 220),
          L("conduite", [[66, 220], [95, 205], [120, 235], [155, 208], [185, 232], [215, 208], [245, 220], [280, 220]]),
        ],
      },
    }),

    ex({
      id: "cat_carre_signal",
      techniques: ["TS.M 1"],
      forme: "actif",
      nom: "Le carré : conduite au signal",
      categorie: "maniement",
      duree: 6,
      objectif: "Conduire le palet en changeant de direction sur commande, sans regarder en bas.",
      description:
        "Un grand carré de cônes, tous dedans avec un palet, en patinage libre. Le coach donne des ordres : « à gauche ! », « demi-tour ! », « stop ! », « marche arrière ! », « changez de palet ! ». Tout le monde exécute sans se rentrer dedans.\n\nCelui qui perd son palet le récupère. Celui qui sort du carré fait trois pompes… ou pas, selon l'humeur du groupe.",
      points_cles: ["Regarder les autres, pas le palet — le carré est petit", "Le palet reste devant soi dans les changements de direction", "Sur « stop », le palet s'arrête avec le joueur"],
      materiel: "8 plots\n1 palet par joueur",
      variantes: "Le carré rétrécit toutes les minutes. Le coach montre des couleurs au lieu de parler.",
      schema: {
        vue: "moitie",
        objets: [
          K(60, 50), K(150, 50), K(240, 50), K(60, 150), K(240, 150), K(60, 250), K(150, 250), K(240, 250),
          J(100, 90), P(108, 100), J(190, 110), P(198, 120), J(120, 190), P(128, 200), J(200, 200), P(208, 210), J(150, 140), P(158, 150),
          J(280, 150, "C"),
          T(90, 275, "« à gauche ! », « demi-tour ! », « stop ! »", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passe_autour_cercle",
      nom: "Passes autour du cercle",
      categorie: "passe",
      duree: 8,
      objectif: "Recevoir et redonner en patinant, en changeant d'angle à chaque passe.",
      description:
        "Quatre joueurs immobiles sur le bord d'un cercle, un palet chacun. Un cinquième patine autour du cercle, par l'extérieur : chaque joueur du bord lui passe son palet, il le reçoit et le redonne aussitôt, sans s'arrêter, puis continue vers le suivant.\n\nUn tour dans chaque sens, puis on change le patineur. Coup droit dans un sens, revers dans l'autre, forcément.",
      points_cles: ["Le patineur montre sa palette au sol avant chaque passe", "Les passeurs anticipent : passer devant le patineur, dans sa course", "Redonner en une touche, sans reprise"],
      materiel: "1 palet par joueur",
      variantes: "Le patineur en marche arrière. Deux patineurs sur le même cercle, dans le même sens.",
      schema: {
        vue: "moitie",
        objets: [
          J(100, 35), P(112, 40), J(145, 80), P(140, 92), J(100, 125), P(112, 118), J(55, 80), P(62, 92),
          L("patin", [...tour(100, 80, 62, Math.PI / 2, -1)]),
          J(100, 142, "O", "", "bleu"),
          L("passe", [[150, 92], [158, 76]], "bleu"), L("passe", [[104, 128], [104, 140]], "bleu"),
          T(50, 190, "Quatre passeurs sur le cercle,\nun patineur qui reçoit et redonne", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passes_longues",
      techniques: [],
      forme: "duo",
      nom: "Passes longues, réception en glissant",
      categorie: "passe",
      duree: 6,
      objectif: "Envoyer loin et fort, recevoir en mouvement une passe qui arrive vite.",
      description:
        "Par deux, face à face de chaque côté de la ligne rouge, à vingt mètres. Une passe longue et forte, le partenaire la reçoit en glissant vers elle, l'amortit, et renvoie. Toutes les trente secondes, on recule d'un pas.\n\nLa passe longue se fait avec tout le corps : poids qui bascule, crosse qui suit le palet jusqu'à la cible.",
      points_cles: ["Le palet part du talon de la palette, la crosse suit vers la cible", "Recevoir en glissant vers le palet, la palette légèrement inclinée", "Fort mais au sol : un palet qui saute ne se reçoit pas"],
      materiel: "1 palet par duo",
      variantes: "Passes levées par-dessus une crosse au sol. Passe longue en revers.",
      schema: {
        vue: "entiere",
        objets: [
          J(150, 80), J(450, 80, "O", "", "bleu"), L("passe", [[162, 76], [438, 76]], "rouge"), L("passe", [[438, 84], [162, 84]], "bleu"),
          J(150, 150), J(450, 150, "O", "", "bleu"), L("passe", [[162, 146], [438, 146]], "rouge"), L("passe", [[438, 154], [162, 154]], "bleu"),
          J(150, 220), J(450, 220, "O", "", "bleu"), L("passe", [[162, 216], [438, 216]], "rouge"), L("passe", [[438, 224], [162, 224]], "bleu"),
          T(200, 40, "Vingt mètres, une passe forte au sol, on recule d'un pas toutes les trente secondes", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_deux_contre_un",
      nom: "Deux contre un depuis la ligne bleue",
      categorie: "passe",
      niveau: "intermediaire",
      duree: 10,
      objectif: "Attaquer à deux face à un défenseur : passer ou tirer, et décider vite.",
      description:
        "Deux attaquants partent de la ligne bleue, un défenseur les attend au haut des cercles, le gardien en cage. Les attaquants montent, se font une passe ou deux, et concluent : tir, ou passe pour le tir du partenaire. Le défenseur essaie de couper la passe, sans charge.\n\nOn tourne : le défenseur devient attaquant, un attaquant devient défenseur.",
      points_cles: ["Le porteur attaque le défenseur, il ne l'attend pas", "Le partenaire reste à hauteur, palette au sol, sur l'autre côté", "Si le défenseur vient sur moi, je passe ; s'il reste, je tire"],
      materiel: "20 palets",
      variantes: "Trois contre deux. Le défenseur part deux mètres en retard.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"), J(140, 150, "O", "", "bleu"),
          J(300, 90), P(288, 96), J(300, 210),
          L("conduite", [[286, 96], [200, 100], [130, 110]]), L("patin", [[290, 210], [200, 205], [120, 190]]),
          L("passe", [[125, 112], [115, 182]], "rouge"), L("tir", [[110, 186], [46, 154]], "rouge"),
          T(190, 260, "Le porteur attaque le défenseur :\nil passe s'il vient, il tire s'il reste", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_tour_de_cage",
      techniques: [],
      forme: "vagues",
      nom: "Tour de cage et tir",
      categorie: "tir",
      duree: 8,
      objectif: "Passer derrière la cage avec le palet et tirer de l'autre côté avant que le gardien ne soit replacé.",
      description:
        "Une file dans chaque coin, un tas de palets. Le premier part avec un palet, passe derrière la cage en la serrant au plus près, ressort de l'autre côté et tire aussitôt, en revers ou en coup droit selon le côté. Il récupère son palet et va dans l'autre file.\n\nLes deux files alternent. Le gardien travaille ses déplacements poteau à poteau en même temps : c'est un exercice pour lui aussi.",
      points_cles: ["Le palet du côté de la cage, protégé par le corps", "Ressortir vite et tirer avant de s'arrêter", "Viser le côté que le gardien vient de quitter"],
      materiel: "20 palets",
      variantes: "Passe depuis derrière la cage à un tireur dans l'enclave (le jeu « derrière la cage »).",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(60, 40), J(80, 32), P(70, 46),
          L("conduite", [[65, 52], [40, 90], [18, 150], [40, 195], [75, 185]]), L("tir", [[80, 182], [50, 158]], "rouge"),
          J(60, 260), J(80, 268), P(70, 254),
          T(120, 100, "Passer derrière la cage,\nressortir et tirer aussitôt", "noir", "petit"),
          J(240, 150, "C"),
        ],
      },
    }),

    ex({
      id: "cat_tir_et_rebond",
      techniques: [],
      forme: "vagues",
      nom: "Tir et rebond",
      categorie: "tir",
      duree: 8,
      objectif: "Le deuxième joueur va au rebond — c'est là que se marquent les buts des débutants.",
      description:
        "Une file au haut du cercle, une file dans l'enclave. Le premier de la file du cercle tire ; au moment du tir, le premier de l'enclave attaque la cage et pousse tout ce qui traîne : rebond du gardien, palet dévié, palet arrêté devant la ligne.\n\nLe tireur va ensuite dans la file de l'enclave, le rebondeur dans celle du cercle. Le gardien laisse volontairement des rebonds les premières minutes.",
      points_cles: ["Le rebondeur part au moment du tir, pas avant", "Crosse au sol devant la cage, prêt à pousser", "Ne pas gêner le gardien : on va au rebond, pas dans le gardien"],
      materiel: "20 palets",
      variantes: "Le tireur choisit : tir ou passe au rebondeur. Deux rebondeurs.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(150, 90), P(160, 82), P(166, 88), J(185, 78), J(205, 68),
          L("tir", [[140, 96], [48, 145]], "rouge"),
          J(140, 200), J(165, 215), J(190, 230),
          L("patin", [[130, 192], [70, 160]]),
          T(150, 270, "Le tireur tire, le second va au rebond", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_frappe",
      nom: "Le tir frappé : initiation",
      categorie: "tir",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Un premier tir frappé sans se faire mal : l'élan court, la crosse qui touche la glace juste avant le palet.",
      description:
        "Depuis la ligne bleue, palets en tas, sans gardien (ou gardien en position, casque baissé). Élan de la crosse à hauteur de taille, pas plus ; la palette touche la glace deux ou trois centimètres avant le palet et le pousse ; poids qui passe sur la jambe avant.\n\nCinq tirs chacun, on regarde où va le palet, on corrige. Pas de concours de puissance le premier jour.",
      points_cles: ["Élan court : la crosse ne dépasse pas la taille", "La main du bas glisse vers le bas de la crosse pendant l'élan", "La palette frappe la glace avant le palet, pas le palet directement"],
      materiel: "20 palets",
      variantes: "Tir frappé après une passe. Tir frappé en mouvement, deux pas d'élan.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(215, 100), P(224, 92), P(230, 98), P(226, 106), J(250, 90), J(270, 82),
          J(215, 200), P(224, 208), P(230, 202), P(226, 194), J(250, 210), J(270, 218),
          L("tir", [[205, 106], [48, 146]], "rouge"), L("tir", [[205, 194], [48, 154]], "rouge"),
          T(60, 275, "Élan à hauteur de taille, la palette touche la glace avant le palet", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_quatre_coins",
      nom: "Le gardien : les quatre coins",
      categorie: "gardien",
      duree: 8,
      objectif: "Un tir par coin, annoncé puis non annoncé : lire le tir et choisir le bon geste.",
      description:
        "Un tireur au haut de l'enclave, palets en tas, le gardien en cage. Série de huit tirs annoncés : « en bas à gauche », « en haut à droite »… Le gardien fait le geste adapté (jambière, mitaine, bouclier, papillon).\n\nPuis huit tirs non annoncés, à vitesse modérée. Puis on change de tireur. Le coach à côté du gardien corrige la position entre chaque tir : bâton au sol, mitaine ouverte, genoux fléchis.",
      points_cles: ["Se replacer au centre après chaque tir", "Les mains devant, la mitaine ouverte vers le tireur", "Le bâton reste au sol, il ferme le trou entre les jambières"],
      materiel: "20 palets",
      variantes: "Tireur qui se déplace avant de tirer. Deux tireurs qui se passent le palet.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(120, 150), P(130, 142), P(136, 148), P(131, 156),
          L("tir", [[110, 145], [50, 138]], "rouge"), L("tir", [[110, 155], [50, 162]], "rouge"),
          T(40, 118, "haut G", "rouge", "petit"), T(40, 190, "bas G", "rouge", "petit"), T(62, 118, "haut D", "rouge", "petit"), T(62, 190, "bas D", "rouge", "petit"),
          J(90, 110, "C"),
          T(150, 240, "Huit tirs annoncés,\npuis huit non annoncés", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_un_contre_un_cercle",
      nom: "Un contre un dans le cercle",
      categorie: "jeu",
      duree: 6,
      objectif: "Garder le palet, prendre le palet : le duel le plus simple, dans un espace fermé.",
      description:
        "Un cercle de mise au jeu, deux joueurs, un palet. Trente secondes : le porteur garde le palet dans le cercle, l'autre essaie de le sortir ou de le prendre. Palet sorti du cercle : un point pour le défenseur ; palet gardé trente secondes : un point pour le porteur. On inverse.\n\nCinq cercles, dix joueurs en jeu, les autres tournent toutes les trente secondes.",
      points_cles: ["Le porteur : dos au défenseur, tourner autour du palet", "Le défenseur : crosse au sol, on pousse la crosse de l'autre, jamais le corps", "Pas de charge, jamais"],
      materiel: "1 palet par cercle",
      variantes: "Deux contre deux. Le porteur doit marquer dans une mini-cage placée sur le bord du cercle.",
      schema: {
        vue: "entiere",
        objets: [
          J(95, 75), P(85, 88), J(115, 95, "O", "", "bleu"),
          J(95, 215), P(85, 228), J(115, 235, "O", "", "bleu"),
          J(295, 145), P(285, 158), J(315, 165, "O", "", "bleu"),
          J(495, 75), P(485, 88), J(515, 95, "O", "", "bleu"),
          J(495, 215), P(485, 228), J(515, 235, "O", "", "bleu"),
          T(200, 40, "Trente secondes : garder le palet dans le cercle, ou le sortir"),
        ],
      },
    }),

    ex({
      id: "cat_palet_au_capitaine",
      nom: "Le palet au capitaine",
      categorie: "jeu",
      duree: 8,
      objectif: "Un jeu de passes : marquer, c'est faire arriver le palet à son capitaine.",
      description:
        "Deux équipes sur la largeur d'une zone. Chaque équipe a un capitaine, seul dans un couloir tout au bout (entre la bande et une ligne de cônes), qu'on ne peut pas attaquer. On marque en passant le palet à son capitaine, qui doit le contrôler proprement. Pas de tir, pas de cage : que des passes.\n\nAprès chaque point, le capitaine change. Quatre minutes par manche.",
      points_cles: ["Sans le palet : bouger pour offrir une ligne de passe", "Le capitaine bouge dans son couloir pour être visible", "Palet perdu : on revient défendre tout de suite"],
      materiel: "10 plots\nChasubles",
      variantes: "Passe obligatoire en revers pour marquer. Trois passes minimum avant le capitaine.",
      schema: {
        vue: "moitie",
        objets: [
          K(80, 30), K(80, 90), K(80, 150), K(80, 210), K(80, 270),
          J(60, 150, "X", "Cap", "rouge"),
          K(230, 30), K(230, 90), K(230, 150), K(230, 210), K(230, 270),
          J(255, 150, "O", "Cap", "bleu"),
          J(120, 80, "X", "", "rouge"), J(150, 200, "X", "", "rouge"), J(190, 120, "X", "", "rouge"),
          J(140, 130, "O", "", "bleu"), J(175, 220, "O", "", "bleu"), J(110, 230, "O", "", "bleu"),
          P(196, 128),
          L("passe", [[200, 130], [246, 148]], "rouge"),
        ],
      },
    }),

    ex({
      id: "cat_match_regles_allegees",
      nom: "Match complet, règles allégées",
      categorie: "jeu",
      duree: 15,
      objectif: "Jouer un vrai match sur toute la glace, sans les règles qui coupent le jeu des débutants.",
      description:
        "Toute la glace, deux cages, deux gardiens si possible. Cinq contre cinq (ou quatre contre quatre si le groupe est petit). Règles : pas de hors-jeu, pas de dégagement interdit, pas de mise en échec, changements à la volée toutes les quatre-vingt-dix secondes au sifflet du coach.\n\nLe coach arbitre et commente en jouant : « bonne passe ! », « regarde ton partenaire ! ». On ne siffle une faute que si elle est dangereuse.",
      points_cles: ["Changer de ligne au sifflet, sans discuter", "Chacun à son poste : deux défenseurs qui restent derrière", "Le jeu avant la règle : on laisse jouer"],
      materiel: "Chasubles",
      variantes: "Ajouter le hors-jeu à la deuxième moitié. Buts comptés double sur passe.",
      schema: {
        vue: "entiere",
        objets: [
          J(46, 150, "G"), J(554, 150, "G"),
          J(120, 100, "X", "", "rouge"), J(120, 200, "X", "", "rouge"), J(240, 80, "X", "", "rouge"), J(240, 220, "X", "", "rouge"), J(280, 150, "X", "", "rouge"),
          J(480, 100, "O", "", "bleu"), J(480, 200, "O", "", "bleu"), J(360, 80, "O", "", "bleu"), J(360, 220, "O", "", "bleu"), J(320, 150, "O", "", "bleu"),
          P(300, 150), J(300, 285, "C"),
          T(180, 40, "Pas de hors-jeu, pas de dégagement interdit, changements au sifflet"),
        ],
      },
    }),

    ex({
      id: "cat_retour_ronde_calme",
      nom: "Ronde de passes au calme et mot de la fin",
      categorie: "retour",
      duree: 5,
      objectif: "Redescendre en douceur, les mains occupées, et se dire ce qu'on retient.",
      description:
        "Tout le monde en cercle au centre, un ou deux palets qui tournent en passes lentes, sans consigne technique. Pendant que le palet tourne, chacun dit à son tour une chose qu'il a réussie aujourd'hui et une chose qu'il veut travailler.\n\nLe coach termine par le programme de la prochaine séance. On sort ensemble, on range les cônes ensemble.",
      points_cles: ["Passes lentes, on écoute celui qui parle", "Chacun une réussite, une envie", "On range ensemble"],
      materiel: "2 palets",
      variantes: "",
      schema: {
        vue: "entiere",
        objets: [
          ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => J(Math.round(300 + 70 * Math.cos((i * Math.PI) / 4)), Math.round(150 + 70 * Math.sin((i * Math.PI) / 4)))),
          P(300, 150),
          L("passe", [[372, 150], [312, 152]], "vert"), L("passe", [[300, 162], [260, 196]], "vert"),
          J(300, 60, "C"),
          T(210, 270, "Une réussite, une envie, chacun son tour", "noir", "petit"),
        ],
      },
    }),

    /* ── Quatrième fournée : équilibre, carres, soulever le palet,
       mises au jeu, précision, et de quoi occuper un gardien. ── */

    ex({
      id: "cat_miroir",
      techniques: [],
      forme: "duo",
      nom: "Le miroir",
      categorie: "echauffement",
      duree: 5,
      objectif: "Bouger de côté, s'arrêter, repartir — en copiant quelqu'un qui vous regarde.",
      description:
        "Par deux, face à face, de part et d'autre d'une ligne, à trois mètres. L'un mène : déplacements latéraux, avant-arrière, un genou au sol, tour sur soi-même. L'autre le reflète comme un miroir, en restant face à lui. Trente secondes, puis on inverse.\n\nQuatre manches. Le coach demande d'accélérer à la dernière : les jambes doivent brûler un peu avant la suite.",
      points_cles: ["Rester face à face : on se déplace de côté, pas en tournant", "Genoux fléchis en permanence", "Le meneur varie : lent, rapide, haut, bas"],
      materiel: "Aucun.",
      variantes: "Avec palet pour les deux. Le miroir en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(110, 70, "X", "M"), J(150, 70, "O", "", "bleu"), L("patin", [[110, 82], [110, 110]]), L("patin", [[150, 82], [150, 110]], "bleu"),
          J(110, 150, "X", "M"), J(150, 150, "O", "", "bleu"), L("patin", [[110, 138], [110, 112]]), L("patin", [[150, 138], [150, 112]], "bleu"),
          J(110, 230, "X", "M"), J(150, 230, "O", "", "bleu"),
          T(180, 150, "Face à face de chaque côté\nde la ligne : le meneur bouge,\nl'autre reflète", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_echauffement_gardien",
      nom: "Échauffement du gardien",
      categorie: "gardien",
      duree: 6,
      objectif: "Mettre le gardien en route avant les tirs : ses jambes, puis ses mains, puis les deux.",
      description:
        "Pendant que le groupe patine, le gardien dans sa zone avec un coach ou un joueur calme :\n1. Une minute de déplacements seuls : poussées en T poteau à poteau, papillon et relevé, glissade.\n2. Vingt tirs doux au sol, alternés gauche et droite, depuis l'enclave.\n3. Vingt tirs à mi-hauteur, mitaine et bouclier.\n4. Dix tirs surprise, le tireur choisit.\n\nOn monte en puissance, jamais l'inverse. Le gardien annonce quand il est prêt pour la suite.",
      points_cles: ["Jambes d'abord, mains ensuite", "Doux, puis moyen, puis normal — jamais fort au début", "Le gardien dit quand il est prêt"],
      materiel: "20 palets",
      variantes: "Le tireur se déplace en tirant. Deux tireurs qui alternent.",
      schema: {
        vue: "moitie",
        objets: [
          J(50, 150, "G"), L("patin", [[50, 138], [50, 128]], "bleu"), L("patin", [[50, 162], [50, 172]], "bleu"),
          J(115, 150, "C"), P(126, 142), P(132, 148), P(127, 156),
          L("tir", [[105, 145], [56, 142]], "rouge"), L("tir", [[105, 155], [56, 158]], "rouge"),
          T(150, 230, "Déplacements seuls, puis tirs doux au sol,\npuis à mi-hauteur, puis surprise", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_croises_lateraux",
      techniques: ["TS.P 9", "TS.P 12"],
      forme: "vagues",
      nom: "Croisés latéraux sur la ligne",
      categorie: "patinage",
      niveau: "intermediaire",
      duree: 6,
      objectif: "Se déplacer de côté sans se retourner : les croisés latéraux, comme un défenseur devant sa cage.",
      description:
        "Sur la ligne bleue, face au coach. On se déplace vers la droite en croisant le pied gauche devant le droit, puis le droit revient sur le côté, et on recommence. Arrivé à la bande, retour vers la gauche avec l'autre pied.\n\nPremière longueur au pas. Deuxième en glissant sur le pied qui ne croise pas. Troisième au sifflet : changement de sens à chaque coup.",
      points_cles: ["Les épaules restent face au coach : on va de côté, pas en avant", "Le pied qui croise passe DEVANT l'autre", "Bas sur les jambes, on ne saute pas"],
      materiel: "1 sifflet",
      variantes: "Avec crosse au sol, à deux mains. Croisés latéraux puis pivot en marche arrière.",
      schema: {
        vue: "entiere",
        objets: [
          J(150, 90), J(150, 130), J(150, 170), J(150, 210),
          L("patin", [[165, 90], [290, 90]]), L("patin", [[165, 130], [290, 130]]), L("patin", [[165, 170], [290, 170]]), L("patin", [[165, 210], [290, 210]]),
          L("patin", [[290, 250], [165, 250]]),
          J(440, 150, "C"),
          T(150, 45, "De côté, face au coach : le pied extérieur croise devant", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_sauts_equilibre",
      techniques: ["TF.A 1", "TF.A 2"],
      forme: "vagues",
      nom: "Petits sauts et réceptions",
      categorie: "patinage",
      duree: 5,
      objectif: "Décoller et se recevoir sans tomber : la confiance dans ses appuis.",
      description:
        "En glissant lentement sur la longueur, on saute par-dessus chaque ligne : les deux pieds ensemble d'abord, réception genoux fléchis. Deuxième passage : réception sur un seul pied, l'autre au retour. Troisième : un petit saut avec un quart de tour.\n\nOn ne cherche pas la hauteur. On cherche à retomber exactement comme on est parti, sans bruit.",
      points_cles: ["Décoller des deux pieds, atterrir genoux fléchis, en silence", "Bras devant, pas au-dessus de la tête", "Regard devant, pas sur la ligne"],
      materiel: "Aucun.",
      variantes: "Sauter par-dessus une crosse posée au sol. Saut puis arrêt immédiat.",
      schema: {
        vue: "entiere",
        objets: [
          J(50, 110), J(50, 190),
          L("patin", [[62, 110], [215, 110]]), T(222, 92, "saut", "bleu", "petit"), L("patin", [[240, 110], [288, 110]]), T(294, 92, "saut", "rouge", "petit"), L("patin", [[312, 110], [358, 110]]), T(365, 92, "saut", "bleu", "petit"), L("patin", [[382, 110], [550, 110]]),
          L("patin", [[62, 190], [215, 190]]), L("patin", [[240, 190], [288, 190]]), L("patin", [[312, 190], [358, 190]]), L("patin", [[382, 190], [550, 190]]),
          T(170, 250, "Deux pieds, puis un pied, puis quart de tour", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_arret_en_t",
      techniques: ["TS.P 16"],
      forme: "vagues",
      nom: "L'arrêt en T",
      categorie: "patinage",
      duree: 5,
      objectif: "Un freinage de plus dans la boîte : le pied arrière en travers, qui frotte.",
      description:
        "Glisse sur deux pieds, puis on place un patin derrière l'autre, perpendiculaire, et on le laisse frotter la glace en appuyant progressivement : le T freine. Le poids reste surtout sur le pied avant.\n\nCinq arrêts avec chaque pied derrière, de la ligne de but à la bleue. Utile pour ceux qui n'osent pas encore l'arrêt hockey, et pour tout le monde en marche arrière plus tard.",
      points_cles: ["Le pied arrière perpendiculaire, sur la carre intérieure", "Appuyer progressivement, pas d'un coup", "Buste droit, regard devant"],
      materiel: "Aucun.",
      variantes: "Arrêt en T puis départ dans l'autre sens sans se retourner.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), J(60, 150), J(60, 220),
          L("patin", [[72, 80], [180, 80]]), L("patin", [[72, 150], [180, 150]]), L("patin", [[72, 220], [180, 220]]),
          T(195, 80, "T", "rouge", "grand"), T(195, 150, "T", "rouge", "grand"), T(195, 220, "T", "rouge", "grand"),
          T(60, 270, "Glisse, puis le pied arrière en travers qui frotte", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_cercle_marche_arriere",
      techniques: ["TS.P 8", "TS.P 10"],
      forme: "groupes3",
      nom: "Marche arrière sur le cercle",
      categorie: "patinage",
      niveau: "intermediaire",
      duree: 6,
      objectif: "Reculer en tournant : les poussées en C d'un seul côté, la tête par-dessus l'épaule.",
      description:
        "Sur un cercle de mise au jeu, en marche arrière, en suivant la ligne. Le patin extérieur au cercle pousse en C, l'intérieur glisse sur sa carre externe. Trois tours dans un sens, trois dans l'autre.\n\nQuand ça tient, on ajoute un croisé arrière tous les deux pas pour ceux qui veulent. Les autres continuent en C : c'est déjà très bien.",
      points_cles: ["Regarder par-dessus l'épaule intérieure au cercle", "Hanches basses, poids un peu vers l'intérieur", "Le patin intérieur ne pousse pas, il guide"],
      materiel: "Aucun.",
      variantes: "Avec palet. Un tour avant, un tour arrière, sans s'arrêter (pivot).",
      schema: {
        vue: "moitie",
        objets: [
          L("arriere", [...tour(100, 220, 55, Math.PI / 2, -1)]),
          L("arriere", [...tour(100, 80, 55, -Math.PI / 2, 1)]),
          J(175, 260), J(175, 40),
          T(180, 150, "Poussées en C du pied extérieur,\nla tête par-dessus l'épaule", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_course_poursuite_cercle",
      nom: "Course-poursuite sur le cercle",
      categorie: "jeu",
      duree: 5,
      objectif: "Patiner vite en courbe, parce qu'on a quelqu'un aux trousses.",
      description:
        "Deux joueurs sur un cercle, diamétralement opposés. Au sifflet, chacun poursuit l'autre en suivant la ligne du cercle. Celui qui touche l'autre a gagné ; au bout de deux tours sans rattrapage, match nul et on change.\n\nUn sens, puis l'autre. Cinq cercles, dix joueurs en jeu, ça tourne vite.",
      points_cles: ["Pencher vers l'intérieur, croiser si on sait", "Ne pas couper le cercle : la ligne, c'est la règle", "Ceux qui attendent encouragent"],
      materiel: "1 sifflet",
      variantes: "Avec palet. En marche arrière (les plus avancés).",
      schema: {
        vue: "entiere",
        objets: [
          J(100, 35), J(100, 125, "O", "", "bleu"), L("patin", [...tour(100, 80, 45, -Math.PI / 2, 1).slice(0, 5)]), L("patin", [...tour(100, 80, 45, Math.PI / 2, 1).slice(0, 5)], "bleu"),
          J(100, 175), J(100, 265, "O", "", "bleu"),
          J(300, 105), J(300, 195, "O", "", "bleu"),
          J(500, 35), J(500, 125, "O", "", "bleu"),
          J(500, 175), J(500, 265, "O", "", "bleu"),
          T(200, 150, "Face à face sur le cercle : au sifflet, chacun poursuit l'autre", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_slalom_crosses",
      techniques: ["TS.M 4", "TS.M 2"],
      forme: "parcours",
      nom: "Slalom entre les crosses",
      categorie: "maniement",
      duree: 6,
      objectif: "Conduire le palet entre des obstacles bas, et commencer à le soulever pour passer par-dessus.",
      description:
        "Six crosses posées au sol en quinconce, à trois mètres les unes des autres. Le joueur slalome avec le palet entre les crosses ; puis, deuxième passage, il doit faire passer le palet PAR-DESSUS chaque crosse (petit soulevé) tout en la contournant lui-même.\n\nLe soulevé : la palette se glisse sous le palet et le lève d'une petite rotation des poignets. Pas plus haut que le manche.",
      points_cles: ["Le palet loin devant dans le slalom, pas dans les patins", "Pour soulever : palette sous le palet, poignets qui tournent, pas les bras", "On enjambe la crosse, on ne saute pas dessus"],
      materiel: "6 crosses de rechange (ou celles de la moitié du groupe)\n1 palet par joueur",
      variantes: "Les crosses plus rapprochées. En marche arrière, sans soulever.",
      schema: {
        vue: "moitie",
        objets: [
          J(45, 150), J(30, 150), P(56, 154),
          L("libre", [[90, 125], [90, 175]], "orange"), L("libre", [[130, 125], [130, 175]], "orange"), L("libre", [[170, 125], [170, 175]], "orange"), L("libre", [[210, 125], [210, 175]], "orange"), L("libre", [[250, 125], [250, 175]], "orange"),
          L("conduite", [[62, 150], [90, 130], [130, 170], [170, 130], [210, 170], [250, 130], [285, 150]]),
          T(60, 220, "Slalom entre les crosses,\npuis le palet par-dessus chaque crosse", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_soulever_palet",
      techniques: ["TS.M 4"],
      forme: "actif",
      nom: "Soulever le palet",
      categorie: "maniement",
      duree: 5,
      objectif: "Faire décoller le palet : la passe levée et le tir levé commencent ici.",
      description:
        "Chacun avec un palet, face à une crosse posée au sol à deux mètres. On soulève le palet par-dessus la crosse : la palette légèrement ouverte, le palet part de l'arrière de la palette vers la pointe, et les poignets tournent au dernier moment. On va le chercher, on recommence de l'autre côté.\n\nVingt fois. Puis la crosse s'éloigne à trois mètres, puis quatre.",
      points_cles: ["Palette ouverte, le palet roule du talon vers la pointe", "Le mouvement finit avec la palette vers le haut", "Petit et précis avant haut et fort"],
      materiel: "1 crosse par duo\n1 palet par joueur",
      variantes: "Par deux : passes levées par-dessus la crosse. Soulever en revers.",
      schema: {
        vue: "moitie",
        objets: [
          J(70, 70), P(82, 74), L("libre", [[110, 55], [110, 85]], "orange"), L("passe", [[86, 74], [140, 74]], "vert"),
          J(70, 150), P(82, 154), L("libre", [[110, 135], [110, 165]], "orange"), L("passe", [[86, 154], [140, 154]], "vert"),
          J(70, 230), P(82, 234), L("libre", [[110, 215], [110, 245]], "orange"), L("passe", [[86, 234], [140, 234]], "vert"),
          T(170, 150, "Par-dessus la crosse au sol :\npalette ouverte, poignets qui tournent", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_triangle_mouvement",
      nom: "Triangle en mouvement sur la longueur",
      categorie: "passe",
      duree: 8,
      objectif: "Passer à trois en montant la glace : garder la forme, garder le rythme.",
      description:
        "Par trois, de front, à sept mètres les uns des autres. On monte toute la glace en se faisant des passes : celui du milieu donne à gauche, qui redonne au milieu, qui donne à droite, qui redonne au milieu. Arrivés dans la zone, celui qui a le palet tire.\n\nRetour par la bande, le trio suivant part quand le précédent passe la rouge. On change les positions à chaque passage.",
      points_cles: ["Les trois avancent à la même vitesse : on ne s'attend pas, on ne se dépasse pas", "Passe devant le partenaire, dans sa course", "Celui du milieu regarde à gauche ET à droite"],
      materiel: "20 palets",
      variantes: "Passes en revers pour les ailiers. Le milieu en marche arrière (les plus avancés).",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 80), J(60, 150), P(72, 154), J(60, 220),
          L("patin", [[72, 80], [520, 80]]), L("patin", [[72, 150], [500, 150]]), L("patin", [[72, 220], [520, 220]]),
          L("passe", [[110, 145], [160, 86]], "vert"), L("passe", [[180, 86], [230, 145]], "vert"), L("passe", [[260, 155], [310, 214]], "vert"), L("passe", [[330, 214], [380, 155]], "vert"),
          L("tir", [[505, 150], [556, 150]], "rouge"), J(552, 150, "G"),
        ],
      },
    }),

    ex({
      id: "cat_donne_et_va",
      nom: "Donne et va",
      categorie: "passe",
      duree: 8,
      objectif: "Passer, courir, recevoir : le une-deux, le plus vieux truc du monde et il marche toujours.",
      description:
        "Une file à la ligne bleue avec les palets, un joueur relais immobile au haut du cercle (le coach au début). Le premier part avec le palet, passe au relais, accélère vers la cage, reçoit la passe en retour dans sa course et tire.\n\nIl récupère son palet, devient relais, et le relais rejoint la file. Changer de côté à mi-temps.",
      points_cles: ["Passer PUIS accélérer : la passe libère, la course fait le reste", "Le relais redonne en une touche, devant le joueur", "Recevoir en mouvement et tirer sans s'arrêter"],
      materiel: "20 palets",
      variantes: "Deux relais, deux une-deux. Le relais en mouvement lui aussi.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(255, 60), J(275, 52), P(245, 66),
          J(150, 100, "O", "", "bleu"),
          L("conduite", [[243, 70], [190, 85]]), L("passe", [[185, 88], [160, 98]], "rouge"),
          L("patin", [[180, 95], [120, 130]]), L("passe", [[145, 108], [118, 128]], "bleu"),
          L("tir", [[112, 134], [48, 148]], "rouge"),
          T(150, 220, "Passe au relais, accélère,\nreçois dans la course, tire", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_relais_passes",
      techniques: [],
      forme: "relais",
      nom: "Relais de passes en ligne",
      categorie: "passe",
      duree: 6,
      objectif: "Des passes précises sous pression amicale : la première équipe qui a fait remonter le palet gagne.",
      description:
        "Deux équipes, chacune alignée sur la longueur à cinq mètres d'intervalle. Le palet part du premier et remonte la ligne de passe en passe jusqu'au dernier, qui le ramène en conduisant, se place en tête, et le palet repart.\n\nQuand tout le monde a été dernier, l'équipe a fini. Palet manqué : on va le chercher, pas de raccourci.",
      points_cles: ["Palette au sol avant que la passe parte", "Passes au sol, à la palette", "Le dernier ramène le palet en conduite, tête haute"],
      materiel: "1 palet par équipe",
      variantes: "Passes en revers. Deux palets par équipe en même temps.",
      schema: {
        vue: "entiere",
        objets: [
          J(80, 100), J(160, 100), J(240, 100), J(320, 100), J(400, 100), J(480, 100),
          L("passe", [[92, 100], [148, 100]], "rouge"), L("passe", [[172, 100], [228, 100]], "rouge"), L("passe", [[252, 100], [308, 100]], "rouge"), L("passe", [[332, 100], [388, 100]], "rouge"), L("passe", [[412, 100], [468, 100]], "rouge"),
          L("conduite", [[485, 112], [400, 130], [80, 130], [65, 105]]),
          J(80, 200, "O", "", "bleu"), J(160, 200, "O", "", "bleu"), J(240, 200, "O", "", "bleu"), J(320, 200, "O", "", "bleu"), J(400, 200, "O", "", "bleu"), J(480, 200, "O", "", "bleu"),
          L("passe", [[92, 200], [148, 200]], "bleu"), L("passe", [[172, 200], [228, 200]], "bleu"), L("passe", [[252, 200], [308, 200]], "bleu"), L("passe", [[332, 200], [388, 200]], "bleu"), L("passe", [[412, 200], [468, 200]], "bleu"),
        ],
      },
    }),

    ex({
      id: "cat_tirs_en_mouvement_bleue",
      techniques: [],
      forme: "vagues",
      nom: "Tirs en mouvement depuis la bleue",
      categorie: "tir",
      duree: 8,
      objectif: "Tirer du poignet en pleine glisse, sans casser sa foulée.",
      description:
        "Deux files à la ligne bleue, dans les coins, palets en tas. Le premier part avec le palet, prend deux ou trois poussées, et tire du haut du cercle sans s'arrêter. Il récupère son palet et change de file.\n\nOn alterne les files. Consigne de la deuxième série : le tir part pendant que le pied côté palet est en l'air.",
      points_cles: ["Le palet reste devant soi pendant les poussées", "Le poids passe sur la jambe avant au moment du tir", "On tire, puis on continue de patiner vers la cage"],
      materiel: "20 palets",
      variantes: "Tir en revers. Tir après un virage serré autour d'un cône.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(260, 50), J(280, 44), P(250, 56), L("conduite", [[248, 60], [200, 75], [150, 92]]), L("tir", [[145, 95], [48, 144]], "rouge"),
          J(260, 250), J(280, 256), P(250, 244), L("conduite", [[248, 240], [200, 225], [150, 208]]), L("tir", [[145, 205], [48, 156]], "rouge"),
          T(150, 150, "Deux poussées, tir en pleine glisse", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_precision_cibles",
      techniques: [],
      forme: "vagues",
      nom: "Tirs de précision sur cibles",
      categorie: "tir",
      duree: 8,
      objectif: "Viser un endroit, pas la cage : les quatre coins, en comptant les points.",
      description:
        "Cage vide, quatre cibles dans les coins : cônes accrochés à la barre, bouteilles d'eau, ou simplement des palets posés sur la barre du haut. Chacun tire dix palets depuis l'enclave, à l'arrêt : un point par cible touchée, deux si elle tombe.\n\nOn annonce sa cible avant de tirer. Le total est noté, on refait la semaine suivante.",
      points_cles: ["Annoncer la cible, regarder la cible, tirer vers la cible", "En haut : la palette se ferme tard. En bas : elle se ferme tôt", "La précision d'abord, la force ensuite"],
      materiel: "4 cibles (plots, bouteilles ou palets sur la barre)\n20 palets",
      variantes: "Tirs en mouvement. Tirs en revers. Par équipes, le total le plus haut gagne.",
      schema: {
        vue: "moitie",
        objets: [
          K(40, 136), K(40, 164), P(42, 141), P(42, 159),
          J(120, 150), P(132, 142), P(138, 148), P(133, 156), J(150, 140), J(165, 130),
          L("tir", [[110, 146], [46, 138]], "rouge"), L("tir", [[110, 154], [46, 162]], "rouge"),
          T(140, 220, "Quatre cibles dans les coins, cage vide :\nannoncer, viser, compter", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_mise_au_jeu",
      nom: "La mise au jeu",
      categorie: "jeu",
      duree: 6,
      objectif: "Gagner le palet à l'engagement : la position, le timing, et où on l'envoie.",
      description:
        "Par deux sur un point de mise au jeu, le coach laisse tomber le palet. On travaille trois façons : tirer le palet vers l'arrière en revers, le pousser vers l'avant entre les jambes de l'adversaire, ou bloquer la crosse adverse et laisser un partenaire venir chercher le palet.\n\nDix engagements par duo, on tourne. Puis on ajoute un partenaire derrière chaque joueur qui doit récupérer le palet.",
      points_cles: ["Bas sur les jambes, la crosse au sol avant le palet", "Regarder la main du coach, pas le palet", "Décider avant : arrière, avant, ou bloquer"],
      materiel: "20 palets",
      variantes: "Mise au jeu puis tir immédiat pour celui qui gagne. Le perdant doit défendre.",
      schema: {
        vue: "moitie",
        objets: [
          J(92, 80, "X", "", "rouge"), J(108, 80, "O", "", "bleu"), J(150, 80, "C"), P(100, 86),
          L("passe", [[96, 90], [70, 110]], "rouge"), J(60, 118, "X", "", "rouge"),
          J(92, 220, "X", "", "rouge"), J(108, 220, "O", "", "bleu"), J(150, 220, "C"), P(100, 226),
          L("passe", [[104, 230], [130, 250]], "bleu"), J(140, 258, "O", "", "bleu"),
          T(180, 150, "Arrière en revers, avant entre les jambes,\nou bloquer la crosse", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_trois_contre_deux",
      nom: "Trois contre deux depuis la ligne rouge",
      categorie: "jeu",
      niveau: "intermediaire",
      duree: 10,
      objectif: "Attaquer en surnombre : trouver le joueur libre, vite, avant que les défenseurs ne se replacent.",
      description:
        "Trois attaquants partent de la ligne rouge, deux défenseurs les attendent à la ligne bleue, le gardien en cage. Les attaquants montent en triangle et cherchent le joueur libre ; les défenseurs reculent en marche arrière et essaient de couper les passes, sans charge.\n\nL'action finit sur un tir ou une récupération. Puis deux attaquants deviennent défenseurs.",
      points_cles: ["Le porteur monte au milieu, les deux autres écartent", "Passer avant la bleue, tirer dans l'enclave", "Défenseurs : reculer ensemble, crosse au sol, ne pas se jeter"],
      materiel: "20 palets",
      variantes: "Trois contre deux puis un troisième défenseur qui revient en retard. Deux contre un enchaîné après la récupération.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"), J(180, 110, "O", "", "bleu"), J(180, 190, "O", "", "bleu"),
          L("arriere", [[170, 110], [110, 120]], "bleu"), L("arriere", [[170, 190], [110, 180]], "bleu"),
          J(300, 80), J(300, 150), P(288, 156), J(300, 220),
          L("patin", [[290, 80], [130, 90]]), L("conduite", [[286, 156], [200, 150]]), L("patin", [[290, 220], [130, 210]]),
          L("passe", [[195, 148], [140, 96]], "rouge"), L("tir", [[130, 100], [48, 146]], "rouge"),
        ],
      },
    }),

    ex({
      id: "cat_roi_du_cercle",
      techniques: ["TS.M 1"],
      forme: "actif",
      nom: "Le roi du cercle",
      categorie: "jeu",
      duree: 5,
      objectif: "Garder son palet en enlevant celui des autres : tête haute, ou on perd.",
      description:
        "Tout le monde dans le cercle central, chacun avec un palet. Au sifflet, on garde le sien et on essaie de sortir ceux des autres du cercle, avec la crosse seulement. Palet sorti : on sort aussi, et on va patiner autour du cercle en attendant. Le dernier avec un palet est roi.\n\nTrois manches. Le roi de chaque manche commence la suivante avec un handicap : en marche arrière.",
      points_cles: ["Tête haute : le danger vient de partout", "Le palet près de soi, protégé par les patins", "Crosse sur le palet des autres, jamais sur leurs patins"],
      materiel: "1 palet par joueur",
      variantes: "Deux cercles pour un grand groupe. Sans crosse : palet aux pieds.",
      schema: {
        vue: "entiere",
        objets: [
          J(280, 130), P(288, 138), J(320, 125), P(328, 133), J(300, 170), P(308, 178), J(265, 160), P(273, 168), J(335, 165), P(343, 173), J(300, 118), P(308, 126),
          J(360, 100, "O", "", "bleu"), L("patin", [...tour(300, 150, 62, -Math.PI / 4, 1).slice(0, 5)], "bleu"),
          T(200, 60, "Chacun garde son palet, sort ceux des autres — le dernier est roi", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_etirements_dos_hanches",
      nom: "Étirements : dos, hanches, adducteurs",
      categorie: "retour",
      duree: 5,
      objectif: "Détendre ce que le patinage contracte : le bas du dos, les hanches, l'intérieur des cuisses.",
      description:
        "En cercle, le coach montre, tout le monde suit, quinze secondes par position :\n1. Fente basse, genou arrière au sol, bassin vers l'avant — chaque côté.\n2. Assis, jambes écartées, buste vers l'avant.\n3. Assis, une jambe pliée par-dessus l'autre, torsion du dos.\n4. À genoux, dos rond puis dos creux, lentement.\n5. Debout, un patin sur la bande, on penche vers l'avant.\n\nOn respire. Personne ne force. C'est aussi le moment de dire un mot sur la prochaine séance.",
      points_cles: ["Quinze secondes, en respirant", "On tient, on ne rebondit pas", "Chaque côté"],
      materiel: "Aucun.",
      variantes: "",
      schema: {
        vue: "entiere",
        objets: [
          ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => J(Math.round(300 + 65 * Math.cos((i * Math.PI) / 4)), Math.round(150 + 65 * Math.sin((i * Math.PI) / 4)))),
          J(300, 150, "C"),
          T(200, 50, "Fente, adducteurs, torsion, dos rond-dos creux, patin sur la bande", "noir", "petit"),
        ],
      },
    }),

    /* ── Cinquième fournée : des stations, des enchaînements, et de quoi
       varier les séances d'un groupe qu'on voit toutes les semaines. ── */

    ex({
      id: "cat_stations_quatre_ateliers",
      techniques: [],
      forme: "groupes3",
      nom: "Quatre ateliers en rotation",
      categorie: "patinage",
      niveau: "tous",
      duree: 16,
      objectif: "Quatre petits groupes, quatre coins, quatre minutes : tout le monde travaille tout le temps.",
      description:
        "La glace coupée en quatre. Dans chaque coin, un atelier tenu par un coach ou un joueur avancé :\n1. Freinages des deux côtés (coin 1).\n2. Slalom avec palet (coin 2).\n3. Passes en paires (coin 3).\n4. Tirs sur cage vide (coin 4).\n\nQuatre minutes par atelier, sifflet, rotation dans le sens des aiguilles d'une montre. Le format marche pour n'importe quels ateliers : c'est la rotation qui compte, pas le contenu.",
      points_cles: ["Les groupes sont faits avant d'entrer sur la glace", "Chaque atelier a une consigne d'une phrase, affichée ou répétée", "La rotation se fait au sifflet, en trente secondes"],
      materiel: "8 plots\n20 palets\n1 cage par coin si possible",
      variantes: "Trois ateliers pour un petit groupe. Un atelier « jeu » (un contre un) pour finir en énergie.",
      schema: {
        vue: "entiere",
        objets: [
          T(60, 40, "1 · Freinages", "bleu"), J(90, 80), J(90, 110), L("patin", [[100, 80], [200, 80]]), L("patin", [[100, 110], [200, 110]]),
          T(340, 40, "2 · Slalom palet", "bleu"), K(400, 80), K(440, 100), K(480, 80), K(520, 100), L("conduite", [[370, 90], [400, 70], [440, 110], [480, 70], [520, 110], [550, 90]]),
          T(60, 200, "3 · Passes", "bleu"), J(90, 240), J(190, 240, "O", "", "bleu"), L("passe", [[102, 236], [178, 236]], "vert"), L("passe", [[178, 244], [102, 244]], "vert"),
          T(340, 200, "4 · Tirs", "bleu"), J(420, 240), P(432, 232), L("tir", [[432, 244], [552, 190]], "rouge"),
          L("patin", [[300, 130], [300, 170]], "orange"),
        ],
      },
    }),

    ex({
      id: "cat_enchainement_patinage_tir",
      techniques: [],
      forme: "vagues",
      nom: "L'enchaînement complet : patiner, recevoir, tirer",
      categorie: "tir",
      duree: 10,
      objectif: "Tout mettre bout à bout comme en match : un tour de cône, une passe reçue, un tir, un rebond.",
      description:
        "Une file dans le coin, un passeur au point de mise au jeu opposé avec les palets. Le premier part sans palet, contourne le cône du haut du cercle, reçoit la passe en sortant du virage, tire en mouvement, puis va au rebond de son propre tir.\n\nIl récupère un palet et devient passeur ; le passeur rejoint la file. Changer de côté au bout de cinq minutes.",
      points_cles: ["Sortir du virage la palette au sol : la passe arrive là", "Tirer en mouvement, dans la foulée", "Son propre rebond : on ne s'arrête pas après le tir"],
      materiel: "1 plot\n20 palets",
      variantes: "Passe en retrait après le tir vers un second joueur. Le cône remplacé par un défenseur passif.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"), K(150, 80),
          J(60, 40), J(80, 32), J(100, 26),
          J(100, 220, "O", "", "bleu"), P(110, 228), P(116, 222),
          L("patin", [[75, 50], [140, 60], [165, 95], [135, 125]]),
          L("passe", [[110, 214], [128, 132]], "rouge"),
          L("tir", [[128, 128], [48, 148]], "rouge"),
          L("patin", [[120, 135], [70, 160]]),
        ],
      },
    }),

    ex({
      id: "cat_conduite_marche_arriere",
      techniques: ["TS.M 1", "TS.P 3"],
      forme: "vagues",
      nom: "Conduite de palet en marche arrière",
      categorie: "maniement",
      niveau: "intermediaire",
      duree: 6,
      objectif: "Reculer avec le palet : le garder devant soi alors que tout le corps va dans l'autre sens.",
      description:
        "Sur la largeur, chacun avec un palet. Départ en marche arrière, le palet devant soi qu'on tire à petits coups vers soi, palette au sol. Aller en arrière, retour en avant.\n\nPuis avec un slalom léger entre deux cônes. Puis le coach lève des doigts pendant la marche arrière : annoncer sans regarder le palet.",
      points_cles: ["Le palet devant soi, jamais entre les patins", "On tire le palet par petites touches, on ne le pousse pas", "La tête tourne par-dessus l'épaule, pas les épaules"],
      materiel: "1 palet par joueur\n4 plots",
      variantes: "Passe en marche arrière à un partenaire. Marche arrière avec palet puis pivot et tir.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), P(72, 84), J(60, 150), P(72, 154), J(60, 220), P(72, 224),
          L("arriere_palet", [[80, 80], [240, 80]]), L("arriere_palet", [[80, 150], [240, 150]]), L("arriere_palet", [[80, 220], [240, 220]]),
          L("patin", [[240, 260], [80, 260]]),
          J(280, 150, "C"),
          T(90, 40, "Le palet devant soi, tiré à petits coups", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_echappee_un_contre_gardien",
      techniques: [],
      forme: "vagues",
      nom: "L'échappée : seul face au gardien",
      categorie: "tir",
      duree: 8,
      objectif: "Le moment que tout le monde attend : arriver seul sur le gardien et choisir — tir ou feinte.",
      description:
        "Une file à la ligne rouge avec les palets. Chacun part seul, à sa vitesse, et va marquer : tir du poignet à l'entrée de l'enclave, ou feinte et revers. On annonce d'abord ce qu'on va faire, puis on ne l'annonce plus.\n\nLe gardien travaille sa sortie et son recul. Compter les buts : c'est une des rares fois où le score amuse tout le monde.",
      points_cles: ["Garder de la vitesse : un gardien débutant est battu par le rythme", "Décider avant le haut du cercle : tir ou feinte", "Après la feinte, le palet loin de la mitaine"],
      materiel: "20 palets",
      variantes: "Un défenseur qui part deux mètres derrière. Échappée à deux avec une passe obligatoire.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(300, 150), J(285, 165), J(270, 180), P(290, 150),
          L("conduite", [[285, 150], [200, 145], [120, 140]]),
          L("tir", [[115, 140], [48, 146]], "rouge"),
          L("conduite", [[120, 150], [80, 170], [60, 165]], "bleu"), T(70, 195, "ou feinte", "bleu", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passe_a_l_aveugle_appel",
      nom: "L'appel de balle : crier, montrer, recevoir",
      categorie: "passe",
      duree: 6,
      objectif: "Se faire voir pour recevoir : appeler, taper la glace, montrer la palette.",
      description:
        "Par trois dans une zone : un porteur, deux receveurs qui bougent. Le porteur ne regarde pas les receveurs ; il passe à celui qui APPELLE — par son nom, en tapant la glace avec la crosse, palette au sol vers lui.\n\nUne passe toutes les cinq secondes, on tourne les rôles toutes les minutes. Sans appel, pas de passe : c'est la règle.",
      points_cles: ["Appeler par le nom du porteur, pas « ici ! »", "La palette au sol montre exactement où on veut le palet", "Se démarquer dans une ligne libre, pas derrière quelqu'un"],
      materiel: "1 palet par trio",
      variantes: "Un défenseur passif dans le trio. Le porteur en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(120, 150), P(130, 156),
          J(200, 90, "X", "", "vert"), L("patin", [[190, 100], [170, 120]], "vert"), T(205, 70, "« Thomas ! »", "vert", "petit"),
          J(210, 210, "X", "", "vert"), L("patin", [[200, 200], [180, 180]], "vert"),
          L("passe", [[134, 150], [186, 108]], "rouge"),
          T(60, 260, "Sans appel, pas de passe", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_defense_baton_au_sol",
      nom: "Défendre : le bâton au sol, entre le palet et la cage",
      categorie: "jeu",
      duree: 8,
      objectif: "Les bases pour ne pas se faire passer : la position, la crosse, la patience.",
      description:
        "Par deux dans un couloir de la ligne bleue à la cage : un attaquant avec palet, un défenseur qui recule en marche arrière. Le défenseur garde la crosse au sol, dans la ligne entre le palet et la cage, et accompagne sans se jeter. L'attaquant essaie de passer d'un côté ou de l'autre.\n\nSi l'attaquant tire, le défenseur a « gagné » s'il l'a poussé sur le côté, loin du milieu. On inverse à chaque passage.",
      points_cles: ["Reculer en marche arrière, à la vitesse de l'attaquant", "Crosse au sol, bras tendu : elle enlève la moitié des passes possibles", "Attendre que l'attaquant se décide : le premier qui bouge perd"],
      materiel: "10 plots\n20 palets",
      variantes: "Deux contre deux. Le défenseur commence dos à l'attaquant et doit pivoter au signal.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"), K(160, 60), K(160, 240),
          J(260, 150), P(248, 156),
          J(180, 150, "O", "", "bleu"),
          L("conduite", [[246, 156], [200, 150], [150, 140]]),
          L("arriere", [[170, 150], [110, 148]], "bleu"),
          T(190, 100, "Crosse au sol,\nentre le palet et la cage", "bleu", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_chasse_au_tresor",
      techniques: [],
      forme: "actif",
      nom: "La chasse aux palets",
      categorie: "jeu",
      duree: 6,
      objectif: "Patiner, freiner, ramasser, ramener : un jeu d'équipe qui ne ressemble pas à un exercice.",
      description:
        "Une trentaine de palets éparpillés dans une zone. Deux équipes, chacune avec une « maison » (un cercle) à l'autre bout. Au signal, on va chercher les palets UN PAR UN, en conduite, et on les ramène dans sa maison. Quand il n'y en a plus sur la glace, on peut aller voler dans la maison adverse.\n\nDeux minutes. L'équipe qui a le plus de palets dans sa maison gagne. Trois manches.",
      points_cles: ["Un palet à la fois, en conduite, pas en le poussant n'importe comment", "Freiner près du palet, pas dedans", "Voler, c'est permis ; pousser, non"],
      materiel: "30 palets\n4 plots",
      variantes: "Ramener en marche arrière. Passe obligatoire à un partenaire avant la maison.",
      schema: {
        vue: "entiere",
        objets: [
          P(230, 90), P(260, 130), P(300, 70), P(330, 160), P(280, 200), P(350, 110), P(250, 240), P(310, 230), P(370, 190), P(240, 170), P(360, 60),
          J(100, 80), J(100, 220), J(500, 80, "O", "", "bleu"), J(500, 220, "O", "", "bleu"),
          L("conduite", [[240, 100], [140, 90]]), L("conduite", [[340, 165], [460, 210]], "bleu"),
          T(60, 40, "Maison rouge", "rouge", "petit"), T(480, 40, "Maison bleue", "bleu", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_cinq_contre_cinq_regles",
      nom: "Situation : la mise en jeu en zone défensive",
      categorie: "jeu",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Que faire quand on gagne ou perd la mise au jeu dans sa zone : trois consignes simples.",
      description:
        "Cinq contre cinq dans une zone, mise au jeu sur un point. Consignes pour l'équipe qui défend :\n1. Mise au jeu gagnée : le défenseur derrière récupère et sort par la bande, jamais par le milieu.\n2. Mise au jeu perdue : l'ailier côté bande va sur le défenseur adverse à la bleue, l'autre ailier reste dans l'enclave.\n3. Le centre suit le palet, sans le courser.\n\nOn rejoue la même mise au jeu dix fois, puis on change les équipes.",
      points_cles: ["Sortir par la bande, jamais par le milieu", "L'ailier de la bande sort sur la bleue tout de suite", "Chacun un joueur à regarder, pas le palet"],
      materiel: "Chasubles\n20 palets",
      variantes: "Même chose en zone offensive : où se placer pour tirer si on gagne.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"), P(100, 80),
          J(92, 80, "X", "C", "rouge"), J(75, 100, "X", "D", "rouge"), J(120, 110, "X", "D", "rouge"), J(140, 60, "X", "A", "rouge"), J(140, 140, "X", "A", "rouge"),
          J(108, 80, "O", "", "bleu"), J(180, 60, "O", "", "bleu"), J(200, 120, "O", "", "bleu"), J(230, 90, "O", "", "bleu"), J(230, 180, "O", "", "bleu"),
          L("passe", [[80, 105], [40, 60]], "rouge"), L("conduite", [[40, 60], [60, 20], [200, 15]], "rouge"),
          L("patin", [[150, 60], [225, 88]], "rouge"),
          T(120, 250, "Gagnée : on sort par la bande.\nPerdue : l'ailier monte sur la bleue.", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_test_patinage_chrono",
      techniques: ["TS.P 2", "TS.P 3", "TS.P 15"],
      forme: "parcours",
      nom: "Le test de patinage du mois",
      categorie: "patinage",
      niveau: "tous",
      duree: 10,
      objectif: "Mesurer pour voir le progrès : deux parcours chronométrés, les mêmes chaque mois.",
      description:
        "Deux tests, un passage chacun, temps noté par le coach :\n1. Aller-retour sur la longueur avec arrêt complet sur la ligne de but d'en face (départ arrêté).\n2. Un tour complet du cercle central en avant, puis un tour en arrière.\n\nOn refait exactement les mêmes tests toutes les quatre ou cinq semaines. Le progrès se voit sur les chiffres, et il motive plus que n'importe quel discours. Les temps se notent dans le bilan de la séance.",
      points_cles: ["Les mêmes tests, les mêmes lignes, chaque fois", "Un seul passage : c'est un test, pas un entraînement", "Chacun contre lui-même, pas contre les autres"],
      materiel: "1 chronomètre",
      variantes: "Un troisième test avec palet quand le groupe est prêt.",
      schema: {
        vue: "entiere",
        objets: [
          J(50, 100), L("patin", [[62, 96], [545, 96]]), T(548, 80, "Arrêt", "rouge", "petit"), L("patin", [[545, 106], [62, 106]]),
          L("patin", [...tour(300, 150, 55, Math.PI / 2, -1)]), L("arriere", [...tour(300, 150, 66, Math.PI / 2, 1)]),
          J(300, 230, "C"),
          T(120, 250, "Test 1 : aller-retour avec arrêt · Test 2 : un tour avant, un tour arrière", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_conduite_a_une_main",
      techniques: ["TS.M 3.1"],
      forme: "vagues",
      nom: "Conduite à une main et protection",
      categorie: "maniement",
      niveau: "intermediaire",
      duree: 5,
      objectif: "Tenir le palet loin de l'adversaire, d'une seule main, le bras tendu.",
      description:
        "Sur la largeur : conduite du palet à une main (la main du haut seulement), bras tendu, palet loin sur le côté. Aller à droite, retour à gauche. Puis autour d'un cône, en gardant le cône entre le corps et le palet.\n\nC'est le geste qui sauve un palet le long de la bande : le corps fait écran, le bras fait la distance.",
      points_cles: ["Palette à plat sur le palet, on l'accompagne, on ne le tape pas", "Le bras tendu, le corps entre le palet et l'adversaire imaginaire", "Reprendre à deux mains dès qu'on est libre"],
      materiel: "1 palet par joueur\ndes plots",
      variantes: "Un partenaire qui gêne passivement. À une main en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), P(80, 70), L("conduite", [[85, 70], [240, 70]]),
          J(60, 150), P(80, 140), L("conduite", [[85, 140], [240, 140]]),
          K(180, 220), J(120, 220), P(135, 235), L("conduite", [[140, 236], [180, 250], [215, 225], [180, 195], [140, 205]]),
          T(60, 275, "Une main, bras tendu, le corps fait écran", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_relais_navette_lignes",
      techniques: ["TS.P 11", "TS.P 15"],
      forme: "vagues",
      nom: "Navettes sur les lignes",
      categorie: "patinage",
      duree: 6,
      objectif: "Du souffle et des freinages, façon « suicides » : jusqu'à la bleue et retour, la rouge et retour, le fond et retour.",
      description:
        "Départ de la ligne de but. On patine jusqu'à la première bleue, on freine, on touche la ligne de la crosse, on revient à la ligne de but. Puis jusqu'à la rouge et retour. Puis jusqu'à la deuxième bleue et retour. Puis le fond.\n\nUne série, une minute de récupération, deuxième série. Chacun à son rythme : c'est un exercice de souffle, pas une course.",
      points_cles: ["Freiner sur la ligne, pas après", "Repartir immédiatement, premiers pas courts", "Respirer : on souffle sur la poussée"],
      materiel: "Aucun.",
      variantes: "Retours en marche arrière. En relais par équipes (là, c'est une course).",
      schema: {
        vue: "entiere",
        objets: [
          J(50, 80), J(50, 130), J(50, 180), J(50, 230),
          L("patin", [[62, 76], [225, 76]]), L("patin", [[225, 84], [62, 84]]),
          L("patin", [[62, 126], [296, 126]]), L("patin", [[296, 134], [62, 134]]),
          L("patin", [[62, 176], [367, 176]]), L("patin", [[367, 184], [62, 184]]),
          L("patin", [[62, 226], [555, 226]]), L("patin", [[555, 234], [62, 234]]),
          T(230, 40, "Bleue, rouge, bleue, fond : freiner sur la ligne, revenir", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_jeu_des_portes",
      nom: "Le jeu des portes",
      categorie: "passe",
      duree: 8,
      objectif: "Passer à travers des portes : viser une ligne de passe, pas un joueur.",
      description:
        "Cinq ou six portes (deux cônes à deux mètres) éparpillées dans la zone. Par deux, un palet : on marque un point chaque fois qu'une passe traverse une porte et est reçue de l'autre côté. Interdit de repasser deux fois de suite par la même porte.\n\nDeux minutes, on compte. Puis trois contre trois : mêmes portes, mais l'autre équipe défend.",
      points_cles: ["Regarder la porte, pas le partenaire : il ira là où on regarde", "Le receveur se place derrière la porte, pas dedans", "Bouger dès que la passe est partie"],
      materiel: "12 plots\n1 palet par duo\nChasubles",
      variantes: "Portes plus étroites. Passes en revers uniquement.",
      schema: {
        vue: "moitie",
        objets: [
          K(80, 60), K(80, 80), K(160, 110), K(180, 110), K(230, 60), K(250, 60), K(90, 200), K(90, 220), K(200, 230), K(220, 230), K(150, 160), K(150, 180),
          J(60, 130), J(130, 60, "O", "", "bleu"), L("passe", [[70, 122], [118, 68]], "vert"),
          J(200, 180), J(230, 120, "O", "", "bleu"), L("passe", [[195, 170], [172, 118]], "vert"),
          T(60, 275, "Un point par passe reçue à travers une porte", "noir", "petit"),
        ],
      },
    }),

    /* ── Sixième fournée : les techniques que le catalogue ne couvrait
       pas encore, et de quoi occuper un gardien et un groupe joueur. ── */

    ex({
      id: "cat_grand_huit_echauffement",
      nom: "Le grand huit à tout le monde",
      categorie: "echauffement",
      techniques: ["TS.P 2", "TS.P 7"],
      forme: "actif",
      duree: 6,
      objectif: "Tout le groupe en mouvement dès la première minute, en tournant dans les deux sens.",
      description:
        "Tout le monde patine un grand huit autour des deux cercles d'une zone, dans le même sens, à distance les uns des autres. Au sifflet : on inverse le sens (donc les virages changent de côté). Deuxième sifflet : on ajoute une poussée forte à chaque sortie de virage. Troisième : avec palet.\n\nLe coach au croisement du huit voit tout le monde passer et donne un mot à chacun.",
      points_cles: ["Se pencher vers l'intérieur dans chaque virage", "Sortir du virage en poussant, pas en glissant", "Garder ses distances : le huit se croise"],
      corrections: ["Regard au sol dans le virage → regarder la sortie du virage", "Virage à plat, sans inclinaison → plier les genoux et se pencher"],
      materiel: "Aucun.",
      variantes: "Un huit en marche arrière pour les plus avancés. Le coach fait des passes au passage.",
      schema: {
        vue: "moitie",
        objets: [
          L("patin", [...tour(100, 80, 55, Math.PI / 2, -1).slice(0, 8), ...tour(100, 220, 55, -Math.PI / 2, 1).slice(0, 8), [100, 135]]),
          J(100, 150, "C"), J(150, 60), J(60, 40), J(140, 250), J(50, 260),
          T(180, 150, "Un grand huit autour des deux cercles,\non inverse au sifflet", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_scooter_cercles",
      nom: "Le scooter sur les cercles",
      categorie: "patinage",
      techniques: ["TS.P 5", "TF.M 2"],
      forme: "groupes3",
      duree: 6,
      objectif: "Glisser sur un pied en carre externe pendant que l'autre pousse : le scooter, base des virages et des croisés.",
      description:
        "Par trois sur un cercle. Le patin intérieur reste sur la ligne du cercle, en carre externe, genou fléchi, corps penché vers l'intérieur ; le patin extérieur pousse sur le côté comme sur une trottinette et revient au contact de la glace. Trois tours dans un sens, trois dans l'autre (le pied change).\n\nLentement : on cherche l'inclinaison et la glisse, pas la vitesse.",
      points_cles: ["Le poids sur la jambe de glisse : flexion, carre externe, inclinaison", "Poussée latérale avec toute la lame, extension complète", "Buste droit, épaules en rotation inverse, palette à l'opposé du poids"],
      corrections: ["Appui en talon, faible prise de carre → genou fléchi, se pencher vers le centre", "Sautillement à chaque poussée → garder le poids sur la jambe de glisse", "Poussée avec la pointe vers l'arrière → pousser sur le côté avec toute la lame"],
      materiel: "Aucun.",
      variantes: "Enchaînement de demi-cercles en changeant de pied. Crosse à une main.",
      schema: {
        vue: "moitie",
        objets: [
          L("patin", [...tour(100, 80, 48, Math.PI / 2, -1)]), J(150, 90), J(120, 125), J(60, 110),
          L("patin", [...tour(100, 220, 48, -Math.PI / 2, 1)]), J(150, 210), J(120, 175), J(60, 190),
          T(175, 150, "Patin intérieur sur la ligne en carre externe,\nl'extérieur pousse en trottinette", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_finlandais_ouverture",
      nom: "Le finlandais : glisser en ouverture",
      categorie: "patinage",
      niveau: "intermediaire",
      techniques: ["TS.P 6", "TS.P 19"],
      forme: "vagues",
      duree: 6,
      objectif: "Ouvrir les hanches et glisser talons resserrés : le geste qui prépare les pivots.",
      description:
        "D'abord à la bande, à l'arrêt : un patin glisse en avant, l'autre s'ouvre à 180° et se pose talon contre talon. Puis en mouvement sur la largeur : élan, glisse sur un pied, ouverture du second patin sans contact, pose en ouverture, et on glisse en arc de cercle sur les deux patins ouverts.\n\nUn côté puis l'autre. Les arcs de cercle sont grands au début, plus serrés quand ça tient.",
      points_cles: ["Buste droit, coudes et mains dégagés, crosse à deux mains sur la glace", "Le poids sur la jambe de glisse avant d'ouvrir", "Talons resserrés et dans le même axe, forte inclinaison vers l'intérieur"],
      corrections: ["Poids réparti sur les deux patins → glisser d'abord franchement sur un pied", "Dos rond, appui sur la crosse → buste droit, mains devant", "Talons trop écartés → resserrer les talons dans le même axe"],
      materiel: "Aucun.",
      variantes: "Saut en ouverture depuis la bande. Enchaîner ouverture puis demi-tour complet.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 70), J(60, 150), J(60, 230),
          L("patin", [[72, 70], [130, 70]]), L("glisse", [[135, 70], [200, 90], [250, 140]]),
          L("patin", [[72, 150], [130, 150]]), L("glisse", [[135, 150], [200, 130], [250, 80]]),
          L("patin", [[72, 230], [130, 230]]), L("glisse", [[135, 230], [200, 250], [250, 290]]),
          T(60, 30, "Élan, glisse sur un pied, ouverture, arc de cercle talons resserrés", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_demarrage_de_cote",
      nom: "Démarrage de côté",
      categorie: "patinage",
      techniques: ["TS.P 12", "TS.P 11"],
      forme: "vagues",
      duree: 5,
      objectif: "Partir vite quand on est de profil : les deux premières poussées, croisées, sans se retourner d'abord.",
      description:
        "Face à la bande, de profil par rapport au sens de course. Au sifflet : le patin le plus éloigné pousse en carre interne pendant que l'autre prend sa carre externe, le buste tourne en même temps, et la jambe libre monte en croisant devant. Trois poussées et on se laisse glisser.\n\nCinq départs vers la droite, cinq vers la gauche. Puis départ au signal visuel (le coach lève le bras).",
      points_cles: ["Poussées interne et externe simultanées sur l'avant des lames", "Le buste tourne avec les poussées, pas avant", "Flexions maintenues sur les poussées suivantes"],
      corrections: ["Le buste tourne trop tôt → pousser et tourner en même temps", "Genoux et patins resserrés → se poser large, poids sur la première jambe", "Poussées vers l'arrière → pousser sur le côté, monter le genou"],
      materiel: "1 sifflet",
      variantes: "Départ de côté puis freinage à la ligne. Départ en marche arrière de côté.",
      schema: {
        vue: "moitie",
        objets: [
          J(150, 60), J(150, 110), J(150, 160), J(150, 210),
          L("acceleration", [[162, 60], [260, 60]]), L("acceleration", [[162, 110], [260, 110]]), L("acceleration", [[162, 160], [260, 160]]), L("acceleration", [[162, 210], [260, 210]]),
          L("acceleration", [[138, 250], [40, 250]]),
          J(90, 135, "C"),
          T(60, 40, "De profil au départ : les deux poussées croisées, le buste tourne avec", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_demarrage_arriere_c",
      nom: "Démarrage arrière en C",
      categorie: "patinage",
      techniques: ["TS.P 13", "TS.P 3"],
      forme: "vagues",
      duree: 5,
      objectif: "Partir en marche arrière d'un arrêt, vite : le patin de poussée en C, le patin pivot en pointe.",
      description:
        "À l'arrêt, dos au sens de course. Un patin est le pivot, décalé en arrière et en pointe ; l'autre pousse en dessinant un C, avec le poids dessus, jusqu'à l'extension complète. Le buste tourne avec la poussée. Puis on referme la trajectoire, on resserre les genoux et on prépare la seconde poussée avec l'autre pied.\n\nCinq départs par côté, puis départs au sifflet.",
      points_cles: ["Épaules de face, coudes et mains dégagés", "Poids sur le patin de poussée, patin pivot immobile et en pointe", "Rotation du buste simultanée à la poussée"],
      corrections: ["Patins en chasse-neige, genoux serrés → un patin pivot, un patin qui pousse", "Poids retiré trop tôt de la jambe de poussée → pousser jusqu'à l'extension", "Épaules de profil → rester de face, coudes dégagés"],
      materiel: "1 sifflet",
      variantes: "Départ arrière puis pivot et sprint avant. Avec palet.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 70), J(80, 120), J(80, 170), J(80, 220),
          L("arriere", [[92, 70], [220, 70]]), L("arriere", [[92, 120], [220, 120]]), L("arriere", [[92, 170], [220, 170]]), L("arriere", [[92, 220], [220, 220]]),
          L("patin", [[220, 260], [92, 260]]),
          J(250, 145, "C"),
          T(60, 30, "Un patin pivot en pointe, l'autre pousse en C", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_freinage_arriere_v",
      nom: "Freinage arrière en V, puis parallèle",
      categorie: "patinage",
      niveau: "intermediaire",
      techniques: ["TS.P 17", "TS.P 18"],
      forme: "vagues",
      duree: 6,
      objectif: "S'arrêter en marche arrière : d'abord en V (chasse-neige inversé), puis en parallèle pour ceux qui reculent bien.",
      description:
        "Marche arrière sur la largeur, freinage à la ligne. Le V : on se redresse un peu pour alléger, on écarte les patins au-delà des épaules, on ouvre les pointes vers l'extérieur et on fléchit en rapprochant les talons — les carres internes freinent.\n\nLe parallèle, ensuite : dans la continuité d'une poussée, allègement, rotation des épaules, les deux patins se mettent en travers, carre interne devant, carre externe derrière, flexion forte.",
      points_cles: ["Flexions chevilles-genoux maintenues dans toutes les phases", "V : écarter, ouvrir, fléchir progressivement, talons qui se rapprochent", "Parallèle : allègement, rotation des épaules et mise en travers simultanés"],
      corrections: ["Tassement, dos rond, fesses en arrière → buste droit, flexion par les genoux", "Pression d'un seul côté → répartir sur les deux patins", "Freinage en carre interne seulement → prendre la carre externe du second patin"],
      materiel: "Aucun.",
      variantes: "Freinage arrière puis départ avant immédiat. Au sifflet, sans savoir où.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), J(60, 150), J(60, 220),
          L("arriere", [[72, 80], [200, 80]]), L("arriere", [[72, 150], [200, 150]]), L("arriere", [[72, 220], [200, 220]]),
          T(215, 80, "V", "rouge", "grand"), T(215, 150, "V", "rouge", "grand"), T(215, 220, "||", "rouge", "grand"),
          T(60, 270, "En V d'abord ; parallèle pour ceux qui reculent bien", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_demi_pivots_glisses",
      nom: "Demi-pivots glissés, avant vers arrière",
      categorie: "patinage",
      niveau: "intermediaire",
      techniques: ["TS.P 21", "TS.P 19"],
      forme: "parcours",
      duree: 6,
      objectif: "Se retourner en pleine glisse sans perdre de vitesse : le demi-pivot du défenseur qui recule.",
      description:
        "Une ligne de plots espacés de huit mètres. Patinage avant vers le premier plot ; en approchant, on prend une courbe montante comme un virage, patin d'appel en avance et fortement incliné ; au sommet de la courbe, allègement, la jambe d'appel sous le buste sert d'axe, rotation, et on ressort en marche arrière. Au plot suivant, l'inverse.\n\nLes deux sens. Les épaules tournent à l'inverse des hanches pour rester face au jeu.",
      points_cles: ["Toute la courbe montante en avant, comme un virage, patin d'appel en avance", "Allègement et rotation au sommet, jambe d'appel fléchie sous le buste", "Rotations inverses épaules-hanches pour rester face au jeu"],
      corrections: ["Le patin de poussée reste en contact → alléger franchement au sommet", "Jambe d'appel pas sous le buste → l'axe de rotation, c'est la jambe fléchie sous soi", "Glisse à deux pieds avant la reprise → pousser dès la sortie"],
      materiel: "5 plots",
      variantes: "Avec palet. Demi-pivot au sifflet en pleine ligne droite.",
      schema: {
        vue: "entiere",
        objets: [
          K(120, 150), K(220, 150), K(320, 150), K(420, 150), K(520, 150),
          J(50, 150), J(35, 150),
          L("pivot", [[62, 150], [100, 130], [125, 125]]), L("arriere", [[135, 130], [200, 150], [225, 170]]), L("pivot", [[235, 172], [300, 150], [325, 128]]), L("arriere", [[335, 130], [400, 150], [425, 170]]), L("pivot", [[435, 172], [500, 150], [525, 128]]),
          T(150, 60, "Avant, demi-pivot au plot, arrière, demi-pivot, avant…", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_dissociation_haut_bas",
      nom: "Dissociation haut-bas : patiner en jonglant",
      categorie: "patinage",
      techniques: ["TF.A 2", "TF.A 1"],
      forme: "actif",
      duree: 5,
      objectif: "Que les jambes patinent sans que les bras s'en mêlent : le haut fait autre chose que le bas.",
      description:
        "Tout le monde en patinage libre dans la zone. Consignes qui s'enchaînent toutes les trente secondes, sans arrêter de patiner :\n1. Crosse tenue au-dessus de la tête.\n2. Crosse dans le dos, derrière les coudes.\n3. Mains sur les hanches (crosse posée au sol au passage).\n4. On se passe la crosse d'une main à l'autre autour du corps.\n5. On fait rebondir un palet sur la palette en patinant.\n\nLe patinage ne doit pas changer : même flexion, mêmes poussées.",
      points_cles: ["Les jambes continuent de pousser normalement, quoi que fassent les bras", "Flexion maintenue quand les bras montent", "Regard devant, jamais sur la crosse"],
      corrections: ["Le patinage se redresse quand les bras bougent → se refléchir volontairement", "Les épaules suivent les mains → garder les épaules de face"],
      materiel: "1 palet par joueur",
      variantes: "En marche arrière. Par deux : l'un donne les consignes à l'autre.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 70), J(140, 100), J(200, 60), J(110, 160), J(180, 190), J(90, 240), J(230, 230), J(240, 140),
          L("patin", [[92, 75], [130, 110]]), L("patin", [[190, 195], [220, 225]]), L("patin", [[250, 135], [230, 90]]),
          J(160, 150, "C"),
          T(60, 30, "Crosse au-dessus de la tête, dans le dos, mains sur les hanches…", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_maniement_entre_plans",
      nom: "Maniement entre les plans : diagonale, carré, triangle",
      categorie: "maniement",
      techniques: ["TS.M 2", "TS.M 1"],
      forme: "actif",
      duree: 6,
      objectif: "Déplacer le palet d'un plan à l'autre — devant, sur le côté, en revers — sans que les patins ne tournent.",
      description:
        "Chacun avec un palet, à l'arrêt, patins immobiles. Trente secondes par figure :\n1. Coup droit à revers devant soi, sans faire coulisser les mains.\n2. La diagonale : de latéral coup droit à avant revers.\n3. Le carré : quatre coins autour de soi.\n4. Le triangle.\n5. Le huit entre les patins.\n\nPuis les mêmes figures en glissant lentement en avant. Tête haute dès que la figure est propre.",
      points_cles: ["C'est le buste qui tourne dans les plans latéraux, pas les patins", "Pas de coulisse des mains dans la zone d'amplitude des bras", "Palet proche des patins, mains devant"],
      corrections: ["Les patins tournent avec le palet → patins fixes, buste qui tourne", "Palet trop loin, mains trop basses → ramener le palet, main haute devant le buste", "Regard sur le palet → regarder le coach"],
      materiel: "1 palet par joueur",
      variantes: "Avec une balle d'abord pour se concentrer sur la posture. À une main.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 80), P(100, 92), J(170, 80), P(180, 92), J(250, 80), P(260, 92),
          J(90, 160), P(100, 172), J(170, 160), P(180, 172), J(250, 160), P(260, 172),
          J(90, 240), P(100, 252), J(170, 240), P(180, 252), J(250, 240), P(260, 252),
          J(50, 160, "C"),
          T(60, 30, "Diagonale, carré, triangle, huit — patins immobiles", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_ramasses_v_l",
      nom: "Ramasses en V, en L, en roue",
      categorie: "maniement",
      techniques: ["TS.M 4"],
      forme: "actif",
      duree: 5,
      objectif: "Éloigner et ramener le palet : la coulisse des mains, le transfert du poids, la palette qui reste au contact.",
      description:
        "Chacun avec un palet, à l'arrêt. On pousse le palet loin devant en faisant coulisser la main du bas vers le bas du manche (sans que les gants se touchent), puis on le ramène en refermant la palette dessus. En V : loin à droite, ramener, loin à gauche, ramener. En L : devant puis sur le côté. En roue : tout autour.\n\nLe poids du corps suit le palet, en flexion.",
      points_cles: ["Coulisse maximale sans que les gants se touchent", "Le transfert du poids accompagne l'éloignement et le rapprochement", "Coup droit : palette au contact ; revers : la palette quitte la glace pour la reprise"],
      corrections: ["Coulisse incomplète → aller chercher loin, main basse qui descend", "Main basse trop près de la palette, coude tendu → remonter la main, garder le coude souple", "Patins en trépied → patins à la largeur des épaules, chevilles fléchies"],
      materiel: "1 palet par joueur",
      variantes: "En glissant en avant. À une main.",
      schema: {
        vue: "moitie",
        objets: [
          J(120, 100), P(130, 112), L("conduite", [[132, 112], [175, 80]]), L("conduite", [[132, 116], [175, 145]]), T(185, 112, "V", "noir", "petit"),
          J(120, 200), P(130, 212), L("conduite", [[132, 210], [180, 210]]), L("conduite", [[134, 216], [134, 260]]), T(185, 232, "L", "noir", "petit"),
          J(240, 150), P(250, 162), L("conduite", [[252, 162], [280, 130]]), L("conduite", [[252, 164], [280, 190]]), L("conduite", [[248, 166], [220, 190]]), T(262, 210, "roue", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_carre_quatre_contre_deux",
      nom: "Le carré : quatre contre deux",
      categorie: "passe",
      forme: "groupes3",
      duree: 8,
      objectif: "Garder le palet à quatre contre deux : passer avant d'être pris, bouger pour offrir une ligne.",
      description:
        "Un carré de douze mètres marqué par des plots. Quatre attaquants sur les bords, deux défenseurs au milieu. Les quatre se passent le palet, les deux le chassent. Dix passes d'affilée = un point. Interception = le passeur et le receveur deviennent défenseurs.\n\nLes attaquants peuvent glisser le long de leur bord pour ouvrir une ligne. Deux manches de trois minutes.",
      points_cles: ["Passer dès qu'un défenseur arrive, pas quand il est là", "Sans le palet : se déplacer le long du bord pour être visible", "Défenseurs : à deux, l'un sur le porteur, l'autre dans la ligne de passe"],
      corrections: ["Le porteur attend trop → deux secondes maximum avec le palet", "Les receveurs restent dans les coins → bouger le long du bord"],
      materiel: "4 plots\n1 palet par carré\nChasubles",
      variantes: "Trois contre un. Deux touches maximum. Le carré rétrécit.",
      schema: {
        vue: "moitie",
        objets: [
          K(60, 60), K(240, 60), K(60, 240), K(240, 240),
          J(150, 62), J(238, 150), J(150, 238), J(62, 150), P(160, 68),
          J(130, 120, "O", "", "bleu"), J(170, 180, "O", "", "bleu"),
          L("passe", [[162, 70], [230, 140]], "vert"), L("passe", [[230, 160], [160, 230]], "vert"),
          T(60, 275, "Dix passes d'affilée = un point", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_reception_revers_tir",
      nom: "Réception en revers et tir",
      categorie: "tir",
      forme: "vagues",
      duree: 8,
      objectif: "Recevoir une passe sur le revers, la contrôler et tirer sans perdre de temps.",
      description:
        "Une file à la bleue côté revers de chacun (à gauche pour un droitier), un passeur au haut du cercle opposé avec les palets. Le premier part, reçoit la passe sur le revers en mouvement, ramène le palet en coup droit d'une touche et tire. Il récupère son palet et devient passeur.\n\nDeuxième série : tir en revers directement, sans ramener.",
      points_cles: ["Palette ouverte côté revers, elle amortit", "Une seule touche pour ramener en coup droit", "Tirer dans la foulée, sans reprise"],
      corrections: ["Le palet rebondit sur la palette → amortir en reculant la palette", "Deux ou trois touches avant de tirer → une touche, puis tir"],
      materiel: "20 palets",
      variantes: "Passe dans les patins à contrôler. Tir en revers direct.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(230, 230), J(250, 240), J(270, 250),
          J(150, 80, "O", "", "bleu"), P(160, 72), P(166, 78),
          L("patin", [[222, 222], [140, 170]]), L("passe", [[145, 90], [138, 165]], "rouge"),
          L("tir", [[132, 165], [48, 152]], "rouge"),
          T(170, 150, "Réception sur le revers, une touche, tir", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_passe_transversale",
      nom: "Le gardien : suivre la passe transversale",
      categorie: "gardien",
      forme: "duo",
      duree: 8,
      objectif: "Se déplacer d'un poteau à l'autre sur une passe qui traverse, et être en place avant le tir.",
      description:
        "Deux tireurs au haut des cercles, un de chaque côté, avec les palets. Ils se passent le palet en travers ; le gardien suit chaque passe en poussée en T ou en glissade, et se replace face au porteur. Après deux ou trois passes, le porteur tire.\n\nLentement d'abord : le gardien doit être arrêté et en position quand le tir part. Puis on accélère les passes.",
      points_cles: ["Suivre le palet, pas le joueur : les yeux sur le palet", "Poussée en T ou glissade, puis arrêt en position — jamais en mouvement au moment du tir", "Le bâton reste au sol pendant le déplacement"],
      corrections: ["Le gardien arrive en retard → partir dès que le palet quitte la palette", "Tir reçu en plein déplacement → les tireurs attendent qu'il soit en place, puis on accélère"],
      materiel: "20 palets",
      variantes: "Trois tireurs en triangle. Passe puis tir en une touche.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), L("patin", [[48, 140], [48, 128]], "bleu"), L("patin", [[48, 160], [48, 172]], "bleu"),
          J(150, 80), P(160, 74), J(150, 220), P(160, 226),
          L("echange", [[150, 92], [150, 208]], "rouge"),
          L("tir", [[140, 214], [54, 158]], "rouge"),
          T(170, 150, "Passes en travers, le gardien suit,\ntir quand il est en place", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_rebonds",
      nom: "Le gardien : contrôler les rebonds",
      categorie: "gardien",
      forme: "duo",
      duree: 6,
      objectif: "Ne pas seulement arrêter : diriger le rebond dans le coin, ou couvrir le palet.",
      description:
        "Un tireur dans l'enclave, tirs au sol modérés. Le gardien arrête et, à chaque arrêt, fait une chose : dévier le palet vers le coin avec la jambière ou le bâton, ou le bloquer et le couvrir de la mitaine. Le tireur annonce « coin ! » ou « couvre ! » avant de tirer.\n\nPuis un second joueur attaque le rebond : le gardien doit décider seul.",
      points_cles: ["Jambière orientée vers le coin, pas vers le milieu", "Couvrir le palet sans hésiter quand personne n'est là", "Se relever face au palet après chaque arrêt"],
      corrections: ["Rebond rendu au milieu → tourner la jambière vers l'extérieur", "Hésitation entre couvrir et dégager → le tireur annonce, jusqu'à ce que ça devienne un réflexe"],
      materiel: "20 palets",
      variantes: "Tirs à mi-hauteur. Deux attaquants au rebond.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(130, 150), P(140, 142), P(146, 148), P(141, 156),
          L("tir", [[120, 150], [54, 150]], "rouge"),
          L("passe", [[52, 160], [30, 200]], "bleu"), T(20, 220, "coin", "bleu", "petit"),
          J(120, 210, "O", "", "bleu"), L("patin", [[112, 202], [70, 165]], "bleu"),
          T(160, 250, "Arrêter, puis diriger dans le coin ou couvrir", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_jeu_trois_zones",
      nom: "Le jeu des trois zones",
      categorie: "jeu",
      forme: "actif",
      duree: 10,
      objectif: "Faire avancer le palet par des passes, zone après zone : on ne traverse pas, on transmet.",
      description:
        "La glace coupée en trois tiers par les lignes bleues. Deux équipes de six ; dans chaque tiers, deux joueurs de chaque équipe, qui ne peuvent pas en sortir. Pour marquer, le palet doit passer par les trois tiers en passes : la défense sort le palet vers le milieu, le milieu le donne à l'attaque, l'attaque tire.\n\nPalet intercepté : l'autre équipe repart de son tiers défensif. Quatre minutes par manche, puis rotation des tiers.",
      points_cles: ["Chercher le partenaire du tiers suivant dès qu'on a le palet", "Sans le palet : se démarquer dans son tiers, près de la ligne", "On ne franchit jamais sa ligne, même pour aider"],
      corrections: ["Tout le monde regarde le palet → chacun regarde son tiers voisin", "Passes trop longues qui sautent un tiers → une zone à la fois"],
      materiel: "Chasubles\n20 palets",
      variantes: "Trois joueurs par tiers. Le tiers central peut être traversé par un joueur.",
      schema: {
        vue: "entiere",
        objets: [
          J(46, 150, "G"), J(554, 150, "G"),
          J(120, 100, "X", "", "rouge"), J(120, 200, "X", "", "rouge"), J(160, 150, "O", "", "bleu"), J(200, 90, "O", "", "bleu"),
          J(280, 100, "X", "", "rouge"), J(320, 200, "X", "", "rouge"), J(300, 60, "O", "", "bleu"), J(300, 240, "O", "", "bleu"),
          J(480, 100, "X", "", "rouge"), J(440, 200, "X", "", "rouge"), J(460, 150, "O", "", "bleu"), J(500, 220, "O", "", "bleu"),
          P(130, 200),
          L("passe", [[132, 196], [270, 108]], "rouge"), L("passe", [[290, 108], [430, 192]], "rouge"), L("tir", [[450, 195], [554, 160]], "rouge"),
          T(190, 40, "Chacun dans son tiers : le palet avance par passes, zone après zone", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_demenagement",
      nom: "Le déménagement",
      categorie: "jeu",
      forme: "relais",
      duree: 6,
      objectif: "Transporter le palet sur la palette sans le manier : de l'équilibre, du contrôle, et des rires.",
      description:
        "Relais par équipes de trois. Un tas de palets par équipe à la ligne de but, une « maison » (cercle) à l'autre bout. Chacun à son tour transporte un palet posé à plat sur sa palette — sans le dribbler, sans le toucher de la main — jusqu'à la maison, le dépose et revient taper dans la main du suivant. Palet tombé : on le ramasse avec la crosse et on continue.\n\nL'équipe qui a déménagé tous ses palets la première a gagné.",
      points_cles: ["Palette à plat, bras souples : le palet ne bouge pas si les mains ne bougent pas", "Patiner en flexion, régulièrement", "Le suivant part à la tape dans la main"],
      corrections: ["Le palet tombe à chaque poussée → moins de poussée, plus de glisse", "Bras raides → coudes souples, mains devant"],
      materiel: "5 palets par équipe",
      variantes: "Deux palets sur la palette. Retour en marche arrière.",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 100), J(45, 100), J(30, 100), P(70, 92), P(76, 96), P(72, 102),
          J(60, 200, "O", "", "bleu"), J(45, 200, "O", "", "bleu"), J(30, 200, "O", "", "bleu"), P(70, 192), P(76, 196), P(72, 202),
          L("glisse", [[80, 100], [500, 100]]), L("glisse", [[80, 200], [500, 200]], "bleu"),
          L("depose", [[500, 100], [530, 100]]), L("depose", [[500, 200], [530, 200]], "bleu"),
          T(330, 40, "Le palet à plat sur la palette, sans le manier", "noir", "petit"),
        ],
      },
    }),

    /* ── Septième fournée : des éducatifs, courts et techniques, qui
       suivent la progression des fiches — à la bande d'abord, puis en
       glisse, puis en mouvement. ── */

    ex({
      id: "cat_educ_bande_position",
      nom: "À la bande : la position de base",
      categorie: "patinage",
      techniques: ["TS.P 1", "TF.M 3"],
      forme: "actif",
      duree: 5,
      objectif: "Trouver et sentir la position de base, à l'arrêt puis en glisse, avant de vouloir aller vite.",
      description:
        "Tout le monde le long de la bande, une main dessus :\n1. Flexion groupée, bras tendus devant : on descend jusqu'à ce que les genoux cachent les pointes des patins, on tient dix secondes, on remonte. Cinq fois.\n2. Glisse avant sur deux pieds en position de base, depuis une poussée sur la bande.\n3. Même chose en glisse arrière.\n4. Glisse arrière avec la crosse tenue derrière les genoux : impossible de se redresser.\n5. Flexion groupée pendant la glisse, avant puis arrière.\n\nLe coach passe derrière chacun et vérifie : chevilles fléchies, dos droit, mains devant.",
      points_cles: ["Flexion prononcée des chevilles, genoux alignés aux pointes des patins", "Mains et coudes dégagés en avant du buste", "Toute la lame de la palette sur la glace, regard vers l'avant"],
      corrections: ["Chevilles raides, fesses en arrière → plier les chevilles d'abord, les genoux suivent", "Coudes collés au corps → mains devant, comme pour porter un plateau", "Dos rond → tête droite, regard loin"],
      materiel: "Aucun.",
      variantes: "Flexion groupée en tenant un palet sur la palette. Glisse à un pied en position de base.",
      schema: {
        vue: "moitie",
        objets: [
          J(30, 60), J(30, 100), J(30, 140), J(30, 180), J(30, 220), J(30, 260),
          L("glisse", [[42, 60], [130, 60]]), L("glisse", [[42, 140], [130, 140]]), L("glisse", [[42, 220], [130, 220]]),
          J(110, 100, "C"),
          T(150, 150, "Une main sur la bande : flexion groupée,\npuis glisse sur deux pieds en position", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_transfert_bande",
      nom: "Transfert du poids à la bande",
      categorie: "patinage",
      techniques: ["TS.P 2", "TF.M 1"],
      forme: "actif",
      duree: 5,
      objectif: "Comprendre la poussée sans avancer : le poids passe d'une jambe sur l'autre, la jambe de poussée finit tendue.",
      description:
        "Face à la bande, les deux mains dessus, en position de base :\n1. Transfert statique : on passe tout le poids sur la jambe gauche, la droite se tend sur le côté sans quitter la glace, on ramène ; puis l'inverse. Dix fois.\n2. Extension contre la bande : on pousse la bande avec les bras pendant qu'une jambe s'étend complètement sur le côté, flexion maintenue sur l'autre. Dix par jambe.\n3. Poussée dans le vide : même geste, mais le patin de poussée finit en l'air, flexion tenue sur la jambe d'appui, et revient se poser sous le corps.\n\nOn cherche l'extension complète — hanche, genou, cheville — et le retour du patin sous soi.",
      points_cles: ["Le poids sur la jambe qui glisse, genou devant la pointe du patin", "Extension complète de la jambe de poussée, sur le côté", "Retour du patin sous le corps, dans l'axe"],
      corrections: ["Poussée vers l'arrière → pousser vers le côté, à 45°", "La flexion disparaît pendant la poussée → garder le genou d'appui fléchi", "Retour du patin loin du corps → ramener sous la hanche"],
      materiel: "Aucun.",
      variantes: "Transfert au-dessus d'une crosse posée au sol. Puis en glisse : transfert en avançant.",
      schema: {
        vue: "moitie",
        objets: [
          J(28, 60), J(28, 100), J(28, 140), J(28, 180), J(28, 220), J(28, 260),
          L("patin", [[36, 60], [60, 60]]), L("patin", [[36, 100], [60, 100]]), L("patin", [[36, 140], [60, 140]]), L("patin", [[36, 180], [60, 180]]), L("patin", [[36, 220], [60, 220]]), L("patin", [[36, 260], [60, 260]]),
          J(120, 160, "C"),
          T(120, 60, "Face à la bande, mains dessus :\ntransfert, extension, poussée dans le vide", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_saut_pied_a_pied",
      nom: "Saut d'un pied sur l'autre",
      categorie: "patinage",
      techniques: ["TS.P 2", "TF.A 1"],
      forme: "vagues",
      duree: 5,
      objectif: "Maîtriser son poids en l'air et à la réception : sauter d'un pied sur l'autre en avançant.",
      description:
        "Sur la largeur, en glisse lente. On saute du pied droit pour se recevoir sur le pied gauche, genou fléchi, on glisse deux secondes, puis on saute du gauche sur le droit. La réception se fait sans bruit, sur toute la lame, en flexion.\n\nDeuxième passage : même chose avec une poussée sautée — on pousse sur le côté et le saut prolonge la poussée. Troisième : réception sur un pied puis glisse sur ce pied jusqu'à la ligne.",
      points_cles: ["Réception genou fléchi, sur toute la lame, sans bruit", "Le poids entièrement sur la jambe de réception", "Bras devant, buste stable"],
      corrections: ["Réception sur les deux pieds → un seul pied, l'autre reste en l'air", "Réception raide, bruyante → plier en arrivant, amortir", "Buste qui se penche en avant → tête haute, regard devant"],
      materiel: "Aucun.",
      variantes: "Saut avec quart de tour. Sauts d'un pied sur l'autre en cercle.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), J(60, 150), J(60, 220),
          L("patin", [[72, 80], [120, 72]]), L("patin", [[125, 72], [170, 88]]), L("patin", [[175, 88], [220, 72]]), L("patin", [[225, 72], [270, 80]]),
          L("patin", [[72, 150], [120, 142]]), L("patin", [[125, 142], [170, 158]]), L("patin", [[175, 158], [220, 142]]), L("patin", [[225, 142], [270, 150]]),
          L("patin", [[72, 220], [120, 212]]), L("patin", [[125, 212], [170, 228]]), L("patin", [[175, 228], [220, 212]]), L("patin", [[225, 212], [270, 220]]),
          T(60, 30, "Saut du droit sur le gauche, glisse, saut du gauche sur le droit", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_poussee_sur_palet",
      nom: "Poussée et recouvrement, pointe sur le palet",
      categorie: "patinage",
      techniques: ["TS.P 2"],
      forme: "actif",
      duree: 4,
      objectif: "Isoler le geste de la jambe de poussée : pousser, s'étendre, revenir — sans avancer.",
      description:
        "Un palet posé au sol devant chaque joueur. La pointe du patin d'appui reste posée sur le palet (il ne bouge pas). L'autre jambe fait la poussée complète sur le côté, jusqu'à l'extension, puis revient sous le corps en frôlant la glace. Dix de chaque côté.\n\nOn regarde la trajectoire du patin : il part sur le côté, revient droit sous la hanche, jamais en arrière.",
      points_cles: ["Extension complète : hanche, genou, cheville", "Retour du patin sous le corps, dans l'axe, lame près de la glace", "La jambe d'appui reste fléchie tout du long"],
      corrections: ["Le patin revient en traînant sur la glace → le lever d'un centimètre", "Retour croisé ou en V → revenir droit sous la hanche", "L'appui se redresse pendant la poussée → tenir la flexion"],
      materiel: "1 palet par joueur",
      variantes: "Même geste en marche arrière (coupe en C, pointe sur le palet).",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 80), P(96, 92), J(160, 80), P(166, 92), J(230, 80), P(236, 92),
          J(90, 160), P(96, 172), J(160, 160), P(166, 172), J(230, 160), P(236, 172),
          J(90, 240), P(96, 252), J(160, 240), P(166, 252), J(230, 240), P(236, 252),
          J(50, 160, "C"),
          T(60, 30, "La pointe du patin d'appui sur le palet, l'autre jambe pousse et revient", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_resistance_partenaire",
      nom: "Patiner contre résistance, puis en survitesse",
      categorie: "patinage",
      techniques: ["TS.P 2", "TS.P 11"],
      forme: "duo",
      duree: 6,
      objectif: "Sentir une vraie poussée : d'abord retenu par un partenaire, puis tiré plus vite qu'on ne sait aller.",
      description:
        "Par deux, une crosse tenue entre les deux (chacun un bout). Le premier patine en avant, le second, derrière, retient légèrement en marche arrière : le premier doit pousser fort, bas, complet. Une largeur, on inverse.\n\nPuis la survitesse : le premier est devant en marche avant et tire le second, qui patine en avant lui aussi, plus vite qu'il n'irait seul, et doit garder des poussées propres à cette vitesse. Résistance légère, adaptée : c'est un éducatif, pas un bras de fer.",
      points_cles: ["Contre résistance : poussées longues, basses, complètes", "En survitesse : ne pas se laisser porter, continuer à pousser", "Buste stable, mains sur la crosse sans tirer dessus"],
      corrections: ["Le retenu se redresse pour tirer → rester bas, pousser avec les jambes", "Le tiré glisse sans pousser → poussées plus courtes mais présentes", "Résistance trop forte → le partenaire ralentit à peine, il ne bloque pas"],
      materiel: "1 crosse par duo",
      variantes: "Pousser un partenaire qui freine doucement. Départs en V contre résistance.",
      schema: {
        vue: "entiere",
        objets: [
          J(80, 100), J(105, 100, "O", "", "bleu"), L("libre", [[88, 100], [97, 100]]), L("acceleration", [[115, 100], [300, 100]]),
          J(80, 200, "O", "", "bleu"), J(105, 200), L("libre", [[88, 200], [97, 200]]), L("acceleration", [[115, 200], [300, 200]]),
          T(120, 60, "Retenu par le partenaire : pousser fort et bas", "noir", "petit"),
          T(120, 250, "Tiré par le partenaire : garder des poussées propres", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_pompe_arriere",
      nom: "La pompe : coupes en C à deux pieds",
      categorie: "patinage",
      techniques: ["TS.P 3", "TS.P 4"],
      forme: "vagues",
      duree: 5,
      objectif: "Avancer en marche arrière avec les deux patins ensemble : la pompe, puis les C alternés.",
      description:
        "Sur la largeur, dos au sens de course, patins parallèles. La pompe : les deux patins s'écartent en même temps en dessinant chacun un C (talons vers l'extérieur), puis se rapprochent, et on recommence — comme une pompe. Genoux fléchis, on descend quand les patins s'écartent, on remonte un peu quand ils se rapprochent.\n\nPuis les C alternés : un patin dessine son C pendant que l'autre glisse, puis l'inverse. Courts et rapides sur une largeur, longs et amples sur la suivante.",
      points_cles: ["Talons vers l'extérieur, pression sur la carre interne jusqu'au talon", "Descendre à l'écartement, remonter au rapprochement — le rythme de la pompe", "Dos droit, regard par-dessus l'épaule"],
      corrections: ["Patins qui s'écartent sans revenir → refermer à chaque C", "Poussée avec la pointe seulement → utiliser la carre jusqu'au talon", "Buste cassé → se redresser, les hanches basses"],
      materiel: "Aucun.",
      variantes: "La pompe puis C alternés au sifflet. En cercle, C asymétriques (un côté seulement).",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), J(60, 150), J(60, 220),
          L("arriere", [[72, 80], [270, 80]]), L("arriere", [[72, 150], [270, 150]]), L("arriere", [[72, 220], [270, 220]]),
          T(60, 30, "Les deux patins dessinent un C en même temps, puis en alternance", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_huit_arriere",
      nom: "Le huit en marche arrière",
      categorie: "patinage",
      niveau: "intermediaire",
      techniques: ["TS.P 3", "TS.P 8", "TF.M 2"],
      forme: "groupes3",
      duree: 6,
      objectif: "Reculer en courbe des deux côtés : un huit autour de deux plots, carre interne puis carre externe.",
      description:
        "Deux plots à six mètres. Un huit en marche arrière autour des deux : dans chaque boucle, le patin extérieur pousse en C et l'intérieur guide. Première série : on privilégie la carre interne du patin extérieur. Deuxième série : on cherche la carre externe du patin intérieur, en se penchant plus.\n\nPar trois sur chaque huit, un départ toutes les cinq secondes.",
      points_cles: ["Regard par-dessus l'épaule intérieure, épaules vers l'intérieur", "Patin extérieur en avance, en carre interne", "Inclinaison vers l'intérieur du virage"],
      corrections: ["Le huit se fait sur deux patins parallèles sans inclinaison → se pencher, un patin devant l'autre", "Le buste tourne vers l'extérieur → regarder dans la boucle"],
      materiel: "2 plots par huit",
      variantes: "Avec palet. Un huit avant, un huit arrière, sans s'arrêter.",
      schema: {
        vue: "moitie",
        objets: [
          K(100, 90), K(100, 210),
          L("arriere", [...tour(100, 90, 45, Math.PI / 2, -1).slice(0, 8), ...tour(100, 210, 45, -Math.PI / 2, 1).slice(0, 8), [100, 135]]),
          J(170, 150), J(185, 155), J(200, 160),
          T(180, 60, "Autour des deux plots, en marche arrière", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_talons_pivot",
      nom: "Talons en pivot, rapide sur les talons",
      categorie: "patinage",
      techniques: ["TS.P 4"],
      forme: "vagues",
      duree: 4,
      objectif: "Le C-cut par le bout : sentir que la poussée finit sur le talon, patins écartés.",
      description:
        "Sur la largeur, patins écartés plus que les épaules. On avance en pivotant sur les talons : les pointes s'ouvrent et se ferment alternativement, les talons restent presque sur place — puis de plus en plus vite. Le corps reste bas et immobile, seuls les patins travaillent.\n\nPuis le « twist » : les deux patins pivotent ensemble, talons vers l'extérieur puis vers l'intérieur, et on avance sans lever les pieds. Puis on alterne twist et talons en pivot.",
      points_cles: ["Les talons restent au contact, la poussée finit dessus", "Bas et stable, le haut du corps ne bouge pas", "Rapide : la fréquence fait avancer"],
      corrections: ["Les pieds se lèvent → tout se fait sans quitter la glace", "Le buste se balance → mains devant, regard fixe"],
      materiel: "Aucun.",
      variantes: "En marche arrière. Avec palet.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), J(60, 150), J(60, 220),
          L("conduite", [[72, 80], [270, 80]]), L("conduite", [[72, 150], [270, 150]]), L("conduite", [[72, 220], [270, 220]]),
          T(60, 30, "Patins écartés : pivoter sur les talons, de plus en plus vite", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_godille",
      nom: "La godille et le pied d'appel",
      categorie: "patinage",
      techniques: ["TS.P 7", "TF.M 2"],
      forme: "vagues",
      duree: 5,
      objectif: "Engager le virage avec le patin intérieur : la godille, puis l'alternance des pieds d'appel entre les crosses.",
      description:
        "La godille : en glisse sur deux pieds, on serpente en basculant d'une carre à l'autre, sans lever les patins, le patin intérieur au virage légèrement devant. De plus en plus serré.\n\nPuis des crosses posées au sol en ligne, à trois mètres : on passe entre elles en changeant de pied d'appel à chaque crosse — le patin intérieur au prochain virage engage, l'autre suit. Deux largeurs, puis avec palet.",
      points_cles: ["Le patin intérieur engage le virage, légèrement en avance", "Compression à l'entrée de chaque virage, genoux fléchis", "Crosse et regard vers la sortie du virage"],
      corrections: ["Virage engagé avec le patin extérieur → avancer le patin intérieur d'abord", "Regard bas dans le virage → regarder la sortie", "Godille à plat, sans inclinaison → plier et se pencher"],
      materiel: "5 crosses par file",
      variantes: "Virage à 360° autour d'un plot au milieu. Godille en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), L("libre", [[72, 80], [100, 65], [130, 95], [160, 65], [190, 95], [220, 65], [250, 80]]),
          J(60, 200), L("libre", [[100, 185], [100, 215]], "orange"), L("libre", [[150, 185], [150, 215]], "orange"), L("libre", [[200, 185], [200, 215]], "orange"), L("libre", [[250, 185], [250, 215]], "orange"),
          L("patin", [[72, 200], [100, 180], [150, 220], [200, 180], [250, 220], [280, 200]]),
          T(60, 30, "Godille sur deux pieds, puis pied d'appel alterné entre les crosses", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_virage_360",
      nom: "Virage à 360° autour du plot",
      categorie: "patinage",
      techniques: ["TS.P 7"],
      forme: "parcours",
      duree: 5,
      objectif: "Un tour complet autour d'un plot sans s'arrêter, dans les deux sens, puis avec palet.",
      description:
        "Trois plots sur la largeur, à cinq mètres. On arrive sur le premier, tour complet autour dans le sens horaire, on repart vers le deuxième, tour complet dans l'autre sens, troisième plot, sens horaire. Retour par le côté.\n\nOn cherche à garder de la vitesse dans le tour : compression à l'entrée, patins décalés, on ressort en poussant. Puis avec palet, le palet à l'extérieur du tour.",
      points_cles: ["Compression à l'entrée, patin intérieur en avance", "Carre interne du patin extérieur, carre externe de l'intérieur", "Ressortir du tour en poussant"],
      corrections: ["Arrêt au milieu du tour → réduire le rayon plutôt que de freiner", "Tour à plat, sans se pencher → main basse vers la glace"],
      materiel: "3 plots par file\n1 palet par joueur",
      variantes: "Deux tours par plot. Tour à 360° en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          K(100, 150), K(170, 150), K(240, 150),
          J(45, 150), J(30, 150),
          L("patin", [[57, 150], [85, 150], ...tour(100, 150, 20, Math.PI, 1), [155, 150], ...tour(170, 150, 20, Math.PI, -1), [225, 150], ...tour(240, 150, 20, Math.PI, 1), [280, 150]]),
          T(60, 60, "Tour complet autour de chaque plot, en changeant de sens", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_ciseaux",
      nom: "Petits ciseaux, grands ciseaux",
      categorie: "patinage",
      techniques: ["TS.P 9", "TS.P 10"],
      forme: "vagues",
      duree: 5,
      objectif: "Le mouvement de croisé isolé : les jambes se croisent et se décroisent sur une ligne, sans virage.",
      description:
        "Sur une ligne, de côté, face au coach. Les petits ciseaux : le pied extérieur passe devant l'autre, puis l'autre ressort sur le côté, petits pas rapides, on avance latéralement. Une largeur vers la droite, une vers la gauche.\n\nLes grands ciseaux : même chose en grand, avec une vraie glisse sur chaque pied et une montée de genou à chaque croisement. Puis les grands ciseaux avec balancement des bras, puis en marche arrière.",
      points_cles: ["Le pied extérieur croise devant, le pied intérieur pousse en carre externe", "Épaules face au coach, ligne des épaules horizontale", "Grands ciseaux : montée de genou, glisse sur chaque pied"],
      corrections: ["Le pied croise derrière → toujours devant", "Le corps se tourne dans le sens du déplacement → rester de face", "Pas de glisse entre les croisements → laisser rouler"],
      materiel: "Aucun.",
      variantes: "Ciseaux avec crosse au-dessus de la tête. Ciseaux en arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 70), J(80, 120), J(80, 170), J(80, 220),
          L("patin", [[92, 70], [250, 70]]), L("patin", [[92, 120], [250, 120]]), L("patin", [[92, 170], [250, 170]]), L("patin", [[92, 220], [250, 220]]),
          J(160, 270, "C"),
          T(60, 30, "De côté, face au coach : le pied extérieur croise devant", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_croisement_crosse",
      nom: "Croisement au-dessus de la crosse",
      categorie: "patinage",
      techniques: ["TS.P 9", "TF.A 2"],
      forme: "duo",
      duree: 4,
      objectif: "Le premier croisé, sans peur : à l'arrêt, une crosse au sol, le pied passe par-dessus.",
      description:
        "Par deux, une crosse posée au sol entre les deux, perpendiculaire. À l'arrêt, une main sur l'épaule du partenaire si besoin : le pied extérieur passe par-dessus la crosse et se pose de l'autre côté, en carre interne ; le poids passe dessus ; l'autre pied ressort et se repose à côté. Dix fois dans chaque sens, sans reprise d'appui entre les deux.\n\nPuis la même chose en glissant lentement le long de la crosse, puis sans la crosse, sur un cercle.",
      points_cles: ["Le pied qui croise se pose en carre interne, le poids passe dessus tout de suite", "Le pied intérieur ressort sur le côté, en carre externe", "Buste droit, épaules horizontales"],
      corrections: ["Le pied croise derrière → toujours devant, par-dessus la crosse", "Poids resté sur le pied intérieur → transférer entièrement sur celui qui a croisé"],
      materiel: "1 crosse par duo",
      variantes: "Croisement sans reprise d'appui, orteils vers l'intérieur. Fente latérale au-dessus de la crosse.",
      schema: {
        vue: "moitie",
        objets: [
          J(100, 70), J(140, 70, "O", "", "bleu"), L("libre", [[120, 55], [120, 85]], "orange"),
          J(100, 150), J(140, 150, "O", "", "bleu"), L("libre", [[120, 135], [120, 165]], "orange"),
          J(100, 230), J(140, 230, "O", "", "bleu"), L("libre", [[120, 215], [120, 245]], "orange"),
          T(170, 150, "Une crosse au sol entre les deux :\nle pied extérieur passe par-dessus", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_ski_jump",
      nom: "Le ski jump : freiner à deux pieds",
      categorie: "patinage",
      techniques: ["TS.P 15", "TS.P 18"],
      forme: "vagues",
      duree: 5,
      objectif: "Mettre les deux patins en travers en même temps, par un petit saut : le freinage sans réfléchir.",
      description:
        "À l'arrêt d'abord : petit saut sur place, réception avec les deux patins tournés d'un quart de tour, en travers, genoux fléchis. Dix fois à gauche, dix à droite. Puis en ligne : glisse lente, saut, réception en travers — on dérape et on s'arrête. Puis en cercle.\n\nEnsuite sans saut : allègement, rotation des deux patins ensemble, dérapage latéral sur les carres internes, en pas chassés.",
      points_cles: ["Allègement puis rotation des deux patins ensemble", "Réception genoux fléchis, poids réparti sur les deux patins", "Épaules qui restent face au sens de course : rotation inverse du buste"],
      corrections: ["Un patin tourne avant l'autre → les deux ensemble, par le saut", "Réception jambes tendues → plier en arrivant", "Le buste tourne avec les patins → épaules de face"],
      materiel: "Aucun.",
      variantes: "Ski jump en marche arrière (freinage parallèle arrière). Au sifflet, côté annoncé.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), J(60, 150), J(60, 220),
          L("freinage", [[72, 80], [150, 80]]), L("freinage", [[165, 80], [240, 80]]),
          L("freinage", [[72, 150], [150, 150]]), L("freinage", [[165, 150], [240, 150]]),
          L("freinage", [[72, 220], [150, 220]]), L("freinage", [[165, 220], [240, 220]]),
          T(60, 30, "Glisse, petit saut, réception les deux patins en travers", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_derapage_un_pied",
      nom: "Dérapage sur un pied, carre interne puis externe",
      categorie: "patinage",
      niveau: "intermediaire",
      techniques: ["TS.P 15", "TF.M 2"],
      forme: "vagues",
      duree: 5,
      objectif: "Décomposer le freinage : un seul patin qui dérape, sur sa carre interne, puis sur sa carre externe.",
      description:
        "Glisse sur deux pieds, puis on lève légèrement un patin et on met l'autre en travers, carre interne, en appuyant progressivement : dérapage sur un pied jusqu'à l'arrêt. Cinq de chaque pied.\n\nPuis la carre externe : le patin en travers, mais le poids sur l'extérieur de la lame, corps penché de l'autre côté — c'est le rôle du second patin dans le freinage complet. Plus difficile : on commence lentement.",
      points_cles: ["Le patin en travers, pression progressive", "Carre interne : pencher vers l'intérieur ; carre externe : pencher vers l'extérieur", "Flexion de la jambe de dérapage pour absorber"],
      corrections: ["Le patin dérape puis accroche → pression plus progressive, moins d'angle", "Carre externe impossible → réduire la vitesse, incliner plus le patin avant de charger"],
      materiel: "Aucun.",
      variantes: "Enchaîner : dérapage carre interne d'un pied, puis carre externe de l'autre = freinage complet.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 80), J(60, 150), J(60, 220),
          L("glisse", [[72, 80], [150, 80]]), L("freinage", [[155, 80], [220, 80]]),
          L("glisse", [[72, 150], [150, 150]]), L("freinage", [[155, 150], [220, 150]]),
          L("glisse", [[72, 220], [150, 220]]), L("freinage", [[155, 220], [220, 220]]),
          T(60, 30, "Glisse, puis un seul patin en travers qui dérape", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_saut_plonge",
      nom: "Départ en pointe et saut en longueur",
      categorie: "patinage",
      techniques: ["TS.P 11", "TF.A 1"],
      forme: "vagues",
      duree: 5,
      objectif: "Le démarrage part des pointes et va vers l'avant : le sentir par un saut.",
      description:
        "À la bande, face au jeu : on se met sur les pointes des patins, talons resserrés, genoux fléchis, on tient trois secondes. Puis depuis cet équilibre, un saut en longueur vers l'avant, réception sur les deux pieds fléchis, et on enchaîne trois poussées courtes. Cinq fois.\n\nPuis le saut plongé : le saut se prolonge par une première poussée longue vers l'avant, sans se redresser. C'est le démarrage en V, en exagéré.",
      points_cles: ["Talons resserrés, pointes ouvertes, déséquilibre vers l'avant", "Première poussée longue vers l'avant, pas vers le haut", "Premiers appuis courts et rapides, genoux qui montent"],
      corrections: ["On se grandit sur les pointes → rester fléchi, le déséquilibre fait partir", "Saut vers le haut → sauter loin, pas haut", "Foulées longues dès le départ → trois appuis courts d'abord"],
      materiel: "Aucun.",
      variantes: "Départ en pointe au sifflet, sans saut. Partir d'un équilibre en pointe sur un pied.",
      schema: {
        vue: "moitie",
        objets: [
          J(30, 80), J(30, 150), J(30, 220),
          L("acceleration", [[42, 80], [160, 80]]), L("acceleration", [[42, 150], [160, 150]]), L("acceleration", [[42, 220], [160, 220]]),
          T(60, 30, "À la bande, sur les pointes : saut en longueur, puis trois poussées", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_pointe_talon_z",
      nom: "Pointe-talon et le Z",
      categorie: "maniement",
      techniques: ["TS.M 1", "TS.M 2"],
      forme: "actif",
      duree: 5,
      objectif: "Manier avec la pointe et le talon de la palette, pas seulement à plat : le palet devient plus vif.",
      description:
        "Chacun avec un palet, à l'arrêt. Pointe-talon : on tire le palet vers soi avec la pointe de la palette, on le repousse avec le talon, dans le plan avant coup droit. Trente secondes. Puis le même geste dans le plan arrière, puis en revers.\n\nLe Z : le palet dessine un Z devant soi — latéral, diagonale vers l'arrière, latéral — en enchaînant pointe et talon. Puis en glissant.",
      points_cles: ["Les poignets tournent la palette : pointe pour tirer, talon pour pousser", "Mains devant, coudes dégagés, le palet reste près", "Tête haute dès que le geste tient"],
      corrections: ["Palette toujours à plat → tourner les poignets, ouvrir et fermer", "Le Z devient un arc de cercle → trois segments nets, un arrêt au bout de chacun"],
      materiel: "1 palet par joueur",
      variantes: "En marche arrière. À une main. Avec une balle pour aller plus vite.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 90), P(100, 102), J(170, 90), P(180, 102), J(250, 90), P(260, 102),
          J(90, 190), P(100, 202), J(170, 190), P(180, 202), J(250, 190), P(260, 202),
          T(60, 30, "Tirer avec la pointe, pousser avec le talon ; puis le Z", "noir", "petit"),
          L("conduite", [[120, 250], [160, 250]]), L("conduite", [[160, 250], [130, 275]]), L("conduite", [[130, 275], [170, 275]]), T(180, 262, "Z", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_deux_palets",
      nom: "Maniement à deux palets",
      categorie: "maniement",
      techniques: ["TS.M 1"],
      forme: "actif",
      duree: 4,
      objectif: "Deux palets sur la palette : forcer la douceur des mains et la largeur du geste.",
      description:
        "Deux palets côte à côte devant chaque joueur. On les manie ensemble, comme s'ils n'en faisaient qu'un : balayages larges d'abord, puis courts, puis coup droit-revers. Ils doivent rester collés. Trente secondes par consigne.\n\nPuis avec trois palets en ligne pour les plus habiles, puis en glissant lentement.",
      points_cles: ["Palette bien à plat, en contact avec les deux palets", "Geste ample et doux, pas de coups", "Le regard sur le coach, pas sur les palets"],
      corrections: ["Les palets se séparent → ralentir, palette à plat, moins de force", "Le geste se rétrécit → revenir aux balayages larges"],
      materiel: "2 palets par joueur",
      variantes: "Trois palets. Deux palets en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 80), P(97, 92), P(105, 92), J(170, 80), P(177, 92), P(185, 92), J(250, 80), P(257, 92), P(265, 92),
          J(90, 160), P(97, 172), P(105, 172), J(170, 160), P(177, 172), P(185, 172), J(250, 160), P(257, 172), P(265, 172),
          J(90, 240), P(97, 252), P(105, 252), J(170, 240), P(177, 252), P(185, 252), J(250, 240), P(257, 252), P(265, 252),
          J(50, 160, "C"),
        ],
      },
    }),

    ex({
      id: "cat_educ_entre_les_jambes",
      nom: "Le palet entre les jambes, par l'avant et par l'arrière",
      categorie: "maniement",
      techniques: ["TS.M 2"],
      forme: "actif",
      duree: 5,
      objectif: "Faire passer le palet d'un côté à l'autre entre ses patins : le geste qui sauve un palet coincé.",
      description:
        "À l'arrêt, patins écartés. Par l'avant : le palet est devant à droite, on le pousse entre les patins vers la gauche, on le récupère en revers derrière la jambe gauche et on le ramène devant. Par l'arrière : le palet est derrière à droite, on le glisse entre les patins vers l'avant gauche. Dix fois chaque, puis en glissant.\n\nPuis le grand huit : le palet fait le tour d'un patin, passe entre les jambes, fait le tour de l'autre.",
      points_cles: ["Patins écartés, genoux fléchis : il faut de la place", "Le buste tourne pour aller chercher le palet derrière, pas les patins", "Le palet est poussé, pas tapé"],
      corrections: ["Les patins tournent avec le palet → patins fixes, buste qui pivote", "Le palet part trop loin derrière → petites touches, palette au contact"],
      materiel: "1 palet par joueur",
      variantes: "Entre les jambes en glisse avant, puis avec le patin (passer le palet avec le pied).",
      schema: {
        vue: "moitie",
        objets: [
          J(100, 100), P(112, 90), L("conduite", [[112, 92], [100, 112], [88, 96]]),
          J(180, 100), P(192, 90), L("conduite", [[192, 92], [180, 112], [168, 96]]),
          J(100, 200), P(112, 210), L("conduite", [[112, 208], [100, 188], [88, 204]]),
          J(180, 200), P(192, 210), L("conduite", [[192, 208], [180, 188], [168, 204]]),
          T(60, 40, "Par l'avant, par l'arrière, puis le grand huit", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_lever_rabattre",
      nom: "Lever et rabattre le palet",
      categorie: "maniement",
      techniques: ["TS.M 4"],
      forme: "actif",
      duree: 4,
      objectif: "Soulever le palet avec la palette et le rabattre à plat : le contrôle qui prépare les passes et tirs levés.",
      description:
        "À l'arrêt, un palet. La palette se glisse sous le bord du palet, un petit coup de poignet le lève de quelques centimètres, et on le rabat aussitôt à plat avec le dessus de la palette. Dix fois. Puis on le lève un peu plus haut, puis on le fait retomber sur la palette et on l'y garde une seconde.\n\nPuis lever, rabattre, et repartir en conduite, sans temps mort.",
      points_cles: ["Palette sous le palet, poignets qui tournent, pas les bras", "Rabattre tout de suite, à plat", "Les mains restent devant le corps"],
      corrections: ["Le palet saute trop haut et part → moins d'amplitude, plus de poignets", "On tape le palet au lieu de le glisser → la palette se glisse dessous"],
      materiel: "1 palet par joueur",
      variantes: "Jongler deux fois sur la palette. Lever par-dessus une crosse au sol.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 90), P(100, 102), J(170, 90), P(180, 102), J(250, 90), P(260, 102),
          J(90, 180), P(100, 192), J(170, 180), P(180, 192), J(250, 180), P(260, 192),
          J(50, 135, "C"),
          T(60, 30, "Glisser la palette sous le palet, lever, rabattre à plat", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_educ_inversion_prise",
      nom: "Inversion de la prise de crosse",
      categorie: "maniement",
      techniques: ["TS.M 1", "TF.A 2"],
      forme: "actif",
      duree: 4,
      objectif: "Changer de main sur la crosse sans perdre le palet : de la dextérité, et un palet protégé de l'autre côté.",
      description:
        "À l'arrêt, un palet. On manie en coup droit, puis on inverse les mains (la main du bas devient la main du haut) et on continue de manier de l'autre côté, puis on revient. Dix inversions. Puis en glissant lentement en avant.\n\nCe n'est pas un geste de match pour tout le monde, mais il apprend aux deux mains à travailler — et il amuse.",
      points_cles: ["L'inversion se fait pendant que le palet est immobile devant soi", "Les deux mains gardent la crosse dégagée du corps", "Le geste est lent avant d'être rapide"],
      corrections: ["Le palet part pendant l'inversion → l'arrêter d'abord, inverser, repartir", "Le corps se tourne → seules les mains changent"],
      materiel: "1 palet par joueur",
      variantes: "Inversion en glisse avant. Inversion puis passe de l'autre côté.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 90), P(100, 102), J(170, 90), P(180, 102), J(250, 90), P(260, 102),
          J(90, 180), P(100, 192), J(170, 180), P(180, 192), J(250, 180), P(260, 192),
          J(50, 135, "C"),
          T(60, 30, "Manier, inverser les mains, manier de l'autre côté, revenir", "noir", "petit"),
        ],
      },
    }),

    /* ── Huitième fournée : passes, tirs, jeux et gardien, dans l'esprit
       des catalogues d'exercices que tout le monde connaît. ── */

    ex({
      id: "cat_passes_largeur_mouvement",
      nom: "Passes en mouvement sur la largeur",
      categorie: "echauffement",
      forme: "duo",
      duree: 6,
      objectif: "Se passer le palet en patinant côte à côte : l'échauffement qui réveille les mains et les jambes.",
      description:
        "Par deux, côte à côte à cinq mètres, on traverse la largeur en se faisant des passes, sans s'arrêter. Aller, demi-tour à la bande, retour. Deux minutes en avant, une minute avec réception en revers obligatoire, une minute où le receveur est en marche arrière.\n\nVagues de quatre duos, la suivante part quand la précédente a atteint la bande.",
      points_cles: ["Passer devant le partenaire, dans sa course", "Palette au sol, montrée, avant que le palet parte", "Rester à hauteur l'un de l'autre"],
      corrections: ["Le duo s'arrête pour passer → les pieds continuent", "Passe dans les patins → viser un mètre devant la palette"],
      materiel: "1 palet par duo",
      variantes: "Par trois. Une passe puis un tour sur soi-même.",
      schema: {
        vue: "moitie",
        objets: [
          J(40, 60), J(40, 110, "O", "", "bleu"), L("patin", [[52, 60], [270, 60]]), L("patin", [[52, 110], [270, 110]], "bleu"),
          L("passe", [[80, 66], [130, 104]], "rouge"), L("passe", [[150, 104], [200, 66]], "rouge"), L("passe", [[215, 66], [260, 104]], "rouge"),
          J(40, 190), J(40, 240, "O", "", "bleu"), L("patin", [[52, 190], [270, 190]]), L("patin", [[52, 240], [270, 240]], "bleu"),
          L("passe", [[80, 196], [130, 234]], "rouge"), L("passe", [[150, 234], [200, 196]], "rouge"), L("passe", [[215, 196], [260, 234]], "rouge"),
        ],
      },
    }),

    ex({
      id: "cat_departs_varies",
      nom: "Départs variés : à genoux, assis, dos au jeu",
      categorie: "echauffement",
      techniques: ["TS.P 11", "TS.P 1"],
      forme: "vagues",
      duree: 5,
      objectif: "Se relever et partir vite depuis n'importe quelle position : utile en match, et ça réveille.",
      description:
        "Sur la ligne de but, tous alignés. Le coach annonce la position de départ : un genou au sol, les deux genoux, assis, allongé sur le ventre, dos au jeu. Au sifflet, on se relève et on sprinte jusqu'à la bleue, on freine, on revient au pas.\n\nDix départs. Le dernier : départ au choix du joueur, le plus original gagne.",
      points_cles: ["Se relever par un genou, un patin, on pousse", "Les premiers pas courts et rapides, sur les pointes", "Freiner sur la ligne, pas après"],
      corrections: ["On se relève en s'appuyant sur les mains → un genou puis un patin, mains sur le genou", "Premières foulées longues → courtes et rapides d'abord"],
      materiel: "1 sifflet",
      variantes: "Avec palet posé devant soi à prendre au départ. Départ en marche arrière.",
      schema: {
        vue: "entiere",
        objets: [
          J(55, 70), J(55, 110), J(55, 150), J(55, 190), J(55, 230),
          L("acceleration", [[68, 70], [220, 70]]), L("acceleration", [[68, 150], [220, 150]]), L("acceleration", [[68, 230], [220, 230]]),
          J(300, 150, "C"),
          T(90, 40, "À genoux, assis, allongé, dos au jeu : on se relève et on sprinte", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_reception_patins",
      nom: "Réception dans les patins",
      categorie: "passe",
      forme: "duo",
      duree: 6,
      objectif: "Une passe mal donnée n'est pas perdue : contrôler le palet avec le patin et le ramener sur la palette.",
      description:
        "Par deux, face à face à huit mètres. Le passeur vise volontairement les patins de son partenaire. Le receveur stoppe le palet avec l'intérieur du patin (lame tournée vers l'avant), le pousse vers sa palette et renvoie. Alterner pied gauche et pied droit.\n\nPuis en mouvement : le receveur glisse lentement, la passe arrive dans les patins, contrôle, palette, renvoi.",
      points_cles: ["Le patin s'ouvre pour faire barrage, la lame de biais", "Pousser le palet du patin vers la palette d'un seul geste", "Ne pas regarder son pied : sentir"],
      corrections: ["Le palet passe sous le patin → lame plus fermée, patin bien à plat", "Le receveur s'arrête pour contrôler → continuer à glisser"],
      materiel: "1 palet par duo",
      variantes: "Passe dans les patins puis tir. Contrôle du patin en marche arrière.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 80), J(190, 80, "O", "", "bleu"), L("passe", [[102, 84], [182, 90]], "rouge"),
          J(90, 150), J(190, 150, "O", "", "bleu"), L("passe", [[102, 154], [182, 160]], "rouge"),
          J(90, 220), J(190, 220, "O", "", "bleu"), L("passe", [[102, 224], [182, 230]], "rouge"),
          T(60, 30, "Passe volontairement dans les patins, contrôle du pied, retour palette", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passes_levees",
      nom: "Passes levées par-dessus la crosse",
      categorie: "passe",
      techniques: ["TS.M 4"],
      forme: "duo",
      duree: 6,
      objectif: "La passe qui saute un obstacle : lever le palet, le faire retomber à plat sur la palette du partenaire.",
      description:
        "Par deux, face à face à sept mètres, une crosse posée au sol entre les deux. On se fait des passes par-dessus la crosse : le palet part de l'arrière de la palette, roule vers la pointe, et les poignets tournent pour le lever. Il doit retomber à plat, pas sur la tranche.\n\nDeux minutes en coup droit, une en revers. Puis on écarte à dix mètres.",
      points_cles: ["Le palet roule du talon vers la pointe, la palette tourne à la fin", "Bas et plat : deux crosses de hauteur suffisent", "Recevoir en amortissant, palette légèrement inclinée"],
      corrections: ["Le palet part sur la tranche → plus de rotation de palette, moins de force", "Trop haut → geste plus long, moins sec"],
      materiel: "1 palet par duo\n1 crosse par duo",
      variantes: "Passe levée en mouvement. Passe levée par-dessus un partenaire à genoux.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 80), J(200, 80, "O", "", "bleu"), L("libre", [[140, 65], [140, 95]], "orange"), L("echange", [[92, 80], [188, 80]], "vert"),
          J(80, 150), J(200, 150, "O", "", "bleu"), L("libre", [[140, 135], [140, 165]], "orange"), L("echange", [[92, 150], [188, 150]], "vert"),
          J(80, 220), J(200, 220, "O", "", "bleu"), L("libre", [[140, 205], [140, 235]], "orange"), L("echange", [[92, 220], [188, 220]], "vert"),
        ],
      },
    }),

    ex({
      id: "cat_horloge_passes",
      nom: "L'horloge",
      categorie: "passe",
      forme: "groupes3",
      duree: 6,
      objectif: "Recevoir et redonner vite, dans toutes les directions : le joueur au centre tourne comme une aiguille.",
      description:
        "Six joueurs en cercle sur le cercle de mise au jeu, un au centre. Chacun du bord a un palet. Le centre reçoit du premier, lui redonne, se tourne vers le deuxième, reçoit, redonne… un tour complet en une touche par passe, puis l'inverse. On change le centre toutes les trente secondes.\n\nLes passeurs du bord passent dès que le centre montre sa palette.",
      points_cles: ["Une touche : recevoir et redonner dans le même mouvement", "Pivoter les patins vers le passeur suivant avant que le palet arrive", "Palette au sol, montrée"],
      corrections: ["Le centre stoppe le palet puis passe → une seule touche", "Le centre reste face à un seul côté → pivoter à chaque passe"],
      materiel: "6 palets par cercle",
      variantes: "Le centre en marche arrière. Deux joueurs au centre qui se croisent.",
      schema: {
        vue: "moitie",
        objets: [
          ...[0, 1, 2, 3, 4, 5].map((i) => J(Math.round(100 + 52 * Math.cos((i * Math.PI) / 3)), Math.round(150 + 52 * Math.sin((i * Math.PI) / 3)))),
          ...[0, 1, 2, 3, 4, 5].map((i) => P(Math.round(100 + 42 * Math.cos((i * Math.PI) / 3)), Math.round(150 + 42 * Math.sin((i * Math.PI) / 3)))),
          J(100, 150, "O", "", "bleu"),
          L("echange", [[112, 150], [140, 150]], "rouge"),
          T(175, 60, "Le centre reçoit et redonne,\nà chacun tour à tour", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_deux_files_croisees",
      nom: "Deux files croisées, passe et tir",
      categorie: "tir",
      forme: "vagues",
      duree: 10,
      objectif: "Le grand classique : deux files aux bleues, une passe croisée, un tir en mouvement, et ça tourne sans temps mort.",
      description:
        "Deux files dans les coins de la ligne bleue, palets dans une seule file. Le premier de la file avec palets part en diagonale vers le milieu ; le premier de l'autre file part en même temps et croise ; passe au croisement ; le receveur file vers la cage et tire. Le passeur va au rebond. Chacun change de file.\n\nDépart tous les huit secondes. Changer la file qui a les palets à mi-temps.",
      points_cles: ["Partir en même temps, se croiser au milieu", "La passe juste avant le croisement, devant le partenaire", "Tirer en mouvement, le passeur suit au rebond"],
      corrections: ["Collision au croisement → le porteur passe derrière", "Le receveur ralentit pour recevoir → garder la vitesse, la passe arrive devant"],
      materiel: "20 palets",
      variantes: "Passe en retour au passeur qui tire. Deux passes avant le tir.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(240, 50), J(260, 44), P(230, 56), J(240, 250), J(260, 256),
          L("conduite", [[228, 60], [170, 120]]), L("patin", [[232, 244], [170, 180], [120, 150]]),
          L("passe", [[165, 125], [130, 145]], "rouge"), L("tir", [[118, 148], [48, 150]], "rouge"),
          T(150, 150, "Passe au croisement, tir en mouvement", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_apres_pivot",
      nom: "Tir après pivot",
      categorie: "tir",
      niveau: "intermediaire",
      techniques: ["TS.P 20"],
      forme: "vagues",
      duree: 8,
      objectif: "Reculer, pivoter, recevoir, tirer : le geste du défenseur qui arrive dans le jeu.",
      description:
        "Une file à la ligne rouge, un passeur dans le coin avec les palets. Le premier part en marche arrière vers la bleue, pivote en avant au coup de sifflet, reçoit la passe du coin dans sa course et tire du haut du cercle. Il récupère son palet et devient passeur.\n\nPivot vers la gauche pendant cinq minutes, vers la droite ensuite.",
      points_cles: ["Le pivot part des hanches, sans phase de glisse", "Palette au sol dès la sortie du pivot", "Tir en mouvement, sans reprise"],
      corrections: ["Arrêt avant le pivot → pivoter en pleine glisse", "Pivot puis glisse à deux pieds → pousser dès la sortie"],
      materiel: "20 palets",
      variantes: "Passe avant le pivot, en marche arrière. Deux joueurs, passe croisée après pivot.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"), J(60, 250, "O", "", "bleu"), P(70, 258),
          J(300, 150), J(285, 160),
          L("arriere", [[290, 148], [230, 135]]), L("pivot", [[228, 135], [190, 125], [150, 120]]),
          L("passe", [[72, 244], [145, 128]], "rouge"), L("tir", [[142, 122], [48, 148]], "rouge"),
        ],
      },
    }),

    ex({
      id: "cat_tirs_deux_cages_travers",
      nom: "Tirs alternés sur deux cages en travers",
      categorie: "tir",
      forme: "vagues",
      duree: 8,
      objectif: "Deux fois plus de tirs : deux cages face à face sur la largeur, deux files qui tirent en alternance.",
      description:
        "Deux cages mobiles dos aux bandes, face à face sur la largeur d'une zone, un gardien dans chaque (ou cages vides). Deux files au milieu, chacune face à une cage, palets au sol. Le premier de chaque file part avec un palet, deux poussées, tir, puis récupère et rejoint l'autre file.\n\nOn tire à tour de rôle, une file puis l'autre, pour que le coach voie chaque tir.",
      points_cles: ["Deux poussées puis tir, pas plus", "Viser un endroit annoncé", "Récupérer son palet et changer de file sans traîner"],
      corrections: ["Tirs de trop près, sans élan → partir deux mètres plus loin", "Tout le monde tire en même temps → à tour de rôle"],
      materiel: "2 cages mobiles\n20 palets",
      variantes: "Passe du coach avant le tir. Tir en revers d'un côté, coup droit de l'autre.",
      schema: {
        vue: "moitie",
        objets: [
          CG(150, 28, "bas"), CG(150, 272, "haut"),
          J(130, 140), J(115, 135), P(140, 130), L("conduite", [[145, 128], [150, 80]]), L("tir", [[150, 75], [150, 38]], "rouge"),
          J(170, 160), J(185, 165), P(160, 170), L("conduite", [[155, 172], [150, 220]]), L("tir", [[150, 225], [150, 262]], "rouge"),
          J(240, 150, "C"),
        ],
      },
    }),

    ex({
      id: "cat_un_contre_un_bleue",
      nom: "Un contre un depuis la bleue",
      categorie: "jeu",
      forme: "vagues",
      duree: 8,
      objectif: "L'attaquant veut passer, le défenseur veut l'empêcher : le duel complet, jusqu'au tir.",
      description:
        "Attaquant avec palet à la ligne bleue, défenseur trois mètres devant lui en marche arrière, gardien en cage. Au sifflet, l'attaquant essaie de passer et de tirer ; le défenseur recule, crosse au sol, et l'oriente vers l'extérieur. Le duel finit sur un tir, une récupération ou un palet sorti.\n\nOn tourne : l'attaquant devient défenseur, le défenseur va dans la file.",
      points_cles: ["Attaquant : de la vitesse et une décision — feinte ou tir", "Défenseur : reculer à la vitesse de l'attaquant, crosse au sol dans la ligne du palet", "Pas de charge, jamais"],
      corrections: ["Le défenseur se jette → attendre que l'attaquant se décide", "L'attaquant ralentit devant le défenseur → garder la vitesse, aller à l'extérieur"],
      materiel: "20 palets",
      variantes: "Le défenseur part avec deux mètres de retard. Un contre un puis le défenseur contre-attaque sur l'autre cage.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(250, 150), P(238, 156), J(200, 150, "O", "", "bleu"),
          L("conduite", [[236, 156], [180, 130], [120, 110]]), L("arriere", [[190, 148], [110, 140]], "bleu"),
          L("tir", [[115, 112], [48, 146]], "rouge"),
          J(280, 200), J(295, 210),
        ],
      },
    }),

    ex({
      id: "cat_bataille_devant_cage",
      nom: "La bataille devant la cage",
      categorie: "jeu",
      forme: "groupes3",
      duree: 6,
      objectif: "Se battre pour un palet libre devant la cage : deux contre deux, sans charge, tout dans les jambes et la crosse.",
      description:
        "Deux attaquants et deux défenseurs dans l'enclave, gardien en cage. Le coach tire ou lance un palet dans le tas ; les attaquants essaient de marquer, les défenseurs de sortir le palet du cercle. Le point finit au but, à la sortie du palet, ou après quinze secondes.\n\nQuatre points, puis on inverse les rôles, puis on change les quatre.",
      points_cles: ["Crosse au sol, jambes fléchies, on se place avant que le palet arrive", "Attaquants : le premier tire, le second va au rebond", "Défenseurs : sortir le palet vers la bande, pas vers le milieu"],
      corrections: ["Tout le monde court après le palet → un joueur dessus, l'autre se place", "Palet dégagé vers le milieu → toujours vers la bande"],
      materiel: "20 palets\nChasubles",
      variantes: "Trois contre trois. Le coach lance le palet dans un coin.",
      schema: {
        vue: "moitie",
        objets: [
          J(46, 150, "G"),
          J(90, 120, "X", "", "rouge"), J(110, 180, "X", "", "rouge"), J(75, 150, "O", "", "bleu"), J(120, 140, "O", "", "bleu"),
          J(220, 150, "C"), P(230, 142), L("tir", [[218, 150], [100, 150]], "noir"),
          T(150, 250, "Le coach lance le palet dans le tas : deux contre deux, quinze secondes", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_transition_deux_cages",
      nom: "Transition 3 contre 3 sur la longueur",
      categorie: "jeu",
      niveau: "intermediaire",
      forme: "actif",
      duree: 10,
      objectif: "Après le tir, on repart dans l'autre sens : attaquer, puis défendre tout de suite.",
      description:
        "Toute la glace, deux cages. Trois attaquants partent de la ligne rouge vers une cage, trois défenseurs les attendent. Dès que l'action finit (tir, arrêt, récupération), les défenseurs deviennent attaquants vers l'autre cage, et les trois qui viennent d'attaquer doivent revenir défendre. Deux transitions, puis les six sortent et six autres entrent.\n\nLe coach relance un palet neuf si le premier est perdu.",
      points_cles: ["Après le tir, revenir défendre sans regarder le résultat", "Le porteur monte au milieu, les autres écartent", "Défenseurs : reculer ensemble, crosse au sol"],
      corrections: ["Les attaquants restent devant la cage après le tir → sifflet, on revient", "Les trois montent en ligne → un porteur au milieu, deux sur les côtés"],
      materiel: "20 palets\nChasubles",
      variantes: "Deux contre deux. Trois transitions avant de sortir.",
      schema: {
        vue: "entiere",
        objets: [
          J(46, 150, "G"), J(554, 150, "G"),
          J(300, 100, "X", "", "rouge"), J(300, 150, "X", "", "rouge"), P(288, 156), J(300, 200, "X", "", "rouge"),
          J(200, 110, "O", "", "bleu"), J(200, 190, "O", "", "bleu"), J(170, 150, "O", "", "bleu"),
          L("conduite", [[286, 156], [150, 150]]), L("tir", [[145, 150], [48, 150]], "rouge"),
          L("patin", [[190, 190], [420, 190], [540, 160]], "bleu"), T(380, 230, "puis les bleus attaquent l'autre cage", "bleu", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_relais_technique",
      nom: "Relais technique : slalom, arrêt, marche arrière, tir",
      categorie: "jeu",
      forme: "relais",
      duree: 8,
      objectif: "Une course qui oblige à tout faire proprement : chaque erreur coûte du temps.",
      description:
        "Deux équipes, deux parcours identiques : slalom entre trois plots avec palet, arrêt complet à la ligne rouge, marche arrière jusqu'à la bleue, pivot, tir sur la cage (le but compte comme un bonus : moins cinq secondes). Retour par la bande, tape dans la main, le suivant part.\n\nUn plot renversé = on le remet et on repasse. Deux manches.",
      points_cles: ["Propre avant rapide : un plot touché, on repasse", "Arrêt complet, les deux patins", "Le tir compte : on ne le bâcle pas"],
      corrections: ["Slalom coupé → refaire le plot manqué", "Marche arrière en glisse sans poussée → poussées en C jusqu'à la bleue"],
      materiel: "6 plots\n20 palets",
      variantes: "Sans palet pour les tout débutants. Deux tours par joueur.",
      schema: {
        vue: "entiere",
        objets: [
          J(46, 150, "G"),
          J(540, 100), J(555, 100), P(530, 106), K(480, 90), K(440, 110), K(400, 90),
          L("conduite", [[528, 106], [480, 115], [440, 85], [400, 115], [370, 100]]), L("freinage", [[368, 100], [305, 100]]), L("arriere", [[298, 100], [235, 100]]), L("pivot", [[230, 100], [170, 115]]), L("tir", [[165, 118], [48, 146]], "rouge"),
          J(540, 200, "O", "", "bleu"), J(555, 200, "O", "", "bleu"), P(530, 206), K(480, 210), K(440, 190), K(400, 210),
          L("conduite", [[528, 206], [480, 185], [440, 215], [400, 185], [370, 200]], "bleu"), L("freinage", [[368, 200], [305, 200]], "bleu"), L("arriere", [[298, 200], [235, 200]], "bleu"), L("pivot", [[230, 200], [170, 185]], "bleu"), L("tir", [[165, 182], [48, 154]], "bleu"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_echappee",
      nom: "Le gardien face à l'échappée",
      categorie: "gardien",
      forme: "vagues",
      duree: 8,
      objectif: "Sortir, reculer avec l'attaquant, garder l'angle : ne pas se jeter en premier.",
      description:
        "Une file d'attaquants à la ligne rouge, palets au sol. Le gardien sort au haut de sa zone quand l'attaquant passe la bleue, puis recule avec lui, en restant dans l'axe palet-cage. Il attend que l'attaquant se décide : tir ou feinte. Un attaquant toutes les quinze secondes.\n\nLes attaquants annoncent leur intention les cinq premières minutes, puis plus.",
      points_cles: ["Sortir au haut de la zone, puis reculer à la vitesse de l'attaquant", "Rester dans l'axe : le palet, le gardien, le milieu de la cage", "Patience : le premier qui bouge perd"],
      corrections: ["Le gardien se jette au sol trop tôt → rester debout jusqu'à la décision de l'attaquant", "Le gardien reste au fond → sortir dès la bleue"],
      materiel: "20 palets",
      variantes: "Échappée à deux avec passe. Un défenseur qui revient.",
      schema: {
        vue: "moitie",
        objets: [
          J(70, 150, "G"), L("arriere", [[68, 150], [52, 150]], "bleu"),
          J(300, 150), J(285, 160), P(290, 150),
          L("conduite", [[285, 150], [200, 145], [130, 140]]), L("tir", [[125, 140], [56, 148]], "rouge"),
          T(140, 220, "Le gardien sort à la bleue, recule avec l'attaquant, garde l'axe", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_ecran",
      nom: "Le gardien derrière un écran",
      categorie: "gardien",
      forme: "groupes3",
      duree: 6,
      objectif: "Voir le palet quand un joueur est devant : bouger la tête, pas tout le corps.",
      description:
        "Un tireur au haut de l'enclave, un joueur immobile devant le gardien qui fait écran (crosse levée, sans bouger). Le tireur tire au sol ; le gardien doit trouver le palet en regardant à côté de l'écran — tête baissée, ou décalée d'un côté — sans sortir de sa position.\n\nDix tirs, puis l'écran bouge un peu, puis il dévie les tirs (palette au sol).",
      points_cles: ["Chercher le palet avec la tête, en dessous ou à côté de l'écran", "Rester bas : les tirs sous écran sont au sol", "Ne pas se décaler du milieu de la cage"],
      corrections: ["Le gardien se décale tout entier → seule la tête bouge", "Il se relève pour voir → rester bas, regarder sous la crosse de l'écran"],
      materiel: "20 palets",
      variantes: "Deux écrans. Tir dévié par l'écran.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(80, 150, "O", "", "bleu"), J(150, 150), P(160, 142), P(166, 148),
          L("tir", [[140, 150], [90, 150]], "rouge"),
          T(120, 230, "L'écran ne bouge pas, le gardien cherche le palet avec la tête", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_retour_ralenti",
      nom: "Tour de piste au ralenti et respiration",
      categorie: "retour",
      forme: "actif",
      duree: 4,
      objectif: "Redescendre le cœur avant les étirements : deux tours lents, en respirant, sans un mot.",
      description:
        "Deux tours de piste au ralenti, en glisse longue, crosse posée sur les épaules derrière la nuque : ça ouvre la cage thoracique. On inspire sur une poussée, on expire sur la suivante. Personne ne parle.\n\nAu deuxième tour, on ralentit encore. Puis on se retrouve au centre pour les étirements ou le mot de la fin.",
      points_cles: ["Glisse longue, poussées lentes", "Respirer sur le rythme des poussées", "Crosse sur les épaules, buste ouvert"],
      corrections: [],
      materiel: "Aucun.",
      variantes: "",
      schema: {
        vue: "entiere",
        objets: [
          L("glisse", [[70, 240], [300, 258], [520, 240], [565, 150], [520, 60], [300, 42], [80, 60], [35, 150], [60, 225]]),
          J(60, 200), J(60, 225),
          T(200, 150, "Deux tours au ralenti, crosse sur les épaules, en respirant", "noir", "petit"),
        ],
      },
    }),

    /* ── Maniement ─────────────────────────────────────────── */

    ex({
      id: "cat_pendule_lateral",
      techniques: ["TS.M 1", "TS.M 4"],
      forme: "actif",
      nom: "Le pendule : d'un côté à l'autre du corps",
      categorie: "maniement",
      duree: 5,
      objectif: "Déplacer le palet loin du corps et le ramener, sans que les épaules suivent.",
      description:
        "Sur place, jambes écartées et fléchies. Le palet part loin à droite, revient sous le corps, repart loin à gauche : un balancier large et lent. Vingt allers-retours, en comptant à voix haute pour ne pas retenir sa respiration.\n\nPuis la même chose en glissant lentement vers l'avant. Le palet continue son pendule pendant que les patins avancent : c'est là que ça devient utile en match.",
      points_cles: ["Le palet va plus loin que la largeur des épaules", "Les poignets travaillent, les épaules restent tranquilles", "La palette reste fermée sur le palet, jamais à plat"],
      corrections: ["Le buste part avec le palet → poser le regard sur un point fixe devant soi", "Le palet claque contre la palette → ralentir de moitié, chercher le contact continu"],
      materiel: "1 palet par joueur",
      variantes: "Les yeux fermés dix secondes. Pendule pendant une glisse sur un seul patin.",
      schema: {
        vue: "moitie",
        objets: [
          J(120, 70), P(120, 70), J(120, 130), P(120, 130), J(120, 190), P(120, 190), J(120, 250), P(120, 250),
          L("libre", [[150, 70], [175, 70]], "bleu"), L("libre", [[150, 130], [175, 130]], "bleu"),
          T(190, 60, "Loin à droite,\nsous le corps,\nloin à gauche", "bleu", "petit"),
          T(60, 285, "Vingt allers-retours, puis la même chose en glissant", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_huit_palet_tete_haute",
      techniques: ["TS.M 1", "TS.P 7"],
      forme: "parcours",
      nom: "Le huit avec palet, tête haute",
      categorie: "maniement",
      duree: 8,
      objectif: "Conduire en tournant des deux côtés sans regarder le palet.",
      description:
        "Deux plots espacés de dix mètres. On dessine un huit autour d'eux, palet au bout de la crosse. Le coach se place au milieu du huit et montre un nombre avec les doigts à chaque passage : celui qui conduit l'annonce à voix haute.\n\nQui ne peut pas annoncer regarde son palet. On ralentit jusqu'à pouvoir annoncer à chaque tour, puis on accélère.",
      points_cles: ["Le palet devant soi, dans le champ de vision basse", "Un tour en coup droit, l'autre en revers", "On annonce fort : si on hésite, c'est qu'on regarde le palet"],
      corrections: ["Nez sur le palet → le coach s'accroupit et montre les doigts plus bas, puis remonte", "Le palet part large dans le virage → le ramener sous le corps avant d'engager le virage"],
      materiel: "2 plots\n1 palet par joueur",
      variantes: "Huit serré autour des deux cercles d'engagement. À deux, en se croisant au centre du huit.",
      schema: {
        vue: "moitie",
        objets: [
          K(110, 90), K(110, 210), J(160, 150, "C"),
          J(60, 90), P(68, 90),
          L("conduite", [[70, 90], [110, 50], [150, 90], [110, 130], [70, 170], [110, 250], [150, 210], [110, 170], [72, 100]]),
          T(190, 130, "Le coach montre un nombre\nà chaque passage :\non l'annonce", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_toupie_palet",
      techniques: ["TS.M 3.1", "TS.M 3.2", "TF.A 2"],
      forme: "actif",
      nom: "La toupie : tourner sur soi sans perdre le palet",
      categorie: "maniement",
      duree: 5,
      objectif: "Garder le palet pendant que le corps tourne : la première manière d'échapper à quelqu'un.",
      description:
        "Chacun sur un point d'engagement, palet devant soi. On tourne sur place d'un tour complet en gardant le palet collé à la palette : le palet fait le petit cercle, le joueur fait le grand. Cinq tours dans un sens, cinq dans l'autre.\n\nEnsuite en mouvement lent : deux poussées, une toupie, deux poussées. C'est le geste qu'on fera pour protéger le palet dos à un adversaire.",
      points_cles: ["Le palet reste à la même distance du corps pendant tout le tour", "La main du bas glisse sur la crosse, elle ne lâche pas", "Genoux fléchis pendant tout le tour, pas de redressement"],
      corrections: ["Le palet s'échappe en fin de tour → ralentir et finir le tour avant de repartir", "Le joueur se redresse pour tourner → poser la main libre sur le genou, ça force la flexion"],
      materiel: "1 palet par joueur",
      variantes: "Toupie en revers uniquement. Toupie suivie d'un départ en accélération.",
      schema: {
        vue: "moitie",
        objets: [
          J(100, 80), P(112, 80), J(100, 220), P(112, 220), J(220, 80), P(232, 80), J(220, 220), P(232, 220),
          L("pivot", tour(100, 80, 22)),
          L("pivot", tour(220, 220, 22)),
          T(60, 285, "Un tour complet, le palet collé à la palette — puis dans l'autre sens", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_sortie_de_bande",
      techniques: ["TS.M 4", "TF.A 1", "TS.P 22"],
      forme: "duo",
      nom: "Sortir de la bande, dos au défenseur",
      categorie: "maniement",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Récupérer un palet le long de la bande et en ressortir sans le perdre, avec quelqu'un dans le dos.",
      description:
        "Par deux, le long de la bande. Le palet est posé contre la planche ; l'attaquant va le chercher, le défenseur arrive dans son dos sans charger, crosse au sol. L'attaquant se met dos au défenseur, le palet du côté opposé, et sort vers le centre en tournant.\n\nTrente secondes de travail, on inverse les rôles. Le défenseur freine et pivote pour suivre : c'est son exercice autant que celui de l'attaquant.",
      points_cles: ["Se mettre entre le palet et l'adversaire, toujours", "Un appui large, les fesses en arrière : on prend de la place", "On sort en tournant vers le centre, pas en poussant droit dans la bande"],
      corrections: ["Le palet reste du côté du défenseur → tourner le corps d'un quart de tour avant de sortir", "L'attaquant s'arrête contre la bande → garder les patins qui bougent tout le temps, même sur place"],
      materiel: "10 palets",
      variantes: "Le défenseur n'a pas le droit de crosse : seulement le corps. Sortie imposée vers le coin plutôt que vers le centre.",
      schema: {
        vue: "moitie",
        objets: [
          P(30, 60), J(58, 66), J(90, 60, "D", "", "bleu"),
          L("conduite", [[62, 74], [80, 110], [130, 130]]),
          P(30, 240), J(58, 234), J(90, 240, "D", "", "bleu"),
          L("conduite", [[62, 226], [80, 195], [130, 175]]),
          T(150, 60, "Le corps entre le palet\net l'adversaire", "noir", "petit"),
          T(150, 260, "On ressort vers le centre, en tournant", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_touches_chrono",
      techniques: ["TS.M 1"],
      forme: "actif",
      nom: "Le chrono des touches : vingt secondes",
      categorie: "maniement",
      duree: 4,
      objectif: "Se donner un chiffre à battre : le maniement progresse quand il se mesure.",
      description:
        "Chacun sur place, palet devant soi. Vingt secondes : on compte ses touches de palet, à voix basse. On annonce son score, on note. Deuxième passage : battre son propre score, pas celui du voisin.\n\nTrois passages maximum, un par séance. En quatre ou cinq séances, chacun voit son chiffre monter — c'est le seul exercice du catalogue qui donne une preuve chiffrée de progrès.",
      points_cles: ["Touches courtes et proches : c'est la fréquence qu'on compte, pas l'amplitude", "Palet devant les patins, pas sur le côté", "On compte honnêtement : le score ne sert qu'à soi"],
      corrections: ["Le palet s'éloigne à mesure que ça va vite → réduire l'amplitude de moitié, la fréquence monte toute seule", "Le joueur se crispe → desserrer la main du bas, souffler"],
      materiel: "1 palet par joueur\n1 chronomètre",
      variantes: "Vingt secondes en revers seulement. Vingt secondes en glissant lentement vers l'avant.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 70), P(102, 70), J(90, 150), P(102, 150), J(90, 230), P(102, 230),
          J(200, 70), P(212, 70), J(200, 150), P(212, 150), J(200, 230), P(212, 230),
          T(60, 20, "20 secondes — on compte ses touches, on note, on recommence", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_conduite_croises",
      techniques: ["TS.P 9", "TS.M 2"],
      forme: "parcours",
      nom: "Conduite en croisés autour du cercle",
      categorie: "maniement",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Croiser les patins et manier en même temps : les jambes font une chose, les mains une autre.",
      description:
        "Sur un cercle d'engagement, palet au bout de la crosse. Deux tours en croisés dans un sens, deux dans l'autre. Le palet reste à l'extérieur du cercle, du côté opposé au centre : c'est ce qui oblige à écarter les mains du corps.\n\nOn commence sans croiser, juste en poussant, puis on ajoute les croisés quand le palet ne bouge plus.",
      points_cles: ["Le palet à l'extérieur du virage, loin du corps", "Le patin extérieur passe par-dessus, pas autour", "Le buste reste ouvert vers le centre du cercle"],
      corrections: ["Le palet part au milieu du cercle → le coach se met au centre, personne ne doit pouvoir le toucher", "Les croisés s'arrêtent dès que le palet bouge → ralentir : d'abord les jambes, le palet suivra"],
      materiel: "1 palet par joueur",
      variantes: "Un palet posé au centre : interdiction de le toucher. Deux joueurs par cercle, en décalé.",
      schema: {
        vue: "moitie",
        objets: [
          J(100, 35), P(112, 30),
          L("conduite", tour(100, 80, 52)),
          P(100, 80),
          J(100, 175), P(112, 170),
          L("conduite", tour(100, 220, 52, Math.PI / 2, 1)),
          T(175, 100, "Le palet à l'extérieur,\njamais au centre", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tunnel_patins",
      techniques: ["TS.M 2"],
      forme: "duo",
      nom: "Le tunnel : le palet entre les patins du partenaire",
      categorie: "maniement",
      duree: 5,
      objectif: "Viser petit avec le palet : un passage étroit, à répétition, sans forcer.",
      description:
        "Par deux, face à face à trois mètres. L'un écarte les patins et reste immobile, crosse levée : c'est le tunnel. L'autre pousse le palet entre ses patins, contourne, récupère de l'autre côté et recommence. Dix passages, puis on inverse.\n\nC'est un exercice de précision, pas de vitesse. Le tunnel se rétrécit à mesure que ça rentre.",
      points_cles: ["On pousse le palet, on ne le frappe pas", "Le regard sur le tunnel, pas sur le palet", "On contourne par le côté qu'on annonce avant de partir"],
      corrections: ["Le palet part trop fort → le laisser glisser sur les deux derniers mètres", "Le joueur s'arrête après la passe → repartir tout de suite, le palet n'attend pas"],
      materiel: "1 palet par duo",
      variantes: "Le tunnel bouge lentement de côté. Deux tunnels à la suite.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 90), P(92, 90), J(170, 90, "O", "", "bleu"),
          L("passe", [[100, 90], [170, 90]]),
          L("patin", [[92, 104], [140, 125], [185, 100]]),
          J(80, 220), P(92, 220), J(170, 220, "O", "", "bleu"),
          L("passe", [[100, 220], [170, 220]]),
          T(200, 150, "Entre les patins,\npuis on contourne\net on récupère", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_maniement_bande_rebonds",
      techniques: ["TS.M 1", "TS.M 4"],
      forme: "actif",
      nom: "Le mur : maniement face à la bande",
      categorie: "maniement",
      duree: 6,
      objectif: "Un partenaire qui ne rate jamais : la bande renvoie tout, et sans attendre.",
      description:
        "Chacun devant un mètre de bande, à deux mètres d'elle. On envoie le palet contre la planche et on le reprend : coup droit, puis revers, puis en alternant. Le palet ne s'arrête jamais.\n\nPuis on s'écarte : on envoie, on fait un pas de côté, on reprend ailleurs. C'est la mise en place de la passe contre la bande, sans partenaire.",
      points_cles: ["Amortir à la réception : la palette recule un peu au contact", "Le palet revient plus vite qu'on ne l'a envoyé : anticiper", "Toujours deux mètres de recul, sinon on n'a pas le temps"],
      corrections: ["Le palet rebondit par-dessus la crosse → palette bien à plat sur la glace à la réception", "Le joueur colle à la bande → reculer d'un pas, le temps de réaction se gagne en distance"],
      materiel: "1 palet par joueur",
      variantes: "Envoi coup droit, reprise en revers. Un pas de côté entre chaque rebond.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 60), P(48, 60), J(60, 130), P(48, 130), J(60, 200), P(48, 200), J(60, 265), P(48, 265),
          L("passe", [[56, 55], [24, 48]]), L("passe", [[24, 68], [58, 74]]),
          T(120, 140, "On envoie, la bande renvoie,\non reprend — sans jamais s'arrêter", "noir", "petit"),
        ],
      },
    }),

    /* ── Passes ────────────────────────────────────────────── */

    ex({
      id: "cat_passe_une_touche",
      techniques: ["TS.M 3.1"],
      forme: "duo",
      nom: "La passe en une touche",
      categorie: "passe",
      duree: 7,
      objectif: "Renvoyer sans contrôler : le palet ne s'arrête pas, la crosse l'accompagne et le relance.",
      description:
        "Par deux, face à face à cinq mètres, immobiles. Vingt passes en deux touches (j'arrête, je renvoie), pour se caler. Puis vingt passes en une touche : la palette accompagne le palet et le renvoie dans le même geste.\n\nCe n'est pas un tir : on ne frappe pas. On laisse le palet arriver sur la palette, et on lui donne une direction. Quand ça rate, on revient à deux touches.",
      points_cles: ["La palette recule un peu au contact, puis relance : c'est un seul geste", "On vise la palette du partenaire, pas son corps", "Les patins restent en mouvement, même sur place"],
      corrections: ["Le palet part n'importe où → ralentir la passe d'arrivée de moitié", "Le joueur frappe le palet → revenir à deux touches dix passes, puis réessayer"],
      materiel: "1 palet par duo",
      variantes: "Une touche en revers. Distance portée à huit mètres.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 70), J(200, 70, "O", "", "bleu"), P(140, 70),
          L("echange", [[95, 70], [185, 70]], "vert"),
          J(80, 160), J(200, 160, "O", "", "bleu"), P(140, 160),
          L("echange", [[95, 160], [185, 160]], "vert"),
          J(80, 250), J(200, 250, "O", "", "bleu"), P(140, 250),
          L("echange", [[95, 250], [185, 250]], "vert"),
          T(60, 20, "Vingt passes en deux touches, puis vingt en une seule", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passe_devant_pas_dedans",
      techniques: ["TS.M 3.1", "TS.P 2"],
      forme: "duo",
      nom: "Passer devant, pas dans les patins",
      categorie: "passe",
      duree: 8,
      objectif: "Viser là où le partenaire sera, pas là où il est : la première règle de la passe en mouvement.",
      description:
        "Par deux, côte à côte à huit mètres d'écart, on remonte la glace dans la longueur en se passant le palet. Consigne unique : la passe arrive devant le partenaire, d'une longueur de crosse. S'il doit freiner pour la prendre, la passe était mauvaise.\n\nLe receveur ne ralentit jamais. Il annonce « trop court » ou « trop long » à voix haute après chaque passe : c'est le retour qui fait progresser le passeur.",
      points_cles: ["On vise un mètre devant la palette, pas la palette", "Le receveur garde sa vitesse : c'est au palet de le trouver", "On annonce à voix haute après chaque passe"],
      corrections: ["Le receveur freine à chaque fois → le passeur vise le plot imaginaire devant lui", "Passe systématiquement en retard → passer plus tôt, dès que le partenaire est à hauteur"],
      materiel: "1 palet par duo",
      variantes: "Écart porté à douze mètres. Trois passes minimum imposées sur la longueur.",
      schema: {
        vue: "entiere",
        objets: [
          J(80, 110), J(80, 200, "O", "", "bleu"), P(92, 110),
          L("patin", [[80, 110], [520, 110]]),
          L("patin", [[80, 200], [520, 200]], "bleu"),
          L("passe", [[110, 118], [210, 190]], "vert"),
          L("passe", [[250, 192], [350, 118]], "vert"),
          L("passe", [[390, 118], [490, 190]], "vert"),
          T(190, 250, "La passe arrive DEVANT : si le partenaire freine, elle était mauvaise", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passe_revers_mouvement",
      techniques: ["TS.M 3.2"],
      forme: "duo",
      nom: "Le revers en mouvement",
      categorie: "passe",
      niveau: "intermediaire",
      duree: 7,
      objectif: "Passer du mauvais côté sans se retourner : le revers, en patinant.",
      description:
        "Par deux, en remontant la glace. Toutes les passes se font en revers, dans les deux sens. Le palet part du talon de la palette et roule vers la pointe ; la main du haut tire, la main du bas pousse.\n\nLa passe en revers ne sera jamais aussi forte qu'un coup droit : on raccourcit la distance à cinq mètres et on cherche la précision, pas la puissance.",
      points_cles: ["Le palet part du talon de la palette, pas de la pointe", "Les deux mains travaillent en sens inverse", "Le poids passe sur le patin arrière au moment de la passe"],
      corrections: ["Le palet se lève → la palette se referme sur le palet en fin de geste", "La passe n'a aucune force → rapprocher les mains d'une main sur le manche"],
      materiel: "1 palet par duo",
      variantes: "Revers d'un côté, coup droit de l'autre, en alternance. Revers en marche arrière pour les plus à l'aise.",
      schema: {
        vue: "entiere",
        objets: [
          J(80, 120), J(80, 180, "O", "", "bleu"), P(92, 120),
          L("patin", [[80, 120], [500, 120]]),
          L("patin", [[80, 180], [500, 180]], "bleu"),
          L("passe", [[120, 128], [200, 172]], "vert"),
          L("passe", [[240, 174], [320, 128]], "vert"),
          L("passe", [[360, 128], [440, 172]], "vert"),
          T(180, 240, "Toutes les passes en revers — cinq mètres, précision plutôt que force", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_passe_diagonale",
      techniques: ["TS.M 3.1"],
      forme: "groupes3",
      nom: "La diagonale : changer de côté d'un coup",
      categorie: "passe",
      niveau: "intermediaire",
      duree: 8,
      objectif: "La passe qui traverse : celle qui fait courir la défense et ouvre l'espace.",
      description:
        "Par trois, en triangle large : deux joueurs de chaque côté de la glace au niveau des cercles, un troisième au centre. Le palet part d'un côté, passe par le centre, ressort de l'autre côté. Puis on supprime le relais : la passe traverse directement.\n\nLa passe transversale se fait toujours vers l'avant du receveur, jamais derrière lui. Si elle est en retard, on repasse par le centre.",
      points_cles: ["On regarde de l'autre côté avant de recevoir, pas après", "La passe transversale part du coup droit, toujours", "Si le couloir n'est pas libre, on repasse par le centre : on ne force jamais"],
      corrections: ["Passe interceptable au milieu → lever la tête une seconde plus tôt", "Le receveur est à l'arrêt → il doit démarrer au moment où le passeur arme"],
      materiel: "10 palets",
      variantes: "Un défenseur passif au centre. Passe transversale suivie d'un tir.",
      schema: {
        vue: "entiere",
        objets: [
          J(150, 70), P(162, 70), J(300, 150, "O", "", "bleu"), J(450, 230),
          L("passe", [[175, 76], [285, 142]], "vert"),
          L("passe", [[315, 158], [430, 222]], "vert"),
          L("passe", [[168, 84], [440, 222]], "orange"),
          T(200, 250, "D'abord par le centre, puis direct : la diagonale traverse", "noir", "petit"),
          T(330, 100, "en orange : la passe directe", "orange", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_chat_au_milieu",
      techniques: ["TS.M 3.1", "TS.M 3.2"],
      forme: "groupes3",
      nom: "Le chat au milieu",
      categorie: "passe",
      duree: 6,
      objectif: "Passer quand quelqu'un gêne : chercher la ligne libre au lieu de la ligne évidente.",
      description:
        "Par trois dans un cercle d'engagement. Deux se passent le palet, le troisième — le chat — essaie de le toucher, crosse au sol seulement. Celui qui perd le palet devient le chat.\n\nDeux minutes par groupe. Les passes sont au sol et courtes ; on a le droit de déplacer le palet avant de passer, et c'est même le but : le chat suit le palet, pas le joueur.",
      points_cles: ["Bouger le palet d'abord, passer ensuite", "Une feinte de passe vaut mieux qu'une passe forcée", "Le receveur se déplace pour ouvrir une ligne, il n'attend pas"],
      corrections: ["Passes tentées en force à travers le chat → obliger à un déplacement de palet avant chaque passe", "Le receveur reste planté → il doit avoir bougé depuis la dernière passe, sinon la passe ne compte pas"],
      materiel: "1 palet par groupe de 3",
      variantes: "À quatre, deux chats. Interdiction de passer deux fois de suite au même.",
      schema: {
        vue: "moitie",
        objets: [
          J(60, 220), J(145, 220, "D", "", "rouge"), J(230, 220),
          P(72, 214),
          L("passe", [[85, 208], [145, 180], [218, 210]], "vert"),
          L("libre", [[145, 200], [145, 215]], "rouge"),
          J(60, 80), J(145, 80, "D", "", "rouge"), J(230, 80), P(72, 74),
          T(60, 20, "Deux passent, un gêne — celui qui perd le palet prend le milieu", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_sortie_de_zone_bande",
      techniques: ["TS.M 4", "TS.P 14"],
      forme: "groupes3",
      nom: "Sortie de zone : passe à la bande et contournement",
      categorie: "passe",
      niveau: "intermediaire",
      duree: 10,
      objectif: "Sortir le palet de sa zone quand la ligne directe est fermée : par la bande.",
      description:
        "Par trois. Le palet est récupéré derrière la cage. Un joueur remonte le long de la bande, le deuxième se place au niveau de la ligne bleue contre la même bande, le troisième au centre. La passe part le long de la planche ; si personne n'est libre, on envoie le palet contre la bande et on va le rechercher.\n\nUn défenseur passif recule depuis la ligne bleue en poussées arrière croisées : c'est lui qui décide si la ligne est fermée. Il n'intercepte pas la première fois, il montre seulement où il est.",
      points_cles: ["Le premier regard va à la bande, pas au centre", "La passe le long de la planche reste au sol et colle à la bande", "Celui qui envoie contre la bande part la rechercher immédiatement"],
      corrections: ["Passe au centre systématique et interceptée → une consigne : trois sorties par la bande avant d'avoir le droit du centre", "Le palet quitte la bande en cours de route → viser un point de la planche, pas le partenaire"],
      materiel: "10 palets",
      variantes: "Défenseur actif. Sortie chronométrée : sept secondes pour franchir la ligne bleue.",
      schema: {
        vue: "entiere",
        objets: [
          CG(34, 150, "gauche"), P(60, 45), J(78, 52),
          J(200, 40, "O", "", "bleu"), J(215, 150, "O", "", "bleu"),
          J(240, 90, "D", "", "rouge"),
          L("conduite", [[84, 58], [140, 44]]),
          L("passe", [[150, 42], [195, 38]], "vert"),
          L("arriere", [[240, 90], [200, 120]], "rouge"),
          T(280, 240, "Le premier regard va à la bande — pas au centre", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_trois_files_montee",
      techniques: ["TS.M 3.1", "TS.P 2"],
      forme: "vagues",
      nom: "Trois files, montée en passes",
      categorie: "passe",
      niveau: "intermediaire",
      duree: 10,
      objectif: "Remonter la glace à trois en gardant les largeurs : la passe circule, personne ne se rapproche.",
      description:
        "Trois files sur la ligne de but : une contre chaque bande, une au centre. Une vague part, remonte toute la glace en se passant le palet, et finit par un tir. Consigne unique : on garde les largeurs. Les trois joueurs doivent franchir la ligne bleue adverse à peu près alignés et bien écartés.\n\nOn recommence dans l'autre sens. Le défaut inévitable est l'aimantation : tout le monde converge vers le palet. Le coach le dit à voix haute à chaque fois.",
      points_cles: ["Trois couloirs : chacun reste dans le sien", "On passe devant, jamais derrière", "Celui qui n'a pas le palet est celui qui doit bouger"],
      corrections: ["Les trois se retrouvent au centre → poser trois plots aux largeurs, à ne pas franchir", "La passe part en retard → passer avant d'être rattrapé, pas après"],
      materiel: "15 palets\n3 plots",
      variantes: "Passe obligatoire à chaque ligne. Un défenseur qui recule à la ligne bleue.",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 40), J(60, 150), J(60, 260), P(72, 150),
          L("patin", [[70, 40], [480, 60]]),
          L("patin", [[70, 150], [480, 150]]),
          L("patin", [[70, 260], [480, 240]]),
          L("passe", [[90, 145], [180, 58]], "vert"),
          L("passe", [[230, 62], [320, 148]], "vert"),
          L("passe", [[360, 155], [440, 238]], "vert"),
          L("tir", [[470, 232], [556, 158]], "rouge"),
          CG(560, 150, "droite"),
          T(200, 285, "On garde les largeurs : trois couloirs, personne ne converge", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_recevoir_en_ouvrant",
      techniques: ["TS.M 3.1", "TF.A 2"],
      forme: "duo",
      nom: "Recevoir en ouvrant le corps",
      categorie: "passe",
      duree: 6,
      objectif: "Recevoir déjà tourné vers là où on va : gagner une seconde sans patiner plus vite.",
      description:
        "Par deux, à six mètres. Le receveur est de trois quarts, jamais de face : épaules ouvertes vers l'avant de la glace, palette présentée sur le côté. Il reçoit et repart dans la même seconde, sans avoir à se retourner.\n\nDix réceptions ouvertes vers la droite, dix vers la gauche, puis on inverse les rôles. Le passeur annonce « droite » ou « gauche » juste avant de passer : le receveur doit s'ouvrir au dernier moment.",
      points_cles: ["Les épaules ouvertes vers l'avant avant que le palet n'arrive", "La palette présentée là où on veut le palet, et elle ne bouge plus", "On repart dans le même geste que la réception"],
      corrections: ["Le joueur reçoit de face puis pivote → le coach compte à voix haute : le temps perdu s'entend", "Le palet passe sous la crosse → présenter la palette à plat, pointe légèrement fermée"],
      materiel: "1 palet par duo",
      variantes: "Réception ouverte suivie d'une conduite de cinq mètres. Annonce au dernier moment, pendant le vol du palet.",
      schema: {
        vue: "moitie",
        objets: [
          J(70, 90, "O", "", "bleu"), J(180, 90), P(120, 90),
          L("passe", [[85, 90], [168, 90]], "vert"),
          L("patin", [[192, 84], [250, 50]]),
          J(70, 220, "O", "", "bleu"), J(180, 220), P(120, 220),
          L("passe", [[85, 220], [168, 220]], "vert"),
          L("patin", [[192, 226], [250, 260]]),
          T(60, 285, "On reçoit déjà tourné vers là où on va", "noir", "petit"),
        ],
      },
    }),

    /* ── Tirs ──────────────────────────────────────────────── */

    ex({
      id: "cat_tir_une_touche",
      techniques: ["TS.M 3.1"],
      forme: "vagues",
      nom: "Le tir en une touche",
      categorie: "tir",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Tirer sur une passe qui arrive, sans l'arrêter : le tir le plus difficile à garder pour un gardien.",
      description:
        "Un passeur au coin du cercle, un tireur au haut de l'autre cercle. La passe arrive au sol, le tireur tire sans contrôler. On commence par un tir du poignet accompagné, pas un frappé : la palette suit le palet et le pousse vers la cage.\n\nCinq tirs, on change de côté, puis on inverse les rôles. Le premier objectif est de toucher la cage, pas de tirer fort.",
      points_cles: ["Le poids est déjà sur la jambe arrière quand le palet arrive", "La palette va à la rencontre du palet, elle ne l'attend pas", "On finit le geste vers la cible, la palette pointe où va le palet"],
      corrections: ["Le palet passe sous la crosse → présenter la palette à plat bien avant l'arrivée", "Tir systématiquement à côté → viser d'abord le bas de la cage, largement"],
      materiel: "20 palets",
      variantes: "Passe venue de derrière la cage. Une touche en revers.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(100, 250, "O", "", "bleu"), P(112, 246),
          J(145, 105), J(185, 95), J(225, 85),
          L("passe", [[112, 240], [140, 118]], "vert"),
          L("tir", [[142, 112], [54, 144]], "rouge"),
          T(150, 250, "On ne contrôle pas : la palette\nva à la rencontre du palet", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_revers_proche",
      techniques: ["TS.M 3.2"],
      forme: "vagues",
      nom: "Le revers près du but : soulever le palet",
      categorie: "tir",
      duree: 7,
      objectif: "Marquer de près en revers, en levant le palet par-dessus la jambière du gardien.",
      description:
        "Départ du coin, conduite jusqu'à hauteur du poteau, tir en revers de trois mètres. Le palet part du talon de la palette et roule jusqu'à la pointe ; les poignets se retournent en fin de geste, c'est ce qui le lève.\n\nPremier passage sans gardien, cible dans le haut de la cage. Deuxième passage avec gardien. Cinq tirs chacun, pas plus : le revers fatigue les poignets vite quand on débute.",
      points_cles: ["Le palet part du talon, il finit à la pointe de la palette", "Les poignets se retournent : c'est le geste qui lève le palet", "On tire en avançant, jamais à l'arrêt"],
      corrections: ["Le palet reste au sol → le palet était trop près de la pointe au départ, le reculer au talon", "Le joueur se retourne pour tirer en coup droit → imposer le revers, cible dans le coin opposé"],
      materiel: "20 palets",
      variantes: "Revers en sortant de derrière la cage. Revers après une réception.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(120, 270), P(130, 264),
          L("conduite", [[130, 262], [110, 200], [95, 175]]),
          L("tir", [[92, 170], [52, 140]], "rouge"),
          J(180, 270), J(230, 270),
          T(150, 200, "Du talon vers la pointe,\nles poignets se retournent", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_traversee_enclave",
      techniques: ["TS.P 12", "TS.M 3.1"],
      forme: "vagues",
      nom: "Traverser l'enclave et tirer",
      categorie: "tir",
      duree: 8,
      objectif: "Déplacer le gardien avant de tirer : le palet traverse, le gardien suit, le côté s'ouvre.",
      description:
        "Départ au haut du cercle, conduite en travers devant la cage — d'un cercle à l'autre — puis tir. Le tir part quand le gardien n'a pas fini son déplacement, c'est-à-dire tôt : dès que l'épaule du gardien bouge.\n\nUn passage à gauche, un passage à droite. Le coach annonce à voix haute le moment de tirer les premières fois, puis laisse choisir.",
      points_cles: ["La traversée est large : on passe devant la cage, pas à dix mètres", "Le palet reste devant soi, prêt à partir à tout moment", "On tire pendant le déplacement du gardien, pas après"],
      corrections: ["Le tir part trop tard, gardien replacé → tirer un temps plus tôt, même si l'angle paraît moins bon", "La traversée s'arrête → garder la vitesse, le tir se fait en mouvement"],
      materiel: "20 palets",
      variantes: "Traversée en revers. Feinte de tir au milieu de la traversée.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(140, 60), P(150, 66),
          L("conduite", [[152, 70], [140, 130], [145, 190]]),
          L("tir", [[142, 196], [54, 162]], "rouge"),
          L("libre", [[60, 140], [60, 168]], "bleu"),
          J(190, 60), J(235, 60),
          T(180, 240, "Le palet traverse, le gardien suit — on tire pendant qu'il se déplace", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_avec_defenseur",
      techniques: ["TS.M 4", "TS.P 23"],
      forme: "duo",
      nom: "Tirer avec un défenseur dans le dos",
      categorie: "tir",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Se donner le temps d'un tir quand quelqu'un revient : protéger, puis tirer vite.",
      description:
        "Un attaquant part de la ligne bleue avec un demi-mètre d'avance sur un défenseur qui le suit sans charger, crosse au sol du côté du palet. L'attaquant protège le palet du corps et cherche son tir avant d'arriver au but.\n\nLe défenseur ne défend pas vraiment : il met une pression réelle mais ne prend pas le palet. On inverse toutes les deux répétitions. Le défenseur travaille son demi-pivot pour repartir vers l'avant.",
      points_cles: ["Le corps entre le palet et le défenseur pendant toute la remontée", "Le tir part plus tôt qu'on ne le voudrait : c'est ça, la pression", "On termine l'action, même quand le tir est manqué"],
      corrections: ["L'attaquant s'arrête pour tirer → tirer en mouvement, même moins fort", "Le palet reste du côté du défenseur → le passer de l'autre côté dès la première poussée"],
      materiel: "15 palets",
      variantes: "Défenseur actif, droit de prendre le palet. Départ du même point, dos à dos.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(250, 110), P(240, 116), J(275, 130, "D", "", "bleu"),
          L("conduite", [[238, 118], [170, 130], [125, 145]]),
          L("patin", [[272, 136], [200, 150], [150, 165]], "bleu"),
          L("tir", [[120, 148], [54, 148]], "rouge"),
          T(140, 240, "Le corps entre le palet et le défenseur — et le tir part tôt", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_bleue_avec_ecran",
      techniques: ["TS.M 3.1"],
      forme: "groupes3",
      nom: "Tir de la bleue, écran devant le gardien",
      categorie: "tir",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Un tir de loin qui devient dangereux : quelqu'un devant le gardien, et le palet au sol.",
      description:
        "Par trois : un tireur à la ligne bleue, un joueur devant le gardien qui fait écran sans le gêner physiquement, un troisième au rebond. Le tir part au sol, sur un côté de l'écran — jamais dans le dos de son partenaire.\n\nCelui qui fait écran annonce « à gauche » ou « à droite » pour dire de quel côté il laisse passer. Le troisième attaque le rebond. On tourne à chaque tir.",
      points_cles: ["Le tir part au sol : un palet en l'air ne se dévie pas et fait peur à l'écran", "L'écran regarde le gardien, pas le tireur", "Le rebond s'attaque avant qu'il ne s'arrête"],
      corrections: ["Tir en pleine tête de l'écran → annoncer le côté à voix haute, à chaque fois", "L'écran se retourne au moment du tir → il annonce, puis il ne bouge plus"],
      materiel: "20 palets",
      variantes: "L'écran a le droit de dévier. Deux joueurs au rebond.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(95, 150, "O", "", "bleu"), J(230, 150), P(240, 144),
          J(120, 235, "O", "", "vert"),
          L("tir", [[225, 160], [58, 170]], "rouge"),
          L("patin", [[118, 225], [80, 180]], "vert"),
          T(150, 60, "Le tir passe à côté de l'écran, au sol —\nl'écran annonce son côté", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_chercher_son_rebond",
      techniques: ["TS.P 11", "TS.M 3.1"],
      forme: "vagues",
      nom: "Aller chercher son propre rebond",
      categorie: "tir",
      duree: 7,
      objectif: "Ne pas regarder son tir : tirer, puis partir au but dans la même seconde.",
      description:
        "Tir du haut du cercle, puis départ immédiat vers la cage pour reprendre le rebond. Deuxième tir de près, de là où le palet est revenu. Le gardien joue normalement et cherche à couvrir.\n\nLa faute à corriger est toujours la même : on admire son tir. Le coach siffle une fois au moment du tir : au coup de sifflet, on part, quoi qu'il arrive au palet.",
      points_cles: ["On part au but avant de savoir si le tir est bon", "Le deuxième tir se fait vite, sans contrôler", "On s'arrête devant le but, on ne le traverse pas"],
      corrections: ["Le joueur regarde son tir → départ au coup de sifflet, systématiquement", "Personne n'arrive avant que le gardien couvre → partir plus tôt, le rebond ne s'attend pas"],
      materiel: "20 palets",
      variantes: "Deux joueurs au rebond, le premier arrivé tire. Tir de la bleue, rebond obligatoire.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(145, 80), P(155, 86),
          L("tir", [[150, 92], [56, 138]], "rouge"),
          L("acceleration", [[152, 96], [110, 140], [85, 160]]),
          P(78, 185),
          L("tir", [[80, 178], [52, 160]], "rouge"),
          J(195, 70), J(240, 62),
          T(150, 250, "On tire et on part — au sifflet, quoi qu'il arrive au palet", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_deviation",
      techniques: ["TS.M 3.1"],
      forme: "groupes3",
      nom: "La déviation devant le but",
      categorie: "tir",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Changer la direction d'un palet lancé par un autre : présenter la palette, ne pas frapper.",
      description:
        "Un tireur au haut du cercle, un joueur devant le but qui dévie, un gardien. Le tir part au sol, modéré. Celui qui dévie présente sa palette à plat et l'incline vers le coin qu'il vise : il ne frappe rien, il tourne le palet.\n\nDix déviations, puis on tourne. La consigne de sécurité passe avant tout : palets au sol uniquement, celui qui dévie annonce quand il est prêt.",
      points_cles: ["La palette est posée sur la glace, elle attend le palet", "On incline la palette vers le coin visé, on ne tape pas", "Celui qui dévie annonce « prêt » avant chaque tir"],
      corrections: ["Le palet passe sous la crosse → toute la palette au sol, y compris le talon", "La déviation part trop fort et par-dessus → relâcher les mains, laisser le palet faire le travail"],
      materiel: "20 palets",
      variantes: "Déviation du revers. Deux joueurs devant le but, un seul dévie sur annonce du coach.",
      schema: {
        vue: "moitie",
        objets: [
          J(48, 150, "G"), J(105, 195, "O", "", "bleu"), J(220, 110), P(230, 104),
          L("tir", [[215, 116], [112, 188]], "rouge"),
          L("tir", [[100, 200], [52, 168]], "orange"),
          T(150, 250, "On présente la palette et on l'incline — on ne frappe pas", "noir", "petit"),
          T(160, 60, "en orange : le palet dévié", "orange", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_concours_equipes",
      techniques: [],
      forme: "relais",
      nom: "Le concours de tirs par équipes",
      categorie: "tir",
      duree: 8,
      objectif: "Finir la séance sur des tirs qui comptent, et sur du bruit.",
      description:
        "Deux équipes, deux files au haut des cercles, une cage chacune (ou la même à tour de rôle avec le gardien). Chacun a un tir. Un but vaut un point ; un tir cadré arrêté vaut un point aussi si le gardien est dans la cage. Première équipe à dix.\n\nLe coach annonce la cible avant chaque tour : « en bas à gauche », « au-dessus de la jambière ». Ça transforme un concours de puissance en concours de précision.",
      points_cles: ["La cible est annoncée avant le tour : on vise, on ne canonne pas", "Un tir non cadré ne rapporte rien : viser d'abord", "On reprend sa place tout de suite après son tir"],
      corrections: ["Tout le monde tire au maximum → annoncer une cible précise et ne compter qu'elle", "La file s'étire → deux cages en parallèle, moitié moins d'attente"],
      materiel: "20 palets\n4 plots",
      variantes: "Tir imposé en revers sur un tour. Tir après une passe du coéquipier suivant.",
      schema: {
        vue: "entiere",
        objets: [
          CG(34, 150, "gauche"), CG(560, 150, "droite"),
          J(48, 150, "G"), J(552, 150, "G"),
          J(180, 90), J(215, 82), J(250, 74), P(190, 96),
          J(420, 210), J(385, 218), J(350, 226), P(410, 216),
          L("tir", [[178, 100], [48, 140]], "rouge"),
          L("tir", [[422, 204], [552, 160]], "rouge"),
          T(240, 150, "Cible annoncée avant chaque tour — première équipe à dix", "noir", "petit"),
        ],
      },
    }),

    /* ── Gardien ───────────────────────────────────────────── */

    ex({
      id: "cat_gardien_position_equilibre",
      techniques: ["TS.P 1", "TF.A 1"],
      forme: "actif",
      nom: "Le gardien : position de base et équilibre",
      categorie: "gardien",
      duree: 5,
      objectif: "Tenir la position de base sans se fatiguer, et y revenir après chaque mouvement.",
      description:
        "Le gardien dans sa cage, sans palet. Position de base : patins un peu plus larges que les épaules, genoux au-dessus des pointes, mitaine ouverte à hauteur de hanche, bloqueur à côté du corps, palette à plat devant les patins.\n\nLe coach annonce des mouvements simples — « à droite », « à gauche », « à genoux », « debout ». Après chaque mouvement, le gardien revient en position de base et s'immobilise une seconde. C'est ce retour qui compte, pas le déplacement.",
      points_cles: ["Le poids sur la plante des pieds, jamais sur les talons", "La palette touche la glace devant les patins, elle ne flotte pas", "On s'immobilise une seconde en position après chaque mouvement"],
      corrections: ["Le gardien penche en arrière → avancer les épaules au-dessus des genoux", "La mitaine tombe le long du corps → la tenir ouverte, visible du tireur"],
      materiel: "Aucun.",
      variantes: "Les yeux fermés cinq secondes en position. Position tenue trente secondes sans bouger.",
      schema: {
        vue: "moitie",
        objets: [
          CG(34, 150, "gauche"), J(52, 150, "G"), J(160, 150, "C"),
          L("libre", [[70, 150], [145, 150]], "bleu"),
          T(90, 90, "« à droite », « à gauche »,\n« à genoux », « debout »", "noir", "petit"),
          T(60, 240, "Après chaque mouvement : retour en position, une seconde immobile", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_poussees_t",
      techniques: ["TF.M 1", "TF.M 2"],
      forme: "actif",
      nom: "Le gardien : poussées latérales de poteau à poteau",
      categorie: "gardien",
      duree: 6,
      objectif: "Se déplacer d'un poteau à l'autre sans se tourner, et arriver arrêté.",
      description:
        "Sans palet, dans la cage. Le gardien passe d'un poteau à l'autre en poussée latérale : le patin d'appui se tourne perpendiculairement, pousse, et le corps glisse de côté en restant face au jeu. On arrive contre le poteau et on s'arrête net.\n\nDix allers-retours lents, en cherchant la position d'arrivée plus que la vitesse. Puis dix au rythme d'un sifflet qui accélère.",
      points_cles: ["Les épaules restent face au jeu pendant tout le déplacement", "Une seule poussée par déplacement : on glisse, on ne trottine pas", "On arrive arrêté contre le poteau, pas en dérapant"],
      corrections: ["Le gardien se tourne pour se déplacer → poser un plot à viser du regard pendant tout le trajet", "Arrivée en glissade non contrôlée → partir plus doucement, chercher l'arrêt d'abord"],
      materiel: "Aucun.",
      variantes: "Poussée latérale suivie d'un retour immédiat. Déplacement au sifflet, sans savoir de quel côté.",
      schema: {
        vue: "moitie",
        objets: [
          CG(34, 150, "gauche"), J(52, 137, "G"),
          L("glisse", [[56, 137], [56, 163]], "bleu"),
          J(160, 150, "C"), P(175, 150),
          T(90, 80, "Les épaules restent face au jeu", "noir", "petit"),
          T(70, 240, "Une poussée, on glisse, on arrive arrêté contre le poteau", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_papillon",
      techniques: ["TF.A 1", "TF.M 2"],
      forme: "actif",
      nom: "Le gardien : le papillon, descendre et se relever",
      categorie: "gardien",
      duree: 6,
      objectif: "Couvrir le bas de la cage d'un seul geste, et se relever assez vite pour le tir suivant.",
      description:
        "Sans palet. Le gardien descend en papillon : les genoux se posent ensemble, les jambières s'ouvrent à plat contre la glace, le buste reste droit et les mains restent hautes. Puis il se relève d'un patin, puis de l'autre.\n\nDix descentes et dix relevés, lentement. Ce qui compte n'est pas la descente, que tout le monde réussit, mais le relevé : tant qu'il n'est pas rapide, le papillon est un piège.",
      points_cles: ["Les mains restent hautes pendant la descente : elles ne servent pas à se rattraper", "Les jambières à plat, pas de trou entre les genoux", "Le relevé se fait sur un patin, jamais sur les deux mains"],
      corrections: ["Le buste tombe en avant → regarder devant, menton haut pendant toute la descente", "Le relevé prend deux secondes → travailler dix relevés seuls, sans descente, avant de rechaîner"],
      materiel: "Aucun.",
      variantes: "Descente, relevé, déplacement latéral, nouvelle descente. Descente au sifflet pendant un déplacement.",
      schema: {
        vue: "moitie",
        objets: [
          CG(34, 150, "gauche"), J(52, 150, "G"), J(150, 150, "C"),
          L("libre", [[62, 140], [62, 120]], "bleu"), L("libre", [[62, 160], [62, 180]], "bleu"),
          T(95, 100, "Genoux ensemble,\njambières à plat,\nmains hautes", "noir", "petit"),
          T(70, 245, "Le relevé compte plus que la descente", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_gant_bloqueur",
      techniques: [],
      forme: "duo",
      nom: "Le gardien : gant et bloqueur",
      categorie: "gardien",
      duree: 6,
      objectif: "Attraper d'un côté, repousser de l'autre : deux gestes différents, deux mains différentes.",
      description:
        "Un tireur à six mètres, tirs à mi-hauteur annoncés : « gant » ou « bloqueur ». Le gardien attrape de la mitaine, ferme la main et la garde fermée une seconde ; il repousse du bloqueur vers le coin, jamais vers le centre.\n\nDix de chaque côté, annoncés. Puis dix sans annonce. Les tirs restent modérés : on travaille le geste, pas le courage.",
      points_cles: ["La mitaine va chercher le palet devant le corps, pas à côté", "Le bloqueur est orienté vers le coin avant le contact", "On garde le palet une seconde dans la mitaine avant de le montrer"],
      corrections: ["Le palet ressort de la mitaine → fermer la main et la ramener vers le corps", "Rebond de bloqueur au milieu → tourner le bloqueur vers l'extérieur avant l'impact"],
      materiel: "20 palets",
      variantes: "Tirs alternés haut et bas. Le tireur annonce après le départ du palet.",
      schema: {
        vue: "moitie",
        objets: [
          CG(34, 150, "gauche"), J(52, 150, "G"), J(160, 150), P(170, 144),
          L("tir", [[155, 144], [60, 132]], "rouge"),
          L("tir", [[155, 156], [60, 168]], "rouge"),
          L("passe", [[62, 172], [35, 215]], "bleu"),
          T(105, 100, "« gant »", "noir", "petit"), T(105, 195, "« bloqueur » → vers le coin", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_jeu_de_crosse",
      techniques: [],
      forme: "duo",
      nom: "Le gardien : le jeu de crosse",
      categorie: "gardien",
      duree: 6,
      objectif: "Se servir de la crosse : bloquer au sol, et dégager le palet hors de la zone dangereuse.",
      description:
        "Tirs au sol depuis six mètres, uniquement. Le gardien arrête de la palette, à plat devant les patins, et dégage dans le coin dans le même geste. La palette ne se lève jamais : un palet qui passe dessous est toujours un palet mal bloqué.\n\nPuis le tireur pose des palets arrêtés devant la cage : le gardien les dégage un par un vers le coin, le plus loin possible, sans se déplacer.",
      points_cles: ["Toute la palette au sol, y compris le talon", "On dégage vers le coin, jamais devant la cage", "Les mains restent devant le corps : la crosse ne part pas sur le côté"],
      corrections: ["Le palet passe sous la palette → poser la palette plus tôt, avant l'arrivée du palet", "Dégagement qui reste dans l'enclave → viser le coin et finir le geste"],
      materiel: "20 palets",
      variantes: "Dégagement obligatoire au-delà de la ligne bleue. Un joueur attaque le dégagement raté.",
      schema: {
        vue: "moitie",
        objets: [
          CG(34, 150, "gauche"), J(52, 150, "G"), J(165, 150), P(176, 150),
          L("tir", [[158, 150], [62, 150]], "rouge"),
          L("passe", [[64, 158], [40, 240]], "bleu"),
          L("passe", [[64, 142], [40, 60]], "bleu"),
          T(120, 215, "On bloque à plat et on dégage dans le coin, jamais devant", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_angle_sortie",
      techniques: ["TS.P 1", "TF.M 1"],
      forme: "duo",
      nom: "Le gardien : réduire l'angle",
      categorie: "gardien",
      duree: 7,
      objectif: "Avancer pour occuper la cage : plus le gardien sort, moins il reste d'espace à viser.",
      description:
        "Le coach pose deux plots qui matérialisent les deux poteaux vus du tireur. Le gardien sort sur la ligne qui coupe l'angle en deux, jusqu'au bord de sa zone, puis recule en gardant l'axe. Le tireur avance lentement : le gardien suit l'axe sans jamais se retrouver décalé.\n\nPuis dix tirs depuis des positions différentes de la glace. Entre chaque, le coach demande : « tu es bien dans l'axe ? » Le gardien répond en regardant ses appuis par rapport aux poteaux.",
      points_cles: ["Sortir en ligne droite vers le palet, pas en arc de cercle", "Reculer en restant face au palet, sans se tourner", "Un pied de chaque côté de la ligne poteau-palet : c'est ça, l'axe"],
      corrections: ["Le gardien est décalé d'un côté → repère : la ligne imaginaire entre le palet et le centre de la cage passe par le milieu de son corps", "Le gardien sort trop loin → s'arrêter au bord de la zone, pas au-delà"],
      materiel: "15 palets\n2 plots",
      variantes: "Tireur qui se déplace latéralement avant de tirer. Sortie puis retour au poteau.",
      schema: {
        vue: "moitie",
        objets: [
          CG(34, 150, "gauche"), J(70, 150, "G"), K(40, 141), K(40, 159),
          J(200, 90), P(210, 96),
          L("libre", [[40, 141], [200, 90]], "bleu"),
          L("libre", [[40, 159], [200, 90]], "bleu"),
          L("patin", [[54, 150], [78, 132]]),
          T(120, 220, "Sortir sur la bissectrice, reculer dans l'axe, ne jamais se tourner", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_derriere_la_cage",
      techniques: ["TF.M 2"],
      forme: "groupes3",
      nom: "Le gardien : le palet derrière la cage",
      categorie: "gardien",
      duree: 6,
      objectif: "Suivre le palet qui passe derrière, et se retrouver au bon poteau avant qu'il ne ressorte.",
      description:
        "Un joueur conduit le palet derrière la cage, d'un côté à l'autre, et ressort à un moment de son choix. Le gardien colle au poteau du côté où est le palet, se tourne avec lui, et se replace dès que le palet ressort.\n\nDix passages. Un troisième joueur se poste devant le but : de temps en temps, celui qui est derrière lui passe le palet, et le gardien doit avoir gardé un œil sur lui.",
      points_cles: ["Collé au poteau tant que le palet est derrière : pas d'espace entre le patin et le poteau", "On se tourne du côté le plus court, jamais en faisant le tour", "On regarde le palet ET le joueur devant le but"],
      corrections: ["Le gardien quitte le poteau trop tôt → attendre que le palet ait dépassé la ligne de but", "Le gardien se fait surprendre par la passe devant → un coup d'œil devant le but entre chaque déplacement"],
      materiel: "10 palets",
      variantes: "Passe devant le but obligatoire un passage sur deux. Deux joueurs devant le but.",
      schema: {
        vue: "moitie",
        objets: [
          CG(34, 150, "gauche"), J(46, 137, "G"),
          J(20, 200), P(30, 195),
          L("conduite", [[28, 192], [16, 150], [26, 105]]),
          J(110, 120, "O", "", "bleu"),
          L("passe", [[32, 100], [100, 115]], "vert"),
          T(130, 220, "Collé au poteau — et un œil sur celui qui est devant le but", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_gardien_depannage",
      techniques: ["TS.P 1", "TF.A 1"],
      forme: "actif",
      nom: "Tenir la cage sans être gardien",
      categorie: "gardien",
      duree: 6,
      objectif: "Quand personne n'a l'équipement : que celui qui dépanne sache quoi faire, et ne se fasse pas mal.",
      description:
        "Dans un groupe d'adultes débutants, il n'y a souvent pas de gardien. Quelqu'un dépanne, en jambières empruntées ou sans rien. Cinq minutes suffisent à lui donner l'essentiel : position de base, patins larges, crosse à plat devant, mains devant le corps — et la règle absolue : on ne tourne jamais le dos au palet.\n\nLe coach tire dix palets au sol, doucement, en annonçant chaque tir. Puis dix sans annonce, toujours au sol. Aucun tir levé tant que la personne n'a pas de masque : c'est non négociable, et ça se dit à voix haute devant tout le groupe.",
      points_cles: ["Aucun tir levé sans masque — la consigne est donnée au groupe, pas au seul gardien", "Patins larges, crosse à plat devant les patins", "On ne tourne jamais le dos au palet, même pour aller le chercher"],
      corrections: ["Le dépanneur ferme les yeux → tirs plus lents, plus loin, jusqu'à ce qu'il les suive", "Le groupe oublie la consigne et tire haut → on arrête l'atelier, on redit, on reprend"],
      materiel: "20 palets\n1 masque au minimum",
      variantes: "Rotation : chacun passe cinq minutes dans la cage. Deux cages de mini-hockey plutôt qu'une vraie cage.",
      schema: {
        vue: "moitie",
        objets: [
          CG(34, 150, "gauche"), J(52, 150, "G"), J(170, 150, "C"), P(182, 150),
          L("tir", [[162, 150], [62, 150]], "rouge"),
          L("tir", [[162, 140], [62, 136]], "rouge"),
          L("tir", [[162, 162], [62, 166]], "rouge"),
          J(230, 90), J(230, 150), J(230, 210),
          T(90, 240, "Tirs au sol uniquement, annoncés — rien de levé sans masque", "rouge", "petit"),
        ],
      },
    }),

    /* ── Deux classiques du patinage ──────────────────────────── */

    ex({
      id: "cat_banane",
      techniques: ["TS.P 9", "TS.P 7", "TF.M 2"],
      forme: "parcours",
      nom: "La banane",
      categorie: "patinage",
      duree: 8,
      objectif: "Tenir une longue courbe sans la casser : croiser tout le long, d'un coin à l'autre.",
      description:
        "Une file dans un coin. On traverse la glace en diagonale, mais jamais en ligne droite : on décrit une grande courbe — la banane — dont le ventre passe près du centre, et on croise du départ jusqu'à l'arrivée. Retour au calme par la bande, et on repart.\n\nDeux séries dans un sens, deux dans l'autre : la banane ne se courbe pas du même côté, et c'est justement le but. Un départ toutes les cinq secondes.\n\nLa faute ordinaire est de patiner droit puis de tourner d'un coup à la fin. On pose trois plots sur le tracé pour obliger la courbe à être continue. Sans palet la première fois.",
      points_cles: [
        "La courbe est continue : jamais de ligne droite, jamais d'angle",
        "Se pencher vers l'intérieur de la courbe, épaules dans l'axe du tracé",
        "Le pied extérieur croise par-dessus, le pied intérieur pousse sur sa carre externe",
        "Le regard loin devant, sur la sortie de la courbe",
      ],
      corrections: [
        "Patiner droit puis tourner à la fin → poser trois plots sur le ventre de la courbe",
        "Buste vertical, pas d'inclinaison → fléchir les genoux et laisser le corps tomber vers l'intérieur",
        "Le croisé s'arrête dès que ça va vite → ralentir, la continuité avant la vitesse",
        "Le côté faible est évité → imposer le sens, deux séries de chaque",
      ],
      materiel: "3 plots",
      variantes:
        "Avec palet une fois la courbe tenue. Deux bananes en miroir pour occuper les deux diagonales. Avec les gros boudins de mousse posés sur le tracé, pour les groupes qui coupent au court.",
      schema: {
        vue: "entiere",
        objets: [
          J(58, 252), J(42, 262), J(74, 266),
          K(190, 215), K(300, 160), K(430, 95),
          L("patin", [[78, 248], [165, 228], [265, 188], [370, 125], [470, 78], [540, 62]], "bleu"),
          L("patin", [[552, 72], [572, 140], [548, 232], [430, 276], [230, 282], [96, 274]]),
          J(300, 150, "C"),
          T(150, 120, "La courbe ne se casse jamais", "bleu", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_croises_cinq_cercles",
      techniques: ["TS.P 9", "TS.P 10", "TS.P 7"],
      forme: "parcours",
      nom: "Croisés enchaînés sur les cinq cercles",
      categorie: "patinage",
      niveau: "intermediaire",
      duree: 10,
      objectif: "Enchaîner les croisés sur les cinq cercles, en alternant le sens : les deux côtés au même prix.",
      description:
        "Le tour complet de chaque cercle de mise au jeu, dans l'ordre : coin bas, coin haut, centre, coin haut opposé, coin bas opposé. Le tracé est déjà sur la glace, on n'a rien à poser.\n\nLa règle qui fait tout : on change de sens à chaque cercle. Un tour à gauche, le suivant à droite. Le pied qui croise change donc cinq fois, et le côté faible ne peut pas se cacher.\n\nTrois passages. Le premier lentement, le deuxième en cherchant la vitesse dans la courbe, le troisième seulement avec le palet.",
      points_cles: [
        "Un tour complet par cercle, sur la ligne, sans couper",
        "Le sens change à chaque cercle — c'est la moitié de l'exercice",
        "Le pied intérieur pousse sur sa carre externe : c'est la partie difficile",
        "On accélère DANS le cercle, on ne subit pas la courbe",
      ],
      corrections: [
        "Le même sens partout → annoncer le sens à voix haute avant chaque cercle",
        "Le cercle est coupé en trajectoire large → suivre la ligne peinte, elle est là pour ça",
        "Les pieds se décroisent et marchent → ralentir jusqu'à ce que le croisé revienne",
        "Le buste tourne dans le vide → épaules face à la sortie du cercle, pas vers l'intérieur",
      ],
      materiel: "1 palet par joueur",
      variantes:
        "En marche arrière pour ceux qui la tiennent. Chronométré, un passage par joueur, pour situer les progrès d'un mois sur l'autre. En file indienne de trois, le premier donne le rythme.",
      schema: {
        vue: "entiere",
        objets: [
          J(58, 262), J(42, 272),
          L("patin", tour(100, 220, 45), "bleu"),
          L("patin", tour(100, 80, 45, Math.PI / 2, 1), "bleu"),
          L("patin", tour(300, 150, 45), "bleu"),
          L("patin", tour(500, 80, 45, Math.PI / 2, 1), "bleu"),
          L("patin", tour(500, 220, 45), "bleu"),
          T(100, 220, "1", "rouge", "grand"), T(100, 80, "2", "rouge", "grand"),
          T(300, 150, "3", "rouge", "grand"), T(500, 80, "4", "rouge", "grand"),
          T(500, 220, "5", "rouge", "grand"),
          T(215, 285, "Le sens change à chaque cercle", "rouge", "petit"),
          J(300, 40, "C"),
        ],
      },
    }),


    /* ── Apprendre et parfaire le tir ─────────────────────────── */

    ex({
      id: "cat_tir_poignet_decompose",
      techniques: ["TS.M 1", "TF.A 2"],
      forme: "actif",
      nom: "Le tir du poignet, décomposé à l'arrêt",
      categorie: "tir",
      duree: 8,
      objectif: "Apprendre le geste avant de le faire vite : transférer, balayer, finir la palette vers la cible.",
      description:
        "Tout le monde en ligne, face à la bande ou face aux cages, à l'arrêt. Trois temps, annoncés, et on ne passe au suivant que quand le précédent est propre.\n\n1 · SANS PALET. Le geste à vide, dix fois. Poids sur le pied arrière, on bascule sur le pied avant pendant que la palette balaie.\n\n2 · PALET IMMOBILE. Le palet est posé au talon de la palette. On le traîne sur toute la longueur du balayage avant qu'il parte. Le bruit doit être un frottement, pas un claquement.\n\n3 · VISER. Même geste, mais la palette finit vers l'endroit visé — en haut, en bas, à gauche, à droite. C'est la fin du geste qui décide où va le palet, pas le début.\n\nQuinze tirs chacun. Personne ne tire fort : on tire juste. Des cibles dans les cages, ou quatre plots posés dans les coins, donnent quelque chose à viser.",
      points_cles: [
        "Le palet part du TALON de la palette et sort par la pointe",
        "Le poids passe du pied arrière au pied avant pendant le balayage",
        "Les deux mains travaillent en sens contraire : la main basse tire, la main haute pousse",
        "La palette finit vers la cible et reste là une seconde",
      ],
      corrections: [
        "Le palet est tapé, pas balayé → repartir au temps 2, on doit entendre le frottement",
        "Le poids reste derrière → poser le pied avant plus près du palet et sentir le transfert",
        "Le palet se lève sans qu'on l'ait voulu → la palette se referme, elle doit finir ouverte vers la cible",
        "Le geste se fait avec les bras seuls → les hanches ouvrent en premier, les bras suivent",
        "On vise en regardant le palet → regarder la cible au moment où la palette part",
      ],
      materiel: "20 palets\n4 plots",
      variantes:
        "Face à la bande pour les tout débutants : le bruit du palet contre la bande suffit à corriger. À genoux, pour isoler le haut du corps. Un partenaire tient la crosse à mi-hauteur : le palet doit passer dessous.",
      schema: {
        vue: "moitie",
        objets: [
          J(240, 60), P(226, 64), J(240, 120), P(226, 124), J(240, 180), P(226, 184), J(240, 240), P(226, 244),
          L("tir", [[220, 64], [50, 132]], "rouge"),
          L("tir", [[220, 124], [50, 144]], "rouge"),
          L("tir", [[220, 184], [50, 156]], "rouge"),
          L("tir", [[220, 244], [50, 168]], "rouge"),
          J(150, 150, "C"),
          T(120, 30, "Sans palet, puis palet immobile, puis viser", "bleu", "petit"),
          T(120, 278, "Personne ne tire fort : on tire juste", "rouge", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_palet_devant_derriere",
      techniques: ["TS.M 4", "TF.A 2"],
      forme: "vagues",
      nom: "Le palet devant, le palet derrière",
      categorie: "tir",
      duree: 8,
      objectif: "Sentir d'où part un tir : le même geste donne deux résultats selon la place du palet.",
      description:
        "Un exercice de comparaison, pas de répétition. Deux plots marquent le haut du cercle. Chacun tire quatre fois depuis là, en changeant une seule chose : où se trouve le palet au moment où la palette part.\n\n1 · PALET TROP EN ARRIÈRE, derrière le pied arrière. Le tir part mou et se lève tout seul.\n2 · PALET SOUS LE CORPS. Le tir part, sans force.\n3 · PALET DEVANT LE PIED AVANT. Le balayage a toute sa longueur : c'est là que ça part.\n4 · AU CHOIX, et on annonce avant de tirer où on a mis le palet.\n\nOn regarde les quatre tirs ensemble, on n'explique rien avant. La différence s'entend.",
      points_cles: [
        "Le palet commence derrière et FINIT devant le pied avant : c'est la longueur du balayage qui fait la force",
        "Un palet parti trop en arrière se lève sans qu'on l'ait décidé",
        "Le pied avant se pose vers la cible pendant que le palet avance",
        "On annonce à voix haute avant de tirer : ça oblige à savoir ce qu'on fait",
      ],
      corrections: [
        "Les quatre tirs se ressemblent → ralentir, poser le palet à la main avant chaque essai",
        "On tire plus fort au lieu de déplacer le palet → interdire de forcer, c'est la place qui change",
        "Le palet est devant mais le poids reste derrière → avancer le pied avant en même temps",
      ],
      materiel: "20 palets\n2 plots",
      variantes:
        "En revers, la même comparaison. En mouvement, une fois les quatre tirs compris à l'arrêt. Le partenaire dit où était le palet en regardant le tir partir — il se trompe rarement.",
      schema: {
        vue: "moitie",
        objets: [
          J(150, 80), P(178, 86), P(150, 92), P(120, 86),
          T(196, 84, "3", "vert", "moyen"), T(150, 108, "2", "noir", "moyen"), T(104, 84, "1", "rouge", "moyen"),
          L("tir", [[114, 86], [52, 128]], "rouge"),
          L("tir", [[146, 92], [50, 146]], "noir"),
          L("tir", [[174, 86], [48, 158]], "vert"),
          K(180, 60), K(120, 60),
          J(150, 230), J(170, 244), J(130, 244),
          J(230, 150, "C"),
          T(120, 278, "1 trop en arrière · 2 sous le corps · 3 devant le pied avant", "bleu", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_tir_tete_haute",
      techniques: ["TS.M 1", "TF.A 2"],
      forme: "duo",
      nom: "Tirer sans regarder le palet",
      categorie: "tir",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Lever les yeux avant de tirer : le gardien se regarde, le palet se sent.",
      description:
        "Par deux, un tireur et un donneur. Le tireur est au haut du cercle, dos à la cage. Au signal, il pivote, reçoit la passe du donneur — et pendant qu'il arme, le donneur montre un nombre avec la main, ou se place d'un côté de la cage.\n\nLe tireur doit annoncer le nombre (ou le côté) AVANT que son palet touche la cage. S'il n'a pas vu, le tir ne compte pas, même s'il est bon.\n\nChasubles pour distinguer donneurs et tireurs. Huit tirs, puis on échange. Ce n'est pas un exercice de puissance : un tir mou avec le bon regard vaut mieux qu'une frappe aveugle.",
      points_cles: [
        "Le palet se contrôle au toucher, pas au regard",
        "Le regard monte pendant l'armement, pas après",
        "On annonce avant que le palet arrive : sinon on a regardé trop tard",
        "Viser l'espace laissé libre, pas le milieu de la cage",
      ],
      corrections: [
        "La tête reste baissée → poser le palet plus loin devant, il oblige à lever les yeux",
        "On annonce au hasard → le donneur change de nombre à chaque fois, et le note",
        "Le regard monte mais le palet se perd → revenir au maniement tête haute avant de tirer",
        "Le tir devient mou à force de regarder → c'est normal la première séance, la force revient ensuite",
      ],
      materiel: "20 palets\nChasubles",
      variantes:
        "Le donneur crie un coin au lieu de le montrer. Deux donneurs, un seul montre. Avec gardien : le tireur doit dire de quel côté le gardien s'est déplacé.",
      schema: {
        vue: "moitie",
        objets: [
          J(160, 100, "O"), P(140, 104),
          J(255, 160, "X"), P(240, 164),
          L("passe", [[236, 162], [176, 110]], "vert"),
          L("tir", [[134, 102], [50, 130]], "rouge"),
          J(60, 150, "G", "", "bleu"),
          J(95, 235, "C"),
          T(140, 60, "Il annonce ce que montre le donneur", "bleu", "petit"),
          T(230, 200, "Le donneur montre pendant l'armement", "vert", "petit"),
        ],
      },
    }),


    /* ── Apprendre et parfaire la passe ───────────────────────── */

    ex({
      id: "cat_amortir_reception",
      techniques: ["TS.M 1", "TS.M 4"],
      forme: "duo",
      nom: "Amortir : recevoir sans que le palet rebondisse",
      categorie: "passe",
      duree: 8,
      objectif: "Une réception ne s'attrape pas, elle s'accompagne : la palette recule quand le palet arrive.",
      description:
        "Par deux, à six mètres, à l'arrêt. Le donneur passe franchement — pas doucement, sinon il n'y a rien à amortir.\n\nLe receveur tend la palette vers le palet, puis la RECULE de vingt centimètres au moment du contact, comme on rattrape un œuf. Le palet doit mourir sur la palette : s'il rebondit, c'est raté, même si on le récupère.\n\nDix passes chacun, puis on recule d'un mètre. Le test : après la réception, le palet doit être immobile et sous contrôle, prêt à repartir.\n\nEnsuite, la même chose en revers : c'est le côté qu'on n'apprend jamais et qui lâche en match.",
      points_cles: [
        "La palette va CHERCHER le palet, puis recule au contact",
        "Palette légèrement fermée sur le palet, jamais verticale",
        "Les mains sont souples : des bras raides renvoient le palet",
        "Le palet doit s'arrêter mort, pas rebondir d'un mètre",
      ],
      corrections: [
        "Le palet rebondit et part → la palette n'a pas reculé, exagérer le retrait",
        "La palette est verticale → la fermer un peu vers le palet",
        "On attend le palet sans aller le chercher → tendre la crosse en avant avant qu'il arrive",
        "Bon en coup droit, catastrophique en revers → moitié du temps en revers, sans négocier",
        "On regarde le palet jusqu'au bout → une fois sur deux, annoncer un nombre montré par le donneur",
      ],
      materiel: "1 palet par duo",
      variantes:
        "En mouvement, sur la largeur. Le donneur passe de plus en plus fort. Réception en une touche derrière : amortir et redonner sans immobiliser. Sur un palet qui rebondit sur la bande.",
      schema: {
        vue: "moitie",
        objets: [
          J(80, 70, "O"), P(96, 74), J(230, 70, "O"),
          L("passe", [[102, 72], [214, 72]], "vert"),
          J(80, 150, "O"), P(96, 154), J(230, 150, "O"),
          L("passe", [[102, 152], [214, 152]], "vert"),
          J(80, 230, "O"), P(96, 234), J(230, 230, "O"),
          L("passe", [[102, 232], [214, 232]], "vert"),
          T(155, 40, "La palette recule au contact", "vert", "petit"),
          T(155, 275, "Le palet meurt sur la palette : pas de rebond", "rouge", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_revers_decompose",
      techniques: ["TS.M 3.2", "TS.M 1"],
      forme: "duo",
      nom: "La passe en revers, décomposée",
      categorie: "passe",
      duree: 8,
      objectif: "Le côté qu'on n'apprend jamais : passer du revers sans retourner la crosse.",
      description:
        "Par deux, à cinq mètres. Trois temps, et on ne passe au suivant que quand le précédent tient.\n\n1 · SANS PARTENAIRE. Le palet au talon de la palette côté revers. On le pousse contre la bande, dix fois, sans le lever. On cherche seulement le contact et le balayage.\n\n2 · À L'ARRÊT, à cinq mètres. La passe part du talon, la palette accompagne jusqu'au bout, la main basse tire. Le palet doit glisser à plat, pas sautiller.\n\n3 · LE CORPS ENTRE. Les hanches ouvrent vers le partenaire avant que les bras bougent. C'est ce qui donne la force qu'on croit chercher dans les poignets.\n\nDix passes, puis on échange le sens : chacun a un revers, personne n'en a deux.",
      points_cles: [
        "La crosse ne se retourne pas : le revers se passe avec l'autre face de la palette",
        "Le palet part du talon et sort par la pointe, comme en coup droit",
        "Les hanches ouvrent d'abord, les bras suivent",
        "La palette finit vers le partenaire et reste là",
      ],
      corrections: [
        "La crosse est retournée dans les mains → poser la main haute et refaire au ralenti",
        "Le palet sautille → la palette est trop ouverte, la fermer sur le palet",
        "La passe n'a aucune force → ce sont les hanches qui manquent, pas les poignets",
        "Le palet part vers les patins → finir le geste vers la poitrine du partenaire",
      ],
      materiel: "1 palet par duo\n1 crosse par joueur",
      variantes:
        "Contre la bande, seul, pour les premiers essais. En mouvement sur la largeur. Alterner coup droit et revers sur commande. Passe en revers par-dessus une crosse posée au sol.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 90, "O"), P(106, 96), J(220, 90, "O"),
          L("passe", [[112, 94], [204, 92]], "vert"),
          J(90, 200, "O"), P(106, 206), J(220, 200, "O"),
          L("echange", [[112, 204], [204, 202]], "vert"),
          J(155, 150, "C"),
          T(155, 55, "Le palet part du talon, la palette accompagne", "vert", "petit"),
          T(155, 265, "Les hanches ouvrent avant les bras", "bleu", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_controle_oriente",
      techniques: ["TS.M 4", "TS.P 19"],
      forme: "groupes3",
      nom: "Le contrôle orienté : recevoir et repartir de l'autre côté",
      categorie: "passe",
      niveau: "intermediaire",
      duree: 10,
      objectif: "Ne pas s'arrêter sur la réception : le palet arrive d'un côté et repart déjà de l'autre.",
      description:
        "Par trois, en triangle : un donneur, un relais au milieu, une cible. Le relais reçoit la passe du donneur et doit la renvoyer à la cible qui est DERRIÈRE lui, sur le côté.\n\nLa faute ordinaire est d'arrêter le palet, de se retourner, puis de passer — trois temps. On en cherche un seul : le palet est amorti déjà orienté vers la cible, le corps pivote pendant que le palet arrive, et la passe part dans la foulée.\n\nHuit passages, on tourne les rôles. Puis on met un joueur qui gêne — en chasuble, sans tacler : le relais doit se retourner du bon côté, c'est-à-dire du côté où il n'y a personne.",
      points_cles: [
        "Regarder par-dessus l'épaule AVANT que le palet arrive : on sait déjà où on va",
        "La palette amortit en orientant le palet vers la sortie, pas vers soi",
        "Le corps pivote pendant la réception, pas après",
        "Un seul temps : recevoir et repartir sont le même geste",
      ],
      corrections: [
        "Le palet est arrêté puis repris → imposer deux touches maximum, puis une",
        "On se retourne toujours du même côté → le gêneur se place au hasard",
        "La tête tourne après la réception → annoncer à voix haute la cible avant que le palet parte",
        "Le palet est amorti dans les patins → tendre la palette sur le côté, vers la sortie",
      ],
      materiel: "1 palet par trio\n4 plots\nChasubles",
      variantes:
        "Une touche obligatoire. Deux cibles : le relais choisit. Avec un gêneur actif, puis deux. En ajoutant un tir après la passe à la cible.",
      schema: {
        vue: "moitie",
        objets: [
          J(70, 150, "O", "D"), P(88, 156),
          J(170, 150, "O", "R"),
          J(255, 70, "O", "C"),
          L("passe", [[94, 154], [152, 152]], "vert"),
          L("passe", [[186, 142], [240, 82]], "vert"),
          L("pivot", [[168, 168], [182, 176], [190, 160]], "bleu"),
          K(140, 110), K(140, 190), K(210, 110), K(210, 190),
          J(90, 245, "C"),
          T(160, 235, "Recevoir et repartir : un seul temps", "bleu", "petit"),
          T(255, 105, "La cible est derrière, sur le côté", "vert", "petit"),
        ],
      },
    }),

  ];
  return liste.map((e, i) => ({ ...e, cree: t0 + i, modifie: t0 + i }));
}

/* Deux séances-types de soixante minutes, composées avec les exercices
   ci-dessus. Les identifiants de bloc sont fixes pour la même raison. */
const bloc = (i, exerciceId, titre, duree, note = "") => ({ id: `cbl_${i}`, exerciceId, titre, duree, note });

export function seancesDeBase() {
  return [seanceType(), seancePremiereGlace()];
}

function seanceType() {
  return {
    id: "cat_seance_type",
    titre: "Séance type — soixante minutes",
    date: "2026-09-22",
    heure: "20:30",
    groupe: "Adultes débutants",
    lieu: "",
    duree_glace: 60,
    objectif: "Une séance équilibrée : de la glisse, du palet, un peu de jeu, et personne ne repart frustré.",
    notes: "Prévoir les chasubles pour le trois contre trois. Si le groupe est fatigué, remplacer le relais par cinq minutes de passes en paires.",
    blocs: [
      bloc(1, "cat_tour_de_piste", "Tour de piste en patinage libre", 5),
      bloc(2, "cat_tomber_relever", "Tomber et se relever", 5),
      bloc(3, "cat_freinages", "Freinages de ligne en ligne", 10, "Insister sur le côté faible."),
      bloc(4, "cat_marche_arriere", "Marche arrière — poussées en C", 5),
      bloc(5, "cat_slalom_cones", "Slalom de cônes avec palet", 10),
      bloc(6, "cat_passes_paires", "Passes en paires, à l'arrêt", 7),
      bloc(7, "cat_tir_poignet", "Tirs du poignet depuis le haut du cercle", 10),
      bloc(8, "cat_relais", "Relais par équipes", 5),
      bloc(9, "cat_retour_au_calme", "Retour au calme et étirements", 3),
    ],
    cree: Date.UTC(2026, 8, 1),
    modifie: Date.UTC(2026, 8, 1),
  };
}

function seancePremiereGlace() {
  return {
    id: "cat_seance_premiere_glace",
    titre: "Première glace — apprivoiser la patinoire",
    date: "2026-09-15",
    heure: "20:30",
    groupe: "Adultes débutants",
    lieu: "",
    duree_glace: 60,
    objectif: "Que personne ne reparte avec la peur de la glace : tenir debout, tomber sans mal, s'arrêter, et déjà jouer un peu.",
    notes: "Échauffement hors glace huit minutes avant l'heure de glace. Pas de crosse sur la première demi-heure pour ceux qui n'ont jamais patiné. Prévoir un coach par groupe de six.",
    blocs: [
      bloc(101, "cat_marche_glisse", "Marcher, puis glisser", 8),
      bloc(102, "cat_tomber_relever", "Tomber et se relever", 5),
      bloc(103, "cat_feu_rouge_feu_vert", "Feu rouge, feu vert", 6, "Sans palet."),
      bloc(104, "cat_trottinette", "Poussées en trottinette", 6),
      bloc(105, "cat_arret_bandes", "Arrêt hockey face à la bande", 10, "Chasse-neige accepté pour les plus fragiles."),
      bloc(106, null, "Pause eau", 2),
      bloc(107, "cat_maniement_sur_place", "Maniement sur place — balayages et huit", 5),
      bloc(108, "cat_requins_sardines", "Requins et sardines", 8, "Les requins ne peuvent pas patiner vite : marche arrière ou un genou au sol."),
      bloc(109, "cat_tour_de_piste", "Tour de piste en patinage libre", 5),
      bloc(110, "cat_retour_au_calme", "Retour au calme et étirements", 5),
    ],
    cree: Date.UTC(2026, 8, 1),
    modifie: Date.UTC(2026, 8, 1),
  };
}
