/* Pdf — un générateur de PDF minuscule et sans dépendance.
   Ce qu'il sait faire, et rien de plus : des pages A4, du texte dans
   les trois Helvetica de base (normale, grasse, oblique — polices
   standard, donc jamais embarquées), des traits, des rectangles, et
   des images JPEG. C'est exactement ce qu'il faut pour une feuille de
   séance ; tout le reste serait du poids mort.

   Le repère de l'API est celui de l'écran : origine en haut à gauche,
   y vers le bas, en points (1/72 pouce). La conversion vers le repère
   PDF (origine en bas) se fait ici, une fois, et nulle part ailleurs. */

/* Largeurs des glyphes 32..126 (millièmes d'em), tirées des métriques
   AFM d'Helvetica et d'Helvetica-Bold. Les lettres accentuées ont la
   largeur de leur lettre de base — c'est vrai pour ces polices. */
const LARGEURS = {
  normal: [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584],
  gras: [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584],
};
const SPECIAUX = { "«": 556, "»": 556, "—": 1000, "–": 556, "’": 222, "‘": 222, "“": 333, "”": 333, "…": 1000, "°": 400, "·": 278, "€": 556, "•": 350, " ": 278 };

const POLICES = { normal: "F1", gras: "F2", oblique: "F3" };
const NOMS = { F1: "Helvetica", F2: "Helvetica-Bold", F3: "Helvetica-Oblique" };

/* Unicode → Windows-1252, l'encodage des polices standard. Ce qui n'y
   entre pas devient un point d'interrogation, sauf quelques cas qu'on
   sait traduire. */
const CP1252 = { "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87, "ˆ": 0x88, "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c, "Ž": 0x8e, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98, "™": 0x99, "š": 0x9a, "›": 0x9b, "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f };
const TRADUCTIONS = { "→": "->", "←": "<-", "↑": "^", "↓": "v", "→": "->", "✓": "v", "★": "*", "▲": "^", "●": "o", " ": " " };

function nettoyer(texte) {
  return String(texte ?? "").replace(/[→←↑↓✓★▲● ]/g, (c) => TRADUCTIONS[c] || "?");
}

function enOctets(texte) {
  const s = nettoyer(texte);
  const out = new Uint8Array(s.length);
  let n = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c < 0x80 || (c >= 0xa0 && c <= 0xff)) out[n++] = c;
    else if (CP1252[ch] !== undefined) out[n++] = CP1252[ch];
    else out[n++] = 0x3f;
  }
  return out.subarray(0, n);
}

function ascii(texte) {
  const out = new Uint8Array(texte.length);
  for (let i = 0; i < texte.length; i++) out[i] = texte.charCodeAt(i) & 0xff;
  return out;
}

function echapper(texte) {
  return nettoyer(texte).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\r?\n/g, " ");
}

const nombre = (n) => (Math.round(n * 100) / 100).toString();
const couleurOp = (c, op) => `${nombre(c[0] / 255)} ${nombre(c[1] / 255)} ${nombre(c[2] / 255)} ${op}`;

export function largeurTexte(texte, police = "normal", taille = 10) {
  const table = LARGEURS[police === "gras" ? "gras" : "normal"];
  let l = 0;
  for (const ch of nettoyer(texte)) {
    const c = ch.codePointAt(0);
    if (c >= 32 && c <= 126) l += table[c - 32];
    else if (SPECIAUX[ch]) l += SPECIAUX[ch];
    else if (c >= 0xc0 && c <= 0xff) {
      // lettre accentuée : largeur de la lettre de base
      const base = ch.normalize("NFD")[0].codePointAt(0);
      l += base >= 32 && base <= 126 ? table[base - 32] : 556;
    } else l += 556;
  }
  return (l / 1000) * taille;
}

/* Coupe un texte en lignes qui tiennent dans `largeur`. Les retours à
   la ligne du texte sont respectés ; un mot trop long est cassé. */
export function couperLignes(texte, police, taille, largeur) {
  const lignes = [];
  for (const para of String(texte ?? "").split(/\r?\n/)) {
    const mots = para.split(/\s+/).filter(Boolean);
    if (!mots.length) {
      lignes.push("");
      continue;
    }
    let ligne = "";
    for (let mot of mots) {
      while (largeurTexte(mot, police, taille) > largeur) {
        // mot plus long que la ligne : on le tronçonne
        let k = mot.length;
        while (k > 1 && largeurTexte(mot.slice(0, k), police, taille) > largeur) k--;
        if (ligne) lignes.push(ligne);
        ligne = "";
        lignes.push(mot.slice(0, k));
        mot = mot.slice(k);
      }
      const essai = ligne ? `${ligne} ${mot}` : mot;
      if (largeurTexte(essai, police, taille) <= largeur) ligne = essai;
      else {
        if (ligne) lignes.push(ligne);
        ligne = mot;
      }
    }
    lignes.push(ligne);
  }
  return lignes;
}

