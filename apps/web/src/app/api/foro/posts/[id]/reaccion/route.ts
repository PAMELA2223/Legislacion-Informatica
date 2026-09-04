import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaForumRepository } from "@/modules/forum/infrastructure/prisma-forum.repository";
import { AlternarReaccionUseCase } from "@/modules/forum/application/forum.use-cases";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const repo = new PrismaForumRepository(prisma);
  const useCase = new AlternarReaccionUseCase(repo);
  const reacciono = await useCase.execute(postId, user.id);

  return NextResponse.json({ reacciono });
}
