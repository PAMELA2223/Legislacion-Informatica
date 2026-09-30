import Link from "next/link";
import { Plus, AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarCursosAdminUseCase, ListarEvaluacionesAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { ActionButton } from "@/modules/admin/presentation/action-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// "Evaluaciones" administra ÚNICAMENTE las evaluaciones de los módulos,
// organizadas por módulo. Las autoevaluaciones inicial y final viven solo en
// el apartado "Autoevaluaciones" (sin duplicar funciones).
export default async function AdminEvaluacionesPage() {
  const repo = new PrismaAdminRepository(prisma);
  const [modulos, evaluaciones] = await Promise.all([
    new ListarCursosAdminUseCase(repo).execute(),
    new ListarEvaluacionesAdminUseCase(repo).execute(),
  ]);
  const porId = new Map(evaluaciones.map((e) => [e.id, e]));
  const sinModulo = evaluaciones.filter((e) => !e.cursoTitulo);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Evaluaciones de los módulos</h1>
        <Link href="/admin/evaluaciones/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva evaluación
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Cada módulo tiene una evaluación. El estudiante la rinde al terminar el contenido del módulo y necesita 70% para aprobar.
      </p>

      <div className="flex flex-col gap-3">
        {modulos.map((m, i) => {
          const ev = m.evaluacion ? porId.get(m.evaluacion.id) : undefined;
          return (
            <section key={m.id} className="rounded-2xl border border-border bg-surface p-4" aria-label={`Módulo ${i + 1}`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm font-semibold text-foreground">
                  Módulo {m.numero} · {m.titulo}
                  {!m.activo && <span className="ml-2 text-xs font-normal text-muted-foreground">(inactivo)</span>}
                </p>
              </div>

              {ev ? (
                <div className="mt-3 ml-1 flex items-center justify-between gap-3 border-l-2 border-border pl-4 flex-wrap">
                  <Link href={`/admin/evaluaciones/${ev.id}`} className="min-w-0 flex-1 group">
                    <p className="flex items-center gap-2 font-medium text-foreground group-hover:text-primary transition-colors">
                      <ClipboardList className="w-4 h-4 text-primary shrink-0" aria-hidden /> {ev.titulo}
                    </p>
                    <p className="flex items-center gap-1 text-xs mt-1">
                      {ev.preguntasActivas === 0 ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden /> Sin preguntas activas: los estudiantes no deberán rendirla
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" aria-hidden /> {ev.preguntasActivas} pregunta(s) activa(s)
                          · {ev.totalIntentos} intento(s)
                        </span>
                      )}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/evaluaciones/${ev.id}`}>
                      <Button variant="outline">Administrar preguntas</Button>
                    </Link>
                    <DeleteButton
                      url={`/api/admin/evaluaciones/${ev.id}`}
                      titulo="¿Está seguro de que desea eliminar esta evaluación?"
                      confirmMessage={`Se eliminarán "${ev.titulo}" y sus preguntas. No se permite si ya tiene intentos de estudiantes.`}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3 ml-1 flex items-center justify-between gap-3 border-l-2 border-dashed border-border pl-4 flex-wrap">
                  <p className="flex items-center gap-1 text-sm text-amber-600">
                    <AlertTriangle className="w-4 h-4" aria-hidden /> Este módulo todavía no tiene evaluación.
                  </p>
                  <ActionButton
                    url={`/api/admin/cursos/${m.id}/evaluacion`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" aria-hidden /> Crear evaluación
                  </ActionButton>
                </div>
              )}
            </section>
          );
        })}
        {modulos.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay módulos.</p>}
      </div>

      {sinModulo.length > 0 && (
        <section className="mt-10" aria-labelledby="sin-modulo">
          <h2 id="sin-modulo" className="font-semibold text-foreground mb-1">Evaluaciones sin módulo</h2>
          <p className="text-sm text-muted-foreground mb-3">
            No están asociadas a ningún módulo, así que los estudiantes no pueden acceder a ellas. Puedes eliminarlas o
            crear la evaluación desde el módulo correspondiente.
          </p>
          <div className="flex flex-col gap-2">
            {sinModulo.map((e) => (
              <div key={e.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 flex items-center justify-between gap-3">
                <Link href={`/admin/evaluaciones/${e.id}`} className="min-w-0">
                  <p className="font-medium text-foreground">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.totalPreguntas} pregunta(s) · {e.totalIntentos} intento(s)
                  </p>
                </Link>
                <DeleteButton
                  url={`/api/admin/evaluaciones/${e.id}`}
                  titulo="¿Está seguro de que desea eliminar esta evaluación?"
                  confirmMessage={`Se eliminarán "${e.titulo}" y sus preguntas.`}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
