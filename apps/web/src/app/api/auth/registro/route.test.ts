import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Supabase Admin y Prisma simulados: se prueba la ruta real de registro.
const creados: string[] = [];
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/supabase-admin", () => ({ createSupabaseAdminClient: () => ({}) }));
vi.mock("@/modules/auth/infrastructure/supabase-auth-admin.gateway", () => ({
  SupabaseAuthAdminGateway: class {},
  PrismaUsuariosAppRepository: class {},
}));
vi.mock("@/modules/auth/application/registro.use-cases", () => ({
  RegistrarCuentaUseCase: class {
    async execute(body: { email: string }) {
      creados.push(body.email);
      return { id: `id-${creados.length}` };
    }
  },
}));

import { POST } from "./route";
import { reiniciarLimites } from "@/lib/limite-intentos";

const IP_AULA = "190.95.10.20";
const peticion = (email: string) =>
  new Request("http://localhost/api/auth/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": IP_AULA },
    body: JSON.stringify({ email, password: "Clave1234", nombre: "Estudiante" }),
  });

describe("POST /api/auth/registro — varias personas en un mismo turno", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reiniciarLimites();
    creados.length = 0;
  });
  afterEach(() => vi.useRealTimers());

  it("turno 08:00–12:00: A (08:10), B (08:30), C (09:00), D (10:15) y E (11:40) entran", async () => {
    const llegadas = [
      ["08:10", "a@utelvt.edu.ec"],
      ["08:30", "b@utelvt.edu.ec"],
      ["09:00", "c@utelvt.edu.ec"],
      ["10:15", "d@utelvt.edu.ec"],
      ["11:40", "e@utelvt.edu.ec"],
    ];
    for (const [hora, correo] of llegadas) {
      vi.setSystemTime(new Date(`2026-10-05T${hora}:00-05:00`));
      const res = await POST(peticion(correo));
      expect(res.status, `${correo} a las ${hora}`).toBe(200);
    }
    expect(creados).toHaveLength(5);
  });

  it("más de 10 estudiantes del mismo laboratorio en 15 minutos (antes el 11.º era rechazado)", async () => {
    vi.setSystemTime(new Date("2026-10-05T08:00:00-05:00"));
    for (let i = 1; i <= 35; i++) {
      const res = await POST(peticion(`est${i}@utelvt.edu.ec`));
      expect(res.status).toBe(200);
    }
  });

  it("quien insiste con el mismo correo sí es frenado, sin afectar a los demás", async () => {
    vi.setSystemTime(new Date("2026-10-05T08:00:00-05:00"));
    let ultimo = 200;
    for (let i = 0; i < 11; i++) ultimo = (await POST(peticion("insiste@utelvt.edu.ec"))).status;
    expect(ultimo).toBe(429);
    expect((await POST(peticion("otro@utelvt.edu.ec"))).status).toBe(200);
  });
});
