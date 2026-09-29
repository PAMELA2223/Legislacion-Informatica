import Link from "next/link";
import { Lock, CheckCircle2, ClipboardCheck } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

interface ModuleCardProps {
  slug: string;
  numero: number;
  titulo: string;
  descripcion: string;
  progreso: number;
  completado: boolean;
  desbloqueado: boolean;
  /** Estado de la evaluación del módulo (opcional para no romper usos anteriores). */
  evaluacion?: { requerida: boolean; aprobada: boolean; puntaje: number | null };
}

export function ModuleCard({
  slug,
  numero,
  titulo,
  descripcion,
  progreso,
  completado,
  desbloqueado,
  evaluacion,
}: ModuleCardProps) {
  const contenido = (
    <div
      className={`h-full rounded-2xl border border-border bg-surface backdrop-blur p-6 flex flex-col gap-3 transition-transform ${
        desbloqueado ? "hover:-translate-y-0.5 duration-200 hover:shadow-card-md" : "opacity-60"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
          Módulo {numero}
        </span>
        {completado ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : !desbloqueado ? (
          <Lock className="w-4 h-4 text-muted-foreground" />
        ) : null}
      </div>
      <h3 className="font-semibold text-foreground">{titulo}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{descripcion}</p>
      <ProgressBar value={progreso} />
      <span className="text-xs text-muted-foreground">{progreso}% del contenido revisado</span>
      {evaluacion?.requerida && (
        <span
          className={`flex items-center gap-1.5 text-xs font-medium ${
            evaluacion.aprobada ? "text-success" : "text-muted-foreground"
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          {evaluacion.aprobada
            ? `Evaluación aprobada (${evaluacion.puntaje}%)`
            : evaluacion.puntaje !== null
              ? `Evaluación pendiente de aprobar (mejor: ${evaluacion.puntaje}%)`
              : "Evaluación pendiente"}
        </span>
      )}
    </div>
  );

  if (!desbloqueado) {
    return <div className="cursor-not-allowed h-full">{contenido}</div>;
  }

  return <Link href={`/modulos/${slug}`} className="h-full">{contenido}</Link>;
}
