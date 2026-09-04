import * as Icons from "lucide-react";
import { Lock } from "lucide-react";
import type { BadgeConEstado } from "../domain/gamification.entity";

export function BadgeCard({ insignia }: { insignia: BadgeConEstado }) {
  const IconComponent = (Icons as unknown as Record<string, Icons.LucideIcon>)[insignia.icono] ?? Icons.Award;

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col items-center text-center gap-2 ${
        insignia.obtenida ? "border-accent/40 bg-accent/10" : "border-border bg-surface opacity-60"
      }`}
    >
      <div
        className={`rounded-full p-3 ${insignia.obtenida ? "bg-accent/20" : "bg-background-secondary"}`}
      >
        {insignia.obtenida ? (
          <IconComponent className="w-6 h-6 text-accent" />
        ) : (
          <Lock className="w-6 h-6 text-disabled-foreground" />
        )}
      </div>
      <p className="font-medium text-foreground text-sm">{insignia.nombre}</p>
      <p className="text-xs text-muted-foreground">{insignia.descripcion}</p>
      {!insignia.obtenida && (
        <p className="text-xs text-disabled-foreground italic">{insignia.criterio}</p>
      )}
    </div>
  );
}
