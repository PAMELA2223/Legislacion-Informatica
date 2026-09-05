import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { EliminarPreguntaUseCase } from "@/modules/admin/application/admin.use-cases";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const repo = new PrismaAdminRepository(prisma);
  const useCase = new EliminarPreguntaUseCase(repo);
  await useCase.execute(admin.id, id);
  return NextResponse.json({ ok: true });
}
