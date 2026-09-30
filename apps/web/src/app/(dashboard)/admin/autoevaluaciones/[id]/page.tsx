import { EvaluationAdminDetail } from "@/modules/admin/presentation/evaluation-admin-detail";

export const dynamic = "force-dynamic";

export default async function DetalleAutoevaluacionAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EvaluationAdminDetail id={id} seccion="autoevaluaciones" />;
}
