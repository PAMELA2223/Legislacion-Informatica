import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerCursoConLeccionesUseCase } from "@/modules/admin/application/admin.use-cases";
import { CourseForm } from "@/modules/admin/presentation/course-form";

// Datos siempre actuales de la base de datos (no pre-renderizar en el build).
export const dynamic = "force-dynamic";

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let curso;
  try {
    curso = await new ObtenerCursoConLeccionesUseCase(new PrismaAdminRepository(prisma)).execute(id);
  } catch {
    notFound();
  }
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">Módulo {curso.numero}</p>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar módulo</h1>
      <CourseForm curso={curso} />
    </div>
  );
}
