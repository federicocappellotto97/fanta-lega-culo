import { NextRequest, NextResponse } from "next/server"

import { runFormationReminder } from "@/lib/bot/reminder"

export const runtime = "nodejs"

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET

  return !!secret && request.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    return NextResponse.json(await runFormationReminder())
  } catch (error) {
    console.error("Errore nel reminder della formazione:", error)

    return NextResponse.json({ error: "Reminder failed" }, { status: 500 })
  }
}
