import { TutoringRules } from "../domain/tutoring.entity";
import type { EstadoTutoria } from "../domain/tutoring.entity";
import type { ITutoringRepository } from "../domain/tutoring-repository.interface";

export class ListarEstudiantesDisponiblesUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(docenteId: string, busqueda?: string) {
    return this.repo.listarEstudiantesDisponibles(docenteId, busqueda);
  }
}

/**
 * Flujo (Sección 3): DOCENTE selecciona estudiante → solicitud → PENDIENTE
 * → ADMINISTRADOR aprueba → ACTIVA. Si no hay tutoría previa activa/pendiente
 * para ese estudiante, se activa directamente (no siempre se requiere
 * aprobación administrativa, según lo definido en la Sección 3).
 */
export class SolicitarTutoriaUseCase {
  constructor(private readonly repo: ITutoringRepository) {}

  async execute(docenteId: string, estudianteId: string) {
    const existente = await this.repo.obtenerAsignacionActiva(docenteId, estudianteId);
    if (existente) {
      throw new Error("Ya existe una relación de tutoría con este estudiante.");
    }

    const tutorActual = await this.repo.obtenerTutorActivo(estudianteId);
    if (tutorActual) {
      throw new Error(
        `Este estudiante ya tiene un tutor activo (${tutorActual.docenteNombre}). ` +
          "Un administrador debe reasignarlo primero."
      );
    }

    return this.repo.solicitarTutoria(docenteId, estudianteId);
  }
}

export class CambiarEstadoTutoriaUseCase {
  constructor(private readonly repo: ITutoringRepository) {}

  async execute(actorId: string, assignmentId: string, nuevoEstado: EstadoTutoria) {
    const actual = await this.repo.obtenerAsignacion(assignmentId);
    if (!actual) throw new Error("Tutoría no encontrada.");

    if (!TutoringRules.esTransicionValida(actual.estado, nuevoEstado)) {
      throw new Error(`No se puede pasar de ${actual.estado} a ${nuevoEstado}.`);
    }

    return this.repo.cambiarEstadoTutoria(actorId, assignmentId, nuevoEstado);
  }
}

export class ListarTutoriasDelDocenteUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(docenteId: string, estado?: EstadoTutoria) {
    return this.repo.listarTutoriasDelDocente(docenteId, estado);
  }
}

export class ObtenerAsignacionUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(assignmentId: string) {
    const asignacion = await this.repo.obtenerAsignacion(assignmentId);
    if (!asignacion) throw new Error("Tutoría no encontrada.");
    return asignacion;
  }
}

export class ObtenerTutorActivoUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(estudianteId: string) {
    return this.repo.obtenerTutorActivo(estudianteId);
  }
}

export class ObtenerResumenAcademicoUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(estudianteId: string) {
    return this.repo.obtenerResumenAcademico(estudianteId);
  }
}

export class ListarProximosVencimientosUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(docenteId: string) {
    return this.repo.listarProximosVencimientos(docenteId);
  }
}

export class ListarTodasLasTutoriasUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(estado?: EstadoTutoria) {
    return this.repo.listarTodasLasTutorias(estado);
  }
}

export class ReasignarTutoriaUseCase {
  constructor(private readonly repo: ITutoringRepository) {}
  async execute(actorId: string, assignmentId: string, nuevoDocenteId: string) {
    return this.repo.reasignarTutoria(actorId, assignmentId, nuevoDocenteId);
  }
}
