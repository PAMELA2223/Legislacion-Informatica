import { describe, expect, it } from "vitest";
import { LearningPathRules, type DatosModulo, type EntradaEstadoAprendizaje } from "./learning-path.entity";

const FECHA = "2026-09-01T10:00:00.000Z";

function modulo(id: string, over: Partial<DatosModulo> = {}): DatosModulo {
  return {
    courseId: id,
    slug: id,
    numero: 1,
    titulo: `Módulo ${id}`,
    descripcion: "",
    totalLecciones: 2,
    leccionesCompletadas: 0,
    evaluacion: { id: `eval-${id}`, preguntasActivas: 3 },
    mejorIntento: null,
    ...over,
  };
}

function entrada(over: Partial<EntradaEstadoAprendizaje> = {}): EntradaEstadoAprendizaje {
  return {
    inicial: { evaluationId: "ini", preguntasActivas: 5, intento: null },
    final: { evaluationId: "fin", preguntasActivas: 5, intento: null },
    modulos: [modulo("m1"), modulo("m2")],
    ...over,
  };
}

const aprobado = { puntaje: 90, aprobado: true, fecha: FECHA };

describe("LearningPathRules — reglas de acceso", () => {
  it("estudiante nuevo: debe hacer la autoevaluación inicial y no puede ver módulos", () => {
    const e = LearningPathRules.calcularEstado(entrada());
    expect(e.etapa).toBe("AUTOEVALUACION_INICIAL");
    expect(e.puedeAccederModulos).toBe(false);
    expect(e.modulos.every((m) => !m.desbloqueado)).toBe(true);
    expect(LearningPathRules.puedeVerModulo(e, "m1")).toBe(false);
    expect(LearningPathRules.puedeRendirAutoevaluacionInicial(e)).toBe(true);
  });

  it("tras la autoevaluación inicial se habilita el primer módulo, no el segundo", () => {
    const e = LearningPathRules.calcularEstado(
      entrada({ inicial: { evaluationId: "ini", preguntasActivas: 5, intento: { puntaje: 40, aprobado: false, fecha: FECHA } } })
    );
    expect(e.etapa).toBe("MODULOS");
    expect(e.inicial.puntaje).toBe(40);
    expect(LearningPathRules.puedeVerModulo(e, "m1")).toBe(true);
    expect(LearningPathRules.puedeVerModulo(e, "m2")).toBe(false);
    expect(LearningPathRules.puedeRendirAutoevaluacionInicial(e)).toBe(false); // solo una vez
  });

  it("la evaluación del módulo se habilita solo después de revisar todo el contenido", () => {
    const base = entrada({ inicial: { evaluationId: "ini", preguntasActivas: 5, intento: aprobado } });
    const sinContenido = LearningPathRules.calcularEstado(base);
    expect(LearningPathRules.puedeRendirEvaluacionDeModulo(sinContenido, "eval-m1")).toBe(false);

    const conContenido = LearningPathRules.calcularEstado({
      ...base,
      modulos: [modulo("m1", { leccionesCompletadas: 2 }), modulo("m2")],
    });
    expect(LearningPathRules.puedeRendirEvaluacionDeModulo(conContenido, "eval-m1")).toBe(true);
    // No puede rendir la evaluación de otro módulo todavía bloqueado
    expect(LearningPathRules.puedeRendirEvaluacionDeModulo(conContenido, "eval-m2")).toBe(false);
  });

  it("un módulo no está completo sin aprobar su evaluación", () => {
    const e = LearningPathRules.calcularEstado(
      entrada({
        inicial: { evaluationId: "ini", preguntasActivas: 5, intento: aprobado },
        modulos: [modulo("m1", { leccionesCompletadas: 2, mejorIntento: { puntaje: 50, aprobado: false, fecha: FECHA } }), modulo("m2")],
      })
    );
    expect(e.modulos[0].completado).toBe(false);
    expect(LearningPathRules.puedeVerModulo(e, "m2")).toBe(false);
  });

  it("sin completar todos los módulos no se habilita la autoevaluación final", () => {
    const e = LearningPathRules.calcularEstado(
      entrada({
        inicial: { evaluationId: "ini", preguntasActivas: 5, intento: aprobado },
        modulos: [modulo("m1", { leccionesCompletadas: 2, mejorIntento: aprobado }), modulo("m2")],
      })
    );
    expect(e.modulosCompletados).toBe(1);
    expect(e.final.habilitada).toBe(false);
    expect(LearningPathRules.puedeRendirAutoevaluacionFinal(e)).toBe(false);
    expect(e.siguienteModulo?.courseId).toBe("m2");
  });

  it("al completar todos los módulos se habilita la final y, al rendirla, finaliza el proceso", () => {
    const modulos = [
      modulo("m1", { leccionesCompletadas: 2, mejorIntento: aprobado }),
      modulo("m2", { leccionesCompletadas: 2, mejorIntento: aprobado }),
    ];
    const habilitada = LearningPathRules.calcularEstado(
      entrada({ inicial: { evaluationId: "ini", preguntasActivas: 5, intento: { puntaje: 40, aprobado: false, fecha: FECHA } }, modulos })
    );
    expect(habilitada.etapa).toBe("AUTOEVALUACION_FINAL");
    expect(LearningPathRules.puedeRendirAutoevaluacionFinal(habilitada)).toBe(true);

    const finalizado = LearningPathRules.calcularEstado(
      entrada({
        inicial: { evaluationId: "ini", preguntasActivas: 5, intento: { puntaje: 40, aprobado: false, fecha: FECHA } },
        final: { evaluationId: "fin", preguntasActivas: 5, intento: { puntaje: 85, aprobado: true, fecha: FECHA } },
        modulos,
      })
    );
    expect(finalizado.etapa).toBe("FINALIZADO");
    expect(finalizado.mejora).toBe(45);
    expect(LearningPathRules.puedeRendirAutoevaluacionFinal(finalizado)).toBe(false); // solo una vez
  });

  it("un módulo cuya evaluación no tiene preguntas activas se completa solo con el contenido", () => {
    const e = LearningPathRules.calcularEstado(
      entrada({
        inicial: { evaluationId: "ini", preguntasActivas: 5, intento: aprobado },
        modulos: [modulo("m1", { leccionesCompletadas: 2, evaluacion: { id: "e", preguntasActivas: 0 } }), modulo("m2")],
      })
    );
    expect(e.modulos[0].requiereEvaluacion).toBe(false);
    expect(e.modulos[0].completado).toBe(true);
    expect(LearningPathRules.puedeVerModulo(e, "m2")).toBe(true);
  });

  it("si la autoevaluación inicial no está configurada no bloquea al estudiante", () => {
    const e = LearningPathRules.calcularEstado(entrada({ inicial: { evaluationId: null, preguntasActivas: 0, intento: null } }));
    expect(e.puedeAccederModulos).toBe(true);
    expect(e.etapa).toBe("MODULOS");
  });

  it("la final no se habilita si el administrador no la configuró", () => {
    const e = LearningPathRules.calcularEstado(
      entrada({
        inicial: { evaluationId: "ini", preguntasActivas: 5, intento: aprobado },
        final: { evaluationId: "fin", preguntasActivas: 0, intento: null },
        modulos: [modulo("m1", { leccionesCompletadas: 2, mejorIntento: aprobado })],
      })
    );
    expect(e.todosLosModulosCompletados).toBe(true);
    expect(e.final.habilitada).toBe(false);
  });
});
