import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTutorDeAssignment } from "@/lib/require-tutor-of";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { ActualizarProgresoObjetivoUseCase } from "@/modules/tutoring/application/tutoring-plan.use-cases";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: objectiveId } = await params;
  const objetivo = await prisma.tutoringObjective.findUnique({ where: { id: objectiveId } });
  if (!objetivo) return NextResponse.json({ error: "Objetivo no encontrado." }, { status: 404 });

  const auth = await requireTutorDeAssignment(objetivo.assignmentId);
  if (!auth.autorizado) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const body = await request.json().catch(() => null);
  try {
    const repo = new PrismaTutoringRepository(prisma);
    const useCase = new ActualizarProgresoObjetivoUseCase(repo);
    await useCase.execute(objectiveId, Number(body?.progreso), body?.estado);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar el objetivo." },
      { status: 400 }
    );
  }
}
