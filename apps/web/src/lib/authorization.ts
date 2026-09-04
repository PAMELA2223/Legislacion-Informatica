// ============================================================
// AUTORIZACIÓN CENTRALIZADA (RBAC)
// ============================================================
// Punto único de verdad para "¿qué puede hacer este usuario?" en todo el
// servidor (páginas, layouts y Route Handlers). Sustituye el patrón
// repetido `getAuthenticatedUser() + prisma.user.findUnique + if (rol...)`
// que existía duplicado en ~10 archivos.
//
// Fuente del rol: SIEMPRE Prisma/PostgreSQL (nunca el metadata de Supabase
// Auth, ni localStorage, ni cookies, ni nada que el cliente pueda influir).
// Ver lib/get-authenticated-user.ts para el porqué de esta decisión.

import { redirect } from "next/navigation";
import type { Rol } from "@prisma/client";
import { getAuthenticatedUser } from "./get-authenticated-user";
import { prisma } from "./prisma";

export type { Rol };

/** Los tres roles que tienen acceso al área autenticada de la plataforma. Un
 * INVITADO con sesión iniciada NO entra en esta lista: no tiene acceso al
 * área interna, solo a las páginas públicas (landing, login, registro). */
export const ROLES_CON_ACCESO_A_PLATAFORMA: Rol[] = ["ADMINISTRADOR", "DOCENTE", "ESTUDIANTE"];

export interface AuthContext {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

/**
 * Devuelve el usuario autenticado con su rol real (Prisma), o `null` si no
 * hay sesión. No redirige — para eso está `requireRole()`. Útil cuando una
 * página necesita saber "quién es" sin forzar un rol específico (ej. una
 * página que se comporta distinto según el rol pero es visitable por varios).
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) return null;

  const prismaUser = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!prismaUser) return null;

  return {
    id: prismaUser.id,
    email: prismaUser.email,
    nombre: prismaUser.nombre,
    rol: prismaUser.rol,
  };
}

/** La página "de inicio" de cada rol — usada tanto para la redirección tras
 * el login como para el enlace de "volver a tu panel" en Acceso Denegado. */
export function rutaHomeDeRol(rol: Rol): string {
  switch (rol) {
    case "ADMINISTRADOR":
      return "/admin";
    case "DOCENTE":
      return "/docente";
    case "ESTUDIANTE":
      return "/dashboard";
    default:
      return "/login";
  }
}

export function tienePermiso(rol: Rol, rolesPermitidos: Rol[]): boolean {
  return rolesPermitidos.includes(rol);
}

/**
 * Exige que el usuario esté autenticado Y tenga uno de los roles indicados.
 * - Sin sesión → redirige a /login (con `redirectTo` para volver tras iniciar sesión).
 * - Con sesión pero rol no permitido → redirige a /acceso-denegado (página
 *   amigable, con un enlace de vuelta a SU panel correspondiente).
 *
 * Uso:
 *   const ctx = await requireRole(["ADMINISTRADOR"]);
 *   const ctx = await requireRole(["ADMINISTRADOR", "DOCENTE"]);
 */
export async function requireRole(rolesPermitidos: Rol[], rutaActual?: string): Promise<AuthContext> {
  const ctx = await getAuthContext();

  if (!ctx) {
    const params = rutaActual ? `?redirectTo=${encodeURIComponent(rutaActual)}` : "";
    redirect(`/login${params}`);
  }

  if (!tienePermiso(ctx.rol, rolesPermitidos)) {
    redirect("/acceso-denegado");
  }

  return ctx;
}

/**
 * Igual que `requireRole`, pero solo exige sesión iniciada con un rol de la
 * plataforma (ADMINISTRADOR/DOCENTE/ESTUDIANTE) — bloquea únicamente a
 * INVITADO y a quien no tiene sesión. Pensado para el layout raíz del área
 * autenticada, donde la mayoría de páginas son válidas para los tres roles.
 */
export async function requireAutenticado(rutaActual?: string): Promise<AuthContext> {
  return requireRole(ROLES_CON_ACCESO_A_PLATAFORMA, rutaActual);
}
