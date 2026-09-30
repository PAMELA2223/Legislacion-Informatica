import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { AsociarInfografiaAntiguaUseCase } from "@/modules/admin/application/admin.use-cases";

/** Copia una infografía de la sección antigua a un módulo: { courseId }. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    await new AsociarInfografiaAntiguaUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id, body?.courseId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al asociar." }, { status: 400 });
  }
}
