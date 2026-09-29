"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
  fuentes?: { titulo: string; url: string }[];
}

const SUGERENCIAS = [
  "¿Qué es la legislación informática?",
  "¿Qué derechos tengo sobre mis datos personales?",
  "¿Qué diferencia hay entre firma electrónica y firma digital?",
];

const BIENVENIDA: Mensaje = {
  role: "assistant",
  content:
    "¡Hola! Soy tu asistente de legislación informática. Puedo explicarte conceptos y temas de la plataforma. " +
    "Soy una herramienta de apoyo: no resuelvo las evaluaciones por ti, pero te ayudo a comprender el contenido.",
};

/** Botón flotante con el chatbot educativo, disponible en toda el área autenticada. */
export function ChatbotWidget() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  async function enviar(contenido: string) {
    const consulta = contenido.trim();
    if (!consulta || enviando) return;
    const historial = [...mensajes, { role: "user" as const, content: consulta }];
    setMensajes(historial);
    setTexto("");
    setEnviando(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // El mensaje de bienvenida es local: no se envía.
          mensajes: historial.filter((m) => m !== BIENVENIDA).map(({ role, content }) => ({ role, content })),
          pagina: pathname,
        }),
      });
      const data = await res.json();
      setMensajes((m) => [
        ...m,
        res.ok
          ? { role: "assistant", content: data.respuesta, fuentes: data.fuentes }
          : { role: "assistant", content: data.error || "No pude responder en este momento." },
      ]);
    } catch {
      setMensajes((m) => [...m, { role: "assistant", content: "No pude conectarme. Revisa tu conexión e inténtalo de nuevo." }]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {abierto && (
        <div
          role="dialog"
          aria-label="Asistente de legislación informática"
          className="fixed z-50 bottom-20 right-4 left-4 sm:left-auto sm:w-96 h-[70vh] max-h-[560px] rounded-2xl border border-border bg-surface shadow-card-md flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-navy text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="text-sm font-semibold">Asistente académico</span>
            </div>
            <button onClick={() => setAbierto(false)} aria-label="Cerrar asistente" className="rounded-lg p-1 hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" aria-live="polite">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                    m.role === "user" ? "bg-primary text-white" : "bg-background-secondary text-foreground"
                  }`}
                >
                  {m.content}
                  {m.fuentes && m.fuentes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/60 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Ver en la plataforma:</span>
                      {m.fuentes.map((f) => (
                        <Link key={f.url} href={f.url} className="text-xs text-primary hover:underline" onClick={() => setAbierto(false)}>
                          {f.titulo}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {mensajes.length === 1 && (
              <div className="flex flex-col gap-2">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="text-left text-xs rounded-xl border border-border px-3 py-2 text-foreground hover:border-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {enviando && <p className="text-xs text-muted-foreground">Escribiendo…</p>}
            <div ref={finRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(texto);
            }}
            className="border-t border-border p-3 flex items-end gap-2"
          >
            <label htmlFor="chatbot-input" className="sr-only">Escribe tu consulta</label>
            <textarea
              id="chatbot-input"
              ref={inputRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar(texto);
                }
              }}
              rows={1}
              maxLength={1500}
              placeholder="Escribe tu consulta…"
              className="flex-1 resize-none rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-primary max-h-28"
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              aria-label="Enviar consulta"
              className="rounded-xl bg-primary text-white p-2.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setAbierto((a) => !a)}
        aria-label={abierto ? "Cerrar asistente" : "Abrir asistente de legislación informática"}
        aria-expanded={abierto}
        className="fixed z-50 bottom-4 right-4 h-14 w-14 rounded-full bg-primary text-white shadow-glow-primary flex items-center justify-center hover:bg-primary-hover transition-colors"
      >
        {abierto ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
}
