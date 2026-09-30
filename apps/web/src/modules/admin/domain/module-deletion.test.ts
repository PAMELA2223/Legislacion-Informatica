import { describe, expect, it } from "vitest";
import { decidirEliminacionModulo, mensajeEliminacionModulo } from "./module-deletion";

describe("eliminación de módulos", () => {
  it("sin datos de estudiantes se elimina físicamente", () => {
    expect(decidirEliminacionModulo({ inscritos: 0, intentosEvaluacion: 0, leccionesCompletadas: 0 })).toBe("fisica");
  });
  it("con progreso o resultados se archiva (eliminación lógica)", () => {
    expect(decidirEliminacionModulo({ inscritos: 1, intentosEvaluacion: 0, leccionesCompletadas: 0 })).toBe("logica");
    expect(decidirEliminacionModulo({ inscritos: 0, intentosEvaluacion: 2, leccionesCompletadas: 0 })).toBe("logica");
    expect(decidirEliminacionModulo({ inscritos: 0, intentosEvaluacion: 0, leccionesCompletadas: 5 })).toBe("logica");
  });
  it("el mensaje explica qué se conservó", () => {
    const m = mensajeEliminacionModulo("Ética", "logica", { inscritos: 3, intentosEvaluacion: 4, leccionesCompletadas: 9 });
    expect(m).toContain("Ya no aparece en la plataforma");
    expect(m).toContain("3 estudiante(s)");
    expect(mensajeEliminacionModulo("Ética", "fisica", { inscritos: 0, intentosEvaluacion: 0, leccionesCompletadas: 0 })).toContain("contenido y su evaluación");
  });
});
