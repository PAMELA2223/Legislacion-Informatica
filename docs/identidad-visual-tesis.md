# IDENTIDAD VISUAL DE TESIS — Rediseño de presentación
## Estado: ✅ Completo

## 0. Nota técnica importante

Durante esta fase el entorno de generación se reinició y perdí acceso
temporal a los archivos ya construidos. Para continuar con seguridad sobre
el proyecto real (y no reconstruir de memoria un proyecto tan grande, con
riesgo de introducir inconsistencias con el RBAC y el módulo de tutoría ya
validados), te pedí que resubieras el último zip entregado
(`plataforma-completa__centralizado_.zip`) y confirmé que traía el RBAC
intacto antes de tocar nada. Este rediseño se hizo sobre esa base real.

## 1. Paleta de colores — mapeo a los tokens existentes

El proyecto ya usaba un sistema de tokens CSS (no colores sueltos) desde
una fase anterior, lo que hizo este rediseño de bajo riesgo: **un solo
archivo (`globals.css`) cambia y toda la app se retematiza.**

| Token | Antes | Ahora | Uso |
|---|---|---|---|
| `navy` *(nuevo)* | — | `#0F172A` | Navbar, hero, footer, secciones estructurales |
| `navy-light` *(nuevo)* | — | `#1E293B` | Gradientes sobre navy |
| `primary` | `#2563EB` | `#2563EB` (sin cambio) | Ya coincidía exactamente con "azul tecnológico" pedido |
| `accent` | Ámbar `#F59E0B` | Turquesa `#14B8A6` | Indicadores, insignias, elementos de innovación |
| `success` | Verde `#61E07D` | Turquesa `#14B8A6` (unificado con accent) | Estados de éxito/aprobado |
| `gold` *(nuevo)* | — | `#D4A72C` | Uso mínimo: badge del Hero, acentos del escudo SVG, detalles de "Sobre el proyecto" |
| `foreground` | `#1E293B` | `#0F172A` | Texto principal (coincide exacto con el pedido) |
| `muted-foreground` | `#475569` | `#64748B` | Texto secundario (coincide exacto con el pedido) |
| `background` / `surface` | `#F8FAFC` / `#FFFFFF` | Sin cambio | Ya coincidían exactamente |

**Modo oscuro** reescrito con la escala pedida (`#020617` → `#0F172A` →
`#1E293B`), en vez de una simple inversión de blanco/negro.

Cambiar `accent`/`success` a turquesa afecta ~10 archivos que ya usaban ese
token (insignias, ranking, prioridades de tareas) — **ningún componente se
tocó**, solo cambió el color detrás del nombre del token. Es intencional:
consolida success + accent en un solo color turquesa, coherente con el
pedido de mantener la paleta minimalista (Sección 25).

## 2. Navbar — identidad estructural navy

- Fondo `bg-navy` en vez de blanco, con logo (ícono `Scale` en un cuadro
  con gradiente primary→accent) + nombre + subtítulo "Plataforma académica"
- Indicador de usuario: avatar + **chip de rol con color propio por rol**
  (dorado para Administrador, turquesa para Docente, azul para Estudiante) —
  diferencia visualmente el área administrativa como pedía la Sección 37
- Enlace "Admin"/"Panel docente" con ícono `ShieldCheck`, estilo distintivo
- El drawer móvil recibió la misma cabecera navy y la tarjeta de usuario
  ahora usa un degradado navy con el rol resaltado en turquesa — misma
  identidad, sin duplicar lógica (sigue leyendo de `lib/navigation.ts`)

## 3. Landing page — reconstrucción completa

Todas las secciones pedidas, en este orden:

1. **Navbar público** (simple, navy, con Iniciar sesión / Comenzar)
2. **Hero**: badge "Plataforma académica · Proyecto de tesis" (dorado),
   título con degradado primary→turquesa, subtítulo breve, 3 acciones
   (Explorar / Conocer el proyecto / Iniciar sesión), y el **gráfico
   tecnológico-legal** (ver Sección 4)
