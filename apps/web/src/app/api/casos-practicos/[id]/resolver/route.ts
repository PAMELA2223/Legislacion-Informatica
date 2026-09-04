import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaCaseStudyRepository } from "@/modules/case-studies/infrastructure/prisma-case-study.repository";
import { ResolverCasoUseCase } from "@/modules/case-studies/application/case-study.use-cases";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseStudyId } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const indiceSeleccionado = Number(body?.indiceSeleccionado);

  try {
    const repo = new PrismaCaseStudyRepository(prisma);
    const useCase = new ResolverCasoUseCase(repo);
    const resultado = await useCase.execute(user.id, caseStudyId, indiceSeleccionado);
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al resolver el caso." },
      { status: 400 }
    );
  }
}
