import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaFeaturedRepository } from "@/modules/featured/infrastructure/prisma-featured.repository";
import { GuardarDestacadoUseCase } from "@/modules/featured/application/featured.use-cases";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => null);
  try {
    await new GuardarDestacadoUseCase(new PrismaFeaturedRepository(prisma)).execute(admin.id, null, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al crear." }, { status: 400 });
  }
}
