import Link from "next/link";
import { Plus, AlertTriangle, ClipboardCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";
import { ActionButton } from "@/modules/admin/presentation/action-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const CONFIG = [
  {
    tipo: TIPO_EVALUACION.INICIAL,
    nombre: "Autoevaluación inicial",
    tituloPorDefecto: "Autoevaluación inicial: legislación informática",
    detalle: "Obligatoria al primer ingreso. Diagnóstico de conocimientos previos; bloquea los módulos hasta completarse.",
  },
  {
    tipo: TIPO_EVALUACION.FINAL,
    nombre: "Autoevaluación final",
    tituloPorDefecto: "Autoevaluación final: legislación informática",
    detalle: "Obligatoria al completar todos los módulos y sus evaluaciones. Se compara con la inicial.",
  },
] as const;

export default async function AdminAutoevaluacionesPage() {
  const evaluaciones = await prisma.evaluation.findMany({
    where: { tipo: { in: [TIPO_EVALUACION.INICIAL, TIPO_EVALUACION.FINAL] } },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { preguntas: true } },
      preguntas: { where: { activo: true }, select: { id: true } },
      intentos: {
        orderBy: { fecha: "asc" },
        select: { userId: true, puntaje: true, fecha: true, user: { select: { nombre: true, email: true } } },
      },
    },
  });

  // Primer intento por estudiante (la autoevaluación se responde una sola vez).
  type Intento = { puntaje: number; fecha: Date; nombre: string; email: string };
  const primerIntentoDetalle = (tipo: string) => {
    const ev = evaluaciones.find((e) => e.tipo === tipo);
    const mapa = new Map<string, Intento>();
    for (const i of ev?.intentos ?? [])
      if (!mapa.has(i.userId)) mapa.set(i.userId, { puntaje: i.puntaje, fecha: i.fecha, nombre: i.user.nombre, email: i.user.email });
    return mapa;
  };
  const detalleInicial = primerIntentoDetalle(TIPO_EVALUACION.INICIAL);
  const detalleFinal = primerIntentoDetalle(TIPO_EVALUACION.FINAL);
  const soloPuntaje = (m: Map<string, Intento>) => new Map(Array.from(m, ([k, v]) => [k, v.puntaje]));
  const inicial = soloPuntaje(detalleInicial);
  const final = soloPuntaje(detalleFinal);

  // Una fila por estudiante que rindió alguna de las dos; primero los más recientes.
  const filas = Array.from(new Set([...detalleInicial.keys(), ...detalleFinal.keys()]))
    .map((userId) => {
      const ini = detalleInicial.get(userId);
      const fin = detalleFinal.get(userId);
      const persona = (ini ?? fin)!;
      return { userId, nombre: persona.nombre, email: persona.email, ini, fin };
    })
    .sort((a, b) => {
      const fa = (a.fin ?? a.ini)!.fecha.getTime();
      const fb = (b.fin ?? b.ini)!.fecha.getTime();
      return fb - fa;
    });
  const fecha = (d?: Date) => (d ? d.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" }) : "");
  const promedio = (vals: number[]) => (vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null);
  const ambos = Array.from(final.keys()).filter((u) => inicial.has(u));
  const promInicialAmbos = promedio(ambos.map((u) => inicial.get(u)!));
  const promFinalAmbos = promedio(ambos.map((u) => final.get(u)!));
  const finalizados = await prisma.user.count({ where: { procesoFinalizadoEn: { not: null } } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Autoevaluaciones</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Diagnóstico inicial y comprobación final del aprendizaje. Cada una tiene sus propias preguntas; los
        cambios se reflejan de inmediato en la plataforma del estudiante.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {CONFIG.map((c) => {
          const ev = evaluaciones.find((e) => e.tipo === c.tipo);
          const respondieron = (c.tipo === TIPO_EVALUACION.INICIAL ? inicial : final).size;
          const totalIntentos = ev?.intentos.length ?? 0;
          return (
            <div key={c.tipo} className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-accent" />
                <h2 className="font-semibold text-foreground">{c.nombre}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{c.detalle}</p>
              {ev ? (
                <>
                  <p className="text-sm text-foreground">
                    {ev.preguntas.length} pregunta(s) activa(s) de {ev._count.preguntas} · <strong>{totalIntentos} intento(s)</strong>{" "}
                    de {respondieron} estudiante(s)
                  </p>
                  {ev.preguntas.length === 0 && (
                    <p className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="w-3.5 h-3.5" /> Sin preguntas activas: no se exigirá a los estudiantes.
                    </p>
                  )}
                  <Link href={`/admin/autoevaluaciones/${ev.id}`} className="mt-auto">
                    <Button>Gestionar preguntas</Button>
                  </Link>
                </>
              ) : (
                <ActionButton
                  url="/api/admin/evaluaciones"
                  body={{ titulo: c.tituloPorDefecto, tipo: c.tipo, tiempoLimite: 0 }}
                  className="mt-auto self-start inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Crear {c.nombre.toLowerCase()}
                </ActionButton>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="font-semibold text-foreground mb-3">Resultado inicial → Resultado final</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Promedio inicial (todos)", valor: promedio(Array.from(inicial.values())), sufijo: "%" },
          { label: "Promedio final (todos)", valor: promedio(Array.from(final.values())), sufijo: "%" },
          {
            label: `Mejora promedio (${ambos.length} con ambas)`,
            valor: promInicialAmbos !== null && promFinalAmbos !== null ? promFinalAmbos - promInicialAmbos : null,
            sufijo: " pts",
          },
          { label: "Procesos finalizados", valor: finalizados, sufijo: "", icono: true },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {t.icono && <Users className="w-3.5 h-3.5" />} {t.label}
            </p>
            <p className="text-2xl font-bold text-foreground">{t.valor === null ? "—" : `${t.valor}${t.sufijo}`}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-foreground mt-10 mb-1">Intentos registrados</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Resultado de cada estudiante en la autoevaluación inicial y en la final (cada una se responde una sola vez).
      </p>
      {filas.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
          Todavía ningún estudiante ha respondido las autoevaluaciones.
        </p>
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-background-secondary text-left text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">Estudiante</th>
                <th scope="col" className="px-4 py-3 font-medium">Autoevaluación inicial</th>
                <th scope="col" className="px-4 py-3 font-medium">Autoevaluación final</th>
                <th scope="col" className="px-4 py-3 font-medium">Mejora</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => {
                const mejora = f.ini && f.fin ? f.fin.puntaje - f.ini.puntaje : null;
                return (
                  <tr key={f.userId} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{f.nombre}</p>
                      <p className="text-xs text-muted-foreground">{f.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {f.ini ? (
                        <>
                          <span className="font-semibold text-foreground">{f.ini.puntaje}%</span>
                          <span className="block text-xs text-muted-foreground">{fecha(f.ini.fecha)}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {f.fin ? (
                        <>
                          <span className="font-semibold text-foreground">{f.fin.puntaje}%</span>
                          <span className="block text-xs text-muted-foreground">{fecha(f.fin.fecha)}</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pendiente</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {mejora === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className={`font-semibold ${mejora > 0 ? "text-success" : mejora < 0 ? "text-red-600" : "text-foreground"}`}>
                          {mejora > 0 ? "+" : ""}
                          {mejora} pts
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
