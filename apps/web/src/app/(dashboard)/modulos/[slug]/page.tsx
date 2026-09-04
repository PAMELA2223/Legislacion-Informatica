import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaCourseRepository } from "@/modules/courses/infrastructure/prisma-course.repository";
import { ObtenerCursoUseCase } from "@/modules/courses/application/course.use-cases";
import { LessonTabsClient } from "@/modules/courses/presentation/lesson-tabs-client";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function ModuloDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaCourseRepository(prisma);
  const useCase = new ObtenerCursoUseCase(repo);

  let curso;
  try {
    curso = await useCase.execute(slug);
  } catch {
    notFound();
  }

  // Progreso de lecciones del usuario actual para este curso
  const progresoLecciones = await prisma.lessonProgress.findMany({
    where: { userId: user.id, lesson: { courseId: curso.id } },
  });
  const idsCompletadas = new Set(progresoLecciones.map((p) => p.lessonId));

  const lecciones = curso.lessons.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    titulo: l.titulo,
    urlRecurso: l.urlRecurso,
    contenido: l.contenido,
    completado: idsCompletadas.has(l.id),
  }));

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: curso.id } },
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
        Módulo {curso.numero}
      </span>
      <h1 className="text-2xl font-bold text-foreground mt-3 mb-2">{curso.titulo}</h1>
      <p className="text-muted-foreground mb-4">{curso.descripcion}</p>

      <div className="mb-8">
        <ProgressBar value={enrollment?.progreso ?? 0} />
        <span className="text-xs text-muted-foreground">
          {enrollment?.progreso ?? 0}% completado
        </span>
      </div>

      <LessonTabsClient lecciones={lecciones} />

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-foreground mb-2">Resumen</h2>
        <p className="text-sm text-muted-foreground mb-4">{curso.resumen}</p>
        <h2 className="font-semibold text-foreground mb-2">Propósito académico</h2>
        <p className="text-sm text-muted-foreground mb-4">{curso.propositoAcademico}</p>
        <h2 className="font-semibold text-foreground mb-2">Bibliografía</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {curso.bibliografia}
        </p>
      </div>
    </main>
  );
}
