import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { ActualizarEstadoTareaUseCase } from "@/modules/tutoring/application/tutoring-plan.use-cases";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const tarea = await prisma.tutoringTask.findUnique({
    where: { id: taskId },
    include: { assignment: true },
  });
  if (!tarea) return NextResponse.json({ error: "Tarea no encontrada." }, { status: 404 });

  const esTutor = ctx.rol === "DOCENTE" && tarea.assignment.docenteId === ctx.id;
  const esEstudianteAsignado = tarea.assignment.estudianteId === ctx.id;
  const esAdmin = ctx.rol === "ADMINISTRADOR";

  if (!esTutor && !esEstudianteAsignado && !esAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  try {
    const repo = new PrismaTutoringRepository(prisma);
    const useCase = new ActualizarEstadoTareaUseCase(repo);
    await useCase.execute(taskId, body?.estado);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar la tarea." },
      { status: 400 }
    );
  }
}
