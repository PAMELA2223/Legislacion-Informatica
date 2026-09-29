import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { CrearEvaluacionUseCase } from "@/modules/admin/application/admin.use-cases";

// Esta ruta la usaba el formulario "Nueva evaluación" pero no existía
// (el botón fallaba siempre). Ahora crea evaluaciones de módulo o las
// autoevaluaciones inicial/final.
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    const r = await new CrearEvaluacionUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, body ?? {});
    return NextResponse.json(r);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al crear la evaluación." }, { status: 400 });
  }
}
