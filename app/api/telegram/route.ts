export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { MANAGERS } from "@/lib/data/managers";
import {
  getPalmares,
  getAlboDOroPerStagione,
  getAlboDOroPerAllenatore,
} from "@/lib/data/halloffame";
import { getSquadName } from "@/lib/data/squads";
import { rispondiAI } from "@/lib/bot/ai";
import {
  fetchInfoSquadre,
  fetchSquadre,
  getClassifica,
  getEmoji,
  getNextMatch,
} from "@/lib/bot/helper";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ---------------------------------------------------------------------------
// Telegram API helpers
// ---------------------------------------------------------------------------

interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

interface ReplyMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

async function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: ReplyMarkup,
): Promise<{ result?: { message_id?: number } }> {
  const resp = await fetch(`${BASE_URL}/sendMessage?parse_mode=Markdown`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
    }),
  });
  return resp.json() as Promise<{ result?: { message_id?: number } }>;
}

async function sendPhoto(
  chatId: number,
  photoUrl: string,
  caption: string,
): Promise<void> {
  const resp = await fetch(`${BASE_URL}/sendPhoto?parse_mode=Markdown`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption }),
  });
  if (!resp.ok) {
    console.error("❌ Errore nell'invio della foto:", photoUrl, await resp.text());
  }
}

