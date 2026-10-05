// Casos de uso del registro sin confirmación por correo (se ejecutan en el servidor).
import { validarDatosRegistro, type DatosRegistro } from "../domain/registro";
import type { IAuthAdminGateway, IUsuariosAppRepository } from "../domain/auth-admin.interface";

export class RegistrarCuentaUseCase {
  constructor(
    private readonly auth: IAuthAdminGateway,
    private readonly usuarios: IUsuariosAppRepository
  ) {}

  async execute(entrada: Partial<DatosRegistro> | null): Promise<{ id: string }> {
    const datos = validarDatosRegistro(entrada);
    const { id } = await this.auth.crearUsuarioConfirmado(datos);
    // La fila en la base de datos de la plataforma también se crea al primer
    // ingreso (getAuthenticatedUser), así que un fallo aquí no bloquea al estudiante.
    try {
      await this.usuarios.asegurarEstudiante({ id, email: datos.email, nombre: datos.nombre });
    } catch (error) {
      console.error("[registro] No se pudo crear la fila del usuario; se creará al primer ingreso.", error);
    }
    return { id };
  }
}

export class ConfirmarCuentaPendienteUseCase {
  constructor(private readonly auth: IAuthAdminGateway) {}

  async execute(entrada: { email?: unknown; password?: unknown } | null) {
    const email = typeof entrada?.email === "string" ? entrada.email.trim().toLowerCase() : "";
    const password = typeof entrada?.password === "string" ? entrada.password : "";
    if (!email || !password) throw new Error("Faltan el correo o la contraseña.");
    return this.auth.confirmarCuentaPendiente(email, password);
  }
}
