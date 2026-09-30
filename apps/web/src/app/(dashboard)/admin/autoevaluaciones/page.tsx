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
      intentos: { orderBy: { fecha: "asc" }, select: { userId: true, puntaje: true } },
    },
  });

  // Primer intento por estudiante (la autoevaluación se responde una sola vez).
  const primerIntento = (tipo: string) => {
    const ev = evaluaciones.find((e) => e.tipo === tipo);
    const mapa = new Map<string, number>();
    for (const i of ev?.intentos ?? []) if (!mapa.has(i.userId)) mapa.set(i.userId, i.puntaje);
    return mapa;
  };
  const inicial = primerIntento(TIPO_EVALUACION.INICIAL);
  const final = primerIntento(TIPO_EVALUACION.FINAL);
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
                    {ev.preguntas.length} pregunta(s) activa(s) de {ev._count.preguntas} · {respondieron} estudiante(s) la respondieron
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
    </div>
  );
}
