# Panel de administración, infografías en los módulos y chatbot

Respuesta al documento "Cambios y correcciones en el panel de administración y en los módulos".

## 1. Actualizar una instalación existente

Desde `apps/web`:

```bash
npx prisma migrate dev --name eliminar-modulos   # campo nuevo: courses.eliminado_en (aditivo)
npm run dev
```

En producción: `npx prisma migrate deploy`.

**Variables de entorno en Vercel:**

| Variable | Para qué | Sin ella |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Subir imágenes de infografías (Supabase Storage; el bucket `infografias` se crea solo). | Solo se pueden pegar enlaces de imágenes. |
| `ANTHROPIC_API_KEY` | Que el chatbot comprenda cualquier pregunta en lenguaje natural. | Modo básico: responde bien sobre 16 conceptos, pero no entiende temas fuera de ellos. |

Después de actualizar, entra a **Panel → Infografías** y pulsa **"Vincular ahora"** para asociar las 4 infografías incluidas en la plataforma a sus módulos.

## 2. Qué causaba cada problema y qué se cambió

### 2.1 Autoevaluaciones duplicadas en "Evaluaciones"

**Causa.** El listado de "Evaluaciones" mostraba todas las evaluaciones, incluidas la inicial y la final. Además, la edición de una autoevaluación usaba la ruta `/admin/evaluaciones/…`, así que el menú resaltaba "Evaluaciones".

**Cambios:**
- **"Evaluaciones"** muestra solo las evaluaciones de módulos, **organizadas por módulo**. Cada módulo sin evaluación ofrece el botón "Crear evaluación". Las evaluaciones que no están asociadas a ningún módulo aparecen aparte, con una advertencia.
- **"Autoevaluaciones"** administra en exclusiva la inicial y la final, con su propia ruta (`/admin/autoevaluaciones/[id]`). Si se abre una autoevaluación con la ruta antigua, se redirige a la nueva.

### 2.2 Eliminar módulos

**Causa.** Una protección bloqueaba el borrado si algún estudiante tenía progreso o resultados en el módulo. La tabla `enrollments` además lo impide a nivel de base de datos (`onDelete: Restrict`). Solo aparecía un aviso del navegador y el módulo seguía en la lista.

**Relaciones analizadas:**

| Registro relacionado | Comportamiento al borrar el módulo |
|---|---|
| Lecciones (contenido, videos, infografías) | Cascade |
| Progreso de las lecciones | Cascade |
| Evaluación | SetNull |
| Preguntas de la evaluación | Cascade |
| Intentos de estudiantes | Cascade |
| Inscripciones (`enrollments`) | Restrict |
| Destacados | SetNull |

**Solución** (regla en `modules/admin/domain/module-deletion.ts`, con pruebas):

| Situación | Tipo de eliminación | Resultado |
|---|---|---|
| Sin datos de estudiantes | Física | Se borran el módulo, su contenido y su evaluación. |
| Con progreso o resultados | Lógica (`eliminado_en`) | Desaparece del panel, la lista de módulos, la vista del estudiante, el buscador, el chatbot y las estadísticas. Los resultados quedan en el historial. |

Detalles de la eliminación lógica:
- Tras eliminar, los módulos restantes se renumeran (1, 2, 3…) sin huecos.
- Los destacados que apuntaban al módulo quedan sin enlace roto.
- Re-ejecutar el seed no recrea un módulo archivado.

**Interfaz.** El diálogo propio muestra "¿Está seguro de que desea eliminar este módulo?" con los botones [Cancelar] y [Eliminar]:
- El foco inicial está en "Cancelar" y Escape cierra el diálogo.
- Si el servidor rechaza la operación, el motivo real aparece dentro del diálogo.
- Al terminar, un aviso confirma qué se hizo.

El mismo diálogo se usa ahora en todos los botones de eliminar del panel. "Eliminar módulo" está también en la página de detalle del módulo.

### 2.3 Infografías dentro de los módulos

**Causa.** Las infografías ya eran lecciones de tipo "Infografía" dentro de cada módulo, pero se creaban sin imagen: solo podía asignarse con un script de terminal o pegando una URL. No existía forma de subir imágenes. Las 4 infografías diseñadas para el proyecto (`public/images/infografias/`) no estaban vinculadas a ningún módulo.

**Cambios:**
- **Apartado "Infografías".** Está en el panel y se organiza por módulo: agregar, subir o seleccionar la imagen, asociarla a un módulo, editar, reemplazar la imagen, cambiar de módulo y eliminar. La vista previa se muestra antes de guardar.
- **Subida.** Se aceptan PNG, JPG o WebP de hasta 4 MB. El tipo se verifica por el contenido real del archivo, así que un SVG, un PDF o un archivo renombrado se rechazan.
- **"Vincular ahora".** Asocia las 4 infografías incluidas; en instalaciones nuevas, el seed ya las vincula.
- **Infografías antiguas** (tabla `infographics`): aparecen como "sin módulo" con el botón "Asociar al módulo". El registro original se conserva.
- **Vista del estudiante.** La imagen se adapta al ancho, mantiene su proporción y queda limitada a la altura de la pantalla. El botón **"Ampliar"** abre una vista a pantalla completa:
  - alterna entre "ajustar a la pantalla" y "tamaño real", con desplazamiento dentro de la vista;
  - se cierra con Escape y ofrece abrir la imagen en otra pestaña.

  Si la infografía es un PDF, se muestra como documento; si la imagen no carga, aparece un mensaje con enlace.

