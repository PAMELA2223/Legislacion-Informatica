# FASE 5 — EVALUACIONES
## Estado: ✅ Completa

## 1. Qué se construyó

| Requisito de la Fase 5 | Archivo(s) |
|---|---|
| Banco de preguntas | `prisma/schema.prisma` (`Question`), `prisma/seed.ts` |
| Verdadero/Falso | `QuestionRenderer` (tipo `VF`) |
| Relacionar | `QuestionRenderer` (tipo `RELACIONAR`, selects columna izq/der) |
| Completar | `QuestionRenderer` (tipo `COMPLETAR`, input de texto) |
| Casos (dentro de evaluación) | `QuestionRenderer` (tipo `CASO`) |
| Calificación automática | `EvaluationRules.calificarEvaluacion` (dominio) |
| Retroalimentación | Por pregunta, mostrada tras enviar (`EvaluationRunner`) |

## 2. Arquitectura aplicada (Clean Architecture)

```
modules/evaluations/
├── domain/            → Question, Evaluation, EvaluationRules (calificación automática)
├── application/         → ListarEvaluacionesUseCase, ObtenerEvaluacionParaResolverUseCase,
│                           EnviarIntentoUseCase, ObtenerHistorialUseCase
├── infrastructure/      → PrismaEvaluationRepository
└── presentation/        → QuestionRenderer, EvaluationRunner
```

## 3. Seguridad de la calificación (importante)

La calificación **nunca ocurre en el navegador**. El flujo es:

1. `obtenerEvaluacionParaResolver()` devuelve las preguntas **sin** `respuestaCorrecta` (excluida explícitamente en el `select` de Prisma).
2. El estudiante responde y el cliente envía únicamente sus respuestas a `POST /api/evaluaciones/[id]/enviar`.
3. En el servidor, `EnviarIntentoUseCase` obtiene las respuestas correctas (`obtenerPreguntasConRespuesta`) y llama a `EvaluationRules.calificarEvaluacion()`.
4. El resultado (puntaje, aprobado/no aprobado, retroalimentación) se guarda en `QuizAttempt` y se devuelve al cliente.

Esto evita que un estudiante pueda inspeccionar el HTML/JS del navegador para ver las respuestas correctas antes de responder.

## 4. Regla de negocio: umbral de aprobación

`EvaluationRules` define `UMBRAL_APROBACION = 70` (70%). Es una constante de
dominio, fácil de ajustar en un solo lugar si la coordinación académica decide
cambiar el criterio de aprobación en el futuro.

## 5. Datos de ejemplo (seed)

Se agregó `eval-modulo-1`: una evaluación de 5 preguntas —una por cada tipo—
ligada al Módulo 1 (Introducción al Derecho Informático), para validar que
los 5 formatos exigidos por el documento de análisis funcionan de extremo a
extremo. Cargar con `npm run prisma:seed` o `CONFIGURAR-BASE-DATOS.bat`.

## 6. Verificación de errores / QA realizado

- ✅ Endpoint de envío protegido por sesión (401 si no autenticado)
- ✅ Comparación de "completar" insensible a mayúsculas y tildes (`normalizarTexto`)
- ✅ Manejo de evaluación sin preguntas (error controlado, no crash)
- ✅ Temporizador auto-envía la evaluación al llegar a 0 si tiene tiempo límite
- ✅ Historial de intentos por evaluación, muestra el mejor puntaje en el listado
- ⏳ Pendiente Fase 10: pruebas automatizadas de los 5 tipos de calificación

## 7. Checklist de cierre

- [x] Banco de preguntas (modelo `Question`, reutilizable entre evaluaciones)
- [x] Verdadero/Falso
- [x] Relacionar
- [x] Completar
- [x] Casos (como pregunta dentro de evaluación; el módulo dedicado de Casos Prácticos llega en la Fase 6)
- [x] Calificación automática en servidor
- [x] Retroalimentación por pregunta
- [x] Historial de intentos con mejor puntaje
- [x] Rutas protegidas por middleware
- [x] Documentación técnica actualizada

**Pendiente tu aprobación para iniciar la Fase 6 (Casos Prácticos y Autoevaluación de Competencias Digitales).**
