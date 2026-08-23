import * as cheerio from "cheerio";
import { SQUADS } from "@/lib/data/squads";

const CLASSIFICA_URL = "https://leghe.fantacalcio.it/fanta-lega-culo/?id=446592";

export interface TeamEntry {
  id: number;
  icon: string;
  name: string;
}

interface NextMatchInfo {
  opponentId: number;
  opponentName: string;
  opponentEmoji: string;
}

export interface SquadInfo {
  id: number;
  name: string;
  logo: string;
  shirt: string;
  nextMatch?: NextMatchInfo;
}

// Costruisce la lista delle squadre attive da SQUADS (unica fonte di verità).
// Sono incluse solo le voci con fantacalcioId e matchKeyword definiti.
function getActiveTeams(): TeamEntry[] {
  return Object.values(SQUADS)
    .filter(
      (s): s is typeof s & { fantacalcioId: number; matchKeyword: string; emoji: string } =>
        s.fantacalcioId !== undefined && s.matchKeyword !== undefined && s.emoji !== undefined,
    )
    .map((s) => ({ id: s.fantacalcioId, icon: s.emoji, name: s.nome.toUpperCase() }));
}

export function getEmoji(teamName: string): string {
  const words = teamName.toUpperCase().split(/\s+/);
  for (const squad of Object.values(SQUADS)) {
    if (!squad.matchKeyword || !squad.emoji) continue;
    if (words.some((word) => word.includes(squad.matchKeyword!))) {
      return squad.emoji;
    }
  }
  return "";
}

export async function getClassifica(): Promise<string> {
  const html = await fetch(CLASSIFICA_URL).then((r) => r.text());
  const $ = cheerio.load(html);

  const rows = $(".ranking-row")
    .map((_, el) => {
      const pos = $(el).find('td[data-key="index"] span').text().trim();
      const team = $(el).find('td[data-key="teamName"] a').text().trim();
      const realPts = $(el).find('td[data-key="rank-pt"] span').text().trim();
      const pts = $(el).find('td[data-key="rank-fp"] span').text().trim();
      const emoji = getEmoji(team);
      return `*${pos}. ${emoji} ${team}* - ${realPts} (${pts} pts)`;
    })
    .get();

  return rows.join("\n\n");
}

export async function getNextMatch(): Promise<string> {
  const html = await fetch(CLASSIFICA_URL).then((r) => r.text());
  const $ = cheerio.load(html);

  const nextMatchDiv = $(".next-match").first();
  if (!nextMatchDiv.length) return "Nessuna prossima partita trovata.";

  const giornata = nextMatchDiv.find(".widget-title").text().trim().split("\n")[0];

  const matches: string[] = [];
  nextMatchDiv.find("li.match-result").each((_, el) => {
    const homeName = $(el).find(".team-home .team-name").text().trim();
    const awayName = $(el).find(".team-away .team-name").text().trim();
    matches.push(`*${getEmoji(homeName)} ${homeName}* vs *${getEmoji(awayName)} ${awayName}*`);
  });

  return `*⚽️ ${giornata} FANTA LEGA-CULO 8.0 ⚽️*\n\n${matches.join("\n\n")}`;
}

export async function fetchSquadre(): Promise<TeamEntry[]> {
  return getActiveTeams();
}

export async function fetchInfoSquadre(): Promise<SquadInfo[]> {
  const html = await fetch(CLASSIFICA_URL).then((r) => r.text());
  const $ = cheerio.load(html);

  const squads: SquadInfo[] = [];

  $(".next-match li.match-result").each((_, el) => {
    const homeEl = $(el).find(".team-home");
    const awayEl = $(el).find(".team-away");

    const home: SquadInfo = {
      id: parseInt(homeEl.attr("data-id") ?? "0", 10),
      name: homeEl.find(".team-name").text().trim(),
      logo: homeEl.find(".team-crest img").attr("src") ?? "",
      shirt: homeEl.find(".team-shirt img").attr("src") ?? "",
    };

    const away: SquadInfo = {
      id: parseInt(awayEl.attr("data-id") ?? "0", 10),
      name: awayEl.find(".team-name").text().trim(),
      logo: awayEl.find(".team-crest img").attr("src") ?? "",
      shirt: awayEl.find(".team-shirt img").attr("src") ?? "",
    };

    home.nextMatch = {
      opponentId: away.id,
      opponentName: away.name,
      opponentEmoji: getEmoji(away.name),
    };

    away.nextMatch = {
      opponentId: home.id,
      opponentName: home.name,
      opponentEmoji: getEmoji(home.name),
    };

    squads.push(home, away);
  });

  return squads;
}
