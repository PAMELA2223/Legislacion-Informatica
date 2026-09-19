import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerCursoConLeccionesUseCase } from "@/modules/admin/application/admin.use-cases";
import { LessonForm } from "@/modules/admin/presentation/lesson-form";

export default async function EditarLeccionPage({
  params,
}: {
  params: Promise<{ id: string; leccionId: string }>;
}) {
  const { id, leccionId } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const curso = await new ObtenerCursoConLeccionesUseCase(repo).execute(id);
  const leccion = curso.lecciones.find((l) => l.id === leccionId);
  if (!leccion) notFound();

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{curso.titulo}</p>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar lección</h1>
      <LessonForm courseId={curso.id} leccion={leccion} />
    </div>
  );
}
