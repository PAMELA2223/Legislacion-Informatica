import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerEvaluacionConPreguntasUseCase } from "@/modules/admin/application/admin.use-cases";
import { QuestionForm } from "@/modules/admin/presentation/question-form";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";

const ETIQUETAS_TIPO: Record<string, string> = {
  VF: "Verdadero/Falso",
  OPCION_MULTIPLE: "Opción múltiple",
  RELACIONAR: "Relacionar",
  COMPLETAR: "Completar",
  CASO: "Caso",
};

export default async function DetalleEvaluacionAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let evaluacion;
  try {
    evaluacion = await new ObtenerEvaluacionConPreguntasUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">{evaluacion.titulo}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {evaluacion.preguntas.length} pregunta(s) · Tiempo límite: {evaluacion.tiempoLimite || "sin límite"} min
      </p>

      <h2 className="font-semibold text-foreground mb-3">Preguntas actuales</h2>
      <div className="flex flex-col gap-2 mb-8">
        {evaluacion.preguntas.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1 mr-2">
                {ETIQUETAS_TIPO[p.tipo] ?? p.tipo}
              </span>
              <span className="text-sm text-foreground">{p.enunciado}</span>
            </div>
            <DeleteButton url={`/api/admin/preguntas/${p.id}`} confirmMessage="¿Eliminar esta pregunta?" />
          </div>
        ))}
        {evaluacion.preguntas.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay preguntas. Agrega la primera abajo.</p>
        )}
      </div>

      <h2 className="font-semibold text-foreground mb-3">Agregar pregunta</h2>
      <QuestionForm evaluationId={evaluacion.id} />
    </div>
  );
}
