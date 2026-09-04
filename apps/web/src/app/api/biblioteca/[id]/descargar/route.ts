import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaLibraryRepository } from "@/modules/library/infrastructure/prisma-library.repository";
import { RegistrarDescargaUseCase } from "@/modules/library/application/library.use-cases";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const repo = new PrismaLibraryRepository(prisma);
  const useCase = new RegistrarDescargaUseCase(repo);
  const descargas = await useCase.execute(documentId);

  return NextResponse.json({ descargas });
}
