import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ActualizarEvaluacionUseCase, EliminarEvaluacionUseCase } from "@/modules/admin/application/admin.use-cases";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    await new ActualizarEvaluacionUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id, body ?? {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al guardar." }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    await new EliminarEvaluacionUseCase(new PrismaAdminRepository(prisma)).execute(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al eliminar." }, { status: 409 });
  }
}
