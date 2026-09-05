"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TIPOS = [
  { value: "VF", label: "Verdadero / Falso" },
  { value: "OPCION_MULTIPLE", label: "Opción múltiple" },
  { value: "RELACIONAR", label: "Relacionar columnas" },
  { value: "COMPLETAR", label: "Completar" },
  { value: "CASO", label: "Caso (opción múltiple con escenario)" },
] as const;

type Tipo = (typeof TIPOS)[number]["value"];

export function QuestionForm({ evaluationId }: { evaluationId: string }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("VF");
  const [enunciado, setEnunciado] = useState("");
  const [retroalimentacion, setRetroalimentacion] = useState("");
  const [puntaje, setPuntaje] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // VF
  const [esVerdadero, setEsVerdadero] = useState(true);
  // OPCION_MULTIPLE / CASO
  const [alternativas, setAlternativas] = useState(["", "", "", ""]);
  const [indiceCorrecto, setIndiceCorrecto] = useState(0);
  // RELACIONAR
  const [columnaIzquierda, setColumnaIzquierda] = useState(["", "", ""]);
  const [columnaDerecha, setColumnaDerecha] = useState(["", "", ""]);
  const [pares, setPares] = useState([0, 1, 2]);
  // COMPLETAR
  const [aceptadas, setAceptadas] = useState("");

  function limpiarCampos() {
    setEnunciado("");
    setRetroalimentacion("");
    setPuntaje(1);
    setAlternativas(["", "", "", ""]);
    setIndiceCorrecto(0);
    setColumnaIzquierda(["", "", ""]);
    setColumnaDerecha(["", "", ""]);
    setPares([0, 1, 2]);
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
      opciones = { alternativas: alternativas.filter((a) => a.trim()) };
      respuestaCorrecta = { indiceCorrecto };
    } else if (tipo === "RELACIONAR") {
      opciones = {
        columnaIzquierda: columnaIzquierda.filter((c) => c.trim()),
        columnaDerecha: columnaDerecha.filter((c) => c.trim()),
      };
      respuestaCorrecta = { pares };
    } else {
      respuestaCorrecta = { aceptadas: aceptadas.split(",").map((a) => a.trim()).filter(Boolean) };
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/admin/evaluaciones/${evaluationId}/preguntas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, enunciado, retroalimentacion, puntaje: Number(puntaje), opciones, respuestaCorrecta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la pregunta.");
      limpiarCampos();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la pregunta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Tipo de pregunta</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as Tipo)}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Enunciado</label>
        <textarea
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          rows={2}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {tipo === "VF" && (
        <div className="flex gap-3">
          {[true, false].map((v) => (
            <button
              type="button"
              key={String(v)}
              onClick={() => setEsVerdadero(v)}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium ${
                esVerdadero === v ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"
              }`}
            >
              {v ? "Verdadero" : "Falso"}
            </button>
          ))}
        </div>
      )}

      {(tipo === "OPCION_MULTIPLE" || tipo === "CASO") && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Alternativas (marca la correcta)</label>
          {alternativas.map((a, i) => (
            <label key={i} className="flex items-center gap-3">
              <input
                type="radio"
                name="indiceCorrecto"
                checked={indiceCorrecto === i}
                onChange={() => setIndiceCorrecto(i)}
                className="accent-primary"
              />
              <input
                value={a}
                onChange={(e) => setAlternativas((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
                placeholder={`Alternativa ${i + 1}`}
                required
                className="flex-1 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          ))}
        </div>
      )}

      {tipo === "RELACIONAR" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Columna izquierda / columna derecha correspondiente
          </label>
          {columnaIzquierda.map((izq, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={izq}
                onChange={(e) => setColumnaIzquierda((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
                placeholder={`Concepto ${i + 1}`}
                required
                className="flex-1 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                value={columnaDerecha[i]}
                onChange={(e) =>
                  setColumnaDerecha((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                }
                placeholder={`Definición ${i + 1} (en su posición correcta)`}
                required
                className="flex-1 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Cada fila debe quedar ya emparejada correctamente (Concepto 1 con su Definición 1, etc.).
          </p>
        </div>
      )}

      {tipo === "COMPLETAR" && (
        <Input
          label="Respuestas aceptadas (separadas por coma)"
          value={aceptadas}
          onChange={(e) => setAceptadas(e.target.value)}
          placeholder="informatico, informático"
          required
        />
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Retroalimentación</label>
        <textarea
          value={retroalimentacion}
          onChange={(e) => setRetroalimentacion(e.target.value)}
          rows={2}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      <Input
        label="Puntaje"
        type="number"
        min={1}
        value={puntaje}
        onChange={(e) => setPuntaje(Number(e.target.value))}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        Agregar pregunta
      </Button>
    </form>
  );
}
