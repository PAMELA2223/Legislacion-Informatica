"use client";

import { useState } from "react";
import { Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocumentActions({
  documentId,
  archivoUrl,
  esFavoritoInicial,
  descargasIniciales,
}: {
  documentId: string;
  archivoUrl?: string | null;
  esFavoritoInicial: boolean;
  descargasIniciales: number;
}) {
  const [esFavorito, setEsFavorito] = useState(esFavoritoInicial);
  const [descargas, setDescargas] = useState(descargasIniciales);
  const [cargando, setCargando] = useState(false);

  async function toggleFavorito() {
    setCargando(true);
    try {
      const res = await fetch(`/api/biblioteca/${documentId}/favorito`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setEsFavorito(data.esFavorito);
      }
    } finally {
      setCargando(false);
    }
  }

  async function descargar() {
    const res = await fetch(`/api/biblioteca/${documentId}/descargar`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setDescargas(data.descargas);
    }
    if (archivoUrl) window.open(archivoUrl, "_blank");
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={toggleFavorito} isLoading={cargando}>
        <Heart
          className={`w-4 h-4 mr-2 ${esFavorito ? "fill-red-500 text-red-500" : ""}`}
        />
        {esFavorito ? "En favoritos" : "Agregar a favoritos"}
      </Button>
      <Button onClick={descargar}>
        <Download className="w-4 h-4 mr-2" />
        Descargar ({descargas})
      </Button>
    </div>
  );
}
