import Link from "next/link";
import { Scale } from "lucide-react";
import {
  ETIQUETAS_CATEGORIA_CASO,
  ETIQUETAS_DIFICULTAD,
  type CaseStudy,
} from "../domain/case-study.entity";

const COLOR_DIFICULTAD: Record<string, string> = {
  BASICO: "text-secondary bg-secondary/10",
  INTERMEDIO: "text-accent bg-accent/10",
  AVANZADO: "text-red-600 bg-red-50",
};

export function CaseCard({ caso }: { caso: CaseStudy }) {
  return (
    <Link
      href={`/casos-practicos/${caso.id}`}
      className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3 hover:-translate-y-0.5 duration-200 hover:shadow-card-md transition-transform"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
          <Scale className="w-3.5 h-3.5" />
          {ETIQUETAS_CATEGORIA_CASO[caso.categoria]}
        </span>
        <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${COLOR_DIFICULTAD[caso.nivelDificultad]}`}>
          {ETIQUETAS_DIFICULTAD[caso.nivelDificultad]}
        </span>
      </div>
      <h3 className="font-semibold text-foreground">{caso.titulo}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{caso.escenario}</p>
      <span className="text-xs text-muted-foreground mt-1">
        Competencia: {caso.competenciaDesarrollada}
      </span>
    </Link>
  );
}
