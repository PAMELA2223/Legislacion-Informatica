import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaEvaluationRepository } from "@/modules/evaluations/infrastructure/prisma-evaluation.repository";
import { ObtenerEvaluacionParaResolverUseCase } from "@/modules/evaluations/application/evaluation.use-cases";
import { EvaluationRunner } from "@/modules/evaluations/presentation/evaluation-runner";

export default async function EvaluacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaEvaluationRepository(prisma);
  const useCase = new ObtenerEvaluacionParaResolverUseCase(repo);

  let evaluacion;
  try {
    evaluacion = await useCase.execute(id);
  } catch {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">{evaluacion.titulo}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Responde todas las preguntas y envía para recibir tu calificación y
        retroalimentación de inmediato.
      </p>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <EvaluationRunner evaluacion={evaluacion} />
      </div>
    </main>
  );
}
