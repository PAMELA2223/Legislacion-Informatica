// Capa de DOMINIO: entidad y reglas de negocio puras, sin dependencias externas

export type Rol = "ADMINISTRADOR" | "DOCENTE" | "ESTUDIANTE" | "INVITADO";

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  avatarUrl?: string | null;
  xp: number;
  nivel: number;
}

/** Reglas de negocio del dominio de autenticación */
export class UserRules {
  static puedeAccederAdmin(user: Pick<User, "rol">): boolean {
    return user.rol === "ADMINISTRADOR";
  }

  static puedeGestionarContenido(user: Pick<User, "rol">): boolean {
    return user.rol === "ADMINISTRADOR" || user.rol === "DOCENTE";
  }

  static esInvitado(user: Pick<User, "rol">): boolean {
    return user.rol === "INVITADO";
  }

  static passwordEsValida(password: string): boolean {
    // Mínimo 8 caracteres, 1 mayúscula, 1 número
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  }
}
