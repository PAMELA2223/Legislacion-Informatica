import { NextResponse } from "next/server";
import { requireTutorDeAssignment } from "@/lib/require-tutor-of";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { CrearRecursoUseCase } from "@/modules/tutoring/application/tutoring-plan.use-cases";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assignmentId } = await params;
  const auth = await requireTutorDeAssignment(assignmentId);
  if (!auth.autorizado) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const body = await request.json().catch(() => null);
  try {
    const repo = new PrismaTutoringRepository(prisma);
    const useCase = new CrearRecursoUseCase(repo);
    await useCase.execute(assignmentId, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al compartir el recurso." },
      { status: 400 }
    );
  }
}
