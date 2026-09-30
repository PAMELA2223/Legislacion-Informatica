// Búsqueda de contenido para el chatbot con la búsqueda de texto completo de
// PostgreSQL (configuración 'spanish'), igual que el buscador global
// existente. A diferencia de él, los términos se combinan con OR ("|") para
// que una pregunta en lenguaje natural encuentre coincidencias parciales.

import type { PrismaClient } from "@prisma/client";
import type { IChatContextRepository } from "../domain/chatbot-ports.interface";
import type { ContextoPagina, FragmentoContexto } from "../domain/chatbot.entity";
import { LIMITES_CHAT } from "../domain/chatbot.entity";

// Caché breve de enunciados de evaluación (cambian poco; evita una consulta por mensaje).
let cacheEnunciados: { hasta: number; valores: string[] } | null = null;

type Fila = { titulo: string; texto: string | null; url: string; rank: number };

export class PrismaChatContextRepository implements IChatContextRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarFragmentos(terminos: string[]): Promise<FragmentoContexto[]> {
    // Solo letras/dígitos: los términos se pasan como parámetro, pero se
    // sanean igualmente para que to_tsquery no falle por sintaxis.
    const limpios = terminos.map((t) => t.replace(/[^a-záéíóúüñ0-9]/gi, "")).filter((t) => t.length >= 3);
    if (limpios.length === 0) return [];
    const q = limpios.join(" | ");

    const consultar = async (tipo: FragmentoContexto["tipo"], sql: Promise<Fila[]>) =>
      (await sql.catch(() => [] as Fila[])).map((f) => ({ ...f, tipo }));

    const resultados = await Promise.all([
      consultar(
        "LECCION",
        this.prisma.$queryRaw<Fila[]>`
          SELECT l.titulo, l.contenido AS texto, '/modulos/' || c.slug AS url,
                 ts_rank(to_tsvector('spanish', l.titulo || ' ' || coalesce(l.contenido, '')), to_tsquery('spanish', ${q})) AS rank
          FROM lessons l JOIN courses c ON c.id = l.course_id
          WHERE c.activo = true AND c.eliminado_en IS NULL AND l.contenido IS NOT NULL
            AND to_tsvector('spanish', l.titulo || ' ' || coalesce(l.contenido, '')) @@ to_tsquery('spanish', ${q})
          ORDER BY rank DESC LIMIT 4`
      ),
      consultar(
        "MODULO",
        this.prisma.$queryRaw<Fila[]>`
          SELECT titulo, descripcion || ' ' || resumen AS texto, '/modulos/' || slug AS url,
                 ts_rank(to_tsvector('spanish', titulo || ' ' || descripcion || ' ' || resumen), to_tsquery('spanish', ${q})) AS rank
          FROM courses
          WHERE activo = true AND eliminado_en IS NULL
            AND to_tsvector('spanish', titulo || ' ' || descripcion || ' ' || resumen) @@ to_tsquery('spanish', ${q})
          ORDER BY rank DESC LIMIT 2`
      ),
      consultar(
        "GLOSARIO",
        this.prisma.$queryRaw<Fila[]>`
          SELECT termino AS titulo, definicion AS texto, '/glosario?q=' || termino AS url,
                 ts_rank(to_tsvector('spanish', termino || ' ' || definicion), to_tsquery('spanish', ${q})) * 1.2 AS rank
          FROM glossary_terms
          WHERE to_tsvector('spanish', termino || ' ' || definicion) @@ to_tsquery('spanish', ${q})
          ORDER BY rank DESC LIMIT 3`
      ),
      consultar(
        "FAQ",
        this.prisma.$queryRaw<Fila[]>`
          SELECT pregunta AS titulo, respuesta AS texto, '/preguntas-frecuentes' AS url,
                 ts_rank(to_tsvector('spanish', pregunta || ' ' || respuesta), to_tsquery('spanish', ${q})) AS rank
          FROM faq_items
          WHERE publicado = true
            AND to_tsvector('spanish', pregunta || ' ' || respuesta) @@ to_tsquery('spanish', ${q})
          ORDER BY rank DESC LIMIT 3`
      ),
      consultar(
        "ARTICULO",
        this.prisma.$queryRaw<Fila[]>`
          SELECT d.titulo || ' — ' || a.numero || ': ' || a.titulo AS titulo, a.texto, '/biblioteca/' || a.document_id AS url,
                 ts_rank(to_tsvector('spanish', a.numero || ' ' || a.titulo || ' ' || a.texto), to_tsquery('spanish', ${q})) AS rank
          FROM library_articles a JOIN library_documents d ON d.id = a.document_id
          WHERE to_tsvector('spanish', a.numero || ' ' || a.titulo || ' ' || a.texto) @@ to_tsquery('spanish', ${q})
          ORDER BY rank DESC LIMIT 3`
      ),
      consultar(
        "CASO",
        this.prisma.$queryRaw<Fila[]>`
          SELECT titulo, escenario || ' Normativa: ' || normativa_aplicable AS texto, '/casos-practicos/' || id AS url,
                 ts_rank(to_tsvector('spanish', titulo || ' ' || escenario), to_tsquery('spanish', ${q})) AS rank
          FROM case_studies
          WHERE to_tsvector('spanish', titulo || ' ' || escenario) @@ to_tsquery('spanish', ${q})
          ORDER BY rank DESC LIMIT 2`
      ),
    ]);

