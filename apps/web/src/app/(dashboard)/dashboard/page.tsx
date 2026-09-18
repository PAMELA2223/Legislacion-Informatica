import { redirect } from "next/navigation";
import {
  TrendingUp,
  GraduationCap,
  ClipboardList,
  Scale,
  Star,
  Trophy,
} from "lucide-react";
import { requireAutenticado, rutaHomeDeRol } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaDashboardRepository } from "@/modules/dashboard/infrastructure/prisma-dashboard.repository";
import { ObtenerDashboardEstudianteUseCase } from "@/modules/dashboard/application/dashboard.use-cases";
import { StatCard } from "@/modules/dashboard/presentation/stat-card";
import { RecentActivityList } from "@/modules/dashboard/presentation/recent-activity-list";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RadarProfileChart } from "@/modules/self-assessment/presentation/radar-profile-chart";

export default async function DashboardPage() {
  // requireAutenticado ya exige un rol con acceso a la plataforma (bloquea
  // INVITADO y sin sesión); aquí solo falta la "redirección inteligente"
  // (Sección 10): cada rol tiene una única home real, y /dashboard es la
  // del ESTUDIANTE. Administrador se redirige a la suya.
  const ctx = await requireAutenticado();
  if (ctx.rol !== "ESTUDIANTE") redirect(rutaHomeDeRol(ctx.rol));

  const repo = new PrismaDashboardRepository(prisma);
  const resumen = await new ObtenerDashboardEstudianteUseCase(repo).execute(ctx.id);
  const nombre = ctx.nombre || "";

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">
        {nombre ? `Hola, ${nombre}` : "Hola de nuevo"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Este es tu resumen de progreso.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Progreso general"
          value={`${resumen.progresoGeneral}%`}
          sub={`${resumen.modulosCompletados}/${resumen.totalModulos} módulos completados`}
        />
        <StatCard
          icon={<ClipboardList className="w-4 h-4" />}
          label="Promedio evaluaciones"
          value={`${resumen.promedioCalificaciones}%`}
          sub={`${resumen.evaluacionesRealizadas} realizadas · ${resumen.evaluacionesPendientes} pendientes`}
        />
        <StatCard
          icon={<Scale className="w-4 h-4" />}
          label="Casos resueltos"
          value={resumen.casosResueltos}
          sub={`${resumen.casosCorrectos} respuestas correctas`}
        />
        <StatCard
          icon={<Star className="w-4 h-4" />}
          label="XP · Nivel"
          value={`${resumen.xp} XP`}
          sub={`Nivel ${resumen.nivel}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-1 flex flex-col justify-center items-center text-center">
          <Trophy className="w-6 h-6 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {resumen.ranking > 0 ? `#${resumen.ranking}` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            de {resumen.totalEstudiantesRanking} estudiantes (por XP)
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Progreso general del itinerario</span>
          </div>
          <ProgressBar value={resumen.progresoGeneral} />
          <span className="text-xs text-muted-foreground">
            {resumen.modulosEnCurso} módulo(s) en curso
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-foreground mb-4">Actividad reciente</h2>
          <RecentActivityList actividad={resumen.actividadReciente} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-foreground mb-4">Perfil de competencias digitales</h2>
          {resumen.perfilCompetencias.inicial || resumen.perfilCompetencias.final ? (
            <RadarProfileChart
              inicial={resumen.perfilCompetencias.inicial}
              final={resumen.perfilCompetencias.final}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Todavía no has completado tu diagnóstico de competencias.{" "}
              <a href="/autoevaluacion" className="text-primary hover:underline">
                Comenzar ahora
              </a>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
