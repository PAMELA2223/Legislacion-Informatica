"use client";

// Asistente de legislación informática: bolita flotante (esquina inferior
// derecha) que abre/cierra una ventana de chat. Disponible en toda el área
// autenticada; dentro de un módulo envía la ruta actual para que el
// asistente use el contexto de ese módulo.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Bot, RotateCcw } from "lucide-react";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
  fuentes?: { titulo: string; url: string }[];
  sugerencias?: string[];
}

export const SALUDO = "Hola 👋 Soy tu asistente de legislación informática. ¿En qué puedo ayudarte?";

const SUGERENCIAS = [
  "¿Qué es un delito informático?",
  "¿Qué diferencia existe entre privacidad y protección de datos?",
  "¿Qué puedo hacer si alguien utiliza mis datos sin autorización?",
  "Dame un ejemplo de una estafa digital",
];

const MAX_GUARDADOS = 30;

/** La conversación se guarda en sessionStorage (se borra al cerrar la pestaña), por usuario. */
function claveSesion(usuarioId: string) {
  return `chatbot-conversacion:${usuarioId}`;
}

export function ChatbotWidget({ usuarioId }: { usuarioId: string }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargado, setCargado] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bolitaRef = useRef<HTMLButtonElement>(null);

  // Recuperar la conversación de esta sesión (tras montar, para no desajustar el render del servidor).
  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem(claveSesion(usuarioId));
      if (guardado) setMensajes(JSON.parse(guardado));
    } catch {
      // sessionStorage no disponible (modo privado estricto): la conversación vive solo en memoria.
    }
    setCargado(true);
  }, [usuarioId]);

  useEffect(() => {
    if (!cargado) return;
    try {
      sessionStorage.setItem(claveSesion(usuarioId), JSON.stringify(mensajes.slice(-MAX_GUARDADOS)));
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  }, [mensajes, cargado, usuarioId]);

  useEffect(() => {
    if (abierto) finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes, abierto, enviando]);

  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    bolitaRef.current?.focus();
  }, []);

  async function enviar(contenido: string) {
    const consulta = contenido.trim();
    if (!consulta || enviando) return;
    const historial: Mensaje[] = [...mensajes, { role: "user", content: consulta }];
    setMensajes(historial);
    setTexto("");
    setEnviando(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Se envía la conversación para entender preguntas como "¿y un ejemplo?".
          mensajes: historial.map(({ role, content }) => ({ role, content })),
          pagina: pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setMensajes((m) => [
        ...m,
        res.ok
          ? { role: "assistant", content: data.respuesta, fuentes: data.fuentes, sugerencias: data.sugerencias }
          : { role: "assistant", content: data.error || "No pude responder en este momento. Inténtalo de nuevo." },
      ]);
    } catch {
      setMensajes((m) => [...m, { role: "assistant", content: "No pude conectarme. Revisa tu conexión e inténtalo de nuevo." }]);
    } finally {
      setEnviando(false);
    }
  }

  const ultimo = mensajes[mensajes.length - 1];

  return (
    <>
      {abierto && (
        <div
          role="dialog"
          aria-label="Asistente de legislación informática"
          onKeyDown={(e) => {
            if (e.key === "Escape") cerrar();
          }}
          className="fixed z-50 right-4 left-4 sm:left-auto sm:w-[24rem] flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card-lg"
          style={{
            bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
            height: "min(70vh, 560px)",
          }}
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between gap-2 bg-navy px-4 py-3 text-white">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Bot className="w-4 h-4" aria-hidden />
              </span>
              <span className="text-sm font-semibold truncate">Asistente de legislación informática</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {mensajes.length > 0 && (
                <button
                  onClick={() => setMensajes([])}
                  aria-label="Nueva conversación"
                  title="Nueva conversación"
                  className="rounded-lg p-1.5 hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden />
                </button>
              )}
              <button onClick={cerrar} aria-label="Cerrar asistente" title="Cerrar" className="rounded-lg p-1.5 hover:bg-white/10">
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Conversación */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" aria-live="polite">
            <Burbuja autor="Chatbot" propio={false}>
              {SALUDO}
            </Burbuja>

            {mensajes.length === 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Puedes preguntar con tus propias palabras, por ejemplo:</p>
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="text-left text-xs rounded-xl border border-border px-3 py-2 text-foreground hover:border-primary"
                  >
                    {s}
                  </button>
                ))}
                <p className="text-[11px] text-muted-foreground mt-1">
                  Soy una herramienta de apoyo: te ayudo a comprender los temas, pero no resuelvo las evaluaciones.
                </p>
              </div>
            )}

            {mensajes.map((m, i) => (
              <Burbuja key={i} autor={m.role === "user" ? "Estudiante" : "Chatbot"} propio={m.role === "user"}>
                {m.content}
                {m.fuentes && m.fuentes.length > 0 && (
                  <span className="mt-2 pt-2 border-t border-border/60 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Ver en la plataforma:</span>
                    {m.fuentes.map((f) => (
                      <Link key={f.url} href={f.url} className="text-xs text-primary hover:underline" onClick={() => setAbierto(false)}>
                        {f.titulo}
                      </Link>
                    ))}
                  </span>
                )}
              </Burbuja>
            ))}

            {enviando && (
              <p className="text-xs text-muted-foreground" role="status">
                Chatbot está escribiendo…
              </p>
            )}

            {!enviando && ultimo?.role === "assistant" && (ultimo.sugerencias?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2" aria-label="Preguntas de seguimiento sugeridas">
                {ultimo.sugerencias!.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="text-xs rounded-full border border-primary/40 px-3 py-1.5 text-primary hover:bg-primary/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Campo de escritura */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(texto);
            }}
            className="border-t border-border p-3 flex items-end gap-2"
          >
            <label htmlFor="chatbot-input" className="sr-only">Escribe tu pregunta</label>
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
              placeholder="Escribe tu pregunta…"
              className="flex-1 resize-none rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:border-primary max-h-28"
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              aria-label="Enviar pregunta"
              className="rounded-xl bg-primary text-white p-2.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" aria-hidden />
            </button>
          </form>
        </div>
      )}

      {/* Bolita flotante: la misma abre y cierra la ventana */}
      <div
        className="group fixed z-50 right-4 flex items-center gap-2"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {!abierto && (
          <span
            role="tooltip"
            id="chatbot-ayuda"
            className="pointer-events-none whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white shadow-card-md opacity-0 translate-x-1 transition duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 motion-reduce:transition-none"
          >
            ¿Necesitas ayuda?
          </span>
        )}
        <button
          ref={bolitaRef}
          onClick={() => (abierto ? cerrar() : setAbierto(true))}
          aria-label={abierto ? "Cerrar asistente" : "Abrir asistente de legislación informática"}
          aria-describedby={abierto ? undefined : "chatbot-ayuda"}
          aria-expanded={abierto}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-glow-primary flex items-center justify-center hover:bg-primary-hover hover:scale-105 active:scale-95 transition motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {abierto ? <X className="w-6 h-6" aria-hidden /> : <MessageCircle className="w-6 h-6" aria-hidden />}
        </button>
      </div>
    </>
  );
}

function Burbuja({ autor, propio, children }: { autor: "Estudiante" | "Chatbot"; propio: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col ${propio ? "items-end" : "items-start"}`}>
      <span className="mb-0.5 px-1 text-[11px] font-semibold text-muted-foreground">{autor}</span>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line break-words flex flex-col ${
          propio ? "bg-primary text-white rounded-tr-sm" : "bg-background-secondary text-foreground rounded-tl-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
