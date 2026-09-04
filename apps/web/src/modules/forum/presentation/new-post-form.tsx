"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NewPostForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(`/api/foro/hilos/${threadId}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al comentar.");
      setContenido("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comentar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder="Escribe un comentario..."
        rows={3}
        className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-end">
        Comentar
      </Button>
    </form>
  );
}
