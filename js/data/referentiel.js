/* Référentiel — les fiches techniques du « Programme de développement
   du joueur à long terme » (Marc Peythieu et Lionel Charrier, DTN,
   FFHG, 2016) et les formes de travail du Module A fédéral.

   Chaque fiche porte son code (TF.M, TF.A, TS.P, TS.M), ses points clés
   et ses corrections, condensés depuis le document. Un exercice peut
   se rattacher à une ou plusieurs fiches : c'est ce qui permet de dire,
   pour un groupe, quelles techniques ont été travaillées et lesquelles
   ne l'ont jamais été. Les textes sont des résumés : la fiche complète,
   avec ses vidéos de référence et de correction, reste le document. */

export const FORMES_TRAVAIL = {
  actif: "Tout le monde actif, sur place ou en déplacement",
  vagues: "Passage par vagues (2 ou 3 au maximum)",
  groupes3: "Groupes de 3 sur parcours ciblé (1 ou 2 éléments)",
  parcours: "Parcours long : 4 en activité au moins, 4 en attente au plus",
  duo: "Collaboration à 2",
  relais: "Course relais (groupes de 3 au maximum)",
};

export const FAMILLES = {
  TF: "Habiletés fondamentales",
  TSP: "Techniques spécifiques — patinage",
  TSM: "Techniques spécifiques — maniement et conduite",
};

const f = (code, famille, nom, points = [], corrections = [], u9 = false) => ({ code, famille, nom, points, corrections, u9 });

