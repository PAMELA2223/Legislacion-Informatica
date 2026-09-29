import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authorization";
import { verificarAccesoEvaluacion } from "@/lib/learning-path";
import { prisma } from "@/lib/prisma";
import { PrismaEvaluationRepository } from "@/modules/evaluations/infrastructure/prisma-evaluation.repository";
import { EnviarIntentoUseCase } from "@/modules/evaluations/application/evaluation.use-cases";
import type { RespuestaEstudiante } from "@/modules/evaluations/domain/evaluation.entity";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: evaluationId } = await params;
  const ctx = await getAuthContext();

  if (!ctx) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  // Misma verificación que la página: no basta con conocer el id o llamar a
  // la API directamente para saltarse el flujo de aprendizaje.
  const acceso = await verificarAccesoEvaluacion(ctx, evaluationId);
  if (!acceso.permitido) {
    return NextResponse.json({ error: acceso.motivo, redirigirA: acceso.redirigirA }, { status: acceso.status });
  }

  const body = await request.json().catch(() => null);
  const respuestas: RespuestaEstudiante[] = Array.isArray(body?.respuestas) ? body.respuestas : [];

  try {
    const repo = new PrismaEvaluationRepository(prisma);
    const useCase = new EnviarIntentoUseCase(repo);
    const resultado = await useCase.execute(ctx.id, evaluationId, respuestas);

    // La autoevaluación inicial es diagnóstica y sus preguntas pueden
    // repetirse en la final: no se revela qué respuestas eran correctas.
    if (acceso.tipo === TIPO_EVALUACION.INICIAL) {
      return NextResponse.json({ puntaje: resultado.puntaje, aprobado: resultado.aprobado, resultadosPorPregunta: [] });
    }
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al calificar la evaluación." },
      { status: 400 }
    );
  }
}
