import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import {
  CambiarRolUsuarioUseCase,
  EliminarUsuarioUseCase,
} from "@/modules/admin/application/admin.use-cases";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const body = await request.json().catch(() => null);
  try {
    const repo = new PrismaAdminRepository(prisma);
    const useCase = new CambiarRolUsuarioUseCase(repo);
    await useCase.execute(admin.id, userId, body?.rol);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al cambiar el rol." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  try {
    const repo = new PrismaAdminRepository(prisma);
    const useCase = new EliminarUsuarioUseCase(repo);
    await useCase.execute(admin.id, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar el usuario." },
      { status: 400 }
    );
  }
}
