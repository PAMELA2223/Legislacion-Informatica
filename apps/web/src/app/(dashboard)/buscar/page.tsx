import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, BookOpen, GraduationCap } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaSearchRepository } from "@/modules/search/infrastructure/prisma-search.repository";
import { BuscarGlobalUseCase } from "@/modules/search/application/search.use-cases";
import { GlobalSearchBar } from "@/modules/search/presentation/global-search-bar";
import type { TipoResultadoBusqueda } from "@/modules/search/domain/search.entity";

const ICONOS: Record<TipoResultadoBusqueda, React.ReactNode> = {
  DOCUMENTO: <FileText className="w-4 h-4" />,
  ARTICULO: <BookOpen className="w-4 h-4" />,
  MODULO: <GraduationCap className="w-4 h-4" />,
  CASO_PRACTICO: <FileText className="w-4 h-4" />,
  GLOSARIO: <BookOpen className="w-4 h-4" />,
  NOTICIA: <FileText className="w-4 h-4" />,
};

const ETIQUETAS: Record<TipoResultadoBusqueda, string> = {
  DOCUMENTO: "Documento",
  ARTICULO: "Artículo",
  MODULO: "Módulo",
  CASO_PRACTICO: "Caso práctico",
  GLOSARIO: "Glosario",
  NOTICIA: "Noticia",
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaSearchRepository(prisma);
  const useCase = new BuscarGlobalUseCase(repo);
  const resultados = q ? await useCase.execute(q) : [];

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-4">Buscador inteligente</h1>
      <div className="mb-8">
        <GlobalSearchBar />
      </div>

      {q && (
        <p className="text-sm text-muted-foreground mb-4">
          {resultados.length} resultado(s) para &quot;{q}&quot;
        </p>
      )}

      <div className="flex flex-col gap-3">
        {resultados.map((r) => (
          <Link
            key={`${r.tipo}-${r.id}`}
            href={r.url}
            className="rounded-xl border border-border bg-surface p-4 flex items-start gap-3 hover:border-primary transition-colors"
          >
            <span className="mt-0.5 text-primary">{ICONOS[r.tipo]}</span>
            <div>
              <span className="text-xs text-muted-foreground">{ETIQUETAS[r.tipo]}</span>
              <p className="font-medium text-foreground">{r.titulo}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{r.extracto}</p>
            </div>
          </Link>
        ))}
        {q && resultados.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No se encontraron resultados. Intenta con otra palabra clave, ley o módulo.
          </p>
        )}
      </div>
    </main>
  );
}
