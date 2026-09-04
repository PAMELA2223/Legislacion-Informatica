import { CheckCircle2, Target } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Reto } from "../domain/gamification.entity";

export function ChallengeCard({ reto }: { reto: Reto }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {reto.completado ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <Target className="w-5 h-5 text-primary" />
          )}
          <span className="font-medium text-foreground text-sm">{reto.titulo}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {reto.progresoActual}/{reto.meta}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{reto.descripcion}</p>
      <ProgressBar value={(reto.progresoActual / reto.meta) * 100} />
    </div>
  );
}
