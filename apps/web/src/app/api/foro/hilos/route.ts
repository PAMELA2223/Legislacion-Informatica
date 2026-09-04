import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaForumRepository } from "@/modules/forum/infrastructure/prisma-forum.repository";
import { CrearHiloUseCase } from "@/modules/forum/application/forum.use-cases";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  try {
    const repo = new PrismaForumRepository(prisma);
    const useCase = new CrearHiloUseCase(repo);
    const hilo = await useCase.execute(user.id, body?.titulo ?? "", body?.categoria ?? "GENERAL");
    return NextResponse.json(hilo);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el hilo." },
      { status: 400 }
    );
  }
}
