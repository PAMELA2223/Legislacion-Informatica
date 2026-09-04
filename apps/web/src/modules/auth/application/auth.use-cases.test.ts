import { describe, it, expect, vi } from "vitest";
import { RegisterUseCase } from "./auth.use-cases";
import type { IAuthRepository } from "../domain/auth-repository.interface";

// Repositorio falso (test double): permite probar las reglas de
// RegisterUseCase SIN tocar Supabase ni la red — igual que pide la
// arquitectura hexagonal del proyecto (la aplicación depende de la
// interfaz IAuthRepository, nunca de la implementación concreta).
function crearRepositorioFalso(): IAuthRepository {
  return {
    register: vi.fn().mockResolvedValue({
      id: "1",
      email: "test@example.com",
      nombre: "Test",
      rol: "ESTUDIANTE",
      xp: 0,
      nivel: 1,
    }),
    login: vi.fn(),
    logout: vi.fn(),
    requestPasswordReset: vi.fn(),
    updatePassword: vi.fn(),
    getCurrentUser: vi.fn(),
  };
}

describe("RegisterUseCase", () => {
  it("rechaza una contraseña débil sin llamar al repositorio", async () => {
    const repo = crearRepositorioFalso();
    const useCase = new RegisterUseCase(repo);

    await expect(
      useCase.execute({ email: "a@a.com", password: "123", nombre: "Ana" })
    ).rejects.toThrow(/contraseña/i);

    expect(repo.register).not.toHaveBeenCalled();
  });

  it("rechaza un nombre vacío sin llamar al repositorio", async () => {
    const repo = crearRepositorioFalso();
    const useCase = new RegisterUseCase(repo);

    await expect(
      useCase.execute({ email: "a@a.com", password: "Abcdefg1", nombre: "   " })
    ).rejects.toThrow(/nombre/i);

    expect(repo.register).not.toHaveBeenCalled();
  });

  it("delega en el repositorio cuando los datos son válidos", async () => {
    const repo = crearRepositorioFalso();
    const useCase = new RegisterUseCase(repo);

    const input = { email: "a@a.com", password: "Abcdefg1", nombre: "Ana" };
    await useCase.execute(input);

    expect(repo.register).toHaveBeenCalledWith(input);
  });
});
