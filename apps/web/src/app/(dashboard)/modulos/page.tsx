import Link from "next/link";
import { Award, Lock, ClipboardCheck } from "lucide-react";
import { requireAutenticado } from "@/lib/authorization";
import { exigirAutoevaluacionInicial } from "@/lib/learning-path";
import { prisma } from "@/lib/prisma";
import { PrismaCourseRepository } from "@/modules/courses/infrastructure/prisma-course.repository";
import { ListarCursosUseCase } from "@/modules/courses/application/course.use-cases";
import { ModuleCard } from "@/modules/courses/presentation/module-card";
import { LearningPathSteps } from "@/modules/learning-path/presentation/learning-path-steps";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ModulosPage() {
  const ctx = await requireAutenticado("/modulos");
  // Estudiante sin autoevaluación inicial → redirigido a ella.
  const estado = await exigirAutoevaluacionInicial(ctx);

  // Vista del administrador: todos los módulos activos, sin bloqueo (previsualización).
  if (!estado) {
    const cursos = await new ListarCursosUseCase(new PrismaCourseRepository(prisma)).execute();
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">Módulos educativos</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Vista previa de administrador: los estudiantes ven estos módulos en orden y desbloqueo progresivo.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursos.map((c, i) => (
            <ModuleCard
              key={c.id}
              slug={c.slug}
              numero={i + 1}
              titulo={c.titulo}
              descripcion={c.descripcion}
              progreso={0}
              completado={false}
              desbloqueado
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Módulos educativos</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Itinerario progresivo de {estado.totalModulos} módulos sobre legislación informática. Revisa el
        contenido de cada módulo y aprueba su evaluación para desbloquear el siguiente.
      </p>

      <div className="mb-8">
        <LearningPathSteps estado={estado} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {estado.modulos.map((m) => (
          <ModuleCard
            key={m.courseId}
            slug={m.slug}
            numero={m.posicion}
            titulo={m.titulo}
            descripcion={m.descripcion}
            progreso={m.progresoLecciones}
            completado={m.completado}
            desbloqueado={m.desbloqueado}
            evaluacion={{
              requerida: m.requiereEvaluacion,
              aprobada: m.evaluacionAprobada,
              puntaje: m.mejorIntento?.puntaje ?? null,
            }}
          />
        ))}
        {estado.modulos.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">Todavía no hay módulos disponibles.</p>
        )}
      </div>

      {/* Cierre del itinerario: autoevaluación final */}
      {estado.modulos.length > 0 && (
        <div
          className={`mt-8 rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            estado.final.habilitada || estado.final.completada ? "border-primary bg-primary/5" : "border-border bg-surface"
          }`}
        >
          <div className="flex items-start gap-3">
            {estado.final.completada ? (
              <Award className="w-6 h-6 text-success shrink-0" />
            ) : estado.final.habilitada ? (
              <ClipboardCheck className="w-6 h-6 text-primary shrink-0" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div>
              <p className="font-semibold text-foreground">Autoevaluación final</p>
              <p className="text-sm text-muted-foreground">
                {estado.final.completada
                  ? `Completada con ${estado.final.puntaje}%. ¡Terminaste el proceso de aprendizaje!`
                  : estado.final.habilitada
                    ? "¡Completaste todos los módulos! Ya puedes rendir la autoevaluación final."
                    : estado.todosLosModulosCompletados
                      ? "En preparación por el administrador."
                      : `Se habilita al completar los ${estado.totalModulos} módulos y sus evaluaciones.`}
              </p>
            </div>
          </div>
          {(estado.final.habilitada || estado.final.completada) && (
            <Link href="/autoevaluacion/final" className="shrink-0">
              <Button>{estado.final.completada ? "Ver resultados" : "Rendir autoevaluación final"}</Button>
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
