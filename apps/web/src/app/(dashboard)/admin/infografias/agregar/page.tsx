import { prisma } from "@/lib/prisma";
import { InfographicForm } from "@/modules/admin/presentation/infographic-form";

export const dynamic = "force-dynamic";

export default async function AgregarInfografiaPage({ searchParams }: { searchParams: Promise<{ modulo?: string }> }) {
  const { modulo } = await searchParams;
  const modulos = await prisma.course.findMany({
    where: { eliminadoEn: null },
    orderBy: [{ orden: "asc" }, { numero: "asc" }],
    select: { id: true, numero: true, titulo: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Agregar infografía a un módulo</h1>
      <InfographicForm modulos={modulos} moduloInicial={modulo} />
    </div>
  );
}
