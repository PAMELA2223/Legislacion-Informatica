// Capa de INFRAESTRUCTURA: implementación concreta con Supabase.
// Implementa el contrato IAuthRepository — el resto de la app no conoce Supabase.
//
// ⚠️ IMPORTANTE — este archivo se ejecuta EN EL NAVEGADOR:
// Se instancia desde componentes cliente (login-form.tsx, register-form.tsx,
// reset-password-form.tsx), así que NO puede importar Prisma (librería de
// solo-servidor, con binarios nativos — romperia el build o el bundle del
// cliente si se intentara).
//
// IMPORTANTE — fuente de verdad del ROL:
// Supabase Auth guarda `rol` en `user_metadata`, pero ese campo lo puede
// modificar el propio usuario desde la consola del navegador (llamando
// directamente a `supabase.auth.updateUser({ data: { rol: "ADMINISTRADOR" } })`),
// sin pasar por ningún endpoint de este backend. Por eso `login()` y
// `getCurrentUser()` de esta clase NUNCA devuelven ese valor tal cual: el
// `rol` (y `xp`/`nivel`) que devuelven es solo un valor por defecto seguro,
// no autoritativo.
//
// El rol real y autoritativo de la aplicación SIEMPRE se consulta del
// lado del servidor contra Prisma — nunca desde aquí. Ver:
//   - `lib/authorization.ts`      → getAuthContext() / requireRole()
//   - `lib/get-authenticated-user.ts`
//   - docs/correccion-roles-prisma-supabase.md
// Ninguna decisión de autorización o de qué interfaz (Invitado/
// Estudiante/Administrador) mostrar debe basarse en el valor devuelto por
// esta clase.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IAuthRepository,
  LoginInput,
  RegisterInput,
  ResultadoRegistro,
} from "../domain/auth-repository.interface";
import type { User } from "../domain/user.entity";
import { esErrorCorreoNoConfirmado, traducirErrorAuth } from "../domain/registro";

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Registro SIN confirmación por correo:
   *  1. El servidor (/api/auth/registro) crea la cuenta ya confirmada, con la
   *     clave de servicio. Supabase no envía ningún correo.
   *  2. Se inicia sesión de inmediato: el estudiante entra directamente.
   * Respaldo: si el servidor no tiene configurada la clave de servicio, se usa
   * el registro estándar de Supabase (que depende de la opción "Confirm email"
   * del panel de Supabase).
   */
  async register({ email, password, nombre }: RegisterInput): Promise<ResultadoRegistro> {
    const usuario = (id: string): User => ({ id, email, nombre, rol: "ESTUDIANTE", xp: 0, nivel: 1 });

    const res = await fetch("/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre }),
    }).catch(() => null);
    if (!res) throw new Error(traducirErrorAuth("Failed to fetch"));
    const data = await res.json().catch(() => ({}));

    if (res.status === 503 && data.codigo === "SIN_CLAVE_SERVICIO") {
      return this.registroEstandar({ email, password, nombre });
    }
    if (!res.ok) throw new Error(data.error || "No se pudo crear la cuenta.");

    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(traducirErrorAuth(error.message));
    return { usuario: usuario(data.id), sesionIniciada: true };
  }

  /** Respaldo: registro estándar de Supabase desde el navegador. */
  private async registroEstandar({ email, password, nombre }: RegisterInput): Promise<ResultadoRegistro> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        // El rol nunca se toma de aquí (ver nota de cabecera); se deja por compatibilidad.
        data: { nombre, rol: "ESTUDIANTE" },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    });
    if (error) throw new Error(traducirErrorAuth(error.message));
    if (!data.user) throw new Error("No se pudo crear el usuario.");
    return {
      usuario: { id: data.user.id, email: data.user.email ?? email, nombre, rol: "ESTUDIANTE", xp: 0, nivel: 1 },
      // Si "Confirm email" está desactivado en Supabase, la sesión llega de inmediato.
      sesionIniciada: Boolean(data.session),
    };
  }

  async login({ email, password }: LoginInput): Promise<User> {
    let { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    // Cuenta creada antes de quitar la confirmación por correo y que quedó
    // pendiente: se activa automáticamente (el servidor verifica la contraseña).
    if (esErrorCorreoNoConfirmado(error)) {
      const res = await fetch("/api/auth/confirmar-cuenta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(() => null);
      if (res?.ok) ({ data, error } = await this.supabase.auth.signInWithPassword({ email, password }));
    }

    if (error) throw new Error(traducirErrorAuth(error.message));
    if (!data.user) throw new Error("Credenciales inválidas.");

    // Nombre: puramente informativo (mostrar "Hola, {nombre}"), sin riesgo
    // de seguridad. Rol/xp/nivel: valores por defecto seguros, NO
    // autoritativos (ver nota de cabecera). El redireccionamiento tras el
    // login (`login-form.tsx`) NO usa este `rol` para decidir a dónde ir;
    // la página de destino vuelve a verificar el rol real contra Prisma.
    const meta = data.user.user_metadata ?? {};
    return {
      id: data.user.id,
      email: data.user.email ?? email,
      nombre: typeof meta.nombre === "string" ? meta.nombre : "",
      rol: "ESTUDIANTE",
      xp: 0,
      nivel: 1,
    };
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/recuperar-password/nueva`,
    });
    if (error) throw new Error(traducirErrorAuth(error.message));
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw new Error(traducirErrorAuth(error.message));
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return null;

    // Mismo criterio que login(): rol/xp/nivel son valores por defecto
    // seguros, NO autoritativos (ver nota de cabecera). Este método no
    // tiene actualmente ningún consumidor en la interfaz — si en el futuro
    // se necesita el rol real de sesión en un componente cliente, debe
    // obtenerse llamando a un endpoint de servidor que consulte Prisma
    // (mismo patrón ya usado por `RoleSelect` al llamar a
    // `/api/admin/usuarios/[id]`), nunca leyéndolo de aquí.
    const meta = user.user_metadata ?? {};
    return {
      id: user.id,
      email: user.email ?? "",
      nombre: typeof meta.nombre === "string" ? meta.nombre : "",
      rol: "ESTUDIANTE",
      xp: 0,
      nivel: 1,
    };
  }
}
