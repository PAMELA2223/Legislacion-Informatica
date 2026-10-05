import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { ipDeLaPeticion, superaLimite } from "@/lib/limite-intentos";
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
  if (superaLimite(`registro:${ipDeLaPeticion(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." }, { status: 429 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    // Sin clave de servicio el navegador usa el registro anterior de Supabase como respaldo.
    return NextResponse.json({ error: "Registro directo no disponible.", codigo: "SIN_CLAVE_SERVICIO" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
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
