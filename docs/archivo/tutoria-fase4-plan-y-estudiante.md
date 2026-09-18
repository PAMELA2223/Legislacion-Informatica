# MÓDULO DE TUTORÍA — FASE 4: Plan de acompañamiento + Panel del Estudiante
## Estado: ✅ Completa

## 1. Qué se agregó

**7 endpoints API** (todos verificados con `requireTutorDeAssignment` en
servidor, ninguno confía en la UI):

| Endpoint | Acción |
|---|---|
| `POST /api/tutoria/[id]/tareas` | Crear tarea |
| `PATCH /api/tutoria/tareas/[id]/estado` | Cambiar estado de tarea (docente **o** el estudiante asignado) |
| `POST /api/tutoria/[id]/objetivos` | Crear objetivo |
| `PATCH /api/tutoria/objetivos/[id]` | Actualizar progreso/estado (solo tutor) |
| `POST /api/tutoria/[id]/observaciones` | Crear observación privada (solo tutor, nunca admin ni estudiante) |
| `POST /api/tutoria/[id]/reuniones` | Programar reunión |
| `POST /api/tutoria/[id]/recursos` | Compartir recurso |

**5 componentes de presentación** (`TaskList`, `ObjectiveList`,
`ObservationList`, `MeetingList`, `ResourceList`) unificados en **`PlanTabs`**,
un solo componente reutilizado en dos lugares distintos:
- `/docente/estudiantes/[id]` — vista completa, con edición (docente)
- `/mi-tutoria` — vista de solo lectura + poder marcar tareas completadas (estudiante)

**Panel del estudiante** (`/mi-tutoria`): muestra "Mi tutor" y "Mi plan"
(tareas, objetivos, reuniones, recursos — **sin** la pestaña de
observaciones, que es privada del docente). Se agregó también una tarjeta
compacta "Mi tutor" en `/dashboard`, visible **solo si el estudiante tiene
tutoría activa** (Sección 18: no modificar el dashboard si no aplica).

## 2. Privacidad de las observaciones — cómo se garantiza, no solo se declara

- El componente `ObservationList` **nunca se importa** en `/mi-tutoria`.
- `PlanTabs` oculta la pestaña "Observaciones" completamente cuando
  `puedeEditar` es `false` (el caso del estudiante) — no es un `if` de CSS
  que oculta visualmente, el contenido ni siquiera se renderiza.
- El endpoint `POST /api/tutoria/[id]/observaciones` exige `auth.docenteId`
  (el tutor específico), rechazando explícitamente tanto a estudiantes como
  a administradores.

## 3. Doble seguridad en "marcar tarea completada"

Es la única acción que dos roles distintos pueden ejecutar (docente Y el
estudiante tutorado). `PATCH /api/tutoria/tareas/[id]/estado` verifica
explícitamente que quien llama sea **el tutor de esa tarea específica O el
estudiante al que esa tarea pertenece** — comparando `assignment.docenteId`
/ `assignment.estudianteId` contra el usuario autenticado, nunca confiando
en qué botón se ve en la pantalla.

## 4. Reutilización de componentes existentes (Sección 25)

`PlanTabs` y sus 5 hijos usan exclusivamente: `Button`, `Input`,
`ProgressBar` (de la Fase 2 del proyecto original) y los tokens de color
del sistema de diseño (`bg-primary/10`, `text-success`, `border-border`,
etc.) — cero componentes de UI base nuevos.

## 5. Qué falta (próxima fase)

- Fase 5: panel del administrador (`/admin/tutorias`) — usa
  `listarTodasLasTutorias` y `reasignarTutoria`, ya implementados desde la
  Fase 2, así que en la Fase 5 solo falta construir la UI. También: pruebas
  de seguridad formales (Sección 29) y `docs/tutoria-maestro-estudiante.md`
  final consolidando las 5 fases.

## 6. Cómo probarlo

1. Como docente, entra a `/docente/estudiantes/[id]` de uno de tus tutorados
2. Crea una tarea, un objetivo, programa una reunión y comparte un recurso
3. Agrega una observación privada
4. Inicia sesión como ese estudiante → `/mi-tutoria` → deberías ver todo
   **menos** la observación, y poder marcar la tarea como completada
5. Verifica que el checkbox de tarea SÍ funcione desde el lado del
   estudiante, y que el progreso del objetivo solo sea editable desde el
   lado del docente

**Pendiente tu aprobación para iniciar la Fase 5 (Panel del Administrador + Seguridad + Documentación final) — la última del módulo de tutoría.**
