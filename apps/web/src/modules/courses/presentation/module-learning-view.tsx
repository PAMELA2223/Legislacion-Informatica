"use client";

// Vista de estudio de un módulo. Reemplaza a las antiguas pestañas
// horizontales (lesson-tabs.tsx), que ocultaban la mayoría de contenidos
// detrás de una barra de desplazamiento. Ahora:
//   - "Contenido del módulo": lista VERTICAL con todos los pasos visibles,
//     su estado (✓ completado · ● en progreso · ○ pendiente) y la evaluación
//     como último paso.
//   - Visor del contenido actual con "Contenido X de N" y botones grandes
//     [← Anterior] [acción principal →].
//   - Siempre hay UNA acción principal que dice qué hacer después.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  accionPrincipal,
  estadoContenido,
  estadoEvaluacion,
  indiceInicial,
  indiceTrasCompletar,
  resumenProgreso,
  type EstadoContenido,
} from "../domain/module-navigation";
import { LessonContent, tipoRecurso, type LeccionVista } from "./lesson-content";

export interface ModuleLearningViewProps {
  modulo: { posicion: number; total: number | null; titulo: string; descripcion: string };
  lecciones: LeccionVista[];
  evaluacion: {
    existe: boolean;
    aprobada: boolean;
    href: string | null;
    mejorPuntaje: number | null;
  };
  /** A dónde ir cuando el módulo esté completo (siguiente módulo o autoevaluación final). */
  siguientePaso: { href: string; etiqueta: string } | null;
  /** Administrador: puede recorrer el contenido, pero no registra progreso. */
  vistaPrevia?: boolean;
}

const ETIQUETA_ESTADO: Record<EstadoContenido, string> = {
  completado: "Completado",
  "en-progreso": "En progreso",
  pendiente: "Pendiente",
};

function IconoEstado({ estado, bloqueado = false }: { estado: EstadoContenido; bloqueado?: boolean }) {
  if (estado === "completado") return <CheckCircle2 className="w-5 h-5 text-success" aria-hidden />;
  if (bloqueado) return <Lock className="w-4 h-4 text-muted-foreground" aria-hidden />;
  if (estado === "en-progreso") return <CircleDot className="w-5 h-5 text-primary" aria-hidden />;
  return <Circle className="w-5 h-5 text-muted-foreground/60" aria-hidden />;
}

