import type { PrismaClient } from "@prisma/client";
import type { INewsRepository } from "../domain/news-repository.interface";
import type { News } from "../domain/news.entity";

export class PrismaNewsRepository implements INewsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarNoticias(): Promise<News[]> {
    const noticias = await this.prisma.news.findMany({ orderBy: { fechaPublicacion: "desc" } });
    return noticias.map((n) => ({ ...n, fechaPublicacion: n.fechaPublicacion.toISOString() }));
  }

  async obtenerNoticia(id: string): Promise<News | null> {
    const noticia = await this.prisma.news.findUnique({ where: { id } });
    if (!noticia) return null;
    return { ...noticia, fechaPublicacion: noticia.fechaPublicacion.toISOString() };
  }
}
