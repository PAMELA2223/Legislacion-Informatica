// Punto único de verdad para "quién es el usuario autenticado" en el
// servidor. Además de leer la sesión de Supabase Auth, sincroniza
// (upsert) el registro correspondiente en la tabla `users` que maneja
// Prisma — de la que dependen inscripciones, XP, favoritos, intentos, etc.
//
// Esto también "cura" cuentas que se registraron antes de este arreglo:
// la próxima vez que inicien sesión, su fila en Prisma se crea automáticamente.
//
// IMPORTANTE — fuente de verdad del ROL:
// El campo `rol` se toma de `app_metadata` de Supabase Auth (que solo el
// servidor puede escribir; nunca de `user_metadata`) SOLO al CREAR el
// registro por primera vez. En actualizaciones posteriores NO se vuelve a
// pisar con el metadata, porque una vez que un administrador cambia el rol
// (vía /admin/usuarios), la tabla de Prisma pasa a ser la fuente de verdad
// para el resto de la aplicación. Si esto se sincronizara en cada carga de
// página, cualquier cambio de rol hecho en Prisma Studio o en el panel admin
// se revertía solo en la siguiente visita — ese fue exactamente el bug
// reportado y corregido aquí.

import { createSupabaseServerClient } from "./supabase-server";
import { prisma } from "./prisma";
import { rolInicial } from "@/modules/auth/domain/registro";

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const meta = user.user_metadata ?? {};
  // SEGURIDAD: el rol inicial NUNCA sale de user_metadata (lo escribe el propio
  // usuario al registrarse, y así podría crearse como ADMINISTRADOR). Solo se
  // confía en app_metadata, que únicamente el servidor puede escribir.
  const rolMeta = rolInicial(user.app_metadata);

  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email ?? "",
      nombre: meta.nombre || undefined,
      // rol: NO se actualiza aquí a propósito (ver nota arriba)
    },
    create: {
      id: user.id,
      email: user.email ?? "",
      nombre: meta.nombre || "",
      rol: rolMeta,
    },
  });

  return user;
}
