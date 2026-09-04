import { TutoringRules } from "../domain/tutoring.entity";
import type {
  TutoringMeeting,
  TutoringObjective,
  TutoringObservation,
  TutoringResource,
  TutoringTask,
} from "../domain/tutoring.entity";
import type { ITutoringRepository } from "../domain/tutoring-repository.interface";

// ---------- Tareas ----------

export class ListarTareasUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string) {
    return this.repo.listarTareas(assignmentId);
  }
}

export class CrearTareaUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string, data: Omit<TutoringTask, "id" | "assignmentId" | "courseTitulo">) {
    if (!TutoringRules.tituloValido(data.titulo)) throw new Error("El título debe tener al menos 3 caracteres.");
    return this.repo.crearTarea(assignmentId, data);
  }
}

export class ActualizarEstadoTareaUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(taskId: string, estado: TutoringTask["estado"]) {
    return this.repo.actualizarEstadoTarea(taskId, estado);
  }
}

// ---------- Objetivos ----------

export class ListarObjetivosUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string) {
    return this.repo.listarObjetivos(assignmentId);
  }
}

export class CrearObjetivoUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string, data: Omit<TutoringObjective, "id" | "assignmentId">) {
    if (!TutoringRules.tituloValido(data.titulo)) throw new Error("El título debe tener al menos 3 caracteres.");
    if (!TutoringRules.progresoValido(data.progreso)) throw new Error("El progreso debe ser un valor entre 0 y 100.");
    return this.repo.crearObjetivo(assignmentId, data);
  }
}

export class ActualizarProgresoObjetivoUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(objectiveId: string, progreso: number, estado: TutoringObjective["estado"]) {
    if (!TutoringRules.progresoValido(progreso)) throw new Error("El progreso debe ser un valor entre 0 y 100.");
    return this.repo.actualizarProgresoObjetivo(objectiveId, progreso, estado);
  }
}

// ---------- Observaciones (privadas) ----------

export class ListarObservacionesUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string) {
    return this.repo.listarObservaciones(assignmentId);
  }
}

export class CrearObservacionUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string, autorId: string, data: Pick<TutoringObservation, "tipo" | "contenido">) {
    if (!data.contenido?.trim()) throw new Error("El contenido de la observación es obligatorio.");
    return this.repo.crearObservacion(assignmentId, autorId, data);
  }
}

// ---------- Reuniones ----------

export class ListarReunionesUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string) {
    return this.repo.listarReuniones(assignmentId);
  }
}

export class CrearReunionUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string, data: Omit<TutoringMeeting, "id" | "assignmentId">) {
    if (!TutoringRules.tituloValido(data.titulo)) throw new Error("El título debe tener al menos 3 caracteres.");
    return this.repo.crearReunion(assignmentId, data);
  }
}

// ---------- Recursos ----------

export class ListarRecursosUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string) {
    return this.repo.listarRecursos(assignmentId);
  }
}

export class CrearRecursoUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string, data: Omit<TutoringResource, "id" | "assignmentId">) {
    if (!data.titulo?.trim() || !data.url?.trim()) throw new Error("Título y URL son obligatorios.");
    return this.repo.crearRecurso(assignmentId, data);
  }
}
