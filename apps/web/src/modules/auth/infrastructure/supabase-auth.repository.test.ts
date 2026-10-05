import { describe, it, expect, vi } from "vitest";
import { SupabaseAuthRepository } from "./supabase-auth.repository";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Prueba de seguridad: `user_metadata` en Supabase Auth es un campo que el
 * propio usuario puede modificar desde el navegador (fuera del control de
 * este backend). Este repositorio NUNCA debe devolver ese valor como si
 * fuera el rol real — el rol autoritativo siempre se consulta del lado del
 * servidor contra Prisma (ver lib/authorization.ts). Esta prueba existe
 * para blindar esa decisión ante cambios futuros.
 */
function crearSupabaseFalso(metadataDevuelta: Record<string, unknown>) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-1",
            email: "usuario@ejemplo.com",
            user_metadata: metadataDevuelta,
          },
        },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-1",
            email: "usuario@ejemplo.com",
            user_metadata: metadataDevuelta,
          },
        },
      }),
    },
  } as unknown as SupabaseClient;
}

describe("SupabaseAuthRepository — el rol de user_metadata nunca es autoritativo", () => {
  it("login() ignora un rol elevado inyectado en user_metadata", async () => {
    const supabaseFalso = crearSupabaseFalso({ rol: "ADMINISTRADOR", nombre: "Ana" });
    const repo = new SupabaseAuthRepository(supabaseFalso);

    const user = await repo.login({ email: "usuario@ejemplo.com", password: "x" });

    expect(user.rol).toBe("ESTUDIANTE");
  });

  it("getCurrentUser() ignora un rol elevado inyectado en user_metadata", async () => {
    const supabaseFalso = crearSupabaseFalso({ rol: "ADMINISTRADOR", nombre: "Ana" });
    const repo = new SupabaseAuthRepository(supabaseFalso);

    const user = await repo.getCurrentUser();

    expect(user?.rol).toBe("ESTUDIANTE");
  });

  it("register() en modo respaldo siempre crea con rol ESTUDIANTE, sin importar el input", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ codigo: "SIN_CLAVE_SERVICIO" }), { status: 503 })));
    const supabaseFalso = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: "user-2", email: "nuevo@ejemplo.com" }, session: null },
          error: null,
        }),
      },
    } as unknown as SupabaseClient;
    const repo = new SupabaseAuthRepository(supabaseFalso);

    const r = await repo.register({ email: "nuevo@ejemplo.com", password: "Abcdefg1", nombre: "Nuevo" });

    expect(r.usuario.rol).toBe("ESTUDIANTE");
    expect(r.sesionIniciada).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe("SupabaseAuthRepository — registro sin confirmación por correo", () => {
  function supabaseConLogin(resultados: { error: { message: string; code?: string } | null }[]) {
    const signInWithPassword = vi.fn();
    for (const r of resultados) {
      signInWithPassword.mockResolvedValueOnce({
        data: r.error ? { user: null } : { user: { id: "u-9", email: "ana@correo.com", user_metadata: { nombre: "Ana" } } },
        error: r.error,
      });
    }
    return { auth: { signInWithPassword, signUp: vi.fn() } } as unknown as SupabaseClient & {
      auth: { signInWithPassword: ReturnType<typeof vi.fn>; signUp: ReturnType<typeof vi.fn> };
    };
  }

  it("crea la cuenta en el servidor y entra directamente (sesión iniciada, sin signUp ni correo)", async () => {
    const fetchFalso = vi.fn(async () => new Response(JSON.stringify({ ok: true, id: "u-9" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchFalso);
    const sb = supabaseConLogin([{ error: null }]);
    const r = await new SupabaseAuthRepository(sb).register({ email: "ana@correo.com", password: "Segura123", nombre: "Ana" });
    expect(fetchFalso).toHaveBeenCalledWith("/api/auth/registro", expect.objectContaining({ method: "POST" }));
    expect(sb.auth.signUp).not.toHaveBeenCalled();
    expect(sb.auth.signInWithPassword).toHaveBeenCalledWith({ email: "ana@correo.com", password: "Segura123" });
    expect(r).toMatchObject({ sesionIniciada: true, usuario: { id: "u-9", rol: "ESTUDIANTE" } });
    vi.unstubAllGlobals();
  });

  it("correo ya registrado: muestra el mensaje del servidor", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Ya existe una cuenta con este correo." }), { status: 409 })));
    await expect(new SupabaseAuthRepository(supabaseConLogin([])).register({ email: "a@b.co", password: "Segura123", nombre: "A" })).rejects.toThrow(/Ya existe/);
    vi.unstubAllGlobals();
  });

  it("login de una cuenta antigua sin confirmar: se activa sola y entra", async () => {
    const fetchFalso = vi.fn(async () => new Response(JSON.stringify({ ok: true, estado: "confirmada" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchFalso);
    const sb = supabaseConLogin([{ error: { message: "Email not confirmed", code: "email_not_confirmed" } }, { error: null }]);
    const u = await new SupabaseAuthRepository(sb).login({ email: "ana@correo.com", password: "Segura123" });
    expect(fetchFalso).toHaveBeenCalledWith("/api/auth/confirmar-cuenta", expect.anything());
    expect(sb.auth.signInWithPassword).toHaveBeenCalledTimes(2);
    expect(u.id).toBe("u-9");
    vi.unstubAllGlobals();
  });

  it("login con contraseña incorrecta: mensaje en español y sin intentar activar nada", async () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);
    const sb = supabaseConLogin([{ error: { message: "Invalid login credentials" } }]);
    await expect(new SupabaseAuthRepository(sb).login({ email: "a@b.co", password: "x" })).rejects.toThrow("Correo o contraseña incorrectos.");
    expect(fetchFalso).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
