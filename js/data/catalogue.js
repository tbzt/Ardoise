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
      materiel: "Un couloir.",
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
          L("patin", [[160, 98], [160, 30]]), L("patin", [[160, 202], [160, 270]]),
          T(175, 45, "Arrêt", "rouge"), T(175, 262, "Arrêt", "rouge"),
          J(240, 150, "C"),
          T(60, 150, "Glisser lentement, tourner\nles hanches, raboter la glace", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_croises_cercle",
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
          L("libre", [[236, 100], [260, 88], [290, 112], [320, 88], [350, 112], [368, 100]]),
          L("libre", [[236, 200], [260, 188], [290, 212], [320, 188], [350, 212], [368, 200]]),
          T(240, 150, "glisse sur un pied jusqu'à la rouge, puis serpents", "noir", "petit"),
        ],
      },
    }),

    ex({
      id: "cat_virages_serres",
      nom: "Virages serrés autour des cônes",
      categorie: "patinage",
      duree: 8,
      objectif: "Tourner court, dans les deux sens, en gardant la vitesse.",
      description:
        "Quatre cônes en quinconce sur toute la longueur. On contourne chaque cône au plus près, en alternant le sens : gauche, droite, gauche, droite. Retour par la bande.\n\nPremier passage lentement, en glissant les deux patins parallèles dans le virage. Deuxième passage avec palet. Troisième : on se chronomètre.",
      points_cles: ["Les deux patins restent au sol dans le virage, celui de l'intérieur devant", "Se pencher vers le cône, la main basse presque à toucher la glace", "Sortir du virage en poussant, pour relancer"],
      materiel: "4 cônes.",
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
          L("patin", [[62, 100], [220, 100]]), L("arriere", [[236, 100], [364, 100]]), L("patin", [[378, 100], [550, 100]]),
          L("patin", [[62, 200], [220, 200]]), L("arriere", [[236, 200], [364, 200]]), L("patin", [[378, 200], [550, 200]]),
          T(150, 40, "Avant → demi-tour → arrière → demi-tour → avant"),
        ],
      },
    }),

    ex({
      id: "cat_conduite_tete_haute",
      nom: "Conduite tête haute",
      categorie: "maniement",
      duree: 6,
      objectif: "Patiner avec le palet en regardant le jeu, pas la palette.",
      description:
        "Tout le monde avec un palet, en boucle libre dans la zone, sans se rentrer dedans — c'est déjà un exercice. Le coach au centre lève des doigts, change de main, change de nombre : les joueurs annoncent à voix haute ce qu'ils voient.\n\nPuis le coach donne des consignes : « palet côté revers », « tout le monde s'arrête », « on change de sens ». Celui qui perd son palet le récupère et repart.",
      points_cles: ["Le palet devant soi, un peu sur le côté, pas sous les pieds", "Sentir le palet par la palette, pas par les yeux", "Regarder les autres : c'est le début du jeu"],
      materiel: "Un palet par joueur.",
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
      nom: "Requins et sardines",
      categorie: "jeu",
      duree: 8,
      objectif: "Protéger son palet en traversant, voler celui des autres : le jeu qui apprend l'esquive.",
      description:
        "Les sardines, chacune avec un palet, alignées sur la ligne de but. Deux requins sans palet au centre. Au signal, les sardines traversent jusqu'à l'autre ligne de but ; les requins essaient de leur prendre le palet. Une sardine sans palet devient requin.\n\nOn recommence dans l'autre sens jusqu'à ce qu'il ne reste que deux ou trois sardines : ce sont les gagnants, et les premiers requins de la manche suivante.",
      points_cles: ["Le corps entre le requin et le palet", "Changer de vitesse plutôt que de direction", "Les requins : la palette au sol, on soulève la crosse de l'autre"],
      materiel: "Un palet par joueur.",
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
      materiel: "Un palet par cercle.",
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
      nom: "Triangle de passes, en revers",
      categorie: "passe",
      duree: 8,
      objectif: "La passe du revers et la réception en mouvement — les deux gestes qu'on oublie toujours.",
      description:
        "Par trois, en triangle, à huit mètres. Le palet tourne dans un sens : chaque passe se fait en revers, chaque réception se fait en coup droit puis on pivote. Une minute, puis on inverse le sens : les passes sont en coup droit, les réceptions en revers.\n\nQuand ça tourne, les trois avancent lentement vers l'autre bout de la glace en gardant le triangle.",
      points_cles: ["Revers : la main du bas tire, la main du haut pousse, le palet part de la pointe", "La réception : palette au sol, inclinée sur le palet, et on amortit", "Se replacer après chaque passe, la palette montre la cible"],
      materiel: "Un palet par trio.",
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
      nom: "Passe contre la bande",
      categorie: "passe",
      duree: 6,
      objectif: "Se faire une passe à soi-même par la bande : dosage, angle, et récupération en mouvement.",
      description:
        "Le long de la bande, en patinant à vitesse moyenne : on passe le palet en diagonale vers la bande, devant soi, et on le récupère au rebond sans s'arrêter. Trois ou quatre rebonds sur la longueur, puis retour par le milieu.\n\nLe secret est dans l'angle : plus on passe loin devant, plus le palet revient loin. Les bandes rendent ce qu'on leur donne.",
      points_cles: ["Passer devant soi, jamais à hauteur", "Dosage : le palet doit revenir sur la palette, pas dans les patins", "Regarder la bande, pas le palet"],
      materiel: "Un palet par joueur.",
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
      nom: "Tir du revers",
      categorie: "tir",
      duree: 8,
      objectif: "Tirer du revers depuis l'enclave : le tir que personne ne travaille et que les gardiens détestent.",
      description:
        "Deux files dans l'enclave, un tas de palets chacune. On tire du revers, à l'arrêt d'abord : le palet au milieu de la palette côté revers, le poids qui passe sur la jambe avant, et la palette qui se referme vers le haut pour soulever.\n\nPuis en mouvement : deux poussées, tir. Alterner les files. Le gardien reste au sol les cinq premières minutes.",
      points_cles: ["Palet sur le revers, un peu en arrière du pied", "Poids sur la jambe avant au moment du tir", "La palette suit le palet et se ferme vers la cible"],
      materiel: "Vingt palets.",
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
      nom: "Passe du coin, tir en mouvement",
      categorie: "tir",
      duree: 10,
      objectif: "Recevoir en patinant vers la cage et tirer sans s'arrêter — le geste du match.",
      description:
        "Un passeur dans le coin avec les palets. Une file de tireurs à la ligne bleue. Le tireur part, patine vers l'enclave ; le passeur lui donne le palet dans sa course ; le tireur reçoit et tire en mouvement, sans reprise de contrôle.\n\nLe tireur va récupérer son palet et devient passeur ; le passeur rejoint la file. Changer de coin à mi-temps pour travailler l'autre côté.",
      points_cles: ["Le tireur part quand le passeur a le palet sur la palette", "Palette au sol, cible montrée : la passe arrive dans la course", "Recevoir et tirer dans le même mouvement, pas d'arrêt"],
      materiel: "Des palets dans le coin.",
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
      materiel: "Une dizaine de palets, un coach ou deux tireurs tranquilles.",
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
      nom: "Chat glacé",
      categorie: "jeu",
      duree: 5,
      objectif: "Accélérer, changer de direction, freiner — sans y penser, parce qu'on joue.",
      description:
        "Un ou deux chats avec une chasuble. Les autres s'échappent dans la zone. Touché = on se fige, jambes écartées, crosse en l'air. On est délivré quand un joueur libre passe entre nos patins… en glissant sur les genoux, ou plus simplement en tapant dans la main.\n\nManche de deux minutes, on change les chats. Le dernier libre est le chat suivant.",
      points_cles: ["Pour s'échapper : changer de direction, pas seulement de vitesse", "Freiner pour éviter, c'est permis et c'est le but", "Le chat : couper la trajectoire, ne pas courir derrière"],
      materiel: "Deux chasubles.",
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
      materiel: "10 cônes, 4 petites cages (ou des cônes en guise de cages).",
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
      materiel: "Deux cages mobiles (ou quatre cônes), chasubles, une réserve de palets.",
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
      materiel: "Quelques palets pour le coach.",
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
      nom: "Arrêts-départs au sifflet",
      categorie: "patinage",
      duree: 6,
      objectif: "Le démarrage explosif et l'arrêt net, enchaînés, des deux côtés.",
      description:
        "Tout le monde sur la largeur, face au coach. Sifflet : on démarre à fond. Sifflet : on s'arrête net. Sifflet : on repart. Les arrêts alternent côté gauche et côté droit — le coach l'annonce d'abord, puis ne l'annonce plus.\n\nDeux minutes de travail, une minute de récupération en patinage lent, trois fois.",
      points_cles: ["Départ : premiers pas courts et rapides, sur les pointes, buste penché", "Arrêt : hanches qui tournent, genoux qui plient, les deux patins rabotent", "Le côté faible autant que le fort"],
      materiel: "Un sifflet.",
      variantes: "Arrêt puis départ dans l'autre sens. Avec palet.",
      schema: {
        vue: "entiere",
        objets: [
          J(60, 70), J(60, 110), J(60, 150), J(60, 190), J(60, 230),
          L("patin", [[72, 70], [160, 70]]), L("patin", [[175, 70], [260, 70]]), L("patin", [[275, 70], [360, 70]]),
          L("patin", [[72, 230], [160, 230]]), L("patin", [[175, 230], [260, 230]]), L("patin", [[275, 230], [360, 230]]),
          T(150, 40, "Sifflet : départ — Sifflet : arrêt — gauche, droite, gauche…"),
          J(450, 150, "C"),
        ],
      },
    }),

    ex({
      id: "cat_slalom_marche_arriere",
      nom: "Slalom en marche arrière",
      categorie: "patinage",
      niveau: "intermediaire",
      duree: 8,
      objectif: "Reculer en changeant de direction : les poussées en C d'un seul côté, puis de l'autre.",
      description:
        "Cinq cônes en ligne, espacés de quatre mètres. On part dos aux cônes et on slalome en marche arrière : autour du premier par poussées en C du pied droit, autour du deuxième par le pied gauche, et ainsi de suite. Retour en avant par le côté.\n\nOn regarde par-dessus l'épaule du côté où on va. Lentement d'abord : le but est de ne pas toucher les cônes.",
      points_cles: ["Hanches basses, dos droit, la tête tourne vers le côté du virage", "Le patin extérieur au virage pousse en C, l'intérieur guide", "Ne pas s'arrêter entre deux cônes — la glisse continue"],
      materiel: "5 cônes par file.",
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
      nom: "Le parcours d'agilité",
      categorie: "patinage",
      duree: 10,
      objectif: "Tout enchaîner : slalom, virage serré, arrêt, marche arrière, sprint.",
      description:
        "Un circuit sur toute la glace, un départ toutes les dix secondes :\n1. Slalom entre trois cônes.\n2. Virage serré autour du cône de la ligne rouge.\n3. Arrêt complet sur la deuxième ligne bleue.\n4. Marche arrière jusqu'à la ligne rouge.\n5. Demi-tour et sprint jusqu'à la ligne de but.\n\nDeux passages au contrôle, puis on chronomètre. Chacun note son temps et essaie de le battre à la séance suivante.",
      points_cles: ["Propre avant rapide : un cône touché, on recommence", "Bas sur les patins dans chaque changement de direction", "Le sprint final : petits pas rapides puis grandes poussées"],
      materiel: "4 cônes, un chronomètre.",
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
      nom: "Protéger le palet, un contre un",
      categorie: "maniement",
      duree: 8,
      objectif: "Garder le palet quand quelqu'un le veut : le corps entre le défenseur et le palet.",
      description:
        "Par deux, le long de la bande, dans un carré de dix mètres. Le porteur garde le palet trente secondes ; le défenseur essaie de le prendre, sans charge, crosse sur crosse autorisée. Puis on inverse.\n\nLe porteur n'a pas le droit de sortir du carré. Il tourne, il se met dos au défenseur, il change de main sur la crosse si besoin. Le coach compte les secondes de possession.",
      points_cles: ["Dos au défenseur, le palet loin de lui, bras tendu", "Genoux fléchis, large sur les patins : on ne se fait pas bouger", "Tourner autour du palet plutôt que fuir avec"],
      materiel: "Des cônes pour marquer les carrés, un palet par duo.",
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
      nom: "Feintes autour du cône",
      categorie: "maniement",
      duree: 6,
      objectif: "Le premier dribble : tirer-pousser, coup droit-revers, en passant un cône immobile.",
      description:
        "Trois cônes en ligne, espacés de six mètres. À chaque cône, une feinte différente :\n1. Coup droit-revers : le palet passe d'un côté du cône, le joueur de l'autre.\n2. Tirer-pousser : on tire le palet vers soi puis on le pousse loin devant.\n3. La feinte de corps : les épaules d'un côté, le palet de l'autre.\n\nLentement, à l'arrêt presque, puis en patinant. Le cône ne bouge pas : c'est le moment d'oser.",
      points_cles: ["Les mains loin du corps pour avoir de l'amplitude", "Le palet passe loin du cône, le corps près", "Tête haute dès que le geste est acquis"],
      materiel: "3 cônes par file, un palet par joueur.",
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
      nom: "Le carré : conduite au signal",
      categorie: "maniement",
      duree: 6,
      objectif: "Conduire le palet en changeant de direction sur commande, sans regarder en bas.",
      description:
        "Un grand carré de cônes, tous dedans avec un palet, en patinage libre. Le coach donne des ordres : « à gauche ! », « demi-tour ! », « stop ! », « marche arrière ! », « changez de palet ! ». Tout le monde exécute sans se rentrer dedans.\n\nCelui qui perd son palet le récupère. Celui qui sort du carré fait trois pompes… ou pas, selon l'humeur du groupe.",
      points_cles: ["Regarder les autres, pas le palet — le carré est petit", "Le palet reste devant soi dans les changements de direction", "Sur « stop », le palet s'arrête avec le joueur"],
      materiel: "8 cônes, un palet par joueur.",
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
      materiel: "Un palet par joueur du bord.",
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
      nom: "Passes longues, réception en glissant",
      categorie: "passe",
      duree: 6,
      objectif: "Envoyer loin et fort, recevoir en mouvement une passe qui arrive vite.",
      description:
        "Par deux, face à face de chaque côté de la ligne rouge, à vingt mètres. Une passe longue et forte, le partenaire la reçoit en glissant vers elle, l'amortit, et renvoie. Toutes les trente secondes, on recule d'un pas.\n\nLa passe longue se fait avec tout le corps : poids qui bascule, crosse qui suit le palet jusqu'à la cible.",
      points_cles: ["Le palet part du talon de la palette, la crosse suit vers la cible", "Recevoir en glissant vers le palet, la palette légèrement inclinée", "Fort mais au sol : un palet qui saute ne se reçoit pas"],
      materiel: "Un palet par duo.",
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
      materiel: "Des palets à la ligne bleue.",
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
      nom: "Tour de cage et tir",
      categorie: "tir",
      duree: 8,
      objectif: "Passer derrière la cage avec le palet et tirer de l'autre côté avant que le gardien ne soit replacé.",
      description:
        "Une file dans chaque coin, un tas de palets. Le premier part avec un palet, passe derrière la cage en la serrant au plus près, ressort de l'autre côté et tire aussitôt, en revers ou en coup droit selon le côté. Il récupère son palet et va dans l'autre file.\n\nLes deux files alternent. Le gardien travaille ses déplacements poteau à poteau en même temps : c'est un exercice pour lui aussi.",
      points_cles: ["Le palet du côté de la cage, protégé par le corps", "Ressortir vite et tirer avant de s'arrêter", "Viser le côté que le gardien vient de quitter"],
      materiel: "Vingt palets.",
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
      nom: "Tir et rebond",
      categorie: "tir",
      duree: 8,
      objectif: "Le deuxième joueur va au rebond — c'est là que se marquent les buts des débutants.",
      description:
        "Une file au haut du cercle, une file dans l'enclave. Le premier de la file du cercle tire ; au moment du tir, le premier de l'enclave attaque la cage et pousse tout ce qui traîne : rebond du gardien, palet dévié, palet arrêté devant la ligne.\n\nLe tireur va ensuite dans la file de l'enclave, le rebondeur dans celle du cercle. Le gardien laisse volontairement des rebonds les premières minutes.",
      points_cles: ["Le rebondeur part au moment du tir, pas avant", "Crosse au sol devant la cage, prêt à pousser", "Ne pas gêner le gardien : on va au rebond, pas dans le gardien"],
      materiel: "Vingt palets.",
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
      materiel: "Des palets à la ligne bleue.",
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
      materiel: "Vingt palets, un tireur calme.",
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
      materiel: "Un palet par cercle.",
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
      materiel: "Des cônes pour les couloirs, chasubles.",
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
      materiel: "Chasubles, deux gardiens ou deux cages vides.",
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
      materiel: "Un ou deux palets.",
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
    groupe: "Adultes débutants, premières séances",
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
