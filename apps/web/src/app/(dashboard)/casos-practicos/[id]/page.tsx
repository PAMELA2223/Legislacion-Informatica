import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaCaseStudyRepository } from "@/modules/case-studies/infrastructure/prisma-case-study.repository";
import { ObtenerCasoParaResolverUseCase } from "@/modules/case-studies/application/case-study.use-cases";
import { CaseRunner } from "@/modules/case-studies/presentation/case-runner";
import { ETIQUETAS_CATEGORIA_CASO, ETIQUETAS_DIFICULTAD } from "@/modules/case-studies/domain/case-study.entity";

export default async function CasoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaCaseStudyRepository(prisma);
  const useCase = new ObtenerCasoParaResolverUseCase(repo);

  let caso;
  try {
    caso = await useCase.execute(id);
  } catch {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
          {ETIQUETAS_CATEGORIA_CASO[caso.categoria]}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Nivel: {ETIQUETAS_DIFICULTAD[caso.nivelDificultad]}
        </span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-8">{caso.titulo}</h1>

      <CaseRunner caso={caso} />
    </main>
  );
}
