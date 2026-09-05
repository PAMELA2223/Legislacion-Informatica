import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EvaluationForm } from "@/modules/admin/presentation/evaluation-form";

export default async function NuevaEvaluacionPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const cursos = await prisma.course.findMany({
    select: { id: true, titulo: true },
    orderBy: { orden: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Nueva evaluación</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Primero crea los datos básicos; en la siguiente pantalla podrás
        agregar las preguntas (Verdadero/Falso, opción múltiple, relacionar,
        completar o caso).
      </p>
      <EvaluationForm cursos={cursos} />
    </div>
  );
}
