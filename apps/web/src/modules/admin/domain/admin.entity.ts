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
  numero: number;
  totalLecciones: number;
  totalInscritos: number;
}

export interface AdminEvaluationRow {
  id: string;
  titulo: string;
  totalPreguntas: number;
  totalIntentos: number;
}

export interface AdminEvaluationDetailRow {
  id: string;
  titulo: string;
  tiempoLimite: number;
  preguntas: {
    id: string;
    tipo: string;
    enunciado: string;
  }[];
}

export interface DatosPregunta {
  tipo: "VF" | "OPCION_MULTIPLE" | "RELACIONAR" | "COMPLETAR" | "CASO";
  enunciado: string;
  opciones: unknown;
  respuestaCorrecta: unknown;
  retroalimentacion: string;
  puntaje: number;
}

export interface AdminCaseStudyRow {
  id: string;
  titulo: string;
  categoria: string;
  totalIntentos: number;
}

export interface AdminForumThreadRow {
  id: string;
  titulo: string;
  autorNombre: string;
  totalPosts: number;
  createdAt: string;
}

export const ROLES_DISPONIBLES: Rol[] = ["ADMINISTRADOR", "ESTUDIANTE", "INVITADO"];
