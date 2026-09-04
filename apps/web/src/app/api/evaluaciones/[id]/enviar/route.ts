import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaEvaluationRepository } from "@/modules/evaluations/infrastructure/prisma-evaluation.repository";
import { EnviarIntentoUseCase } from "@/modules/evaluations/application/evaluation.use-cases";
import type { RespuestaEstudiante } from "@/modules/evaluations/domain/evaluation.entity";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: evaluationId } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const respuestas: RespuestaEstudiante[] = body?.respuestas ?? [];

  try {
    const repo = new PrismaEvaluationRepository(prisma);
    const useCase = new EnviarIntentoUseCase(repo);
    const resultado = await useCase.execute(user.id, evaluationId, respuestas);
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al calificar la evaluación." },
      { status: 400 }
    );
  }
}
