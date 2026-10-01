import { Prisma, type PrismaClient, type Rol } from "@prisma/client";
import { registrarLog } from "@/lib/audit-log";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";
import {
  decidirEliminacionModulo,
  mensajeEliminacionModulo,
  type ModoEliminacionModulo,
} from "../domain/module-deletion";
import { INFOGRAFIAS_INCLUIDAS, type DatosInfografia } from "../domain/infographic";
import type { EvaluacionModuloConIntentos, ModuloConResultados } from "../domain/admin-repository.interface";

/** "Protección de Datos" → "proteccion-de-datos" */
function generarSlug(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "modulo"
  );
}

const SELECT_EVAL_MODULO = {
  where: { tipo: TIPO_EVALUACION.MODULO },
  orderBy: [{ orden: "asc" as const }, { createdAt: "asc" as const }],
  take: 1,
};
import type { DatosDocumentoBiblioteca, IAdminRepository } from "../domain/admin-repository.interface";
import type {
  AdminCaseStudyRow,
  DatosCasoPractico,
  AdminCourseRow,
  AdminCourseDetailRow,
  DatosCurso,
  DatosLeccion,
  AdminModuleInfographicRow,
  AdminModuleInfographicsOverview,
  AdminEvaluationRow,
  AdminEvaluationDetailRow,
  DatosPregunta,
  DatosEvaluacion,
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
      where: { eliminadoEn: null },
      orderBy: [{ orden: "asc" }, { numero: "asc" }],
      include: {
        _count: { select: { lessons: true, enrollments: true } },
        evaluations: {
          ...SELECT_EVAL_MODULO,
          select: { id: true, _count: { select: { preguntas: { where: { activo: true } } } } },
        },
      },
    });
    return cursos.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      slug: c.slug,
      numero: c.numero,
      orden: c.orden,
      activo: c.activo,
      totalLecciones: c._count.lessons,
      totalInscritos: c._count.enrollments,
      evaluacion: c.evaluations[0]
        ? { id: c.evaluations[0].id, preguntasActivas: c.evaluations[0]._count.preguntas }
        : null,
    }));
  }

  async obtenerCursoConLecciones(id: string): Promise<AdminCourseDetailRow | null> {
    const curso = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { orden: "asc" } },
        evaluations: {
          ...SELECT_EVAL_MODULO,
          select: {
            id: true,
            titulo: true,
            _count: { select: { preguntas: true, intentos: true } },
            preguntas: { where: { activo: true }, select: { id: true } },
          },
        },
      },
    });
    if (!curso || curso.eliminadoEn) return null;
    const ev = curso.evaluations[0];
    return {
      id: curso.id,
      numero: curso.numero,
      slug: curso.slug,
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      resumen: curso.resumen,
      bibliografia: curso.bibliografia,
      propositoAcademico: curso.propositoAcademico,
      activo: curso.activo,
      lecciones: curso.lessons.map((l) => ({
        id: l.id,
        titulo: l.titulo,
        tipo: l.tipo,
        urlRecurso: l.urlRecurso,
        contenido: l.contenido,
        orden: l.orden,
      })),
      evaluacion: ev
        ? {
            id: ev.id,
            titulo: ev.titulo,
            totalPreguntas: ev._count.preguntas,
            preguntasActivas: ev.preguntas.length,
            totalIntentos: ev._count.intentos,
          }
        : null,
    };
  }

  private async slugDisponible(base: string, excluirId?: string): Promise<string> {
    let slug = generarSlug(base);
    for (let i = 2; ; i++) {
      const existente = await this.prisma.course.findUnique({ where: { slug }, select: { id: true } });
      if (!existente || existente.id === excluirId) return slug;
      slug = `${generarSlug(base)}-${i}`;
    }
  }

  async crearCurso(actorId: string, data: DatosCurso): Promise<{ id: string }> {
    const agg = await this.prisma.course.aggregate({ where: { eliminadoEn: null }, _max: { numero: true, orden: true } });
    const curso = await this.prisma.course.create({
      data: {
        titulo: data.titulo,
        slug: await this.slugDisponible(data.slug || data.titulo),
        descripcion: data.descripcion,
        resumen: data.resumen,
        bibliografia: data.bibliografia,
        propositoAcademico: data.propositoAcademico,
        numero: (agg._max.numero ?? 0) + 1,
        orden: (agg._max.orden ?? 0) + 1,
        // Un módulo nuevo no tiene contenido todavía: se crea inactivo y se
        // activa cuando el administrador le agrega lecciones.
        activo: false,
      },
    });
    await registrarLog(this.prisma, actorId, "CREAR", "modulo", curso.id);
    return { id: curso.id };
  }

  async actualizarCurso(actorId: string, id: string, data: DatosCurso): Promise<void> {
    if (data.activo) {
      const lecciones = await this.prisma.lesson.count({ where: { courseId: id } });
      if (lecciones === 0) {
        throw new Error("No se puede activar un módulo sin contenido. Agrega al menos una lección primero.");
      }
    }
    await this.prisma.course.update({
      where: { id },
      data: {
        titulo: data.titulo,
        ...(data.slug ? { slug: await this.slugDisponible(data.slug, id) } : {}),
        descripcion: data.descripcion,
        resumen: data.resumen,
        bibliografia: data.bibliografia,
        propositoAcademico: data.propositoAcademico,
        ...(data.activo !== undefined ? { activo: data.activo } : {}),
      },
    });
    await registrarLog(this.prisma, actorId, "EDITAR", "modulo", id);
  }

  async eliminarCurso(actorId: string, id: string): Promise<{ modo: ModoEliminacionModulo; mensaje: string }> {
    const curso = await this.prisma.course.findUnique({
      where: { id },
      select: { titulo: true, eliminadoEn: true, evaluations: { select: { id: true } } },
    });
    if (!curso || curso.eliminadoEn) throw new Error("El módulo no existe o ya fue eliminado.");

    const idsEval = curso.evaluations.map((e) => e.id);
    const [inscritos, intentosEvaluacion, leccionesCompletadas] = await Promise.all([
      this.prisma.enrollment.count({ where: { courseId: id } }),
      idsEval.length ? this.prisma.quizAttempt.count({ where: { evaluationId: { in: idsEval } } }) : 0,
      this.prisma.lessonProgress.count({ where: { lesson: { courseId: id } } }),
    ]);
    const datos = { inscritos, intentosEvaluacion, leccionesCompletadas };
    const modo = decidirEliminacionModulo(datos);

    if (modo === "fisica") {
      await this.prisma.$transaction([
        // Las preguntas se eliminan en cascada con cada evaluación (no hay intentos).
        this.prisma.evaluation.deleteMany({ where: { courseId: id } }),
        // Lecciones (contenido, videos, infografías) en cascada; destacados quedan sin módulo (SetNull).
        this.prisma.course.delete({ where: { id } }),
      ]);
    } else {
      // Eliminación lógica: se archiva. `numero` es único, así que se mueve a
      // un valor negativo libre para no bloquear la numeración de los demás.
      const agg = await this.prisma.course.aggregate({ _min: { numero: true } });
      const numeroArchivado = Math.min(0, agg._min.numero ?? 0) - 1;
      await this.prisma.$transaction([
        this.prisma.course.update({
          where: { id },
          data: { eliminadoEn: new Date(), activo: false, numero: numeroArchivado },
        }),
        // Un destacado que apuntaba al módulo dejaría un enlace roto.
        this.prisma.featuredContent.updateMany({ where: { courseId: id, tipo: "MODULO" }, data: { activo: false } }),
        this.prisma.featuredContent.updateMany({ where: { courseId: id }, data: { courseId: null } }),
      ]);
    }

    await this.renumerarModulos();
    await registrarLog(this.prisma, actorId, "ELIMINAR", "modulo", `${id} (${curso.titulo}) — eliminación ${modo}`);
    return { modo, mensaje: mensajeEliminacionModulo(curso.titulo, modo, datos) };
  }

  // ---------------- Infografías de los módulos ----------------

  async listarInfografiasDeModulos(): Promise<AdminModuleInfographicsOverview> {
    const [modulos, antiguas] = await Promise.all([
      this.prisma.course.findMany({
        where: { eliminadoEn: null },
        orderBy: [{ orden: "asc" }, { numero: "asc" }],
        select: {
          id: true,
          numero: true,
          titulo: true,
          activo: true,
          lessons: {
            where: { tipo: "INFOGRAFIA" },
            orderBy: { orden: "asc" },
            select: { id: true, titulo: true, contenido: true, urlRecurso: true, courseId: true },
          },
        },
      }),
      this.prisma.infographic.findMany({ orderBy: { createdAt: "asc" } }),
    ]);
    const urlsEnModulos = new Set(modulos.flatMap((m) => m.lessons.map((l) => l.urlRecurso).filter(Boolean)));
    const incluidasPendientes = modulos.filter(
      (m) => INFOGRAFIAS_INCLUIDAS[m.titulo] && !m.lessons.some((l) => l.urlRecurso === INFOGRAFIAS_INCLUIDAS[m.titulo])
    ).length;
    return {
      modulos: modulos.map((m) => ({
        id: m.id,
        numero: m.numero,
        titulo: m.titulo,
        activo: m.activo,
        infografias: m.lessons.map((l) => ({
          id: l.id,
          titulo: l.titulo,
          descripcion: l.contenido,
          urlImagen: l.urlRecurso,
          courseId: l.courseId,
        })),
      })),
      sinModulo: antiguas
        .filter((a) => !urlsEnModulos.has(a.url))
        .map((a) => ({ id: a.id, titulo: a.titulo, descripcion: a.descripcion, url: a.url, fuente: a.fuente })),
      incluidasPendientes,
    };
  }

  async obtenerInfografiaDeModulo(id: string): Promise<AdminModuleInfographicRow | null> {
    const l = await this.prisma.lesson.findUnique({
      where: { id },
      select: { id: true, titulo: true, contenido: true, urlRecurso: true, courseId: true, tipo: true },
    });
    if (!l || l.tipo !== "INFOGRAFIA") return null;
    return { id: l.id, titulo: l.titulo, descripcion: l.contenido, urlImagen: l.urlRecurso, courseId: l.courseId };
  }

  private async siguienteOrdenLeccion(courseId: string) {
    const agg = await this.prisma.lesson.aggregate({ where: { courseId }, _max: { orden: true } });
    return (agg._max.orden ?? 0) + 1;
  }

  async guardarInfografiaDeModulo(actorId: string, id: string | null, data: DatosInfografia): Promise<{ id: string }> {
    const curso = await this.prisma.course.findUnique({ where: { id: data.courseId }, select: { eliminadoEn: true } });
    if (!curso || curso.eliminadoEn) throw new Error("El módulo seleccionado no existe.");
    const campos = { titulo: data.titulo, urlRecurso: data.urlImagen, contenido: data.descripcion ?? null };

    if (!id) {
      const l = await this.prisma.lesson.create({
        data: { ...campos, tipo: "INFOGRAFIA", courseId: data.courseId, orden: await this.siguienteOrdenLeccion(data.courseId) },
      });
      await registrarLog(this.prisma, actorId, "CREAR", "infografia", l.id);
      return { id: l.id };
    }

    const actual = await this.prisma.lesson.findUnique({ where: { id }, select: { tipo: true, courseId: true, course: { select: { activo: true } } } });
    if (!actual || actual.tipo !== "INFOGRAFIA") throw new Error("Infografía no encontrada.");
    const cambiaModulo = actual.courseId !== data.courseId;
    if (cambiaModulo && actual.course.activo) {
      // No dejar un módulo activo sin contenido al mover su única lección.
      const restantes = await this.prisma.lesson.count({ where: { courseId: actual.courseId } });
      if (restantes <= 1) throw new Error("Es la única lección de su módulo activo; no se puede mover a otro módulo.");
    }
    await this.prisma.lesson.update({
      where: { id },
      data: { ...campos, ...(cambiaModulo ? { courseId: data.courseId, orden: await this.siguienteOrdenLeccion(data.courseId) } : {}) },
    });
    await registrarLog(this.prisma, actorId, "EDITAR", "infografia", id);
    return { id };
  }

  async asociarInfografiaAntigua(actorId: string, infographicId: string, courseId: string): Promise<void> {
    const antigua = await this.prisma.infographic.findUnique({ where: { id: infographicId } });
    if (!antigua) throw new Error("Infografía no encontrada.");
    // Se copia al módulo como lección; el registro original se conserva.
    await this.guardarInfografiaDeModulo(actorId, null, {
      courseId,
      titulo: antigua.titulo,
      urlImagen: antigua.url,
      descripcion: `${antigua.descripcion}${antigua.fuente ? ` (Fuente: ${antigua.fuente})` : ""}`,
    });
  }

  async vincularInfografiasIncluidas(actorId: string): Promise<{ vinculadas: number }> {
    const modulos = await this.prisma.course.findMany({
      where: { eliminadoEn: null, titulo: { in: Object.keys(INFOGRAFIAS_INCLUIDAS) } },
      select: { id: true, titulo: true, lessons: { where: { tipo: "INFOGRAFIA" }, orderBy: { orden: "asc" }, select: { id: true, urlRecurso: true } } },
    });
    let vinculadas = 0;
    for (const m of modulos) {
      const url = INFOGRAFIAS_INCLUIDAS[m.titulo];
      if (m.lessons.some((l) => l.urlRecurso === url)) continue;
      const vacia = m.lessons.find((l) => !l.urlRecurso);
      if (vacia) {
        // La lección "Infografía: …" que creó el seed sin imagen.
        await this.prisma.lesson.update({ where: { id: vacia.id }, data: { urlRecurso: url } });
      } else {
        await this.prisma.lesson.create({
          data: { courseId: m.id, tipo: "INFOGRAFIA", titulo: `Infografía: ${m.titulo}`, urlRecurso: url, orden: await this.siguienteOrdenLeccion(m.id) },
        });
      }
      vinculadas++;
    }
    if (vinculadas) await registrarLog(this.prisma, actorId, "EDITAR", "infografia", `Vinculadas ${vinculadas} infografías incluidas`);
    return { vinculadas };
  }

  // ---------------- Resultados de evaluaciones de módulo (solo lectura) ----------------
  // Solo se cuentan intentos de usuarios con rol ESTUDIANTE: las pruebas que
  // haga un administrador no alteran los resultados.

  async listarModulosConResultados(): Promise<ModuloConResultados[]> {
    const modulos = await this.prisma.course.findMany({
      where: { eliminadoEn: null },
      orderBy: [{ orden: "asc" }, { numero: "asc" }],
      select: {
        id: true,
        numero: true,
        titulo: true,
        activo: true,
        evaluations: { ...SELECT_EVAL_MODULO, select: { id: true, titulo: true } },
      },
    });
    const idsEval = modulos.flatMap((m) => m.evaluations.map((e) => e.id));
    const intentos = idsEval.length
      ? await this.prisma.quizAttempt.findMany({
          where: { evaluationId: { in: idsEval }, user: { rol: "ESTUDIANTE" } },
          select: { evaluationId: true, userId: true, aprobado: true },
        })
      : [];
    return modulos.map((m) => {
      const ev = m.evaluations[0];
      if (!ev) return { id: m.id, numero: m.numero, titulo: m.titulo, activo: m.activo, evaluacion: null };
      const deEsta = intentos.filter((i) => i.evaluationId === ev.id);
      const rindieron = new Set(deEsta.map((i) => i.userId));
      const aprobados = new Set(deEsta.filter((i) => i.aprobado).map((i) => i.userId));
      return {
        id: m.id,
        numero: m.numero,
        titulo: m.titulo,
        activo: m.activo,
        evaluacion: { id: ev.id, titulo: ev.titulo, rindieron: rindieron.size, aprobados: aprobados.size },
      };
    });
  }

  async obtenerIntentosEvaluacionModulo(evaluationId: string): Promise<EvaluacionModuloConIntentos | null> {
    const ev = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        course: { select: { id: true, titulo: true, numero: true, eliminadoEn: true } },
      },
    });
    if (!ev || ev.tipo !== TIPO_EVALUACION.MODULO || !ev.course || ev.course.eliminadoEn) return null;
    const intentos = await this.prisma.quizAttempt.findMany({
      where: { evaluationId, user: { rol: "ESTUDIANTE" } },
      orderBy: { fecha: "asc" },
      select: { userId: true, puntaje: true, aprobado: true, fecha: true, user: { select: { nombre: true, email: true } } },
    });
    return {
      evaluacion: { id: ev.id, titulo: ev.titulo, courseId: ev.course.id, cursoTitulo: ev.course.titulo, cursoNumero: ev.course.numero },
      intentos: intentos.map((i) => ({
        userId: i.userId,
        nombre: i.user.nombre,
        email: i.user.email,
        puntaje: i.puntaje,
        aprobado: i.aprobado,
        fecha: i.fecha,
      })),
    };
  }

  /** Deja los módulos vigentes numerados 1..n según su orden (sin huecos tras eliminar). */
  private async renumerarModulos() {
    const vigentes = await this.prisma.course.findMany({
      where: { eliminadoEn: null },
      orderBy: [{ orden: "asc" }, { numero: "asc" }],
      select: { id: true, numero: true, orden: true },
    });
    if (vigentes.every((c, i) => c.numero === i + 1 && c.orden === i + 1)) return;
    const agg = await this.prisma.course.aggregate({ _min: { numero: true } });
    const base = Math.min(0, agg._min.numero ?? 0) - 1;
    await this.prisma.$transaction([
      // Fase 1: valores temporales negativos (evita choques con la restricción única).
      ...vigentes.map((c, i) => this.prisma.course.update({ where: { id: c.id }, data: { numero: base - i - 1 } })),
      // Fase 2: numeración definitiva.
      ...vigentes.map((c, i) => this.prisma.course.update({ where: { id: c.id }, data: { numero: i + 1, orden: i + 1 } })),
    ]);
  }

  async moverCurso(actorId: string, id: string, direccion: "arriba" | "abajo"): Promise<void> {
    const cursos = await this.prisma.course.findMany({
      where: { eliminadoEn: null },
      orderBy: [{ orden: "asc" }, { numero: "asc" }],
      select: { id: true, numero: true },
    });
    const i = cursos.findIndex((c) => c.id === id);
    const j = direccion === "arriba" ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= cursos.length) return;

    const a = cursos[i];
    const b = cursos[j];
    const reordenados = [...cursos];
    reordenados[i] = b;
    reordenados[j] = a;

    // `numero` es único y se muestra como "Módulo N": se intercambia junto con
    // el orden (usando un valor temporal para no violar la restricción única).
    await this.prisma.$transaction([
      this.prisma.course.update({ where: { id: a.id }, data: { numero: -a.numero - 1000000 } }),
      this.prisma.course.update({ where: { id: b.id }, data: { numero: a.numero } }),
      this.prisma.course.update({ where: { id: a.id }, data: { numero: b.numero } }),
      ...reordenados.map((c, idx) => this.prisma.course.update({ where: { id: c.id }, data: { orden: idx + 1 } })),
    ]);
    await registrarLog(this.prisma, actorId, "EDITAR", "modulo", `${id}: orden ${direccion}`);
  }

  async actualizarLeccion(actorId: string, leccionId: string, data: DatosLeccion): Promise<void> {
    await this.prisma.lesson.update({
      where: { id: leccionId },
      data: {
        titulo: data.titulo,
        tipo: data.tipo,
        urlRecurso: data.urlRecurso?.trim() || null,
        contenido: data.contenido?.trim() || null,
      },
    });
    await registrarLog(this.prisma, actorId, "EDITAR", "leccion", leccionId);
  }

  async crearLeccion(actorId: string, courseId: string, data: DatosLeccion): Promise<void> {
    const totalActual = await this.prisma.lesson.count({ where: { courseId } });
    const leccion = await this.prisma.lesson.create({
      data: {
        courseId,
        titulo: data.titulo,
        tipo: data.tipo,
        urlRecurso: data.urlRecurso?.trim() || null,
        contenido: data.contenido?.trim() || null,
        orden: totalActual + 1,
      },
    });
    await registrarLog(this.prisma, actorId, "CREAR", "leccion", leccion.id);
  }

  async eliminarLeccion(actorId: string, leccionId: string): Promise<void> {
    const leccion = await this.prisma.lesson.findUnique({
      where: { id: leccionId },
      select: { courseId: true, course: { select: { activo: true } } },
    });
    if (!leccion) throw new Error("Lección no encontrada.");
    if (leccion.course.activo) {
      const total = await this.prisma.lesson.count({ where: { courseId: leccion.courseId } });
      if (total <= 1) {
        throw new Error("Es la única lección de un módulo activo. Desactiva el módulo antes de eliminarla.");
      }
    }
    await this.prisma.lesson.delete({ where: { id: leccionId } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "leccion", leccionId);
  }

  async listarEvaluaciones(): Promise<AdminEvaluationRow[]> {
    // Solo evaluaciones de MÓDULOS (las autoevaluaciones inicial y final se
    // administran exclusivamente en "Autoevaluaciones"). Se excluyen las de
    // módulos eliminados (quedan solo como historial).
    const evaluaciones = await this.prisma.evaluation.findMany({
      where: {
        tipo: TIPO_EVALUACION.MODULO,
        OR: [{ courseId: null }, { course: { eliminadoEn: null } }],
      },
      orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
      include: {
        course: { select: { titulo: true } },
        _count: { select: { preguntas: true, intentos: true } },
        preguntas: { where: { activo: true }, select: { id: true } },
      },
    });
    return evaluaciones.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      tipo: e.tipo,
      cursoTitulo: e.course?.titulo ?? null,
      totalPreguntas: e._count.preguntas,
      preguntasActivas: e.preguntas.length,
      totalIntentos: e._count.intentos,
    }));
  }

  async crearEvaluacion(actorId: string, data: DatosEvaluacion): Promise<{ id: string; titulo: string }> {
    const tipo = data.tipo ?? TIPO_EVALUACION.MODULO;

    // Una sola autoevaluación inicial y una sola final, para que las
    // preguntas de ambas no se mezclen ni se dupliquen.
    if (tipo === TIPO_EVALUACION.INICIAL || tipo === TIPO_EVALUACION.FINAL) {
      const existente = await this.prisma.evaluation.findFirst({ where: { tipo } });
      if (existente) throw new Error("Esa autoevaluación ya existe; edita sus preguntas en lugar de crear otra.");
    }
    // Cada módulo tiene UNA evaluación.
    if (tipo === TIPO_EVALUACION.MODULO && data.courseId) {
      const existente = await this.prisma.evaluation.findFirst({ where: { tipo, courseId: data.courseId } });
      if (existente) throw new Error("Este módulo ya tiene una evaluación.");
    }

    const evaluacion = await this.prisma.evaluation.create({
      data: {
        titulo: data.titulo,
        courseId: tipo === TIPO_EVALUACION.MODULO ? data.courseId ?? null : null,
        tipo,
        descripcion: data.descripcion?.trim() || null,
        ...(data.tiempoLimite !== undefined ? { tiempoLimite: data.tiempoLimite } : {}),
      },
    });
    await registrarLog(this.prisma, actorId, "CREAR", "evaluacion", evaluacion.id);
    return { id: evaluacion.id, titulo: evaluacion.titulo };
  }

  async actualizarEvaluacion(actorId: string, id: string, data: DatosEvaluacion): Promise<void> {
    await this.prisma.evaluation.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion?.trim() || null,
        ...(data.tiempoLimite !== undefined ? { tiempoLimite: data.tiempoLimite } : {}),
      },
    });
    await registrarLog(this.prisma, actorId, "EDITAR", "evaluacion", id);
  }

  async obtenerEvaluacionConPreguntas(id: string): Promise<AdminEvaluationDetailRow | null> {
    const evaluacion = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        preguntas: { orderBy: { orden: "asc" } },
        course: { select: { titulo: true } },
        _count: { select: { intentos: true } },
      },
    });
    if (!evaluacion) return null;
    return {
      id: evaluacion.id,
      titulo: evaluacion.titulo,
      tipo: evaluacion.tipo,
      descripcion: evaluacion.descripcion,
      tiempoLimite: evaluacion.tiempoLimite,
      courseId: evaluacion.courseId,
      cursoTitulo: evaluacion.course?.titulo ?? null,
      totalIntentos: evaluacion._count.intentos,
      preguntas: evaluacion.preguntas.map((p) => ({
        id: p.id,
        tipo: p.tipo,
        enunciado: p.enunciado,
        opciones: p.opciones,
        respuestaCorrecta: p.respuestaCorrecta,
        retroalimentacion: p.retroalimentacion,
        puntaje: p.puntaje,
        orden: p.orden,
        activo: p.activo,
      })),
    };
  }

  async eliminarEvaluacion(actorId: string, id: string): Promise<void> {
    // Los intentos se borrarían en cascada: se impide para no perder
    // resultados de estudiantes (incluida la comparación inicial/final).
    const intentos = await this.prisma.quizAttempt.count({ where: { evaluationId: id } });
    if (intentos > 0) {
      throw new Error(
        `No se puede eliminar: tiene ${intentos} intento(s) de estudiantes registrados. ` +
          "Puedes editar o desactivar sus preguntas en su lugar."
      );
    }
    await this.prisma.evaluation.delete({ where: { id } });
    await registrarLog(this.prisma, actorId, "ELIMINAR", "evaluacion", id);
  }

  async crearPregunta(actorId: string, evaluationId: string, data: DatosPregunta): Promise<void> {
    const existe = await this.prisma.evaluation.findUnique({ where: { id: evaluationId }, select: { id: true } });
    if (!existe) throw new Error("Evaluación no encontrada.");
    const agg = await this.prisma.question.aggregate({ where: { evaluationId }, _max: { orden: true } });
    const pregunta = await this.prisma.question.create({
      data: {
        evaluationId,
        tipo: data.tipo,
        enunciado: data.enunciado,
        opciones: (data.opciones ?? undefined) as Prisma.InputJsonValue | undefined,
        respuestaCorrecta: data.respuestaCorrecta as Prisma.InputJsonValue,
        retroalimentacion: data.retroalimentacion,
        puntaje: data.puntaje,
        orden: (agg._max.orden ?? 0) + 1,
      },
    });
    await registrarLog(this.prisma, actorId, "CREAR", "pregunta", pregunta.id);
  }

  async actualizarPregunta(actorId: string, id: string, data: DatosPregunta): Promise<void> {
    await this.prisma.question.update({
      where: { id },
      data: {
        tipo: data.tipo,
        enunciado: data.enunciado,
        opciones: data.opciones === null ? Prisma.DbNull : (data.opciones as Prisma.InputJsonValue),
        respuestaCorrecta: data.respuestaCorrecta as Prisma.InputJsonValue,
        retroalimentacion: data.retroalimentacion,
        puntaje: data.puntaje,
      },
    });
    await registrarLog(this.prisma, actorId, "EDITAR", "pregunta", id);
  }

  async cambiarEstadoPregunta(actorId: string, id: string, activo: boolean): Promise<void> {
    await this.prisma.question.update({ where: { id }, data: { activo } });
    await registrarLog(this.prisma, actorId, "EDITAR", "pregunta", `${id}: ${activo ? "activada" : "desactivada"}`);
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

  async crearCaso(actorId: string, data: DatosCasoPractico): Promise<void> {
    const totalActual = await this.prisma.caseStudy.count();
    const caso = await this.prisma.caseStudy.create({
      data: {
        titulo: data.titulo,
        categoria: data.categoria,
        escenario: data.escenario,
        descripcion: data.descripcion,
        normativaAplicable: data.normativaAplicable,
        derechosVulnerados: data.derechosVulnerados,
        sanciones: data.sanciones,
        actuacionCorrecta: data.actuacionCorrecta,
        retroalimentacionJuridica: data.retroalimentacionJuridica,
        nivelDificultad: data.nivelDificultad,
        competenciaDesarrollada: data.competenciaDesarrollada,
        opciones: data.opciones as Prisma.InputJsonValue,
        indiceCorrecto: data.indiceCorrecto,
        orden: totalActual + 1,
      },
    });
    await registrarLog(this.prisma, actorId, "CREAR", "caso_practico", caso.id);
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