export function nouveauDocument({ largeur = 595.28, hauteur = 841.89 } = {}) {
  const pages = [];
  const images = []; // { octets, w, h }

  function nouvellePage() {
    const ops = [];
    const page = {
      largeur,
      hauteur,
      ops,
      numero: pages.length + 1,

      texte(x, y, texte, { police = "normal", taille = 10, couleur = [0, 0, 0] } = {}) {
        ops.push(`BT /${POLICES[police] || "F1"} ${nombre(taille)} Tf ${couleurOp(couleur, "rg")} 1 0 0 1 ${nombre(x)} ${nombre(hauteur - y)} Tm (${echapper(texte)}) Tj ET`);
      },

      /* Écrit des lignes déjà coupées, en descendant ; renvoie le y final. */
      lignes(x, y, lignes, { police = "normal", taille = 10, couleur = [0, 0, 0], interligne = 1.3 } = {}) {
        for (const l of lignes) {
          if (l) this.texte(x, y, l, { police, taille, couleur });
          y += taille * interligne;
        }
        return y;
      },

      ligne(x1, y1, x2, y2, { epaisseur = 0.5, couleur = [0, 0, 0] } = {}) {
        ops.push(`q ${couleurOp(couleur, "RG")} ${nombre(epaisseur)} w ${nombre(x1)} ${nombre(hauteur - y1)} m ${nombre(x2)} ${nombre(hauteur - y2)} l S Q`);
      },

      rect(x, y, w, h, { remplissage = null, contour = null, epaisseur = 0.5 } = {}) {
        let op = "";
        if (remplissage) op += couleurOp(remplissage, "rg") + " ";
        if (contour) op += couleurOp(contour, "RG") + ` ${nombre(epaisseur)} w `;
        const mode = remplissage && contour ? "B" : remplissage ? "f" : "S";
        ops.push(`q ${op}${nombre(x)} ${nombre(hauteur - y - h)} ${nombre(w)} ${nombre(h)} re ${mode} Q`);
      },

      image(id, x, y, w, h) {
        ops.push(`q ${nombre(w)} 0 0 ${nombre(h)} ${nombre(x)} ${nombre(hauteur - y - h)} cm /Im${id} Do Q`);
      },
    };
    pages.push(page);
    return page;
  }

  function ajouterImage(octetsJpeg, w, h) {
    images.push({ octets: octetsJpeg, w, h });
    return images.length;
  }

  function generer() {
    const morceaux = [];
    let position = 0;
    const offsets = [];
    const pousser = (o) => {
      morceaux.push(o);
      position += o.length;
    };
    const objet = (num, corps, flux = null) => {
      offsets[num] = position;
      pousser(ascii(`${num} 0 obj\n${corps}\n`));
      if (flux) {
        pousser(ascii("stream\n"));
        pousser(flux);
        pousser(ascii("\nendstream\n"));
      }
      pousser(ascii("endobj\n"));
    };

    pousser(ascii("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"));
    // 1 catalogue, 2 pages, 3-5 polices, puis images, puis pages + contenus
    const premiereImage = 6;
    const premierePage = premiereImage + images.length;
    const refsPages = pages.map((_, i) => `${premierePage + i * 2} 0 R`).join(" ");

    objet(1, "<< /Type /Catalog /Pages 2 0 R >>");
    objet(2, `<< /Type /Pages /Kids [${refsPages}] /Count ${pages.length} >>`);
    let n = 3;
    for (const [id, nom] of Object.entries(NOMS)) {
      objet(n++, `<< /Type /Font /Subtype /Type1 /BaseFont /${nom} /Encoding /WinAnsiEncoding >>`);
      void id;
    }
    images.forEach((im, i) => {
      objet(premiereImage + i, `<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.octets.length} >>`, im.octets);
    });
    const xobjects = images.map((_, i) => `/Im${i + 1} ${premiereImage + i} 0 R`).join(" ");
    pages.forEach((p, i) => {
      const numPage = premierePage + i * 2;
      const numContenu = numPage + 1;
      objet(
        numPage,
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${nombre(largeur)} ${nombre(hauteur)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> /XObject << ${xobjects} >> >> /Contents ${numContenu} 0 R >>`,
      );
      const contenu = enOctets(p.ops.join("\n"));
      objet(numContenu, `<< /Length ${contenu.length} >>`, contenu);
    });

    const total = premierePage + pages.length * 2;
    const xref = position;
    let table = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let i = 1; i < total; i++) table += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    pousser(ascii(table));
    pousser(ascii(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));

    const out = new Uint8Array(position);
    let k = 0;
    for (const m of morceaux) {
      out.set(m, k);
      k += m.length;
    }
    return out;
  }

  return { nouvellePage, ajouterImage, generer, pages, largeur, hauteur };
}
