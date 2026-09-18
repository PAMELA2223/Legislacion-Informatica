import type { PrismaClient } from "@prisma/client";
import { calcularNivel } from "@/lib/gamification";
import { SelfAssessmentRules, EJES } from "@/modules/self-assessment/domain/self-assessment.entity";
import type { PerfilCompetencias } from "@/modules/self-assessment/domain/self-assessment.entity";
import type { IDashboardRepository } from "../domain/dashboard-repository.interface";
import type {
  ActividadReciente,
  ResumenAdmin,
  ResumenEstudiante,
} from "../domain/dashboard.entity";

export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerResumenEstudiante(userId: string): Promise<ResumenEstudiante> {
    const [
      user,
      inscripciones,
      totalEvaluaciones,
      intentosEvaluacion,
      intentosCaso,
      progresoLecciones,
      preguntasAutoeval,
      respuestasAutoeval,
    ] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.enrollment.findMany({ where: { userId }, include: { course: true } }),
      this.prisma.evaluation.count(),
      this.prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { fecha: "desc" },
        include: { evaluation: true },
      }),
      this.prisma.caseAttempt.findMany({
        where: { userId },
        orderBy: { fecha: "desc" },
        include: { caseStudy: true },
      }),
      this.prisma.lessonProgress.findMany({
        where: { userId, completado: true },
        orderBy: { fecha: "desc" },
        include: { lesson: true },
      }),
      this.prisma.selfAssessmentQuestion.findMany(),
      this.prisma.selfAssessmentResponse.findMany({ where: { userId } }),
    ]);

    const progresoGeneral =
      inscripciones.length === 0
        ? 0
        : Math.round(inscripciones.reduce((s, e) => s + e.progreso, 0) / inscripciones.length);

    const modulosCompletados = inscripciones.filter((e) => e.completado).length;
    const modulosEnCurso = inscripciones.filter((e) => !e.completado).length;

    const evaluacionesRealizadasIds = new Set(intentosEvaluacion.map((i) => i.evaluationId));
    const evaluacionesPendientes = Math.max(0, totalEvaluaciones - evaluacionesRealizadasIds.size);

    const mejorPorEvaluacion = new Map<string, number>();
    for (const intento of intentosEvaluacion) {
      const actual = mejorPorEvaluacion.get(intento.evaluationId) ?? 0;
      if (intento.puntaje > actual) mejorPorEvaluacion.set(intento.evaluationId, intento.puntaje);
    }
    const promedioCalificaciones =
      mejorPorEvaluacion.size === 0
        ? 0
        : Math.round(
            Array.from(mejorPorEvaluacion.values()).reduce((s, p) => s + p, 0) / mejorPorEvaluacion.size
          );

    const casosCorrectos = intentosCaso.filter((c) => c.correcta).length;

    // Ranking entre estudiantes por XP
    const estudiantes = await this.prisma.user.findMany({
      where: { rol: "ESTUDIANTE" },
      orderBy: { xp: "desc" },
      select: { id: true },
    });
    const posicion = estudiantes.findIndex((e) => e.id === userId);

    // Actividad reciente: unión de los últimos eventos de cada tipo
    const actividadReciente: ActividadReciente[] = [
      ...progresoLecciones.slice(0, 5).map((p) => ({
        tipo: "LECCION" as const,
        titulo: p.lesson.titulo,
        fecha: p.fecha.toISOString(),
      })),
      ...intentosEvaluacion.slice(0, 5).map((i) => ({
        tipo: "EVALUACION" as const,
        titulo: i.evaluation.titulo,
        fecha: i.fecha.toISOString(),
        detalle: `${i.puntaje}% ${i.aprobado ? "· Aprobado" : "· No aprobado"}`,
      })),
      ...intentosCaso.slice(0, 5).map((c) => ({
        tipo: "CASO" as const,
        titulo: c.caseStudy.titulo,
        fecha: c.fecha.toISOString(),
        detalle: c.correcta ? "Respuesta correcta" : "Respuesta incorrecta",
      })),
    ]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 8);

    const perfilInicial = this.calcularPerfilLocal(preguntasAutoeval, respuestasAutoeval, "INICIAL");
    const perfilFinal = this.calcularPerfilLocal(preguntasAutoeval, respuestasAutoeval, "FINAL");

    return {
      progresoGeneral,
      modulosCompletados,
      modulosEnCurso,
      totalModulos: await this.prisma.course.count(),
      evaluacionesRealizadas: evaluacionesRealizadasIds.size,
      evaluacionesPendientes,
      promedioCalificaciones,
      casosResueltos: intentosCaso.length,
      casosCorrectos,
      xp: user.xp,
      nivel: calcularNivel(user.xp),
      ranking: posicion === -1 ? 0 : posicion + 1,
      totalEstudiantesRanking: estudiantes.length,
      actividadReciente,
      perfilCompetencias: { inicial: perfilInicial, final: perfilFinal },
    };
  }

  private calcularPerfilLocal(
    preguntas: { id: string; eje: string; enunciado: string; orden: number }[],
    respuestas: { questionId: string; valor: number; tipo: string }[],
    tipo: "INICIAL" | "FINAL"
  ): PerfilCompetencias | null {
    const delTipo = respuestas.filter((r) => r.tipo === tipo);
    if (delTipo.length === 0) return null;
    return SelfAssessmentRules.calcularPerfil(
      preguntas as never,
      delTipo.map((r) => ({ questionId: r.questionId, valor: r.valor }))
    );
  }

  async obtenerResumenAdmin(): Promise<ResumenAdmin> {
    const [
      totalUsuarios,
      totalEstudiantes,
      totalAdministradores,
      cursos,
      enrollments,
      documentos,
      casosResueltos,
      evaluacionesRealizadas,
      preguntasAutoeval,
      respuestasAutoeval,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { rol: "ESTUDIANTE" } }),
      this.prisma.user.count({ where: { rol: "ADMINISTRADOR" } }),
      this.prisma.course.findMany(),
      this.prisma.enrollment.findMany(),
      this.prisma.libraryDocument.findMany({ orderBy: { descargas: "desc" } }),
      this.prisma.caseAttempt.count(),
      this.prisma.quizAttempt.count(),
      this.prisma.selfAssessmentQuestion.findMany(),
      this.prisma.selfAssessmentResponse.findMany(),
    ]);

    const inscritosPorCurso = cursos
      .map((c) => ({
        titulo: c.titulo,
        inscritos: enrollments.filter((e) => e.courseId === c.id).length,
      }))
      .sort((a, b) => b.inscritos - a.inscritos);

    const tasaFinalizacionGeneral =
      enrollments.length === 0
        ? 0
        : Math.round((enrollments.filter((e) => e.completado).length / enrollments.length) * 100);

    const totalDescargasBiblioteca = documentos.reduce((s, d) => s + d.descargas, 0);

    const promedioPerfil = (tipo: "INICIAL" | "FINAL"): PerfilCompetencias | null => {
      const delTipo = respuestasAutoeval.filter((r) => r.tipo === tipo);
      if (delTipo.length === 0) return null;

      // Promedia el puntaje por eje entre TODOS los usuarios que respondieron
      const usuarios = Array.from(new Set(delTipo.map((r) => r.userId)));
      const perfiles = usuarios.map((uid) =>
        SelfAssessmentRules.calcularPerfil(
          preguntasAutoeval as never,
          delTipo.filter((r) => r.userId === uid).map((r) => ({ questionId: r.questionId, valor: r.valor }))
        )
      );

      const promedio = {} as PerfilCompetencias;
      for (const eje of EJES) {
        promedio[eje] = Math.round(perfiles.reduce((s, p) => s + p[eje], 0) / perfiles.length);
      }
      return promedio;
    };

    return {
      totalUsuarios,
      totalEstudiantes,
      totalAdministradores,
      cursoMasConsultado: inscritosPorCurso[0] ?? null,
      tasaFinalizacionGeneral,
      totalDescargasBiblioteca,
      documentoMasDescargado: documentos[0]
        ? { titulo: documentos[0].titulo, descargas: documentos[0].descargas }
        : null,
      totalCasosResueltos: casosResueltos,
      totalEvaluacionesRealizadas: evaluacionesRealizadas,
      promedioPerfilInicial: promedioPerfil("INICIAL"),
      promedioPerfilFinal: promedioPerfil("FINAL"),
    };
  }
}
