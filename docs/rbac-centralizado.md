# CONTROL DE ACCESO POR ROLES (RBAC) — CENTRALIZADO
## Estado: ✅ Completo

## 1. Análisis previo (resumen de lo encontrado)

- **Autenticación**: `getAuthenticatedUser()` (ya existía) — sincroniza Supabase Auth con Prisma
- **Fuente del rol**: ya era Prisma en los puntos clave, pero **duplicada** manualmente en ~14 archivos (`prisma.user.findUnique` + `if (rol...)` repetido)
- **Riesgo real encontrado**: el navbar de escritorio y el drawer móvil mantenían **dos listas de enlaces separadas** — exactamente el riesgo de desincronización que describías
- **Gap real encontrado**: las páginas académicas (`/modulos`, `/biblioteca`, `/evaluaciones`, etc.) solo comprobaban `if (!user)`, **sin bloquear el rol `INVITADO`**
- **Gap real encontrado**: `/admin` estaba bien protegido (tenía `layout.tsx`), pero `/docente/*` **no tenía layout compartido** — 3 páginas repetían el mismo chequeo por separado
- El cambio de rol (`role-select.tsx` + su API) **ya estaba bien protegido en servidor** — se confirma, no se modifica

## 2. Solución centralizada creada

### `src/lib/authorization.ts` (nuevo)
Punto único de verdad de permisos:
- `getAuthContext()` — usuario + rol real (Prisma), sin redirigir
- `requireRole(roles)` — exige sesión y rol; redirige a `/login` o `/acceso-denegado`
- `requireAutenticado()` — atajo para "cualquier rol de la plataforma" (bloquea INVITADO)
- `rutaHomeDeRol(rol)` — la "casa" de cada rol (`/admin`, `/docente`, `/dashboard`)

### `src/lib/navigation.ts` (nuevo)
Única lista de enlaces con su rol permitido. **Tanto el navbar de escritorio
como el drawer móvil llaman a la misma función** (`obtenerSeccionesNavegacion` /
`obtenerEnlacesPlanos`) — ya no pueden desincronizarse porque no hay una
segunda lista que mantener.

### `src/app/acceso-denegado/page.tsx` (nuevo)
Página amigable con ícono, mensaje claro y botón "Volver a mi panel"
(usa `rutaHomeDeRol`). **Deliberadamente fuera** del grupo `(dashboard)`
para evitar un bucle de redirección si un `INVITADO` la visita.

## 3. Protección en dos niveles (por capa, de afuera hacia adentro)

| Capa | Qué hace |
|---|---|
| `middleware.ts` (Edge) | Solo exige sesión iniciada (no puede consultar Prisma en Edge Runtime) |
| `app/(dashboard)/layout.tsx` | **Nuevo gate central**: exige rol de plataforma (bloquea INVITADO y sin sesión) para TODA el área autenticada |
| `app/(dashboard)/admin/layout.tsx` | Exige `ADMINISTRADOR` — protege `/admin/*` completo, incluidas subpáginas sin chequeo propio |
| `app/(dashboard)/docente/layout.tsx` (nuevo) | Exige `DOCENTE` o `ADMINISTRADOR` — protege `/docente/*` completo |
| Páginas individuales | Chequeos adicionales **más estrictos** cuando aplica (ej. `/docente/agregar-estudiante` es solo `DOCENTE`, ni siquiera admin) |
| Route Handlers (API) | Cada endpoint sensible verifica rol en servidor, independientemente del layout |

## 4. Archivos modificados — lista completa

**Nuevos:**
- `src/lib/authorization.ts`
- `src/lib/navigation.ts`
- `src/app/acceso-denegado/page.tsx`
- `src/app/(dashboard)/docente/layout.tsx`

**Modificados (páginas y layouts):**
- `src/app/(dashboard)/layout.tsx` — gate central agregado
- `src/app/(dashboard)/admin/layout.tsx` — usa `requireRole()`
- `src/app/(dashboard)/docente/page.tsx` — usa `requireRole()`
- `src/app/(dashboard)/docente/agregar-estudiante/page.tsx` — usa `requireRole(["DOCENTE"])`
- `src/app/(dashboard)/docente/estudiantes/page.tsx` — usa `requireRole(["DOCENTE"])`
- `src/app/(dashboard)/dashboard/page.tsx` — usa `requireAutenticado()` + `rutaHomeDeRol()`

