import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authorization";
import { obtenerEstadoAprendizaje } from "@/lib/learning-path";
import { prisma } from "@/lib/prisma";
import { PrismaCourseRepository } from "@/modules/courses/infrastructure/prisma-course.repository";
import { MarcarLeccionCompletadaUseCase } from "@/modules/courses/application/course.use-cases";
import { LearningPathRules } from "@/modules/learning-path/domain/learning-path.entity";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const ctx = await getAuthContext();

  if (!ctx) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  // Un estudiante solo puede avanzar en módulos que tiene desbloqueados
  // (autoevaluación inicial hecha + módulos anteriores completados).
  if (ctx.rol === "ESTUDIANTE") {
    const leccion = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { courseId: true } });
    if (!leccion) return NextResponse.json({ error: "Lección no encontrada." }, { status: 404 });
    const estado = await obtenerEstadoAprendizaje(ctx.id);
    if (!estado.puedeAccederModulos) {
      return NextResponse.json({ error: "Primero debes completar la autoevaluación inicial." }, { status: 403 });
    }
    if (!LearningPathRules.puedeVerModulo(estado, leccion.courseId)) {
      return NextResponse.json({ error: "Este módulo todavía está bloqueado." }, { status: 403 });
    }
  }

  try {
    const repo = new PrismaCourseRepository(prisma);
    const useCase = new MarcarLeccionCompletadaUseCase(repo);
    const resultado = await useCase.execute(ctx.id, lessonId);
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar progreso." },
      { status: 400 }
    );
  }
}
