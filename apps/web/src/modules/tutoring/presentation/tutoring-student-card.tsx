import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { ResumenAcademicoEstudiante } from "../domain/tutoring.entity";

export function TutoringStudentCard({
  estudianteId,
  nombre,
  email,
  resumen,
}: {
  estudianteId: string;
  nombre: string;
  email: string;
  resumen: ResumenAcademicoEstudiante;
}) {
  return (
    <Link
      href={`/docente/estudiantes/${estudianteId}`}
      className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3 hover:border-primary transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-foreground">{nombre}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <GraduationCap className="w-3.5 h-3.5" />
            Progreso general
          </span>
          <span className="text-xs font-medium text-foreground">{resumen.progresoGeneral}%</span>
        </div>
        <ProgressBar value={resumen.progresoGeneral} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{resumen.modulosCompletados}/{resumen.totalModulos} módulos</span>
        <span>Promedio: {resumen.promedioCalificaciones}%</span>
      </div>
    </Link>
  );
}
