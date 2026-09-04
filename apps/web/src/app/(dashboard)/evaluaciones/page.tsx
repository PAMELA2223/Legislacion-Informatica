import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaEvaluationRepository } from "@/modules/evaluations/infrastructure/prisma-evaluation.repository";
import {
  ListarEvaluacionesUseCase,
  ObtenerHistorialUseCase,
} from "@/modules/evaluations/application/evaluation.use-cases";

export default async function EvaluacionesPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaEvaluationRepository(prisma);
  const evaluaciones = await new ListarEvaluacionesUseCase(repo).execute();
  const historial = await new ObtenerHistorialUseCase(repo).execute(user.id);

  const mejorIntentoPorEvaluacion = new Map<string, (typeof historial)[number]>();
  for (const intento of historial) {
    const actual = mejorIntentoPorEvaluacion.get(intento.evaluationId);
    if (!actual || intento.puntaje > actual.puntaje) {
      mejorIntentoPorEvaluacion.set(intento.evaluationId, intento);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Evaluaciones</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Pon a prueba lo aprendido en cada módulo. Necesitas 70% para aprobar.
      </p>

      <div className="flex flex-col gap-3">
        {evaluaciones.map((ev) => {
          const mejorIntento = mejorIntentoPorEvaluacion.get(ev.id);
          return (
            <Link
              key={ev.id}
              href={`/evaluaciones/${ev.id}`}
              className="rounded-2xl border border-border bg-surface p-5 flex items-center justify-between hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{ev.titulo}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{ev.preguntas.length} preguntas</span>
                    {ev.tiempoLimite > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ev.tiempoLimite} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {mejorIntento && (
                <span
                  className={`flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 ${
                    mejorIntento.aprobado
                      ? "bg-success/10 text-success"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {mejorIntento.aprobado && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {mejorIntento.puntaje}%
                </span>
              )}
            </Link>
          );
        })}
        {evaluaciones.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay evaluaciones disponibles.
          </p>
        )}
      </div>
    </main>
  );
}
