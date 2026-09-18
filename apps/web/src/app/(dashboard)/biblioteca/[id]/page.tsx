import { notFound, redirect } from "next/navigation";
import { ExternalLink, FileText } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaLibraryRepository } from "@/modules/library/infrastructure/prisma-library.repository";
import { ObtenerDocumentoUseCase } from "@/modules/library/application/library.use-cases";
import { ETIQUETAS_CATEGORIA, LibraryRules } from "@/modules/library/domain/library.entity";
import { DocumentActions } from "@/modules/library/presentation/document-actions";
import { EstadoNormaBadge } from "@/modules/library/presentation/estado-norma-badge";

function formatearFecha(iso?: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });
}

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

  const tieneFuente = LibraryRules.tieneFuenteVerificada(documento);
  const textoCompletoUrl = documento.archivoUrl || documento.enlaceOficial;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
          {ETIQUETAS_CATEGORIA[documento.categoria]}
        </span>
        <EstadoNormaBadge estado={documento.estado} />
      </div>
      <h1 className="text-2xl font-bold text-foreground mt-3 mb-1">{documento.titulo}</h1>
      <p className="text-xs text-muted-foreground mb-4">
        Última actualización del registro: {formatearFecha(documento.updatedAt)}
      </p>

      <div className="mb-6">
        <DocumentActions
          documentId={documento.id}
          archivoUrl={documento.archivoUrl}
          esFavoritoInicial={Boolean(favorito)}
          descargasIniciales={documento.descargas}
        />
      </div>

      {/* Ficha de fuente oficial (Sección 4 del pedido de ampliación) */}
      <div className="rounded-2xl border border-border bg-surface p-5 mb-8">
        <h2 className="font-semibold text-foreground mb-3 text-sm">Fuente oficial</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {documento.numeroIdentificacion && (
            <div>
              <dt className="text-xs text-muted-foreground">Número / identificación</dt>
              <dd className="text-foreground">{documento.numeroIdentificacion}</dd>
            </div>
          )}
          {documento.pais && (
            <div>
              <dt className="text-xs text-muted-foreground">País</dt>
              <dd className="text-foreground">{documento.pais}</dd>
            </div>
          )}
          {documento.institucionEmisora && (
            <div>
              <dt className="text-xs text-muted-foreground">Institución emisora</dt>
              <dd className="text-foreground">{documento.institucionEmisora}</dd>
            </div>
          )}
          {documento.fechaEmision && (
            <div>
              <dt className="text-xs text-muted-foreground">Fecha de emisión</dt>
              <dd className="text-foreground">{formatearFecha(documento.fechaEmision)}</dd>
            </div>
          )}
          {documento.fechaReforma && (
            <div>
              <dt className="text-xs text-muted-foreground">Fecha de reforma</dt>
              <dd className="text-foreground">{formatearFecha(documento.fechaReforma)}</dd>
            </div>
          )}
        </dl>

        {tieneFuente ? (
          <a
            href={documento.enlaceOficial!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-4"
          >
            <ExternalLink className="w-4 h-4" />
            Fuente: {documento.fuenteOficial}
          </a>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-4">
            Esta norma todavía no tiene una fuente oficial verificada — requiere revisión administrativa.
          </p>
        )}

        {textoCompletoUrl && (
          <a
            href={textoCompletoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground bg-background-secondary hover:bg-border rounded-xl px-4 py-2 mt-4 ml-0 sm:ml-3"
          >
            <FileText className="w-4 h-4" />
            Ver texto completo
          </a>
        )}
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
