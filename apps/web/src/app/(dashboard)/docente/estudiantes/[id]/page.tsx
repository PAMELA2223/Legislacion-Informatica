import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { requireTutorDe } from "@/lib/require-tutor-of";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import {
  ObtenerResumenAcademicoUseCase,
} from "@/modules/tutoring/application/tutoring-assignment.use-cases";
import {
  ListarTareasUseCase,
  ListarObjetivosUseCase,
  ListarObservacionesUseCase,
  ListarReunionesUseCase,
  ListarRecursosUseCase,
} from "@/modules/tutoring/application/tutoring-plan.use-cases";
import { AcademicSummaryCard } from "@/modules/tutoring/presentation/academic-summary-card";
import { TutoringStatusActions } from "@/modules/tutoring/presentation/tutoring-status-actions";
import { PlanTabs } from "@/modules/tutoring/presentation/plan-tabs";
import { ETIQUETAS_ESTADO_TUTORIA } from "@/modules/tutoring/domain/tutoring.entity";

export default async function PerfilTutoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: estudianteId } = await params;
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect("/login");

  // Verificación de servidor (Sección 20): si el estudiante no está bajo la
  // tutela del docente autenticado (y no es administrador), se rechaza.
  // Esto es lo que impide /docente/estudiantes/ID-DE-OTRO-ESTUDIANTE.
  const autorizacion = await requireTutorDe(estudianteId);
  if (!autorizacion.autorizado) notFound();

  const estudiante = await prisma.user.findUnique({ where: { id: estudianteId } });
  if (!estudiante) notFound();

  const repo = new PrismaTutoringRepository(prisma);
  const resumen = await new ObtenerResumenAcademicoUseCase(repo).execute(estudianteId);

  // Si es el docente (no admin), buscamos su propia asignación para mostrar
  // el estado y habilitar las acciones (finalizar, etc.)
  const asignacion = autorizacion.assignmentId
    ? await repo.obtenerAsignacion(autorizacion.assignmentId)
    : null;

  let tareas: Awaited<ReturnType<ListarTareasUseCase["execute"]>> = [];
  let objetivos: Awaited<ReturnType<ListarObjetivosUseCase["execute"]>> = [];
  let observaciones: Awaited<ReturnType<ListarObservacionesUseCase["execute"]>> = [];
  let reuniones: Awaited<ReturnType<ListarReunionesUseCase["execute"]>> = [];
  let recursos: Awaited<ReturnType<ListarRecursosUseCase["execute"]>> = [];

  if (autorizacion.assignmentId) {
    [tareas, objetivos, observaciones, reuniones, recursos] = await Promise.all([
      new ListarTareasUseCase(repo).execute(autorizacion.assignmentId),
      new ListarObjetivosUseCase(repo).execute(autorizacion.assignmentId),
      new ListarObservacionesUseCase(repo).execute(autorizacion.assignmentId),
      new ListarReunionesUseCase(repo).execute(autorizacion.assignmentId),
      new ListarRecursosUseCase(repo).execute(autorizacion.assignmentId),
    ]);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
            {estudiante.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{estudiante.nombre}</h1>
            <p className="text-sm text-muted-foreground">{estudiante.email}</p>
            {asignacion && (
              <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-1 mt-1 inline-block">
                {ETIQUETAS_ESTADO_TUTORIA[asignacion.estado]}
              </span>
            )}
          </div>
        </div>
        {asignacion && !autorizacion.esAdmin && (
          <TutoringStatusActions assignmentId={asignacion.id} />
        )}
      </div>

      <h2 className="font-semibold text-foreground mb-4">Resumen académico</h2>
      <AcademicSummaryCard resumen={resumen} />

      <div className="rounded-2xl border border-border bg-surface p-6 mt-8">
        <h2 className="font-semibold text-foreground mb-4">Plan de acompañamiento</h2>
        {asignacion ? (
          <PlanTabs
            assignmentId={asignacion.id}
            puedeEditar={!autorizacion.esAdmin}
            puedeCompletarTareas={!autorizacion.esAdmin}
            tareas={tareas}
            objetivos={objetivos}
            observaciones={observaciones}
            reuniones={reuniones}
            recursos={recursos}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Este estudiante no tiene una tutoría activa asignada a tu cuenta.
          </p>
        )}
      </div>
    </main>
  );
}
