import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { CambiarEstadoTutoriaUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assignmentId } = await params;
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!["DOCENTE", "ADMINISTRADOR"].includes(ctx.rol)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const repo = new PrismaTutoringRepository(prisma);

  // Un docente solo puede cambiar el estado de SUS PROPIAS tutorías, nunca
  // las de otro docente (verificación de servidor, Sección 20 del pedido).
  if (ctx.rol === "DOCENTE") {
    const asignacion = await repo.obtenerAsignacion(assignmentId);
    if (!asignacion || asignacion.docenteId !== ctx.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
  }

  const body = await request.json().catch(() => null);
  const nuevoEstado = body?.estado;

  try {
    const useCase = new CambiarEstadoTutoriaUseCase(repo);
    const asignacion = await useCase.execute(ctx.id, assignmentId, nuevoEstado);
    return NextResponse.json(asignacion);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al cambiar el estado." },
      { status: 400 }
    );
  }
}
