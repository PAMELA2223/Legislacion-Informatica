import type {
  EstadoTutoria,
  ResumenAcademicoEstudiante,
  TutoringAssignment,
  TutoringMeeting,
  TutoringObjective,
  TutoringObservation,
  TutoringResource,
  TutoringTask,
} from "./tutoring.entity";

export interface EstudianteDisponible {
  id: string;
  nombre: string;
  email: string;
  tutorActual?: string | null; // nombre del docente actual, si tiene uno activo
  estadoTutoriaConEsteDocente?: EstadoTutoria | null;
}

export interface ITutoringRepository {
  // Solicitud y ciclo de vida
  listarEstudiantesDisponibles(docenteId: string, busqueda?: string): Promise<EstudianteDisponible[]>;
  solicitarTutoria(docenteId: string, estudianteId: string): Promise<TutoringAssignment>;
  cambiarEstadoTutoria(
    actorId: string,
    assignmentId: string,
    nuevoEstado: EstadoTutoria
  ): Promise<TutoringAssignment>;

  // Consultas del docente
  listarTutoriasDelDocente(docenteId: string, estado?: EstadoTutoria): Promise<TutoringAssignment[]>;
  obtenerAsignacion(assignmentId: string): Promise<TutoringAssignment | null>;
  obtenerAsignacionActiva(docenteId: string, estudianteId: string): Promise<TutoringAssignment | null>;

  // Consultas del estudiante
  obtenerTutorActivo(estudianteId: string): Promise<TutoringAssignment | null>;

  // Resumen académico (lee datos existentes, no los duplica)
  obtenerResumenAcademico(estudianteId: string): Promise<ResumenAcademicoEstudiante>;

  // Plan de acompañamiento
  listarTareas(assignmentId: string): Promise<TutoringTask[]>;
  crearTarea(assignmentId: string, data: Omit<TutoringTask, "id" | "assignmentId" | "courseTitulo">): Promise<void>;
  actualizarEstadoTarea(taskId: string, estado: TutoringTask["estado"]): Promise<void>;

  listarObjetivos(assignmentId: string): Promise<TutoringObjective[]>;
  crearObjetivo(assignmentId: string, data: Omit<TutoringObjective, "id" | "assignmentId">): Promise<void>;
  actualizarProgresoObjetivo(objectiveId: string, progreso: number, estado: TutoringObjective["estado"]): Promise<void>;

  listarObservaciones(assignmentId: string): Promise<TutoringObservation[]>;
  crearObservacion(
    assignmentId: string,
    autorId: string,
    data: Pick<TutoringObservation, "tipo" | "contenido">
  ): Promise<void>;

  listarReuniones(assignmentId: string): Promise<TutoringMeeting[]>;
  crearReunion(assignmentId: string, data: Omit<TutoringMeeting, "id" | "assignmentId">): Promise<void>;

  listarRecursos(assignmentId: string): Promise<TutoringResource[]>;
  crearRecurso(assignmentId: string, data: Omit<TutoringResource, "id" | "assignmentId">): Promise<void>;

  // Alertas (Sección 17): calculadas en vivo, sin tabla de notificaciones nueva
  listarProximosVencimientos(docenteId: string): Promise<TutoringTask[]>;

  // Administración global
  listarTodasLasTutorias(estado?: EstadoTutoria): Promise<TutoringAssignment[]>;
  reasignarTutoria(actorId: string, assignmentId: string, nuevoDocenteId: string): Promise<void>;
}
