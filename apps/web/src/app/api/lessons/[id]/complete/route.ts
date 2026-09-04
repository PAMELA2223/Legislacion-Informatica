import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaCourseRepository } from "@/modules/courses/infrastructure/prisma-course.repository";
import { MarcarLeccionCompletadaUseCase } from "@/modules/courses/application/course.use-cases";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const repo = new PrismaCourseRepository(prisma);
    const useCase = new MarcarLeccionCompletadaUseCase(repo);
    const resultado = await useCase.execute(user.id, lessonId);
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar progreso." },
      { status: 400 }
    );
  }
}
