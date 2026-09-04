// Capa de INFRAESTRUCTURA: implementa la búsqueda transversal actual
// (Documento, Artículo, Módulo). Al construirse las Fases 6 y 8, se agregan
// aquí las consultas a CASE_STUDY, GLOSSARY_TERM y NEWS sin romper el contrato.

import type { PrismaClient } from "@prisma/client";
import type { ISearchRepository } from "../domain/search-repository.interface";
import type { ResultadoBusqueda } from "../domain/search.entity";

export class PrismaSearchRepository implements ISearchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarGlobal(query: string): Promise<ResultadoBusqueda[]> {
    const [documentos, articulos, modulos, casos, glosario, noticias] = await Promise.all([
      this.prisma.$queryRaw<{ id: string; titulo: string; contenido: string }[]>`
        SELECT id, titulo, contenido FROM library_documents
        WHERE to_tsvector('spanish', titulo || ' ' || contenido)
              @@ plainto_tsquery('spanish', ${query})
        LIMIT 8
      `,
      this.prisma.$queryRaw<
        { id: string; numero: string; titulo: string; texto: string; document_id: string }[]
      >`
        SELECT id, numero, titulo, texto, document_id FROM library_articles
        WHERE to_tsvector('spanish', numero || ' ' || titulo || ' ' || texto)
              @@ plainto_tsquery('spanish', ${query})
        LIMIT 8
      `,
      this.prisma.$queryRaw<{ id: string; slug: string; titulo: string; descripcion: string }[]>`
        SELECT id, slug, titulo, descripcion FROM courses
        WHERE to_tsvector('spanish', titulo || ' ' || descripcion)
              @@ plainto_tsquery('spanish', ${query})
        LIMIT 8
      `,
      this.prisma.$queryRaw<{ id: string; titulo: string; escenario: string }[]>`
        SELECT id, titulo, escenario FROM case_studies
        WHERE to_tsvector('spanish', titulo || ' ' || escenario)
              @@ plainto_tsquery('spanish', ${query})
        LIMIT 8
      `,
      this.prisma.$queryRaw<{ id: string; termino: string; definicion: string }[]>`
        SELECT id, termino, definicion FROM glossary_terms
        WHERE to_tsvector('spanish', termino || ' ' || definicion)
              @@ plainto_tsquery('spanish', ${query})
        LIMIT 8
      `,
      this.prisma.$queryRaw<{ id: string; titulo: string; resumen: string }[]>`
        SELECT id, titulo, resumen FROM news
        WHERE to_tsvector('spanish', titulo || ' ' || resumen)
              @@ plainto_tsquery('spanish', ${query})
        LIMIT 8
      `,
    ]);

    const resultados: ResultadoBusqueda[] = [
      ...documentos.map((d) => ({
        tipo: "DOCUMENTO" as const,
        id: d.id,
        titulo: d.titulo,
        extracto: d.contenido.slice(0, 140),
        url: `/biblioteca/${d.id}`,
      })),
      ...articulos.map((a) => ({
        tipo: "ARTICULO" as const,
        id: a.id,
        titulo: `${a.numero} — ${a.titulo}`,
        extracto: a.texto.slice(0, 140),
        url: `/biblioteca/${a.document_id}#articulo-${a.id}`,
      })),
      ...modulos.map((m) => ({
        tipo: "MODULO" as const,
        id: m.id,
        titulo: m.titulo,
        extracto: m.descripcion.slice(0, 140),
        url: `/modulos/${m.slug}`,
      })),
      ...casos.map((c) => ({
        tipo: "CASO_PRACTICO" as const,
        id: c.id,
        titulo: c.titulo,
        extracto: c.escenario.slice(0, 140),
        url: `/casos-practicos/${c.id}`,
      })),
      ...glosario.map((g) => ({
        tipo: "GLOSARIO" as const,
        id: g.id,
        titulo: g.termino,
        extracto: g.definicion.slice(0, 140),
        url: `/glosario?q=${encodeURIComponent(g.termino)}`,
      })),
      ...noticias.map((n) => ({
        tipo: "NOTICIA" as const,
        id: n.id,
        titulo: n.titulo,
        extracto: n.resumen.slice(0, 140),
        url: `/noticias/${n.id}`,
      })),
    ];

    return resultados;
  }
}
