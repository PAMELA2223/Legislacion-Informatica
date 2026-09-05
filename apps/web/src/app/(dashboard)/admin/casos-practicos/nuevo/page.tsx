import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { redirect } from "next/navigation";
import { CaseStudyForm } from "@/modules/admin/presentation/case-study-form";

export default async function NuevoCasoPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nuevo caso práctico</h1>
      <CaseStudyForm />
    </div>
  );
}
