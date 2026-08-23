import { MANAGERS, type Manager } from "@/lib/data/managers";
import { getSquadName } from "@/lib/data/squads";

export interface Edizione {
  edizione: string;
  stagione: string;
  campionatoId: string;
  versioneCoppa: string | null;
  coppaId: string | null;
  versioneSupercoppa: string | null;
  supercoppaId: string | null;
  retrocessoId: string;
  retrocessoSquadId: string;
}

export interface Palmares {
  campionati: string[];
  coppe: string[];
  supercoppe: string[];
  retrocessioni: string[];
}

export interface MedagliereRow {
  manager: Manager;
  campionati: string[];
  coppe: string[];
  supercoppe: string[];
  retrocessioni: string[];
}

// Dati per stagione: chi vince campionato/coppa/supercoppa e chi retrocede
// in ogni edizione. Non derivabile da MANAGERS (lì i dati sono per-persona,
// qui per-anno). I premi referenziano i manager per id (vedi managers.ts),
// il retrocesso referenzia anche la squadra per slug (vedi squads.ts) —
// niente nomi liberi né parsing di stringhe "Nome (Squadra)".
//
// versioneCoppa / versioneSupercoppa sono null per le stagioni in cui il
// rispettivo trofeo non è stato fatto (la supercoppa è iniziata solo dalla 5.0).
export const ALBO_D_ORO: Edizione[] = [
  {
    edizione: "1.0",
    stagione: "2018/19",
    campionatoId: "ferracin",
    versioneCoppa: null,
    coppaId: null,
    versioneSupercoppa: null,
    supercoppaId: null,
    retrocessoId: "vezzaro",
    retrocessoSquadId: "sarchiappone-team",
  },
  {
    edizione: "2.0",
    stagione: "2019/20",
    campionatoId: "dalsanto",
    versioneCoppa: null,
    coppaId: null,
    versioneSupercoppa: null,
    supercoppaId: null,
    retrocessoId: "popovic",
    retrocessoSquadId: "mangiamorte",
  },
  {
    edizione: "3.0",
    stagione: "2020/21",
    campionatoId: "zaninandrea",
    versioneCoppa: "1.0",
    coppaId: "ponzioandrea",
    versioneSupercoppa: null,
    supercoppaId: null,
    retrocessoId: "dalsanto",
    retrocessoSquadId: "team-culo",
  },
  {
    edizione: "4.0",
    stagione: "2021/22",
    campionatoId: "zaninriccardo",
    versioneCoppa: "2.0",
    coppaId: "zaninriccardo",
    versioneSupercoppa: null,
    supercoppaId: null,
    retrocessoId: "ponzioandrea",
    retrocessoSquadId: "arrocco-corto",
  },
  {
    edizione: "5.0",
    stagione: "2022/23",
    campionatoId: "dalbianco",
    versioneCoppa: "3.0",
    coppaId: "ponzioandrea",
    versioneSupercoppa: "1.0",
    supercoppaId: "dalbianco",
    retrocessoId: "ferracin",
    retrocessoSquadId: "mcfly",
  },
  {
    edizione: "6.0",
    stagione: "2023/24",
    campionatoId: "ponzioandrea",
    versioneCoppa: "4.0",
    coppaId: "dalbianco",
    versioneSupercoppa: "2.0",
    supercoppaId: "ponzioandrea",
    retrocessoId: "zaninriccardo",
    retrocessoSquadId: "pirati-igna",
  },
  {
    edizione: "7.0",
    stagione: "2024/25",
    campionatoId: "ferracin",
    versioneCoppa: "5.0",
    coppaId: "dalbianco",
    versioneSupercoppa: "3.0",
    supercoppaId: "ponzioandrea",
    retrocessoId: "zaninandrea",
    retrocessoSquadId: "novellini",
  },
  {
    edizione: "8.0",
    stagione: "2025/26",
    campionatoId: "zaninriccardo",
    versioneCoppa: "6.0",
    coppaId: "ferracin",
    versioneSupercoppa: "4.0",
    supercoppaId: "ferracin",
    retrocessoId: "ponziomattia",
    retrocessoSquadId: "niente-male",
  },
];

export function getManagerName(id: string): string {
  return MANAGERS.find((m) => m.id === id)?.nome ?? id;
}

