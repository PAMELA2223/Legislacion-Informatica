import { Bot, CheckCircle2, AlertTriangle, MessageCircle, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CONCEPTOS } from "@/modules/chatbot/domain/chatbot-knowledge";
import { resumirUso } from "@/modules/chatbot/domain/chatbot-config";
import { PrismaChatbotConfigRepository } from "@/modules/chatbot/infrastructure/prisma-chatbot-config.repository";
import { ChatbotConfigForm } from "@/modules/admin/presentation/chatbot-config-form";
import { describirProveedor } from "@/modules/chatbot/infrastructure/language-model.factory";

export const dynamic = "force-dynamic";

const ETIQUETA_INTENCION: Record<string, string> = {
  definicion: "¿Qué es…?",
  ejemplo: "Pedir un ejemplo",
  simplificar: "Explicación más sencilla",
  diferencia: "Diferencias entre conceptos",
  situacion: "Situaciones y casos",
  "respuesta-evaluacion": "Pidió respuestas de evaluación (rechazado)",
  general: "Otras consultas",
  saludo: "Saludos",
  capacidades: "¿Qué puedes hacer?",
  cortesia: "Agradecimientos y despedidas",
  "fuera-de-tema": "Fuera de tema (redirigidas)",
};
const DIAS = 30;

// Configuración, estado y estadísticas del asistente.
export default async function AdminChatbotPage() {
  const repo = new PrismaChatbotConfigRepository(prisma);
  const [config, registros] = await Promise.all([
    repo.obtener(),
    repo.consultasDesde(new Date(Date.now() - DIAS * 24 * 60 * 60 * 1000)),
  ]);
  const stats = resumirUso(registros);
  const ia = describirProveedor();
  const iaActiva = ia.proveedor !== "ninguno";
  const nombreTema = (id: string) => CONCEPTOS.find((c) => c.id === id)?.nombre ?? id;

  return (
    <div className="max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground mb-1">
        <Bot className="w-6 h-6 text-primary" aria-hidden /> Chatbot
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Asistente de legislación informática para los estudiantes. Pruébalo con la bolita
        <MessageCircle className="inline w-4 h-4 mx-1 align-text-bottom" aria-hidden /> de la esquina inferior derecha.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className="rounded-2xl border border-border bg-surface p-5" aria-labelledby="config">
          <h2 id="config" className="font-semibold text-foreground mb-4">Configuración</h2>
          <ChatbotConfigForm inicial={config} />
        </section>

        <section
          className={`rounded-2xl border p-5 self-start ${iaActiva ? "border-success/40 bg-success/5" : "border-amber-300 bg-amber-50/60"}`}
          aria-labelledby="estado-ia"
        >
          <h2 id="estado-ia" className="flex items-center gap-2 font-semibold text-foreground mb-2">
            {iaActiva ? <CheckCircle2 className="w-5 h-5 text-success" aria-hidden /> : <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden />}
            {iaActiva ? "Inteligencia artificial activa" : "Funcionando en modo básico"}
          </h2>
          {iaActiva ? (
            <p className="text-sm text-foreground">
              Proveedor: <strong>{ia.nombre}</strong> · modelo <code className="text-xs">{ia.modelo}</code>. Interpreta preguntas en
              lenguaje natural usando solo los contenidos marcados, el módulo que el estudiante está viendo y la conversación previa.
            </p>
          ) : (
            <div className="text-sm text-foreground flex flex-col gap-2">
              <p>
                No hay una clave de IA configurada (<code className="text-xs">GEMINI_API_KEY</code> o{" "}
                <code className="text-xs">ANTHROPIC_API_KEY</code>). El asistente responde con su base de{" "}
                {CONCEPTOS.length} conceptos (definición, ejemplo, explicación sencilla, diferencias, situaciones) y con los contenidos
                marcados, pero no comprende temas fuera de ellos.
              </p>
              <p>
                Para activarla con Gemini: crea una clave en aistudio.google.com/apikey, agrégala en Vercel → Settings → Environment
                Variables como <code className="text-xs">GEMINI_API_KEY</code> y vuelve a desplegar.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5" aria-labelledby="uso">
        <h2 id="uso" className="flex items-center gap-2 font-semibold text-foreground mb-1">
          <BarChart3 className="w-5 h-5 text-accent" aria-hidden /> Uso en los últimos {DIAS} días
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Solo se registran el tipo de consulta y el tema reconocido; por privacidad no se guarda el texto de las conversaciones.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            ["Consultas", stats.total],
            ["Últimos 7 días", stats.ultimos7Dias],
            ["Estudiantes", stats.estudiantes],
            ["Sin información suficiente", stats.porcentajeSinInformacion === null ? "—" : `${stats.porcentajeSinInformacion}%`],
          ].map(([etiqueta, valor]) => (
            <div key={String(etiqueta)} className="rounded-xl bg-background-secondary p-3">
              <p className="text-xs text-muted-foreground">{etiqueta}</p>
              <p className="text-xl font-bold text-foreground">{valor}</p>
            </div>
          ))}
        </div>
        {stats.total === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay consultas registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Temas más consultados</h3>
              {stats.temasFrecuentes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin temas reconocidos todavía.</p>
              ) : (
                <ol className="flex flex-col gap-1.5">
                  {stats.temasFrecuentes.map((t) => (
                    <li key={t.tema} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-foreground">{nombreTema(t.tema)}</span>
                      <span className="font-semibold text-foreground">{t.total}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Tipo de consulta</h3>
              <ol className="flex flex-col gap-1.5">
                {stats.porIntencion.map((p) => (
                  <li key={p.intencion} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground">{ETIQUETA_INTENCION[p.intencion] ?? p.intencion}</span>
                    <span className="font-semibold text-foreground">{p.total}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          Un porcentaje alto de consultas &quot;sin información suficiente&quot; indica temas que conviene agregar al contenido de los módulos o al glosario.
        </p>
      </section>
    </div>
  );
}
