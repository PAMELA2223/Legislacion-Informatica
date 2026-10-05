import { describe, expect, it } from "vitest";
import { esErrorCorreoNoConfirmado, rolInicial, traducirErrorAuth, validarDatosRegistro } from "./registro";

describe("validación del registro", () => {
  it("normaliza correo y nombre", () => {
    expect(validarDatosRegistro({ email: "  Pamela@UTELVT.edu.ec ", password: "Segura123", nombre: "  Pamela   Torres " })).toEqual({
      email: "pamela@utelvt.edu.ec",
      password: "Segura123",
      nombre: "Pamela Torres",
    });
  });
  it("rechaza datos inválidos con mensajes claros", () => {
    expect(() => validarDatosRegistro({ email: "a@b.co", password: "Segura123", nombre: " " })).toThrow(/nombre/);
    expect(() => validarDatosRegistro({ email: "no-es-correo", password: "Segura123", nombre: "Ana" })).toThrow(/correo/);
    expect(() => validarDatosRegistro({ email: "a@b.co", password: "debil", nombre: "Ana" })).toThrow(/8 caracteres/);
    expect(() => validarDatosRegistro(null)).toThrow();
  });
});

describe("rol inicial (seguridad)", () => {
  it("un rol escrito por el usuario nunca se usa: solo app_metadata, que solo escribe el servidor", () => {
    expect(rolInicial(undefined)).toBe("ESTUDIANTE");
    expect(rolInicial({})).toBe("ESTUDIANTE");
    expect(rolInicial({ rol: "ADMINISTRADOR" })).toBe("ADMINISTRADOR");
    expect(rolInicial({ rol: "SUPERADMIN" })).toBe("ESTUDIANTE");
  });
});

describe("errores de autenticación", () => {
  it("detecta 'correo no confirmado' por código o por mensaje", () => {
    expect(esErrorCorreoNoConfirmado({ code: "email_not_confirmed" })).toBe(true);
    expect(esErrorCorreoNoConfirmado({ message: "Email not confirmed" })).toBe(true);
    expect(esErrorCorreoNoConfirmado({ message: "Invalid login credentials" })).toBe(false);
    expect(esErrorCorreoNoConfirmado(null)).toBe(false);
  });
  it("traduce los mensajes frecuentes de Supabase", () => {
    expect(traducirErrorAuth("Invalid login credentials")).toBe("Correo o contraseña incorrectos.");
    expect(traducirErrorAuth("User already registered")).toMatch(/Ya existe una cuenta/);
    expect(traducirErrorAuth("A user with this email address has already been registered")).toMatch(/Ya existe una cuenta/);
    expect(traducirErrorAuth("For security purposes, you can only request this after 60 seconds")).toMatch(/Demasiados intentos/);
    expect(traducirErrorAuth("New password should be different from the old password.")).toMatch(/diferente/);
    expect(traducirErrorAuth("Auth session missing!")).toMatch(/enlace expiró/);
    expect(traducirErrorAuth("Mensaje desconocido")).toBe("Mensaje desconocido");
  });
});
