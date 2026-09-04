import type { User } from "./user.entity";

export interface RegisterInput {
  email: string;
  password: string;
  nombre: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Contrato del repositorio de autenticación.
 * La capa de aplicación depende de esta interfaz, NUNCA de Supabase directamente
 * (principio de inversión de dependencias — SOLID).
 */
export interface IAuthRepository {
  register(input: RegisterInput): Promise<User>;
  login(input: LoginInput): Promise<User>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
