import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

function formatoFecha(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });
}

/** Comparación Resultado inicial → Resultado final (Sección 4 del pedido). */
export function ResultsComparison({
  inicial,
  final,
  fechaInicial,
  fechaFinal,
}: {
  inicial: number | null;
  final: number | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
}) {
  const mejora = inicial !== null && final !== null ? final - inicial : null;
  const Icono = mejora === null || mejora === 0 ? Minus : mejora > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-foreground font-medium">Autoevaluación inicial</span>
          <span className="text-foreground font-semibold">{inicial !== null ? `${inicial}%` : "—"}</span>
        </div>
        <ProgressBar value={inicial ?? 0} />
        {fechaInicial && <p className="text-xs text-muted-foreground mt-1">{formatoFecha(fechaInicial)}</p>}
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-foreground font-medium">
            Autoevaluación final <span className="text-xs font-normal text-muted-foreground">(mayor nota)</span>
          </span>
          <span className="text-foreground font-semibold">{final !== null ? `${final}%` : "Pendiente"}</span>
        </div>
        <ProgressBar value={final ?? 0} />
        {fechaFinal && <p className="text-xs text-muted-foreground mt-1">{formatoFecha(fechaFinal)}</p>}
      </div>
      {mejora !== null && (
        <div className="flex items-center gap-2 rounded-xl bg-background-secondary px-4 py-3 text-sm">
          <Icono className={`w-4 h-4 ${mejora > 0 ? "text-success" : mejora < 0 ? "text-red-500" : "text-muted-foreground"}`} />
          <span className="text-foreground">
            {mejora > 0
              ? `Mejoraste ${mejora} puntos respecto a tu diagnóstico inicial.`
              : mejora < 0
                ? `Obtuviste ${Math.abs(mejora)} puntos menos que en tu diagnóstico inicial.`
                : "Obtuviste el mismo puntaje que en tu diagnóstico inicial."}
          </span>
        </div>
      )}
    </div>
  );
}
