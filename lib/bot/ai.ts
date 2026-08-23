import { MANAGERS } from "@/lib/data/managers";
import { ALBO_D_ORO, getPalmares } from "@/lib/data/halloffame";
import { getSquadName } from "@/lib/data/squads";
import classificaCSV from "./data/classifica-8.0.csv";
import calendarioCSV from "./data/calendario-8.0.csv";
import roseCSV from "./data/rose-8.0.csv";
import regolamentoTXT from "./data/regolamento.txt";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

// Serializza MANAGERS + palmares in testo leggibile per il modello.
function buildManagersContext(): string {
  return MANAGERS.map((m) => {
    const { campionati, coppe, supercoppe, retrocessioni } = getPalmares(m.id);
    const squadre = m.squadre
      .map((s) => {
        const nome = getSquadName(s.squadId);
        return s.al ? `${nome} (${s.dal}–${s.al})` : `${nome} (dalla ${s.dal})`;
      })
      .join(", ");

    const status = m.presenteFinoAl
      ? `ex-manager (dalla ${m.presenteDal} alla ${m.presenteFinoAl})`
      : `in lega dalla ${m.presenteDal}`;

    return [
      `Manager: ${m.nome} [${status}]`,
      `  Squadre: ${squadre}`,
      `  Campionati vinti: ${campionati.length > 0 ? campionati.join(", ") : "nessuno"}`,
      `  Coppe Culo vinte: ${coppe.length > 0 ? coppe.join(", ") : "nessuna"}`,
      `  Supercoppe vinte: ${supercoppe.length > 0 ? supercoppe.join(", ") : "nessuna"}`,
      `  Retrocessioni: ${retrocessioni.length > 0 ? retrocessioni.join(", ") : "nessuna"}`,
    ].join("\n");
  }).join("\n\n");
}

// Serializza ALBO_D_ORO stagione per stagione.
function buildAlboContext(): string {
  return ALBO_D_ORO.map((ed) => {
    const campione =
      MANAGERS.find((m) => m.id === ed.campionatoId)?.nome ?? ed.campionatoId;
    const coppista = ed.coppaId
      ? (MANAGERS.find((m) => m.id === ed.coppaId)?.nome ?? ed.coppaId)
      : "non assegnata";
    const supercoppista = ed.supercoppaId
      ? (MANAGERS.find((m) => m.id === ed.supercoppaId)?.nome ?? ed.supercoppaId)
      : "non assegnata";
    const retrocesso =
      MANAGERS.find((m) => m.id === ed.retrocessoId)?.nome ?? ed.retrocessoId;
    const squadRet = getSquadName(ed.retrocessoSquadId);

    return [
      `Stagione ${ed.edizione} (${ed.stagione}):`,
      `  Campionato ${ed.edizione}: ${campione}`,
      `  Coppa Culo ${ed.versioneCoppa ?? "—"}: ${coppista}`,
      `  Supercoppa ${ed.versioneSupercoppa ?? "—"}: ${supercoppista}`,
      `  Retrocesso: ${retrocesso} (${squadRet})`,
    ].join("\n");
  }).join("\n\n");
}

// Compatta la classifica CSV: "Pos.Squadra G V N P Gf Gs Pt PtTot"
function buildClassificaCompact(): string {
  const lines = classificaCSV.split("\n").filter((l) => l.trim());
  const results: string[] = [];
  for (const line of lines) {
    const cols = line.split(";");
    if (/^\d+$/.test(cols[0])) {
      results.push(
        `${cols[0]}.${cols[1]} G${cols[3]} V${cols[4]} N${cols[5]} P${cols[6]} Gf${cols[7]} Gs${cols[8]} Pt${cols[10]} PtTot${cols[11]}`,
      );
    }
  }
  return results.join("\n");
}

// Compatta il calendario CSV: una riga per giornata con partite separate da |
function buildCalendarioCompact(): string {
  const lines = calendarioCSV.split("\n").filter((l) => l.trim());
  let currentDay = "";
  let matches: string[] = [];
  const days: string[] = [];

  for (const line of lines) {
    const cols = line.split(";");
    if (cols[0] && cols[0].includes("Giornata lega")) {
      if (currentDay && matches.length > 0) {
        days.push(`${currentDay}: ${matches.join(" | ")}`);
      }
      currentDay = cols[0].replace("ª Giornata lega", "");
      matches = [];
    } else if (cols[0] && cols[1] && cols[2] && cols[3] && cols[4]) {
      matches.push(`${cols[0]} ${cols[4]} ${cols[3]}`);
    }
  }
  if (currentDay && matches.length > 0) {
    days.push(`${currentDay}: ${matches.join(" | ")}`);
  }
  return days.join("\n");
}

