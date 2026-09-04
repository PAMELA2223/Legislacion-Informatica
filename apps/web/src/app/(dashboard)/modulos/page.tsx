import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaCourseRepository } from "@/modules/courses/infrastructure/prisma-course.repository";
import { ObtenerProgresoGeneralUseCase } from "@/modules/courses/application/course.use-cases";
import { ModuleCard } from "@/modules/courses/presentation/module-card";

export default async function ModulosPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaCourseRepository(prisma);
  const useCase = new ObtenerProgresoGeneralUseCase(repo);
  const modulos = await useCase.execute(user.id);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Módulos educativos</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Itinerario progresivo de 8 módulos sobre legislación informática ecuatoriana.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modulos.map(({ curso, progreso, completado, desbloqueado }) => (
          <ModuleCard
            key={curso.id}
            slug={curso.slug}
            numero={curso.numero}
            titulo={curso.titulo}
            descripcion={curso.descripcion}
            progreso={progreso}
            completado={completado}
            desbloqueado={desbloqueado}
          />
        ))}
      </div>
    </main>
  );
}
