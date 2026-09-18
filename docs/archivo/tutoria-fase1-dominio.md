# MÓDULO DE TUTORÍA — FASE 1: Base de datos + Dominio
## Estado: ✅ Completa

## 1. Qué se agregó

**Base de datos** (`prisma/schema.prisma`): 6 modelos nuevos —
`TutoringAssignment`, `TutoringTask`, `TutoringObjective`,
`TutoringObservation`, `TutoringMeeting`, `TutoringResource` — más 6 enums
de estado. Relaciones inversas agregadas a `User` (3) y `Course` (1). **No
se modificó ni se borró ningún modelo existente.**

**Dominio** (`modules/tutoring/domain/`):
- `tutoring.entity.ts` — tipos de las 6 entidades + `TutoringRules` con las
  reglas de negocio clave: transiciones de estado válidas, validación de
  duplicados, validación de progreso (0-100) y de título mínimo.
- `tutoring-repository.interface.ts` — el contrato completo (26 métodos)
  que implementará Prisma en la Fase 2.

**Aplicación** (`modules/tutoring/application/`): 20 casos de uso en 2
archivos (ciclo de vida de la tutoría / plan de acompañamiento).

## 2. Decisiones de diseño relevantes

- **`@@unique([docenteId, estudianteId])`** en `TutoringAssignment` evita
  que un mismo docente solicite dos veces al mismo estudiante.
- La regla "un estudiante no puede tener dos tutorías **activas**
  simultáneas" se valida en `SolicitarTutoriaUseCase` (dominio), no con una
  constraint de base de datos, porque Prisma no puede expresar unicidad
  condicionada por estado (`ACTIVA` vs. otros estados).
- **Aprobación administrativa opcional** (Sección 3 del pedido): por ahora
  `SolicitarTutoriaUseCase` activa la relación directamente si no hay
  conflicto, sin requerir aprobación manual del administrador. El
  administrador conserva la capacidad de cambiar cualquier estado desde el
  panel (Fase 5). Si prefieres que TODA solicitud quede en `PENDIENTE`
  esperando aprobación, es un cambio de una línea en la Fase 2 — avísame.
- **`ResumenAcademicoEstudiante`** no es una tabla: es un tipo calculado en
  tiempo real a partir de `Enrollment`, `LessonProgress`, `QuizAttempt`,
  `CaseAttempt` y `SelfAssessmentResponse` — cumple la Sección 13/14 de no
  duplicar el progreso académico.
- **`TutoringObservation`** nunca aparece en el contrato de ningún caso de
  uso que el estudiante pueda invocar — la separación de privacidad ya
  queda reflejada en la arquitectura, no solo en la UI.

## 3. Qué falta (próximas fases)

- Fase 2: `PrismaTutoringRepository` (implementación real), endpoints API,
  helper `requireTutorDe()` para la seguridad de servidor.
- Fase 3: Panel del docente (`/docente/estudiantes`, sección "Mi tutoría").
- Fase 4: Plan de acompañamiento en UI + panel del estudiante.
- Fase 5: Panel del administrador (`/admin/tutorias`) + pruebas de seguridad + `docs/tutoria-maestro-estudiante.md` final.

**No se ejecutó todavía la migración de Prisma** (`prisma migrate dev`) —
se hace en la Fase 2 junto con el repositorio, para migrar y probar la
conexión real en un solo paso.

**Pendiente tu aprobación para iniciar la Fase 2 (Infraestructura + API).**
