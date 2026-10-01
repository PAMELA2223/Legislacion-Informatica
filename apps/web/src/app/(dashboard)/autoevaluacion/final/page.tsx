import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, Info, Award, Star, RotateCcw } from "lucide-react";
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
// Autoevaluación final: hasta 3 intentos; se toma en cuenta la MAYOR nota.
export default async function AutoevaluacionFinalPage({
  searchParams,
}: {
  searchParams: Promise<{ intento?: string }>;
}) {
  const { intento } = await searchParams;
  const ctx = await requireAutenticado("/autoevaluacion/final");
  if (ctx.rol === "ADMINISTRADOR") redirect("/admin/autoevaluaciones");

  const estado = await obtenerEstadoAprendizaje(ctx.id);
  if (!estado.puedeAccederModulos) redirect(RUTA_AUTOEVALUACION_INICIAL);

  const quiereNuevoIntento = intento === "nuevo" && estado.final.intentosRestantes > 0;

  if (estado.final.completada && !quiereNuevoIntento) {
    const intentos = await prisma.quizAttempt.findMany({
      where: { userId: ctx.id, evaluationId: estado.final.evaluationId ?? "" },
      orderBy: { fecha: "asc" },
      select: { id: true, puntaje: true, fecha: true },
    });
    const idQueCuenta = intentos.reduce<(typeof intentos)[number] | null>(
      (mejor, i) => (!mejor || i.puntaje > mejor.puntaje ? i : mejor),
      null
    )?.id;
    const siguiente = estado.final.intentosRealizados + 1;

    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center mb-8">
          <Award className="w-8 h-8 text-success mx-auto mb-2" />
          <h1 className="text-xl font-bold text-foreground">¡Completaste el proceso de aprendizaje!</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Terminaste los {estado.totalModulos} módulos, sus evaluaciones y la autoevaluación final.
          </p>
          <p className="text-sm text-foreground mt-3">
            Tu nota final: <strong className="text-lg">{estado.final.puntaje}%</strong>
            <span className="text-muted-foreground"> (mayor nota de {estado.final.intentosRealizados} intento{estado.final.intentosRealizados === 1 ? "" : "s"})</span>
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6 mb-6" aria-labelledby="mis-intentos">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <h2 id="mis-intentos" className="font-semibold text-foreground">Tus intentos</h2>
            <span className="text-xs text-muted-foreground">
              {estado.final.intentosRealizados} de {estado.final.intentosPermitidos} usados · cuenta la mayor nota
            </span>
          </div>
          <ol className="flex flex-col gap-2">
            {intentos.map((i, n) => {
              const cuenta = i.id === idQueCuenta;
              return (
                <li
                  key={i.id}
                  className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${cuenta ? "bg-success/10 ring-1 ring-success/40" : "bg-background-secondary"}`}
                >
                  <span className="text-foreground">
                    Intento {n + 1}
                    <span className="text-muted-foreground"> · {i.fecha.toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {cuenta && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <Star className="w-3.5 h-3.5" aria-hidden /> Nota que cuenta
                      </span>
                    )}
                    <strong className="text-foreground">{i.puntaje}%</strong>
                  </span>
                </li>
              );
            })}
          </ol>
          {estado.final.intentosRestantes > 0 ? (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Te {estado.final.intentosRestantes === 1 ? "queda 1 intento" : `quedan ${estado.final.intentosRestantes} intentos`} para mejorar tu nota.
              </p>
              <Link href="/autoevaluacion/final?intento=nuevo">
                <Button variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" aria-hidden /> Intentar de nuevo ({siguiente} de {estado.final.intentosPermitidos})
                </Button>
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Ya usaste todos tus intentos.</p>
          )}
        </section>

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
        {estado.final.completada
          ? `Intento ${estado.final.intentosRealizados + 1} de ${estado.final.intentosPermitidos} · para mejorar tu nota`
          : "Último paso · Obligatorio"}
      </span>
      <h1 className="text-2xl font-bold text-foreground mt-3 mb-1">{evaluacion.titulo}</h1>
      <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
        {evaluacion.descripcion ||
          "Completaste todos los módulos. Responde esta autoevaluación final para comprobar lo aprendido y compararlo con tu diagnóstico inicial."}
      </p>
      <p className="text-xs text-muted-foreground mb-8">
        {estado.final.completada ? (
          <>
            Tu mejor nota hasta ahora es <strong>{estado.final.puntaje}%</strong>. Si esta vez obtienes más, se tomará en cuenta la nueva nota; si no,
            se conserva la anterior.
          </>
        ) : (
          <>
            Tienes hasta <strong>{estado.final.intentosPermitidos} intentos</strong> y se toma en cuenta la mayor nota. Tu resultado se compara con el
            de la autoevaluación inicial.
          </>
        )}
      </p>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <EvaluationRunner
          evaluacion={evaluacion}
          modo="autoevaluacion"
          mostrarRetroalimentacion
          enlaceTrasEnviar={{ href: "/autoevaluacion/final", label: "Ver mis intentos y resultados" }}
        />
      </div>
    </main>
  );
}
