import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ActualizarCursoUseCase, EliminarCursoUseCase } from "@/modules/admin/application/admin.use-cases";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    await new ActualizarCursoUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al guardar el módulo." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  try {
    const r = await new EliminarCursoUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id);
    return NextResponse.json({ ok: true, ...r });
  } catch (error) {
    // Se devuelve el motivo real para que el administrador lo vea (no un fallo silencioso).
    console.error("[admin] Error al eliminar módulo", id, error);
    return NextResponse.json(
      {
        error:
          "No se pudo eliminar el módulo. " +
          (error instanceof Error ? error.message : "Ocurrió un error inesperado en el servidor."),
      },
      { status: 400 }
    );
  }
}
