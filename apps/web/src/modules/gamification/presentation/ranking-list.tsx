import { Trophy } from "lucide-react";
import type { EntradaRanking } from "../domain/gamification.entity";

const MEDALLAS = ["🥇", "🥈", "🥉"];

export function RankingList({ ranking }: { ranking: EntradaRanking[] }) {
  if (ranking.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay estudiantes en el ranking.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {ranking.map((entrada) => (
        <div
          key={entrada.posicion}
          className={`flex items-center justify-between rounded-xl px-4 py-3 ${
            entrada.esUsuarioActual
              ? "bg-primary/10 border border-primary/30"
              : "border border-border bg-surface"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 text-center font-semibold text-foreground">
              {MEDALLAS[entrada.posicion - 1] ?? `#${entrada.posicion}`}
            </span>
            <span className="text-sm font-medium text-foreground">
              {entrada.nombre}
              {entrada.esUsuarioActual && (
                <span className="text-xs text-primary ml-2">(tú)</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Nivel {entrada.nivel}</span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Trophy className="w-3.5 h-3.5 text-accent" />
              {entrada.xp} XP
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
