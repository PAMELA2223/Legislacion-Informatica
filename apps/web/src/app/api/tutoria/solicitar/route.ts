import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { SolicitarTutoriaUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (ctx.rol !== "DOCENTE") {
    return NextResponse.json({ error: "Solo un docente puede solicitar tutoría." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const estudianteId = body?.estudianteId;
  if (!estudianteId) {
    return NextResponse.json({ error: "Debes indicar el estudiante." }, { status: 400 });
  }

  try {
    const repo = new PrismaTutoringRepository(prisma);
    const useCase = new SolicitarTutoriaUseCase(repo);
    const asignacion = await useCase.execute(ctx.id, estudianteId);
    return NextResponse.json(asignacion);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al solicitar la tutoría." },
      { status: 400 }
    );
  }
}
