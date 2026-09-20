"use client";

import { useState } from "react";
import { Video, FileText, Image as ImageIcon, Headphones, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

const ICONOS: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-4 h-4" />,
  PDF: <FileText className="w-4 h-4" />,
  INFOGRAFIA: <ImageIcon className="w-4 h-4" />,
  TEXTO: <FileText className="w-4 h-4" />,
  PODCAST: <Headphones className="w-4 h-4" />,
  LINEA_TIEMPO: <FileText className="w-4 h-4" />,
  MAPA_CONCEPTUAL: <ImageIcon className="w-4 h-4" />,
  PRESENTACION: <FileText className="w-4 h-4" />,
};

interface Leccion {
  id: string;
  tipo: string;
  titulo: string;
  urlRecurso?: string | null;
  contenido?: string | null;
  completado?: boolean;
}

export function LessonTabs({
  lecciones,
  onCompletar,
}: {
  lecciones: Leccion[];
  onCompletar: (lessonId: string) => Promise<void>;
}) {
  const [activa, setActiva] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [imagenRota, setImagenRota] = useState<string | null>(null);
  const leccion = lecciones[activa];

  async function handleCompletar() {
    setCargando(true);
    try {
      await onCompletar(leccion.id);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="flex overflow-x-auto border-b border-border">
        {lecciones.map((l, i) => (
          <button
            key={l.id}
            onClick={() => setActiva(i)}
            className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              i === activa
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {ICONOS[l.tipo] ?? <FileText className="w-4 h-4" />}
            {l.titulo}
          </button>
        ))}
      </div>

      <div className="p-6 min-h-[200px]">
        {leccion.tipo === "VIDEO" && (
          <div className="aspect-video rounded-xl bg-foreground/5 flex items-center justify-center text-muted-foreground text-sm">
            {leccion.urlRecurso ? (
              getYoutubeEmbedUrl(leccion.urlRecurso) ? (
                <iframe
                  src={getYoutubeEmbedUrl(leccion.urlRecurso)!}
                  className="w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls className="w-full h-full rounded-xl">
                  <source src={leccion.urlRecurso} />
                </video>
              )
            ) : (
              "Video pendiente de cargar"
            )}
          </div>
        )}

        {leccion.tipo === "PDF" && (
          <div className="flex flex-col gap-2">
            <div className="aspect-[4/3] rounded-xl bg-foreground/5 flex items-center justify-center text-muted-foreground text-sm">
              {leccion.urlRecurso ? (
                <iframe src={leccion.urlRecurso} className="w-full h-full rounded-xl" />
              ) : (
                "PDF pendiente de cargar"
              )}
            </div>
            {leccion.urlRecurso && (
              <a
                href={leccion.urlRecurso}
                target="_blank"
                rel="noreferrer"
                className="self-start inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Abrir PDF en una pestaña nueva <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <p className="text-xs text-muted-foreground">
              Algunas fuentes (sitios de gobierno, etc.) no permiten mostrar su PDF
              embebido aquí por seguridad — en ese caso, el recuadro de arriba se
              verá en blanco. Usa el enlace de arriba para abrirlo directamente.
            </p>
          </div>
        )}

        {(leccion.tipo === "INFOGRAFIA" || leccion.tipo === "MAPA_CONCEPTUAL") && (
          <div className="flex flex-col gap-2">
            <div className="aspect-[4/3] rounded-xl bg-foreground/5 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
              {leccion.urlRecurso ? (
                imagenRota === leccion.urlRecurso ? (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                    <span>
                      Esta imagen no se puede mostrar aquí (el sitio de origen bloquea
                      que se embeba). Ábrela directamente con el enlace de abajo.
                    </span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={leccion.urlRecurso}
                    alt={leccion.titulo}
                    className="w-full h-full object-contain rounded-xl"
                    onError={() => setImagenRota(leccion.urlRecurso ?? null)}
                  />
                )
              ) : (
                "Recurso visual pendiente de cargar"
              )}
            </div>
            {leccion.urlRecurso && (
              <a
                href={leccion.urlRecurso}
                target="_blank"
                rel="noreferrer"
                className="self-start inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Ver imagen en una pestaña nueva <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {leccion.tipo === "PODCAST" && (
          <div className="rounded-xl bg-foreground/5 p-6 flex items-center justify-center text-muted-foreground text-sm">
            {leccion.urlRecurso ? (
              <audio controls className="w-full">
                <source src={leccion.urlRecurso} />
              </audio>
            ) : (
              "Audio pendiente de cargar"
            )}
          </div>
        )}

        {leccion.tipo === "TEXTO" && (
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {leccion.contenido || "Contenido pendiente de redacción."}
          </p>
        )}
      </div>

      <div className="px-6 pb-6">
        <Button onClick={handleCompletar} isLoading={cargando} variant={leccion.completado ? "outline" : "primary"}>
          {leccion.completado ? "Marcado como completado ✓" : "Marcar como completado"}
        </Button>
      </div>
    </div>
  );
}
