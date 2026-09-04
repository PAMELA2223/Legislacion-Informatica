import Link from "next/link";
import { Users, TrendingUp, ClipboardList, UserPlus, Clock, GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaDashboardRepository } from "@/modules/dashboard/infrastructure/prisma-dashboard.repository";
import { ObtenerDashboardDocenteUseCase } from "@/modules/dashboard/application/dashboard.use-cases";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { ListarTutoriasDelDocenteUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";
import { StatCard } from "@/modules/dashboard/presentation/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";

export default async function DocenteDashboardPage() {
  // El layout de /docente ya exige DOCENTE o ADMINISTRADOR; se vuelve a
  // pedir aquí (redundante pero barato) para obtener el contexto tipado.
  const user = await requireRole(["DOCENTE", "ADMINISTRADOR"]);

  const dashboardRepo = new PrismaDashboardRepository(prisma);
  const resumen = await new ObtenerDashboardDocenteUseCase(dashboardRepo).execute();

  // "Mi tutoría" solo aplica a docentes reales (un administrador viendo este
  // panel no tiene tutorías propias).
  let tutoriasActivas: Awaited<ReturnType<ListarTutoriasDelDocenteUseCase["execute"]>> = [];
  let tutoriasPendientes: typeof tutoriasActivas = [];
  if (user.rol === "DOCENTE") {
    const tutoringRepo = new PrismaTutoringRepository(prisma);
    const useCase = new ListarTutoriasDelDocenteUseCase(tutoringRepo);
    [tutoriasActivas, tutoriasPendientes] = await Promise.all([
      useCase.execute(user.id, "ACTIVA"),
      useCase.execute(user.id, "PENDIENTE"),
    ]);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Panel del docente</h1>
      <p className="text-sm text-muted-foreground mb-2">Resumen general</p>
      <p className="text-xs text-muted-foreground mb-6">
        Desempeño agregado de todos los estudiantes de la plataforma.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Total de estudiantes"
          value={resumen.totalEstudiantes}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Progreso promedio"
          value={`${resumen.progresoPromedioGeneral}%`}
        />
        <StatCard
          icon={<ClipboardList className="w-4 h-4" />}
          label="Promedio de evaluaciones"
          value={`${resumen.promedioCalificacionesGeneral}%`}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 mb-10">
        <h2 className="font-semibold text-foreground mb-4">Participación por módulo</h2>
        <div className="flex flex-col gap-4">
          {resumen.progresoPorModulo.map((m) => (
            <div key={m.courseId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{m.titulo}</span>
                <span className="text-xs text-muted-foreground">
                  {m.completados}/{m.inscritos} completado(s)
                </span>
              </div>
              <ProgressBar value={m.inscritos === 0 ? 0 : (m.completados / m.inscritos) * 100} />
            </div>
          ))}
        </div>
      </div>

      {user.rol === "DOCENTE" && (
        <>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-foreground">Mi tutoría</h2>
            <div className="flex gap-2">
              <Link href="/docente/agregar-estudiante">
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar estudiante
                </Button>
              </Link>
              <Link href="/docente/estudiantes">
                <Button variant="outline">Ver estudiantes</Button>
              </Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Estadísticas de tus estudiantes tutorados (independiente del resumen general de arriba).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard
              icon={<GraduationCap className="w-4 h-4" />}
              label="Estudiantes tutorados"
              value={tutoriasActivas.length}
            />
            <StatCard
              icon={<Clock className="w-4 h-4" />}
              label="Solicitudes pendientes"
              value={tutoriasPendientes.length}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Tareas pendientes, objetivos activos y próximas tutorías se
            habilitan en la siguiente fase de este módulo (Plan de
            acompañamiento).
          </p>
        </>
      )}
    </main>
  );
}
