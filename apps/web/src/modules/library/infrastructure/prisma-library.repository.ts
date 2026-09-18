// Capa de INFRAESTRUCTURA: Prisma para CRUD + PostgreSQL Full-Text Search
// (to_tsvector / plainto_tsquery) para el buscador, tal como se definió en la
// Fase 1 (Sección 9 — Buscador Inteligente), sin depender de servicios de pago.

import type { PrismaClient } from "@prisma/client";
import type { ILibraryRepository } from "../domain/library-repository.interface";
import type { CategoriaDocumento, LibraryDocument } from "../domain/library.entity";

// Prisma devuelve `Date | null` en los campos de fecha; el dominio trabaja
// con `string | null` (serializable a través de Server Components / JSON).
// Se mapea explícitamente en vez de castear a ciegas, para no arrastrar
// objetos Date sin serializar hacia la capa de presentación.
type DocumentoPrisma = {
  id: string;
  titulo: string;
  categoria: CategoriaDocumento;
  archivoUrl: string | null;
  tags: string[];
  contenido: string;
  descargas: number;
  updatedAt: Date;
  numeroIdentificacion: string | null;
  pais: string | null;
  institucionEmisora: string | null;
  fechaEmision: Date | null;
  fechaReforma: Date | null;
  estado: LibraryDocument["estado"];
  fuenteOficial: string | null;
  enlaceOficial: string | null;
  articulos: LibraryDocument["articulos"];
};

function aDocumentoDominio(d: DocumentoPrisma): LibraryDocument {
  return {
    id: d.id,
    titulo: d.titulo,
    categoria: d.categoria,
    archivoUrl: d.archivoUrl,
    tags: d.tags,
    contenido: d.contenido,
    descargas: d.descargas,
    updatedAt: d.updatedAt.toISOString(),
    numeroIdentificacion: d.numeroIdentificacion,
    pais: d.pais,
    institucionEmisora: d.institucionEmisora,
    fechaEmision: d.fechaEmision?.toISOString() ?? null,
    fechaReforma: d.fechaReforma?.toISOString() ?? null,
    estado: d.estado,
    fuenteOficial: d.fuenteOficial,
    enlaceOficial: d.enlaceOficial,
    articulos: d.articulos,
  };
}

export class PrismaLibraryRepository implements ILibraryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarDocumentos(filtro?: {
    categoria?: CategoriaDocumento;
    tag?: string;
  }): Promise<LibraryDocument[]> {
    const documentos = await this.prisma.libraryDocument.findMany({
      where: {
        categoria: filtro?.categoria,
        tags: filtro?.tag ? { has: filtro.tag } : undefined,
      },
      include: { articulos: { orderBy: { orden: "asc" } } },
      orderBy: { titulo: "asc" },
    });
    return (documentos as unknown as DocumentoPrisma[]).map(aDocumentoDominio);
  }

  async obtenerDocumentoPorId(id: string): Promise<LibraryDocument | null> {
    const doc = await this.prisma.libraryDocument.findUnique({
      where: { id },
      include: { articulos: { orderBy: { orden: "asc" } } },
    });
    return doc ? aDocumentoDominio(doc as unknown as DocumentoPrisma) : null;
  }

  async buscarPorTexto(query: string): Promise<LibraryDocument[]> {
    // Full-Text Search nativo de PostgreSQL (gratuito, sin Algolia/Elastic Cloud).
    // Requiere índice GIN opcional para rendimiento en producción:
    //   CREATE INDEX library_documents_fts_idx ON library_documents
    //   USING GIN (to_tsvector('spanish', titulo || ' ' || contenido));
    const filas = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM library_documents
      WHERE to_tsvector('spanish', titulo || ' ' || contenido) 
            @@ plainto_tsquery('spanish', ${query})
      ORDER BY ts_rank(
        to_tsvector('spanish', titulo || ' ' || contenido),
        plainto_tsquery('spanish', ${query})
      ) DESC
      LIMIT 20
    `;

    if (filas.length === 0) return [];

    const documentos = await this.prisma.libraryDocument.findMany({
      where: { id: { in: filas.map((f) => f.id) } },
      include: { articulos: { orderBy: { orden: "asc" } } },
    });

    // Se preserva el orden de relevancia devuelto por ts_rank
    const ordenIds = filas.map((f) => f.id);
    return (documentos as unknown as DocumentoPrisma[])
      .map(aDocumentoDominio)
      .sort((a, b) => ordenIds.indexOf(a.id) - ordenIds.indexOf(b.id));
  }

  async obtenerFavoritos(userId: string): Promise<string[]> {
    const favoritos = await this.prisma.favorite.findMany({
      where: { userId },
      select: { documentId: true },
    });
    return favoritos.map((f) => f.documentId);
  }

  async alternarFavorito(userId: string, documentId: string): Promise<boolean> {
    const existente = await this.prisma.favorite.findUnique({
      where: { userId_documentId: { userId, documentId } },
    });

    if (existente) {
      await this.prisma.favorite.delete({ where: { id: existente.id } });
      return false;
    }

    await this.prisma.favorite.create({ data: { userId, documentId } });
    return true;
  }

  async registrarDescarga(documentId: string): Promise<number> {
    const doc = await this.prisma.libraryDocument.update({
      where: { id: documentId },
      data: { descargas: { increment: 1 } },
    });
    return doc.descargas;
  }
}
