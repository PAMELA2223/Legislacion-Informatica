import { prisma } from "@/lib/prisma";
import { FeaturedForm } from "@/modules/admin/presentation/featured-form";

// Datos siempre actuales de la base de datos (no pre-renderizar en el build).
export const dynamic = "force-dynamic";

export default async function NuevoDestacadoPage() {
  const cursos = await prisma.course.findMany({ orderBy: { orden: "asc" }, select: { id: true, titulo: true, slug: true } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nuevo contenido destacado</h1>
      <FeaturedForm cursos={cursos} />
    </div>
  );
}
