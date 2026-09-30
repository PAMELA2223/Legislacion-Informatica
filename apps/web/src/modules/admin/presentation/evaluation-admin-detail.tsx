import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerEvaluacionConPreguntasUseCase } from "@/modules/admin/application/admin.use-cases";
import { QuestionForm } from "@/modules/admin/presentation/question-form";
import { QuestionList } from "@/modules/admin/presentation/question-list";
import { EvaluationSettingsForm } from "@/modules/admin/presentation/evaluation-settings-form";
import { ETIQUETAS_TIPO_EVALUACION, TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";


// Detalle compartido: gestión de preguntas de una evaluación de módulo
// (apartado Evaluaciones) o de una autoevaluación (apartado Autoevaluaciones).
export async function EvaluationAdminDetail({ id, seccion }: { id: string; seccion: "evaluaciones" | "autoevaluaciones" }) {
  let evaluacion;
  try {
    evaluacion = await new ObtenerEvaluacionConPreguntasUseCase(new PrismaAdminRepository(prisma)).execute(id);
  } catch {
    notFound();
  }

  // Cada tipo se administra solo en su apartado: las autoevaluaciones en
  // "Autoevaluaciones" y las de módulo en "Evaluaciones".
  const esAuto = evaluacion.tipo !== TIPO_EVALUACION.MODULO;
  if (esAuto && seccion !== "autoevaluaciones") redirect(`/admin/autoevaluaciones/${evaluacion.id}`);
  if (!esAuto && seccion !== "evaluaciones") redirect(`/admin/evaluaciones/${evaluacion.id}`);

  const activas = evaluacion.preguntas.filter((p) => p.activo).length;
  const volver =
    evaluacion.tipo === TIPO_EVALUACION.MODULO && evaluacion.courseId
      ? { href: `/admin/cursos/${evaluacion.courseId}`, label: evaluacion.cursoTitulo ?? "Módulo" }
      : evaluacion.tipo !== TIPO_EVALUACION.MODULO
        ? { href: "/admin/autoevaluaciones", label: "Autoevaluaciones" }
        : { href: "/admin/evaluaciones", label: "Evaluaciones" };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        <Link href={volver.href} className="hover:underline">{volver.label}</Link>
      </p>
      <span
        className={`inline-block text-xs font-semibold rounded-full px-2.5 py-1 mb-2 ${
          evaluacion.tipo === TIPO_EVALUACION.MODULO ? "text-primary bg-primary/10" : "text-accent bg-accent/10"
        }`}
      >
        {ETIQUETAS_TIPO_EVALUACION[evaluacion.tipo] ?? evaluacion.tipo}
      </span>
      <h1 className="text-2xl font-bold text-foreground mb-1">{evaluacion.titulo}</h1>
      <p className="text-sm text-muted-foreground mb-2">
        {activas} pregunta(s) activa(s) de {evaluacion.preguntas.length} · {evaluacion.totalIntentos} intento(s) registrados
      </p>
      {activas === 0 && (
        <p className="flex items-center gap-2 text-sm text-amber-600 mb-4">
          <AlertTriangle className="w-4 h-4" />
          {evaluacion.tipo === TIPO_EVALUACION.MODULO
            ? "Sin preguntas activas: los estudiantes no deberán rendir esta evaluación."
            : "Sin preguntas activas: esta autoevaluación no se exigirá a los estudiantes hasta que agregues preguntas."}
        </p>
      )}
      {evaluacion.tipo !== TIPO_EVALUACION.MODULO && evaluacion.totalIntentos > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          Ya hay estudiantes que la respondieron: los cambios en las preguntas no modifican sus resultados guardados.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section>
            <h2 className="font-semibold text-foreground mb-3">Preguntas</h2>
            <QuestionList evaluationId={evaluacion.id} preguntas={evaluacion.preguntas} />
          </section>
          <section>
            <h2 className="font-semibold text-foreground mb-3">Agregar pregunta</h2>
            <QuestionForm evaluationId={evaluacion.id} />
          </section>
        </div>
        <aside>
          <h2 className="font-semibold text-foreground mb-3">Configuración</h2>
          <EvaluationSettingsForm evaluacion={evaluacion} />
        </aside>
      </div>
    </div>
  );
}
