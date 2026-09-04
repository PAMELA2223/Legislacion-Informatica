import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { News } from "../domain/news.entity";

export function NewsCard({ noticia }: { noticia: News }) {
  return (
    <Link
      href={`/noticias/${noticia.id}`}
      className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-2 hover:border-primary transition-colors"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Newspaper className="w-3.5 h-3.5" />
        {noticia.fuente} ·{" "}
        {new Date(noticia.fechaPublicacion).toLocaleDateString("es-EC", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
      <h3 className="font-semibold text-foreground">{noticia.titulo}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{noticia.resumen}</p>
    </Link>
  );
}
