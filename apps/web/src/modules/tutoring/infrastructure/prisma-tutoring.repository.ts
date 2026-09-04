import type { PrismaClient } from "@prisma/client";
import { registrarLog } from "@/lib/audit-log";
import type {
  EstadoTutoria,
  ResumenAcademicoEstudiante,
  TutoringAssignment,
  TutoringMeeting,
  TutoringObjective,
  TutoringObservation,
  TutoringResource,
  TutoringTask,
} from "../domain/tutoring.entity";
import type {
  EstudianteDisponible,
  ITutoringRepository,
} from "../domain/tutoring-repository.interface";

const ESTADOS_NO_TERMINALES: EstadoTutoria[] = ["PENDIENTE", "ACTIVA"];

function mapAssignment(a: {
  id: string;
  docenteId: string;
  docente: { nombre: string };
  estudianteId: string;
  estudiante: { nombre: string; email: string };
  estado: EstadoTutoria;
  fechaSolicitud: Date;
  fechaAsignacion: Date | null;
  fechaFinalizacion: Date | null;
}): TutoringAssignment {
  return {
    id: a.id,
    docenteId: a.docenteId,
    docenteNombre: a.docente.nombre,
    estudianteId: a.estudianteId,
    estudianteNombre: a.estudiante.nombre,
    estudianteEmail: a.estudiante.email,
    estado: a.estado,
    fechaSolicitud: a.fechaSolicitud.toISOString(),
    fechaAsignacion: a.fechaAsignacion?.toISOString() ?? null,
    fechaFinalizacion: a.fechaFinalizacion?.toISOString() ?? null,
  };
}

