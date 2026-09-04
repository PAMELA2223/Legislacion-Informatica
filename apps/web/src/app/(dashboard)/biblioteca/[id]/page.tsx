import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaLibraryRepository } from "@/modules/library/infrastructure/prisma-library.repository";
import { ObtenerDocumentoUseCase } from "@/modules/library/application/library.use-cases";
import { ETIQUETAS_CATEGORIA } from "@/modules/library/domain/library.entity";
import { DocumentActions } from "@/modules/library/presentation/document-actions";

export default async function DocumentoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaLibraryRepository(prisma);
  const useCase = new ObtenerDocumentoUseCase(repo);

  let documento;
  try {
    documento = await useCase.execute(id);
  } catch {
    notFound();
  }

  const favorito = await prisma.favorite.findUnique({
    where: { userId_documentId: { userId: user.id, documentId: documento.id } },
  });

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
        {ETIQUETAS_CATEGORIA[documento.categoria]}
      </span>
      <h1 className="text-2xl font-bold text-foreground mt-3 mb-4">{documento.titulo}</h1>

      <div className="mb-8">
        <DocumentActions
          documentId={documento.id}
          archivoUrl={documento.archivoUrl}
          esFavoritoInicial={Boolean(favorito)}
          descargasIniciales={documento.descargas}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden mb-8">
        <div className="aspect-[4/3] flex items-center justify-center bg-foreground/5 text-muted-foreground text-sm">
          {documento.archivoUrl ? (
            <iframe src={documento.archivoUrl} className="w-full h-full" title={documento.titulo} />
          ) : (
            "Documento PDF pendiente de cargar en Supabase Storage"
          )}
        </div>
      </div>

      <h2 className="font-semibold text-foreground mb-4">Consulta por artículos</h2>
      <div className="flex flex-col gap-3">
        {documento.articulos.map((articulo) => (
          <details
            key={articulo.id}
            id={`articulo-${articulo.id}`}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <summary className="cursor-pointer font-medium text-foreground">
              {articulo.numero} — {articulo.titulo}
            </summary>
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
              {articulo.texto}
            </p>
          </details>
        ))}
        {documento.articulos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Este documento aún no tiene artículos indexados individualmente.
          </p>
        )}
      </div>
    </main>
  );
}
