// Registro delle squadre STORICHE della lega, con slug stabile.
// I campi `fantacalcioId` e `matchKeyword` sono presenti solo per le squadre
// attive nella stagione corrente: servono a `lib/bot/helper.ts` per collegare
// i dati di leghe.fantacalcio.it (id numerico) e per il matching dell'emoji
// nei nomi delle squadre restituiti dall'HTML del sito esterno.

export interface Squad {
  nome: string;
  colori: [string, string];
  emoji?: string;
  /** ID numerico su leghe.fantacalcio.it — solo squadre attive nella stagione corrente */
  fantacalcioId?: number;
  /** Keyword uppercase per il matching del nome nell'HTML di fantacalcio.it (es. "PANTHER") */
  matchKeyword?: string;
}

export const SQUADS: Record<string, Squad> = {
  wombo: {
    nome: "Wombo Team",
    colori: ["#1a1a2e", "#e94560"],
  },
  mcfly: {
    nome: "McFly",
    colori: ["#ff6b35", "#1d2d51"],
  },
  centro: {
    nome: "Centro Urbano Cairo",
    colori: ["#2c7a3a", "#f5c518"],
  },
  "team-culo": {
    nome: "Team Culo",
    colori: ["#8b0000", "#f0e6d3"],
  },
  novellini: {
    nome: "I Novellini",
    colori: ["#004e98", "#ffffff"],
  },
  "pirati-igna": {
    nome: "Pirati dell'Igna",
    colori: ["#1a1a1a", "#d4af37"],
  },
  "arrocco-corto": {
    nome: "Arrocco Corto",
    colori: ["#3d5a80", "#e0fbfc"],
  },
  "sarchiappone-team": {
    nome: "Sarchiappone Team",
    colori: ["#6b4226", "#f4e1c1"],
  },
  mangiamorte: {
    nome: "I Mangiamorte",
    colori: ["#2d2d2d", "#cc0000"],
  },
  "niente-male": {
    nome: "Niente Male",
    colori: ["#f5c518", "#1a1a1a"],
    emoji: "⚠️",
  },
  fininvest: {
    nome: "Fininvest FC",
    colori: ["#e040a0", "#c0007a"],
    emoji: "🌷",
    fantacalcioId: 3215983,
    matchKeyword: "FININVEST",
  },
  minnesota: {
    nome: "CM Minnesota",
    colori: ["#5b2d8e", "#1a1a1a"],
    emoji: "🐎",
    fantacalcioId: 3219043,
    matchKeyword: "MINNESOTA",
  },
  alnitakers: {
    nome: "Alnitakers",
    colori: ["#4a9edd", "#2176ae"],
    emoji: "🚀",
    fantacalcioId: 3216190,
    matchKeyword: "ALNITAKERS",
  },
  "pink-panther": {
    nome: "Pink Panther",
    colori: ["#f48fb1", "#90caf9"],
    emoji: "🐾",
    fantacalcioId: 3229172,
    matchKeyword: "PANTHER",
  },
  robotty: {
    nome: "Robotty FC",
    colori: ["#c0c0c0", "#1d2d51"],
  },
  ottavo: {
    nome: "Ottavo",
    colori: ["#2e7d32", "#1b5e20"],
    emoji: "🎱",
    fantacalcioId: 5325679,
    matchKeyword: "OTTAVO",
  },
  kapadokya: {
    nome: "Kapadokya FC",
    colori: ["#d32f2f", "#c8901a"],
    emoji: "🎈",
    fantacalcioId: 16108556,
    matchKeyword: "KAPADOKYA",
  },
  gorgeous: {
    nome: "Gorgeous FC",
    colori: ["#f48fb1", "#66bb6a"],
    emoji: "🪞",
    fantacalcioId: 16358145,
    matchKeyword: "GORGEOUS",
  },
  turkish: {
    nome: "Turkish Pizza&Kebab di Uslu Ismael",
    colori: ["#1a1a1a", "#2d2d2d"],
    emoji: "🌯",
    fantacalcioId: 16171071,
    matchKeyword: "TURKISH",
  },
  fanalini: {
    nome: "I Fanalini",
    colori: ["#e65100", "#1a1a1a"],
    emoji: "🚘",
    fantacalcioId: 3239361,
    matchKeyword: "FANALINI",
  },
  "latex-boys": {
    nome: "Latex Boys",
    colori: ["#1a1a1a", "#ffffff"],
    emoji: "🌚",
    fantacalcioId: 3218391,
    matchKeyword: "LATEX",
  },
};

export function getSquadName(slug: string): string {
  return SQUADS[slug]?.nome ?? slug;
}

export function getSquadData(slug: string): Squad {
  return (
    SQUADS[slug] ?? {
      nome: slug,
      colori: ["#1d2d51", "#e30b13"],
    }
  );
}

export function getSquadCrestPath(slug: string): string {
  return `/assets/squads/logos/${slug}.png`;
}

export function getSquadShirtPath(slug: string): string {
  return `/assets/squads/shirts/${slug}.png`;
}
