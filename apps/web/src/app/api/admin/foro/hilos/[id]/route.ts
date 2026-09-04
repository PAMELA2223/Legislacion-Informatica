import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { EliminarHiloForoUseCase } from "@/modules/admin/application/admin.use-cases";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const repo = new PrismaAdminRepository(prisma);
  const useCase = new EliminarHiloForoUseCase(repo);
  await useCase.execute(user.id, id);
  return NextResponse.json({ ok: true });
}
