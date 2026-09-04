import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { ReasignarTutoriaUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assignmentId } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const nuevoDocenteId = body?.nuevoDocenteId;
  if (!nuevoDocenteId) {
    return NextResponse.json({ error: "Debes indicar el nuevo docente." }, { status: 400 });
  }

  try {
    const repo = new PrismaTutoringRepository(prisma);
    const useCase = new ReasignarTutoriaUseCase(repo);
    await useCase.execute(admin.id, assignmentId, nuevoDocenteId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al reasignar la tutoría." },
      { status: 400 }
    );
  }
}
