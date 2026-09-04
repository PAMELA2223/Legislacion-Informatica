import type { PrismaClient } from "@prisma/client";
import type { IGlossaryRepository } from "../domain/glossary-repository.interface";
import type { GlossaryTerm } from "../domain/glossary.entity";

export class PrismaGlossaryRepository implements IGlossaryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarTerminos(busqueda?: string): Promise<GlossaryTerm[]> {
    const terminos = await this.prisma.glossaryTerm.findMany({
      where: busqueda
        ? { termino: { contains: busqueda, mode: "insensitive" } }
        : undefined,
      orderBy: { orden: "asc" },
    });
    return terminos;
  }
}
