import { ETIQUETAS_ESTADO_NORMA, type EstadoNorma } from "../domain/library.entity";

// Un color distinto por estado, consistente con el resto de badges de la
// plataforma (mismo patrón de "bg-x/10 text-x" usado en categorías y roles).
const ESTILO_ESTADO: Record<EstadoNorma, string> = {
  VIGENTE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  REFORMADA: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DEROGADA: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function EstadoNormaBadge({ estado }: { estado: EstadoNorma }) {
  return (
    <span
      className={`text-xs font-semibold rounded-full px-2.5 py-1 ${ESTILO_ESTADO[estado]}`}
    >
      {ETIQUETAS_ESTADO_NORMA[estado]}
    </span>
  );
}
