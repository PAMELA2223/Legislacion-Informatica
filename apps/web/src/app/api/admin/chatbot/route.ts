import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/audit-log";
import { validarConfig } from "@/modules/chatbot/domain/chatbot-config";
import { PrismaChatbotConfigRepository } from "@/modules/chatbot/infrastructure/prisma-chatbot-config.repository";

/** Guardar la configuración del asistente: { activo, fuentes }. */
export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    const config = validarConfig(body);
    await new PrismaChatbotConfigRepository(prisma).guardar(config);
    await registrarLog(prisma, admin.id, "EDITAR", "chatbot", `activo=${config.activo}; fuentes=${config.fuentes.join(",")}`);
    return NextResponse.json({ ok: true, ...config });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo guardar." }, { status: 400 });
  }
}
