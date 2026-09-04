import Link from "next/link";
import { UserPlus } from "lucide-react";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { ListarTutoriasDelDocenteUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";
import { ObtenerResumenAcademicoUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";
import { TutoringStudentCard } from "@/modules/tutoring/presentation/tutoring-student-card";
import { Button } from "@/components/ui/button";

export default async function MisEstudiantesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  // Más estricto que el layout padre: "Mis estudiantes" es exclusivo de DOCENTE.
  const user = await requireRole(["DOCENTE"]);

  const repo = new PrismaTutoringRepository(prisma);
  const tutorias = await new ListarTutoriasDelDocenteUseCase(repo).execute(user.id, "ACTIVA");

  const filtradas = q
    ? tutorias.filter((t) => t.estudianteNombre.toLowerCase().includes(q.toLowerCase()))
    : tutorias;

  const resumenUseCase = new ObtenerResumenAcademicoUseCase(repo);
  const conResumen = await Promise.all(
    filtradas.map(async (t) => ({
      tutoria: t,
      resumen: await resumenUseCase.execute(t.estudianteId),
    }))
  );

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Mis estudiantes</h1>
        <Link href="/docente/agregar-estudiante">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar estudiante
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {tutorias.length} estudiante(s) bajo tu tutoría activa.
      </p>

      <form className="mb-8 max-w-sm">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre..."
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {conResumen.map(({ tutoria, resumen }) => (
          <TutoringStudentCard
            key={tutoria.id}
            estudianteId={tutoria.estudianteId}
            nombre={tutoria.estudianteNombre}
            email={tutoria.estudianteEmail}
            resumen={resumen}
          />
        ))}
        {conResumen.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            {q ? "No se encontraron estudiantes con ese nombre." : "Todavía no tienes estudiantes tutorados."}
          </p>
        )}
      </div>
    </main>
  );
}
