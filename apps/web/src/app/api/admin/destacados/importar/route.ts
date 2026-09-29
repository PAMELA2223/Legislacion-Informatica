import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaFeaturedRepository } from "@/modules/featured/infrastructure/prisma-featured.repository";
import { ImportarRecursosAntiguosUseCase } from "@/modules/featured/application/featured.use-cases";

// Copia a "Lo más destacado" los videos e infografías que existían en las
// tablas antiguas (video_resources, infographics). Idempotente: lo ya
// importado no se duplica. Las tablas originales no se modifican.
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const r = await new ImportarRecursosAntiguosUseCase(new PrismaFeaturedRepository(prisma)).execute(admin.id);
  return NextResponse.json(r);
}
