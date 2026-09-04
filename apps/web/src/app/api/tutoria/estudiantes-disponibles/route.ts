import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { ListarEstudiantesDisponiblesUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (ctx.rol !== "DOCENTE") {
    return NextResponse.json({ error: "Solo un docente puede ver esta lista." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const busqueda = searchParams.get("q") ?? undefined;

  const repo = new PrismaTutoringRepository(prisma);
  const useCase = new ListarEstudiantesDisponiblesUseCase(repo);
  const estudiantes = await useCase.execute(ctx.id, busqueda);

  return NextResponse.json(estudiantes);
}