// Calcola, per un dato id manager, i premi vinti incrociando ALBO_D_ORO.
// Usata sia dal medagliere aggregato sia dalla scheda singolo manager.
export function getPalmares(managerId: string): Palmares {
  const campionati: string[] = [];
  const coppe: string[] = [];
  const supercoppe: string[] = [];
  const retrocessioni: string[] = [];

  for (const ed of ALBO_D_ORO) {
    if (ed.campionatoId === managerId) campionati.push(ed.edizione);
    if (ed.coppaId === managerId && ed.versioneCoppa !== null)
      coppe.push(ed.versioneCoppa);
    if (ed.supercoppaId === managerId && ed.versioneSupercoppa !== null)
      supercoppe.push(ed.versioneSupercoppa);
    if (ed.retrocessoId === managerId) retrocessioni.push(ed.edizione);
  }

  return { campionati, coppe, supercoppe, retrocessioni };
}

// Medagliere aggregato, ordinato con gli stessi criteri del bot Telegram:
// 1) più campionati, 2) più coppe, 3) più supercoppe, 4) meno retrocessioni.
export function getMedagliere(): MedagliereRow[] {
  return MANAGERS.map((manager) => ({
    manager,
    ...getPalmares(manager.id),
  })).sort((a, b) => {
    const diffCampionati = b.campionati.length - a.campionati.length;
    if (diffCampionati !== 0) return diffCampionati;
    const diffCoppe = b.coppe.length - a.coppe.length;
    if (diffCoppe !== 0) return diffCoppe;
    const diffSupercoppe = b.supercoppe.length - a.supercoppe.length;
    if (diffSupercoppe !== 0) return diffSupercoppe;
    return a.retrocessioni.length - b.retrocessioni.length;
  });
}

// Formattazione testuale per il bot Telegram — risposta al comando /halloffame.
export function getAlboDOroPerStagione(): string {
  let msg = "🏆 *ALBO D'ORO FANTA LEGA-CULO* 🏆\n\n";
  for (const ed of ALBO_D_ORO) {
    msg += `📅 *FANTA LEGA-CULO ${ed.edizione} — ${ed.stagione}*\n`;
    msg += `   👑 Campionato ${ed.edizione}: *${getManagerName(ed.campionatoId)}*\n`;
    msg += ed.coppaId
      ? `   🏆 Coppa ${ed.versioneCoppa}: *${getManagerName(ed.coppaId)}*\n`
      : `   🏆 Coppa Culo: non fatta\n`;
    msg += ed.supercoppaId
      ? `   🎖️ Supercoppa ${ed.versioneSupercoppa}: *${getManagerName(ed.supercoppaId)}*\n`
      : `   🎖️ Supercoppa: non fatta\n`;
    msg += `   📉 Retrocesso: *${getManagerName(ed.retrocessoId)} (${getSquadName(ed.retrocessoSquadId)})*\n\n`;
  }
  return msg.trim();
}

const PODIO_EMOJI = ["🥇", "🥈", "🥉"] as const;

// Formattazione testuale per il bot Telegram — risposta al comando /medagliere.
export function getAlboDOroPerAllenatore(): string {
  const allenatori = getMedagliere();

  let msg = "🏅 *MEDAGLIERE FANTA LEGA-CULO* 🏅\n\n";
  allenatori.forEach((dati, i) => {
    const podio = PODIO_EMOJI[i] ?? "";
    msg += `${podio ? `${podio} ` : ""}*${dati.manager.nome}*\n`;
    msg += `   👑 Campionati: *${dati.campionati.length}*`;
    msg +=
      dati.campionati.length > 0
        ? `  (${dati.campionati.join(", ")})\n`
        : "\n";
    msg += `   🏆 Coppe Culo: *${dati.coppe.length}*`;
    msg += dati.coppe.length > 0 ? `  (${dati.coppe.join(", ")})\n` : "\n";
    msg += `   🎖️ Supercoppe: *${dati.supercoppe.length}*`;
    msg +=
      dati.supercoppe.length > 0
        ? `  (${dati.supercoppe.join(", ")})\n`
        : "\n";
    msg += `   📉 Retrocessioni: *${dati.retrocessioni.length}*`;
    msg +=
      dati.retrocessioni.length > 0
        ? `  (${dati.retrocessioni.join(", ")})\n\n`
        : "\n\n";
  });
  return msg.trim();
}
