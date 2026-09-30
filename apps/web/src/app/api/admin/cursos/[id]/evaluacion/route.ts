import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { CrearEvaluacionUseCase } from "@/modules/admin/application/admin.use-cases";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";

/** Crea la evaluación (única) de un módulo. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const curso = await prisma.course.findUnique({ where: { id }, select: { titulo: true, eliminadoEn: true } });
  if (!curso || curso.eliminadoEn) return NextResponse.json({ error: "Módulo no encontrado." }, { status: 404 });
  try {
    const r = await new CrearEvaluacionUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, {
      titulo: `Evaluación: ${curso.titulo}`,
      courseId: id,
      tipo: TIPO_EVALUACION.MODULO,
      tiempoLimite: 0,
    });
    return NextResponse.json(r);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al crear la evaluación." }, { status: 400 });
  }
}
