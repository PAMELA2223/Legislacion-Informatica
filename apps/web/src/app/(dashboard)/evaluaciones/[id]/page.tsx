import { notFound, redirect } from "next/navigation";
import { requireAutenticado } from "@/lib/authorization";
import { verificarAccesoEvaluacion } from "@/lib/learning-path";
import { prisma } from "@/lib/prisma";
import { PrismaEvaluationRepository } from "@/modules/evaluations/infrastructure/prisma-evaluation.repository";
import { ObtenerEvaluacionParaResolverUseCase } from "@/modules/evaluations/application/evaluation.use-cases";
import { EvaluationRunner } from "@/modules/evaluations/presentation/evaluation-runner";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";

export const dynamic = "force-dynamic";

// Página que ejecuta la evaluación de un módulo. Se llega desde el propio
// módulo; las autoevaluaciones tienen sus rutas propias (/autoevaluacion/*).
export default async function EvaluacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireAutenticado(`/evaluaciones/${id}`);

  const acceso = await verificarAccesoEvaluacion(ctx, id);
  if (!acceso.permitido) {
    if (acceso.status === 404) notFound();
    redirect(acceso.redirigirA);
  }
  if (ctx.rol === "ESTUDIANTE" && acceso.tipo === TIPO_EVALUACION.INICIAL) redirect("/autoevaluacion/inicial");
  if (ctx.rol === "ESTUDIANTE" && acceso.tipo === TIPO_EVALUACION.FINAL) redirect("/autoevaluacion/final");

  let evaluacion;
  try {
    evaluacion = await new ObtenerEvaluacionParaResolverUseCase(new PrismaEvaluationRepository(prisma)).execute(id);
  } catch {
    notFound();
  }

  const volver = acceso.courseSlug ? `/modulos/${acceso.courseSlug}` : "/modulos";

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">{evaluacion.titulo}</h1>
      <p className="text-sm text-muted-foreground mb-8 whitespace-pre-line">
        {evaluacion.descripcion ||
          "Responde todas las preguntas y envía para recibir tu calificación y retroalimentación de inmediato. Necesitas 70% para aprobar."}
      </p>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <EvaluationRunner evaluacion={evaluacion} enlaceTrasEnviar={{ href: volver, label: "Volver al módulo" }} />
      </div>
    </main>
  );
}
