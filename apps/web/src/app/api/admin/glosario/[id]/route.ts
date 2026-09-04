import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import {
  EliminarTerminoGlosarioUseCase,
  GuardarTerminoGlosarioUseCase,
} from "@/modules/admin/application/admin.use-cases";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const body = await request.json().catch(() => null);
  try {
    const repo = new PrismaAdminRepository(prisma);
    const useCase = new GuardarTerminoGlosarioUseCase(repo);
    await useCase.execute(admin.id, id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar el término." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const repo = new PrismaAdminRepository(prisma);
  const useCase = new EliminarTerminoGlosarioUseCase(repo);
  await useCase.execute(admin.id, id);
  return NextResponse.json({ ok: true });
}