    return resultados
      .flat()
      .filter((f) => f.texto)
      .sort((a, b) => Number(b.rank) - Number(a.rank))
      .map(({ tipo, titulo, texto, url }) => ({ tipo, titulo, texto: texto ?? "", url }));
  }

  async describirPagina(ruta: string | null): Promise<ContextoPagina | null> {
    if (!ruta) return null;

    const eval_ = ruta.match(/^\/evaluaciones\/([\w-]+)/);
    if (eval_) {
      const ev = await this.prisma.evaluation.findUnique({
        where: { id: eval_[1] },
        select: { course: { select: { titulo: true, descripcion: true, eliminadoEn: true } } },
      });
      if (!ev?.course || ev.course.eliminadoEn) return null;
      return { tipo: "evaluacion", titulo: ev.course.titulo, descripcion: ev.course.descripcion, extracto: "" };
    }

    const m = ruta.match(/^\/modulos\/([a-z0-9-]+)/i);
    if (!m) return null;
    const curso = await this.prisma.course.findUnique({
      where: { slug: m[1] },
      select: {
        titulo: true,
        descripcion: true,
        resumen: true,
        activo: true,
        eliminadoEn: true,
        lessons: { where: { tipo: "TEXTO" }, orderBy: { orden: "asc" }, select: { titulo: true, contenido: true } },
      },
    });
    if (!curso?.activo || curso.eliminadoEn) return null;
    const extracto = [curso.resumen, ...curso.lessons.map((l) => `${l.titulo}: ${l.contenido ?? ""}`)]
      .filter(Boolean)
      .join("\n")
      .slice(0, LIMITES_CHAT.maxCaracteresExtractoModulo);
    return { tipo: "modulo", titulo: curso.titulo, descripcion: curso.descripcion, extracto };
  }

  async enunciadosDeEvaluaciones(): Promise<string[]> {
    if (cacheEnunciados && cacheEnunciados.hasta > Date.now()) return cacheEnunciados.valores;
    const preguntas = await this.prisma.question
      .findMany({ where: { activo: true }, select: { enunciado: true } })
      .catch(() => [] as { enunciado: string }[]);
    cacheEnunciados = { hasta: Date.now() + 5 * 60 * 1000, valores: preguntas.map((p) => p.enunciado) };
    return cacheEnunciados.valores;
  }
}
