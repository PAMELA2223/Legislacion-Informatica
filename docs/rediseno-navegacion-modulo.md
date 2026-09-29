# Rediseño de la navegación dentro de los módulos

Respuesta a la observación de la tutora: en la vista del módulo no era evidente
que existía más contenido, porque aparecía detrás de flechas pequeñas y de una
barra horizontal. Regla aplicada: **"El estudiante no debe tener que adivinar
cómo continuar."**

## 1. Análisis previo

| Pregunta | Hallazgo |
|---|---|
| ¿Qué generaba el "carrusel"? | No era un carrusel. Era la barra de pestañas de `lesson-tabs.tsx` con `overflow-x-auto`. Los títulos de las lecciones son largos, así que 5 pestañas no cabían y la mayoría quedaba oculta tras la barra de desplazamiento. |
| ¿Hacía falta un carrusel? | **No.** Un módulo tiene pocos contenidos (5 en promedio) y todos se pueden mostrar a la vez. Se reemplazó por una lista vertical de pasos. |
| ¿Había otros desplazamientos horizontales ocultos? | Sí. El navbar superior repetía los enlaces del menú lateral en una fila con `overflow-x-auto` (la barra gris bajo "Autoevaluación · Foro · Ranking…" en la captura). |
| ¿Cómo se estructuran los contenidos? | Cada módulo (`courses`) tiene lecciones (`lessons`) de distintos tipos: texto, video, PDF, infografía, podcast, etc. |
| ¿Cómo se registra el progreso? | Por lección, en `lesson_progress`, mediante `POST /api/lessons/:id/complete`. **No se modificó.** |
| ¿Cuándo está completo un módulo? | Cuando se revisaron todas sus lecciones y se aprobó su evaluación (≥70 %), según `modules/learning-path`. **No se modificó.** |

## 2. Qué cambió

### Vista del módulo (`/modulos/[slug]`)

Estructura, de arriba hacia abajo:

1. **Encabezado:** "Módulo 1 de 11", título y descripción.
2. **Progreso del módulo:** porcentaje, barra, "3 de 5 contenidos completados", estado de la evaluación y un recuadro **"Siguiente paso: …"** que siempre dice qué hacer.
3. **Contenido del módulo:** lista vertical con TODOS los contenidos y la evaluación como paso final. Cada uno muestra:
   - su número y tipo (ícono + "Video", "Material de lectura", "Infografía"…);
   - su estado: **✓ Completado · ● En progreso · ○ Pendiente** (🔒 si la evaluación aún no está disponible).
4. **Visor del contenido actual:**
   - **Encabezado:** "Contenido 2 de 5 · Video" y el estado del contenido.
   - **Botones:** **[← Anterior]**, deshabilitado en el primero, y una **acción principal** grande que cambia según la situación:

   | Situación | Botón principal |
   |---|---|
   | Contenido sin completar | **Completar y continuar →** (guarda el progreso y avanza al siguiente pendiente) |
   | Contenido ya completado | **Siguiente →** |
   | Último contenido sin completar | **Completar contenido** |
   | Todo completado, evaluación pendiente | **Continuar a la evaluación →** |
   | Quedan contenidos pendientes atrás | **Ir al contenido pendiente →** |
   | Módulo completado | **Siguiente módulo: … →** (o "Ir a la autoevaluación final") |

5. **Evaluación del módulo:** bloqueada con candado y el motivo ("Se habilita cuando completes los 5 contenidos… 3 de 5 listos"), luego resaltada en azul cuando está disponible y, al final, aprobada con su puntaje.
6. **Cierre:** "¡Módulo completado!" con el botón al siguiente módulo.
7. **Información del módulo** (resumen, propósito, bibliografía) plegada al final para no competir con el contenido.

Otros detalles:
- **URL:** el contenido actual se guarda en la dirección (`?contenido=3`). Sobrevive a recargas, funciona con el botón "atrás" y se puede compartir.
- **Al entrar:** se abre el primer contenido pendiente o, si todo está completo, el último, donde está el botón hacia la evaluación.
- **Tipos de recurso:** "Línea de tiempo" y "Presentación" antes no mostraban nada; ahora ofrecen el enlace al recurso.

### Diseño responsivo