### 2.4 Chatbot

**Causa.** Sin `ANTHROPIC_API_KEY`, el chatbot solo buscaba palabras. En preguntas de seguimiento ("ponme un ejemplo") buscaba con el último mensaje, que no tiene palabras clave.

**Cambios** (en `modules/chatbot`):
- **Intérprete de consultas** (`chatbot-interpreter.ts`):
  - detecta **qué pide** el estudiante: definición, ejemplo, "más fácil", diferencia, situación o una respuesta de evaluación;
  - detecta **de qué habla**, también por señales indirectas (un correo que pide la contraseña se reconoce como phishing);
  - en los seguimientos, recupera el tema de los mensajes anteriores.
- **Base de conocimiento** (`chatbot-knowledge.ts`): 16 conceptos con definición, explicación sencilla, ejemplo real, normativa ecuatoriana y "qué hacer". Incluye comparaciones verificadas, como privacidad frente a protección de datos.
- **Con IA:** el modelo recibe la intención detectada, las fichas del concepto, el contenido relacionado de la plataforma (lecciones, glosario, preguntas frecuentes, normas y casos prácticos), el **módulo que se está estudiando** con un extracto de su contenido y la conversación previa. Las reglas le piden respuestas de 2 a 5 frases y un ejemplo cuando ayude.
- **Sin IA:** responde según la intención usando la base de conocimiento; ya no es un buscador de palabras.
- **Evaluaciones protegidas:**
  - reconoce pedidos como "¿cuál es la respuesta de la pregunta 3?";
  - detecta cuando se pega una pregunta real de una evaluación y entonces explica solo el concepto (en esos casos la IA recibe las fichas sin la normativa, que suele ser la respuesta);
  - si el estudiante está resolviendo una evaluación, extrema el cuidado;
  - no usa la actuación correcta de los casos prácticos como contexto.
- **Interfaz:**
  - botón flotante "Asistente de Legislación Informática" con el saludo "Hola, ¿qué deseas consultar?";
  - las preguntas de ejemplo del documento;
  - botones de seguimiento: "Ponme un ejemplo", "Explícamelo más fácil" y "¿Qué diferencia hay con…?".
- **Panel → Chatbot:** muestra si la IA está activa, cómo activarla y los temas cubiertos. Los administradores pueden probar el chatbot.

## 3. Otras correcciones encontradas durante las pruebas

- **Aviso de eliminación:** desaparecía con la fila borrada o al refrescar la página. Ahora es un avisador global que persiste.
- **Menú móvil cerrado:** seguía siendo alcanzable con el teclado y visible para lectores de pantalla. Ahora se oculta de verdad. Este fallo existía desde antes.

## 4. Verificación (sección 14 del pedido)

**Pruebas unitarias:** 97, incluidas las preguntas de ejemplo del documento. Typecheck, lint y build de producción sin errores.

**Pruebas en navegador:** con Chromium, en escritorio (1440×900) y celular (390×844). **52/52 verificaciones pasan y no hay errores en consola.**

| Punto | Resultado |
|---|---|
| Autoevaluaciones fuera de "Evaluaciones" / solo módulos / ambas en "Autoevaluaciones" | ✔ Por construcción de las consultas y rutas. No se probó en navegador porque requiere base de datos. |
| Eliminar módulo con confirmación, error visible y aviso | ✔ Navegador. |
| Relaciones al eliminar (física o lógica) | ✔ Pruebas unitarias de la regla. |
| Infografías asociadas a módulos y visibles dentro del módulo | ✔ |
| Imágenes adaptadas sin deformarse, con vista ampliada, en computadora y celular | ✔ Navegador. |
| El chatbot interpreta situaciones, da ejemplos, simplifica y compara | ✔ Navegador (modo básico) y pruebas unitarias (prompt para la IA). |
| El chatbot usa el contexto del módulo | ✔ Pruebas unitarias. |
| No entrega respuestas de evaluaciones (pedidas o copiadas) | ✔ Navegador y pruebas unitarias. |
| Sin errores de consola ni scroll horizontal | ✔ |

**Pendiente de tu lado:**
- Las pantallas del panel que leen la base de datos y la subida real a Supabase no pudieron abrirse en este entorno. Su lógica está cubierta por pruebas unitarias; conviene recorrerlas una vez tras la migración.
- Las respuestas con IA real dependen de configurar `ANTHROPIC_API_KEY`.

Capturas en `docs/img/panel-infografias-chatbot/`.
