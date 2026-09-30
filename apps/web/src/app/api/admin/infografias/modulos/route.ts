import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { GuardarInfografiaDeModuloUseCase } from "@/modules/admin/application/admin.use-cases";

/** Agregar una infografía a un módulo. */
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    const r = await new GuardarInfografiaDeModuloUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, null, body);
    return NextResponse.json({ ok: true, ...r });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al guardar la infografía." }, { status: 400 });
  }
}
