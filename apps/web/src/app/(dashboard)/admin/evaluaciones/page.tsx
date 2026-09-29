import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarEvaluacionesAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { ETIQUETAS_TIPO_EVALUACION, TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// Vista general de TODAS las evaluaciones (módulos y autoevaluaciones).
// La gestión habitual se hace desde cada módulo y desde "Autoevaluaciones";
// esta página sirve para detectar problemas (sin preguntas, sin módulo).
export default async function AdminEvaluacionesPage() {
  const evaluaciones = await new ListarEvaluacionesAdminUseCase(new PrismaAdminRepository(prisma)).execute();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Evaluaciones</h1>
        <Link href="/admin/evaluaciones/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva evaluación
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Vista general. Cada evaluación de módulo también se gestiona desde su{" "}
        <Link href="/admin/cursos" className="text-primary hover:underline">módulo</Link>, y las autoevaluaciones desde{" "}
        <Link href="/admin/autoevaluaciones" className="text-primary hover:underline">Autoevaluaciones</Link>.
      </p>

      <div className="flex flex-col gap-2">
        {evaluaciones.map((e) => {
          const sinModulo = e.tipo === TIPO_EVALUACION.MODULO && !e.cursoTitulo;
          return (
            <div key={e.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between gap-4">
              <Link href={`/admin/evaluaciones/${e.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5">
                    {ETIQUETAS_TIPO_EVALUACION[e.tipo] ?? e.tipo}
                  </span>
                  <p className="font-medium text-foreground hover:text-primary transition-colors">{e.titulo}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {e.cursoTitulo ? `${e.cursoTitulo} · ` : ""}
                  {e.preguntasActivas} activa(s) de {e.totalPreguntas} pregunta(s) · {e.totalIntentos} intento(s)
                </p>
                {(sinModulo || e.preguntasActivas === 0) && (
                  <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {sinModulo ? "No está asociada a ningún módulo: los estudiantes no pueden acceder a ella." : "Sin preguntas activas."}
                  </p>
                )}
              </Link>
              <DeleteButton
                url={`/api/admin/evaluaciones/${e.id}`}
                confirmMessage={`¿Eliminar la evaluación "${e.titulo}" y sus preguntas? (No se permite si ya tiene intentos de estudiantes.)`}
              />
            </div>
          );
        })}
        {evaluaciones.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay evaluaciones.</p>}
      </div>
    </div>
  );
}
