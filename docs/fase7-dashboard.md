# FASE 7 — DASHBOARD POR ROL
## Estado: ✅ Completa

## 1. Qué se construyó

| Requisito (Fase 1, Sección 16) | Implementación |
|---|---|
| **Estudiante** — porcentaje de avance | `resumen.progresoGeneral` |
| Tiempo estudiado | Ver nota de alcance (sección 5) |
| Promedio | `resumen.promedioCalificaciones` |
| Módulos completados | `resumen.modulosCompletados` / `totalModulos` |
| Evaluaciones pendientes | `resumen.evaluacionesPendientes` |
| Logros / XP / Nivel | `resumen.xp`, `resumen.nivel` (ver Sección 3) |
| Ranking | `resumen.ranking` (posición por XP entre estudiantes) |
| Actividad reciente | `RecentActivityList` (últimas lecciones, evaluaciones y casos) |
| Perfil de competencias | `RadarProfileChart` reutilizado de la Fase 6 |
| **Docente** — desempeño agregado | `/docente`, `ResumenDocente` |
| **Administrador** — estadísticas globales | `/admin`, `ResumenAdmin` |

## 2. Arquitectura aplicada (Clean Architecture)

```
modules/dashboard/
├── domain/            → ResumenEstudiante, ResumenDocente, ResumenAdmin
├── application/         → ObtenerDashboardEstudianteUseCase,
│                           ObtenerDashboardDocenteUseCase, ObtenerDashboardAdminUseCase
├── infrastructure/      → PrismaDashboardRepository (agregaciones)
└── presentation/        → StatCard, RecentActivityList
```

El dashboard es intencionalmente un módulo "de composición": no duplica
reglas de negocio de otros módulos, solo agrega y presenta datos que ya
calculan `courses`, `evaluations`, `case-studies` y `self-assessment`.

## 3. Gamificación básica (adelanto necesario de la Fase 8)

El dashboard requería mostrar XP y nivel reales, que hasta la Fase 6 siempre
eran 0 (el campo existía en la base desde la Fase 2 pero nada lo incrementaba).
Se agregó `lib/gamification.ts` con una regla mínima:

| Acción | XP otorgado |
|---|---|
| Completar una lección (primera vez) | +5 XP |
| Aprobar una evaluación | +15 XP |
| Resolver correctamente un caso práctico | +10 XP |

Nivel = `floor(xp / 100) + 1`. Esta es una implementación **básica e
intencionalmente simple**; el sistema completo de insignias, retos y ranking
enriquecido con el foro se construye en la Fase 8, sin necesidad de romper
esta base.

## 4. Redirección automática por rol

`/dashboard` ahora redirige según el rol del usuario autenticado:
- `ESTUDIANTE` → se queda en `/dashboard` (resumen de estudiante)
- `DOCENTE` → redirige a `/docente`
- `ADMINISTRADOR` → redirige a `/admin`

Ambas rutas ya estaban protegidas por rol desde el middleware de la Fase 2
(`RUTAS_SOLO_ADMIN`, `RUTAS_DOCENTE`), así que no fue necesario modificarlo.

## 5. Alcance y limitaciones declaradas

- **"Tiempo estudiado"**: el documento de análisis lo pide explícitamente,
  pero no existe todavía un mecanismo de tracking de sesiones/tiempo activo
  en la plataforma (no estaba en el modelo de datos de ninguna fase previa).
  Implementarlo bien requiere un modelo de eventos de sesión; se deja
  planificado para la Fase 10 (Optimización) o como mejora en Fase 9, para no
  introducir tracking de comportamiento de forma apresurada.
- **Dashboard del Docente**: como todavía no existe asignación de
  profesor↔curso (llega con la gestión completa de la Fase 9), el panel
  muestra el agregado de *todos* los estudiantes y módulos, no un subconjunto
  por profesor. Queda documentado para ajustarse cuando se construya esa
  relación.
- **Participación en foro** (parte del dashboard de Docente en la Fase 1):
  se integra en la Fase 8 cuando exista el módulo de Foro.

## 6. Verificación de errores / QA realizado

- ✅ Consultas de agregación con `Promise.all` para evitar cascadas secuenciales lentas
- ✅ Manejo de división por cero en todos los promedios (progreso, calificaciones, tasa de finalización)
- ✅ Ranking maneja el caso de 0 estudiantes o usuario no encontrado en la lista
- ✅ Perfil de competencias en el dashboard reutiliza `SelfAssessmentRules` (una sola fuente de verdad para el cálculo)
- ⏳ Pendiente Fase 10: pruebas automatizadas de los cálculos de agregación

## 7. Checklist de cierre

- [x] Dashboard del estudiante con progreso, promedio, módulos, evaluaciones pendientes
- [x] XP, nivel y ranking (básico, ampliable en Fase 8)
- [x] Actividad reciente
- [x] Perfil de competencias digitales en el dashboard
- [x] Dashboard del docente con desempeño agregado
- [x] Dashboard del administrador con estadísticas globales y perfil comparativo de la plataforma
- [x] Redirección automática según rol
- [x] Documentación técnica actualizada, incluyendo limitaciones declaradas

**Pendiente tu aprobación para iniciar la Fase 8 (Gamificación y Foro).**
