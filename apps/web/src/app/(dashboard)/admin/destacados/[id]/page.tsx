import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrismaFeaturedRepository } from "@/modules/featured/infrastructure/prisma-featured.repository";
import { ObtenerDestacadoUseCase } from "@/modules/featured/application/featured.use-cases";
import { FeaturedForm } from "@/modules/admin/presentation/featured-form";

// Datos siempre actuales de la base de datos (no pre-renderizar en el build).
export const dynamic = "force-dynamic";

export default async function EditarDestacadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item;
  try {
    item = await new ObtenerDestacadoUseCase(new PrismaFeaturedRepository(prisma)).execute(id);
  } catch {
    notFound();
  }
  const cursos = await prisma.course.findMany({ orderBy: { orden: "asc" }, select: { id: true, titulo: true, slug: true } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar contenido destacado</h1>
      <FeaturedForm item={item} cursos={cursos} />
    </div>
  );
}
