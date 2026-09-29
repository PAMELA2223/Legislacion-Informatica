# Flujo de aprendizaje, administración de módulos y chatbot

Este documento describe los cambios realizados a partir del documento
"Cambios a realizar en la plataforma web": qué se hizo, por qué, cómo
actualizar una instalación existente y cómo probarlo.

## 1. Resumen

| Requerimiento | Implementación |
|---|---|
| Autoevaluación inicial obligatoria | `/autoevaluacion/inicial`. El dashboard y los módulos redirigen a ella mientras esté pendiente. Se responde una sola vez. |
| Módulos con evaluación propia | Cada módulo muestra su contenido y, al terminarlo, su evaluación. Un módulo cuenta como completado con todas las lecciones revisadas **y** la evaluación aprobada (70 %). |
| Autoevaluación final obligatoria | `/autoevaluacion/final`. Se habilita solo al completar todos los módulos activos. Muestra la comparación inicial → final. |
| Eliminar "Evaluación" | Retirada del menú. `/evaluaciones` redirige a `/modulos`; `/evaluaciones/[id]` sigue existiendo como pantalla de la evaluación, protegida por el flujo. |
| Eliminar "Infografía" | Retirada del menú. Las infografías se integran como lecciones de tipo *Infografía* dentro de cada módulo. `/infografias` redirige a `/destacados`. |
| "Videos" → "Lo más destacado" | Nueva sección `/destacados` y su administración en `/admin/destacados`. `/videos` redirige a `/destacados`. |
| Gestión de módulos | `/admin/cursos`: crear, editar, eliminar (con control de relaciones), ordenar y activar/desactivar. |
| Gestión de evaluaciones de módulo | Desde cada módulo: crear su evaluación, y agregar, editar, activar/desactivar y eliminar preguntas, opciones y respuestas correctas. |
| Gestión de autoevaluaciones | `/admin/autoevaluaciones`: inicial y final separadas, cada una con sus propias preguntas, y resumen de resultados. |
| Chatbot | Botón flotante para estudiantes. Responde con base en el contenido real de la plataforma. |

## 2. Decisiones de diseño

**Reutilización del modelo de evaluaciones.** El campo `Evaluation.tipo` ya
preveía los valores `"modulo" | "diagnostica" | "final"`. Por eso las
autoevaluaciones inicial (`diagnostica`) y final (`final`) usan las mismas
tablas `evaluations`, `questions` y `quiz_attempts`: no hay tablas duplicadas
de preguntas ni de resultados. Los valores están centralizados en
`modules/evaluations/domain/evaluation-types.ts`.

**El progreso se calcula, no se guarda aparte.** `modules/learning-path`
calcula en qué etapa está cada estudiante a partir de las lecciones
completadas y los intentos de evaluación. Así el estado nunca queda
desincronizado. Todas las páginas y APIs consultan esa misma fuente, a través
de `lib/learning-path.ts`. Además, `enrollments.completado` se mantiene
sincronizado porque lo usan el dashboard, las estadísticas y las insignias.

**Se conserva el cuestionario Likert anterior.** La antigua "autoevaluación de
competencias" es un cuestionario de *percepción*, sin respuestas correctas.
Alimenta el radar del dashboard y las estadísticas del administrador. Se
mantiene como complemento opcional dentro de `/autoevaluacion`; sus datos no se
tocaron.

**Sin pérdida de información.**
- **Módulos.** Un módulo con estudiantes que tienen progreso o intentos **no se
  puede eliminar**: se indica que se desactive, lo que lo oculta sin borrar
  resultados.
- **Evaluaciones.** Una evaluación con intentos registrados no se puede eliminar.
- **Preguntas.** Se pueden desactivar en lugar de borrarlas.
- **Videos e infografías.** Sus tablas originales se conservan intactas. Su
  contenido se copia a "Lo más destacado", con el botón *Importar* del panel o
  al ejecutar el seed.

**Configuración incompleta no bloquea a los estudiantes.**
- **Autoevaluación inicial sin preguntas activas.** No se exige al estudiante,
  y el panel lo advierte.