3. **Presentación + Propósito** (dos columnas, texto breve)
4. **Características** — 6 tarjetas con ícono, reutilizando funcionalidades
   reales del proyecto (módulos, biblioteca, casos, gamificación, tutoría,
   autoevaluación)
5. **Tecnología** — 6 tarjetas con las tecnologías **reales** confirmadas en
   `package.json` (Next.js, TypeScript, Prisma, PostgreSQL/Supabase,
   Tailwind, React) — ninguna inventada
6. **Seguridad y control de acceso** — sección navy, 4 tarjetas conectadas
   explícitamente al RBAC ya implementado (Autenticación, Roles,
   Protección de rutas, Protección de acciones)
7. **Sobre el proyecto** — tarjeta destacada con acento dorado, explica
   problema/propósito/audiencia/aporte en texto breve + 3 bullets visuales
8. **CTA final** + **footer** navy

## 4. Elemento visual del Hero (Sección 29)

`modules/landing/presentation/tech-legal-graphic.tsx`: SVG puro (sin
imágenes de bancos), con:
- Una red de nodos conectados por líneas con degradado azul→turquesa
  (representa tecnología), con animación sutil de pulso
- Un **escudo abstracto** central con una balanza simplificada en dorado
  (representa legislación + seguridad)
- Líneas decorativas tipo "código" en las esquinas

Todo construido con `<svg>`, `<path>`, `<line>`, `<circle>` — cero
dependencias nuevas, cero imágenes externas.

## 5. Microinteracciones y accesibilidad

- `prefers-reduced-motion` ahora se respeta **globalmente** (regla en
  `globals.css`, no solo en el menú móvil como en la fase anterior)
- Animación de entrada (`fade-in-up`) en el Hero, con `motion-reduce`
  respetado automáticamente por la regla global
- Cards con elevación sutil al hover (`hover:-translate-y-1`), desactivada
  también bajo `motion-reduce`

## 6. Qué NO se cambió (alcance y riesgo controlado)

- **Arquitectura**: cero cambios en Next.js, Prisma, Supabase, Clean
  Architecture, RBAC, módulo de tutoría — todo intacto
- **Dashboards por rol** (Administrador/Docente/Estudiante): ya tenían
  contenido diferenciado desde fases anteriores (Sección 34 del pedido ya
  estaba satisfecha en la lógica; este rediseño solo actualiza los colores
  que consumen vía los mismos tokens, sin reescribir cada página)
- Componentes internos de `/admin`, `/docente`, `/dashboard` no se
  reescribieron uno por uno — heredan la nueva paleta automáticamente por
  usar los tokens centralizados, que es justamente la ventaja de no haber
  usado colores sueltos en fases anteriores

## 7. Verificación técnica realizada

- ✅ Balance de llaves/paréntesis verificado en los 5 archivos nuevos/reescritos
- ✅ Auditoría completa de imports `@/` — cero rutas rotas
- ✅ Reemplazo preventivo de 3 íconos (`BookOpenCheck`, `KeyRound`,
  `UserCog`) por equivalentes ya comprobados en este proyecto
  (`BookOpen`, `LogIn`, `Users`) — evita repetir el error de `House` de una
  fase anterior con esta misma versión fija de `lucide-react`
- ✅ Corregido un import duplicado de `Users` generado durante el reemplazo

## 8. Cómo verlo

1. Descomprime el zip, `INSTALAR.bat` → `INICIAR.bat`
2. Abre `http://localhost:3000` (sin iniciar sesión) para ver la nueva landing
3. Inicia sesión con distintos roles para ver el navbar navy con el chip de
   rol diferenciado (dorado/turquesa/azul)
4. Prueba el modo oscuro desde el menú — confirma la escala `#020617`→`#0F172A`→`#1E293B`
