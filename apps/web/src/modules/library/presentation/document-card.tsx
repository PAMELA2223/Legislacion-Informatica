"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Download } from "lucide-react";
import { ETIQUETAS_CATEGORIA, type CategoriaDocumento } from "../domain/library.entity";

interface DocumentCardProps {
  id: string;
  titulo: string;
  categoria: CategoriaDocumento;
  tags: string[];
  descargas: number;
  esFavoritoInicial: boolean;
}

export function DocumentCard({
  id,
  titulo,
  categoria,
  tags,
  descargas,
  esFavoritoInicial,
}: DocumentCardProps) {
  const [esFavorito, setEsFavorito] = useState(esFavoritoInicial);
  const [cargando, setCargando] = useState(false);

  async function toggleFavorito(e: React.MouseEvent) {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await fetch(`/api/biblioteca/${id}/favorito`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setEsFavorito(data.esFavorito);
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <Link
      href={`/biblioteca/${id}`}
      className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-2 hover:-translate-y-0.5 duration-200 hover:shadow-card-md transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
          {ETIQUETAS_CATEGORIA[categoria]}
        </span>
        <button
          onClick={toggleFavorito}
          disabled={cargando}
          aria-label="Marcar como favorito"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              esFavorito ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>
      <h3 className="font-semibold text-foreground">{titulo}</h3>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs text-muted-foreground bg-foreground/5 rounded-full px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
        <Download className="w-3.5 h-3.5" />
        {descargas} descargas
      </div>
    </Link>
  );
}
