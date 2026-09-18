# MÓDULO DE TUTORÍA DOCENTE-ESTUDIANTE
## Documentación final — plataforma-completa 2.0

## 1. Objetivo

Permitir que un usuario con rol `DOCENTE` seleccione estudiantes para
tutorarlos, haga seguimiento académico (reutilizando datos ya existentes de
la plataforma) y organizativo (tareas, objetivos, reuniones, recursos,
observaciones privadas), con supervisión del `ADMINISTRADOR`.

## 2. Arquitectura

Se siguió exactamente el patrón de 4 capas ya usado en los demás 9 módulos
de la plataforma (`courses`, `evaluations`, `admin`, etc.):

```
src/modules/tutoring/
├── domain/
│   ├── tutoring.entity.ts               → tipos + TutoringRules (reglas de negocio)
│   └── tutoring-repository.interface.ts → contrato (26 métodos)
├── application/
│   ├── tutoring-assignment.use-cases.ts → ciclo de vida de la tutoría (10 casos de uso)
│   └── tutoring-plan.use-cases.ts       → tareas/objetivos/observaciones/reuniones/recursos (16 casos de uso)
├── infrastructure/
│   └── prisma-tutoring.repository.ts    → implementación real con Prisma
└── presentation/
    ├── student-search.tsx               → buscador + solicitar tutoría
    ├── tutoring-student-card.tsx        → tarjeta en "Mis estudiantes"
    ├── academic-summary-card.tsx        → resumen académico (reutiliza StatCard)
    ├── tutoring-status-actions.tsx      → finalizar tutoría (docente)
    ├── admin-tutoring-actions.tsx       → aprobar/rechazar/reasignar (admin)
    ├── plan-tabs.tsx                    → orquesta las 5 secciones del plan
    ├── task-list.tsx / objective-list.tsx / observation-list.tsx /
    │   meeting-list.tsx / resource-list.tsx
```

Más 2 helpers de seguridad en `lib/`: `require-tutor-of.ts` (verifica que un
docente sea tutor activo de un estudiante específico) y el `require-admin.ts`
ya existente (reutilizado, no duplicado).

## 3. Modelo de datos (6 tablas nuevas, 0 tablas existentes modificadas en su forma)

```
TutoringAssignment  (docenteId, estudianteId, estado, fechas)
   ├─< TutoringTask        (titulo, descripcion, fechaLimite, prioridad, estado, courseId?)
   ├─< TutoringObjective   (titulo, descripcion, progreso 0-100, estado, fechaObjetivo)
   ├─< TutoringObservation (autorId, tipo, contenido) — PRIVADA
   ├─< TutoringMeeting     (titulo, fecha, duracionMin, estado, acuerdos)
   └─< TutoringResource    (titulo, url, descripcion)
```

`docenteId` y `estudianteId` son referencias (`@relation`) a la tabla `User`
ya existente — nunca se copian datos del usuario dentro de estas tablas.
`courseId` en `TutoringTask` referencia `Course` (ya existente) de forma
opcional.

**Restricción clave:** `@@unique([docenteId, estudianteId])` en
`TutoringAssignment` evita duplicados a nivel de base de datos, no solo en
el código de aplicación.

## 4. Flujo de solicitud y aprobación

```
DOCENTE busca estudiante (/docente/agregar-estudiante)
   ↓
Verifica: ¿ya tiene tutor activo? ¿ya existe relación con este docente?
   ↓ (si no hay conflicto)
Se activa DIRECTAMENTE (estado = ACTIVA)
   ↓
ADMINISTRADOR puede, en cualquier momento desde /admin/tutorias:
   - Aprobar una PENDIENTE → ACTIVA (si en el futuro se decide requerir
     aprobación previa, basta con cambiar una línea en
     PrismaTutoringRepository.solicitarTutoria)
   - Rechazar → RECHAZADA
   - Reasignar (finaliza la actual, activa/crea la del nuevo docente)
   - Finalizar → FINALIZADA
   - Cancelar → CANCELADA
```

