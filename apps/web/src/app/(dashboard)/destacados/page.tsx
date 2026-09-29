import { PlayCircle, ImageIcon, FileText, Star, Link2, BookOpen, ExternalLink, type LucideIcon } from "lucide-react";
import { requireAutenticado } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaFeaturedRepository } from "@/modules/featured/infrastructure/prisma-featured.repository";
import { ListarDestacadosActivosUseCase } from "@/modules/featured/application/featured.use-cases";
import { ETIQUETAS_TIPO_DESTACADO, type TipoDestacado } from "@/modules/featured/domain/featured.entity";

export const dynamic = "force-dynamic";

const ICONOS: Record<TipoDestacado, LucideIcon> = {
  VIDEO: PlayCircle,
  INFOGRAFIA: ImageIcon,
  DOCUMENTO: FileText,
  RECURSO: Star,
  ENLACE: Link2,
  MODULO: BookOpen,
};

// "Lo más destacado": reemplaza a las antiguas categorías "Videos" e
// "Infografías". El administrador decide qué aparece aquí (/admin/destacados).
export default async function DestacadosPage() {
  await requireAutenticado("/destacados");
  const items = await new ListarDestacadosActivosUseCase(new PrismaFeaturedRepository(prisma)).execute();

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Lo más destacado</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Recursos recomendados, videos, infografías y materiales de interés seleccionados para ti.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((d) => {
          const Icono = ICONOS[d.tipo] ?? Star;
          const esExterno = /^https?:\/\//i.test(d.url);
          return (
            <a
              key={d.id}
              href={d.url}
              {...(esExterno ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="rounded-2xl border border-border bg-surface overflow-hidden flex flex-col hover:-translate-y-0.5 duration-200 hover:shadow-card-md transition-transform"
            >
              {d.imagenUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.imagenUrl} alt="" className="w-full h-40 object-cover bg-background-secondary" />
              )}
              <div className="p-5 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icono className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
                    {ETIQUETAS_TIPO_DESTACADO[d.tipo] ?? d.tipo}
                  </span>
                  {d.cursoTitulo && <span className="text-xs text-muted-foreground">· {d.cursoTitulo}</span>}
                </div>
                <h3 className="font-semibold text-foreground">{d.titulo}</h3>
                <p className="text-sm text-muted-foreground">{d.descripcion}</p>
                {(d.fuente || esExterno) && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-2">
                    {esExterno && <ExternalLink className="w-3.5 h-3.5" />}
                    {d.fuente}
                  </span>
                )}
              </div>
            </a>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">Todavía no hay contenidos destacados.</p>
        )}
      </div>
    </main>
  );
}
