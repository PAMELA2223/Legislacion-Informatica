import { describe, expect, it } from "vitest";
import { ITEMS_SIDEBAR_ADMIN, obtenerEnlacesPlanos, obtenerSeccionesSidebar } from "./navigation";

describe("navegación", () => {
  it("el estudiante no ve categorías eliminadas y sí 'Lo más destacado'", () => {
    const hrefs = obtenerEnlacesPlanos("ESTUDIANTE").map((e) => e.href);
    expect(hrefs).not.toContain("/evaluaciones");
    expect(hrefs).not.toContain("/videos");
    expect(hrefs).not.toContain("/infografias");
    expect(hrefs).toContain("/destacados");
    expect(hrefs).toContain("/modulos");
  });

  it("el sidebar agrupado del administrador contiene todos sus enlaces, sin duplicados", () => {
    const hrefs = obtenerSeccionesSidebar("ADMINISTRADOR").flatMap((s) => s.enlaces.map((e) => e.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs.sort()).toEqual(ITEMS_SIDEBAR_ADMIN.map((i) => i.href).sort());
  });

  it("el menú del estudiante sigue el flujo: Inicio → Autoevaluación → Módulos", () => {
    const hrefs = obtenerEnlacesPlanos("ESTUDIANTE").map((e) => e.href);
    expect(hrefs.slice(0, 3)).toEqual(["/dashboard", "/autoevaluacion", "/modulos"]);
  });

  it("el sidebar del estudiante incluye su perfil", () => {
    const hrefs = obtenerSeccionesSidebar("ESTUDIANTE").flatMap((s) => s.enlaces.map((e) => e.href));
    expect(hrefs).toContain("/perfil");
  });
});
