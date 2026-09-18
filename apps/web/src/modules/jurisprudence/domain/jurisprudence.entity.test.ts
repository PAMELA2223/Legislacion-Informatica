import { describe, it, expect } from "vitest";
import { JurisprudenceRules } from "./jurisprudence.entity";

describe("JurisprudenceRules.esFuenteConfiable", () => {
  it("requiere verificado=true Y un enlace oficial no vacío", () => {
    expect(JurisprudenceRules.esFuenteConfiable({ verificado: false, enlaceOficial: null })).toBe(false);
    expect(
      JurisprudenceRules.esFuenteConfiable({ verificado: false, enlaceOficial: "https://x.gob.ec" })
    ).toBe(false);
    expect(JurisprudenceRules.esFuenteConfiable({ verificado: true, enlaceOficial: null })).toBe(false);
    expect(JurisprudenceRules.esFuenteConfiable({ verificado: true, enlaceOficial: "   " })).toBe(false);
  });

  it("es confiable solo cuando ambas condiciones se cumplen", () => {
    expect(
      JurisprudenceRules.esFuenteConfiable({
        verificado: true,
        enlaceOficial: "https://www.corteconstitucional.gob.ec/caso-x",
      })
    ).toBe(true);
  });
});
