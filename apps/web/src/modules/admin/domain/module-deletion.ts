// Regla de negocio para eliminar un módulo sin perder información.
//
// Relaciones de un módulo (courses) en la base de datos:
//   lessons (contenido, videos, infografías, recursos) ... onDelete: Cascade
//     └── lesson_progress (progreso de estudiantes) .... onDelete: Cascade
//   evaluations (evaluación del módulo) ................. onDelete: SetNull
//     ├── questions ..................................... onDelete: Cascade
//     └── quiz_attempts (resultados de estudiantes) ..... onDelete: Cascade
//   enrollments (inscripción/progreso por módulo) ....... onDelete: Restrict
//   featured_contents (destacados) ...................... onDelete: SetNull
//
// Un borrado físico eliminaría en cascada el progreso y las calificaciones de
// los estudiantes (y `enrollments` directamente lo impide). Por eso:
//   - sin datos de estudiantes → eliminación FÍSICA (limpia, no se pierde nada);
//   - con datos de estudiantes → eliminación LÓGICA (se archiva con
//     `eliminadoEn`: desaparece de toda la plataforma, los resultados quedan).

export type ModoEliminacionModulo = "fisica" | "logica";

export interface DatosEstudiantesDelModulo {
  inscritos: number;
  intentosEvaluacion: number;
  leccionesCompletadas: number;
}

export function decidirEliminacionModulo(d: DatosEstudiantesDelModulo): ModoEliminacionModulo {
  return d.inscritos + d.intentosEvaluacion + d.leccionesCompletadas > 0 ? "logica" : "fisica";
}

export function mensajeEliminacionModulo(titulo: string, modo: ModoEliminacionModulo, d: DatosEstudiantesDelModulo): string {
  if (modo === "fisica") return `Se eliminó el módulo "${titulo}" junto con su contenido y su evaluación.`;
  const partes = [
    d.inscritos ? `${d.inscritos} estudiante(s) con progreso` : "",
    d.intentosEvaluacion ? `${d.intentosEvaluacion} intento(s) de evaluación` : "",
  ].filter(Boolean);
  return (
    `Se eliminó el módulo "${titulo}". Ya no aparece en la plataforma` +
    (partes.length ? `; se conservaron en el historial ${partes.join(" y ")}.` : ".")
  );
}