// Compatta le rose CSV in un formato a basso consumo di token.
// Output: "SQUADRA: R.Calciatore(Sq), R.Calciatore(Sq), ..."
function buildRoseCompact(): string {
  const lines = roseCSV.split("\n").filter((l) => l.trim());
  let currentTeam = "";
  let players: string[] = [];
  const teams: string[] = [];

  for (const line of lines) {
    const cols = line.split(";");
    if (
      cols[0] &&
      !cols[1] &&
      !line.startsWith("Rose ") &&
      !line.startsWith("http") &&
      !line.startsWith("*") &&
      cols[0] !== "Ruolo" &&
      !line.startsWith("Crediti")
    ) {
      if (currentTeam && players.length > 0) {
        teams.push(`${currentTeam}: ${players.join(", ")}`);
      }
      currentTeam = cols[0].trim();
      players = [];
    } else if (["P", "D", "C", "A"].includes(cols[0])) {
      players.push(`${cols[0]}.${cols[1]}(${cols[2]})`);
    }
  }
  if (currentTeam && players.length > 0) {
    teams.push(`${currentTeam}: ${players.join(", ")}`);
  }
  return teams.join("\n");
}

function buildSystemPrompt(): string {
  return `Sei l'assistente ufficiale della FANTA LEGA-CULO, una lega di fantacalcio privata tra amici.
Il tuo unico scopo è rispondere a domande riguardanti questa lega: i manager, le squadre, i trofei, le stagioni, la classifica, il calendario, le statistiche.

Se ti viene posta una domanda che non riguarda la lega (politica, sport in generale, curiosità random, ecc.), rispondi SOLO con:
"Chiedimi qualcosa sulla FANTA LEGA-CULO! 🏆"
Non aggiungere mai questa frase alle risposte su argomenti della lega. Non usarla come chiusura o firma.

Puoi essere ironico e divertente nel tono, è una lega tra amici.

NOTA IMPORTANTE - TERMINOLOGIA PUNTI:
- "Pt" o "Punti" in classifica = punti classifica (3 per vittoria, 1 per pareggio, 0 per sconfitta)
- "Pt. Totali" o "Punti Totali" = somma dei fantapunteggi di tutte le giornate (voti + bonus - malus). Sono nell'ordine delle migliaia (es. 2600).
Criteri parità classifica: 1) Punti classifica, 2) Punti Totali (chi ne ha di più), 3) Gol fatti, 4) Gol subiti.
NON confondere mai Punti con Punti Totali. Sono due cose completamente diverse.

Il presidente della lega è *Federico Ottavio* (username Telegram: federicoottavio). Non partecipa come manager ma organizza e gestisce tutto.

Formattazione: rispondi usando SOLO la sintassi Markdown di Telegram.
- *testo* = grassetto (singolo asterisco)
- _testo_ = corsivo
- MAI usare **doppio asterisco** o __doppio underscore__, Telegram non li supporta.
- MAI usare intestazioni (#).
- Usa elenchi con • o numeri quando servono.
- Risposte brevi e dirette, non dilungarti.

---

## MANAGER E PALMARES

${buildManagersContext()}

---

## ALBO D'ORO STAGIONE PER STAGIONE

${buildAlboContext()}

---

## CLASSIFICA STAGIONE 8.0 (Pos.Squadra Giocate Vinte Nulle Perse GolFatti GolSubiti Punti PuntiTotali)

${buildClassificaCompact()}

---

## CALENDARIO STAGIONE 8.0 (Giornata: Casa Risultato Trasferta | ...)

${buildCalendarioCompact()}

---

## ROSE STAGIONE 8.0 (formato: Ruolo.Calciatore(Squadra))

${buildRoseCompact()}

---

## REGOLAMENTO

${regolamentoTXT}
`;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export async function rispondiAI(
  domanda: string,
  opts?: { username?: string; firstName?: string },
): Promise<string> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return "⚠️ GEMINI_API_KEY non configurata.";
  }

  const { username, firstName } = opts ?? {};

  let userContext = "";
  if (username || firstName) {
    userContext = `[L'utente che sta chiedendo è: ${firstName ?? username}${username ? ` (@${username})` : ""}. Se dice "io", "la mia squadra", "sono arrivato", ecc. si riferisce a sé stesso. Cerca di capire chi è tra i manager della lega in base al nome.]\n\n`;
  }

  const resp = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: buildSystemPrompt() }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userContext + domanda }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    }),
  });

  if (!resp.ok) {
    console.error("❌ Errore Gemini:", await resp.text());
    return "⚠️ Errore nella risposta AI, riprova più tardi.";
  }

  const data = (await resp.json()) as GeminiResponse;
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
    "⚠️ Risposta vuota dal modello."
  );
}