| Pantalla | Distribución |
|---|---|
| ≥ 1280 px | Lista a la izquierda (fija al desplazar) y visor a la derecha. |
| Laptop y tablet | Lista arriba en 2 columnas compactas; visor a todo el ancho. |
| Celular | Lista en una columna, títulos de una línea (el completo aparece al mantener el cursor); botones a todo el ancho y de al menos 44 px de alto. |

Nunca hay desplazamiento horizontal. Además, el área principal usa `min-w-0` y `overflow-x-clip` como protección general.

### Menú

- **Navbar:** se eliminó la fila de enlaces con scroll horizontal. En escritorio (≥1024 px) la navegación está en el menú lateral; en tablet y celular, en el botón ☰, que antes no aparecía en tablets.
- **Menú lateral:** ahora está agrupado por secciones:
  - Estudiante: Principal, Académico, Comunidad y Cuenta.
  - Administrador: Panel, Aprendizaje, Recursos y comunidad, y Sistema.
- **Opciones retiradas:** "Evaluaciones", "Videos" e "Infografías" ya no aparecen (cambio de la entrega anterior; la captura corresponde a la versión publicada antes de ella).

## 3. Archivos

| Archivo | Cambio |
|---|---|
| `src/modules/courses/domain/module-navigation.ts` | **Nuevo.** Reglas puras de navegación (estado de cada contenido, acción principal, contenido inicial) y sus pruebas. |
| `src/modules/courses/presentation/module-learning-view.tsx` | **Nuevo.** Vista del módulo. |
| `src/modules/courses/presentation/lesson-content.tsx` | **Nuevo.** Visualización de cada tipo de recurso (extraída de las pestañas). |
| `src/modules/courses/presentation/lesson-tabs*.tsx` | **Eliminados.** Eran las pestañas con scroll oculto; nada más las usaba. |
| `src/app/(dashboard)/modulos/[slug]/page.tsx` | Usa la nueva vista. La lógica de acceso del servidor no cambió. |
| `src/components/nav-bar.tsx`, `mobile-nav-drawer.tsx`, `sidebar/app-sidebar.tsx`, `src/lib/navigation.ts` | Menú sin scroll horizontal, desplegable en tablet y secciones agrupadas. |

## 4. Pruebas realizadas

**Pruebas unitarias:** 70 en total, incluidas las nuevas de navegación del módulo y del menú. Además, typecheck, lint y build de producción sin errores.

**Pruebas en navegador:** con Chromium y 4 tamaños de pantalla (escritorio 1440×900, laptop 1024×768 como la captura, tablet 820×1180 y celular 390×844). Se usó una página temporal con los datos del Módulo 1 y el progreso simulado en memoria. **83/83 verificaciones pasan**:

| Caso | Verificado |
|---|---|
| 1 | Los 5 contenidos y la evaluación visibles en la lista; indicador "Contenido 1 de 5". |
| 2 | "Completar y continuar" guarda y avanza al contenido 2. |
| 3 | "Anterior" deshabilitado en el primero y funcional en los demás. |
| 4 | "Siguiente" en un contenido completado lleva al siguiente. |
| 5 | En el último aparece "Completar contenido" y luego "Continuar a la evaluación →". |
| 6 | La evaluación queda habilitada y resaltada al completar el contenido. |
| 7–8 | Funciona en escritorio y laptop (menú lateral) y en tablet y celular (menú ☰, que se cierra con Escape). |
| 9 | Sin scroll horizontal en la página, en el contenido ni en el navbar, antes y después de recorrer el módulo. |
| 10 | El progreso se actualiza (20 % → 100 %, "5 de 5") y se conserva al recargar, junto con la posición. |
| Extra | Navegación con teclado (Tab + Enter en la lista); con el módulo completado, la acción principal lleva al siguiente módulo. |

Durante las pruebas se detectaron y corrigieron tres defectos:
- Tras guardar el progreso, el refresco del servidor volvía a montar la vista y se perdía el contenido actual. Se resolvió guardándolo en la URL.
- La actualización de la URL se perdía por pasar el estado interno de Next.js a `history.replaceState`.
- El recorte de títulos largos no funcionaba (también fallaba en la versión anterior).

Capturas en `docs/img/rediseno-modulo/`. **Pendiente de tu lado:** repetir los casos con la base de datos real y en un celular físico.
