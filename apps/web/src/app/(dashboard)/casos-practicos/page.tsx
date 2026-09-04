import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaCaseStudyRepository } from "@/modules/case-studies/infrastructure/prisma-case-study.repository";
import { ListarCasosUseCase } from "@/modules/case-studies/application/case-study.use-cases";
import { CaseCard } from "@/modules/case-studies/presentation/case-card";
import { ETIQUETAS_CATEGORIA_CASO, type CategoriaCaso } from "@/modules/case-studies/domain/case-study.entity";

const CATEGORIAS = Object.keys(ETIQUETAS_CATEGORIA_CASO) as CategoriaCaso[];

export default async function CasosPracticosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaCaseStudyRepository(prisma);
  const casos = await new ListarCasosUseCase(repo).execute(categoria as CategoriaCaso | undefined);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Casos prácticos</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Analiza situaciones reales y aplica la normativa ecuatoriana para decidir la actuación correcta.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/casos-practicos"
          className={`text-xs font-medium rounded-full px-3 py-1.5 border ${
            !categoria ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
          }`}
        >
          Todas
        </Link>
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat}
            href={`/casos-practicos?categoria=${cat}`}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border ${
              categoria === cat ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
            }`}
          >
            {ETIQUETAS_CATEGORIA_CASO[cat]}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {casos.map((caso) => (
          <CaseCard key={caso.id} caso={caso} />
        ))}
        {casos.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No hay casos prácticos en esta categoría todavía.
          </p>
        )}
      </div>
    </main>
  );
}
