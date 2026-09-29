import type { PrismaClient, FeaturedContent } from "@prisma/client";
import { registrarLog } from "@/lib/audit-log";
import type { IFeaturedRepository } from "../domain/featured-repository.interface";
import type { DatosDestacado, FeaturedItem, TipoDestacado } from "../domain/featured.entity";

type ConCurso = FeaturedContent & { course?: { titulo: string } | null };

function mapear(f: ConCurso): FeaturedItem {
  return {
    id: f.id,
    titulo: f.titulo,
    descripcion: f.descripcion,
    tipo: f.tipo as TipoDestacado,
    url: f.url,
    imagenUrl: f.imagenUrl,
    fuente: f.fuente,
    courseId: f.courseId,
    cursoTitulo: f.course?.titulo ?? null,
    origen: f.origen,
    orden: f.orden,
    activo: f.activo,
  };
}

export class PrismaFeaturedRepository implements IFeaturedRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarActivos() {
    const items = await this.prisma.featuredContent.findMany({
      where: { activo: true },
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      include: { course: { select: { titulo: true } } },
    });
    return items.map(mapear);
  }

  async listarTodos() {
    const items = await this.prisma.featuredContent.findMany({
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      include: { course: { select: { titulo: true } } },
    });
    return items.map(mapear);
  }

  async obtener(id: string) {
    const f = await this.prisma.featuredContent.findUnique({ where: { id }, include: { course: { select: { titulo: true } } } });
    return f ? mapear(f) : null;
  }

  async crear(actorId: string, data: DatosDestacado) {
    const f = await this.prisma.featuredContent.create({ data });
    await registrarLog(this.prisma, actorId, "CREAR", "destacado", f.id);
  }

  async actualizar(actorId: string, id: string, data: DatosDestacado) {
    await this.prisma.featuredContent.update({ where: { id }, data });
    await registrarLog(this.prisma, actorId, "EDITAR", "destacado", id);
  }

  async eliminar(actorId: string, id: string) {
    await this.prisma.featuredContent.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "destacado", id);
  }

  async importarRecursosAntiguos(actorId: string) {
    const [videos, infografias, yaImportados] = await Promise.all([
      this.prisma.videoResource.findMany(),
      this.prisma.infographic.findMany(),
      this.prisma.featuredContent.findMany({ where: { origen: { not: null } }, select: { origen: true } }),
    ]);
    const existentes = new Set(yaImportados.map((x) => x.origen));

    const nuevos = [
      ...videos.map((v) => ({ origen: `video:${v.id}`, tipo: "VIDEO", r: v })),
      ...infografias.map((i) => ({ origen: `infografia:${i.id}`, tipo: "INFOGRAFIA", r: i })),
    ].filter((x) => !existentes.has(x.origen));

    if (nuevos.length > 0) {
      await this.prisma.featuredContent.createMany({
        data: nuevos.map(({ origen, tipo, r }) => ({
          origen,
          tipo,
          titulo: r.titulo,
          descripcion: r.descripcion,
          url: r.url,
          fuente: r.fuente,
          activo: r.publicado,
        })),
        skipDuplicates: true,
      });
      await registrarLog(this.prisma, actorId, "CREAR", "destacado", `Importados ${nuevos.length} recursos antiguos`);
    }
    return { importados: nuevos.length };
  }
}
