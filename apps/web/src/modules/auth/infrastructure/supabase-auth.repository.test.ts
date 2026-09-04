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

  it("register() siempre crea con rol ESTUDIANTE, sin importar el input", async () => {
    const supabaseFalso = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: "user-2", email: "nuevo@ejemplo.com" } },
          error: null,
        }),
      },
    } as unknown as SupabaseClient;
    const repo = new SupabaseAuthRepository(supabaseFalso);

    const user = await repo.register({
      email: "nuevo@ejemplo.com",
      password: "Abcdefg1",
      nombre: "Nuevo",
    });

    expect(user.rol).toBe("ESTUDIANTE");
  });
});
