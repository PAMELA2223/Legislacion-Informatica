import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { ObtenerTutorActivoUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";
import {
  ListarTareasUseCase,
  ListarObjetivosUseCase,
  ListarReunionesUseCase,
  ListarRecursosUseCase,
} from "@/modules/tutoring/application/tutoring-plan.use-cases";
import { PlanTabs } from "@/modules/tutoring/presentation/plan-tabs";
import { ETIQUETAS_ESTADO_TUTORIA } from "@/modules/tutoring/domain/tutoring.entity";
import { UserCheck } from "lucide-react";

export default async function MiTutoriaPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect("/login");

  const repo = new PrismaTutoringRepository(prisma);
  const tutoria = await new ObtenerTutorActivoUseCase(repo).execute(authUser.id);

  if (!tutoria) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">Mi tutoría</h1>
        <p className="text-sm text-muted-foreground">
          Todavía no tienes un docente tutor asignado. Cuando un docente
          solicite acompañarte, aparecerá aquí.
        </p>
      </main>
    );
  }

  const [tareas, objetivos, reuniones, recursos] = await Promise.all([
    new ListarTareasUseCase(repo).execute(tutoria.id),
    new ListarObjetivosUseCase(repo).execute(tutoria.id),
    new ListarReunionesUseCase(repo).execute(tutoria.id),
    new ListarRecursosUseCase(repo).execute(tutoria.id),
  ]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-6">Mi tutoría</h1>

      <div className="rounded-2xl border border-border bg-surface p-5 flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Mi tutor</p>
          <p className="font-medium text-foreground">{tutoria.docenteNombre}</p>
          <span className="text-xs font-medium text-success">
            {ETIQUETAS_ESTADO_TUTORIA[tutoria.estado]}
          </span>
        </div>
      </div>

      <h2 className="font-semibold text-foreground mb-4">Mi plan</h2>
      <PlanTabs
        assignmentId={tutoria.id}
        puedeEditar={false}
        puedeCompletarTareas={true}
        tareas={tareas}
        objetivos={objetivos}
        observaciones={[]}
        reuniones={reuniones}
        recursos={recursos}
      />
    </main>
  );
}
