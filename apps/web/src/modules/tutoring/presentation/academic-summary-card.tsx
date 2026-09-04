import { TrendingUp, ClipboardList, Scale, ClipboardCheck } from "lucide-react";
import { StatCard } from "@/modules/dashboard/presentation/stat-card";
import type { ResumenAcademicoEstudiante } from "../domain/tutoring.entity";

export function AcademicSummaryCard({ resumen }: { resumen: ResumenAcademicoEstudiante }) {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
          sub={`${resumen.evaluacionesRealizadas} realizadas`}
        />
        <StatCard
          icon={<Scale className="w-4 h-4" />}
          label="Casos prácticos"
          value={resumen.casosResueltos}
          sub={`${resumen.casosCorrectos} respuestas correctas`}
        />
        <StatCard
          icon={<ClipboardCheck className="w-4 h-4" />}
          label="Autoevaluación"
          value={resumen.perfilFinal !== null ? `${resumen.perfilFinal}%` : "—"}
          sub={
            resumen.perfilInicial !== null
              ? `Inicial: ${resumen.perfilInicial}%`
              : "Diagnóstico inicial pendiente"
          }
        />
      </div>
    </div>
  );
}
