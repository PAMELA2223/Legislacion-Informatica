// Reglas puras del registro e inicio de sesión (sin Supabase ni Prisma).
import type { Rol } from "@prisma/client";
import { UserRules } from "./user.entity";

export interface DatosRegistro {
  email: string;
  password: string;
  nombre: string;
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Valida y normaliza los datos de registro (también se valida en el servidor). */
export function validarDatosRegistro(datos: Partial<DatosRegistro> | null | undefined): DatosRegistro {
  const email = (datos?.email ?? "").trim().toLowerCase();
  const nombre = (datos?.nombre ?? "").trim().replace(/\s+/g, " ");
  const password = datos?.password ?? "";
  if (!nombre) throw new Error("El nombre es obligatorio.");
  if (nombre.length > 100) throw new Error("El nombre es demasiado largo.");
  if (!EMAIL_VALIDO.test(email)) throw new Error("Ingresa un correo electrónico válido.");
  if (!UserRules.passwordEsValida(password)) {
    throw new Error("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
  }
  return { email, password, nombre };
}

const ROLES_VALIDOS: Rol[] = ["ADMINISTRADOR", "ESTUDIANTE", "INVITADO"];

/**
 * Rol con el que se crea la fila del usuario en la base de datos la primera vez.
 * SOLO se confía en `app_metadata` (únicamente el servidor puede escribirlo).
 * Nunca en `user_metadata`: el propio usuario puede escribirlo al registrarse
 * o desde la consola del navegador, y así podría crearse como ADMINISTRADOR.
 */
export function rolInicial(appMetadata: Record<string, unknown> | null | undefined): Rol {
  const rol = appMetadata?.rol;
  return typeof rol === "string" && (ROLES_VALIDOS as string[]).includes(rol) ? (rol as Rol) : "ESTUDIANTE";
}

/** ¿El error de Supabase indica que la cuenta existe pero no confirmó su correo? */
export function esErrorCorreoNoConfirmado(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false;
  return error.code === "email_not_confirmed" || /email not confirmed/i.test(error.message ?? "");
}

/** Mensajes de Supabase Auth traducidos a un español claro para el estudiante. */
export function traducirErrorAuth(mensaje: string | undefined | null): string {
  const m = (mensaje ?? "").toLowerCase();
  if (!m) return "Ocurrió un error. Inténtalo de nuevo.";
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("already exists")) {
    return "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.";
  }
  if (m.includes("email not confirmed")) return "No se pudo activar tu cuenta automáticamente. Inténtalo de nuevo.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) {
    return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  }
  if (m.includes("different from the old") || (m.includes("same") && m.includes("password"))) return "La nueva contraseña debe ser diferente a la anterior.";
  if (m.includes("password") && (m.includes("weak") || m.includes("at least") || m.includes("characters"))) {
    return "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.";
  }
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "Ingresa un correo electrónico válido.";
  if (m.includes("failed to fetch") || m.includes("network")) return "No se pudo conectar. Revisa tu conexión a internet.";
  if (m.includes("auth session missing") || m.includes("session") && m.includes("expired")) {
    return "El enlace expiró o ya fue usado. Solicita uno nuevo.";
  }
  return mensaje ?? "Ocurrió un error. Inténtalo de nuevo.";
}
