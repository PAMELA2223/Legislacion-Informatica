# MÓDULO DE TUTORÍA — FASE 2: Infraestructura + API
## Estado: ✅ Completa

## 1. Qué se agregó

**Infraestructura** (`modules/tutoring/infrastructure/prisma-tutoring.repository.ts`):
implementación completa de los 26 métodos del contrato `ITutoringRepository`
definido en la Fase 1, incluyendo:

- El **resumen académico** (`obtenerResumenAcademico`) — lee directamente
  `Enrollment`, `QuizAttempt`, `CaseAttempt` y `SelfAssessmentResponse`
  (las tablas que ya existían desde las Fases 3, 5, 6). **No se creó
  ninguna tabla nueva para el progreso académico**, tal como exigía la
  Sección 13.
- **Reasignación de tutoría** (`reasignarTutoria`): finaliza la asignación
  actual y crea/reactiva la del nuevo docente en una sola operación,
  respetando la restricción única `[docenteId, estudianteId]`.
- Cada acción relevante llama a `registrarLog()` (el sistema de auditoría
  que ya existía desde la Fase 9) — no se creó un segundo sistema de logs.

**Seguridad de servidor** (`lib/require-tutor-of.ts`): esta es la pieza
central de la Sección 20 del pedido. `requireTutorDe(estudianteId)`
verifica, contra la base de datos, que:
- Haya sesión iniciada
- El usuario sea `DOCENTE` con una tutoría **ACTIVA** con ese estudiante
  específico, **o** sea `ADMINISTRADOR` (que puede consultar cualquiera)

Este helper se usará en la Fase 3 para bloquear el acceso a
`/docente/estudiantes/[id]` cuando el `id` no le pertenezca al docente
autenticado — exactamente el escenario de ataque descrito en la Sección 20
("docente A no puede acceder a estudiante tutorado por docente B").

**API** (3 endpoints, flujo de solicitud/aprobación completo):

| Endpoint | Qué hace | Quién puede |
|---|---|---|
| `GET /api/tutoria/estudiantes-disponibles?q=` | Lista estudiantes con su tutor actual (si tiene) | Solo `DOCENTE` |
| `POST /api/tutoria/solicitar` | Crea la relación de tutoría (activación directa, ver Fase 1) | Solo `DOCENTE` |
| `POST /api/tutoria/[id]/estado` | Cambia el estado (aprobar/rechazar/finalizar/cancelar) | `DOCENTE` (solo sus propias tutorías, verificado en servidor) o `ADMINISTRADOR` |

## 2. Verificación de duplicados y permisos (cómo se cumple cada regla)

| Regla del pedido (Sección 3 y 20) | Dónde se garantiza |
|---|---|
| No permitir relaciones duplicadas | `@@unique([docenteId, estudianteId])` en Prisma + verificación previa en `SolicitarTutoriaUseCase` |
| No permitir 2 tutores activos simultáneos para el mismo estudiante | `SolicitarTutoriaUseCase` consulta `obtenerTutorActivo()` antes de crear |
| Un docente solo modifica sus propias tutorías | Verificado en el servidor dentro de `POST /api/tutoria/[id]/estado`, no solo en la UI |
| Transiciones de estado válidas (ej. no reactivar una `RECHAZADA`) | `TutoringRules.esTransicionValida()`, consultado por `CambiarEstadoTutoriaUseCase` antes de escribir en la base |

## 3. Migración de base de datos

**Importante:** la migración de Prisma (`prisma migrate dev`) para crear las
6 tablas nuevas se ejecuta cuando corras `CONFIGURAR-BASE-DATOS.bat` con
este zip — no se ejecutó desde este entorno de generación porque no tiene
acceso a tu base de datos real. El `schema.prisma` ya tiene todo listo; el
comando es no-destructivo (`migrate dev` genera una migración incremental,
no borra tablas existentes, cumpliendo la Sección 27 del pedido).

## 4. Qué falta (próximas fases)

- Fase 3: Panel del docente — "Agregar estudiante" (usa
  `estudiantes-disponibles` + `solicitar`), "Mis estudiantes", perfil de
  tutoría con el resumen académico ya calculado aquí.
- Fase 4: Plan de acompañamiento en UI (tareas/objetivos/observaciones/
  reuniones/recursos — el repositorio ya tiene los 16 métodos listos) +
  panel del estudiante.
- Fase 5: Panel del administrador (`/admin/tutorias`, usa
  `listarTodasLasTutorias` y `reasignarTutoria`, ya implementados aquí) +
  pruebas de seguridad + documentación final.

**Pendiente tu aprobación para iniciar la Fase 3 (Panel del Docente).**
