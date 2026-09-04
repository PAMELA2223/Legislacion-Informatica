# CORRECCIÓN — El rol nunca depende del frontend (cierre de brecha en `SupabaseAuthRepository`)

## 1. Contexto: análisis solicitado

Se pidió que las interfaces de Docente e Invitado permanezcan ocultas y
determinadas exclusivamente por el rol almacenado en base de datos, sin
ningún selector manual, y con el control de rol residiendo en
backend/base de datos — no en el frontend.

## 2. Lo que ya estaba correctamente implementado (sin cambios)

Auditoría de todo el flujo de roles:

- **`lib/authorization.ts`** (`getAuthContext`, `requireRole`,
  `requireAutenticado`): consulta el rol **siempre** contra Prisma. Es el
  único punto que decide qué puede ver un usuario.
- **Layouts de servidor** (`(dashboard)/layout.tsx`, `docente/layout.tsx`,
  `admin/layout.tsx`): llaman a `requireRole`/`requireAutenticado` y pasan
  el rol como prop a `NavBar`/`AppSidebar` — componentes de cliente que
  **reciben** el rol, nunca lo determinan ellos mismos.
- **`middleware.ts`**: solo verifica sesión (no puede consultar Prisma en
  el Edge Runtime); el rol fino se verifica en cada página, correctamente.
- **Selector de rol existente** (`RoleSelect` en `/admin/usuarios`): es
  exclusivo del administrador, protegido en el servidor por
  `requireAdmin()` en `PATCH /api/admin/usuarios/[id]`. No es un mecanismo
  que el propio usuario pueda usar sobre sí mismo.
- **INVITADO**: ya está excluido de `ROLES_CON_ACCESO_A_PLATAFORMA`; no
  tiene acceso a ninguna sección interna, solo a las páginas públicas.

**Conclusión: no existía ningún selector de formato visible ni forma de
que un usuario cambiara su propio rol desde la interfaz.** Este punto ya
cumplía el objetivo pedido antes de este cambio.

## 3. Brecha encontrada y corregida

`SupabaseAuthRepository.login()` y `.getCurrentUser()`
(`src/modules/auth/infrastructure/supabase-auth.repository.ts`) leían el
campo `rol` de `user_metadata` de Supabase Auth:

```ts
// ANTES
rol: meta.rol ?? "ESTUDIANTE",
```

`user_metadata` es un campo que **el propio usuario puede modificar desde
la consola del navegador**, llamando directamente al SDK de Supabase
(`supabase.auth.updateUser({ data: { rol: "ADMINISTRADOR" } })`), sin pasar
por ningún endpoint de este backend.

**Impacto real verificado**: ninguno explotable hoy — se confirmó, línea
por línea, que ningún componente de la interfaz usa el `rol` devuelto por
`login()` (el redireccionamiento post-login usa `redirectTo`/`/dashboard`,
no el rol) ni por `getCurrentUser()` (caso de uso sin ningún consumidor
actual). Aun así, se corrigió por ser exactamente el tipo de vector que se
pidió cerrar, y porque un cambio futuro (ej. un mensaje de bienvenida
personalizado, o un redirect "inteligente" según rol) podría empezar a
confiar en este valor sin darse cuenta de que es manipulable.

### Restricción técnica que definió la solución

Este repositorio se instancia desde **componentes de cliente**
(`login-form.tsx`, `register-form.tsx`, `reset-password-form.tsx`) — no
puede importar Prisma (librería de solo-servidor). Por lo tanto, la
corrección no fue "consultar Prisma aquí", sino **dejar de confiar en el
metadata**: `login()` y `getCurrentUser()` ahora devuelven `rol: "ESTUDIANTE"`
(el valor por defecto seguro, igual que el `@default(ESTUDIANTE)` de
Prisma) en lugar de repetir lo que diga `user_metadata`, con comentarios
explícitos en el código indicando que **el rol real y autoritativo se
obtiene siempre del lado del servidor vía `getAuthContext()`**, nunca de
esta clase.

## 4. Qué NO cambió (a propósito)

- No se creó un sistema de roles nuevo — se usó el ya existente
  (`ROLES_VALIDOS` de Prisma, la fuente de verdad en `authorization.ts`).
- No se tocó `RegisterUseCase`, `LoginUseCase`, `authorization.ts`,
  `get-authenticated-user.ts`, `middleware.ts`, `navigation.ts`,
  `NavBar`, `AppSidebar`, ni el flujo de `/admin/usuarios` — ya eran
  correctos.
- No se ocultó nada "solo visualmente": la corrección es a nivel del dato
  que el repositorio puede devolver, no de un botón que se esconde.

## 5. Verificación realizada

- Prueba nueva y dedicada:
  `src/modules/auth/infrastructure/supabase-auth.repository.test.ts` — 3
  casos que inyectan `rol: "ADMINISTRADOR"` en `user_metadata` (simulando
  la manipulación desde el navegador) y confirman que `login()`,
  `getCurrentUser()` y `register()` **nunca** devuelven ese rol elevado.
- `npm run lint` — sin errores.
- `npx vitest run` — 19/19 pruebas pasando (16 previas + 3 nuevas).
- Build de Next.js (`next build`) — la fase de compilación de webpack
  (`✓ Compiled successfully`) confirma que el cambio no introduce
  dependencias de servidor en el bundle de cliente.
