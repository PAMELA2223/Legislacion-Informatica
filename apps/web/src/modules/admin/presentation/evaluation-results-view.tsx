import Link from "next/link";
import { ArrowLeft, Download, Search, CheckCircle2, XCircle, Users, BarChart3 } from "lucide-react";
import { fechaHoraEC } from "@/lib/fechas";
import type { FiltroEstado, ResumenResultados, ResultadoEstudiante } from "../domain/evaluation-results";
import type { ModuloConResultados } from "../domain/admin-repository.interface";
import { ModuleResultsSelect } from "./module-results-select";

export interface EvaluationResultsViewProps {
  modulos: ModuloConResultados[];
  seleccionado: ModuloConResultados | null;
  resultados:
    | (ResumenResultados & { evaluacion: { id: string; titulo: string; courseId: string; cursoTitulo: string; cursoNumero: number } })
    | null;
  visibles: ResultadoEstudiante[];
  estado: FiltroEstado;
  q: string;
  /** Ruta de esta vista (por defecto la del panel). */
  rutaBase?: string;
}

/** Vista de resultados por módulo (solo presentación: recibe los datos ya calculados). */
export function EvaluationResultsView({
  modulos,
  seleccionado,
  resultados,
  visibles,
  estado,
  q,
  rutaBase = "/admin/evaluaciones/resultados",
}: EvaluationResultsViewProps) {
  const conEvaluacion = modulos.filter((m) => m.evaluacion);
  const url = (cambios: Partial<{ modulo: string; estado: FiltroEstado; q: string }>) => {
    const p = new URLSearchParams();
    const modulo = cambios.modulo ?? seleccionado?.id;
    const est = cambios.estado ?? estado;
    const busq = cambios.q ?? q;
    if (modulo) p.set("modulo", modulo);
    if (est !== "todos") p.set("estado", est);
    if (busq) p.set("q", busq);
    return `${rutaBase}?${p.toString()}`;
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        <Link href="/admin/evaluaciones" className="inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="w-3 h-3" aria-hidden /> Evaluaciones de los módulos
        </Link>
      </p>
      <h1 className="text-2xl font-bold text-foreground mb-1">Resultados de las evaluaciones</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Selecciona un módulo para ver qué estudiantes rindieron su evaluación y cuál fue su resultado. La calificación es la
        del mejor intento y se aprueba con 70%.
      </p>

      {conEvaluacion.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          Ningún módulo tiene evaluación todavía. Créalas desde{" "}
          <Link href="/admin/evaluaciones" className="text-primary hover:underline">Evaluaciones</Link>.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] gap-6 items-start">
          {/* ---------- Selección de módulo ---------- */}
          <div className="lg:hidden">
            <ModuleResultsSelect
              rutaBase={rutaBase}
              seleccionado={seleccionado?.id ?? null}
              modulos={modulos.map((m) => ({
                id: m.id,
                etiqueta: `Módulo ${m.numero}: ${m.titulo}${m.evaluacion ? ` (${m.evaluacion.rindieron} rindieron)` : " — sin evaluación"}`,
                deshabilitado: !m.evaluacion,
              }))}
            />
          </div>
          <nav aria-label="Módulos" className="hidden lg:flex flex-col gap-1 rounded-2xl border border-border bg-surface p-2 lg:sticky lg:top-20">
            {modulos.map((m) => {
              const activo = m.id === seleccionado?.id;
              const contenido = (
                <>
                  <span className={`block text-sm leading-snug ${activo ? "font-semibold text-primary" : "text-foreground"}`}>
                    {m.numero}. {m.titulo}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {m.evaluacion
                      ? `${m.evaluacion.rindieron} rindieron · ${m.evaluacion.aprobados} aprobaron`
                      : "Sin evaluación"}
                  </span>
                </>
              );
              return m.evaluacion ? (
                <Link
                  key={m.id}
                  href={url({ modulo: m.id, estado: "todos", q: "" })}
                  aria-current={activo ? "page" : undefined}
                  className={`rounded-xl px-3 py-2 ${activo ? "bg-primary/10" : "hover:bg-background-secondary"}`}
                >
                  {contenido}
                </Link>
              ) : (
                <div key={m.id} className="rounded-xl px-3 py-2 opacity-50">{contenido}</div>
              );
            })}
          </nav>

          {/* ---------- Resultados del módulo seleccionado ---------- */}
          {seleccionado && resultados && (
            <section aria-labelledby="titulo-resultados" className="min-w-0 flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Módulo {resultados.evaluacion.cursoNumero} · {resultados.evaluacion.cursoTitulo}</p>
                  <h2 id="titulo-resultados" className="text-lg font-semibold text-foreground break-words">{resultados.evaluacion.titulo}</h2>
                </div>
                {resultados.rindieron > 0 && (
                  <a
                    href={`/api/admin/evaluaciones/${resultados.evaluacion.id}/resultados?${new URLSearchParams({ estado, q }).toString()}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-border-strong px-3 py-2 text-sm text-foreground hover:bg-background-secondary"
                  >
                    <Download className="w-4 h-4" aria-hidden /> Descargar (Excel/CSV)
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { etiqueta: "Rindieron", valor: resultados.rindieron, Icono: Users, color: "text-primary" },
                  { etiqueta: "Aprobaron", valor: resultados.aprobados, Icono: CheckCircle2, color: "text-success" },
                  { etiqueta: "No aprobaron", valor: resultados.noAprobados, Icono: XCircle, color: "text-red-600" },
                  {
                    etiqueta: "Promedio · aprobación",
                    valor: resultados.promedio === null ? "—" : `${resultados.promedio}% · ${resultados.tasaAprobacion}%`,
                    Icono: BarChart3,
                    color: "text-accent",
                  },
                ].map(({ etiqueta, valor, Icono, color }) => (
                  <div key={etiqueta} className="rounded-2xl border border-border bg-surface p-4">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icono className={`w-3.5 h-3.5 ${color}`} aria-hidden /> {etiqueta}
                    </p>
                    <p className="text-xl font-bold text-foreground">{valor}</p>
                  </div>
                ))}
              </div>

              {resultados.rindieron === 0 ? (
                <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                  Ningún estudiante ha rendido todavía esta evaluación.
                </p>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por resultado">
                      {(
                        [
                          ["todos", `Todos (${resultados.rindieron})`],
                          ["aprobados", `Aprobados (${resultados.aprobados})`],
                          ["no-aprobados", `No aprobados (${resultados.noAprobados})`],
                        ] as [FiltroEstado, string][]
                      ).map(([valor, texto]) => (
                        <Link
                          key={valor}
                          href={url({ estado: valor })}
                          aria-current={estado === valor ? "true" : undefined}
                          className={`rounded-full px-3 py-1.5 text-sm border ${
                            estado === valor ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-foreground hover:bg-background-secondary"
                          }`}
                        >
                          {texto}
                        </Link>
                      ))}
                    </div>
                    <form method="get" action={rutaBase} className="flex items-center gap-2" role="search">
                      <input type="hidden" name="modulo" value={seleccionado.id} />
                      {estado !== "todos" && <input type="hidden" name="estado" value={estado} />}
                      <label htmlFor="buscar-estudiante" className="sr-only">Buscar estudiante</label>
                      <input
                        id="buscar-estudiante"
                        name="q"
                        defaultValue={q}
                        placeholder="Buscar por nombre o correo"
                        className="w-full md:w-60 rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <button type="submit" className="rounded-xl bg-primary p-2.5 text-white" aria-label="Buscar">
                        <Search className="w-4 h-4" aria-hidden />
                      </button>
                    </form>
                  </div>

                  {visibles.length === 0 ? (
                    <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                      Ningún estudiante coincide con el filtro.{" "}
                      <Link href={url({ estado: "todos", q: "" })} className="text-primary hover:underline">Ver todos</Link>
                    </p>
                  ) : (
                    <>
                      {/* Escritorio y tablet: tabla */}
                      <div className="hidden md:block rounded-2xl border border-border bg-surface overflow-x-auto">
                        <table className="w-full text-sm">
                          <caption className="sr-only">Resultados por estudiante</caption>
                          <thead>
                            <tr className="bg-background-secondary text-left text-xs text-muted-foreground">
                              <th scope="col" className="px-4 py-3 font-medium">Estudiante</th>
                              <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                              <th scope="col" className="px-4 py-3 font-medium">Calificación</th>
                              <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                              <th scope="col" className="px-4 py-3 font-medium">Intentos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibles.map((e) => (
                              <tr key={e.userId} className="border-t border-border align-top">
                                <td className="px-4 py-3">
                                  <p className="font-medium text-foreground">{e.nombre}</p>
                                  <p className="text-xs text-muted-foreground break-all">{e.email}</p>
                                </td>
                                <td className="px-4 py-3"><Estado aprobado={e.aprobado} /></td>
                                <td className="px-4 py-3 font-semibold text-foreground">{e.calificacion}%</td>
                                <td className="px-4 py-3 text-foreground whitespace-nowrap">{fechaHoraEC(e.fechaCalificacion)}</td>
                                <td className="px-4 py-3"><Historial e={e} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Celular: tarjetas (sin desplazamiento horizontal) */}
                      <ul className="md:hidden flex flex-col gap-2">
                        {visibles.map((e) => (
                          <li key={e.userId} className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">{e.nombre}</p>
                                <p className="text-xs text-muted-foreground break-all">{e.email}</p>
                              </div>
                              <span className="text-lg font-bold text-foreground">{e.calificacion}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <Estado aprobado={e.aprobado} />
                              <span>{fechaHoraEC(e.fechaCalificacion)}</span>
                            </div>
                            <Historial e={e} />
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        Mostrando {visibles.length} de {resultados.rindieron} estudiante(s) · {resultados.totalIntentos} intento(s) en total.
                        La fecha corresponde al intento con la calificación que cuenta.
                      </p>
                    </>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Estado({ aprobado }: { aprobado: boolean }) {
  return aprobado ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden /> Aprobado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
      <XCircle className="w-3.5 h-3.5" aria-hidden /> No aprobado
    </span>
  );
}

function Historial({ e }: { e: { totalIntentos: number; intentos: { puntaje: number; aprobado: boolean; fecha: Date }[]; calificacion: number } }) {
  if (e.totalIntentos === 1) return <span className="text-sm text-foreground">1</span>;
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-primary hover:underline">{e.totalIntentos} intentos</summary>
      <ol className="mt-2 flex flex-col gap-1">
        {e.intentos.map((i, n) => (
          <li key={n} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">#{n + 1} · {fechaHoraEC(i.fecha)}</span>
            <span className={`font-medium ${i.aprobado ? "text-success" : "text-foreground"}`}>{i.puntaje}%</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
