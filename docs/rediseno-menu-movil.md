# REDISEÑO DEL MENÚ MÓVIL — NAVBAR
## Estado: ✅ Completo

## 1. Análisis previo (lo que ya existía, reutilizado tal cual)

- **Navbar**: `src/components/nav-bar.tsx` — un único archivo, ya identificado
- **Layout que lo renderiza**: `app/(dashboard)/layout.tsx`
- **Roles**: `ADMINISTRADOR`, `DOCENTE`, `ESTUDIANTE`, `INVITADO` — fuente de verdad en Prisma (ver corrección previa de roles)
- **Rutas**: las 11 de `ENLACES_BASE` + las condicionales por rol (`/docente/estudiantes`, `/mi-tutoria`, `/admin`, `/docente`)
- **Modo oscuro**: `next-themes`, ya integrado (`useTheme`)
- **Logout**: `createSupabaseBrowserClient().auth.signOut()`
- **Iconos**: `lucide-react`, ya en uso en todo el proyecto
- **Sistema de diseño**: tokens de Tailwind (`bg-surface`, `text-foreground`, `bg-primary/10`, `shadow-card-*`, etc.)

**No se creó un Navbar nuevo.** Se modificó `nav-bar.tsx` únicamente en su
bloque móvil, y se extrajo un componente nuevo y reutilizable
(`mobile-nav-drawer.tsx`) para no mezclar la lógica de escritorio (que no
se tocó) con el nuevo drawer.

## 2. Qué cambió

| Archivo | Cambio |
|---|---|
| `components/mobile-nav-drawer.tsx` | **Nuevo.** El drawer rediseñado completo |
| `components/nav-bar.tsx` | Bloque `<nav className="md:hidden">` (lista simple) reemplazado por `<MobileNavDrawer />`. Bloque desktop **sin ningún cambio** |
| `app/(dashboard)/layout.tsx` | Ahora pasa `nombre` y `email` reales de Prisma al Navbar (antes solo pasaba `rol`) |

## 3. Estructura del nuevo drawer

```
┌─────────────────────────────┐
│ [L] Legislación Informática ✕│  ← Cabecera
├─────────────────────────────┤
│  👤  Nombre real             │  ← Tarjeta de usuario (datos reales)
│      Rol · correo            │     de Prisma, nunca inventados
├─────────────────────────────┤
│ PRINCIPAL          ˅         │
│   🏠 Inicio                  │  ← Acordeón, se auto-expande
│ ACADÉMICO           ˅        │     la sección con la ruta activa
│   📖 Módulos                 │
│   📚 Biblioteca               │
│   ✅ Evaluaciones             │
│   ⚖️  Casos prácticos          │
│   📋 Autoevaluación           │
│   (+ Mis estudiantes / Mi     │
│      tutoría, según el rol)   │
│ COMUNIDAD            ˅       │
│   💬 Foro  🏆 Ranking  🎯 Retos│
│   🔖 Glosario  📰 Noticias    │
├─────────────────────────────┤
│ CONFIGURACIÓN                │
│   👤 Perfil                  │
│   ⚙️  Admin / Panel docente   │  ← solo si el rol aplica
│   🌙 Modo oscuro/claro        │
├─────────────────────────────┤
│   [ 🚪 Cerrar sesión ]        │  ← fijo abajo, diferenciado
└─────────────────────────────┘
```

## 4. Cómo se cumplió cada requisito

| Requisito del pedido | Implementación |
|---|---|
| Overlay con blur, cierra al hacer clic | `bg-foreground/40 backdrop-blur-sm`, `onClick={onClose}` |
| Animación de entrada lateral | `translate-x-full → translate-x-0`, 300ms |
| Acordeones animados sin saltos | Técnica CSS `grid-template-rows: 0fr/1fr` (sin medir alturas en JS, sin saltos) |
| Rotación del icono de acordeón | `rotate-180` en `ChevronDown` |
| Animación del botón hamburguesa | Cross-fade + rotación entre `Menu` y `X` |
| Estado activo visible | Fondo `bg-primary/10`, texto `text-primary`, **barra lateral** (`absolute left-0 ... bg-primary`) + `aria-current="page"` |
| `prefers-reduced-motion` | `motion-reduce:transition-none` en **todas** las transiciones del drawer |
| Cierre con Escape | `useEffect` con listener de teclado, solo mientras está abierto |
| Foco al abrir | Se enfoca el botón de cerrar (`cerrarBtnRef.current?.focus()`) |
| Scroll bloqueado con el menú abierto | `document.body.style.overflow = "hidden"` |
| `aria-label`, `aria-expanded`, `aria-current`, `role="dialog"` | Todos presentes |
| No usar datos inventados del usuario | `nombre`/`email` vienen de `prisma.user`, pasados desde el layout |
| No romper roles/permisos/rutas | La lista de enlaces es la **misma fuente** (`ENLACES_BASE` + lógica por rol) que ya existía; solo se reorganiza visualmente |
| No agregar dependencias nuevas | Solo `lucide-react`, `next-themes`, Tailwind — todo ya estaba instalado |
| Desktop sin cambios | El bloque `<nav className="hidden md:flex">` es exactamente el mismo código que antes |

## 5. Verificación realizada

- ✅ Auditoría completa de imports `@/` — cero rutas rotas
- ✅ Balance de llaves verificado en ambos archivos (sin errores de sintaxis evidentes)
- ✅ La lista de enlaces del drawer proviene de la misma lógica de roles que el desktop (no hay una segunda fuente de verdad de rutas)
- ⏳ Pendiente que tú confirmes visualmente en el navegador: abrir/cerrar, overlay, acordeones, modo oscuro, logout, y los 3 roles (recomiendo probar con DevTools en modo responsive, ancho < 768px)

## 6. Checklist de validación (Sección 18 del pedido) — guía para probarlo

1. Abre la app en el navegador con el panel de DevTools en modo móvil (< 768px)
2. Toca el ícono de hamburguesa → debe animarse a "X" y abrirse el drawer desde la derecha
3. Verifica la tarjeta de usuario: debe mostrar tu nombre y correo reales
4. Toca una sección (ej. "Comunidad") → debe expandirse/colapsarse suavemente
5. Navega a cualquier enlace → el menú debe cerrarse y la ruta activa debe verse resaltada la próxima vez que abras el menú
6. Toca el overlay (fuera del drawer) → debe cerrarse
7. Presiona Escape con el menú abierto → debe cerrarse
8. Cambia el modo oscuro desde el menú → confirma que todo el drawer se adapta (fondo, texto, tarjeta, bordes)
9. Prueba con una cuenta `DOCENTE` → debe aparecer "Mis estudiantes" y "Panel docente"
10. Prueba con una cuenta `ADMINISTRADOR` → debe aparecer "Admin"
11. Cierra sesión desde el botón inferior → debe funcionar igual que antes
12. Verifica en escritorio (> 768px) que la barra superior se ve exactamente igual que antes de este cambio
