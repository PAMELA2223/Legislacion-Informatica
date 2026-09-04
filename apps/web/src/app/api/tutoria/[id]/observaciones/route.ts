import { NextResponse } from "next/server";
import { requireTutorDeAssignment } from "@/lib/require-tutor-of";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { CrearObservacionUseCase } from "@/modules/tutoring/application/tutoring-plan.use-cases";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assignmentId } = await params;
  const auth = await requireTutorDeAssignment(assignmentId);
  // Las observaciones son privadas del tutor: un administrador puede
  // consultarlas si necesita mediar, pero NUNCA el estudiante (ningún
  // endpoint accesible al estudiante expone este contenido).
  if (!auth.autorizado || !auth.docenteId) {
    return NextResponse.json({ error: "Solo el docente tutor puede crear observaciones." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  try {
    const repo = new PrismaTutoringRepository(prisma);
    const useCase = new CrearObservacionUseCase(repo);
    await useCase.execute(assignmentId, auth.docenteId, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear la observación." },
      { status: 400 }
    );
  }
}
