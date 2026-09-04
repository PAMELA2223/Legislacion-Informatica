import { redirect } from "next/navigation";
import { Users, CheckCircle2, Download, BookOpen, Scale, ClipboardList } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaDashboardRepository } from "@/modules/dashboard/infrastructure/prisma-dashboard.repository";
import { ObtenerDashboardAdminUseCase } from "@/modules/dashboard/application/dashboard.use-cases";
import { StatCard } from "@/modules/dashboard/presentation/stat-card";
import { RadarProfileChart } from "@/modules/self-assessment/presentation/radar-profile-chart";

export default async function AdminEstadisticasPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaDashboardRepository(prisma);
  const resumen = await new ObtenerDashboardAdminUseCase(repo).execute();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Estadísticas</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Estadísticas globales de uso de la plataforma.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Usuarios totales"
          value={resumen.totalUsuarios}
          sub={`${resumen.totalEstudiantes} estudiantes · ${resumen.totalDocentes} docentes · ${resumen.totalAdministradores} admin`}
        />
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Tasa de finalización"
          value={`${resumen.tasaFinalizacionGeneral}%`}
          sub="de inscripciones en módulos"
        />
        <StatCard
          icon={<Download className="w-4 h-4" />}
          label="Descargas en biblioteca"
          value={resumen.totalDescargasBiblioteca}
          sub={resumen.documentoMasDescargado?.titulo ?? "—"}
        />
        <StatCard
          icon={<BookOpen className="w-4 h-4" />}
          label="Módulo más consultado"
          value={resumen.cursoMasConsultado?.inscritos ?? 0}
          sub={resumen.cursoMasConsultado?.titulo ?? "Sin datos aún"}
        />
        <StatCard
          icon={<Scale className="w-4 h-4" />}
          label="Casos resueltos (total)"
          value={resumen.totalCasosResueltos}
        />
        <StatCard
          icon={<ClipboardList className="w-4 h-4" />}
          label="Evaluaciones realizadas (total)"
          value={resumen.totalEvaluacionesRealizadas}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-foreground mb-1">
          Perfil de competencias digitales — promedio de la plataforma
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Comparación entre el diagnóstico inicial y final de todos los
          estudiantes: es el principal insumo cuantitativo para la validación
          de la investigación.
        </p>
        {resumen.promedioPerfilInicial || resumen.promedioPerfilFinal ? (
          <RadarProfileChart inicial={resumen.promedioPerfilInicial} final={resumen.promedioPerfilFinal} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Todavía no hay diagnósticos completados por los estudiantes.
          </p>
        )}
      </div>
    </div>
  );
}
