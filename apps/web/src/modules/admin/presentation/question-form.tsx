"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminQuestionRow } from "../domain/admin.entity";

const TIPOS = [
  { value: "OPCION_MULTIPLE", label: "Opción múltiple" },
  { value: "VF", label: "Verdadero / Falso" },
  { value: "RELACIONAR", label: "Relacionar columnas" },
  { value: "COMPLETAR", label: "Completar" },
  { value: "CASO", label: "Caso (opción múltiple con escenario)" },
] as const;

type Tipo = (typeof TIPOS)[number]["value"];

const MIN_OPCIONES = 2;
const MAX_OPCIONES = 8;
const CLASE_CAMPO =
  "rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary";
const CLASE_CAMPO_CHICO =
  "flex-1 min-w-0 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

/** Baraja índices (Fisher–Yates) para que la columna derecha no quede en el
 * mismo orden que la izquierda (si no, la respuesta sería evidente). */
function permutacionAleatoria(n: number): number[] {
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

/** Valores iniciales del formulario a partir de una pregunta existente. */
function estadoInicial(p?: AdminQuestionRow) {
  const opciones = (p?.opciones ?? {}) as { alternativas?: string[]; columnaIzquierda?: string[]; columnaDerecha?: string[] };
  const rc = (p?.respuestaCorrecta ?? {}) as { esVerdadero?: boolean; indiceCorrecto?: number; pares?: number[]; aceptadas?: string[] };

  // RELACIONAR: se reconstruyen las filas ya emparejadas (concepto ↔ definición correcta).
  const izq = opciones.columnaIzquierda ?? ["", "", ""];
  const der = opciones.columnaDerecha ?? ["", "", ""];
  const filas =
    p?.tipo === "RELACIONAR" && rc.pares
      ? izq.map((c, i) => ({ concepto: c, definicion: der[rc.pares![i]] ?? "" }))
      : [0, 1, 2].map(() => ({ concepto: "", definicion: "" }));

  return {
    tipo: (p?.tipo ?? "OPCION_MULTIPLE") as Tipo,
    enunciado: p?.enunciado ?? "",
    retroalimentacion: p?.retroalimentacion ?? "",
    puntaje: p?.puntaje ?? 1,
    esVerdadero: rc.esVerdadero ?? true,
    alternativas: opciones.alternativas?.length ? opciones.alternativas : ["", "", "", ""],
    indiceCorrecto: rc.indiceCorrecto ?? 0,
    filas,
    aceptadas: (rc.aceptadas ?? []).join(", "),
  };
}

export function QuestionForm({
  evaluationId,
  pregunta,
  onGuardado,
  onCancelar,
}: {
  evaluationId: string;
  /** Si se pasa, el formulario edita esa pregunta en lugar de crear una nueva. */
  pregunta?: AdminQuestionRow;
  onGuardado?: () => void;
  onCancelar?: () => void;
}) {
  const router = useRouter();
  const inicial = estadoInicial(pregunta);
  const [tipo, setTipo] = useState<Tipo>(inicial.tipo);
  const [enunciado, setEnunciado] = useState(inicial.enunciado);
  const [retroalimentacion, setRetroalimentacion] = useState(inicial.retroalimentacion);
  const [puntaje, setPuntaje] = useState(inicial.puntaje);
  const [esVerdadero, setEsVerdadero] = useState(inicial.esVerdadero);
  const [alternativas, setAlternativas] = useState<string[]>(inicial.alternativas);
  const [indiceCorrecto, setIndiceCorrecto] = useState(inicial.indiceCorrecto);
  const [filas, setFilas] = useState(inicial.filas);
  const [aceptadas, setAceptadas] = useState(inicial.aceptadas);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idBase = pregunta?.id ?? "nueva";

  function quitarAlternativa(i: number) {
    setAlternativas((prev) => prev.filter((_, idx) => idx !== i));
    // Mantener marcada la misma alternativa correcta tras eliminar otra.
    setIndiceCorrecto((c) => (i === c ? 0 : i < c ? c - 1 : c));
  }

  function limpiar() {
    const vacio = estadoInicial();
    setEnunciado(vacio.enunciado);
    setRetroalimentacion(vacio.retroalimentacion);
    setPuntaje(vacio.puntaje);
    setAlternativas(vacio.alternativas);
    setIndiceCorrecto(0);
    setFilas(vacio.filas);
    setAceptadas("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let opciones: unknown = null;
    let respuestaCorrecta: unknown;

    if (tipo === "VF") {
      respuestaCorrecta = { esVerdadero };
    } else if (tipo === "OPCION_MULTIPLE" || tipo === "CASO") {
      opciones = { alternativas };
      respuestaCorrecta = { indiceCorrecto };
    } else if (tipo === "RELACIONAR") {
      // La columna derecha se guarda barajada; pares[i] indica dónde quedó
      // la definición correcta del concepto i.
      const perm = permutacionAleatoria(filas.length); // perm[k] = fila original en la posición k
      const columnaDerecha = perm.map((fila) => filas[fila].definicion);
      const pares = filas.map((_, i) => perm.indexOf(i));
      opciones = { columnaIzquierda: filas.map((f) => f.concepto), columnaDerecha };
      respuestaCorrecta = { pares };
    } else {
      respuestaCorrecta = { aceptadas: aceptadas.split(",").map((a) => a.trim()).filter(Boolean) };
    }

    setEnviando(true);
    try {
      const res = await fetch(pregunta ? `/api/admin/preguntas/${pregunta.id}` : `/api/admin/evaluaciones/${evaluationId}/preguntas`, {
        method: pregunta ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, enunciado, retroalimentacion, puntaje: Number(puntaje), opciones, respuestaCorrecta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la pregunta.");
      if (!pregunta) limpiar();
      onGuardado?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la pregunta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idBase}-tipo`} className="text-sm font-medium text-foreground">Tipo de pregunta</label>
        <select id={`${idBase}-tipo`} value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)} className={CLASE_CAMPO}>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idBase}-enunciado`} className="text-sm font-medium text-foreground">Enunciado</label>
        <textarea
          id={`${idBase}-enunciado`}
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          rows={tipo === "CASO" ? 4 : 2}
          required
          className={CLASE_CAMPO}
        />
      </div>

      {tipo === "VF" && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-foreground mb-1.5">Respuesta correcta</legend>
          <div className="flex gap-3">
            {[true, false].map((v) => (
              <button
                type="button"
                key={String(v)}
                onClick={() => setEsVerdadero(v)}
                aria-pressed={esVerdadero === v}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium ${
                  esVerdadero === v ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"
                }`}
              >
                {v ? "Verdadero" : "Falso"}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {(tipo === "OPCION_MULTIPLE" || tipo === "CASO") && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground mb-1">Opciones de respuesta (marca la correcta)</legend>
          {alternativas.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="radio"
                name={`${idBase}-correcta`}
                checked={indiceCorrecto === i}
                onChange={() => setIndiceCorrecto(i)}
                aria-label={`Marcar opción ${i + 1} como correcta`}
                className="accent-primary"
              />
              <input
                value={a}
                onChange={(e) => setAlternativas((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
                placeholder={`Opción ${i + 1}`}
                aria-label={`Opción ${i + 1}`}
                required
                className={CLASE_CAMPO_CHICO}
              />
              {alternativas.length > MIN_OPCIONES && (
                <button type="button" onClick={() => quitarAlternativa(i)} aria-label={`Eliminar opción ${i + 1}`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {alternativas.length < MAX_OPCIONES && (
            <button type="button" onClick={() => setAlternativas((p) => [...p, ""])} className="self-start inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus className="w-4 h-4" /> Agregar opción
            </button>
          )}
        </fieldset>
      )}

      {tipo === "RELACIONAR" && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground mb-1">Pares correctos (concepto ↔ definición)</legend>
          {filas.map((f, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={f.concepto}
                onChange={(e) => setFilas((prev) => prev.map((x, idx) => (idx === i ? { ...x, concepto: e.target.value } : x)))}
                placeholder={`Concepto ${i + 1}`}
                aria-label={`Concepto ${i + 1}`}
                required
                className={CLASE_CAMPO_CHICO}
              />
              <input
                value={f.definicion}
                onChange={(e) => setFilas((prev) => prev.map((x, idx) => (idx === i ? { ...x, definicion: e.target.value } : x)))}
                placeholder={`Definición de ${f.concepto || `concepto ${i + 1}`}`}
                aria-label={`Definición ${i + 1}`}
                required
                className={CLASE_CAMPO_CHICO}
              />
              {filas.length > 2 && (
                <button type="button" onClick={() => setFilas((p) => p.filter((_, idx) => idx !== i))} aria-label={`Eliminar par ${i + 1}`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {filas.length < MAX_OPCIONES && (
            <button type="button" onClick={() => setFilas((p) => [...p, { concepto: "", definicion: "" }])} className="self-start inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus className="w-4 h-4" /> Agregar par
            </button>
          )}
          <p className="text-xs text-muted-foreground">
            Escribe cada concepto junto a su definición correcta; al guardar, las definiciones se mezclan
            automáticamente para el estudiante.
          </p>
        </fieldset>
      )}

      {tipo === "COMPLETAR" && (
        <Input
          id={`${idBase}-aceptadas`}
          label="Respuestas aceptadas (separadas por coma)"
          value={aceptadas}
          onChange={(e) => setAceptadas(e.target.value)}
          placeholder="informatico, informático"
          required
        />
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idBase}-retro`} className="text-sm font-medium text-foreground">Retroalimentación</label>
        <textarea
          id={`${idBase}-retro`}
          value={retroalimentacion}
          onChange={(e) => setRetroalimentacion(e.target.value)}
          rows={2}
          required
          className={CLASE_CAMPO}
        />
      </div>

      <Input
        id={`${idBase}-puntaje`}
        label="Puntaje"
        type="number"
        min={1}
        value={puntaje}
        onChange={(e) => setPuntaje(Number(e.target.value))}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" isLoading={enviando}>
          {pregunta ? "Guardar cambios" : "Agregar pregunta"}
        </Button>
        {onCancelar && (
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
