import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import {
  ListarModulosConResultadosUseCase,
  ObtenerResultadosEvaluacionModuloUseCase,
} from "@/modules/admin/application/admin.use-cases";
import { filtrarResultados, leerFiltroEstado } from "@/modules/admin/domain/evaluation-results";
import { EvaluationResultsView } from "@/modules/admin/presentation/evaluation-results-view";

export const dynamic = "force-dynamic";

// Resultados de las evaluaciones de cada módulo: quién la rindió, quién aprobó
// y quién no, su calificación, la fecha y los intentos. Solo consulta.
export default async function ResultadosEvaluacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ modulo?: string; estado?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const repo = new PrismaAdminRepository(prisma);
  const modulos = await new ListarModulosConResultadosUseCase(repo).execute();

  const conEvaluacion = modulos.filter((m) => m.evaluacion);
  const seleccionado =
    modulos.find((m) => m.id === sp.modulo && m.evaluacion) ?? conEvaluacion[0] ?? null;
  const estado = leerFiltroEstado(sp.estado);
  const q = (sp.q ?? "").slice(0, 100);

  const resultados = seleccionado?.evaluacion
    ? await new ObtenerResultadosEvaluacionModuloUseCase(repo).execute(seleccionado.evaluacion.id)
    : null;
  const visibles = resultados ? filtrarResultados(resultados.estudiantes, estado, q) : [];

  return (
    <EvaluationResultsView
      modulos={modulos}
      seleccionado={seleccionado}
      resultados={resultados}
      visibles={visibles}
      estado={estado}
      q={q}
    />
  );
}