Transiciones válidas (`TutoringRules.esTransicionValida`):
`PENDIENTE → {ACTIVA, RECHAZADA, CANCELADA}`, `ACTIVA → {FINALIZADA, CANCELADA}`.
Los estados terminales (`RECHAZADA`, `FINALIZADA`, `CANCELADA`) no admiten
ninguna transición posterior.

## 5. Permisos — matriz completa

| Acción | Estudiante | Docente (propio tutorado) | Docente (de otro) | Administrador |
|---|---|---|---|---|
| Ver estudiantes disponibles | ❌ | ✅ | ✅ | — (no aplica) |
| Solicitar tutoría | ❌ | ✅ | ✅ | ❌ (usa reasignar) |
| Ver perfil de tutoría de X | Solo el suyo propio (`/mi-tutoria`) | ✅ si es su tutorado | ❌ (404) | ✅ cualquiera |
| Crear tarea/objetivo/reunión/recurso | ❌ | ✅ | ❌ | ❌ |
| Marcar tarea como completada | ✅ (solo las suyas) | ✅ (solo sus tutorados) | ❌ | ❌ |
| Actualizar progreso de objetivo | ❌ | ✅ | ❌ | ❌ |
| Crear observación privada | ❌ | ✅ | ❌ | ❌ |
| Ver observaciones | ❌ nunca | ✅ las suyas | ❌ | (no expuesto en UI aún) |
| Aprobar/rechazar/finalizar/reasignar | ❌ | ✅ solo finalizar sus propias | ❌ | ✅ todas |

Toda esta matriz se aplica **en el servidor** (Route Handlers), no solo
ocultando botones en la interfaz.

## 6. API — referencia completa

| Método | Ruta | Quién |
|---|---|---|
| GET | `/api/tutoria/estudiantes-disponibles?q=` | Docente |
| POST | `/api/tutoria/solicitar` | Docente |
| POST | `/api/tutoria/[id]/estado` | Docente (propia) / Admin |
| POST | `/api/tutoria/[id]/tareas` | Tutor de esa asignación |
| PATCH | `/api/tutoria/tareas/[id]/estado` | Tutor **o** estudiante asignado |
| POST | `/api/tutoria/[id]/objetivos` | Tutor |
| PATCH | `/api/tutoria/objetivos/[id]` | Tutor |
| POST | `/api/tutoria/[id]/observaciones` | Tutor (nunca admin ni estudiante) |
| POST | `/api/tutoria/[id]/reuniones` | Tutor |
| POST | `/api/tutoria/[id]/recursos` | Tutor |
| POST | `/api/admin/tutorias/[id]/reasignar` | Solo Administrador |

## 7. Páginas

| Ruta | Para quién |
|---|---|
| `/docente` (sección "Mi tutoría") | Docente |
| `/docente/agregar-estudiante` | Docente |
| `/docente/estudiantes` | Docente |
| `/docente/estudiantes/[id]` | Docente (su tutorado) / Admin |
| `/mi-tutoria` | Estudiante |
| `/admin/tutorias` | Administrador |

## 8. Integración con el dashboard existente (Sección 24)

`/docente` conserva íntegras sus estadísticas generales de la plataforma
(sin modificar su cálculo ni su UI) y agrega debajo, con su propio
encabezado "Mi tutoría", las estadísticas de sus tutorados —
**nunca se mezclan ambos conjuntos de datos** en una misma tarjeta o cálculo.

`/dashboard` (estudiante) agrega una tarjeta "Mi tutor" **solo si existe**
una tutoría activa — si no, el dashboard se ve exactamente igual que antes
de este módulo.

## 9. Auditoría

Se reutiliza `AuditLog` / `registrarLog()` (Fase 9 de la plataforma, sin
crear un segundo sistema). Acciones registradas: `SOLICITAR_TUTORIA`,
`APROBAR_TUTORIA` (vía cambio a ACTIVA), `RECHAZAR_TUTORIA`,
`FINALIZAR_TUTORIA`, `ASIGNAR_TUTORIA` (reasignación), `CREAR_TAREA`,
`CREAR_OBJETIVO`, `CREAR_OBSERVACION`, `CREAR_REUNION`.

