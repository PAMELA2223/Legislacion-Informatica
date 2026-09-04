import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, CheckCircle2 } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaSelfAssessmentRepository } from "@/modules/self-assessment/infrastructure/prisma-self-assessment.repository";
import { ObtenerPerfilComparativoUseCase } from "@/modules/self-assessment/application/self-assessment.use-cases";
import { RadarProfileChart } from "@/modules/self-assessment/presentation/radar-profile-chart";
import { Button } from "@/components/ui/button";

export default async function AutoevaluacionPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaSelfAssessmentRepository(prisma);
  const { inicial, final } = await new ObtenerPerfilComparativoUseCase(repo).execute(user.id);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">
        Autoevaluación de competencias digitales
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Un diagnóstico inicial y uno final para medir tu evolución en 6 ejes de
        competencia digital y legal.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-surface p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium text-foreground">Diagnóstico inicial</p>
              <p className="text-xs text-muted-foreground">
                {inicial ? "Completado" : "Pendiente"}
              </p>
            </div>
          </div>
          {inicial ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <Link href="/autoevaluacion/diagnostico-inicial">
              <Button>Comenzar</Button>
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Diagnóstico final</p>
              <p className="text-xs text-muted-foreground">
                {final ? "Completado" : "Pendiente"}
              </p>
            </div>
          </div>
          {final ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <Link href="/autoevaluacion/diagnostico-final">
              <Button variant="outline">Comenzar</Button>
            </Link>
          )}
        </div>
      </div>

      {(inicial || final) && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-foreground mb-4">Tu perfil de competencias</h2>
          <RadarProfileChart inicial={inicial} final={final} />
        </div>
      )}
    </main>
  );
}
