# CORRECCIÓN — Doble fuente de verdad del rol (Prisma vs. Supabase Auth JWT)
## Bug crítico corregido: por qué el cambio de rol "no se reflejaba"

## 1. Causa raíz encontrada (confirmada en el código, no una suposición)

La aplicación guardaba el rol de un usuario en **dos lugares distintos**:

1. La tabla `users` de **Prisma** (la que edita `/admin/usuarios` y Prisma Studio)
2. El `user_metadata` del **JWT de sesión de Supabase Auth** (fijado una sola
   vez al registrarse, y usado por el `middleware.ts` para decidir si se
   permite entrar a `/admin` o `/docente`)

`getAuthenticatedUser()` —el punto central por el que pasa cada página—
hacía un `upsert` que **sobrescribía el rol de Prisma con ese metadata viejo
en cada carga de página**. Resultado: cualquier cambio de rol (desde el
panel admin o directamente en Prisma Studio) se revertía solo en la
siguiente visita, y el `middleware` nunca se enteraba del cambio porque lee
el JWT, no Prisma.

Esto explica exactamente el síntoma reportado: "Prisma cambia el rol, pero
el panel sigue mostrando ESTUDIANTE" / "no puedo entrar a /admin".

## 2. La corrección (arquitectura, sin duplicar nada)

**Prisma pasa a ser la única fuente de verdad del rol** dentro de la
aplicación. Cambios concretos:

| Archivo | Antes | Ahora |
|---|---|---|
| `lib/get-authenticated-user.ts` | Sobrescribía `rol` en cada visita con el metadata de Supabase Auth | Solo fija `rol` la primera vez (al crear el usuario); nunca lo vuelve a tocar |
| `middleware.ts` | Bloqueaba `/admin` y `/docente` leyendo el rol del JWT (Edge Runtime, no puede usar Prisma) | Solo verifica que haya sesión iniciada; el rol fino se verifica en cada página con Prisma |
| `admin/layout.tsx`, `docente/page.tsx`, `dashboard/page.tsx`, `(dashboard)/layout.tsx` (NavBar) | Leían `user.user_metadata?.rol` | Consultan `prisma.user.findUnique(...).rol` |
| **10 rutas API de administración** | Cada una tenía su propia función `requireAdmin()` local, leyendo el JWT | Se centralizaron en `lib/require-admin.ts`, que consulta Prisma |
| `PrismaAdminRepository.cambiarRolUsuario` | Solo actualizaba Prisma | Además sincroniza el `user_metadata` de Supabase Auth vía Admin API (opcional, ver Sección 3) |

Ya no hay dos fuentes de verdad divergentes: Prisma manda, y todo el resto
de la aplicación (páginas y API) pregunta a Prisma, no al JWT.

## 3. Sincronización opcional con Supabase Auth (Service Role Key)

Aunque Prisma ya es suficiente para que la app funcione correctamente, se
agregó además una sincronización hacia el `user_metadata` de Supabase Auth
cuando un administrador cambia un rol, usando la **Service Role Key** (clave
de administrador de Supabase, distinta del `anon key`).

**Es opcional**: si no la configuras, el cambio de rol funciona igual dentro
de la app (Prisma manda), pero verás un aviso en la consola del servidor
recordándotelo. Si la configuras, además queda sincronizado el JWT por si
en el futuro se necesita en un contexto que no pueda consultar Prisma.

**Cómo obtenerla y configurarla:**
1. En supabase.com → tu proyecto → **Settings → API**
2. Copia la clave de la sección **"service_role"** (⚠️ nunca la sección "anon")
3. Pégala en `apps/web/.env.local`, en la variable `SUPABASE_SERVICE_ROLE_KEY`
4. Corre `INSTALAR.bat` de nuevo (sincroniza `.env.local` → `.env`)

## 4. Herramienta de diagnóstico nueva

Se agregó `DIAGNOSTICAR.bat`, que ejecuta `scripts/diagnostico.ts` (solo
lectura, no modifica nada) y reporta:

- Si `.env` y `.env.local` tienen el mismo `DATABASE_URL` (la causa más
  común de "Prisma ve otra base de datos distinta al panel")
- A qué base de datos/esquema real está conectado Prisma en este momento
- El conteo real y el listado completo de usuarios (id, email, rol)
- Si Row Level Security (RLS) está activado en la tabla `users` — y si lo
  está, qué políticas existen (podrían estar filtrando filas silenciosamente)

Úsalo si después de esta corrección el problema de "Prisma solo muestra 1
usuario" persiste — te dirá con certeza cuál de las causas posibles aplica
en tu caso, en vez de adivinar.

## 5. Verificación realizada

- ✅ Auditoría completa de imports `@/` sin rutas rotas
- ✅ Verificado que no queden funciones `requireAdmin` locales duplicadas
- ✅ Verificado que ninguna página siga leyendo `user_metadata?.rol`
- ⏳ Pendiente que tú ejecutes `DIAGNOSTICAR.bat` para confirmar el estado real de tu base de datos (Problema A del documento)

## 6. Qué probar ahora

1. Ejecuta `DIAGNOSTICAR.bat` y revisa la Sección 5 del reporte (listado de usuarios) — ¿coincide con lo que esperas?
2. Desde `/admin/usuarios`, cambia el rol de tu cuenta a `ADMINISTRADOR` (o hazlo en Prisma Studio si aún no tienes acceso)
3. Recarga cualquier página — el rol ya NO debería revertirse
4. Entra a `/admin` — debería dejarte pasar inmediatamente, sin necesidad de cerrar sesión
