import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaSelfAssessmentRepository } from "@/modules/self-assessment/infrastructure/prisma-self-assessment.repository";
import { EnviarAutoevaluacionUseCase } from "@/modules/self-assessment/application/self-assessment.use-cases";
import type { TipoDiagnostico } from "@/modules/self-assessment/domain/self-assessment.entity";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await params;
  const tipoNormalizado = tipo.toUpperCase() as TipoDiagnostico;

  if (!["INICIAL", "FINAL"].includes(tipoNormalizado)) {
    return NextResponse.json({ error: "Tipo de diagnóstico inválido." }, { status: 400 });
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const respuestas = body?.respuestas ?? [];

  try {
    const repo = new PrismaSelfAssessmentRepository(prisma);
    const useCase = new EnviarAutoevaluacionUseCase(repo);
    const perfil = await useCase.execute(user.id, tipoNormalizado, respuestas);
    return NextResponse.json({ perfil });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar la autoevaluación." },
      { status: 400 }
    );
  }
}
