import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerInfografiaDeModuloUseCase } from "@/modules/admin/application/admin.use-cases";
import { InfographicForm } from "@/modules/admin/presentation/infographic-form";

export const dynamic = "force-dynamic";

export default async function EditarInfografiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let infografia;
  try {
    infografia = await new ObtenerInfografiaDeModuloUseCase(new PrismaAdminRepository(prisma)).execute(id);
  } catch {
    notFound();
  }
  const modulos = await prisma.course.findMany({
    where: { eliminadoEn: null },
    orderBy: [{ orden: "asc" }, { numero: "asc" }],
    select: { id: true, numero: true, titulo: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar infografía</h1>
      <InfographicForm modulos={modulos} infografia={infografia} />
    </div>
  );
}
