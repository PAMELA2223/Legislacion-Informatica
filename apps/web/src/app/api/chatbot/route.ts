import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaChatContextRepository } from "@/modules/chatbot/infrastructure/prisma-chat-context.repository";
import { AnthropicChatModel } from "@/modules/chatbot/infrastructure/anthropic-chat.model";
import { ResponderConsultaUseCase } from "@/modules/chatbot/application/chatbot.use-cases";

// Límite simple de consultas por usuario para evitar abuso y costos
// inesperados. Vive en memoria del proceso: en Vercel (serverless) cada
// instancia tiene su propio contador, así que es una protección básica, no
// un límite estricto global.
const VENTANA_MS = 10 * 60 * 1000;
const MAX_CONSULTAS = 30;
const consultas = new Map<string, number[]>();

function superaLimite(userId: string): boolean {
  const ahora = Date.now();
  const recientes = (consultas.get(userId) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= MAX_CONSULTAS) {
    consultas.set(userId, recientes);
    return true;
  }
  recientes.push(ahora);
  consultas.set(userId, recientes);
  return false;
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (superaLimite(ctx.id)) {
    return NextResponse.json(
      { error: "Has realizado muchas consultas seguidas. Espera unos minutos e inténtalo de nuevo." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const pagina = typeof body?.pagina === "string" ? body.pagina.slice(0, 200) : null;

  try {
    const useCase = new ResponderConsultaUseCase(new PrismaChatContextRepository(prisma), new AnthropicChatModel());
    const r = await useCase.execute(body?.mensajes, pagina);
    return NextResponse.json(r);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo procesar la consulta." },
      { status: 400 }
    );
  }
}
