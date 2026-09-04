"use client";

import { useState } from "react";
import { Video, FileText, Image as ImageIcon, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

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
              <video controls className="w-full h-full rounded-xl">
                <source src={leccion.urlRecurso} />
              </video>
            ) : (
              "Video pendiente de cargar"
            )}
          </div>
        )}

        {leccion.tipo === "PDF" && (
          <div className="aspect-[4/3] rounded-xl bg-foreground/5 flex items-center justify-center text-muted-foreground text-sm">
            {leccion.urlRecurso ? (
              <iframe src={leccion.urlRecurso} className="w-full h-full rounded-xl" />
            ) : (
              "PDF pendiente de cargar"
            )}
          </div>
        )}

        {(leccion.tipo === "INFOGRAFIA" || leccion.tipo === "MAPA_CONCEPTUAL") && (
          <div className="aspect-[4/3] rounded-xl bg-foreground/5 flex items-center justify-center text-muted-foreground text-sm">
            {leccion.urlRecurso ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={leccion.urlRecurso} alt={leccion.titulo} className="w-full h-full object-contain rounded-xl" />
            ) : (
              "Recurso visual pendiente de cargar"
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
