# MÓDULO DE TUTORÍA — FASE 3: Panel del Docente
## Estado: ✅ Completa

## 1. Qué se agregó

| Pantalla | Ruta | Qué hace |
|---|---|---|
| Agregar estudiante | `/docente/agregar-estudiante` | Busca estudiantes (debounce 300ms), muestra si ya tienen tutor, botón "Solicitar tutoría" |
| Mis estudiantes | `/docente/estudiantes` | Lista solo los estudiantes con tutoría **ACTIVA** del docente autenticado, con buscador por nombre |
| Perfil de tutoría | `/docente/estudiantes/[id]` | Información del estudiante + resumen académico (reutilizado) + acción "Finalizar tutoría" |
| Panel del docente | `/docente` (ya existía) | Se agregó la sección **"Mi tutoría"** debajo de "Resumen general", sin mezclar ambos conjuntos de datos (Sección 24) |

## 2. Seguridad verificada en servidor (no solo en la UI)

`/docente/estudiantes/[id]` usa `requireTutorDe(estudianteId)` —creado en la
Fase 2— **antes** de renderizar cualquier dato. Si el docente autenticado no
tiene una tutoría `ACTIVA` con ese estudiante específico (y no es
administrador), la página responde `notFound()` sin filtrar ningún dato.
Esto es exactamente la prueba de seguridad pedida en la Sección 20/29:
*"docente A no puede acceder a estudiante tutorado por docente B"* —
funciona aunque se edite la URL manualmente.

## 3. Reutilización confirmada (Sección 26 — rendimiento)

- El resumen académico (`AcademicSummaryCard`) reutiliza
  `ObtenerResumenAcademicoUseCase` de la Fase 2, que consulta únicamente
  las tablas del estudiante puntual (`where: { userId: estudianteId }`) —
  nunca se trae la información de todos los estudiantes de la plataforma.
- `/docente/estudiantes` solo pide el resumen académico de los estudiantes
  ya filtrados por `ACTIVA` y por el docente autenticado (`docenteId`), no
  de todos los estudiantes de la base.
- El componente `StatCard` (de la Fase 7, Dashboard) se reutiliza tal cual
  en `AcademicSummaryCard` — no se creó un componente de tarjeta nuevo.

## 4. UX

- El enlace **"Mis estudiantes"** en el `NavBar` solo aparece si el rol
  (fuente: Prisma) es `DOCENTE` — se agregó una función `obtenerEnlaces(rol)`
  en vez de duplicar el componente completo.
- Mismo sistema de diseño que el resto de la plataforma: `StatCard`,
  `ProgressBar`, `Button`, tokens de color (`text-success`, `bg-primary/10`,
  etc.) — cero componentes nuevos de UI base.

## 5. Qué falta (próximas fases)

- Fase 4: la sección "Plan de acompañamiento" del perfil de tutoría hoy
  muestra un aviso ("se habilita en la siguiente fase"); ahí se agregan
  las 4 pestañas (tareas, objetivos, observaciones, reuniones, recursos) —
  el repositorio ya tiene los 16 métodos listos desde la Fase 2. También se
  agrega el panel del lado del estudiante ("Mi tutor" / "Mi plan").
- Fase 5: panel del administrador (`/admin/tutorias`), pruebas de
  seguridad formales y `docs/tutoria-maestro-estudiante.md` final.

## 6. Cómo probarlo

1. Inicia sesión con una cuenta `DOCENTE` (cambia el rol desde
   `/admin/usuarios` o `scripts/hacer-admin.ts` si necesitas crear una)
2. Ve a `/docente` → sección "Mi tutoría" → **Agregar estudiante**
3. Busca y solicita tutoría de un estudiante existente
4. Ve a `/docente/estudiantes` → deberías verlo con su progreso real
5. Entra a su perfil → deberías ver el resumen académico

**Pendiente tu aprobación para iniciar la Fase 4 (Plan de acompañamiento + Panel del Estudiante).**
