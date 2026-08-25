// Fonte unica di verità per gli allenatori della lega.
// halloffame.ts (campionati/coppe/retrocessioni) viene derivato da qui via
// id, incrociando con ALBO_D_ORO. Le squadre sono referenziate per slug
// (vedi squads.ts), non per nome libero.
//
// NOTA STORICA: il numero di partecipanti alla lega è cambiato negli anni
// (6 nella 1.0, 8 nella 2.0, poi 6, poi 8, poi salito a 10 dalla 8.0 con l'ingresso di
// Fogliato, Testolin e Gasparella).

export interface SquadEntry {
  squadId: string; // slug stabile, chiave di SQUADS
  dal: string; // edizione inizio (es. "1.0")
  al: string | null; // edizione fine, null = squadra attuale
}

export interface Manager {
  id: string;
  nome: string;
  fotoColore: string; // es. "/assets/managers/giovanni-ferracin.jpg"
  fotoBN: string; // es. "/assets/managers/bw/ferracin.jpg"
  presenteDal: string;
  presenteFinoAl: string | null;
  squadre: SquadEntry[];
}

export const MANAGERS: Manager[] = [
  {
    id: "ferracin",
    nome: "Giovanni Ferracin",
    fotoColore: "/assets/managers/giovanni-ferracin.jpg",
    fotoBN: "/assets/managers/bw/ferracin.jpg",
    presenteDal: "1.0",
    presenteFinoAl: null,
    squadre: [
      { squadId: "wombo", dal: "1.0", al: "1.0" },
      { squadId: "mcfly", dal: "2.0", al: "5.0" },
      { squadId: "fininvest", dal: "6.0", al: null },
    ],
  },
  {
    id: "dalsanto",
    nome: "Giacomo Dal Santo",
    fotoColore: "/assets/managers/giacomo-dal-santo.jpg",
    fotoBN: "/assets/managers/bw/dalsanto.jpg",
    presenteDal: "1.0",
    presenteFinoAl: null,
    squadre: [
      { squadId: "team-culo", dal: "1.0", al: "3.0" },
      { squadId: "minnesota", dal: "4.0", al: null },
    ],
  },
  {
    id: "zaninandrea",
    nome: "Andrea Zanin",
    fotoColore: "/assets/managers/andrea-zanin.jpg",
    fotoBN: "/assets/managers/bw/zaninandrea.jpg",
    presenteDal: "1.0",
    presenteFinoAl: null,
    squadre: [
      { squadId: "novellini", dal: "1.0", al: "7.0" },
      { squadId: "alnitakers", dal: "8.0", al: null },
    ],
  },
  {
    id: "zaninriccardo",
    nome: "Riccardo Zanin",
    fotoColore: "/assets/managers/riccardo-zanin.jpg",
    fotoBN: "/assets/managers/bw/zaninriccardo.jpg",
    presenteDal: "1.0",
    presenteFinoAl: null,
    squadre: [
      { squadId: "pirati-igna", dal: "1.0", al: "6.0" },
      { squadId: "pink-panther", dal: "7.0", al: null },
    ],
  },
  {
    id: "dalbianco",
    nome: "Samuele Dal Bianco",
    fotoColore: "/assets/managers/samuele-dal-bianco.png",
    fotoBN: "/assets/managers/bw/dalbianco.png",
    presenteDal: "1.0",
    presenteFinoAl: "7.0",
    squadre: [{ squadId: "robotty", dal: "1.0", al: "7.0" }],
  },
  {
    id: "ponzioandrea",
    nome: "Andrea Ponzio",
    fotoColore: "/assets/managers/andrea-ponzio.jpg",
    fotoBN: "/assets/managers/bw/ponzioandrea.jpg",
    presenteDal: "4.0",
    presenteFinoAl: null,
    squadre: [
      { squadId: "arrocco-corto", dal: "4.0", al: "5.0" },
      { squadId: "ottavo", dal: "6.0", al: null },
    ],
  },
  {
    id: "vezzaro",
    nome: "Filippo Vezzaro",
    fotoColore: "/assets/managers/filippo-vezzaro.jpg",
    fotoBN: "/assets/managers/bw/vezzaro.jpg",
    presenteDal: "1.0",
    presenteFinoAl: "1.0",
    squadre: [{ squadId: "sarchiappone-team", dal: "1.0", al: "1.0" }],
  },
  {
    id: "popovic",
    nome: "Velimir Popovic",
    fotoColore: "/assets/managers/velimir-popovic.jpg",
    fotoBN: "/assets/managers/bw/popovic.jpg",
    presenteDal: "1.0",
    presenteFinoAl: null,
    squadre: [
      { squadId: "mangiamorte", dal: "1.0", al: "2.0" },
      { squadId: "fanalini", dal: "3.0", al: null },
    ],
  },
  {
    id: "ponziomattia",
    nome: "Mattia Ponzio",
    fotoColore: "/assets/managers/mattia-ponzio.jpg",
    fotoBN: "/assets/managers/bw/ponziomattia.jpg",
    presenteDal: "1.0",
    presenteFinoAl: null,
    squadre: [
      { squadId: "niente-male", dal: "2.0", al: "8.0" },
      { squadId: "latex-boys", dal: "9.0", al: null },
    ],
  },
  {
    id: "fogliato",
    nome: "Riccardo Fogliato",
    fotoColore: "/assets/managers/riccardo-fogliato.jpg",
    fotoBN: "/assets/managers/bw/fogliato.jpg",
    presenteDal: "8.0",
    presenteFinoAl: null,
    squadre: [{ squadId: "kapadokya", dal: "8.0", al: null }],
  },
  {
    id: "testolin",
    nome: "Alberto Testolin",
    fotoColore: "/assets/managers/alberto-testolin.jpg",
    fotoBN: "/assets/managers/bw/testolin.jpg",
    presenteDal: "8.0",
    presenteFinoAl: null,
    squadre: [{ squadId: "gorgeous", dal: "8.0", al: null }],
  },
  {
    id: "gasparella",
    nome: "Paolo Gasparella",
    fotoColore: "/assets/managers/paolo-gasparella.jpg",
    fotoBN: "/assets/managers/bw/gasparella.jpg",
    presenteDal: "8.0",
    presenteFinoAl: null,
    squadre: [{ squadId: "turkish", dal: "8.0", al: null }],
  },
  {
    id: "amedeo",
    nome: "Federico Amedeo",
    fotoColore: "/assets/managers/federico-amedeo.jpg",
    fotoBN: "/assets/managers/bw/amedeo.jpg",
    presenteDal: "2.0",
    presenteFinoAl: "2.0",
    squadre: [{ squadId: "centro", dal: "2.0", al: "2.0" }],
  },
];
