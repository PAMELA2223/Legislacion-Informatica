import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { VincularInfografiasIncluidasUseCase } from "@/modules/admin/application/admin.use-cases";

/** Asocia a sus módulos las infografías que vienen incluidas en la plataforma. */
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const r = await new VincularInfografiasIncluidasUseCase(new PrismaAdminRepository(prisma)).execute(admin.id);
  return NextResponse.json({ ...r, importados: r.vinculadas });
}
