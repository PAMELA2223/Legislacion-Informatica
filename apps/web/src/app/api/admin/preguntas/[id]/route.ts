import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import {
  ActualizarPreguntaUseCase,
  CambiarEstadoPreguntaUseCase,
  EliminarPreguntaUseCase,
} from "@/modules/admin/application/admin.use-cases";

/** Editar enunciado, opciones, respuesta correcta, retroalimentación y puntaje. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    await new ActualizarPreguntaUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al guardar la pregunta." }, { status: 400 });
  }
}

/** Activar / desactivar la pregunta: { activo: boolean } */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    await new CambiarEstadoPreguntaUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id, body?.activo);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al cambiar el estado." }, { status: 400 });
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
  const useCase = new EliminarPreguntaUseCase(repo);
  await useCase.execute(admin.id, id);
  return NextResponse.json({ ok: true });
}
