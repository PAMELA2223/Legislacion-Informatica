import { describe, expect, it, vi } from "vitest";
import { ConfirmarCuentaPendienteUseCase, RegistrarCuentaUseCase } from "./registro.use-cases";
import { CorreoYaRegistradoError, type IAuthAdminGateway, type IUsuariosAppRepository } from "../domain/auth-admin.interface";

const gateway = (over: Partial<IAuthAdminGateway> = {}): IAuthAdminGateway => ({
  crearUsuarioConfirmado: vi.fn(async () => ({ id: "u-1" })),
  confirmarCuentaPendiente: vi.fn(async () => "confirmada" as const),
  ...over,
});
const usuarios = (): IUsuariosAppRepository => ({ asegurarEstudiante: vi.fn(async () => {}) });

describe("RegistrarCuentaUseCase", () => {
  it("crea la cuenta confirmada (sin correo) y la fila del estudiante con datos normalizados", async () => {
    const g = gateway();
    const u = usuarios();
    expect(await new RegistrarCuentaUseCase(g, u).execute({ email: " Ana@Correo.COM ", password: "Segura123", nombre: " Ana  Pérez " })).toEqual({ id: "u-1" });
    expect(g.crearUsuarioConfirmado).toHaveBeenCalledWith({ email: "ana@correo.com", password: "Segura123", nombre: "Ana Pérez" });
    expect(u.asegurarEstudiante).toHaveBeenCalledWith({ id: "u-1", email: "ana@correo.com", nombre: "Ana Pérez" });
  });

  it("datos inválidos: no llega a crear la cuenta", async () => {
    const g = gateway();
    await expect(new RegistrarCuentaUseCase(g, usuarios()).execute({ email: "x", password: "Segura123", nombre: "Ana" })).rejects.toThrow(/correo/);
    expect(g.crearUsuarioConfirmado).not.toHaveBeenCalled();
  });

  it("correo ya registrado: lo informa con un mensaje claro", async () => {
    const g = gateway({ crearUsuarioConfirmado: vi.fn(async () => { throw new CorreoYaRegistradoError(); }) });
    await expect(new RegistrarCuentaUseCase(g, usuarios()).execute({ email: "a@b.co", password: "Segura123", nombre: "Ana" })).rejects.toThrow(/Ya existe una cuenta/);
  });

  it("si falla la base de datos de la plataforma, el registro igual se completa (se crea al primer ingreso)", async () => {
    const u: IUsuariosAppRepository = { asegurarEstudiante: vi.fn(async () => { throw new Error("db caída"); }) };
    const espia = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(new RegistrarCuentaUseCase(gateway(), u).execute({ email: "a@b.co", password: "Segura123", nombre: "Ana" })).resolves.toEqual({ id: "u-1" });
    espia.mockRestore();
  });
});

describe("ConfirmarCuentaPendienteUseCase", () => {
  it("exige correo y contraseña", async () => {
    await expect(new ConfirmarCuentaPendienteUseCase(gateway()).execute({ email: "a@b.co" })).rejects.toThrow();
  });
  it("delega con el correo normalizado", async () => {
    const g = gateway();
    expect(await new ConfirmarCuentaPendienteUseCase(g).execute({ email: " A@B.CO ", password: "x" })).toBe("confirmada");
    expect(g.confirmarCuentaPendiente).toHaveBeenCalledWith("a@b.co", "x");
  });
});