- **Módulo sin evaluación o sin preguntas activas.** Se completa solo con el
  contenido.
- **Autoevaluación final sin configurar.** Se muestra "en preparación".

**Administradores.** No siguen el flujo: pueden previsualizar cualquier módulo
o evaluación.

## 3. Cambios en la base de datos

Todos los cambios son **aditivos y con valores por defecto**: no se renombra
ni se elimina ninguna tabla ni columna.

| Tabla | Cambio |
|---|---|
| `users` | `proceso_finalizado_en` (fecha de finalización del proceso, nullable) |
| `courses` | `activo` (boolean, por defecto `true`) |
| `evaluations` | `descripcion` (instrucciones, nullable) |
| `questions` | `activo` (boolean, por defecto `true`) |
| `featured_contents` | **nueva**: contenido de "Lo más destacado" |

## 4. Actualizar una instalación existente

Ejecutar desde `apps/web`:

```bash
npm install
npx prisma migrate dev --name flujo-aprendizaje   # genera y aplica la migración
npm run prisma:seed                               # carga las autoevaluaciones y copia videos/infografías a destacados
npm run dev
```

**Producción (Vercel + Supabase).** Ejecuta `npx prisma migrate deploy` contra
la base de producción. Luego ejecuta el seed, o entra a `/admin/autoevaluaciones`
y `/admin/destacados` para crear e importar desde la web.

**Qué hace el seed ahora:**
- Crea las autoevaluaciones inicial y final con un banco de 8 preguntas de
  partida, basado en la normativa de la Biblioteca. Solo lo hace si no existen
  o si no tienen preguntas.
- Copia los videos e infografías a "Lo más destacado".
- **Ya no sobrescribe** módulos ni lecciones existentes. Como ahora se editan
  desde el panel, re-ejecutar el seed no debe deshacer esos cambios. Solo crea
  los que falten.

**Chatbot (opcional).** Agrega `ANTHROPIC_API_KEY` a `.env.local` y a las
variables de entorno de Vercel. Consulta `.env.example`. Sin la clave, el
chatbot funciona en *modo básico*: muestra el contenido relacionado de la
plataforma.

> Nota: los estudiantes que ya usaban la plataforma deberán rendir la
> autoevaluación inicial en su próximo ingreso, y sus módulos contarán como
> completados solo cuando también aprueben la evaluación de cada uno. Su
> progreso de lecciones se conserva.

## 5. Chatbot

| Aspecto | Detalle |
|---|---|
| Arquitectura | `modules/chatbot`: dominio con reglas puras y pruebas, repositorio de contexto, cliente de IA y caso de uso. Ruta de API: `app/api/chatbot/route.ts`. |
| Fundamentación | Antes de responder, busca con texto completo de PostgreSQL en lecciones, módulos, glosario, preguntas frecuentes y artículos de la Biblioteca. Envía esos fragmentos como contexto y devuelve enlaces a las fuentes. |
| Página actual | Si el estudiante está dentro de un módulo, el asistente recibe cuál es. |
| Reglas del asistente | Temas de legislación informática. No inventa artículos, números de ley ni fechas. **No revela respuestas de evaluaciones**: explica los conceptos. No da asesoría legal personal. |
| Seguridad | La clave solo se lee en el servidor. Requiere sesión iniciada. Límite de 30 consultas cada 10 minutos por usuario (en memoria). El historial se valida y se recorta. |
| Tolerancia a fallos | Si la IA falla, responde en modo básico en lugar de mostrar un error. |

## 6. Verificación realizada

- `npm run typecheck`: sin errores.
- `npm run test`: 60 pruebas pasando (34 anteriores + 26 nuevas: flujo de
  aprendizaje, validación de preguntas, destacados y chatbot).
- `npm run lint`: sin errores.
- `next build`: compila y genera todas las rutas.

No fue posible ejecutar la migración ni probar en el navegador contra una base
de datos real en el entorno de desarrollo usado. **Ejecuta el plan de pruebas
de la sección 7 en tu entorno.**

