import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaChatContextRepository } from "@/modules/chatbot/infrastructure/prisma-chat-context.repository";
import { crearModeloDeLenguaje } from "@/modules/chatbot/infrastructure/language-model.factory";
import { ResponderConsultaUseCase } from "@/modules/chatbot/application/chatbot.use-cases";
import { PrismaChatbotConfigRepository } from "@/modules/chatbot/infrastructure/prisma-chatbot-config.repository";

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

  const configRepo = new PrismaChatbotConfigRepository(prisma);
  const config = await configRepo.obtener();
  if (!config.activo) {
    return NextResponse.json({ error: "El asistente está desactivado por el administrador." }, { status: 403 });
  }
  if (superaLimite(ctx.id)) {
    return NextResponse.json(
      { error: "Has realizado muchas consultas seguidas. Espera unos minutos e inténtalo de nuevo." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const pagina = typeof body?.pagina === "string" ? body.pagina.slice(0, 200) : null;

  try {
    const useCase = new ResponderConsultaUseCase(new PrismaChatContextRepository(prisma), crearModeloDeLenguaje(), config);
    const { meta, ...respuesta } = await useCase.execute(body?.mensajes, pagina);
    // Estadísticas de uso: solo tipo de consulta y tema, nunca el texto.
    if (ctx.rol === "ESTUDIANTE") await configRepo.registrarConsulta(ctx.id, meta);
    return NextResponse.json(respuesta);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo procesar la consulta." },
      { status: 400 }
    );
  }
}
