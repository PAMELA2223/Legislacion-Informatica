// Capa de APLICACIÓN: casos de uso. Orquestan reglas de dominio + repositorio,
// sin saber qué tecnología implementa el repositorio (Supabase, etc.)

import { UserRules } from "../domain/user.entity";
import type {
  IAuthRepository,
  LoginInput,
  RegisterInput,
} from "../domain/auth-repository.interface";

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: RegisterInput) {
    if (!UserRules.passwordEsValida(input.password)) {
      throw new Error(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
      );
    }
    if (!input.nombre.trim()) {
      throw new Error("El nombre es obligatorio.");
    }
    return this.authRepository.register(input);
  }
}

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: LoginInput) {
    return this.authRepository.login(input);
  }
}

export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute() {
    return this.authRepository.logout();
  }
}

export class RequestPasswordResetUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string) {
    return this.authRepository.requestPasswordReset(email);
  }
}

export class UpdatePasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(newPassword: string) {
    if (!UserRules.passwordEsValida(newPassword)) {
      throw new Error(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
      );
    }
    return this.authRepository.updatePassword(newPassword);
  }
}

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute() {
    return this.authRepository.getCurrentUser();
  }
}