async function deleteMessage(chatId: number, messageId: number): Promise<void> {
  await fetch(`${BASE_URL}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  });
}

// ---------------------------------------------------------------------------
// Business logic helpers
// ---------------------------------------------------------------------------

function buildManagerCaption(managerId: string): string {
  const manager = MANAGERS.find((m) => m.id === managerId);
  if (!manager) return "Manager non trovato.";

  const presenza = manager.presenteFinoAl
    ? `dalla ${manager.presenteDal} alla ${manager.presenteFinoAl}`
    : `dalla ${manager.presenteDal} (presente)`;

  const squadre = manager.squadre
    .map((s) => {
      const nome = getSquadName(s.squadId);
      return s.al
        ? `• *${nome}* (${s.dal}–${s.al})`
        : `• *${nome}* (dalla ${s.dal})`;
    })
    .join("\n     ");

  const { campionati, coppe, supercoppe, retrocessioni } = getPalmares(
    manager.id,
  );

  let msg = `*${manager.nome}*\n`;
  msg += `📆 In lega: *${presenza}*\n\n`;
  msg += `👕 Squadre:\n     ${squadre}\n\n`;
  msg += `👑 Campionati: *${campionati.length}*`;
  msg += campionati.length > 0 ? `  (${campionati.join(", ")})\n` : "\n";
  msg += `🏆 Coppe Culo: *${coppe.length}*`;
  msg += coppe.length > 0 ? `  (${coppe.join(", ")})\n` : "\n";
  msg += `🎖️ Supercoppe: *${supercoppe.length}*`;
  msg += supercoppe.length > 0 ? `  (${supercoppe.join(", ")})\n` : "\n";
  msg += `📉 Retrocessioni: *${retrocessioni.length}*`;
  msg += retrocessioni.length > 0 ? `  (${retrocessioni.join(", ")})` : "";

  return msg.trim();
}

// Extracts the question from "/ai some question" or "/ai@BotName some question".
// Returns null if the command is missing a question.
function parseAiCommand(text: string): string | null {
  const match = text.match(/^\/ai(?:@\S+)?\s+([\s\S]+)/i);
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------------------
// Callback query handler
// ---------------------------------------------------------------------------

interface CallbackQuery {
  id: string;
  data: string;
  message: {
    chat: { id: number };
    message_id: number;
  };
}

async function handleCallbackQuery(callback: CallbackQuery): Promise<void> {
  const chatId = callback.message.chat.id;

  await fetch(`${BASE_URL}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callback.id }),
  });

  if (callback.data === "albodoro_stagione") {
    await sendMessage(chatId, getAlboDOroPerStagione());
    await deleteMessage(chatId, callback.message.message_id);
    return;
  }

  if (callback.data === "albodoro_allenatore") {
    await sendMessage(chatId, getAlboDOroPerAllenatore());
    await deleteMessage(chatId, callback.message.message_id);
    return;
  }

  if (callback.data.startsWith("manager_")) {
    const id = callback.data.replace("manager_", "");
    const manager = MANAGERS.find((m) => m.id === id);
    if (!manager) {
      console.error("❌ Manager non trovato per id:", id);
      return;
    }

    // Active manager → colour photo; ex-manager → B&W photo
    const photoPath = manager.presenteFinoAl
      ? manager.fotoBN
      : manager.fotoColore;
    const photoUrl = `${SITE_URL}${photoPath}`;
    const caption = buildManagerCaption(manager.id);

    await sendPhoto(chatId, photoUrl, caption);
    await deleteMessage(chatId, callback.message.message_id);
    return;
  }

  // Numeric callback_data → team info
  const squads = await fetchInfoSquadre();
  const team = squads.find((t) => t.id === parseInt(callback.data, 10));
  if (!team) return;

  const message = `*${getEmoji(team.name)} ${team.name}*`;
  const matchMessage = team.nextMatch
    ? `⚽️ Prossima partita: ${team.nextMatch.opponentEmoji} ${team.nextMatch.opponentName}`
    : "⚽️ Nessuna prossima partita trovata.";

  const media = [
    {
      type: "photo",
      media: team.logo,
      caption: `${message}\n\n${matchMessage}`,
      parse_mode: "Markdown",
    },
    { type: "photo", media: team.shirt },
  ];

  await fetch(`${BASE_URL}/sendMediaGroup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, media }),
  });
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

interface TelegramUpdate {
  callback_query?: CallbackQuery;
  message?: {
    chat: { id: number };
    text?: string;
    from?: { username?: string; first_name?: string };
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as TelegramUpdate;
  console.log("UPDATE COMPLETO:", JSON.stringify(body, null, 2));

  if (body.callback_query) {
    await handleCallbackQuery(body.callback_query);
    return new NextResponse("OK", { status: 200 });
  }

  const chatId = body.message?.chat?.id;
  const text = body.message?.text;
  if (!chatId || !text) return new NextResponse("OK", { status: 200 });

  const command = text.split(/[@\s]/)[0];

  if (command === "/ranking") {
    const classifica = await getClassifica();
    await sendMessage(
      chatId,
      `📊 *Classifica FANTA LEGA-CULO 8.0* 📊\n\n${classifica}`,
    );
  }

  if (command === "/next") {
    const message = await getNextMatch();
    await sendMessage(chatId, message);
  }

  if (command === "/teams") {
    const squadre = await fetchSquadre();
    const buttons: InlineKeyboardButton[] = squadre.map((s) => ({
      text: `${s.icon} ${s.name}`,
      callback_data: s.id.toString(),
    }));

    const inlineKeyboard: InlineKeyboardButton[][] = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await sendMessage(chatId, "Seleziona una squadra:", {
      inline_keyboard: inlineKeyboard,
    });
  }

  if (command === "/halloffame") {
    await sendMessage(chatId, "Scegli la visualizzazione:", {
      inline_keyboard: [
        [
          { text: "📅 Per stagione", callback_data: "albodoro_stagione" },
          { text: "🏅 Per allenatore", callback_data: "albodoro_allenatore" },
        ],
      ],
    });
  }

  if (command === "/managers") {
    const buttons: InlineKeyboardButton[] = MANAGERS.map((m) => ({
      text: m.presenteFinoAl ? `⚪ ${m.nome}` : `🟢 ${m.nome}`,
      callback_data: `manager_${m.id}`,
    }));

    const inlineKeyboard: InlineKeyboardButton[][] = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await sendMessage(chatId, "Seleziona un allenatore:", {
      inline_keyboard: inlineKeyboard,
    });
  }

  if (command === "/ai") {
    const domanda = parseAiCommand(text);

    if (!domanda) {
      await sendMessage(
        chatId,
        "Dimmi qualcosa! Es: `/ai chi ha vinto più campionati?`",
      );
      return new NextResponse("OK", { status: 200 });
    }

    // Send a loading message while Gemini processes
    const waitData = await sendMessage(
      chatId,
      "🤖 _Sto consultando gli archivi della lega..._",
    );
    const waitMsgId = waitData.result?.message_id;

    const risposta = await rispondiAI(domanda, {
      username: body.message?.from?.username,
      firstName: body.message?.from?.first_name,
    });

    if (waitMsgId) {
      await deleteMessage(chatId, waitMsgId);
    }

    await sendMessage(chatId, risposta);
  }

  return new NextResponse("OK", { status: 200 });
}

export function GET(): NextResponse {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
