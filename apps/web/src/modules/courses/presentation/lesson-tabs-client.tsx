"use client";

import { useRouter } from "next/navigation";
import { LessonTabs } from "./lesson-tabs";

interface Leccion {
  id: string;
  tipo: string;
  titulo: string;
  urlRecurso?: string | null;
  contenido?: string | null;
  completado?: boolean;
}

export function LessonTabsClient({ lecciones }: { lecciones: Leccion[] }) {
  const router = useRouter();

  async function handleCompletar(lessonId: string) {
    const res = await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "No se pudo actualizar el progreso.");
      return;
    }
    router.refresh();
  }

  return <LessonTabs lecciones={lecciones} onCompletar={handleCompletar} />;
}
