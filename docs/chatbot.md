# Chatbot educativo (bolita flotante)

Asistente de legislación informática integrado como **funcionalidad adicional**.
No modifica módulos, evaluaciones, autoevaluaciones ni el examen final.

## Actualizar

Desde `apps/web`:

```bash
npx prisma migrate dev --name chatbot-config   # tablas nuevas: chatbot_config y chatbot_consultas (aditivas)
```

En producción: `npx prisma migrate deploy`.

Si la migración todavía no se aplicó, el chatbot funciona igual con la configuración por defecto (activo y con todos los contenidos); solo no se guardan estadísticas.

**Comprensión completa con IA:** requiere una clave de **Google Gemini** (`GEMINI_API_KEY`) o de **Anthropic** (`ANTHROPIC_API_KEY`) en Vercel. Sin ninguna, funciona en modo básico. **Panel → Chatbot** muestra el proveedor y el modelo activos.

### Activar con Google Gemini

1. Entra a https://aistudio.google.com/apikey y crea (o copia) tu clave de API.
   - Solo se necesita la **clave**: el nombre, el nombre del proyecto y el número del proyecto no se usan.
   - No compartas la clave ni la pegues en el código ni en GitHub.
2. En **Vercel → tu proyecto → Settings → Environment Variables**, agrega:
   - Nombre: `GEMINI_API_KEY`
   - Valor: tu clave
   - Entorno: Production
3. **Vuelve a desplegar** (Deployments → Redeploy). Las variables solo se aplican en un despliegue nuevo.
4. Comprueba en **Panel → Chatbot** que diga "Inteligencia artificial activa · Proveedor: Google Gemini".

**Opcional:**
- `GEMINI_MODEL` fija un modelo concreto. Si no existe o Google lo retira, el chatbot prueba automáticamente: gemini-3.8-flash → 3.7 → 3.5 → 2.5.
- Si configuras las dos claves, se usa Gemini, salvo que pongas `CHATBOT_PROVIDER=anthropic`.

**Nivel gratuito y de pago:** Google AI Studio ofrece un nivel gratuito con límites de uso. El nivel de pago amplía los límites y requiere configurar la facturación en AI Studio. Revisa los términos de uso de cada nivel, en especial sobre el uso de los datos enviados. El chatbot no envía datos personales del estudiante: solo la pregunta, el contexto del módulo y el contenido de la plataforma.

## Para el estudiante

- **Bolita flotante** en la esquina inferior derecha, visible en toda la plataforma, incluidos los módulos:
  - al pasar el cursor muestra **"¿Necesitas ayuda?"**;
  - la misma bolita abre y cierra la ventana, que también se cierra con ✕ o con Escape.
- **No cubre contenido:** con el chatbot activo, cada página reserva espacio al final para que la bolita nunca tape el último botón (por ejemplo, "Enviar evaluación").
- **Saludo:** "Hola 👋 Soy tu asistente de legislación informática. ¿En qué puedo ayudarte?", con preguntas de ejemplo debajo.
- **Conversación:** cada mensaje lleva su etiqueta, **Estudiante** o **Chatbot**. El asistente agrega enlaces al contenido relacionado y sugerencias como "Ponme un ejemplo" o "Explícamelo más fácil".
- **Historial:** se conserva durante la sesión, aunque se navegue o se recargue la página. Se borra al cerrar la pestaña o con **"Nueva conversación"**. Se guarda por usuario, así que otro estudiante en el mismo navegador no lo ve.
- **Contexto:** entiende preguntas de seguimiento ("¿Y cuál sería un ejemplo?") usando el tema que preguntó el estudiante.
- **Dentro de un módulo:** usa el tema del módulo para interpretar preguntas como "Explícame este tema de una manera sencilla".

## Cómo responde

| Tipo de pregunta | Respuesta |
|---|---|
| ¿Qué es…? | Concepto en 1-2 frases y un ejemplo práctico. En temas complejos: concepto → explicación sencilla → ejemplo. |
| Ejemplo | Un ejemplo concreto del tema, también en seguimientos. |
| Más sencillo | Lenguaje cotidiano, sin tecnicismos. |
| Diferencia | Comparación directa, con diferencias verificadas para los pares frecuentes. |
| Situación o caso (por ejemplo, el correo que aparenta ser del banco) | Tipo de riesgo, elementos que intervienen, medidas de prevención y norma aplicable. |
| Respuesta de una evaluación | No la da: explica el concepto para que el estudiante razone. |
| Sin información suficiente | "No encuentro información suficiente sobre ese tema dentro del contenido disponible. Puedes consultar el material del módulo correspondiente." |

