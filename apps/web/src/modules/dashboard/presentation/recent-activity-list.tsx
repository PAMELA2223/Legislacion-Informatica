import { GraduationCap, ClipboardList, Scale } from "lucide-react";
import type { ActividadReciente } from "../domain/dashboard.entity";

const ICONOS = {
  LECCION: GraduationCap,
  EVALUACION: ClipboardList,
  CASO: Scale,
};

const ETIQUETAS = {
  LECCION: "Lección completada",
  EVALUACION: "Evaluación resuelta",
  CASO: "Caso práctico resuelto",
};

export function RecentActivityList({ actividad }: { actividad: ActividadReciente[] }) {
  if (actividad.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay actividad registrada. ¡Empieza con un módulo!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {actividad.map((item, i) => {
        const Icon = ICONOS[item.tipo];
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{ETIQUETAS[item.tipo]}</p>
              <p className="text-sm font-medium text-foreground">{item.titulo}</p>
              {item.detalle && <p className="text-xs text-muted-foreground">{item.detalle}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
