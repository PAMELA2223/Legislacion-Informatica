"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ETIQUETAS_CATEGORIA_CASO,
  ETIQUETAS_DIFICULTAD,
  type CategoriaCaso,
  type NivelDificultad,
} from "@/modules/case-studies/domain/case-study.entity";

const CATEGORIAS = Object.keys(ETIQUETAS_CATEGORIA_CASO) as CategoriaCaso[];
const NIVELES = Object.keys(ETIQUETAS_DIFICULTAD) as NivelDificultad[];

function CampoTexto({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        required
        className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

export function CaseStudyForm() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaCaso>(CATEGORIAS[0]);
  const [nivelDificultad, setNivelDificultad] = useState<NivelDificultad>(NIVELES[0]);
  const [escenario, setEscenario] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [normativaAplicable, setNormativaAplicable] = useState("");
  const [derechosVulnerados, setDerechosVulnerados] = useState("");
  const [sanciones, setSanciones] = useState("");
  const [actuacionCorrecta, setActuacionCorrecta] = useState("");
  const [retroalimentacionJuridica, setRetroalimentacionJuridica] = useState("");
  const [competenciaDesarrollada, setCompetenciaDesarrollada] = useState("");
  const [alternativas, setAlternativas] = useState(["", "", "", ""]);
  const [indiceCorrecto, setIndiceCorrecto] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/casos-practicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          categoria,
          nivelDificultad,
          escenario,
          descripcion,
          normativaAplicable,
          derechosVulnerados,
          sanciones,
          actuacionCorrecta,
          retroalimentacionJuridica,
          competenciaDesarrollada,
          opciones: { alternativas: alternativas.filter((a) => a.trim()) },
          indiceCorrecto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el caso práctico.");
      router.push("/admin/casos-practicos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el caso práctico.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaCaso)}
            className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {ETIQUETAS_CATEGORIA_CASO[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Nivel de dificultad</label>
          <select
            value={nivelDificultad}
            onChange={(e) => setNivelDificultad(e.target.value as NivelDificultad)}
            className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            {NIVELES.map((n) => (
              <option key={n} value={n}>
                {ETIQUETAS_DIFICULTAD[n]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CampoTexto label="Escenario" value={escenario} onChange={setEscenario} rows={4} />
      <CampoTexto label="Descripción" value={descripcion} onChange={setDescripcion} />
      <CampoTexto
        label="Normativa aplicable"
        value={normativaAplicable}
        onChange={setNormativaAplicable}
      />
      <CampoTexto
        label="Derechos vulnerados"
        value={derechosVulnerados}
        onChange={setDerechosVulnerados}
        rows={2}
      />
      <CampoTexto label="Sanciones" value={sanciones} onChange={setSanciones} rows={2} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Alternativas de decisión (marca la correcta)
        </label>
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
              onChange={(e) =>
                setAlternativas((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
              }
              placeholder={`Alternativa ${i + 1}`}
              required
              className="flex-1 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
        <p className="text-xs text-muted-foreground">
          El estudiante verá estas alternativas y deberá elegir la actuación
          correcta según la normativa.
        </p>
      </div>

      <CampoTexto
        label="Actuación correcta"
        value={actuacionCorrecta}
        onChange={setActuacionCorrecta}
      />
      <CampoTexto
        label="Retroalimentación jurídica"
        value={retroalimentacionJuridica}
        onChange={setRetroalimentacionJuridica}
      />
      <Input
        label="Competencia desarrollada"
        value={competenciaDesarrollada}
        onChange={(e) => setCompetenciaDesarrollada(e.target.value)}
        required
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        Crear caso práctico
      </Button>
    </form>
  );
}
