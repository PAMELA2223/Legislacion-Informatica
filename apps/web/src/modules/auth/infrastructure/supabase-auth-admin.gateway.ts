// SOLO SERVIDOR: usa la clave de servicio (SUPABASE_SERVICE_ROLE_KEY).
// Nunca importar desde un componente cliente.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";
import { esErrorCorreoNoConfirmado } from "../domain/registro";
import {
  CorreoYaRegistradoError,
  CredencialesInvalidasError,
  type IAuthAdminGateway,
  type IUsuariosAppRepository,
} from "../domain/auth-admin.interface";

export class SupabaseAuthAdminGateway implements IAuthAdminGateway {
  constructor(
    private readonly admin: SupabaseClient, // cliente con clave de servicio
    private readonly url: string,
    private readonly anonKey: string
  ) {}

  async crearUsuarioConfirmado({ email, password, nombre }: { email: string; password: string; nombre: string }) {
    const { data, error } = await this.admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ← la cuenta queda confirmada: Supabase no envía correo de confirmación
      user_metadata: { nombre },
      app_metadata: { rol: "ESTUDIANTE" }, // solo el servidor puede escribir app_metadata
    });
    if (error) {
      if (error.code === "email_exists" || /already (been )?registered|already exists/i.test(error.message)) {
        throw new CorreoYaRegistradoError();
      }
      throw new Error(error.message);
    }
    if (!data.user) throw new Error("No se pudo crear la cuenta.");
    return { id: data.user.id };
  }

  async confirmarCuentaPendiente(email: string, password: string): Promise<"confirmada" | "ya-confirmada"> {
    // 1. Verificar la contraseña con un cliente público y sin sesión persistente.
    const publico = createClient(this.url, this.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await publico.auth.signInWithPassword({ email, password });
    if (!error) return "ya-confirmada";
    // Supabase solo responde "correo no confirmado" cuando la contraseña es correcta;
    // con contraseña incorrecta responde "credenciales inválidas".
    if (!esErrorCorreoNoConfirmado(error)) throw new CredencialesInvalidasError();

    // 2. Buscar la cuenta y marcar su correo como confirmado.
    for (let pagina = 1; pagina <= 50; pagina++) {
      const { data, error: errLista } = await this.admin.auth.admin.listUsers({ page: pagina, perPage: 200 });
      if (errLista) throw new Error(errLista.message);
      const usuario = data.users.find((u) => u.email?.toLowerCase() === email);
      if (usuario) {
        const { error: errConfirmar } = await this.admin.auth.admin.updateUserById(usuario.id, { email_confirm: true });
        if (errConfirmar) throw new Error(errConfirmar.message);
        return "confirmada";
      }
      if (data.users.length < 200) break;
    }
    throw new CredencialesInvalidasError();
  }
}

export class PrismaUsuariosAppRepository implements IUsuariosAppRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async asegurarEstudiante({ id, email, nombre }: { id: string; email: string; nombre: string }) {
    await this.prisma.user.upsert({
      where: { id },
      update: {}, // si ya existe, no se toca (en especial, nunca el rol)
      create: { id, email, nombre, rol: "ESTUDIANTE" },
    });
  }
}
