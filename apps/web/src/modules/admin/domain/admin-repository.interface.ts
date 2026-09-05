import type { Rol } from "@prisma/client";
import type {
  AdminCaseStudyRow,
  AdminCourseRow,
  AdminEvaluationDetalle,
  AdminEvaluationRow,
  AdminForumThreadRow,
  AdminGlossaryRow,
  AdminLibraryRow,
  AdminNewsRow,
  AdminNuevaPregunta,
  AdminNuevoCaso,
  AdminUserRow,
  AuditLogEntry,
} from "./admin.entity";

export interface IAdminRepository {
  // Usuarios y roles
  listarUsuarios(): Promise<AdminUserRow[]>;
  cambiarRolUsuario(actorId: string, userId: string, rol: Rol): Promise<void>;
  eliminarUsuario(actorId: string, userId: string): Promise<void>;

  // Logs
  listarLogs(limite?: number): Promise<AuditLogEntry[]>;

  // Noticias (CRUD completo)
  listarNoticias(): Promise<AdminNewsRow[]>;
  obtenerNoticia(id: string): Promise<AdminNewsRow | null>;
  crearNoticia(actorId: string, data: Omit<AdminNewsRow, "id">): Promise<void>;
  actualizarNoticia(actorId: string, id: string, data: Omit<AdminNewsRow, "id">): Promise<void>;
  eliminarNoticia(actorId: string, id: string): Promise<void>;

  // Glosario (CRUD completo)
  listarGlosario(): Promise<AdminGlossaryRow[]>;
  obtenerTerminoGlosario(id: string): Promise<AdminGlossaryRow | null>;
  crearTerminoGlosario(actorId: string, data: Omit<AdminGlossaryRow, "id">): Promise<void>;
  actualizarTerminoGlosario(actorId: string, id: string, data: Omit<AdminGlossaryRow, "id">): Promise<void>;
  eliminarTerminoGlosario(actorId: string, id: string): Promise<void>;

  // Biblioteca (crear y eliminar)
  listarBiblioteca(): Promise<AdminLibraryRow[]>;
  crearDocumentoBiblioteca(
    actorId: string,
    data: { titulo: string; categoria: string; tags: string[]; contenido: string; archivoUrl?: string }
  ): Promise<void>;
  eliminarDocumentoBiblioteca(actorId: string, id: string): Promise<void>;

  // Cursos, evaluaciones y casos
  listarCursos(): Promise<AdminCourseRow[]>;
  listarEvaluaciones(): Promise<AdminEvaluationRow[]>;
  crearEvaluacion(
    actorId: string,
    data: { titulo: string; courseId?: string; tiempoLimite: number }
  ): Promise<{ id: string }>;
  obtenerEvaluacionConPreguntas(id: string): Promise<AdminEvaluationDetalle | null>;
  crearPregunta(actorId: string, evaluationId: string, data: AdminNuevaPregunta): Promise<void>;
  eliminarPregunta(actorId: string, id: string): Promise<void>;
  eliminarEvaluacion(actorId: string, id: string): Promise<void>;

  listarCasos(): Promise<AdminCaseStudyRow[]>;
  crearCaso(actorId: string, data: AdminNuevoCaso): Promise<void>;
  eliminarCaso(actorId: string, id: string): Promise<void>;

  // Foro (moderación)
  listarHilosForo(): Promise<AdminForumThreadRow[]>;
  eliminarHiloForo(actorId: string, id: string): Promise<void>;
}
