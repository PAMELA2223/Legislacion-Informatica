import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaLibraryRepository } from "@/modules/library/infrastructure/prisma-library.repository";
import { ListarDocumentosUseCase } from "@/modules/library/application/library.use-cases";
import { DocumentCard } from "@/modules/library/presentation/document-card";
import { GlobalSearchBar } from "@/modules/search/presentation/global-search-bar";
import { ETIQUETAS_CATEGORIA, type CategoriaDocumento } from "@/modules/library/domain/library.entity";
import Link from "next/link";

const CATEGORIAS = Object.keys(ETIQUETAS_CATEGORIA) as CategoriaDocumento[];

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaLibraryRepository(prisma);
  const useCase = new ListarDocumentosUseCase(repo);
  const documentos = await useCase.execute({
    categoria: categoria as CategoriaDocumento | undefined,
  });

  const favoritos = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { documentId: true },
  });
  const idsFavoritos = new Set(favoritos.map((f) => f.documentId));

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Biblioteca jurídica</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Constitución, LOPDP, COIP, Ley de Comercio Electrónico, reglamentos y
        normativa relacionada.
      </p>

      <div className="mb-6">
        <GlobalSearchBar />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/biblioteca"
          className={`text-xs font-medium rounded-full px-3 py-1.5 border ${
            !categoria ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
          }`}
        >
          Todas
        </Link>
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat}
            href={`/biblioteca?categoria=${cat}`}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border ${
              categoria === cat
                ? "bg-primary text-white border-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentos.map((doc) => (
          <DocumentCard
            key={doc.id}
            id={doc.id}
            titulo={doc.titulo}
            categoria={doc.categoria}
            tags={doc.tags}
            descargas={doc.descargas}
            esFavoritoInicial={idsFavoritos.has(doc.id)}
          />
        ))}
        {documentos.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No hay documentos en esta categoría todavía.
          </p>
        )}
      </div>
    </main>
  );
}
