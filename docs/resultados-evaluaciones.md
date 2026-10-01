# Resultados de las evaluaciones por módulo (panel de administración)

Funcionalidad **solo de consulta** para el administrador. No modifica la base de
datos ni el funcionamiento de las evaluaciones para los estudiantes. Usa los
intentos que ya se guardaban en `quiz_attempts`.

## Dónde está

| Desde | Cómo se llega |
|---|---|
| Panel → Evaluaciones | Botón **"Resultados de los estudiantes"**, o **"Resultados"** en cada módulo |
| Detalle de una evaluación de módulo | Botón **"Ver resultados de los estudiantes"** |
| Página de un módulo (Panel → Módulos) | Sección "Evaluación del módulo" → **"Ver resultados"** |

Dirección: `/admin/evaluaciones/resultados?modulo=<id>`.

## Qué muestra

- **Selector de módulo.** En escritorio es una lista lateral y cada módulo indica "N rindieron · M aprobaron". En celular es un desplegable. Los módulos sin evaluación aparecen deshabilitados.
- **Resumen del módulo elegido:** estudiantes que la rindieron, aprobados, no aprobados, promedio y porcentaje de aprobación.
- **Filtros:** Todos, Aprobados y No aprobados, más una búsqueda por nombre o correo (sin importar tildes).
- **Por cada estudiante:** nombre y correo, estado (Aprobado / No aprobado), calificación, fecha y número de intentos. Si hizo más de uno, se despliega el historial de cada intento con su fecha y su nota.
- **Descargar (Excel/CSV):** exporta la lista con los filtros aplicados. El separador es ";" y el archivo está en UTF-8, para que Excel muestre bien las tildes.

## Reglas

Son las mismas que aplica el sistema al estudiante, así que el panel y la vista del estudiante nunca se contradicen:

| Dato | Regla |
|---|---|
| Calificación | La del **mejor intento**. |
| Aprobado | Alcanzó el **70 %** en algún intento. |
| Fecha | La del intento con la calificación que cuenta. El historial muestra todas. |
| Estudiantes incluidos | Solo usuarios con rol **Estudiante**. Las pruebas que haga un administrador no alteran los resultados. |
| Horario | Las fechas se muestran en hora de **Ecuador** (America/Guayaquil). |

La lógica está en `modules/admin/domain/evaluation-results.ts` y tiene 7 pruebas unitarias.

## Verificación

- **Pruebas unitarias:** 109 en total, incluidas las de agrupación, filtros, exportación CSV y zona horaria.
- **Calidad del código:** typecheck, lint y build sin errores.
- **Navegador:** escritorio y celular, **22/22 verificaciones**:
  - resumen y estados correctos;
  - la calificación es el mejor intento y no el último;
  - la fecha sale en hora local;
  - el historial de intentos se despliega;
  - los filtros, la búsqueda y el cambio de módulo funcionan;
  - no hay scroll horizontal ni errores de consola.

  Se usaron el componente y la lógica reales con datos de ejemplo, porque las consultas a la base de datos no pueden ejecutarse en el entorno de desarrollo usado.

Capturas en `docs/img/resultados-evaluaciones/`.
