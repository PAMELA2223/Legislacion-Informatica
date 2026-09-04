import type { PrismaClient } from "@prisma/client";
import type { IForumRepository } from "../domain/forum-repository.interface";
import type { CategoriaForo, ForumThread, ForumThreadDetalle } from "../domain/forum.entity";

export class PrismaForumRepository implements IForumRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarHilos(categoria?: CategoriaForo): Promise<ForumThread[]> {
    const hilos = await this.prisma.forumThread.findMany({
      where: categoria ? { categoria } : undefined,
      include: { autor: true, _count: { select: { posts: true } } },
      orderBy: { createdAt: "desc" },
    });

    return hilos.map((h) => ({
      id: h.id,
      titulo: h.titulo,
      categoria: h.categoria,
      autorNombre: h.autor.nombre,
      createdAt: h.createdAt.toISOString(),
      totalPosts: h._count.posts,
    }));
  }

  async crearHilo(autorId: string, titulo: string, categoria: CategoriaForo): Promise<ForumThread> {
    const hilo = await this.prisma.forumThread.create({
      data: { autorId, titulo, categoria },
      include: { autor: true },
    });

    return {
      id: hilo.id,
      titulo: hilo.titulo,
      categoria: hilo.categoria,
      autorNombre: hilo.autor.nombre,
      createdAt: hilo.createdAt.toISOString(),
      totalPosts: 0,
    };
  }

  async obtenerHilo(id: string, userId: string): Promise<ForumThreadDetalle | null> {
    const hilo = await this.prisma.forumThread.findUnique({
      where: { id },
      include: {
        autor: true,
        posts: {
          orderBy: { createdAt: "asc" },
          include: { autor: true, reacciones: true },
        },
      },
    });
    if (!hilo) return null;

    return {
      id: hilo.id,
      titulo: hilo.titulo,
      categoria: hilo.categoria,
      autorNombre: hilo.autor.nombre,
      createdAt: hilo.createdAt.toISOString(),
      totalPosts: hilo.posts.length,
      posts: hilo.posts.map((p) => ({
        id: p.id,
        threadId: p.threadId,
        autorId: p.autorId,
        autorNombre: p.autor.nombre,
        contenido: p.contenido,
        createdAt: p.createdAt.toISOString(),
        totalReacciones: p.reacciones.length,
        yaReacciono: p.reacciones.some((r) => r.userId === userId),
      })),
    };
  }

  async crearComentario(threadId: string, autorId: string, contenido: string): Promise<void> {
    await this.prisma.forumPost.create({ data: { threadId, autorId, contenido } });
  }

  async alternarReaccion(postId: string, userId: string): Promise<boolean> {
    const existente = await this.prisma.forumReaction.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existente) {
      await this.prisma.forumReaction.delete({ where: { id: existente.id } });
      return false;
    }

    await this.prisma.forumReaction.create({ data: { postId, userId } });
    return true;
  }
}
