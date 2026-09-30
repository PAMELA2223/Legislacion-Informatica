import type { Rol } from "@prisma/client";

export interface AdminUserRow {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  xp: number;
  nivel: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  usuarioNombre: string;
  accion: string;
  entidad: string;
  detalle?: string | null;
  fecha: string;
}

export interface AdminNewsRow {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  fuente: string;
  fechaPublicacion: string;
}

export interface AdminGlossaryRow {
  id: string;
  termino: string;
  definicion: string;
  categoria: string;
  orden: number;
}

export interface AdminFaqRow {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria: string;
  orden: number;
  publicado: boolean;
}

export interface AdminJurisprudenceRow {
  id: string;
  nombreCaso: string;
  pais: string;
  anio: number;
  tema: string;
  resumen: string;
  problemaJuridico: string;
  decision: string;
  importancia: string;
  fuenteOficial: string;
  enlaceOficial?: string | null;
  verificado: boolean;
  publicado: boolean;
}

export interface AdminVideoRow {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  url: string;
  fuente: string;
  publicado: boolean;
}

export interface AdminInfographicRow {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  url: string;
  fuente: string;
  publicado: boolean;
}

export interface AdminInternationalReferenceRow {
  id: string;
  titulo: string;
  organismo: string;
  tema: string;
  categoria: string;
  resumen: string;
  urlOficial: string;
  publicado: boolean;
}

export interface AdminLibraryRow {
  id: string;
  titulo: string;
  categoria: string;
  tags: string[];
  descargas: number;
  updatedAt: string;
  archivoUrl?: string | null;
  contenido: string;
  numeroIdentificacion?: string | null;
  pais?: string | null;
  institucionEmisora?: string | null;
  fechaEmision?: string | null;
  fechaReforma?: string | null;
  estado: string;
  fuenteOficial?: string | null;
  enlaceOficial?: string | null;
}

export interface AdminCourseRow {
  id: string;
  titulo: string;
  slug: string;
  numero: number;
  orden: number;
  activo: boolean;
  totalLecciones: number;
  totalInscritos: number;
  /** Evaluación del módulo (null = el módulo todavía no tiene evaluación). */
  evaluacion: { id: string; preguntasActivas: number } | null;
}

export interface DatosCurso {
  titulo: string;
  slug?: string;
  descripcion: string;
  resumen: string;
  bibliografia: string;
  propositoAcademico: string;
  activo?: boolean;
}

export interface AdminLessonRow {
  id: string;
  titulo: string;
  tipo: string;
  urlRecurso: string | null;
  contenido: string | null;
  orden: number;
}

export interface AdminCourseDetailRow {
  id: string;
  numero: number;
  slug: string;
  titulo: string;
  descripcion: string;
  resumen: string;
  bibliografia: string;
  propositoAcademico: string;
  activo: boolean;
  lecciones: AdminLessonRow[];
  evaluacion: {
    id: string;
    titulo: string;
    totalPreguntas: number;
    preguntasActivas: number;
    totalIntentos: number;
  } | null;
}

export type TipoLeccion =
  | "VIDEO"
  | "PDF"
  | "INFOGRAFIA"
  | "TEXTO"
  | "PODCAST"
  | "LINEA_TIEMPO"
  | "MAPA_CONCEPTUAL"
  | "PRESENTACION";

export interface DatosLeccion {
  titulo: string;
  tipo: TipoLeccion;
  urlRecurso?: string | null;
  contenido?: string | null;
}

export interface AdminEvaluationRow {
  id: string;
  titulo: string;
  tipo: string;
  cursoTitulo: string | null;
  totalPreguntas: number;
  preguntasActivas: number;
  totalIntentos: number;
}

export interface AdminQuestionRow {
  id: string;
  tipo: DatosPregunta["tipo"];
  enunciado: string;
  opciones: unknown;
  respuestaCorrecta: unknown;
  retroalimentacion: string;
  puntaje: number;
  orden: number;
  activo: boolean;
}

export interface AdminEvaluationDetailRow {
  id: string;
  titulo: string;
  tipo: string;
  descripcion: string | null;
  tiempoLimite: number;
  courseId: string | null;
  cursoTitulo: string | null;
  totalIntentos: number;
  preguntas: AdminQuestionRow[];
}

export interface DatosPregunta {
  tipo: "VF" | "OPCION_MULTIPLE" | "RELACIONAR" | "COMPLETAR" | "CASO";
  enunciado: string;
  opciones: unknown;
  respuestaCorrecta: unknown;
  retroalimentacion: string;
  puntaje: number;
}

export interface DatosEvaluacion {
  titulo: string;
  courseId?: string | null;
  tipo?: string;
  descripcion?: string | null;
  tiempoLimite?: number;
}

export interface AdminCaseStudyRow {
  id: string;
  titulo: string;
  categoria: string;
  totalIntentos: number;
}

export interface DatosCasoPractico {
  titulo: string;
  categoria: "PROTECCION_DATOS" | "DELITOS_INFORMATICOS" | "COMERCIO_ELECTRONICO" | "EVIDENCIA_DIGITAL";
  escenario: string;
  descripcion: string;
  normativaAplicable: string;
  derechosVulnerados: string;
  sanciones: string;
  actuacionCorrecta: string;
  retroalimentacionJuridica: string;
  nivelDificultad: "BASICO" | "INTERMEDIO" | "AVANZADO";
  competenciaDesarrollada: string;
  opciones: unknown;
  indiceCorrecto: number;
}

export interface AdminForumThreadRow {
  id: string;
  titulo: string;
  autorNombre: string;
  totalPosts: number;
  createdAt: string;
}

export const ROLES_DISPONIBLES: Rol[] = ["ADMINISTRADOR", "ESTUDIANTE", "INVITADO"];

export interface AdminModuleInfographicRow {
  id: string; // id de la lección de tipo INFOGRAFIA
  titulo: string;
  descripcion: string | null;
  urlImagen: string | null;
  courseId: string;
}

export interface AdminModuleInfographicsOverview {
  modulos: { id: string; numero: number; titulo: string; activo: boolean; infografias: AdminModuleInfographicRow[] }[];
  /** Registros de la tabla antigua `infographics` que aún no están en ningún módulo. */
  sinModulo: { id: string; titulo: string; descripcion: string; url: string; fuente: string }[];
  /** Cuántas infografías incluidas en la plataforma se pueden vincular automáticamente. */
  incluidasPendientes: number;
}
