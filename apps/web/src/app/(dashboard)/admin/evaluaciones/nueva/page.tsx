import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { EvaluationForm } from "@/modules/admin/presentation/evaluation-form";

export default async function NuevaEvaluacionPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nueva evaluación</h1>
      <EvaluationForm />
    </div>
  );
}
