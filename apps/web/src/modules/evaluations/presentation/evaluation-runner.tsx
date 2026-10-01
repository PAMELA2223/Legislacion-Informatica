"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuestionRenderer } from "./question-renderer";
import type { Evaluation } from "../domain/evaluation.entity";

interface ResultadoPregunta {
  questionId: string;
  correcta: boolean;
  puntajeObtenido: number;
  puntajeMaximo: number;
  retroalimentacion: string;
}

interface ResultadoEvaluacion {
  puntaje: number;
  aprobado: boolean;
  resultadosPorPregunta: ResultadoPregunta[];
  /** Solo en la autoevaluación final (hasta 3 intentos, cuenta la mayor nota). */
  intentosRealizados?: number;
  intentosRestantes?: number;
  mejorPuntaje?: number;
}

interface EnlaceAccion {
  href: string;
  label: string;
}

export function EvaluationRunner({
  evaluacion,
  modo = "modulo",
  mostrarRetroalimentacion = true,
  enlaceTrasEnviar,
}: {
  evaluacion: Evaluation;
  /** "autoevaluacion" muestra un resultado neutral (diagnóstico), sin "aprobado/reprobado". */
  modo?: "modulo" | "autoevaluacion";
  mostrarRetroalimentacion?: boolean;
  /** Enlace que se muestra después de enviar (ej. "Volver al módulo", "Ir a los módulos"). */
  enlaceTrasEnviar?: EnlaceAccion;
}) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, unknown>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEvaluacion | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(
    evaluacion.tiempoLimite > 0 ? evaluacion.tiempoLimite * 60 : null
  );

  const pregunta = evaluacion.preguntas[indice];
  const esUltima = indice === evaluacion.preguntas.length - 1;

  useEffect(() => {
    if (segundosRestantes === null || resultado) return;
    if (segundosRestantes <= 0) {
      handleEnviar(true);
      return;
    }
    const t = setTimeout(() => setSegundosRestantes((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundosRestantes, resultado]);

  async function handleEnviar(porTiempo = false) {
    const sinResponder = evaluacion.preguntas.filter((p) => respuestas[p.id] === undefined || respuestas[p.id] === "").length;
    if (!porTiempo && sinResponder > 0) {
      const ok = confirm(
        `Tienes ${sinResponder} pregunta(s) sin responder; se calificarán como incorrectas. ¿Enviar de todos modos?`
      );
      if (!ok) return;
    }
    setEnviando(true);
    try {
      const payload = {
        respuestas: evaluacion.preguntas.map((p) => ({
          questionId: p.id,
          valor: respuestas[p.id],
        })),
      };
      const res = await fetch(`/api/evaluaciones/${evaluacion.id}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.redirigirA) {
          alert(data.error);
          router.push(data.redirigirA);
          return;
        }
        throw new Error(data.error || "Error al enviar la evaluación.");
      }
      // No se llama a router.refresh() aquí: volvería a montar este componente
      // y el estudiante perdería su resultado en pantalla. Los datos nuevos
      // (progreso, intentos, módulos desbloqueados) se cargan al continuar.
      setResultado(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al enviar la evaluación.");
    } finally {
      setEnviando(false);
    }
  }

  function reintentar() {
    setResultado(null);
    setRespuestas({});
    setIndice(0);
    setSegundosRestantes(evaluacion.tiempoLimite > 0 ? evaluacion.tiempoLimite * 60 : null);
  }

  if (resultado) {
    const esAutoevaluacion = modo === "autoevaluacion";
    return (
      <div className="flex flex-col gap-4">
        {esAutoevaluacion ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <ClipboardCheck className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{resultado.puntaje}%</p>
            <p className="text-sm font-medium text-foreground">Autoevaluación registrada</p>
            {resultado.intentosRealizados !== undefined ? (
              <div className="text-xs text-muted-foreground mt-2 flex flex-col gap-0.5">
                <span>
                  Intento {resultado.intentosRealizados} de {resultado.intentosRealizados + (resultado.intentosRestantes ?? 0)}
                </span>
                <span className="text-foreground">
                  Tu mejor nota: <strong>{resultado.mejorPuntaje}%</strong> (es la que se toma en cuenta)
                </span>
                <span>
                  {resultado.intentosRestantes
                    ? resultado.intentosRestantes === 1
                      ? "Te queda 1 intento para mejorarla."
                      : `Te quedan ${resultado.intentosRestantes} intentos para mejorarla.`
                    : "Ya usaste todos tus intentos: abajo puedes revisar cada pregunta."}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Este resultado es diagnóstico: sirve para comparar tu punto de partida con lo aprendido.
              </p>
            )}
          </div>
        ) : (
          <div
            className={`rounded-2xl border p-6 text-center ${
              resultado.aprobado
                ? "border-success/40 bg-success/10"
                : "border-red-300 bg-red-50"
            }`}
          >
            <p className="text-3xl font-bold text-foreground">{resultado.puntaje}%</p>
            <p className={`text-sm font-medium ${resultado.aprobado ? "text-success" : "text-red-600"}`}>
              {resultado.aprobado ? "¡Evaluación aprobada!" : "No alcanzaste el puntaje mínimo (70%)"}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {enlaceTrasEnviar && (
            // Navegación completa (no <Link>): garantiza que la siguiente
            // pantalla muestre los datos recién guardados y no una copia en caché.
            <a href={enlaceTrasEnviar.href}>
              <Button>{enlaceTrasEnviar.label}</Button>
            </a>
          )}
          {!esAutoevaluacion && !resultado.aprobado && (
            <Button variant="outline" onClick={reintentar}>
              Intentar de nuevo
            </Button>
          )}
        </div>

        {mostrarRetroalimentacion && resultado.resultadosPorPregunta.length > 0 && (
          <>
            <h3 className="font-semibold text-foreground mt-2">Retroalimentación por pregunta</h3>
            {evaluacion.preguntas.map((p) => {
              const r = resultado.resultadosPorPregunta.find((x) => x.questionId === p.id);
              return (
                <div key={p.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start gap-2">
                    {r?.correcta ? (
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.enunciado}</p>
                      <p className="text-sm text-muted-foreground mt-1">{r?.retroalimentacion}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  }

  if (evaluacion.preguntas.length === 0) {
    return <p className="text-sm text-muted-foreground">Esta evaluación todavía no tiene preguntas disponibles.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <ProgressBar value={((indice + 1) / evaluacion.preguntas.length) * 100} />
        {segundosRestantes !== null && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground ml-4 whitespace-nowrap">
            <Clock className="w-4 h-4" />
            {Math.floor(segundosRestantes / 60)}:{String(segundosRestantes % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      <div>
        <span className="text-xs text-muted-foreground">
          Pregunta {indice + 1} de {evaluacion.preguntas.length}
        </span>
        <p className="text-lg font-medium text-foreground mt-1 mb-4">{pregunta.enunciado}</p>
        <QuestionRenderer
          pregunta={pregunta}
          valor={respuestas[pregunta.id]}
          onChange={(valor) => setRespuestas((r) => ({ ...r, [pregunta.id]: valor }))}
        />
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
        >
          Anterior
        </Button>
        {esUltima ? (
          <Button onClick={() => handleEnviar()} isLoading={enviando}>
            {modo === "autoevaluacion" ? "Enviar autoevaluación" : "Enviar evaluación"}
          </Button>
        ) : (
          <Button onClick={() => setIndice((i) => i + 1)}>Siguiente</Button>
        )}
      </div>
    </div>
  );
}
