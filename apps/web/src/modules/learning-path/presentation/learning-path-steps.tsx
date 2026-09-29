import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import type { EstadoAprendizaje } from "../domain/learning-path.entity";

type EstadoPaso = "hecho" | "actual" | "bloqueado";

/** Indicador visual del itinerario: Inicial → Módulos → Final → Fin. */
export function LearningPathSteps({ estado }: { estado: EstadoAprendizaje }) {
  const e = estado.etapa;
  const pasos: { label: string; detalle: string; href: string; estado: EstadoPaso }[] = [
    {
      label: "Autoevaluación inicial",
      detalle: estado.inicial.completada
        ? `${estado.inicial.puntaje}%`
        : estado.inicial.configurada
          ? "Pendiente"
          : "No configurada",
      href: "/autoevaluacion/inicial",
      estado: e === "AUTOEVALUACION_INICIAL" ? "actual" : "hecho",
    },
    {
      label: "Módulos y evaluaciones",
      detalle: `${estado.modulosCompletados}/${estado.totalModulos} completados`,
      href: "/modulos",
      estado: e === "AUTOEVALUACION_INICIAL" ? "bloqueado" : e === "MODULOS" ? "actual" : "hecho",
    },
    {
      label: "Autoevaluación final",
      detalle: estado.final.completada
        ? `${estado.final.puntaje}%`
        : estado.final.habilitada
          ? "Disponible"
          : estado.todosLosModulosCompletados && !estado.final.configurada
            ? "En preparación"
            : "Bloqueada",
      href: "/autoevaluacion/final",
      estado: e === "AUTOEVALUACION_FINAL" ? "actual" : e === "FINALIZADO" ? "hecho" : "bloqueado",
    },
  ];

  return (
    <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Tu itinerario de aprendizaje">
      {pasos.map((p, i) => {
        const Icono = p.estado === "hecho" ? CheckCircle2 : p.estado === "actual" ? Circle : Lock;
        const contenido = (
          <div
            className={`h-full rounded-2xl border p-4 flex items-start gap-3 transition-colors ${
              p.estado === "actual"
                ? "border-primary bg-primary/5"
                : p.estado === "hecho"
                  ? "border-success/40 bg-success/5"
                  : "border-border bg-surface opacity-70"
            }`}
          >
            <Icono
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                p.estado === "hecho" ? "text-success" : p.estado === "actual" ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Paso {i + 1}</p>
              <p className="text-sm font-medium text-foreground">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.detalle}</p>
            </div>
          </div>
        );
        return (
          <li key={p.label}>
            {p.estado === "bloqueado" ? contenido : <Link href={p.href} className="block h-full">{contenido}</Link>}
          </li>
        );
      })}
    </ol>
  );
}
