"use client";

import { useState } from "react";
import { Pencil, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { QuestionForm } from "./question-form";
import { DeleteButton } from "./delete-button";
import { ActionButton } from "./action-button";
import type { AdminQuestionRow } from "../domain/admin.entity";

const ETIQUETAS_TIPO: Record<string, string> = {
  VF: "Verdadero/Falso",
  OPCION_MULTIPLE: "Opción múltiple",
  RELACIONAR: "Relacionar",
  COMPLETAR: "Completar",
  CASO: "Caso",
};

/** Texto legible de la respuesta correcta, para que el administrador la revise de un vistazo. */
function resumenRespuesta(p: AdminQuestionRow): string {
  const rc = (p.respuestaCorrecta ?? {}) as { esVerdadero?: boolean; indiceCorrecto?: number; pares?: number[]; aceptadas?: string[] };
  const op = (p.opciones ?? {}) as { alternativas?: string[]; columnaIzquierda?: string[]; columnaDerecha?: string[] };
  switch (p.tipo) {
    case "VF":
      return rc.esVerdadero ? "Verdadero" : "Falso";
    case "OPCION_MULTIPLE":
    case "CASO":
      return op.alternativas?.[rc.indiceCorrecto ?? -1] ?? "—";
    case "RELACIONAR":
      return (op.columnaIzquierda ?? []).map((c, i) => `${c} → ${op.columnaDerecha?.[rc.pares?.[i] ?? -1] ?? "?"}`).join(" · ");
    case "COMPLETAR":
      return (rc.aceptadas ?? []).join(", ");
    default:
      return "—";
  }
}

export function QuestionList({ evaluationId, preguntas }: { evaluationId: string; preguntas: AdminQuestionRow[] }) {
  const [editando, setEditando] = useState<string | null>(null);

  if (preguntas.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay preguntas. Agrega la primera abajo.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {preguntas.map((p, i) =>
        editando === p.id ? (
          <QuestionForm
            key={p.id}
            evaluationId={evaluationId}
            pregunta={p}
            onGuardado={() => setEditando(null)}
            onCancelar={() => setEditando(null)}
          />
        ) : (
          <div
            key={p.id}
            className={`rounded-xl border border-border bg-surface p-4 flex items-start justify-between gap-4 ${p.activo ? "" : "opacity-60"}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs text-muted-foreground">#{i + 1}</span>
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
                  {ETIQUETAS_TIPO[p.tipo] ?? p.tipo}
                </span>
                <span className="text-xs text-muted-foreground">{p.puntaje} pt</span>
                {!p.activo && (
                  <span className="text-xs text-muted-foreground bg-foreground/5 rounded-full px-2 py-0.5">Inactiva</span>
                )}
              </div>
              <p className="text-sm text-foreground">{p.enunciado}</p>
              <p className="flex items-start gap-1 text-xs text-success mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-px" /> {resumenRespuesta(p)}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <ActionButton
                url={`/api/admin/preguntas/${p.id}`}
                method="PATCH"
                body={{ activo: !p.activo }}
                ariaLabel={p.activo ? "Desactivar pregunta" : "Activar pregunta"}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                {p.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </ActionButton>
              <button
                type="button"
                onClick={() => setEditando(p.id)}
                aria-label="Editar pregunta"
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <DeleteButton
                url={`/api/admin/preguntas/${p.id}`}
                confirmMessage="¿Eliminar esta pregunta? Si ya hubo intentos, considera desactivarla en su lugar."
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}
