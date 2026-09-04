import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { ETIQUETAS_CATEGORIA_FORO, type ForumThread } from "../domain/forum.entity";

export function ThreadCard({ hilo }: { hilo: ForumThread }) {
  return (
    <Link
      href={`/foro/${hilo.id}`}
      className="rounded-2xl border border-border bg-surface p-5 flex items-center justify-between hover:border-primary transition-colors"
    >
      <div>
        <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
          {ETIQUETAS_CATEGORIA_FORO[hilo.categoria]}
        </span>
        <p className="font-medium text-foreground mt-2">{hilo.titulo}</p>
        <p className="text-xs text-muted-foreground mt-1">Por {hilo.autorNombre}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <MessageSquare className="w-4 h-4" />
        {hilo.totalPosts}
      </div>
    </Link>
  );
}
