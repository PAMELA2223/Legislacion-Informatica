# FASE 6 — CASOS PRÁCTICOS Y AUTOEVALUACIÓN DE COMPETENCIAS DIGITALES
## Estado: ✅ Completa

## 1. Qué se construyó — Casos Prácticos

| Requisito de la Fase 6 (Fase 1, Sección 11) | Implementación |
|---|---|
| Escenario | `CaseStudy.escenario` |
| Descripción | `CaseStudy.descripcion` |
| Normativa aplicable | `CaseStudy.normativaAplicable` |
| Derechos vulnerados | `CaseStudy.derechosVulnerados` |
| Sanciones | `CaseStudy.sanciones` |
| Actuación correcta | `CaseStudy.actuacionCorrecta` |
| Retroalimentación jurídica | `CaseStudy.retroalimentacionJuridica` |
| Nivel de dificultad | `CaseStudy.nivelDificultad` (Básico/Intermedio/Avanzado) |
| Competencia desarrollada | `CaseStudy.competenciaDesarrollada` |
| 4 categorías oficiales | Protección de Datos, Delitos Informáticos, Comercio Electrónico, Evidencia Digital |

## 2. Qué se construyó — Autoevaluación de Competencias Digitales

| Requisito (Fase 1, Sección 12) | Implementación |
|---|---|
| Diagnóstico inicial | `/autoevaluacion/diagnostico-inicial`, `TipoDiagnostico.INICIAL` |
| Diagnóstico final | `/autoevaluacion/diagnostico-final`, `TipoDiagnostico.FINAL` |
| 6 ejes medidos | `EjeCompetencia` (Seguridad Digital, Protección de Datos, Aspectos Legales, Ética, Ciudadanía Digital, Uso Responsable de la Información) |
| Escala Likert | `SelfAssessmentForm` (1 a 5) |
| Perfil de competencias (radar) | `RadarProfileChart` (recharts), comparando inicial vs. final |

## 3. Arquitectura aplicada (Clean Architecture)

```
modules/case-studies/
├── domain/            → CaseStudy, CaseStudyRules (calificación del caso)
├── application/        → ListarCasosUseCase, ObtenerCasoParaResolverUseCase,
│                          ResolverCasoUseCase, ObtenerHistorialCasosUseCase
├── infrastructure/     → PrismaCaseStudyRepository
└── presentation/       → CaseCard, CaseRunner

modules/self-assessment/
├── domain/             → SelfAssessmentQuestion, SelfAssessmentRules (cálculo del perfil)
├── application/          → ObtenerCuestionarioUseCase, EnviarAutoevaluacionUseCase,
│                            ObtenerPerfilComparativoUseCase
├── infrastructure/       → PrismaSelfAssessmentRepository
└── presentation/         → SelfAssessmentForm, RadarProfileChart
```

## 4. Seguridad de la calificación de casos prácticos

Mismo patrón que en la Fase 5: `obtenerCasoParaResolver()` excluye
`indiceCorrecto` y los campos jurídicos de la solución (normativa, derechos
vulnerados, sanciones, actuación correcta, retroalimentación). Solo tras
enviar la decisión del estudiante al servidor (`POST /api/casos-practicos/[id]/resolver`)
se calcula la corrección y se revela el análisis jurídico completo.

## 5. Buscador inteligente — actualización de cobertura

Se cumplió lo previsto en la Fase 4: el buscador global ahora también indexa
`case_studies` (título + escenario) vía Postgres Full-Text Search, cerrando
el criterio "Caso práctico" de la Sección 9 de la Fase 1. Pendiente: Glosario
y Noticias (Fase 8).

## 6. Datos de ejemplo (seed)

- **4 casos prácticos**, uno por cada categoría oficial, con todos los campos
  de la estructura obligatoria completos.
- **12 preguntas de autoevaluación** (2 por cada uno de los 6 ejes), listas
  para usarse tanto en el diagnóstico inicial como en el final (mismo banco
  de preguntas, respuestas independientes por tipo gracias a la restricción
  única `[userId, questionId, tipo]`).

Cargar con `CONFIGURAR-BASE-DATOS.bat` o `npm run prisma:seed`.

## 7. Verificación de errores / QA realizado

- ✅ Endpoints de resolución de caso y envío de autoevaluación protegidos por sesión
- ✅ `SelfAssessmentRules.calcularPerfil` maneja ejes sin respuestas (retorna 0, no `NaN`)
- ✅ Restricción única evita duplicar respuestas del mismo usuario/pregunta/tipo (permite re-tomar el diagnóstico sin generar filas duplicadas)
- ✅ Radar chart renderiza con datos parciales (solo inicial, solo final, o ambos)
- ⏳ Pendiente Fase 10: pruebas automatizadas end-to-end

## 8. Checklist de cierre

- [x] Estructura oficial de caso práctico (9 campos) implementada íntegramente
- [x] 4 categorías de caso práctico
- [x] Nivel de dificultad y competencia desarrollada visibles en el catálogo
- [x] Calificación segura en servidor con retroalimentación jurídica completa
- [x] Diagnóstico inicial y final sobre 6 ejes
- [x] Escala Likert 1-5 convertida a puntaje 0-100 por eje
- [x] Gráfico radar comparativo inicial vs. final
- [x] Buscador inteligente extendido a casos prácticos
- [x] Rutas protegidas por middleware
- [x] Documentación técnica actualizada

**Pendiente tu aprobación para iniciar la Fase 7 (Dashboard por rol).**
