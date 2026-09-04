"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CaseStudy } from "../domain/case-study.entity";

interface ResultadoCaso {
  correcta: boolean;
  normativaAplicable: string;
  derechosVulnerados: string;
  sanciones: string;
  actuacionCorrecta: string;
  retroalimentacionJuridica: string;
}

export function CaseRunner({ caso }: { caso: CaseStudy }) {
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCaso | null>(null);

  async function handleResolver() {
    if (seleccion === null) return;
    setEnviando(true);
    try {
      const res = await fetch(`/api/casos-practicos/${caso.id}/resolver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indiceSeleccionado: seleccion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al resolver el caso.");
      setResultado(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al resolver el caso.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className={`rounded-2xl border p-5 flex items-center gap-3 ${
            resultado.correcta ? "border-success/40 bg-success/10" : "border-red-300 bg-red-50"
          }`}
        >
          {resultado.correcta ? (
            <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
          )}
          <p className="text-sm font-medium text-foreground">
            {resultado.correcta
              ? "Elegiste la actuación jurídicamente correcta."
              : "Esta no es la actuación jurídicamente correcta. Revisa el análisis:"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Normativa aplicable</h3>
            <p className="text-sm text-muted-foreground">{resultado.normativaAplicable}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Derechos vulnerados</h3>
            <p className="text-sm text-muted-foreground">{resultado.derechosVulnerados}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Sanciones previstas</h3>
            <p className="text-sm text-muted-foreground">{resultado.sanciones}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Actuación correcta</h3>
            <p className="text-sm text-muted-foreground">{resultado.actuacionCorrecta}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Retroalimentación jurídica</h3>
            <p className="text-sm text-muted-foreground">{resultado.retroalimentacionJuridica}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-foreground mb-2">Escenario</h2>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{caso.escenario}</p>
        <h2 className="font-semibold text-foreground mt-4 mb-2">Descripción</h2>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{caso.descripcion}</p>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-3">
          ¿Cuál es la actuación jurídicamente correcta ante esta situación?
        </h3>
        <div className="flex flex-col gap-2">
          {caso.opciones.alternativas.map((alt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSeleccion(i)}
              className={`text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                seleccion === i
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-foreground hover:bg-surface"
              }`}
            >
              {alt}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleResolver} isLoading={enviando} disabled={seleccion === null}>
        Confirmar decisión
      </Button>
    </div>
  );
}
