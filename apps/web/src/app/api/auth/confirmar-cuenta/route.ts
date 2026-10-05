import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { ipDeLaPeticion, superaLimite } from "@/lib/limite-intentos";
import { ConfirmarCuentaPendienteUseCase } from "@/modules/auth/application/registro.use-cases";
import { CredencialesInvalidasError } from "@/modules/auth/domain/auth-admin.interface";
import { SupabaseAuthAdminGateway } from "@/modules/auth/infrastructure/supabase-auth-admin.gateway";

// Cuentas creadas ANTES de quitar la confirmación por correo, que quedaron
// sin confirmar: al iniciar sesión con la contraseña correcta, se activan
// automáticamente en vez de pedir que busquen un correo.
export async function POST(request: Request) {
  if (superaLimite(`confirmar:${ipDeLaPeticion(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." }, { status: 429 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "No disponible.", codigo: "SIN_CLAVE_SERVICIO" }, { status: 503 });

  const body = await request.json().catch(() => null);
  try {
    const gateway = new SupabaseAuthAdminGateway(admin, process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const estado = await new ConfirmarCuentaPendienteUseCase(gateway).execute(body);
    return NextResponse.json({ ok: true, estado });
  } catch (error) {
    if (error instanceof CredencialesInvalidasError) return NextResponse.json({ error: error.message }, { status: 401 });
    console.error("[confirmar-cuenta]", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "No se pudo activar la cuenta. Inténtalo de nuevo." }, { status: 400 });
  }
}