## 10. Resumen académico — consultas Prisma reutilizadas (sin duplicar datos)

`obtenerResumenAcademico(estudianteId)` en `PrismaTutoringRepository` hace
exactamente lo mismo que ya hacía `PrismaDashboardRepository` desde la
Fase 7, pero con el filtro `userId: estudianteId` (uno solo, no todos):

```ts
Course.count()                                    → total de módulos
Enrollment.findMany({ where: { userId } })         → progreso, completados
QuizAttempt.findMany({ where: { userId } })        → evaluaciones, promedio
CaseAttempt.findMany({ where: { userId } })         → casos resueltos/correctos
SelfAssessmentResponse.findMany({ where: { userId } }) → perfil inicial/final
```

Ninguna tabla nueva almacena progreso académico.

## 11. Verificación y pruebas

**Automatizado** (`VERIFICAR-TUTORIA.bat` → `scripts/verificar-tutoria.ts`,
solo lectura):
1. Las 6 tablas existen y son consultables
2. No hay pares (docente, estudiante) duplicados
3. Ningún estudiante tiene 2 tutorías `ACTIVA` simultáneas
4. Integridad referencial: los roles de docente/estudiante en cada
   asignación son consistentes con la tabla `User`
5. Confirmación estructural de que las observaciones no tienen ruta pública

**Manual** (checklist, Sección 29 del pedido original):

| Prueba | Cómo verificarla |
|---|---|
| Docente ve estudiantes disponibles | `/docente/agregar-estudiante` |
| Docente solicita tutoría | Botón "Solicitar tutoría" → aparece en `/docente/estudiantes` |
| Docente ve progreso real | Perfil de tutoría muestra los mismos números que el Dashboard del estudiante |
| Docente crea tarea/objetivo/observación/reunión/recurso | Cada pestaña de `PlanTabs` |
| Estudiante ve su tutor | `/mi-tutoria` |
| Estudiante ve tareas/objetivos/reuniones/recursos, NO observaciones | Confirmar que la pestaña "Observaciones" no aparece |
| Admin aprueba/rechaza/reasigna/finaliza | `/admin/tutorias` |
| **Seguridad**: Docente A no accede a estudiante de Docente B | Copiar la URL `/docente/estudiantes/[id]` de un estudiante ajeno y pegarla estando logueado como otro docente → debe dar 404 |
| **Seguridad**: estudiante no edita observaciones | No existe ningún botón ni endpoint accesible que lo permita |
| **Seguridad**: no hay tutorías duplicadas | `VERIFICAR-TUTORIA.bat`, sección 2 y 3 |
| **Seguridad**: usuario no-admin no accede a `/admin/tutorias` | Middleware + `admin/layout.tsx` (verificado desde la corrección de roles previa) |

## 12. Qué NO se creó (cumplimiento de las reglas del pedido)

- ❌ Rol nuevo `TUTOR`/`MAESTRO`/`PROFESOR` — se usó `DOCENTE`, el existente.
- ❌ Segundo sistema de usuarios — todo referencia a `User` de Prisma.
- ❌ Segundo sistema de progreso académico — todo se lee de las tablas de
  las Fases 3, 5, 6.
- ❌ Segundo sistema de auditoría — se reutilizó `AuditLog`.
- ❌ Segundo sistema de autenticación — se reutilizó `getAuthenticatedUser()`.
- ❌ Modificación destructiva de `schema.prisma` — solo se agregaron
  modelos y relaciones inversas; ningún campo ni tabla existente se alteró
  o eliminó.

## 13. Cómo desplegar esta versión

1. Descomprimir el zip en una carpeta limpia
2. `INSTALAR.bat`
3. `CONFIGURAR-BASE-DATOS.bat` (crea las 6 tablas nuevas junto con todo lo demás, sin tocar datos existentes)
4. `VERIFICAR-TUTORIA.bat` (opcional pero recomendado, confirma integridad)
5. `INICIAR.bat`
