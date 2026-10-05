// Operaciones de autenticación que SOLO puede hacer el servidor (clave de servicio).

export class CorreoYaRegistradoError extends Error {
  constructor() {
    super("Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.");
  }
}

export class CredencialesInvalidasError extends Error {
  constructor() {
    super("Correo o contraseña incorrectos.");
  }
}

export interface IAuthAdminGateway {
  /** Crea la cuenta YA confirmada: no se envía ningún correo de confirmación. */
  crearUsuarioConfirmado(datos: { email: string; password: string; nombre: string }): Promise<{ id: string }>;
  /**
   * Para cuentas creadas antes de este cambio que quedaron sin confirmar:
   * verifica la contraseña y, si es correcta, marca el correo como confirmado.
   */
  confirmarCuentaPendiente(email: string, password: string): Promise<"confirmada" | "ya-confirmada">;
}

export interface IUsuariosAppRepository {
  /** Crea (o completa) la fila del estudiante en la base de datos de la plataforma. */
  asegurarEstudiante(datos: { id: string; email: string; nombre: string }): Promise<void>;
}
