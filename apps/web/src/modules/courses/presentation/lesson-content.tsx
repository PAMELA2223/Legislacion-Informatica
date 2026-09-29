import {
  PlayCircle,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Headphones,
  History,
  Network,
  Presentation,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

export interface LeccionVista {
  id: string;
  tipo: string;
  titulo: string;
  urlRecurso?: string | null;
  contenido?: string | null;
  completado?: boolean;
}

/** Etiqueta e ícono por tipo de recurso: el estudiante identifica de un vistazo qué es cada contenido. */
export const TIPOS_RECURSO: Record<string, { etiqueta: string; Icono: LucideIcon }> = {
  TEXTO: { etiqueta: "Lectura", Icono: BookOpen },
  VIDEO: { etiqueta: "Video", Icono: PlayCircle },
  PDF: { etiqueta: "Material de lectura", Icono: FileText },
  INFOGRAFIA: { etiqueta: "Infografía", Icono: ImageIcon },
  PODCAST: { etiqueta: "Podcast", Icono: Headphones },
  LINEA_TIEMPO: { etiqueta: "Línea de tiempo", Icono: History },
  MAPA_CONCEPTUAL: { etiqueta: "Mapa conceptual", Icono: Network },
  PRESENTACION: { etiqueta: "Presentación", Icono: Presentation },
};

export function tipoRecurso(tipo: string) {
  return TIPOS_RECURSO[tipo] ?? { etiqueta: "Contenido", Icono: FileText };
}

function Pendiente({ texto }: { texto: string }) {
  return (
    <div className="rounded-xl bg-background-secondary p-8 text-center text-sm text-muted-foreground">{texto}</div>
  );
}

/** Muestra el recurso de una lección según su tipo (video, PDF, imagen, audio, texto…). */
export function LessonContent({ leccion }: { leccion: LeccionVista }) {
  const url = leccion.urlRecurso?.trim() || null;

  switch (leccion.tipo) {
    case "VIDEO": {
      if (!url) return <Pendiente texto="Video pendiente de cargar." />;
      const embed = getYoutubeEmbedUrl(url);
      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-foreground/5">
          {embed ? (
            <iframe
              src={embed}
              title={leccion.titulo}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video controls className="h-full w-full">
              <source src={url} />
            </video>
          )}
        </div>
      );
    }
    case "PDF":
      if (!url) return <Pendiente texto="Material pendiente de cargar." />;
      return (
        <div className="flex flex-col gap-2">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-foreground/5">
            <iframe src={url} title={leccion.titulo} className="h-full w-full" />
          </div>
          <EnlaceExterno url={url} texto="Abrir el documento en otra pestaña" />
        </div>
      );
    case "INFOGRAFIA":
    case "MAPA_CONCEPTUAL":
      if (!url) return <Pendiente texto="Recurso visual pendiente de cargar." />;
      return (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={leccion.titulo} className="w-full max-h-[70vh] rounded-xl bg-foreground/5 object-contain" />
          <EnlaceExterno url={url} texto="Ver la imagen en tamaño completo" />
        </div>
      );
    case "PODCAST":
      if (!url) return <Pendiente texto="Audio pendiente de cargar." />;
      return (
        <div className="rounded-xl bg-background-secondary p-6">
          <audio controls className="w-full">
            <source src={url} />
          </audio>
        </div>
      );
    case "TEXTO":
      return (
        <div className="max-w-prose text-[15px] leading-relaxed text-foreground whitespace-pre-line break-words">
          {leccion.contenido || "Contenido pendiente de redacción."}
        </div>
      );
    default:
      // LINEA_TIEMPO, PRESENTACION u otros: antes no se mostraban. Se ofrece el enlace al recurso.
      return url ? (
        <div className="rounded-xl bg-background-secondary p-6 flex flex-col items-start gap-2">
          {leccion.contenido && <p className="text-sm text-foreground whitespace-pre-line">{leccion.contenido}</p>}
          <EnlaceExterno url={url} texto="Abrir el recurso" />
        </div>
      ) : (
        <Pendiente texto={leccion.contenido || "Recurso pendiente de cargar."} />
      );
  }
}

function EnlaceExterno({ url, texto }: { url: string; texto: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 self-start text-sm text-primary hover:underline"
    >
      {texto} <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}