function PildoraEstado({ estado }: { estado: EstadoContenido }) {
  const estilos: Record<EstadoContenido, string> = {
    completado: "bg-success/10 text-success",
    "en-progreso": "bg-primary/10 text-primary",
    pendiente: "bg-foreground/5 text-muted-foreground",
  };
  const simbolo = { completado: "✓", "en-progreso": "●", pendiente: "○" }[estado];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${estilos[estado]}`}>
      <span aria-hidden>{simbolo}</span> {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

export function ModuleLearningView({ modulo, lecciones, evaluacion, siguientePaso, vistaPrevia = false }: ModuleLearningViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado local de completados: se actualiza al instante tras marcar una
  // lección, y se re-sincroniza cuando el servidor envía datos nuevos.
  const claveServidor = lecciones.map((l) => `${l.id}:${l.completado ? 1 : 0}`).join("|");
  const [completados, setCompletados] = useState<Set<string>>(
    () => new Set(lecciones.filter((l) => l.completado).map((l) => l.id))
  );
  useEffect(() => {
    setCompletados(new Set(lecciones.filter((l) => l.completado).map((l) => l.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveServidor]);

  const contenidos = useMemo(
    () => lecciones.map((l) => ({ id: l.id, completado: completados.has(l.id) })),
    [lecciones, completados]
  );
  // El contenido actual se refleja en la URL (?contenido=N): sobrevive a
  // recargas, permite volver con "atrás" y compartir el enlace exacto.
  const [indice, setIndice] = useState(() => indiceInicial(contenidos, searchParams.get("contenido")));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visorRef = useRef<HTMLElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const cierreRef = useRef<HTMLDivElement>(null);
  const indicePrevio = useRef(indice);

  const progreso = resumenProgreso(contenidos);
  const leccion = lecciones[indice];
  const total = lecciones.length;

  // La evaluación se habilita cuando todo el contenido está revisado
  // (misma regla que aplica el servidor en learning-path).
  const estadoEval = {
    existe: evaluacion.existe,
    aprobada: evaluacion.aprobada,
    disponible: !vistaPrevia && evaluacion.existe && progreso.todosCompletados,
    href: evaluacion.href,
  };
  const moduloCompletado = progreso.todosCompletados && (!evaluacion.existe || evaluacion.aprobada);
  const accion = accionPrincipal(contenidos, indice, estadoEval);

  // Al cambiar de contenido: llevar el visor a la vista (útil en celular,
  // donde la lista queda arriba) y mover el foco al título para lectores de pantalla.
  useEffect(() => {
    // Solo cuando el estudiante CAMBIA de contenido (no al montar: en
    // desarrollo React ejecuta los efectos dos veces al montar).
    if (indicePrevio.current === indice) return;
    indicePrevio.current = indice;
    const url = new URL(window.location.href);
    url.searchParams.set("contenido", String(indice + 1));
    window.history.replaceState(null, "", url);
    const visor = visorRef.current;
    if (visor && visor.getBoundingClientRect().top < 64) {
      visor.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (visor && visor.getBoundingClientRect().top > window.innerHeight * 0.6) {
      visor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    tituloRef.current?.focus({ preventScroll: true });
  }, [indice]);

  function irA(i: number) {
    if (i < 0 || i >= total) return;
    setError(null);
    setIndice(i);
  }

  async function completarYContinuar() {
    if (!leccion) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${leccion.id}/complete`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar tu progreso. Inténtalo de nuevo.");
      const siguiente = indiceTrasCompletar(contenidos, indice);
      // La URL se actualiza ANTES de refrescar: si el servidor vuelve a
      // montar la vista, se reabre en el contenido correcto.
      const url = new URL(window.location.href);
      url.searchParams.set("contenido", String(siguiente + 1));
      window.history.replaceState(null, "", url);
      setCompletados((prev) => new Set(prev).add(leccion.id));
      setIndice(siguiente);
      router.refresh(); // trae del servidor el progreso actualizado del itinerario
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar tu progreso.");
    } finally {
      setGuardando(false);
    }
  }

  function ejecutarAccion() {
    if (accion.tipo === "completar-y-continuar") return completarYContinuar();
    if (accion.tipo === "siguiente" || accion.tipo === "ir-a-pendiente") return irA(accion.indice);
    if (accion.tipo === "finalizar") {
      cierreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      cierreRef.current?.focus({ preventScroll: true });
    }
  }

  // Texto de "siguiente paso" para el resumen superior.
  const siguientePasoTexto = vistaPrevia
    ? "Vista previa de administrador: el progreso no se registra."
    : !progreso.todosCompletados
      ? `Revisa: ${lecciones.find((l) => !completados.has(l.id))?.titulo ?? "contenido pendiente"}`
      : evaluacion.existe && !evaluacion.aprobada
        ? "Todo el contenido está revisado. Realiza la evaluación del módulo."
        : siguientePaso
          ? `¡Módulo completado! Continúa con: ${siguientePaso.etiqueta}`
          : "¡Módulo completado!";

  return (
    <div className="flex flex-col gap-6">
      {/* ================= Encabezado ================= */}
      <header>
        <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
          Módulo {modulo.posicion}
          {modulo.total ? ` de ${modulo.total}` : ""}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-3 mb-2 break-words">{modulo.titulo}</h1>
        <p className="text-muted-foreground max-w-3xl">{modulo.descripcion}</p>
      </header>

      {/* ================= Progreso del módulo ================= */}
      <section aria-labelledby="progreso-modulo" className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
          <h2 id="progreso-modulo" className="text-sm font-semibold text-foreground">
            Progreso del módulo
          </h2>
          <span className="text-2xl font-bold text-foreground leading-none">{progreso.porcentaje}%</span>
        </div>
        <ProgressBar value={progreso.porcentaje} />
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground">
              {progreso.completados} de {progreso.total}
            </strong>{" "}
            contenidos completados
            {evaluacion.existe && (
              <>
                {" · "}Evaluación{" "}
                <strong className={evaluacion.aprobada ? "text-success" : "text-foreground"}>
                  {evaluacion.aprobada ? `aprobada (${evaluacion.mejorPuntaje}%)` : "pendiente"}
                </strong>
              </>
            )}
          </p>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-background-secondary px-3 py-2 text-sm text-foreground">
          <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-medium">Siguiente paso: </span>
            {siguientePasoTexto}
          </span>
        </p>
      </section>

      {total === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          Este módulo todavía no tiene contenido.
        </p>
      ) : (
        // Dos columnas (lista | visor) solo en pantallas anchas; en laptop,
        // tablet y celular la lista va arriba en formato compacto y el visor
        // ocupa todo el ancho. Nunca hay desplazamiento horizontal.
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] gap-6 items-start">
          {/* ================= Contenido del módulo (lista vertical) ================= */}
          <nav aria-label="Contenido del módulo" className="rounded-2xl border border-border bg-surface p-4 xl:sticky xl:top-20">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 mb-3 xl:flex-col xl:items-start">
              <h2 className="text-sm font-semibold text-foreground">Contenido del módulo</h2>
              <span className="text-xs text-muted-foreground">
                {total} contenido{total === 1 ? "" : "s"}
                {evaluacion.existe ? " + evaluación" : ""}
              </span>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-1">
              {lecciones.map((l, i) => {
                const estado = estadoContenido(contenidos[i], i === indice);
                const { etiqueta, Icono } = tipoRecurso(l.tipo);
                const actual = i === indice;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => irA(i)}
                      aria-current={actual ? "step" : undefined}
                      className={`w-full h-full flex items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                        actual ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-background-secondary"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        <IconoEstado estado={estado} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Icono className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          {i + 1}. {etiqueta}
                        </span>
                        <span
                          title={l.titulo}
                          className={`text-sm leading-snug line-clamp-1 sm:line-clamp-2 ${actual ? "font-medium text-foreground" : "text-foreground"}`}
                        >
                          {l.titulo}
                        </span>
                        <span className="sr-only">— {ETIQUETA_ESTADO[estado]}</span>
                      </span>
                    </button>
                  </li>
                );
              })}

              {evaluacion.existe && (
                <li>
                  <a
                    href="#evaluacion-modulo"
                    className="w-full h-full flex items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-background-secondary"
                  >
                    <span className="mt-0.5 shrink-0">
                      <IconoEstado estado={estadoEvaluacion(estadoEval)} bloqueado={!estadoEval.disponible && !evaluacion.aprobada} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ClipboardCheck className="w-3.5 h-3.5" aria-hidden />
                        Paso final
                      </span>
                      <span className="block text-sm font-medium text-foreground">Evaluación del módulo</span>
                      <span className="sr-only">— {ETIQUETA_ESTADO[estadoEvaluacion(estadoEval)]}</span>
                    </span>
                  </a>
                </li>
              )}
            </ol>
          </nav>

          {/* ================= Visor del contenido actual ================= */}
          <section
            ref={visorRef}
            aria-labelledby="titulo-contenido"
            className="min-w-0 rounded-2xl border border-border bg-surface overflow-hidden scroll-mt-20"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Contenido {indice + 1} de {total}
                </span>
                {" · "}
                {tipoRecurso(leccion.tipo).etiqueta}
              </p>
              {!vistaPrevia && <PildoraEstado estado={estadoContenido(contenidos[indice], true)} />}
            </div>

            <div className="p-5 flex flex-col gap-4">
              <h2
                id="titulo-contenido"
                ref={tituloRef}
                tabIndex={-1}
                className="text-lg font-semibold text-foreground outline-none break-words"
              >
                {leccion.titulo}
              </h2>
              <LessonContent key={leccion.id} leccion={leccion} />
            </div>

            {/* Navegación: grande, visible y siempre en el mismo lugar */}
            <div className="border-t border-border bg-background-secondary/40 px-5 py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => irA(indice - 1)}
                disabled={indice === 0}
                aria-label={indice === 0 ? "Anterior (estás en el primer contenido)" : "Ir al contenido anterior"}
                className="min-h-11"
              >
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden /> Anterior
              </Button>

              {vistaPrevia ? (
                <Button onClick={() => irA(indice + 1)} disabled={indice === total - 1} className="min-h-11">
                  Siguiente <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
                </Button>
              ) : accion.tipo === "finalizar" && moduloCompletado && siguientePaso ? (
                // Módulo terminado: la acción principal lleva directamente al siguiente paso del itinerario.
                <Link href={siguientePaso.href} className="inline-flex">
                  <Button className="min-h-11 w-full sm:w-auto">
                    {siguientePaso.etiqueta} <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
                  </Button>
                </Link>
              ) : accion.tipo === "evaluacion" ? (
                <Link href={accion.href} className="inline-flex">
                  <Button className="min-h-11 w-full sm:w-auto">
                    {accion.etiqueta} <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
                  </Button>
                </Link>
              ) : (
                <Button onClick={ejecutarAccion} isLoading={guardando} className="min-h-11">
                  {accion.etiqueta}
                  {accion.tipo === "finalizar" ? (
                    <CheckCircle2 className="w-4 h-4 ml-2" aria-hidden />
                  ) : (
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
                  )}
                </Button>
              )}
            </div>
            {error && (
              <p role="alert" className="px-5 pb-4 text-sm text-red-600">
                {error}
              </p>
            )}
          </section>
        </div>
      )}

      {/* ================= Evaluación del módulo ================= */}
      {evaluacion.existe && (
        <section
          id="evaluacion-modulo"
          aria-labelledby="titulo-evaluacion"
          className={`scroll-mt-20 rounded-2xl border p-6 ${
            estadoEval.disponible && !evaluacion.aprobada ? "border-primary bg-primary/5" : "border-border bg-surface"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-5 h-5 text-primary" aria-hidden />
            <h2 id="titulo-evaluacion" className="font-semibold text-foreground">
              Evaluación del módulo
            </h2>
            {!vistaPrevia && <PildoraEstado estado={estadoEvaluacion(estadoEval)} />}
          </div>
          {vistaPrevia ? (
            <p className="text-sm text-muted-foreground mb-4">Vista previa: los estudiantes la rinden al completar el contenido.</p>
          ) : evaluacion.aprobada ? (
            <p className="text-sm text-success mb-4">Aprobada con {evaluacion.mejorPuntaje}%.</p>
          ) : estadoEval.disponible ? (
            <p className="text-sm text-foreground mb-4">
              Ya revisaste todo el contenido. Necesitas 70% para aprobar
              {evaluacion.mejorPuntaje !== null ? ` (tu mejor intento: ${evaluacion.mejorPuntaje}%)` : ""}.
            </p>
          ) : (
            <p className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
              <Lock className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              Se habilita cuando completes los {total} contenidos del módulo ({progreso.completados} de {total} listos).
            </p>
          )}
          {evaluacion.href && (estadoEval.disponible || evaluacion.aprobada || vistaPrevia) && (
            <Link href={evaluacion.href} className="inline-flex">
              <Button variant={evaluacion.aprobada ? "outline" : "primary"} className="min-h-11">
                {evaluacion.aprobada ? "Repetir evaluación" : vistaPrevia ? "Ver evaluación" : "Realizar evaluación"}
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
              </Button>
            </Link>
          )}
        </section>
      )}

      {/* ================= Cierre del módulo ================= */}
      {!vistaPrevia && moduloCompletado && (
        <div
          ref={cierreRef}
          tabIndex={-1}
          className="rounded-2xl border border-success/40 bg-success/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 outline-none"
        >
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Award className="w-5 h-5 text-success" aria-hidden /> ¡Módulo completado!
          </p>
          {siguientePaso ? (
            <Link href={siguientePaso.href} className="inline-flex">
              <Button className="min-h-11 w-full sm:w-auto">
                {siguientePaso.etiqueta} <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
              </Button>
            </Link>
          ) : (
            <Link href="/modulos" className="inline-flex">
              <Button variant="outline" className="min-h-11">Volver a los módulos</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
