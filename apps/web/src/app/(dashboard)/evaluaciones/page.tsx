import { redirect } from "next/navigation";

// La categoría independiente "Evaluaciones" se eliminó: cada evaluación vive
// ahora dentro de su módulo. Se conserva la ruta para no romper enlaces o
// marcadores antiguos, redirigiendo al itinerario de módulos.
export default function EvaluacionesPage() {
  redirect("/modulos");
}
