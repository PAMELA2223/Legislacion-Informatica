# SISTEMA DE DISEÑO — Actualización
## Estado: ✅ Aplicado a todo el proyecto (sin tocar lógica)

## 1. Qué se cambió y por qué fue seguro hacerlo en todo el proyecto

Desde la Fase 1, todos los componentes usan los **tokens de color de Tailwind**
(`bg-primary`, `text-foreground`, `border-border`, `bg-surface`,
`text-muted-foreground`, etc.) definidos centralmente en `tailwind.config.ts`,
en vez de colores sueltos. Auditoría confirmada: no existe ningún color
hexadecimal suelto ni clase `gray-`/`slate-` de Tailwind por defecto en todo
el código de presentación.

Esto significa que **actualizar un solo archivo** (`tailwind.config.ts`)
propaga el nuevo sistema de diseño a las ~30 páginas y componentes de la
plataforma de forma automática y consistente, sin riesgo de romper lógica.

## 2. Mapeo de la paleta nueva a los tokens existentes

| Token Tailwind | Antes | Ahora | Uso |
|---|---|---|---|
| `primary` | `#1E40AF` | `#2563EB` | Botones principales, enlaces activos, foco |
| `primary-hover` *(nuevo)* | — | `#1D4ED8` | Hover de botones primarios |
| `primary-dark` *(nuevo)* | — | `#1E3A8A` | Reservado para encabezados/estados oscuros |
| `secondary` | `#0F766E` | `#1CB94B` | Botones secundarios, badges de categoría |
| `success` *(nuevo)* | — | `#61E07D` | Estados de éxito: aprobado, correcto, completado |
| `accent` | `#F59E0B` | `#F59E0B` (sin cambio) | Gamificación (XP), no especificado en la nueva paleta |
| `background` | `#F8FAFC` | `#F8FAFC` (sin cambio) | Fondo general |
| `background-secondary` *(nuevo)* | — | `#F1F5F9` | Fondos secundarios (tracks, secciones alternas) |
| `surface` | `#FFFFFFCC` (glass) | `#FFFFFF` (sólido) | Tarjetas y navbar |
| `foreground` | `#0F172A` | `#1E293B` | Texto principal |
| `muted-foreground` | `#64748B` | `#475569` | Texto secundario |
| `disabled-foreground` *(nuevo)* | — | `#64748B` | Texto deshabilitado |
| `border` | `#E2E8F0` | `#E2E8F0` (sin cambio) | Bordes suaves (tarjetas) |
| `border-strong` *(nuevo)* | — | `#CBD5E1` | Bordes de inputs y elementos interactivos |

Sombras nuevas (`shadow-card-sm/md/lg`) con los valores exactos
proporcionados, y radios de borde ya alineados (`rounded-xl` = 12px,
`rounded-2xl` = 16px) desde el diseño original de la Fase 1.

## 3. Ajustes puntuales fuera del cambio de tokens

- **Navbar**: se quitó el efecto glassmorphism (`backdrop-blur` sobre fondo
  translúcido) y se cambió a fondo blanco sólido + `shadow-card-sm`, tal como
  pide el nuevo sistema ("Navbar con fondo blanco y sombra ligera").
- **Botón primario**: el hover pasó de una opacidad (`bg-primary/90`) al color
  exacto `primary-hover` (#1D4ED8), y la sombra pasó de un tinte azul a la
  sombra neutra `shadow-card-sm`.
- **Estados de éxito**: se separaron semánticamente de "secondary" (verde de
  botones) al nuevo token `success`. Se actualizaron 7 componentes donde
  "verde" significaba *aprobado/correcto/completado* (evaluaciones, casos
  prácticos, autoevaluación, progreso de módulos), dejando `secondary`
  únicamente para badges de categoría (biblioteca, dificultad de casos).
- **Tarjetas con hover**: se unificó el `shadow-md` genérico de Tailwind por
  el `shadow-card-md` del nuevo sistema, con transición de 200ms.
- **Inputs**: ahora usan `border-strong` (#CBD5E1) en vez del borde suave de
  las tarjetas, para diferenciar visualmente elementos interactivos.

## 4. Qué NO se tocó

- Ninguna lógica de negocio, caso de uso, repositorio o ruta de API.
- Ninguna estructura de datos ni modelo de Prisma.
- La tipografía ya usaba Inter (con Poppins agregado como alternativa en el
  stack de fuentes, según lo solicitado).
- Los íconos ya eran Lucide en todo el proyecto.

## 5. Verificación realizada

- ✅ Auditoría de imports: ningún archivo roto tras los cambios
- ✅ Auditoría de colores: cero hex sueltos, cero clases `gray-`/`slate-` fuera del sistema
- ✅ Los ~30 componentes/páginas heredan el nuevo estilo sin edición individual

**Este cambio es transversal: aplica automáticamente a todas las fases ya construidas (2 a 7).**
