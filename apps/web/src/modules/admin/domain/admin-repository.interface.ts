import type { Rol } from "@prisma/client";
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
} from "./admin.entity";

export interface DatosDocumentoBiblioteca {
  titulo: string;
  categoria: string;
  tags: string[];
  contenido: string;
  archivoUrl?: string;
  // Ficha de fuente oficial de la norma — todos opcionales porque no toda
  // norma tendrá esta información disponible de inmediato.
  numeroIdentificacion?: string;
  pais?: string;
  institucionEmisora?: string;
  fechaEmision?: string;
  fechaReforma?: string;
  estado?: string;
  fuenteOficial?: string;
  enlaceOficial?: string;
}

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

  // Biblioteca / normas (CRUD completo)
  listarBiblioteca(): Promise<AdminLibraryRow[]>;
  obtenerDocumentoBiblioteca(id: string): Promise<AdminLibraryRow | null>;
  crearDocumentoBiblioteca(actorId: string, data: DatosDocumentoBiblioteca): Promise<void>;
  actualizarDocumentoBiblioteca(actorId: string, id: string, data: DatosDocumentoBiblioteca): Promise<void>;
  eliminarDocumentoBiblioteca(actorId: string, id: string): Promise<void>;

  // Cursos, evaluaciones y casos (solo lectura + eliminación)
  listarCursos(): Promise<AdminCourseRow[]>;
  listarEvaluaciones(): Promise<AdminEvaluationRow[]>;
  obtenerEvaluacionConPreguntas(id: string): Promise<AdminEvaluationDetailRow | null>;
  eliminarEvaluacion(actorId: string, id: string): Promise<void>;
  crearPregunta(actorId: string, evaluationId: string, data: DatosPregunta): Promise<void>;
  eliminarPregunta(actorId: string, id: string): Promise<void>;
  listarCasos(): Promise<AdminCaseStudyRow[]>;
  eliminarCaso(actorId: string, id: string): Promise<void>;

  // Foro (moderación)
  listarHilosForo(): Promise<AdminForumThreadRow[]>;
  eliminarHiloForo(actorId: string, id: string): Promise<void>;

  // FAQ (CRUD completo)
  listarFaq(): Promise<AdminFaqRow[]>;
  obtenerPreguntaFaq(id: string): Promise<AdminFaqRow | null>;
  crearPreguntaFaq(actorId: string, data: Omit<AdminFaqRow, "id">): Promise<void>;
  actualizarPreguntaFaq(actorId: string, id: string, data: Omit<AdminFaqRow, "id">): Promise<void>;
  eliminarPreguntaFaq(actorId: string, id: string): Promise<void>;

  // Jurisprudencia (CRUD completo)
  listarJurisprudencia(): Promise<AdminJurisprudenceRow[]>;
  obtenerCasoJurisprudencia(id: string): Promise<AdminJurisprudenceRow | null>;
  crearCasoJurisprudencia(actorId: string, data: Omit<AdminJurisprudenceRow, "id">): Promise<void>;
  actualizarCasoJurisprudencia(
    actorId: string,
    id: string,
    data: Omit<AdminJurisprudenceRow, "id">
  ): Promise<void>;
  eliminarCasoJurisprudencia(actorId: string, id: string): Promise<void>;

  // Videos (CRUD completo)
  listarVideos(): Promise<AdminVideoRow[]>;
  obtenerVideo(id: string): Promise<AdminVideoRow | null>;
  crearVideo(actorId: string, data: Omit<AdminVideoRow, "id">): Promise<void>;
  actualizarVideo(actorId: string, id: string, data: Omit<AdminVideoRow, "id">): Promise<void>;
  eliminarVideo(actorId: string, id: string): Promise<void>;

  // Infografías (CRUD completo)
  listarInfografias(): Promise<AdminInfographicRow[]>;
  obtenerInfografia(id: string): Promise<AdminInfographicRow | null>;
  crearInfografia(actorId: string, data: Omit<AdminInfographicRow, "id">): Promise<void>;
  actualizarInfografia(actorId: string, id: string, data: Omit<AdminInfographicRow, "id">): Promise<void>;
  eliminarInfografia(actorId: string, id: string): Promise<void>;

  // Referencias internacionales (CRUD completo)
  listarReferenciasInternacionales(): Promise<AdminInternationalReferenceRow[]>;
  obtenerReferenciaInternacional(id: string): Promise<AdminInternationalReferenceRow | null>;
  crearReferenciaInternacional(actorId: string, data: Omit<AdminInternationalReferenceRow, "id">): Promise<void>;
  actualizarReferenciaInternacional(
    actorId: string,
    id: string,
    data: Omit<AdminInternationalReferenceRow, "id">
  ): Promise<void>;
  eliminarReferenciaInternacional(actorId: string, id: string): Promise<void>;
}
