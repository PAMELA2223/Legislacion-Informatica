import { describe, expect, it } from "vitest";
import { resumirUso, validarConfig, FUENTES_CHATBOT } from "./chatbot-config";

describe("configuración del chatbot", () => {
  it("valida activo y fuentes, descartando valores desconocidos", () => {
    expect(validarConfig({ activo: true, fuentes: ["GLOSARIO", "OTRA", "FAQ"] })).toEqual({ activo: true, fuentes: ["GLOSARIO", "FAQ"] });
    expect(validarConfig({ activo: false, fuentes: [] })).toEqual({ activo: false, fuentes: [] });
    expect(() => validarConfig({ activo: true, fuentes: [] })).toThrow(/al menos un contenido/);
    expect(() => validarConfig({ fuentes: FUENTES_CHATBOT })).toThrow(/activo/);
  });
});

describe("estadísticas de uso", () => {
  const ahora = new Date("2026-09-30T12:00:00Z");
  const r = (userId: string, dias: number, intencion: string, tema: string | null, conInformacion = true) => ({
    userId, fecha: new Date(ahora.getTime() - dias * 864e5), modo: "basico", intencion, tema, conInformacion,
  });
  it("resume totales, estudiantes, sin información y temas frecuentes", () => {
    const e = resumirUso(
      [r("u1", 1, "definicion", "phishing"), r("u1", 2, "ejemplo", "phishing"), r("u2", 10, "situacion", "datos-personales"), r("u3", 0, "general", null, false)],
      ahora
    );
    expect(e.total).toBe(4);
    expect(e.ultimos7Dias).toBe(3);
    expect(e.estudiantes).toBe(3);
    expect(e.sinInformacion).toBe(1);
    expect(e.porcentajeSinInformacion).toBe(25);
    expect(e.temasFrecuentes[0]).toEqual({ tema: "phishing", total: 2 });
    expect(e.porIntencion.find((x) => x.intencion === "definicion")?.total).toBe(1);
  });
  it("sin consultas no falla", () => {
    expect(resumirUso([], ahora)).toMatchObject({ total: 0, porcentajeSinInformacion: null, temasFrecuentes: [] });
  });
});
