import { getAuthContext } from "./authorization";

/**
 * Verifica que haya sesión Y que el rol en Prisma (fuente de verdad) sea
 * ADMINISTRADOR. Devuelve el contexto de autenticación si es válido, o
 * `null` si no está autorizado.
 *
 * Delegado a `lib/authorization.ts` (getAuthContext) para no repetir la
 * consulta a Prisma que antes se hacía por separado aquí y en
 * `require-tutor-of.ts`. Se mantiene esta función porque las rutas API la
 * usan como un simple booleano-o-contexto (sin redirigir), a diferencia de
 * `requireRole()` que sí redirige — ambas comparten la misma fuente de rol.
 */
export async function requireAdmin() {
  const ctx = await getAuthContext();
  if (ctx?.rol !== "ADMINISTRADOR") return null;
  return ctx;
}
