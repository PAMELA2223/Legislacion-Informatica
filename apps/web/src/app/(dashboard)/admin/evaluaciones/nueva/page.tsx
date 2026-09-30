import { prisma } from "@/lib/prisma";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";
import { EvaluationForm } from "@/modules/admin/presentation/evaluation-form";

// Datos siempre actuales de la base de datos (no pre-renderizar en el build).
export const dynamic = "force-dynamic";

export default async function NuevaEvaluacionPage() {
  // Solo se ofrecen módulos que aún no tienen evaluación (una por módulo).
  const cursos = await prisma.course.findMany({
    where: { eliminadoEn: null, evaluations: { none: { tipo: TIPO_EVALUACION.MODULO } } },
    orderBy: { orden: "asc" },
    select: { id: true, titulo: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nueva evaluación de módulo</h1>
      <EvaluationForm cursos={cursos} />
    </div>
  );
}
