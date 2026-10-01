import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, BarChart3 } from "lucide-react";
import { requireAutenticado } from "@/lib/authorization";
import { obtenerEstadoAprendizaje } from "@/lib/learning-path";
import { prisma } from "@/lib/prisma";
import { PrismaSelfAssessmentRepository } from "@/modules/self-assessment/infrastructure/prisma-self-assessment.repository";
import { ObtenerPerfilComparativoUseCase } from "@/modules/self-assessment/application/self-assessment.use-cases";
import { RadarProfileChart } from "@/modules/self-assessment/presentation/radar-profile-chart";
import { LearningPathSteps } from "@/modules/learning-path/presentation/learning-path-steps";
import { ResultsComparison } from "@/modules/learning-path/presentation/results-comparison";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AutoevaluacionPage() {
  const ctx = await requireAutenticado("/autoevaluacion");
  if (ctx.rol === "ADMINISTRADOR") redirect("/admin/autoevaluaciones");

  const [estado, perfil] = await Promise.all([
    obtenerEstadoAprendizaje(ctx.id),
    new ObtenerPerfilComparativoUseCase(new PrismaSelfAssessmentRepository(prisma)).execute(ctx.id),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Autoevaluación</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Diagnóstico inicial obligatorio al empezar y autoevaluación final obligatoria al completar todos los
        módulos, para comparar lo que sabías con lo que aprendiste.
      </p>

      <div className="mb-8">
        <LearningPathSteps estado={estado} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 mb-8">
        <h2 className="font-semibold text-foreground mb-4">Resultado inicial → Resultado final</h2>
        <ResultsComparison
          inicial={estado.inicial.puntaje}
          final={estado.final.puntaje}
          fechaInicial={estado.inicial.fecha}
          fechaFinal={estado.final.fecha}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          {estado.etapa === "AUTOEVALUACION_INICIAL" && (
            <Link href="/autoevaluacion/inicial">
              <Button>Rendir autoevaluación inicial</Button>
            </Link>
          )}
          {estado.final.habilitada && !estado.final.completada && (
            <Link href="/autoevaluacion/final">
              <Button>Rendir autoevaluación final</Button>
            </Link>
          )}
          {estado.final.completada && (
            <Link href="/autoevaluacion/final">
              <Button variant="outline">
                {estado.final.intentosRestantes > 0
                  ? `Ver mis intentos (${estado.final.intentosRealizados} de ${estado.final.intentosPermitidos}) · mejorar nota`
                  : "Ver mis intentos"}
              </Button>
            </Link>
          )}
          {estado.etapa === "MODULOS" && (
            <Link href="/modulos">
              <Button variant="outline">Continuar con los módulos</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Cuestionario de percepción de competencias (Likert) — funcionalidad
          previa que se conserva como complemento opcional; alimenta el radar
          del dashboard y las estadísticas del administrador. */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-foreground">Perfil de competencias digitales (opcional)</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Cuestionario de percepción en 6 ejes. No tiene respuestas correctas: mide cómo valoras tus propias
          competencias.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            { label: "Percepción inicial", hecho: Boolean(perfil.inicial), href: "/autoevaluacion/diagnostico-inicial" },
            { label: "Percepción final", hecho: Boolean(perfil.final), href: "/autoevaluacion/diagnostico-final" },
          ].map((c) => (
            <div key={c.href} className="rounded-xl border border-border p-4 flex items-center justify-between">
              <span className="text-sm text-foreground">{c.label}</span>
              {c.hecho ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Link href={c.href}>
                  <Button variant="outline">Responder</Button>
                </Link>
              )}
            </div>
          ))}
        </div>
        {(perfil.inicial || perfil.final) && <RadarProfileChart inicial={perfil.inicial} final={perfil.final} />}
      </div>
    </main>
  );
}
