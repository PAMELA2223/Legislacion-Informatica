import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaSelfAssessmentRepository } from "@/modules/self-assessment/infrastructure/prisma-self-assessment.repository";
import { ObtenerCuestionarioUseCase } from "@/modules/self-assessment/application/self-assessment.use-cases";
import { SelfAssessmentForm } from "@/modules/self-assessment/presentation/self-assessment-form";

export default async function DiagnosticoFinalPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaSelfAssessmentRepository(prisma);
  const { preguntas, yaCompleto } = await new ObtenerCuestionarioUseCase(repo).execute(
    user.id,
    "FINAL"
  );

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Diagnóstico final</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Responde nuevamente el mismo cuestionario para medir tu evolución
        respecto al diagnóstico inicial.
      </p>

      {yaCompleto && (
        <div className="rounded-xl bg-success/10 border border-success/30 p-4 text-sm text-success mb-6">
          Ya completaste este diagnóstico. Puedes volver a responderlo si lo deseas;
          se actualizará tu perfil final.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-6">
        <SelfAssessmentForm preguntas={preguntas} tipo="FINAL" />
      </div>
    </main>
  );
}
