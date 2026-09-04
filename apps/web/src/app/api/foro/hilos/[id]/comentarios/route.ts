import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaForumRepository } from "@/modules/forum/infrastructure/prisma-forum.repository";
import { CrearComentarioUseCase } from "@/modules/forum/application/forum.use-cases";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params;
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  try {
    const repo = new PrismaForumRepository(prisma);
    const useCase = new CrearComentarioUseCase(repo);
    await useCase.execute(threadId, user.id, body?.contenido ?? "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el comentario." },
      { status: 400 }
    );
  }
}
