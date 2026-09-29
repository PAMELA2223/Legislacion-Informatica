import { describe, expect, it } from "vitest";
import {
  accionPrincipal,
  estadoContenido,
  estadoEvaluacion,
  indiceInicial,
  indiceTrasCompletar,
  resumenProgreso,
  type EstadoEvaluacionModulo,
} from "./module-navigation";

const c = (...completados: boolean[]) => completados.map((completado, i) => ({ id: `l${i}`, completado }));
const evalDisponible: EstadoEvaluacionModulo = { existe: true, aprobada: false, disponible: true, href: "/evaluaciones/e1" };
const sinEval: EstadoEvaluacionModulo = { existe: false, aprobada: false, disponible: false, href: null };

describe("navegación dentro del módulo", () => {
  it("abre el contenido de la URL, si no el primero pendiente, y si todo está completo el último", () => {
    expect(indiceInicial(c(true, true, false, false))).toBe(2);
    expect(indiceInicial(c(true, true))).toBe(1);
    expect(indiceInicial(c(false, false, false), "3")).toBe(2);
    expect(indiceInicial(c(false, false, false), "9")).toBe(0); // fuera de rango → ignorado
    expect(indiceInicial(c(false, false, false), "abc")).toBe(0);
    expect(indiceInicial([])).toBe(0);
  });

  it("estados ✓ completado / ● en progreso / ○ pendiente", () => {
    expect(estadoContenido({ id: "a", completado: true }, true)).toBe("completado");
    expect(estadoContenido({ id: "a", completado: false }, true)).toBe("en-progreso");
    expect(estadoContenido({ id: "a", completado: false }, false)).toBe("pendiente");
    expect(estadoEvaluacion({ ...evalDisponible, aprobada: true })).toBe("completado");
    expect(estadoEvaluacion(evalDisponible)).toBe("en-progreso");
    expect(estadoEvaluacion({ ...evalDisponible, disponible: false })).toBe("pendiente");
  });

  it("resume el progreso", () => {
    expect(resumenProgreso(c(true, false, true, false))).toEqual({ completados: 2, total: 4, porcentaje: 50, todosCompletados: false });
  });

  it("contenido sin completar → completar y continuar (en el último, solo completar)", () => {
    expect(accionPrincipal(c(false, false), 0, evalDisponible)).toMatchObject({ tipo: "completar-y-continuar", etiqueta: "Completar y continuar" });
    expect(accionPrincipal(c(true, false), 1, evalDisponible)).toMatchObject({ etiqueta: "Completar contenido" });
  });

  it("contenido completado con siguiente → Siguiente", () => {
    expect(accionPrincipal(c(true, false), 0, evalDisponible)).toEqual({ tipo: "siguiente", etiqueta: "Siguiente", indice: 1 });
  });

  it("último contenido: evaluación, contenido pendiente o finalizar", () => {
    expect(accionPrincipal(c(true, true), 1, evalDisponible)).toEqual({ tipo: "evaluacion", etiqueta: "Continuar a la evaluación", href: "/evaluaciones/e1" });
    expect(accionPrincipal(c(false, true), 1, evalDisponible)).toEqual({ tipo: "ir-a-pendiente", etiqueta: "Ir al contenido pendiente", indice: 0 });
    expect(accionPrincipal(c(true, true), 1, sinEval).tipo).toBe("finalizar");
    expect(accionPrincipal(c(true, true), 1, { ...evalDisponible, aprobada: true }).tipo).toBe("finalizar");
  });

  it("tras completar avanza al siguiente pendiente", () => {
    expect(indiceTrasCompletar(c(false, true, false), 0)).toBe(2);
    expect(indiceTrasCompletar(c(false, true, true), 2)).toBe(0);
    expect(indiceTrasCompletar(c(true, true, false), 2)).toBe(2);
  });
});
