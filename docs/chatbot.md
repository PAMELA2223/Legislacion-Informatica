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

**Comprensión completa con IA:** requiere `ANTHROPIC_API_KEY` en Vercel. Sin ella funciona en modo básico. **Panel → Chatbot** muestra el estado.

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