**Modificados (navegación):**
- `src/components/nav-bar.tsx` — consume `lib/navigation.ts`, ya no mantiene su propia lista
- `src/components/mobile-nav-drawer.tsx` — usa los tipos centralizados de `lib/navigation.ts`

**Modificados (helpers de servidor, ahora delegan en `authorization.ts`):**
- `src/lib/require-admin.ts`
- `src/lib/require-tutor-of.ts`

**Modificados (Route Handlers, eliminado el chequeo manual duplicado):**
- `src/app/api/tutoria/solicitar/route.ts`
- `src/app/api/tutoria/estudiantes-disponibles/route.ts`
- `src/app/api/tutoria/[id]/estado/route.ts`
- `src/app/api/tutoria/tareas/[id]/estado/route.ts`

**Sin cambios (ya estaban correctos, se verificaron):**
- Los 11 Route Handlers de `/api/admin/*` (ya usaban `requireAdmin()`)
- `role-select.tsx` y su API — la validación de "solo admin cambia roles" ya era de servidor

## 5. Matriz de permisos — cómo quedó implementada

| Rol | Ve en el menú | Bloqueado en servidor si intenta |
|---|---|---|
| **ADMINISTRADOR** | "Panel administrativo" → `/admin` (ahí vive el `AdminSidebar` ya existente con Usuarios, Tutorías, Biblioteca, etc.) + Perfil | — (acceso total al área admin) |
| **DOCENTE** | Inicio, Académico (Módulos...Autoevaluación, Mis estudiantes), Comunidad, "Panel docente" → `/docente`, Perfil | `/admin` → `/acceso-denegado` |
| **ESTUDIANTE** | Inicio, Académico (...Mi tutoría), Comunidad, Perfil | `/admin`, `/docente`, `/docente/estudiantes` → `/acceso-denegado` |
| **INVITADO** | (no accede al área interna) | Cualquier ruta de `(dashboard)` → `/acceso-denegado` |

## 6. Cómo probar cada rol (Sección 18/19 del pedido)

1. **Como ADMINISTRADOR**: login → debe caer en `/admin`. Prueba escribir manualmente `/docente` → debe ir a `/acceso-denegado`.
2. **Como DOCENTE**: login → `/docente`. Menú debe mostrar "Mis estudiantes" y "Panel docente", **no** "Admin". Escribe `/admin` manualmente → `/acceso-denegado`.
3. **Como ESTUDIANTE**: login → `/dashboard`. Menú debe mostrar "Mi tutoría", **no** "Mis estudiantes" ni "Admin"/"Panel docente". Escribe `/docente` y `/docente/estudiantes` manualmente → ambas a `/acceso-denegado`.
4. **Como INVITADO** (cámbiale el rol a un usuario de prueba desde `/admin/usuarios`): al iniciar sesión, cualquier ruta del área interna (`/dashboard`, `/modulos`, etc.) debe mandarlo a `/acceso-denegado`.
5. **Menú móvil vs. escritorio**: con DevTools en modo responsive, confirma que ves exactamente los mismos enlaces en ambos, para los 3 roles con acceso.
6. **Seguridad de servidor** (no solo UI): con sesión de `ESTUDIANTE`, abre la consola del navegador y ejecuta `fetch('/api/admin/usuarios/ALGUN_ID', {method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({rol:'ADMINISTRADOR'})})` → debe responder `403`, no cambiar nada.

## 7. Verificación técnica realizada

- ✅ Auditoría completa de imports `@/` — cero rutas rotas
- ✅ Balance de llaves verificado en todos los archivos nuevos/reescritos
- ✅ Confirmado que `/acceso-denegado` está **fuera** del grupo `(dashboard)` — evita bucle de redirección para `INVITADO`
- ✅ Cero rutas de página o API con chequeo de rol manual duplicado fuera de los helpers centralizados
- ✅ Modo oscuro, responsive y menú móvil no se tocaron en su diseño, solo en su fuente de datos

## 8. Qué NO se cambió (arquitectura preservada)

- Next.js, Prisma, Supabase, Tailwind, Clean Architecture por módulos — intactos
- El esquema de roles en Prisma (`ADMINISTRADOR`/`DOCENTE`/`ESTUDIANTE`/`INVITADO`) — sin cambios
- El diseño visual del navbar y el drawer móvil (Fase de rediseño anterior) — sin cambios, solo se alimenta de otra fuente de datos
- `AdminSidebar` (navegación interna de `/admin`) — reutilizada tal cual, no duplicada en el navbar principal
