# SIDEBAR LATERAL UNIFICADO POR ROL
## Estado: ✅ Completo

## 1. Componentes creados

| Archivo | Qué es |
|---|---|
| `components/sidebar/app-sidebar.tsx` | **Nuevo.** Sidebar genérico y configurable: colapsar/expandir, tooltips nativos cuando está colapsado, estado activo, tarjeta de usuario, cerrar sesión. Un solo componente para los 3 roles — no se copió 4 veces (Sección 14 del pedido) |

## 2. Archivos modificados

| Archivo | Cambio |
|---|---|
| `lib/navigation.ts` | Se agregó `icon: string` a cada enlace (dato plano, viaja de Server a Client Component sin problema) + `ITEMS_SIDEBAR_ADMIN` (las 11 rutas reales que ya tenía el sidebar de Admin) + `obtenerItemsSidebar(rol)`, la función que decide qué lista usar |
| `app/(dashboard)/layout.tsx` | Ahora renderiza `<AppSidebar>` una sola vez para los 3 roles autenticados, junto al `NavBar` que ya existía |
| `app/(dashboard)/admin/layout.tsx` | Ya no dibuja su propio sidebar (evita duplicarlo); solo mantiene el chequeo de rol y el ancho del contenido |

## 3. Archivo eliminado

`modules/admin/presentation/admin-sidebar.tsx` — **su contenido no se perdió**, migró íntegro a `lib/navigation.ts` (`ITEMS_SIDEBAR_ADMIN`, mismas 11 rutas, mismos labels) y su presentación la asume el nuevo `AppSidebar`. Se eliminó porque quedó sin ninguna referencia después del cambio (confirmé con una búsqueda en todo el proyecto antes de borrarlo).

## 4. Cómo se reutilizó el sidebar de Admin como referencia (Sección 1 del pedido)

El `admin-sidebar.tsx` original era más simple de lo pedido (sin colapsar,
sin tooltips, sin usuario). Se tomó su **contenido** (las 11 rutas reales)
como base y se construyó el comportamiento enriquecido (colapsar/expandir,
tooltips, footer de usuario) una sola vez en `AppSidebar`, aplicado a los 4
roles mediante configuración — no cuatro sidebars distintos.

## 5. Contenido del sidebar por rol (rutas reales, ninguna inventada)

| Rol | Sidebar muestra |
|---|---|
| **ADMINISTRADOR** | Estadísticas, Usuarios y roles, Tutorías, Módulos, Biblioteca, Evaluaciones, Casos prácticos, Glosario, Noticias, Foro, Logs |
| **DOCENTE** | Inicio, Módulos, Biblioteca, Evaluaciones, Casos prácticos, Autoevaluación, Mis estudiantes, Foro, Ranking, Retos, Glosario, Noticias, Mi perfil |
| **ESTUDIANTE** | Inicio, Módulos, Biblioteca, Evaluaciones, Casos prácticos, Autoevaluación, Mi tutoría, Foro, Ranking, Retos, Glosario, Noticias, Mi perfil |
| **INVITADO** | No aplica un sidebar de escritorio (ver Sección 8) |

Docente y Estudiante usan **exactamente la misma función**
(`obtenerEnlacesPlanos(rol)`) que ya usa el navbar superior y el menú
móvil — es estructuralmente imposible que el sidebar muestre una opción que
esos otros dos no muestren, o viceversa.

## 6. Rutas protegidas (sin cambios, ya eran correctas — se confirma aquí)

La protección **nunca dependió del sidebar** (ocultar un enlace no es
protección, como bien señalás en tu pedido). Sigue en 3 capas, ya
implementadas en una fase anterior de RBAC:

1. `middleware.ts` — exige sesión
2. `app/(dashboard)/layout.tsx` — exige rol de plataforma (bloquea INVITADO)
3. `admin/layout.tsx` / `docente/layout.tsx` — exige el rol específico
4. Cada Route Handler sensible verifica el rol de forma independiente