export const FICHES = [
  f("TF.M 1", "TF", "Poussée", [], [], true),
  f("TF.M 2", "TF", "Carres – appuis", [], [], true),
  f("TF.M 3", "TF", "Glisse", [], [], true),
  f("TF.A 1", "TF", "Équilibre", [], [], true),
  f("TF.A 2", "TF", "Dissociation", [], [], true),

  f("TS.P 1", "TSP", "Positions de base",
    ["Flexion prononcée des chevilles, genoux alignés aux pointes des patins", "Mains et coudes dégagés en avant du buste, prise de crosse à la largeur des épaules", "Patins parallèles à la largeur des épaules, lames à plat", "Toute la lame de la palette sur la glace, tête droite, regard vers l'avant"],
    ["Flexion des chevilles absente ou insuffisante", "Main du haut collée au corps, coudes collés", "Jambes en trépied, appuis en carres internes", "Tronc trop fléchi, dos rond"], true),
  f("TS.P 2", "TSP", "Allure de train avant",
    ["Genou devant la pointe du patin de la jambe d'appui, buste et regard vers l'avant", "Transfert du poids sur la jambe qui glisse, retour du patin sous le corps", "Extension complète hanche-jambe-cheville, poussée sur le côté", "Bras utilisés vers l'avant"],
    ["Dos rond", "Pas de phase de glisse, recouvrement insuffisant", "Poussée vers l'arrière ou vers le haut (« bouchon »)", "Talons-fesses, patins qui traînent, pose en V"], true),
  f("TS.P 3", "TSP", "Allure de train arrière",
    ["Flexion cheville-genou, dos droit, regard vers l'avant", "Crosse à une main en contact permanent avec la glace", "Transfert du poids sur la jambe de glisse, retour complet du patin sous le corps", "Poussée sur le côté, alternance et symétrie poussée-recouvrement"],
    ["Dos rond, nuque cassée, buste trop penché", "Poids jamais sur une seule jambe", "« Twist » : les deux patins toujours en contact", "Dissymétrie côté fort"], true),
  f("TS.P 4", "TSP", "Patinage « C-Cut »",
    ["Flexion de la jambe de glisse, buste légèrement en avant, crosse devant soi", "Patins à la largeur des épaules, genoux tenus écartés", "Poussée alternée en C avec le talon en fin de poussée", "Alternance poussée-glisse, dissociation buste-jambes"],
    ["Déséquilibre arrière", "Patins trop écartés, jambes en trépied", "Poussée en twist, éloignée du corps", "Carre pas utilisée jusqu'au talon"], true),
  f("TS.P 5", "TSP", "Patinage « Scooter »",
    ["Poids sur la jambe de glisse : flexions, carre externe, forte inclinaison vers l'intérieur", "Poussée latérale avec toute la lame, extension complète", "Recouvrement complet en contact avec la glace", "Buste droit, épaules en rotation inverse, palette à l'opposé du poids"],
    ["Faible prise de carre externe, appui en talon", "Allègement simultané à la poussée (sautillement)", "Poussée avec la pointe, trop vers l'arrière", "Dos rond, mains croisées"], true),
  f("TS.P 6", "TSP", "Patinage « Finlandais »",
    ["Buste droit, coudes et mains dégagés, crosse à deux mains sur la glace", "Transfert du poids sur la jambe de glisse (patin d'appel)", "Allègement et ouverture du second patin sans contact, puis reprise talons resserrés", "Inclinaison importante vers l'intérieur, flexions maintenues"],
    ["Poids réparti sur les deux patins, fesses en arrière", "Appréhension de l'ouverture, dos rond", "Talons trop écartés, appuis en talon", "Appui sur la crosse pour compenser le déséquilibre"], true),
  f("TS.P 7", "TSP", "Virage avant brusque",
    ["Compression (abaissement) en entrée de virage, genoux fortement fléchis", "Engagement avec la crosse et le patin intérieur", "Déséquilibre vers l'intérieur, appui sur les deux patins légèrement sur le talon", "Patins décalés : pointe extérieure derrière talon intérieur ; crosse et regard vers la sortie"],
    ["Manque de compression", "Engagement avec le patin extérieur, ou patin intérieur trop tardif", "Appui extérieur principal, patin intérieur faible", "Patins parallèles et trop écartés, regard bas"], true),
  f("TS.P 8", "TSP", "Virage arrière",
    ["Coudes et mains dégagés, tête-regard-épaules vers l'intérieur", "Trajectoire d'entrée large avec déséquilibre intérieur", "Patin extérieur en avance en carre interne, patin intérieur en carre externe", "Compression importante, buste droit, poussée de reprise croisée"],
    ["Coudes collés, pas de rotation du buste", "Trajectoire pas assez large", "Patins serrés, sans décalage", "Absence de flexions, dos rond"], true),
  f("TS.P 9", "TSP", "Croisés avant",
    ["Ligne des épaules horizontale, dissociation buste-jambes", "Le poids toujours sur la jambe de glisse", "Poussée complète de la jambe extérieure, montée de genou au recouvrement", "Maîtrise de la glisse et de la poussée sur carre externe et interne"],
    ["Déséquilibre intérieur insuffisant", "Montée de genou insuffisante, patin à peine amené dans l'axe", "Appui plutôt que poussée, extensions incomplètes", "Pointe du patin qui traîne, pas de maîtrise de la carre externe"], true),
  f("TS.P 10", "TSP", "Croisés arrière",
    ["Buste droit, épaules horizontales, coudes dégagés, coordination bras-jambes", "Poids toujours sur la jambe de glisse", "Extensions complètes en latéralité sur les deux carres", "Recouvrement vers l'intérieur pour agrandir les trajectoires, ramené en carre interne"],
    ["Buste cassé vers l'avant, regard vers l'arrière", "Montée de genou insuffisante", "Patin trop éloigné de la glace, pose à plat", "Poussée verticale (« bouchonnage »)"], true),
  f("TS.P 11", "TSP", "Démarrage avant en « V »",
    ["Allègement-compression, déséquilibre sur l'avant des lames, talons resserrés pieds ouverts", "Première poussée longue vers l'avant", "Tirage des genoux vers l'avant, appuis en impact sans glisse", "Poussées latérales, coudes très dégagés puis resserrés, tête haute"],
    ["Première poussée vers le haut, on se grandit sur les pointes", "Montées de genou insuffisantes, foulées courtes", "Poussées fuyantes vers l'arrière", "Tête basse"], true),
  f("TS.P 12", "TSP", "Démarrage avant de côté",
    ["Dos placé, coudes et crosse dégagés, allègement-compression dynamique", "Déséquilibre : poids sur la première jambe pour prendre les carres", "Poussées interne et externe simultanées sur les deux tiers avant de la lame", "Épaules perpendiculaires à la trajectoire, rotation du buste simultanée aux poussées"],
    ["Poids mal positionné, genoux et patins resserrés", "Faible poussée en carre interne du second patin", "Rotation du buste trop tôt", "Flexions non maintenues"], true),
  f("TS.P 13", "TSP", "Démarrage arrière en « C »",
    ["Regard vers l'avant, buste droit légèrement penché, épaules de face", "Patin de poussée en opposition, patin pivot décalé en arrière et en pointe", "Poids du corps sur le patin de poussée, extension complète", "Rotation du buste simultanée à la poussée"],
    ["Épaules de profil, coudes collés", "Patins en chasse-neige, genoux resserrés", "Poids retiré de la jambe de poussée trop tôt", "Trajectoire de poussée pas refermée"]),
  f("TS.P 14", "TSP", "Démarrage arrière croisé",
    ["Position de départ entièrement de profil, en allègement", "Patin de poussée en avance et en opposition fermée, forte compression", "Première poussée à forte composante avant, seconde poussée croisée latérale", "Recouvrement avec talon à hauteur du genou"],
    ["Mise en place de face", "Compression simultanée au déclenchement", "Trajectoires trop grandes, désaxage", "Poussées en S, recouvrement proche de la glace"]),
  f("TS.P 15", "TSP", "Freinage avant",
    ["Le freinage intervient dans la continuité d'une poussée, sans phase de glisse", "Rapide mise en opposition du premier patin, rotation inverse du buste, allègement", "Carre interne du premier patin, carre externe du second, pression égale une fois parallèles", "Absorption par flexion des deux jambes, pointe du premier patin au talon du second"],
    ["Phase de glisse sans engagement, redressement, déséquilibre arrière", "Mise en opposition longue", "Faible prise de carre externe du second patin", "Extension de la première jambe, longue distance de freinage"], true),
  f("TS.P 16", "TSP", "Freinage arrière en « T »",
    ["Redressement du buste, regard vers l'avant, poids sur la jambe de glisse", "Ouverture de la jambe de freinage en contact avec la glace", "Transfert progressif du poids vers la jambe de freinage, mise en pointe du patin de glisse", "Patins à la largeur des épaules, buste droit"],
    ["Phase de glisse à deux pieds", "Patin de glisse pas assez sous le corps", "Pression forte appliquée trop tôt, fuite du patin", "Démarrage effectué avec la jambe de glisse"]),
  f("TS.P 17", "TSP", "Freinage arrière en « V »",
    ["Flexions chevilles et genoux maintenues dans toutes les phases", "Allègement par redressement du buste, patins écartés au-delà des épaules avant ouverture", "Mise en opposition progressive avec augmentation de l'écartement et des flexions", "Alignement épaules-bassin-patins, rapprochement des talons"],
    ["Impossibilité d'alléger faute de flexions initiales", "Ouverture des patins difficile", "Pression déséquilibrée, dérapage non contrôlé", "Tassement, dos arrondi, fesses en arrière"]),
  f("TS.P 18", "TSP", "Freinage arrière parallèle",
    ["Amorce liée à une poussée et un recouvrement, poids sur la jambe en recouvrement", "Allègement, redressement et rotation des épaules simultanés", "Carre interne de la première jambe, carre externe de la seconde, patins décalés", "Flexions importantes pour absorber la compression"],
    ["Poids également réparti, pas de lien avec une poussée", "Absence de rotation des épaules", "Freinage en carre interne uniquement", "Tassement du dos en compression"], true),
  f("TS.P 19", "TSP", "Pivot avant → arrière en ouverture",
    ["Ouverture liée à une poussée complète, poids sur la jambe d'appel", "Rotation lancée par les épaules, sans rupture des flexions", "Retour de la jambe de poussée avec rapprochement des talons", "Transfert du poids et poussée de reprise, enchaînement en allure arrière"],
    ["Ouverture non liée à une poussée, rupture du rythme", "Saut pour lancer la rotation, tête enfoncée", "Phase de glisse à deux pieds", "Retard ou blocage de la rotation des épaules"], true),
  f("TS.P 20", "TSP", "Pivot arrière → avant en ouverture",
    ["Ouverture liée à une poussée complète, jambe d'appel sous le buste", "Maintien des flexions, ouverture prononcée des hanches, talons rapprochés", "Rotation des épaules coordonnée avec l'alternance des poussées", "Pose en ouverture et pleine lame du patin de poussée"],
    ["Poussée incomplète ou fuyante", "Rotation des épaules trop précoce", "Grand bond, patins trop écartés", "Pose en talon, tirage insuffisant"]),
  f("TS.P 21", "TSP", "Demi-pivot avant → arrière glissé",
    ["Coudes et mains dégagés, rotations inverses épaules-hanches pour rester face au jeu", "Approche : toute la courbe montante en avant, forte avance du patin d'appel", "Allègement et rotation au sommet de la courbe, jambe d'appel fléchie sous le buste", "Engagement des talons dans la partie descendante, poussées de reprise sans glisse"],
    ["Absence de dissociation épaules-hanches", "Avance insuffisante du patin d'appel, manque de compression", "Patin de poussée toujours en contact", "Phase de glisse avant la poussée de reprise"]),
  f("TS.P 22", "TSP", "Demi-pivot avant → arrière freiné",
    ["Crosse à une main, motricité des bras, rester face au jeu", "Amorce liée à une poussée complète, allègement par redressement", "Mise en opposition du patin d'appel puis du patin de poussée", "Compression brève avec inclinaison importante, poussées de reprise depuis des flexions importantes"],
    ["Phase de glisse à deux pieds, rotation anticipée", "Les deux patins en opposition simultanément", "Patins pas assez décalés", "Extension incomplète, déséquilibre avant"]),
  f("TS.P 23", "TSP", "Demi-pivot arrière → avant en ouverture",
    ["Amorce : poussée presque complète qui place le poids sur la jambe d'appel", "Buste droit, épaules progressivement vers l'extérieur", "Jambe de poussée genou sous le buste, patin en pointe en contact", "Poussées de reprise : changement de sens des épaules, fort tirage du genou"],
    ["Amorce par phase de glisse", "Épaules vers l'intérieur, tassement", "Ouverture des hanches trop précoce", "Pose du patin de poussée trop tôt ou trop tard"]),

  f("TS.M 1", "TSM", "Maniement dans tous les plans",
    ["Patins à la largeur des épaules, flexion prononcée des chevilles", "Mains en avant du buste, coudes dégagés, prise de crosse à la largeur des épaules", "Poignet, avant-bras et bras dans la rotation ; trajectoire de crosse en translation", "Tête haute : le palet en vision périphérique"],
    ["Redressement sur chaque dribble", "Main haute collée au buste, coude bas en hyper-extension", "Dribble en arc de cercle ou en diagonale", "Regard centré sur le palet"], true),
  f("TS.M 2", "TSM", "Maniement entre les plans",
    ["Position de base tenue, palet proche des patins", "Rotation du buste dans les plans latéraux, pas des patins", "Pas de coulisse des mains dans la zone d'amplitude des bras", "Allègement et transfert du poids avec glissement des patins"],
    ["Palet trop éloigné des patins, mains trop basses", "Rotation des patins ou patins trop décalés", "Coulisse au-delà de l'amplitude des bras", "Regard centré sur le palet"], true),
  f("TS.M 3.1", "TSM", "« Bouger » autour du palet — coup droit",
    ["Buste droit, flexions importantes ; virages engagés avec le patin intérieur", "Alternance des plans, de latéral coup droit à latéral revers", "Travail des bras autour du buste, dissociation haut-bas", "Ce sont les patins qui se déplacent : le palet reste sur un axe restreint"],
    ["Engagement avec le patin extérieur", "Simple conduite dans le plan avant coup droit", "Phase de glisse entre les virages", "Déplacement important du palet"], true),
  f("TS.M 3.2", "TSM", "« Bouger » autour du palet — revers", ["Mêmes repères que le coup droit, palette côté revers"], [], true),
  f("TS.M 4", "TSM", "Maniement en éloignement / rapprochement",
    ["Mains en avant, coudes dégagés, patins à la largeur des épaules, appui en carre interne", "Le transfert du poids accompagne l'éloignement et le rapprochement", "Éloignement : coulisse maximale sans que les gants se touchent", "Coup droit : palette en contact ; revers : la palette quitte la glace pour la reprise"],
    ["Dos rond, patins en trépied", "Allègement insuffisant, appui en carre externe", "Coulisse incomplète", "Main basse trop proche de la palette, coude en extension"], true),
];

export function fiche(code) {
  return FICHES.find((x) => x.code === code) || null;
}

export function fichesParFamille() {
  const out = {};
  for (const x of FICHES) (out[x.famille] = out[x.famille] || []).push(x);
  return out;
}
