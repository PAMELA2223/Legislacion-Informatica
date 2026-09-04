// Cliente de Supabase con la SERVICE ROLE KEY — SOLO para uso en el servidor,
// en operaciones administrativas (ej. sincronizar el rol con Supabase Auth
// cuando un administrador cambia el rol de un usuario). NUNCA exponer esta
// clave al navegador ni importar este archivo desde un componente cliente.

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null; // permite que el resto de la app funcione aunque falte configurar la key
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
