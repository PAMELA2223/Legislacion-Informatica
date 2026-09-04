import { describe, it, expect } from "vitest";
import { GamificationRules, CRITERIOS_INSIGNIAS } from "./gamification.entity";
import type { EstadisticasLogros } from "./gamification.entity";

const statsBase: EstadisticasLogros = {
  leccionesCompletadas: 0,
  modulosCompletados: 0,
  evaluacionesAprobadas: 0,
  casosCorrectos: 0,
  nivel: 1,
};

describe("GamificationRules.calcularRetos", () => {
  it("marca los retos como no completados cuando el progreso es cero", () => {
    const retos = GamificationRules.calcularRetos(statsBase);
    expect(retos.every((r) => !r.completado)).toBe(true);
  });

  it("marca un reto como completado al alcanzar su meta", () => {
    const retos = GamificationRules.calcularRetos({
      ...statsBase,
      modulosCompletados: 1,
    });
    const retoModulo = retos.find((r) => r.id === "reto-modulo");
    expect(retoModulo?.completado).toBe(true);
  });

  it("no deja que el progreso supere la meta del reto", () => {
    const retos = GamificationRules.calcularRetos({
      ...statsBase,
      casosCorrectos: 99,
    });
    const retoCasos = retos.find((r) => r.id === "reto-casos");
    expect(retoCasos?.progresoActual).toBe(retoCasos?.meta);
  });
});

describe("CRITERIOS_INSIGNIAS", () => {
  it("desbloquea 'primer-paso' con al menos una lección completada", () => {
    expect(CRITERIOS_INSIGNIAS["primer-paso"]({ ...statsBase, leccionesCompletadas: 1 })).toBe(
      true
    );
    expect(CRITERIOS_INSIGNIAS["primer-paso"](statsBase)).toBe(false);
  });

  it("desbloquea 'estudiante-nivel-5' solo desde el nivel 5", () => {
    expect(CRITERIOS_INSIGNIAS["estudiante-nivel-5"]({ ...statsBase, nivel: 5 })).toBe(true);
    expect(CRITERIOS_INSIGNIAS["estudiante-nivel-5"]({ ...statsBase, nivel: 4 })).toBe(false);
  });
});
