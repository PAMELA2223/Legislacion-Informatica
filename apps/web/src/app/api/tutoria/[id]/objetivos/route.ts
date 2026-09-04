import { NextResponse } from "next/server";
import { requireTutorDeAssignment } from "@/lib/require-tutor-of";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/audit-log";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { CrearObjetivoUseCase } from "@/modules/tutoring/application/tutoring-plan.use-cases";

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
    const useCase = new CrearObjetivoUseCase(repo);
    await useCase.execute(assignmentId, body);
    if (auth.docenteId) await registrarLog(prisma, auth.docenteId, "CREAR_OBJETIVO", "tutoria_objetivo", assignmentId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el objetivo." },
      { status: 400 }
    );
  }
}
