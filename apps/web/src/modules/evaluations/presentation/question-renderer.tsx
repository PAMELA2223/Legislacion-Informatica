"use client";

import type {
  Question,
  OpcionesOpcionMultiple,
  OpcionesRelacionar,
} from "../domain/evaluation.entity";

interface QuestionRendererProps {
  pregunta: Question;
  valor: unknown;
  onChange: (valor: unknown) => void;
}

export function QuestionRenderer({ pregunta, valor, onChange }: QuestionRendererProps) {
  if (pregunta.tipo === "VF") {
    return (
      <div className="flex gap-3">
        {[
          { label: "Verdadero", val: true },
          { label: "Falso", val: false },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              valor === opt.val
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:bg-surface"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (pregunta.tipo === "OPCION_MULTIPLE" || pregunta.tipo === "CASO") {
    const opciones = pregunta.opciones as OpcionesOpcionMultiple | null;
    return (
      <div className="flex flex-col gap-2">
        {opciones?.alternativas.map((alt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
              valor === i
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-foreground hover:bg-surface"
            }`}
          >
            {alt}
          </button>
        ))}
      </div>
    );
  }

  if (pregunta.tipo === "RELACIONAR") {
    const opciones = pregunta.opciones as OpcionesRelacionar | null;
    const pares = Array.isArray(valor) ? (valor as number[]) : [];

    function actualizarPar(indiceIzquierda: number, indiceDerecha: number) {
      const nuevos = [...pares];
      nuevos[indiceIzquierda] = indiceDerecha;
      onChange(nuevos);
    }

    return (
      <div className="flex flex-col gap-3">
        {opciones?.columnaIzquierda.map((izq, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex-1 text-sm text-foreground">{izq}</span>
            <select
              value={pares[i] ?? ""}
              onChange={(e) => actualizarPar(i, Number(e.target.value))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="" disabled>
                Selecciona...
              </option>
              {opciones.columnaDerecha.map((der, j) => (
                <option key={j} value={j}>
                  {der}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  if (pregunta.tipo === "COMPLETAR") {
    return (
      <input
        type="text"
        value={typeof valor === "string" ? valor : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tu respuesta..."
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    );
  }

  return null;
}
