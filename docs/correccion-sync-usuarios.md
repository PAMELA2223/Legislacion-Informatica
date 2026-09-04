# CORRECCIÓN — Sincronización Supabase Auth ↔ Prisma
## Bug crítico corregido (afectaba TODAS las fases desde la 3 en adelante)

## 1. El problema

Supabase Auth guarda los usuarios en su propia tabla interna (`auth.users`).
La plataforma, además, tiene su **propia tabla `users`** administrada por
Prisma (definida desde la Fase 2), de la que dependen inscripciones,
progreso, XP, favoritos, intentos de evaluación, casos prácticos y
autoevaluación — todas relacionadas por clave foránea a `users.id`.

Desde la Fase 2, el flujo de registro (`RegisterUseCase` /
`SupabaseAuthRepository`) solo creaba el usuario en Supabase Auth, pero
**nunca insertaba la fila correspondiente en la tabla `users` de Prisma**.
Por eso, cualquier operación que dependiera de esa fila (dashboard, inscribir
a un módulo, guardar un intento, etc.) fallaba con `NotFoundError: No User found`.

## 2. La corrección

Se creó `src/lib/get-authenticated-user.ts`, un único punto de verdad para
"quién es el usuario autenticado" en el servidor. Además de leer la sesión,
**sincroniza (upsert) automáticamente** la fila en Prisma:

```ts
export async function getAuthenticatedUser() {
  // ...lee la sesión de Supabase Auth...
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email, nombre, rol },   // mantiene sincronizado si cambia el metadata
    create: { id: user.id, email, nombre, rol: rol ?? "ESTUDIANTE" },
  });
  return user;
}
```

Se reemplazó el patrón repetido (`createSupabaseServerClient()` +
`supabase.auth.getUser()`) por `getAuthenticatedUser()` en **21 archivos**:
las 15 páginas protegidas y las 6 rutas API que dependen de `userId`.

## 3. Por qué esto también "cura" cuentas ya registradas

Como el `upsert` se ejecuta en **cada** carga de página protegida, cualquier
cuenta que se haya registrado antes de este arreglo (y que por eso no tenía
fila en Prisma) queda sincronizada automáticamente la próxima vez que esa
persona inicie sesión y visite cualquier página — sin necesidad de volver a
registrarse ni de intervención manual en la base de datos.

## 4. Bug secundario corregido de paso: XP/nivel obsoletos en `/perfil`

La página de perfil leía XP y nivel del **metadata de Supabase Auth**, que
nunca se actualiza (el sistema de gamificación de la Fase 7 actualiza
directamente la tabla `users` de Prisma). Esto hacía que `/perfil` siempre
mostrara 0 XP / Nivel 1, sin importar el progreso real. Se corrigió para que
`/perfil` lea XP y nivel directamente de Prisma, la fuente de verdad real.

## 5. Verificación realizada

- ✅ Los 21 archivos migrados verificados uno por uno (sin referencias huérfanas a `supabase.`)
- ✅ Auditoría completa de imports `@/` — cero rutas rotas
- ✅ El `upsert` no sobreescribe `nombre`/`rol` con vacío si el metadata no los trae (usa `undefined` para "no tocar")

## 6. Nota para el futuro (Fase 9 — Administración)

Cuando se construya la gestión de usuarios en la Fase 9, este mismo patrón
(`getAuthenticatedUser`) debe seguir siendo el único punto de entrada para
leer el usuario autenticado en páginas y rutas nuevas — evita reintroducir
este bug en las fases que faltan.
