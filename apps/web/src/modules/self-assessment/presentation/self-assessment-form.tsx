"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ETIQUETAS_EJE, type PerfilCompetencias, type SelfAssessmentQuestion, type TipoDiagnostico } from "../domain/self-assessment.entity";
import { RadarProfileChart } from "./radar-profile-chart";

const OPCIONES_LIKERT = [
  { valor: 1, label: "Muy en desacuerdo" },
  { valor: 2, label: "En desacuerdo" },
  { valor: 3, label: "Neutral" },
  { valor: 4, label: "De acuerdo" },
  { valor: 5, label: "Muy de acuerdo" },
];

export function SelfAssessmentForm({
  preguntas,
  tipo,
}: {
  preguntas: SelfAssessmentQuestion[];
  tipo: TipoDiagnostico;
}) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [perfil, setPerfil] = useState<PerfilCompetencias | null>(null);

  const pregunta = preguntas[indice];
  const esUltima = indice === preguntas.length - 1;
  const respondida = respuestas[pregunta?.id] !== undefined;

  async function handleEnviar() {
    setEnviando(true);
    try {
      const res = await fetch(`/api/autoevaluacion/${tipo.toLowerCase()}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respuestas: Object.entries(respuestas).map(([questionId, valor]) => ({
            questionId,
            valor,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar la autoevaluación.");
      setPerfil(data.perfil);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al enviar la autoevaluación.");
    } finally {
      setEnviando(false);
    }
  }

  if (perfil) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-success/40 bg-success/10 p-5 text-center">
          <p className="font-medium text-success">
            Diagnóstico {tipo === "INICIAL" ? "inicial" : "final"} completado
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <RadarProfileChart {...(tipo === "INICIAL" ? { inicial: perfil } : { final: perfil })} />
        </div>
      </div>
    );
  }

  if (!pregunta) {
    return <p className="text-sm text-muted-foreground">No hay preguntas configuradas todavía.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar value={((indice + 1) / preguntas.length) * 100} />

      <div>
        <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
          {ETIQUETAS_EJE[pregunta.eje]}
        </span>
        <p className="text-lg font-medium text-foreground mt-3 mb-4">{pregunta.enunciado}</p>

        <div className="flex flex-col gap-2">
          {OPCIONES_LIKERT.map((op) => (
            <button
              key={op.valor}
              type="button"
              onClick={() => setRespuestas((r) => ({ ...r, [pregunta.id]: op.valor }))}
              className={`text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                respuestas[pregunta.id] === op.valor
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-foreground hover:bg-surface"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setIndice((i) => Math.max(0, i - 1))} disabled={indice === 0}>
          Anterior
        </Button>
        {esUltima ? (
          <Button onClick={handleEnviar} isLoading={enviando} disabled={!respondida}>
            Enviar diagnóstico
          </Button>
        ) : (
          <Button onClick={() => setIndice((i) => i + 1)} disabled={!respondida}>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