**No inventa información:** responde solo con los contenidos que el administrador habilitó.

## Para el administrador (Panel → Chatbot)

- **Activar o desactivar** el asistente. Desactivado, la bolita desaparece de la plataforma.
- **Contenidos que puede usar:**
  - base de conocimiento (16 conceptos verificados);
  - contenido de los módulos;
  - glosario;
  - preguntas frecuentes;
  - biblioteca normativa;
  - casos prácticos (nunca su respuesta correcta).
- **Estadísticas de los últimos 30 días:** consultas, estudiantes, porcentaje sin información suficiente, temas más consultados y tipo de consulta.
  - Por privacidad **no se guarda el texto** de las conversaciones, solo el tipo de consulta y el tema reconocido.
  - Solo se cuentan estudiantes; las pruebas del administrador no entran en las estadísticas.

## Verificación

- **Pruebas unitarias:** 125 en total, incluidas las preguntas y el caso del correo bancario del documento. Typecheck, lint y build sin errores.
- **Navegador:** escritorio y celular, **33/33 verificaciones** y sin errores de consola. Se comprobaron:
  - posición de la bolita e indicación al pasar el cursor;
  - que no tapa el último botón de la página;
  - abrir y cerrar con la bolita, con ✕ y con Escape;
  - saludo exacto, etiquetas y contexto de la conversación;
  - historial conservado al recargar y separado por usuario;
  - "Nueva conversación";
  - que la ventana cabe en pantalla.
- Las pruebas encontraron y se corrigió:
  - un seguimiento que tomaba el tema de la respuesta del asistente en lugar de la pregunta del estudiante;
  - la frase "de una manera sencilla", que no se reconocía como pedido de explicación sencilla;
  - el caso narrado en tercera persona, que no se identificaba como phishing.

## Corrección de la mensajería (saludos y contexto)

**Problema.** Al escribir "hola", el chatbot respondía sobre "Seguridad de contraseñas y autenticación".

**Causa.**
1. "hola" no se reconocía como saludo.
2. Como un mensaje tan corto aporta pocas palabras para buscar, el chatbot completaba la búsqueda con las palabras de la **pregunta anterior** ("contraseña", "segura").
3. Mostraba el primer resultado sin verificar que tuviera relación con el mensaje actual.

No se trataba de que el contenido del módulo se enviara como si fuera la pregunta: la pregunta siempre se envía como mensaje del estudiante, y el módulo, en las instrucciones.

**Corrección** (solo lógica; el diseño no cambió):

| # | Comportamiento ahora |
|---|---|
| 1 | Primero se analiza el mensaje actual. Saludos ("hola", "buenos días", "¿cómo estás?"), "¿qué puedes hacer?" y agradecimientos o despedidas se responden con naturalidad, **sin buscar contenido ni consultar a la IA**. "Hola, ¿qué es el phishing?" se trata como pregunta. |
| 2 | Las preguntas de legislación informática se responden según el tema identificado. |
| 3 | La conversación anterior solo se usa en preguntas de seguimiento ("¿y cuál es un ejemplo?"). Un "hola" posterior es un saludo nuevo. |
| 4 | Solo se muestra contenido de la plataforma, como respuesta o como enlace, si se relaciona con el mensaje actual. El módulo es **contexto secundario**: se usa si la pregunta trata de su tema o se refiere a él ("este tema"). |
| 5 | Las preguntas fuera de tema ("¿cuál es el clima de hoy?") reciben una respuesta breve que redirige a los temas de la plataforma. Una pregunta del ámbito sin información recibe "No encuentro información suficiente…". |
| 6 | Un mensaje vacío no se envía, y el servidor tampoco lo procesaría. |
| 7 | "Escribiendo…" aparece como mensaje del Chatbot y se reemplaza por la respuesta. |
| 8 | El historial alterna Estudiante → Chatbot. Si se inicia una nueva conversación mientras llega una respuesta, esa respuesta se descarta. |

**Con IA (Gemini o Claude):** las instrucciones piden responder siempre al último mensaje y marcan el módulo como contexto secundario, que no debe mencionarse si el estudiante pregunta otra cosa.

**Verificación:** 159 pruebas unitarias, incluida la reproducción exacta de la captura, y 13/13 verificaciones en el navegador.
