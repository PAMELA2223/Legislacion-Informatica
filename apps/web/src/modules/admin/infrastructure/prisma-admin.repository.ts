import type { PrismaClient, Prisma, Rol } from "@prisma/client";
import { registrarLog } from "@/lib/audit-log";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { DatosDocumentoBiblioteca, IAdminRepository } from "../domain/admin-repository.interface";
import type {
  AdminCaseStudyRow,
  AdminCourseRow,
  AdminEvaluationRow,
  AdminEvaluationDetailRow,
  DatosPregunta,
  AdminFaqRow,
  AdminForumThreadRow,
  AdminGlossaryRow,
  AdminInfographicRow,
  AdminInternationalReferenceRow,
  AdminJurisprudenceRow,
  AdminLibraryRow,
  AdminNewsRow,
  AdminUserRow,
  AdminVideoRow,
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
    // cambio de rol no otorgaría acceso real a /admin.
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

  // ---------- Biblioteca / normas ----------

  async listarBiblioteca(): Promise<AdminLibraryRow[]> {
    const docs = await this.prisma.libraryDocument.findMany({ orderBy: { titulo: "asc" } });
    return docs.map((d) => this.aFilaAdmin(d));
  }

  async obtenerDocumentoBiblioteca(id: string): Promise<AdminLibraryRow | null> {
    const doc = await this.prisma.libraryDocument.findUnique({ where: { id } });
    return doc ? this.aFilaAdmin(doc) : null;
  }

  private aFilaAdmin(d: {
    id: string;
    titulo: string;
    categoria: string;
    tags: string[];
    descargas: number;
    updatedAt: Date;
    archivoUrl: string | null;
    contenido: string;
    numeroIdentificacion: string | null;
    pais: string | null;
    institucionEmisora: string | null;
    fechaEmision: Date | null;
    fechaReforma: Date | null;
    estado: string;
    fuenteOficial: string | null;
    enlaceOficial: string | null;
  }): AdminLibraryRow {
    return {
      id: d.id,
      titulo: d.titulo,
      categoria: d.categoria,
      tags: d.tags,
      descargas: d.descargas,
      updatedAt: d.updatedAt.toISOString(),
      archivoUrl: d.archivoUrl,
      contenido: d.contenido,
      numeroIdentificacion: d.numeroIdentificacion,
      pais: d.pais,
      institucionEmisora: d.institucionEmisora,
      fechaEmision: d.fechaEmision?.toISOString() ?? null,
      fechaReforma: d.fechaReforma?.toISOString() ?? null,
      estado: d.estado,
      fuenteOficial: d.fuenteOficial,
      enlaceOficial: d.enlaceOficial,
    };
  }

  private datosParaPrisma(data: DatosDocumentoBiblioteca) {
    return {
      titulo: data.titulo,
      categoria: data.categoria as never,
      tags: data.tags,
      contenido: data.contenido,
      archivoUrl: data.archivoUrl || null,
      numeroIdentificacion: data.numeroIdentificacion || null,
      pais: data.pais || null,
      institucionEmisora: data.institucionEmisora || null,
      fechaEmision: data.fechaEmision ? new Date(data.fechaEmision) : null,
      fechaReforma: data.fechaReforma ? new Date(data.fechaReforma) : null,
      estado: (data.estado || "VIGENTE") as never,
      fuenteOficial: data.fuenteOficial || null,
      enlaceOficial: data.enlaceOficial || null,
    };
  }

  async crearDocumentoBiblioteca(actorId: string, data: DatosDocumentoBiblioteca): Promise<void> {
    await this.prisma.libraryDocument.create({ data: this.datosParaPrisma(data) });
    await registrarLog(this.prisma, actorId, "CREAR", "documento_biblioteca", data.titulo);
  }

  async actualizarDocumentoBiblioteca(
    actorId: string,
    id: string,
    data: DatosDocumentoBiblioteca
  ): Promise<void> {
    await this.prisma.libraryDocument.update({ where: { id }, data: this.datosParaPrisma(data) });
    await registrarLog(this.prisma, actorId, "EDITAR", "documento_biblioteca", data.titulo);
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

  async obtenerEvaluacionConPreguntas(id: string): Promise<AdminEvaluationDetailRow | null> {
    const evaluacion = await this.prisma.evaluation.findUnique({
      where: { id },
      include: { preguntas: { orderBy: { orden: "asc" } } },
    });
    if (!evaluacion) return null;
    return {
      id: evaluacion.id,
      titulo: evaluacion.titulo,
      tiempoLimite: evaluacion.tiempoLimite,
      preguntas: evaluacion.preguntas.map((p) => ({
        id: p.id,
        tipo: p.tipo,
        enunciado: p.enunciado,
      })),
    };
  }

  async eliminarEvaluacion(actorId: string, id: string): Promise<void> {
    await this.prisma.evaluation.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "evaluacion", id);
  }

  async crearPregunta(actorId: string, evaluationId: string, data: DatosPregunta): Promise<void> {
    const totalActual = await this.prisma.question.count({ where: { evaluationId } });
    const pregunta = await this.prisma.question.create({
      data: {
        evaluationId,
        tipo: data.tipo,
        enunciado: data.enunciado,
        opciones: data.opciones as Prisma.InputJsonValue,
        respuestaCorrecta: data.respuestaCorrecta as Prisma.InputJsonValue,
        retroalimentacion: data.retroalimentacion,
        puntaje: data.puntaje,
        orden: totalActual + 1,
      },
    });
    await registrarLog(this.prisma, actorId, "CREAR", "pregunta", pregunta.id);
  }

  async eliminarPregunta(actorId: string, id: string): Promise<void> {
    await this.prisma.question.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "pregunta", id);
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

  // ---------- FAQ ----------

  async listarFaq(): Promise<AdminFaqRow[]> {
    return this.prisma.faqItem.findMany({ orderBy: [{ categoria: "asc" }, { orden: "asc" }] });
  }

  async obtenerPreguntaFaq(id: string): Promise<AdminFaqRow | null> {
    return this.prisma.faqItem.findUnique({ where: { id } });
  }

  async crearPreguntaFaq(actorId: string, data: Omit<AdminFaqRow, "id">): Promise<void> {
    await this.prisma.faqItem.create({ data });
    await registrarLog(this.prisma, actorId, "CREAR", "pregunta_faq", data.pregunta);
  }

  async actualizarPreguntaFaq(actorId: string, id: string, data: Omit<AdminFaqRow, "id">): Promise<void> {
    await this.prisma.faqItem.update({ where: { id }, data });
    await registrarLog(this.prisma, actorId, "EDITAR", "pregunta_faq", data.pregunta);
  }

  async eliminarPreguntaFaq(actorId: string, id: string): Promise<void> {
    await this.prisma.faqItem.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "pregunta_faq", id);
  }

  // ---------- Jurisprudencia ----------

  async listarJurisprudencia(): Promise<AdminJurisprudenceRow[]> {
    return this.prisma.jurisprudenceCase.findMany({ orderBy: { anio: "desc" } });
  }

  async obtenerCasoJurisprudencia(id: string): Promise<AdminJurisprudenceRow | null> {
    return this.prisma.jurisprudenceCase.findUnique({ where: { id } });
  }

  async crearCasoJurisprudencia(actorId: string, data: Omit<AdminJurisprudenceRow, "id">): Promise<void> {
    await this.prisma.jurisprudenceCase.create({ data: { ...data, enlaceOficial: data.enlaceOficial || null } });
    await registrarLog(this.prisma, actorId, "CREAR", "caso_jurisprudencia", data.nombreCaso);
  }

  async actualizarCasoJurisprudencia(
    actorId: string,
    id: string,
    data: Omit<AdminJurisprudenceRow, "id">
  ): Promise<void> {
    await this.prisma.jurisprudenceCase.update({
      where: { id },
      data: { ...data, enlaceOficial: data.enlaceOficial || null },
    });
    await registrarLog(this.prisma, actorId, "EDITAR", "caso_jurisprudencia", data.nombreCaso);
  }

  async eliminarCasoJurisprudencia(actorId: string, id: string): Promise<void> {
    await this.prisma.jurisprudenceCase.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "caso_jurisprudencia", id);
  }

  // ---------- Videos ----------

  async listarVideos(): Promise<AdminVideoRow[]> {
    return this.prisma.videoResource.findMany({ orderBy: { createdAt: "desc" } });
  }

  async obtenerVideo(id: string): Promise<AdminVideoRow | null> {
    return this.prisma.videoResource.findUnique({ where: { id } });
  }

  async crearVideo(actorId: string, data: Omit<AdminVideoRow, "id">): Promise<void> {
    await this.prisma.videoResource.create({ data });
    await registrarLog(this.prisma, actorId, "CREAR", "video", data.titulo);
  }

  async actualizarVideo(actorId: string, id: string, data: Omit<AdminVideoRow, "id">): Promise<void> {
    await this.prisma.videoResource.update({ where: { id }, data });
    await registrarLog(this.prisma, actorId, "EDITAR", "video", data.titulo);
  }

  async eliminarVideo(actorId: string, id: string): Promise<void> {
    await this.prisma.videoResource.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "video", id);
  }

  // ---------- Infografías ----------

  async listarInfografias(): Promise<AdminInfographicRow[]> {
    return this.prisma.infographic.findMany({ orderBy: { createdAt: "desc" } });
  }

  async obtenerInfografia(id: string): Promise<AdminInfographicRow | null> {
    return this.prisma.infographic.findUnique({ where: { id } });
  }

  async crearInfografia(actorId: string, data: Omit<AdminInfographicRow, "id">): Promise<void> {
    await this.prisma.infographic.create({ data });
    await registrarLog(this.prisma, actorId, "CREAR", "infografia", data.titulo);
  }

  async actualizarInfografia(actorId: string, id: string, data: Omit<AdminInfographicRow, "id">): Promise<void> {
    await this.prisma.infographic.update({ where: { id }, data });
    await registrarLog(this.prisma, actorId, "EDITAR", "infografia", data.titulo);
  }

  async eliminarInfografia(actorId: string, id: string): Promise<void> {
    await this.prisma.infographic.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "infografia", id);
  }

  // ---------- Referencias internacionales ----------

  async listarReferenciasInternacionales(): Promise<AdminInternationalReferenceRow[]> {
    return this.prisma.internationalReference.findMany({ orderBy: [{ categoria: "asc" }, { titulo: "asc" }] });
  }

  async obtenerReferenciaInternacional(id: string): Promise<AdminInternationalReferenceRow | null> {
    return this.prisma.internationalReference.findUnique({ where: { id } });
  }

  async crearReferenciaInternacional(
    actorId: string,
    data: Omit<AdminInternationalReferenceRow, "id">
  ): Promise<void> {
    await this.prisma.internationalReference.create({ data });
    await registrarLog(this.prisma, actorId, "CREAR", "referencia_internacional", data.titulo);
  }

  async actualizarReferenciaInternacional(
    actorId: string,
    id: string,
    data: Omit<AdminInternationalReferenceRow, "id">
  ): Promise<void> {
    await this.prisma.internationalReference.update({ where: { id }, data });
    await registrarLog(this.prisma, actorId, "EDITAR", "referencia_internacional", data.titulo);
  }

  async eliminarReferenciaInternacional(actorId: string, id: string): Promise<void> {
    await this.prisma.internationalReference.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "referencia_internacional", id);
  }
}
