import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, Info, Award } from "lucide-react";
import { requireAutenticado } from "@/lib/authorization";
import { obtenerEstadoAprendizaje, RUTA_AUTOEVALUACION_INICIAL } from "@/lib/learning-path";
import { prisma } from "@/lib/prisma";
import { PrismaEvaluationRepository } from "@/modules/evaluations/infrastructure/prisma-evaluation.repository";
import { ObtenerEvaluacionParaResolverUseCase } from "@/modules/evaluations/application/evaluation.use-cases";
import { EvaluationRunner } from "@/modules/evaluations/presentation/evaluation-runner";
import { ResultsComparison } from "@/modules/learning-path/presentation/results-comparison";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// Autoevaluación final OBLIGATORIA: solo se habilita cuando el estudiante
// completó todos los módulos activos y aprobó sus evaluaciones.
export default async function AutoevaluacionFinalPage() {
  const ctx = await requireAutenticado("/autoevaluacion/final");
  if (ctx.rol === "ADMINISTRADOR") redirect("/admin/autoevaluaciones");

  const estado = await obtenerEstadoAprendizaje(ctx.id);
  if (!estado.puedeAccederModulos) redirect(RUTA_AUTOEVALUACION_INICIAL);

  if (estado.final.completada) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center mb-8">
          <Award className="w-8 h-8 text-success mx-auto mb-2" />
          <h1 className="text-xl font-bold text-foreground">¡Completaste el proceso de aprendizaje!</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Terminaste los {estado.totalModulos} módulos, sus evaluaciones y la autoevaluación final.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Intento 1 de 1 · {estado.final.puntaje}% ·{" "}
            {estado.final.fecha && new Date(estado.final.fecha).toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-foreground mb-4">Resultado inicial → Resultado final</h2>
          <ResultsComparison
            inicial={estado.inicial.puntaje}
            final={estado.final.puntaje}
            fechaInicial={estado.inicial.fecha}
            fechaFinal={estado.final.fecha}
          />
        </div>
      </main>
    );
  }

  if (!estado.final.habilitada || !estado.final.evaluationId) {
    const pct = estado.totalModulos ? Math.round((estado.modulosCompletados / estado.totalModulos) * 100) : 0;
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Autoevaluación final</h1>
        {estado.todosLosModulosCompletados ? (
          <div className="rounded-xl border border-border bg-surface p-5 flex gap-3 text-sm text-muted-foreground">
            <Info className="w-5 h-5 text-primary shrink-0" />
            Completaste todos los módulos. La autoevaluación final aún está en preparación por parte del
            administrador; vuelve a revisar pronto.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Se habilita al completar todos los módulos y sus evaluaciones
              </p>
            </div>
            <ProgressBar value={pct} />
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {estado.modulosCompletados} de {estado.totalModulos} módulos completados
            </p>
            <Link href={estado.siguienteModulo ? `/modulos/${estado.siguienteModulo.slug}` : "/modulos"}>
              <Button>{estado.siguienteModulo ? `Continuar: ${estado.siguienteModulo.titulo}` : "Ir a los módulos"}</Button>
            </Link>
          </div>
        )}
      </main>
    );
  }

  const evaluacion = await new ObtenerEvaluacionParaResolverUseCase(new PrismaEvaluationRepository(prisma)).execute(
    estado.final.evaluationId
  );

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <span className="text-xs font-semibold text-accent bg-accent/10 rounded-full px-2.5 py-1">
        Último paso · Obligatorio
      </span>
      <h1 className="text-2xl font-bold text-foreground mt-3 mb-1">{evaluacion.titulo}</h1>
      <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
        {evaluacion.descripcion ||
          "Completaste todos los módulos. Responde esta autoevaluación final para comprobar lo aprendido y compararlo con tu diagnóstico inicial."}
      </p>
      <p className="text-xs text-muted-foreground mb-8">
        Tienes <strong>1 intento</strong>: la autoevaluación final se responde una sola vez y su resultado se compara con el inicial.
      </p>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <EvaluationRunner
          evaluacion={evaluacion}
          modo="autoevaluacion"
          mostrarRetroalimentacion
          enlaceTrasEnviar={{ href: "/autoevaluacion/final", label: "Ver comparación de resultados" }}
        />
      </div>
    </main>
  );
}
