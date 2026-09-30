import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { EliminarLeccionUseCase, GuardarInfografiaDeModuloUseCase } from "@/modules/admin/application/admin.use-cases";

/** Editar la infografía: título, descripción, módulo o reemplazar la imagen. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    await new GuardarInfografiaDeModuloUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al guardar la infografía." }, { status: 400 });
  }
}

/** Eliminar la infografía del módulo (es una lección de tipo Infografía). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  try {
    await new EliminarLeccionUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id);
    return NextResponse.json({ ok: true, mensaje: "Infografía eliminada del módulo." });
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo eliminar la infografía. " + (error instanceof Error ? error.message : "") },
      { status: 400 }
    );
  }
}