export class PrismaTutoringRepository implements ITutoringRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------- Solicitud y ciclo de vida ----------

  async listarEstudiantesDisponibles(docenteId: string, busqueda?: string): Promise<EstudianteDisponible[]> {
    const estudiantes = await this.prisma.user.findMany({
      where: {
        rol: "ESTUDIANTE",
        ...(busqueda
          ? {
              OR: [
                { nombre: { contains: busqueda, mode: "insensitive" } },
                { email: { contains: busqueda, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { nombre: "asc" },
    });

    const asignaciones = await this.prisma.tutoringAssignment.findMany({
      where: { estudianteId: { in: estudiantes.map((e) => e.id) }, estado: { in: ESTADOS_NO_TERMINALES } },
      include: { docente: true },
    });

    return estudiantes.map((e) => {
      const asignacionActiva = asignaciones.find((a) => a.estudianteId === e.id && a.estado === "ACTIVA");
      const asignacionConEsteDocente = asignaciones.find(
        (a) => a.estudianteId === e.id && a.docenteId === docenteId
      );
      return {
        id: e.id,
        nombre: e.nombre,
        email: e.email,
        tutorActual: asignacionActiva ? asignacionActiva.docente.nombre : null,
        estadoTutoriaConEsteDocente: asignacionConEsteDocente?.estado ?? null,
      };
    });
  }

  async solicitarTutoria(docenteId: string, estudianteId: string): Promise<TutoringAssignment> {
    const asignacion = await this.prisma.tutoringAssignment.create({
      data: {
        docenteId,
        estudianteId,
        estado: "ACTIVA", // activación directa (ver decisión de la Fase 1)
        fechaAsignacion: new Date(),
      },
      include: { docente: true, estudiante: true },
    });

    await registrarLog(this.prisma, docenteId, "SOLICITAR_TUTORIA", "tutoria", `Estudiante ${estudianteId}`);
    return mapAssignment(asignacion);
  }

  async cambiarEstadoTutoria(
    actorId: string,
    assignmentId: string,
    nuevoEstado: EstadoTutoria
  ): Promise<TutoringAssignment> {
    const data: { estado: EstadoTutoria; fechaAsignacion?: Date; fechaFinalizacion?: Date } = {
      estado: nuevoEstado,
    };
    if (nuevoEstado === "ACTIVA") data.fechaAsignacion = new Date();
    if (["FINALIZADA", "CANCELADA", "RECHAZADA"].includes(nuevoEstado)) data.fechaFinalizacion = new Date();

    const asignacion = await this.prisma.tutoringAssignment.update({
      where: { id: assignmentId },
      data,
      include: { docente: true, estudiante: true },
    });

    const accion =
      nuevoEstado === "ACTIVA"
        ? "APROBAR_TUTORIA"
        : nuevoEstado === "RECHAZADA"
          ? "RECHAZAR_TUTORIA"
          : "FINALIZAR_TUTORIA";
    await registrarLog(this.prisma, actorId, accion, "tutoria", assignmentId);

    return mapAssignment(asignacion);
  }

  // ---------- Consultas del docente ----------

  async listarTutoriasDelDocente(docenteId: string, estado?: EstadoTutoria): Promise<TutoringAssignment[]> {
    const asignaciones = await this.prisma.tutoringAssignment.findMany({
      where: { docenteId, estado },
      include: { docente: true, estudiante: true },
      orderBy: { createdAt: "desc" },
    });
    return asignaciones.map(mapAssignment);
  }

  async obtenerAsignacion(assignmentId: string): Promise<TutoringAssignment | null> {
    const asignacion = await this.prisma.tutoringAssignment.findUnique({
      where: { id: assignmentId },
      include: { docente: true, estudiante: true },
    });
    return asignacion ? mapAssignment(asignacion) : null;
  }

  async obtenerAsignacionActiva(docenteId: string, estudianteId: string): Promise<TutoringAssignment | null> {
    const asignacion = await this.prisma.tutoringAssignment.findFirst({
      where: { docenteId, estudianteId, estado: { in: ESTADOS_NO_TERMINALES } },
      include: { docente: true, estudiante: true },
    });
    return asignacion ? mapAssignment(asignacion) : null;
  }

  // ---------- Consultas del estudiante ----------

  async obtenerTutorActivo(estudianteId: string): Promise<TutoringAssignment | null> {
    const asignacion = await this.prisma.tutoringAssignment.findFirst({
      where: { estudianteId, estado: "ACTIVA" },
      include: { docente: true, estudiante: true },
    });
    return asignacion ? mapAssignment(asignacion) : null;
  }

  // ---------- Resumen académico (reutiliza datos existentes, no los duplica) ----------

  async obtenerResumenAcademico(estudianteId: string): Promise<ResumenAcademicoEstudiante> {
    const [
      totalModulos,
      inscripciones,
      intentosEvaluacion,
      intentosCaso,
      preguntasAutoeval,
      respuestasAutoeval,
    ] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.enrollment.findMany({ where: { userId: estudianteId } }),
      this.prisma.quizAttempt.findMany({ where: { userId: estudianteId } }),
      this.prisma.caseAttempt.findMany({ where: { userId: estudianteId } }),
      this.prisma.selfAssessmentQuestion.findMany(),
      this.prisma.selfAssessmentResponse.findMany({ where: { userId: estudianteId } }),
    ]);

    const progresoGeneral =
      inscripciones.length === 0
        ? 0
        : Math.round(inscripciones.reduce((s, e) => s + e.progreso, 0) / inscripciones.length);

    const mejorPorEvaluacion = new Map<string, number>();
    for (const i of intentosEvaluacion) {
      const actual = mejorPorEvaluacion.get(i.evaluationId) ?? 0;
      if (i.puntaje > actual) mejorPorEvaluacion.set(i.evaluationId, i.puntaje);
    }
    const promedioCalificaciones =
      mejorPorEvaluacion.size === 0
        ? 0
        : Math.round(Array.from(mejorPorEvaluacion.values()).reduce((s, p) => s + p, 0) / mejorPorEvaluacion.size);

    function promedioPerfil(tipo: "INICIAL" | "FINAL"): number | null {
      const delTipo = respuestasAutoeval.filter((r) => r.tipo === tipo);
      if (delTipo.length === 0) return null;
      const promedioLikert = delTipo.reduce((s, r) => s + r.valor, 0) / delTipo.length;
      return Math.round(((promedioLikert - 1) / 4) * 100);
    }

    return {
      progresoGeneral,
      modulosCompletados: inscripciones.filter((e) => e.completado).length,
      totalModulos,
      evaluacionesRealizadas: mejorPorEvaluacion.size,
      promedioCalificaciones,
      casosResueltos: intentosCaso.length,
      casosCorrectos: intentosCaso.filter((c) => c.correcta).length,
      perfilInicial: promedioPerfil("INICIAL"),
      perfilFinal: promedioPerfil("FINAL"),
    };
  }

  // ---------- Tareas ----------

  async listarTareas(assignmentId: string): Promise<TutoringTask[]> {
    const tareas = await this.prisma.tutoringTask.findMany({
      where: { assignmentId },
      include: { course: true },
      orderBy: { fechaLimite: "asc" },
    });
    return tareas.map((t) => ({
      id: t.id,
      assignmentId: t.assignmentId,
      courseId: t.courseId,
      courseTitulo: t.course?.titulo ?? null,
      titulo: t.titulo,
      descripcion: t.descripcion,
      fechaLimite: t.fechaLimite.toISOString(),
      prioridad: t.prioridad,
      estado: t.estado,
    }));
  }

  async crearTarea(
    assignmentId: string,
    data: Omit<TutoringTask, "id" | "assignmentId" | "courseTitulo">
  ): Promise<void> {
    await this.prisma.tutoringTask.create({
      data: {
        assignmentId,
        courseId: data.courseId || undefined,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fechaLimite: new Date(data.fechaLimite),
        prioridad: data.prioridad,
        estado: data.estado,
      },
    });
  }

  async actualizarEstadoTarea(taskId: string, estado: TutoringTask["estado"]): Promise<void> {
    await this.prisma.tutoringTask.update({ where: { id: taskId }, data: { estado } });
  }

  // ---------- Objetivos ----------

  async listarObjetivos(assignmentId: string): Promise<TutoringObjective[]> {
    const objetivos = await this.prisma.tutoringObjective.findMany({
      where: { assignmentId },
      orderBy: { fechaObjetivo: "asc" },
    });
    return objetivos.map((o) => ({ ...o, fechaObjetivo: o.fechaObjetivo.toISOString() }));
  }

  async crearObjetivo(assignmentId: string, data: Omit<TutoringObjective, "id" | "assignmentId">): Promise<void> {
    await this.prisma.tutoringObjective.create({
      data: { assignmentId, ...data, fechaObjetivo: new Date(data.fechaObjetivo) },
    });
  }

  async actualizarProgresoObjetivo(
    objectiveId: string,
    progreso: number,
    estado: TutoringObjective["estado"]
  ): Promise<void> {
    await this.prisma.tutoringObjective.update({ where: { id: objectiveId }, data: { progreso, estado } });
  }

  // ---------- Observaciones ----------

  async listarObservaciones(assignmentId: string): Promise<TutoringObservation[]> {
    const observaciones = await this.prisma.tutoringObservation.findMany({
      where: { assignmentId },
      include: { autor: true },
      orderBy: { createdAt: "desc" },
    });
    return observaciones.map((o) => ({
      id: o.id,
      assignmentId: o.assignmentId,
      autorNombre: o.autor.nombre,
      tipo: o.tipo,
      contenido: o.contenido,
      createdAt: o.createdAt.toISOString(),
    }));
  }

  async crearObservacion(
    assignmentId: string,
    autorId: string,
    data: Pick<TutoringObservation, "tipo" | "contenido">
  ): Promise<void> {
    await this.prisma.tutoringObservation.create({ data: { assignmentId, autorId, ...data } });
    await registrarLog(this.prisma, autorId, "CREAR_OBSERVACION", "tutoria", assignmentId);
  }

  // ---------- Reuniones ----------

  async listarReuniones(assignmentId: string): Promise<TutoringMeeting[]> {
    const reuniones = await this.prisma.tutoringMeeting.findMany({
      where: { assignmentId },
      orderBy: { fecha: "asc" },
    });
    return reuniones.map((r) => ({ ...r, fecha: r.fecha.toISOString() }));
  }

  async crearReunion(assignmentId: string, data: Omit<TutoringMeeting, "id" | "assignmentId">): Promise<void> {
    await this.prisma.tutoringMeeting.create({
      data: { assignmentId, ...data, fecha: new Date(data.fecha) },
    });
  }

  // ---------- Recursos ----------

  async listarRecursos(assignmentId: string): Promise<TutoringResource[]> {
    return this.prisma.tutoringResource.findMany({ where: { assignmentId }, orderBy: { createdAt: "desc" } });
  }

  async crearRecurso(assignmentId: string, data: Omit<TutoringResource, "id" | "assignmentId">): Promise<void> {
    await this.prisma.tutoringResource.create({ data: { assignmentId, ...data } });
  }

  // ---------- Alertas ----------

  async listarProximosVencimientos(docenteId: string): Promise<TutoringTask[]> {
    const enSieteDias = new Date();
    enSieteDias.setDate(enSieteDias.getDate() + 7);

    const tareas = await this.prisma.tutoringTask.findMany({
      where: {
        assignment: { docenteId },
        estado: { in: ["PENDIENTE", "EN_PROGRESO"] },
        fechaLimite: { lte: enSieteDias },
      },
      include: { course: true },
      orderBy: { fechaLimite: "asc" },
    });

    return tareas.map((t) => ({
      id: t.id,
      assignmentId: t.assignmentId,
      courseId: t.courseId,
      courseTitulo: t.course?.titulo ?? null,
      titulo: t.titulo,
      descripcion: t.descripcion,
      fechaLimite: t.fechaLimite.toISOString(),
      prioridad: t.prioridad,
      estado: t.estado,
    }));
  }

  // ---------- Administración global ----------

  async listarTodasLasTutorias(estado?: EstadoTutoria): Promise<TutoringAssignment[]> {
    const asignaciones = await this.prisma.tutoringAssignment.findMany({
      where: { estado },
      include: { docente: true, estudiante: true },
      orderBy: { createdAt: "desc" },
    });
    return asignaciones.map(mapAssignment);
  }

  async reasignarTutoria(actorId: string, assignmentId: string, nuevoDocenteId: string): Promise<void> {
    const actual = await this.prisma.tutoringAssignment.findUniqueOrThrow({ where: { id: assignmentId } });

    await this.prisma.tutoringAssignment.update({
      where: { id: assignmentId },
      data: { estado: "FINALIZADA", fechaFinalizacion: new Date() },
    });

    await this.prisma.tutoringAssignment.upsert({
      where: { docenteId_estudianteId: { docenteId: nuevoDocenteId, estudianteId: actual.estudianteId } },
      update: { estado: "ACTIVA", fechaAsignacion: new Date(), fechaFinalizacion: null },
      create: {
        docenteId: nuevoDocenteId,
        estudianteId: actual.estudianteId,
        estado: "ACTIVA",
        fechaAsignacion: new Date(),
      },
    });

    await registrarLog(this.prisma, actorId, "ASIGNAR_TUTORIA", "tutoria", `${assignmentId} → ${nuevoDocenteId}`);
  }
}
