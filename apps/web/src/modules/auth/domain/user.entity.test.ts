import { describe, it, expect } from "vitest";
import { UserRules } from "./user.entity";

describe("UserRules.passwordEsValida", () => {
  it("rechaza contraseñas de menos de 8 caracteres", () => {
    expect(UserRules.passwordEsValida("Ab1")).toBe(false);
  });

  it("rechaza contraseñas sin mayúscula", () => {
    expect(UserRules.passwordEsValida("abcdefg1")).toBe(false);
  });

  it("rechaza contraseñas sin número", () => {
    expect(UserRules.passwordEsValida("Abcdefgh")).toBe(false);
  });

  it("acepta una contraseña válida", () => {
    expect(UserRules.passwordEsValida("Abcdefg1")).toBe(true);
  });
});

describe("UserRules.puedeAccederAdmin", () => {
  it("permite acceso solo al rol ADMINISTRADOR", () => {
    expect(UserRules.puedeAccederAdmin({ rol: "ADMINISTRADOR" })).toBe(true);
    expect(UserRules.puedeAccederAdmin({ rol: "DOCENTE" })).toBe(false);
    expect(UserRules.puedeAccederAdmin({ rol: "ESTUDIANTE" })).toBe(false);
    expect(UserRules.puedeAccederAdmin({ rol: "INVITADO" })).toBe(false);
  });
});

describe("UserRules.puedeGestionarContenido", () => {
  it("permite gestión a ADMINISTRADOR y DOCENTE", () => {
    expect(UserRules.puedeGestionarContenido({ rol: "ADMINISTRADOR" })).toBe(true);
    expect(UserRules.puedeGestionarContenido({ rol: "DOCENTE" })).toBe(true);
  });

  it("no permite gestión a ESTUDIANTE ni INVITADO", () => {
    expect(UserRules.puedeGestionarContenido({ rol: "ESTUDIANTE" })).toBe(false);
    expect(UserRules.puedeGestionarContenido({ rol: "INVITADO" })).toBe(false);
  });
});

describe("UserRules.esInvitado", () => {
  it("identifica correctamente el rol INVITADO", () => {
    expect(UserRules.esInvitado({ rol: "INVITADO" })).toBe(true);
    expect(UserRules.esInvitado({ rol: "ESTUDIANTE" })).toBe(false);
  });
});
