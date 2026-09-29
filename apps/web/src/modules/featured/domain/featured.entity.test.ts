import { describe, expect, it } from "vitest";
import { FeaturedRules } from "./featured.entity";

describe("FeaturedRules.validar", () => {
  it("normaliza un destacado válido", () => {
    const r = FeaturedRules.validar({ titulo: " Video ", descripcion: "d", tipo: "VIDEO", url: "https://x.org", fuente: " " });
    expect(r.titulo).toBe("Video");
    expect(r.fuente).toBeNull();
    expect(r.activo).toBe(true);
  });
  it("acepta rutas internas", () => {
    expect(FeaturedRules.validar({ titulo: "M", descripcion: "d", tipo: "MODULO", url: "/modulos/x" }).url).toBe("/modulos/x");
  });
  it("rechaza enlaces inválidos y tipos desconocidos", () => {
    expect(() => FeaturedRules.validar({ titulo: "a", descripcion: "d", tipo: "VIDEO", url: "javascript:alert(1)" })).toThrow();
    expect(() => FeaturedRules.validar({ titulo: "a", descripcion: "d", tipo: "OTRO" as never, url: "/x" })).toThrow();
  });
});
