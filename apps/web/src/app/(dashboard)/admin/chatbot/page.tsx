import { Bot, CheckCircle2, AlertTriangle, MessageCircle } from "lucide-react";
import { CONCEPTOS } from "@/modules/chatbot/domain/chatbot-knowledge";

export const dynamic = "force-dynamic";

// Estado y guía del asistente. El chatbot en sí es el botón flotante de la
// esquina inferior derecha (disponible también aquí para probarlo).
export default function AdminChatbotPage() {
  const iaActiva = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  const modelo = process.env.CHATBOT_MODEL?.trim() || "claude-haiku-4-5-20251001";

  return (
    <div className="max-w-3xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground mb-1">
        <Bot className="w-6 h-6 text-primary" aria-hidden /> Chatbot
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Asistente de legislación informática para los estudiantes. Pruébalo con el botón flotante
        <MessageCircle className="inline w-4 h-4 mx-1 align-text-bottom" aria-hidden /> de la esquina inferior derecha.
      </p>

      <section
        className={`rounded-2xl border p-5 mb-6 ${iaActiva ? "border-success/40 bg-success/5" : "border-amber-300 bg-amber-50/60"}`}
        aria-labelledby="estado-chatbot"
      >
        <h2 id="estado-chatbot" className="flex items-center gap-2 font-semibold text-foreground mb-2">
          {iaActiva ? <CheckCircle2 className="w-5 h-5 text-success" aria-hidden /> : <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden />}
          {iaActiva ? "Inteligencia artificial activa" : "Funcionando en modo básico"}
        </h2>
        {iaActiva ? (
          <p className="text-sm text-foreground">
            El asistente interpreta las preguntas en lenguaje natural con el modelo <code className="text-xs">{modelo}</code>,
            usando el contenido de la plataforma, el módulo que el estudiante está viendo y la conversación previa.
          </p>
        ) : (
          <div className="text-sm text-foreground flex flex-col gap-2">
            <p>
              No está configurada la variable <code className="text-xs">ANTHROPIC_API_KEY</code>. El asistente responde con una
              base de conocimiento de {CONCEPTOS.length} conceptos: reconoce situaciones y peticiones (definición, ejemplo,
              explicación sencilla, diferencia), pero no comprende preguntas fuera de esos temas.
            </p>
            <p>
              Para activar la comprensión completa: crea una clave en console.anthropic.com, agrégala en Vercel →
              Settings → Environment Variables como <code className="text-xs">ANTHROPIC_API_KEY</code> y vuelve a desplegar.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 mb-6">
        <h2 className="font-semibold text-foreground mb-2">Qué hace</h2>
        <ul className="text-sm text-foreground list-disc pl-5 flex flex-col gap-1">
          <li>Interpreta la intención: qué es algo, un ejemplo, &quot;explícamelo más fácil&quot;, una diferencia o una situación.</li>
          <li>Reconoce situaciones sin palabras exactas (por ejemplo, un correo que pide la contraseña → phishing).</li>
          <li>Entiende preguntas de seguimiento usando la conversación anterior.</li>
          <li>Usa el módulo que el estudiante está estudiando para interpretar preguntas vagas (&quot;¿qué significa este derecho?&quot;).</li>
          <li>Responde de forma breve y enlaza el contenido de la plataforma relacionado.</li>
          <li>No revela respuestas de evaluaciones: si detecta una pregunta de evaluación, explica solo el concepto.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-semibold text-foreground mb-2">Temas de la base de conocimiento</h2>
        <p className="flex flex-wrap gap-2">
          {CONCEPTOS.map((c) => (
            <span key={c.id} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{c.nombre}</span>
          ))}
        </p>
      </section>
    </div>
  );
}
