import type { PrismaClient, Rol } from "@prisma/client";
import { registrarLog } from "@/lib/audit-log";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { IAdminRepository } from "../domain/admin-repository.interface";
import type {
  AdminCaseStudyRow,
  AdminCourseRow,
  AdminEvaluationRow,
  AdminForumThreadRow,
  AdminGlossaryRow,
  AdminLibraryRow,
  AdminNewsRow,
  AdminUserRow,
  AuditLogEntry,
} from "../domain/admin.entity";

export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------- Usuarios y roles ----------

  async listarUsuarios(): Promise<AdminUserRow[]> {
    const usuarios = await this.prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      xp: u.xp,
      nivel: u.nivel,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async cambiarRolUsuario(actorId: string, userId: string, rol: Rol): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { rol } });

    // CRÍTICO: el middleware protege rutas leyendo el metadata de Supabase
    // Auth (el JWT de sesión), no la tabla de Prisma. Sin este paso, el
    // cambio de rol no otorgaría acceso real a /admin ni /docente.
    const supabaseAdmin = createSupabaseAdminClient();
    if (supabaseAdmin) {
      const { data: existente } = await supabaseAdmin.auth.admin.getUserById(userId);
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { ...existente?.user?.user_metadata, rol },
      });
    } else {
      console.warn(
        "[admin] SUPABASE_SERVICE_ROLE_KEY no configurada: el rol se actualizó " +
          "en Prisma pero NO en Supabase Auth. El middleware seguirá viendo el " +
          "rol anterior hasta que configures la service role key (ver .env.example)."
      );
    }

    await registrarLog(this.prisma, actorId, "CAMBIAR_ROL", "usuario", `Usuario ${userId} → ${rol}`);
  }

  async eliminarUsuario(actorId: string, userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "usuario", `Usuario ${userId}`);
  }

  // ---------- Logs ----------

  async listarLogs(limite = 50): Promise<AuditLogEntry[]> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { fecha: "desc" },
      take: limite,
      include: { user: true },
    });
    return logs.map((l) => ({
      id: l.id,
      usuarioNombre: l.user.nombre,
      accion: l.accion,
      entidad: l.entidad,
      detalle: l.detalle,
      fecha: l.fecha.toISOString(),
    }));
  }

  // ---------- Noticias ----------

  async listarNoticias(): Promise<AdminNewsRow[]> {
    const noticias = await this.prisma.news.findMany({ orderBy: { fechaPublicacion: "desc" } });
    return noticias.map((n) => ({ ...n, fechaPublicacion: n.fechaPublicacion.toISOString() }));
  }

  async obtenerNoticia(id: string): Promise<AdminNewsRow | null> {
    const noticia = await this.prisma.news.findUnique({ where: { id } });
    if (!noticia) return null;
    return { ...noticia, fechaPublicacion: noticia.fechaPublicacion.toISOString() };
  }

  async crearNoticia(actorId: string, data: Omit<AdminNewsRow, "id">): Promise<void> {
    await this.prisma.news.create({ data: { ...data, fechaPublicacion: new Date(data.fechaPublicacion) } });
    await registrarLog(this.prisma, actorId, "CREAR", "noticia", data.titulo);
  }

  async actualizarNoticia(actorId: string, id: string, data: Omit<AdminNewsRow, "id">): Promise<void> {
    await this.prisma.news.update({
      where: { id },
      data: { ...data, fechaPublicacion: new Date(data.fechaPublicacion) },
    });
    await registrarLog(this.prisma, actorId, "EDITAR", "noticia", data.titulo);
  }

  async eliminarNoticia(actorId: string, id: string): Promise<void> {
    await this.prisma.news.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "noticia", id);
  }

  // ---------- Glosario ----------

  async listarGlosario(): Promise<AdminGlossaryRow[]> {
    return this.prisma.glossaryTerm.findMany({ orderBy: { orden: "asc" } });
  }

  async obtenerTerminoGlosario(id: string): Promise<AdminGlossaryRow | null> {
    return this.prisma.glossaryTerm.findUnique({ where: { id } });
  }

  async crearTerminoGlosario(actorId: string, data: Omit<AdminGlossaryRow, "id">): Promise<void> {
    await this.prisma.glossaryTerm.create({ data });
    await registrarLog(this.prisma, actorId, "CREAR", "termino_glosario", data.termino);
  }

  async actualizarTerminoGlosario(actorId: string, id: string, data: Omit<AdminGlossaryRow, "id">): Promise<void> {
    await this.prisma.glossaryTerm.update({ where: { id }, data });
    await registrarLog(this.prisma, actorId, "EDITAR", "termino_glosario", data.termino);
  }

  async eliminarTerminoGlosario(actorId: string, id: string): Promise<void> {
    await this.prisma.glossaryTerm.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "termino_glosario", id);
  }

  // ---------- Biblioteca ----------

  async listarBiblioteca(): Promise<AdminLibraryRow[]> {
    const docs = await this.prisma.libraryDocument.findMany({ orderBy: { titulo: "asc" } });
    return docs.map((d) => ({
      id: d.id,
      titulo: d.titulo,
      categoria: d.categoria,
      tags: d.tags,
      descargas: d.descargas,
    }));
  }

  async crearDocumentoBiblioteca(
    actorId: string,
    data: { titulo: string; categoria: string; tags: string[]; contenido: string; archivoUrl?: string }
  ): Promise<void> {
    await this.prisma.libraryDocument.create({
      data: {
        titulo: data.titulo,
        categoria: data.categoria as never,
        tags: data.tags,
        contenido: data.contenido,
        archivoUrl: data.archivoUrl,
      },
    });
    await registrarLog(this.prisma, actorId, "CREAR", "documento_biblioteca", data.titulo);
  }

  async eliminarDocumentoBiblioteca(actorId: string, id: string): Promise<void> {
    await this.prisma.libraryDocument.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "documento_biblioteca", id);
  }

  // ---------- Cursos, evaluaciones y casos ----------

  async listarCursos(): Promise<AdminCourseRow[]> {
    const cursos = await this.prisma.course.findMany({
      orderBy: { orden: "asc" },
      include: { _count: { select: { lessons: true, enrollments: true } } },
    });
    return cursos.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      numero: c.numero,
      totalLecciones: c._count.lessons,
      totalInscritos: c._count.enrollments,
    }));
  }

  async listarEvaluaciones(): Promise<AdminEvaluationRow[]> {
    const evaluaciones = await this.prisma.evaluation.findMany({
      include: { _count: { select: { preguntas: true, intentos: true } } },
    });
    return evaluaciones.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      totalPreguntas: e._count.preguntas,
      totalIntentos: e._count.intentos,
    }));
  }

  async eliminarEvaluacion(actorId: string, id: string): Promise<void> {
    await this.prisma.evaluation.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "evaluacion", id);
  }

  async listarCasos(): Promise<AdminCaseStudyRow[]> {
    const casos = await this.prisma.caseStudy.findMany({
      include: { _count: { select: { intentos: true } } },
    });
    return casos.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      categoria: c.categoria,
      totalIntentos: c._count.intentos,
    }));
  }

  async eliminarCaso(actorId: string, id: string): Promise<void> {
    await this.prisma.caseStudy.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "caso_practico", id);
  }

  // ---------- Foro ----------

  async listarHilosForo(): Promise<AdminForumThreadRow[]> {
    const hilos = await this.prisma.forumThread.findMany({
      include: { autor: true, _count: { select: { posts: true } } },
      orderBy: { createdAt: "desc" },
    });
    return hilos.map((h) => ({
      id: h.id,
      titulo: h.titulo,
      autorNombre: h.autor.nombre,
      totalPosts: h._count.posts,
      createdAt: h.createdAt.toISOString(),
    }));
  }

  async eliminarHiloForo(actorId: string, id: string): Promise<void> {
    await this.prisma.forumThread.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "hilo_foro", id);
  }
}
