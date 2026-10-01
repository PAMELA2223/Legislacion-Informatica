import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { fechaHoraCsvEC } from "@/lib/fechas";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerResultadosEvaluacionModuloUseCase } from "@/modules/admin/application/admin.use-cases";
import { filtrarResultados, leerFiltroEstado, resultadosACsv } from "@/modules/admin/domain/evaluation-results";

/** Descarga los resultados de una evaluación de módulo en CSV (se abre en Excel). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  let r;
  try {
    r = await new ObtenerResultadosEvaluacionModuloUseCase(new PrismaAdminRepository(prisma)).execute(id);
  } catch {
    return NextResponse.json({ error: "Evaluación de módulo no encontrada." }, { status: 404 });
  }
  const sp = new URL(request.url).searchParams;
  const estudiantes = filtrarResultados(r.estudiantes, leerFiltroEstado(sp.get("estado") ?? undefined), sp.get("q") ?? "");
  const csv = resultadosACsv(
    { modulo: `Módulo ${r.evaluacion.cursoNumero}: ${r.evaluacion.cursoTitulo}`, evaluacion: r.evaluacion.titulo },
    estudiantes,
    fechaHoraCsvEC
  );
  const nombre = `resultados-modulo-${r.evaluacion.cursoNumero}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "no-store",
    },
  });
}
