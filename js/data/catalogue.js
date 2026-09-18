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
          L("patin", [[62, 90], [222, 90]]), L("patin", [[236, 90], [294, 90]]), L("patin", [[308, 90], [364, 90]]), L("patin", [[378, 90], [550, 90]]),
          L("patin", [[62, 130], [222, 130]]), L("patin", [[236, 130], [294, 130]]), L("patin", [[308, 130], [364, 130]]), L("patin", [[378, 130], [550, 130]]),
          T(215, 40, "Stop", "bleu"), T(288, 40, "Stop", "rouge"), T(357, 40, "Stop", "bleu"), T(535, 40, "Stop", "rouge"),
          J(300, 250, "C"),
        ],
      },
    }),

    ex({
      id: "cat_cinq_cercles",
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
      nom: "Maniement sur place — balayages et huit",
      categorie: "maniement",
      duree: 5,
      objectif: "Sentir le palet sur la palette sans avoir à penser à ses patins.",
      description:
        "Chacun avec un palet, bien espacés. Trente secondes par consigne :\n1. Balayages larges gauche-droite, la palette reste au contact du palet.\n2. Balayages courts et rapides devant soi.\n3. Le huit : le palet passe autour du patin droit, puis du patin gauche.\n4. Palet côté revers seulement, puis coup droit seulement.\n\nTête haute sur la dernière minute : le coach lève des doigts, les joueurs annoncent le nombre sans regarder le palet.",
      points_cles: ["Main du haut qui tourne, main du bas qui accompagne", "La palette reste au sol, on ne tape pas le palet", "Tête haute dès que c'est possible"],
      materiel: "Un palet par joueur.",
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
      nom: "Slalom de cônes avec palet",
      categorie: "maniement",
      duree: 10,
      objectif: "Conduire le palet en tournant, sans le perdre et sans s'arrêter.",
      description:
        "Deux files, une de chaque côté. Cinq cônes en ligne devant chaque file. On slalome avec le palet jusqu'au bout, on fait demi-tour et on revient en ligne droite par le côté. Départ suivant dès que le précédent a passé le deuxième cône.\n\nPremière série lentement, au contrôle. Deuxième série on accélère. Palet perdu : on le récupère et on continue, on ne saute pas de cône.",
      points_cles: ["Le palet passe devant le cône, le joueur derrière", "Coup droit d'un côté, revers de l'autre", "Le regard sur le cône suivant, pas sur le palet"],
      materiel: "10 cônes, un palet par joueur.",
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
      nom: "Passes en paires, à l'arrêt",
      categorie: "passe",
      duree: 8,
      objectif: "Le geste de la passe : balayer, pas taper. Et recevoir avec une palette souple.",
      description:
        "Par deux, face à face, à dix mètres. Passes coup droit pendant deux minutes, puis revers deux minutes, puis on s'éloigne à quinze mètres. Compter les passes réussies d'affilée : le duo qui tient le plus long annonce son score.\n\nLe coach passe derrière chaque duo et corrige la position des mains.",
      points_cles: ["Le palet part du talon de la palette vers la pointe, en balayant", "On vise la palette du partenaire, pas le joueur", "Recevoir : la palette accompagne, elle amortit"],
      materiel: "Un palet par duo.",
      variantes: "Passes levées (soulevées) par-dessus une crosse posée au sol. Un pas de côté entre chaque passe.",
      schema: {
        vue: "moitie",
        objets: [
          J(90, 70), J(210, 70, "O", "", "bleu"), L("passe", [[102, 66], [198, 66]], "rouge"), L("passe", [[198, 74], [102, 74]], "bleu"),
          J(90, 120), J(210, 120, "O", "", "bleu"), L("passe", [[102, 116], [198, 116]], "rouge"), L("passe", [[198, 124], [102, 124]], "bleu"),
          J(90, 180), J(210, 180, "O", "", "bleu"), L("passe", [[102, 176], [198, 176]], "rouge"), L("passe", [[198, 184], [102, 184]], "bleu"),
          J(90, 230), J(210, 230, "O", "", "bleu"), L("passe", [[102, 226], [198, 226]], "rouge"), L("passe", [[198, 234], [102, 234]], "bleu"),
          T(90, 28, "Coup droit deux minutes, puis revers", "noir", "petit"),
          J(270, 150, "C"),
        ],
      },
    }),

    ex({
      id: "cat_passe_et_suit",
      nom: "Passe et suit",
      categorie: "passe",
      duree: 8,
      objectif: "Passer puis bouger : la passe n'est pas la fin de l'action.",
      description:
        "Deux files face à face, à quinze mètres. Le premier de la file A passe au premier de la file B, puis patine pour se ranger derrière la file B. Celui qui a reçu passe au suivant de la file A et suit son palet de la même façon.\n\nUn seul palet en jeu par couple de files. Quand ça tourne bien, on ajoute un deuxième palet.",
      points_cles: ["Passe d'abord, on part ensuite", "On reçoit en mouvement, palette au sol, prêt avant l'arrivée du palet", "On patine large pour ne pas couper la ligne de passe"],
      materiel: "Un ou deux palets par couple de files.",
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
      nom: "Montée à deux avec passes",
      categorie: "passe",
      duree: 10,
      objectif: "Passer en patinant, à un partenaire qui bouge aussi — et finir par un tir.",
      description:
        "Par deux, départ de la ligne de but, un de chaque côté. On monte toute la patinoire en se faisant des passes (au moins quatre). Arrivés dans la zone d'en face, celui qui a le palet tire, l'autre va au rebond. Retour par les bandes, les deux suivants partent quand les premiers passent la ligne rouge.\n\nLe gardien est en cage si vous en avez un ; sinon, une cage vide fait très bien l'affaire.",
      points_cles: ["Passer devant le partenaire, dans sa course", "Rester à la même hauteur que son partenaire", "Le receveur montre sa palette au sol : c'est la cible"],
      materiel: "Des palets à la ligne de but.",
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
      nom: "Tirs du poignet depuis le haut du cercle",
      categorie: "tir",
      duree: 10,
      objectif: "Le tir du poignet : transférer le poids, balayer, finir la palette vers la cible.",
      description:
        "Deux files au haut des cercles, un tas de palets à chaque file. Chacun tire à son tour, sans se déplacer, puis va récupérer un palet derrière la cage et rejoint l'autre file.\n\nOn vise d'abord la cage, puis les coins : le coach annonce « en haut à gauche », etc. Les gardiens débutants : uniquement des tirs au sol les cinq premières minutes.",
      points_cles: ["Le palet part de derrière le pied arrière", "Poids qui passe de la jambe arrière à la jambe avant", "La palette finit pointée vers la cible, on « la ferme » sur le palet"],
      materiel: "Vingt palets, deux tas.",
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
      nom: "Contourner le cône et tirer",
      categorie: "tir",
      duree: 10,
      objectif: "Enchaîner : patiner, tourner avec le palet, tirer en mouvement.",
      description:
        "Deux files dans les coins de la zone, un cône devant chacune. Le premier part avec un palet, contourne le cône par l'extérieur, revient vers la cage et tire en mouvement. Il récupère son palet et se range dans l'autre file.\n\nOn alterne les deux files, un joueur à la fois. Le tir part avant la zone de but : pas de collision avec le gardien.",
      points_cles: ["Palet devant soi dans le virage, pas sur le côté", "Deux appuis après le cône, puis on tire", "Tirer en mouvement, sans s'arrêter"],
      materiel: "Deux cônes, des palets dans chaque coin.",
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
      nom: "Relais par équipes",
      categorie: "jeu",
      duree: 8,
      objectif: "Patiner vite, freiner, repartir — et rire un peu.",
      description:
        "Deux ou trois équipes, une file par équipe à la ligne de but. Au signal, le premier patine jusqu'au cône au bout, le contourne, revient et tape dans la main du suivant qui part. La première équipe dont tous les joueurs sont passés a gagné.\n\nManches successives : sans palet, avec palet, avec freinage obligatoire à la ligne rouge, en marche arrière sur la bleue-bleue.",
      points_cles: ["On contourne le cône, on ne le pousse pas", "Le suivant ne part qu'après la tape dans la main", "Freiner avant la file, pas dedans"],
      materiel: "Un cône par équipe, des palets.",
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
      materiel: "Chasubles de deux couleurs, un gardien si possible.",
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
  ];
  return liste.map((e, i) => ({ ...e, cree: t0 + i, modifie: t0 + i }));
}

/* Une séance-type de soixante minutes, composée avec les exercices
   ci-dessus. Les identifiants de bloc sont fixes pour la même raison. */
export function seanceDeBase() {
  const bloc = (i, exerciceId, titre, duree, note = "") => ({ id: `cbl_${i}`, exerciceId, titre, duree, note });
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