Si un Estudiante escribe `/admin` en la URL, el sidebar nunca llegó a
renderizarse con esa opción — pero aunque lo intente igual, el layout lo
redirige a `/acceso-denegado` antes de mostrar nada.

## 7. Responsive (Sección 9)

El sidebar nuevo es **`hidden lg:flex`** — solo aparece en pantallas de
escritorio. En tablet/móvil se sigue usando el `MobileNavDrawer` que ya
existía (mismo botón hamburguesa, mismo overlay, mismas animaciones) — no
se construyó una tercera navegación paralela, tal como pedía la Sección 9
("mantener consistencia con el menú móvil existente").

## 8. Sobre Invitado — decisión de diseño explicada

Un usuario `INVITADO` no tiene acceso al área `(dashboard)` (bloqueado
desde la fase de RBAC), así que el sidebar nuevo no le aplica — su
navegación pública ya vive en la landing page. Dejé preparada
`ENLACES_INVITADO` en `lib/navigation.ts` con el mismo patrón de
configuración (Inicio, Sobre el proyecto, Iniciar sesión — sin inventar una
página de "Ayuda" que no existe), pero **no forcé un drawer lateral sobre
la landing**: son 3 enlaces que ya caben cómodamente en la barra superior
simple de la página pública, y agregar un sidebar ahí sería sobrecargar una
página pensada para verse limpia en una presentación de tesis. Si prefieres
que sí se muestre como drawer, es un cambio pequeño con la configuración ya
lista — avísame.

## 9. Verificación técnica realizada

- ✅ Auditoría completa de imports `@/` — cero rutas rotas
- ✅ Balance de llaves verificado en los 4 archivos nuevos/modificados
- ✅ Confirmado que ningún otro archivo seguía importando el `AdminSidebar` viejo antes de eliminarlo
- ✅ Los íconos usados en `AppSidebar` (`ChevronsLeft/Right`, `LayoutDashboard`, `UserCheck`, `ScrollText`, etc.) ya estaban en uso en otras partes de este mismo proyecto con esta misma versión de `lucide-react`, o son íconos base de larga data — mismo criterio de precaución que evitó el error de `House` en una fase anterior

## 10. Pendiente / posibles próximos pasos (no bloqueante)

- El estado colapsado/expandido del sidebar **no se persiste** (vuelve a
  expandido al recargar la página) — se decidió así para evitar riesgos de
  hidratación SSR/cliente con `localStorage`, el mismo tipo de problema que
  ya tuvimos con el gráfico radar. Si querés que se recuerde entre
  sesiones, se puede agregar con la misma técnica de "montar primero,
  aplicar preferencia después" que usamos para el gráfico.
- No se agregó "Notificaciones" ni "Configuración" al sidebar de
  Docente/Estudiante porque esas páginas no existen todavía en el
  proyecto — no se inventaron rutas falsas, tal como pedías explícitamente.

## 11. Cómo probar cada rol

1. **Administrador**: entra a cualquier página de `/admin/*` → el sidebar
   debe mostrar las 11 opciones de gestión, con la activa resaltada
2. **Docente**: entra a `/docente` → el sidebar debe mostrar su navegación
   académica + "Mis estudiantes", nunca opciones de Admin
3. **Estudiante**: entra a `/dashboard` → el sidebar debe mostrar "Mi
   tutoría" en vez de "Mis estudiantes", nunca Admin ni Docente
4. **Colapsar/expandir**: usa el botón de flechas en la cabecera del
   sidebar — los enlaces deben reducirse a solo íconos, y al pasar el
   cursor debe aparecer el nombre como tooltip
5. **Responsive**: reduce el ancho de la ventana (o usa DevTools en modo
   móvil) — el sidebar debe desaparecer y el menú hamburguesa/drawer debe
   seguir funcionando exactamente igual que antes
