import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LIMITES_AUTH, reiniciarLimites, superaLimiteAuth } from "./limite-intentos";

const IP_AULA = "190.95.10.20"; // toda el aula sale por la misma IP pública

function a(hora: string) {
  vi.setSystemTime(new Date(`2026-10-05T${hora}:00-05:00`));
}

describe("límites de acceso (por persona, no por red)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reiniciarLimites();
  });
  afterEach(() => vi.useRealTimers());

  it("turno 08:00–12:00: A–E entran a distintas horas desde la misma red", () => {
    const llegadas: [string, string][] = [
      ["08:10", "a@utelvt.edu.ec"],
      ["08:30", "b@utelvt.edu.ec"],
      ["09:00", "c@utelvt.edu.ec"],
      ["10:15", "d@utelvt.edu.ec"],
      ["11:40", "e@utelvt.edu.ec"],
    ];
    for (const [hora, correo] of llegadas) {
      a(hora);
      expect(superaLimiteAuth("registro", IP_AULA, correo), `${correo} a las ${hora}`).toBe(false);
    }
  });

  it("un aula entera (40 estudiantes) entra en el mismo minuto sin bloquearse", () => {
    a("08:00");
    for (let i = 1; i <= 40; i++) {
      expect(superaLimiteAuth("registro", IP_AULA, `est${i}@utelvt.edu.ec`)).toBe(false);
    }
  });

  it("solo se frena a quien repite intentos sobre SU cuenta; los demás siguen entrando", () => {
    a("08:00");
    const max = LIMITES_AUTH.porPersona.maximo;
    for (let i = 0; i < max; i++) superaLimiteAuth("confirmar", IP_AULA, "x@utelvt.edu.ec");
    expect(superaLimiteAuth("confirmar", IP_AULA, "x@utelvt.edu.ec")).toBe(true);
    expect(superaLimiteAuth("confirmar", IP_AULA, "y@utelvt.edu.ec")).toBe(false);
  });

  it("el bloqueo de una persona dura minutos, no horas", () => {
    a("08:00");
    const max = LIMITES_AUTH.porPersona.maximo;
    for (let i = 0; i < max; i++) superaLimiteAuth("confirmar", IP_AULA, "x@utelvt.edu.ec");
    expect(superaLimiteAuth("confirmar", IP_AULA, "X@utelvt.edu.ec")).toBe(true); // mismo correo, otra capitalización
    a("08:16");
    expect(superaLimiteAuth("confirmar", IP_AULA, "x@utelvt.edu.ec")).toBe(false);
  });

  it("se mantiene la protección anti-abuso masivo desde un mismo origen", () => {
    a("08:00");
    const techo = LIMITES_AUTH.porRed.maximo;
    for (let i = 0; i < techo; i++) superaLimiteAuth("registro", "6.6.6.6", `bot${i}@x.com`);
    expect(superaLimiteAuth("registro", "6.6.6.6", "otro@x.com")).toBe(true);
    // Otra red no se ve afectada
    expect(superaLimiteAuth("registro", IP_AULA, "a@utelvt.edu.ec")).toBe(false);
  });

  it("los intentos rechazados no consumen cupo de nadie", () => {
    a("08:00");
    const max = LIMITES_AUTH.porPersona.maximo;
    for (let i = 0; i < max + 50; i++) superaLimiteAuth("registro", IP_AULA, "x@utelvt.edu.ec");
    for (let i = 0; i < 40; i++) expect(superaLimiteAuth("registro", IP_AULA, `e${i}@utelvt.edu.ec`)).toBe(false);
  });
});
