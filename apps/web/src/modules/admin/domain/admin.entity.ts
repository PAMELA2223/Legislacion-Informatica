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

export interface AdminLibraryRow {
  id: string;
  titulo: string;
  categoria: string;
  tags: string[];
  descargas: number;
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

export const ROLES_DISPONIBLES: Rol[] = ["ADMINISTRADOR", "DOCENTE", "ESTUDIANTE", "INVITADO"];
