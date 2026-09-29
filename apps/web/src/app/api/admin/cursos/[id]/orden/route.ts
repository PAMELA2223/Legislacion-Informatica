import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { MoverCursoUseCase } from "@/modules/admin/application/admin.use-cases";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    await new MoverCursoUseCase(new PrismaAdminRepository(prisma)).execute(admin.id, id, body?.direccion);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al reordenar." }, { status: 400 });
  }
}
