"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EstudianteDisponible {
  id: string;
  nombre: string;
  email: string;
  tutorActual?: string | null;
  estadoTutoriaConEsteDocente?: string | null;
}

export function StudentSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [estudiantes, setEstudiantes] = useState<EstudianteDisponible[]>([]);
  const [cargando, setCargando] = useState(false);
  const [solicitando, setSolicitando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => buscar(query), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function buscar(q: string) {
    setCargando(true);
    try {
      const res = await fetch(`/api/tutoria/estudiantes-disponibles?q=${encodeURIComponent(q)}`);
      if (res.ok) setEstudiantes(await res.json());
    } finally {
      setCargando(false);
    }
  }

  async function solicitar(estudianteId: string) {
    setSolicitando(estudianteId);
    setError(null);
    try {
      const res = await fetch("/api/tutoria/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudianteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al solicitar la tutoría.");
      router.push("/docente/estudiantes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar la tutoría.");
    } finally {
      setSolicitando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="w-full rounded-xl border border-border-strong bg-surface pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-2">
        {estudiantes.map((e) => {
          const yaEsMio = e.estadoTutoriaConEsteDocente === "ACTIVA";
          const pendienteConmigo = e.estadoTutoriaConEsteDocente === "PENDIENTE";
          const tieneOtroTutor = Boolean(e.tutorActual) && !yaEsMio;

          return (
            <div
              key={e.id}
              className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{e.nombre}</p>
                <p className="text-xs text-muted-foreground">{e.email}</p>
                {tieneOtroTutor && (
                  <p className="text-xs text-accent mt-1">Tutor actual: {e.tutorActual}</p>
                )}
              </div>

              {yaEsMio ? (
                <span className="flex items-center gap-1 text-xs font-medium text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Ya es tu estudiante
                </span>
              ) : pendienteConmigo ? (
                <span className="flex items-center gap-1 text-xs font-medium text-accent">
                  <Clock className="w-4 h-4" />
                  Pendiente
                </span>
              ) : (
                <Button
                  variant={tieneOtroTutor ? "outline" : "primary"}
                  onClick={() => solicitar(e.id)}
                  isLoading={solicitando === e.id}
                  disabled={tieneOtroTutor}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Solicitar tutoría
                </Button>
              )}
            </div>
          );
        })}
        {!cargando && estudiantes.length === 0 && (
          <p className="text-sm text-muted-foreground">No se encontraron estudiantes.</p>
        )}
      </div>
    </div>
  );
}
