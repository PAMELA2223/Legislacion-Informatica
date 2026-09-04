import { NextResponse } from "next/server";
import { requireTutorDeAssignment } from "@/lib/require-tutor-of";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/audit-log";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { CrearReunionUseCase } from "@/modules/tutoring/application/tutoring-plan.use-cases";

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
    const useCase = new CrearReunionUseCase(repo);
    await useCase.execute(assignmentId, body);
    if (auth.docenteId) await registrarLog(prisma, auth.docenteId, "CREAR_REUNION", "tutoria_reunion", assignmentId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear la reunión." },
      { status: 400 }
    );
  }
}
