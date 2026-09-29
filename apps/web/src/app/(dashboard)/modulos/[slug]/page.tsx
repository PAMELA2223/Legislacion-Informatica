import { notFound, redirect } from "next/navigation";
import { requireAutenticado } from "@/lib/authorization";
import { exigirAutoevaluacionInicial } from "@/lib/learning-path";
import { prisma } from "@/lib/prisma";
import { PrismaCourseRepository } from "@/modules/courses/infrastructure/prisma-course.repository";
import { ObtenerCursoUseCase } from "@/modules/courses/application/course.use-cases";
import { ModuleLearningView } from "@/modules/courses/presentation/module-learning-view";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";

export const dynamic = "force-dynamic";

export default async function ModuloDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ctx = await requireAutenticado(`/modulos/${slug}`);
  const estado = await exigirAutoevaluacionInicial(ctx); // null = administrador (vista previa)

  let curso;
  try {
    curso = await new ObtenerCursoUseCase(new PrismaCourseRepository(prisma)).execute(slug);
  } catch {
    notFound();
  }

  const estadoModulo = estado?.modulos.find((m) => m.courseId === curso.id) ?? null;
  if (estado) {
    // Estudiante: el módulo debe estar activo y desbloqueado (no basta con conocer la URL).
    if (!estadoModulo) notFound();
    if (!estadoModulo.desbloqueado) redirect("/modulos");
  }

  const idsCompletadas = estado
    ? new Set(
        (
          await prisma.lessonProgress.findMany({
            where: { userId: ctx.id, completado: true, lesson: { courseId: curso.id } },
            select: { lessonId: true },
          })
        ).map((p) => p.lessonId)
      )
    : new Set<string>();

  const lecciones = curso.lessons.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    titulo: l.titulo,
    urlRecurso: l.urlRecurso,
    contenido: l.contenido,
    completado: idsCompletadas.has(l.id),
  }));

  // Evaluación: para el estudiante sale del estado del flujo; para el
  // administrador (vista previa) se consulta la evaluación del módulo.
  let evaluacion: { existe: boolean; aprobada: boolean; href: string | null; mejorPuntaje: number | null };
  if (estadoModulo) {
    evaluacion = {
      existe: estadoModulo.requiereEvaluacion,
      aprobada: estadoModulo.evaluacionAprobada,
      href: estadoModulo.evaluacion ? `/evaluaciones/${estadoModulo.evaluacion.id}` : null,
      mejorPuntaje: estadoModulo.mejorIntento?.puntaje ?? null,
    };
  } else {
    const ev = await prisma.evaluation.findFirst({
      where: { courseId: curso.id, tipo: TIPO_EVALUACION.MODULO },
      orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
      select: { id: true, _count: { select: { preguntas: { where: { activo: true } } } } },
    });
    evaluacion = {
      existe: Boolean(ev && ev._count.preguntas > 0),
      aprobada: false,
      href: ev ? `/evaluaciones/${ev.id}` : null,
      mejorPuntaje: null,
    };
  }

  // Qué sigue al terminar este módulo.
  let siguientePaso: { href: string; etiqueta: string } | null = null;
  if (estado && estadoModulo) {
    const siguiente = estado.modulos[estadoModulo.posicion];
    if (siguiente) siguientePaso = { href: `/modulos/${siguiente.slug}`, etiqueta: `Siguiente módulo: ${siguiente.titulo}` };
    else if (estado.final.configurada || estado.final.completada)
      siguientePaso = {
        href: "/autoevaluacion/final",
        etiqueta: estado.final.completada ? "Ver resultados finales" : "Ir a la autoevaluación final",
      };
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <ModuleLearningView
        modulo={{
          posicion: estadoModulo?.posicion ?? curso.numero,
          total: estado?.totalModulos ?? null,
          titulo: curso.titulo,
          descripcion: curso.descripcion,
        }}
        lecciones={lecciones}
        evaluacion={evaluacion}
        siguientePaso={siguientePaso}
        vistaPrevia={!estado}
      />

      <details className="mt-6 rounded-2xl border border-border bg-surface p-6 group">
        <summary className="cursor-pointer font-semibold text-foreground">
          Información del módulo: resumen, propósito y bibliografía
        </summary>
        <div className="mt-4">
          <h2 className="font-semibold text-foreground mb-2">Resumen</h2>
          <p className="text-sm text-muted-foreground mb-4">{curso.resumen}</p>
          <h2 className="font-semibold text-foreground mb-2">Propósito académico</h2>
          <p className="text-sm text-muted-foreground mb-4">{curso.propositoAcademico}</p>
          <h2 className="font-semibold text-foreground mb-2">Bibliografía</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{curso.bibliografia}</p>
        </div>
      </details>
    </main>
  );
}
