import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { ipDeLaPeticion, superaLimiteAuth } from "@/lib/limite-intentos";
import { RegistrarCuentaUseCase } from "@/modules/auth/application/registro.use-cases";
import { CorreoYaRegistradoError } from "@/modules/auth/domain/auth-admin.interface";
import { traducirErrorAuth } from "@/modules/auth/domain/registro";
import {
  PrismaUsuariosAppRepository,
  SupabaseAuthAdminGateway,
} from "@/modules/auth/infrastructure/supabase-auth-admin.gateway";

// Registro SIN confirmación por correo: el servidor crea la cuenta ya
// confirmada (con la clave de servicio) y el navegador inicia sesión enseguida.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  // Límite por persona (IP + correo) y techo anti-abuso por red: varios
  // estudiantes de la misma aula pueden registrarse sin bloquearse entre sí.
  if (superaLimiteAuth("registro", ipDeLaPeticion(request), body?.email)) {
    return NextResponse.json({ error: "Demasiados intentos con este correo. Espera unos minutos e inténtalo de nuevo." }, { status: 429 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    // Sin clave de servicio el navegador usa el registro estándar de Supabase,
    // que ENVÍA un correo por cada registro. El servicio de correo incluido en
    // Supabase permite muy pocos envíos por hora para TODO el proyecto: tras
    // unos pocos registros, los demás quedan bloqueados hasta que pase la hora.
    console.error(
      "[registro] Falta SUPABASE_SERVICE_ROLE_KEY: el registro depende del cupo de correos de Supabase y se bloqueará tras pocos registros por hora."
    );
    return NextResponse.json({ error: "Registro directo no disponible.", codigo: "SIN_CLAVE_SERVICIO" }, { status: 503 });
  }

  try {
    const gateway = new SupabaseAuthAdminGateway(admin, process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const r = await new RegistrarCuentaUseCase(gateway, new PrismaUsuariosAppRepository(prisma)).execute(body);
    return NextResponse.json({ ok: true, id: r.id });
  } catch (error) {
    if (error instanceof CorreoYaRegistradoError) return NextResponse.json({ error: error.message }, { status: 409 });
    const mensaje = error instanceof Error ? error.message : "";
    console.error("[registro] Error al crear la cuenta:", mensaje);
    return NextResponse.json({ error: traducirErrorAuth(mensaje) || "No se pudo crear la cuenta." }, { status: 400 });
  }
}
