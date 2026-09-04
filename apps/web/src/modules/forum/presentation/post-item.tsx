"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import type { ForumPost } from "../domain/forum.entity";

export function PostItem({ post }: { post: ForumPost }) {
  const router = useRouter();
  const [reaccionado, setReaccionado] = useState(post.yaReacciono);
  const [total, setTotal] = useState(post.totalReacciones);

  async function toggleReaccion() {
    const res = await fetch(`/api/foro/posts/${post.id}/reaccion`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setReaccionado(data.reacciono);
      setTotal((t) => (data.reacciono ? t + 1 : t - 1));
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">{post.autorNombre}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("es-EC")}
        </span>
      </div>
      <p className="text-sm text-foreground whitespace-pre-line">{post.contenido}</p>
      <button
        onClick={toggleReaccion}
        className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-primary"
      >
        <Heart className={`w-4 h-4 ${reaccionado ? "fill-red-500 text-red-500" : ""}`} />
        {total}
      </button>
    </div>
  );
}