## 7. Plan de pruebas (Pruebas 1–10 del pedido)

| # | Pasos | Resultado esperado |
|---|---|---|
| 1 | Registrar un estudiante nuevo e iniciar sesión. | Redirige a `/autoevaluacion/inicial`. |
| 2 | Sin rendirla, abrir `/modulos` o `/modulos/<slug>` por URL, o llamar a `POST /api/lessons/<id>/complete`. | Redirige a la autoevaluación inicial. La API responde 403. |
| 3 | Responder la autoevaluación inicial. | Muestra el puntaje (sin revelar las respuestas correctas). Se habilita el Módulo 1; el Módulo 2 sigue bloqueado. No se puede volver a rendir. |
| 4 | Revisar todas las lecciones del Módulo 1 y rendir su evaluación. | La evaluación solo se habilita tras revisar todo el contenido. Muestra calificación y retroalimentación. El intento queda en `quiz_attempts`. Con 70 % o más aparece "Siguiente módulo". |
| 5 | Abrir `/autoevaluacion/final` sin completar todo. | Pantalla bloqueada con el progreso. La API de envío responde 403. |
| 6 | Completar todos los módulos activos y sus evaluaciones. | Se habilita la autoevaluación final (tarjeta al final de `/modulos`). |
| 7 | Rendir la autoevaluación final. | Comparación inicial → final. En la base de datos: el intento con usuario, puntaje y fecha, y `users.proceso_finalizado_en` con la fecha. |
| 8 | Como administrador: crear un módulo, agregarle una lección, activarlo, reordenarlo, crear su evaluación, y agregar/editar/desactivar/eliminar preguntas y opciones. Editar las autoevaluaciones inicial y final. Intentar eliminar un módulo con estudiantes. | Todo funciona desde la web. La eliminación se bloquea con un mensaje que sugiere desactivar. |
| 9 | Revisar el menú (escritorio, lateral y móvil). | No aparecen Evaluaciones, Infografías ni Videos. Aparece "Lo más destacado". Los enlaces viejos redirigen. |
| 10 | Abrir el botón flotante y preguntar "¿Qué es un dato personal?". | Responde con enlaces a las fuentes. Sin clave de API, responde en modo básico. |

## 8. Archivos principales

**Nuevos:**
- `src/modules/learning-path/*`: reglas del flujo y su sincronización.
- `src/lib/learning-path.ts`: control de acceso para páginas y APIs.
- `src/modules/evaluations/domain/evaluation-types.ts` y `question-validation.ts`.
- `src/modules/featured/*` y `src/modules/chatbot/*`.
- Páginas: `autoevaluacion/inicial`, `autoevaluacion/final`, `destacados`,
  `admin/autoevaluaciones`, `admin/destacados/*`, `admin/cursos/nuevo`,
  `admin/cursos/[id]/editar`.
- APIs: `api/chatbot`, `api/admin/cursos`, `api/admin/cursos/[id]`,
  `api/admin/cursos/[id]/orden`, `api/admin/cursos/[id]/evaluacion`,
  `api/admin/evaluaciones`, `api/admin/destacados/*`.

**Modificados:**
- `prisma/schema.prisma` y `prisma/seed.ts`.
- `lib/navigation.ts`, `middleware.ts`, `robots.ts` e íconos del menú.
- Páginas de módulos, evaluaciones, autoevaluación y dashboard.
- Repositorio y casos de uso del admin.
- Formularios de preguntas y evaluaciones.
- `evaluation-runner.tsx`.

**Errores previos corregidos:**
- "Nueva evaluación" llamaba a una API inexistente.
- `/modulos/[slug]` no verificaba el desbloqueo del módulo.
- Las preguntas de "Relacionar" creadas desde el panel guardaban las columnas en
  el mismo orden, lo que dejaba la respuesta a la vista. Ahora se mezclan al
  guardar.
- El servidor aceptaba preguntas con índices de respuesta inválidos.
