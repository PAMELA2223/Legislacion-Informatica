import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, Info } from "lucide-react";
import { requireAutenticado } from "@/lib/authorization";
import { obtenerEstadoAprendizaje } from "@/lib/learning-path";
import { prisma } from "@/lib/prisma";
import { PrismaEvaluationRepository } from "@/modules/evaluations/infrastructure/prisma-evaluation.repository";
import { ObtenerEvaluacionParaResolverUseCase } from "@/modules/evaluations/application/evaluation.use-cases";
import { EvaluationRunner } from "@/modules/evaluations/presentation/evaluation-runner";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// Autoevaluación inicial OBLIGATORIA (diagnóstica). Un estudiante que no la
// ha rendido es redirigido aquí desde el dashboard y desde los módulos.
export default async function AutoevaluacionInicialPage() {
  const ctx = await requireAutenticado("/autoevaluacion/inicial");
  if (ctx.rol === "ADMINISTRADOR") redirect("/admin/autoevaluaciones");

  const estado = await obtenerEstadoAprendizaje(ctx.id);

  if (estado.inicial.completada) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">Autoevaluación inicial</h1>
        <p className="text-sm text-muted-foreground mb-8">Ya registraste tu diagnóstico inicial.</p>
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center mb-6">
          <ClipboardCheck className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{estado.inicial.puntaje}%</p>
          <p className="text-sm text-muted-foreground">
            Intento 1 de 1 · registrado el{" "}
            {estado.inicial.fecha && new Date(estado.inicial.fecha).toLocaleDateString("es-EC")}
          </p>
        </div>
        <Link href="/modulos">
          <Button>Ir a los módulos</Button>
        </Link>
      </main>
    );
  }

  if (!estado.inicial.configurada || !estado.inicial.evaluationId) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Autoevaluación inicial</h1>
        <div className="rounded-xl border border-border bg-surface p-5 flex gap-3 text-sm text-muted-foreground mb-6">
          <Info className="w-5 h-5 text-primary shrink-0" />
          La autoevaluación inicial todavía no ha sido configurada por el administrador. Puedes comenzar
          con los módulos mientras tanto.
        </div>
        <Link href="/modulos">
          <Button>Ir a los módulos</Button>
        </Link>
      </main>
    );
  }

  const evaluacion = await new ObtenerEvaluacionParaResolverUseCase(new PrismaEvaluationRepository(prisma)).execute(
    estado.inicial.evaluationId
  );

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <span className="text-xs font-semibold text-accent bg-accent/10 rounded-full px-2.5 py-1">
        Paso 1 · Obligatorio
      </span>
      <h1 className="text-2xl font-bold text-foreground mt-3 mb-1">{evaluacion.titulo}</h1>
      <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
        {evaluacion.descripcion ||
          "Antes de comenzar, responde este breve diagnóstico sobre legislación informática. No afecta tu calificación: sirve para conocer tus conocimientos previos y compararlos al final del curso."}
      </p>
      <p className="text-xs text-muted-foreground mb-8">
        Tienes <strong>1 intento</strong>: se responde una sola vez. Al terminar se habilitarán los módulos de aprendizaje.
      </p>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <EvaluationRunner
          evaluacion={evaluacion}
          modo="autoevaluacion"
          mostrarRetroalimentacion={false}
          enlaceTrasEnviar={{ href: "/modulos", label: "Comenzar los módulos" }}
        />
      </div>
    </main>
  );
}
