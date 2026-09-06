import { Pool } from "pg"

const MINUTES_LEFT = Number(process.env.MINUTES_LEFT) || 60
const PARTICIPANTS = [
  "@giacomoo6",
  "@ponzio_andrea",
  "@ponzioponzio",
  "@albherto",
  "@GiooFe",
  "@andreeazanin",
  "@foxysetazz",
]

interface Match {
  utcDate: string
  homeTeam: { name: string }
  awayTeam: { name: string }
}

interface MatchesResponse {
  matches?: Match[]
}

let pool: Pool | undefined

function getPool(): Pool {
  const connectionString = process.env.NEON_CONNECTION
  if (!connectionString) throw new Error("Missing env var: NEON_CONNECTION")

  pool ??= new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  return pool
}

async function getLastSentMatchday(): Promise<number> {
  const result = await getPool().query(
    "SELECT value FROM notifications WHERE id = 'last_match'",
  )

  if (result.rowCount === 0) throw new Error("No notification record found")
  return Number(result.rows[0].value)
}

async function setLastSentMatchday(value: number): Promise<void> {
  await getPool().query(
    `INSERT INTO notifications (id, value)
     VALUES ('last_match', $1)
     ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value`,
    [value],
  )
}

async function sendReminder(text: string): Promise<void> {
  const botToken = process.env.BOT_TOKEN
  const chatId = process.env.CHAT_ID
  if (!botToken || !chatId) {
    throw new Error("Missing env vars: BOT_TOKEN, CHAT_ID")
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    },
  )

  if (!response.ok) {
    throw new Error(`Telegram error: ${await response.text()}`)
  }
}

export async function runFormationReminder(): Promise<{
  sent: boolean
  matchday: number
  reason?: string
}> {
  const apiToken = process.env.API_TOKEN
  if (!apiToken) throw new Error("Missing env var: API_TOKEN")

  const lastSent = await getLastSentMatchday()
  const matchday = lastSent + 1

  console.log("Last sent matchday:", lastSent)
  console.log("Current matchday:", matchday)
  const response = await fetch(
    `https://api.football-data.org/v4/competitions/2019/matches?matchday=${matchday}`,
    { headers: { "X-Auth-Token": apiToken } },
  )

  if (!response.ok) throw new Error(await response.text())

  const data = (await response.json()) as MatchesResponse
  const firstMatch = data.matches?.[0]
  if (!firstMatch) {
    return { sent: false, matchday, reason: "no_matches" }
  }

  const minutesLeft =
    (new Date(firstMatch.utcDate).getTime() - Date.now()) / 60000
  console.log(
    `Prima partita matchday ${matchday}: ${firstMatch.homeTeam.name} vs ${firstMatch.awayTeam.name}`,
  )
  console.log(`Minuti alla partita: ${minutesLeft.toFixed(0)} min`)

  if (minutesLeft > MINUTES_LEFT || minutesLeft <= 0) {
    await sendReminder("This is a test reminder message.")
    return { sent: false, matchday, reason: "outside_window" }
  }

  const matchTime = new Date(firstMatch.utcDate).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  const text = `🚨 RICORDATI DI INSERIRE LA FORMAZIONE! 🚨\n${PARTICIPANTS.join(
    " ",
  )}\nMancano meno di ${MINUTES_LEFT} minuti all'inizio della prima partita: ${firstMatch.homeTeam.name} vs ${firstMatch.awayTeam.name} alle ${matchTime}`

  await sendReminder(text)
  await setLastSentMatchday(matchday)

  return { sent: true, matchday }
}
