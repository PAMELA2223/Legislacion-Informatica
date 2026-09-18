import type { PrismaClient } from "@prisma/client";
import type { IInternationalReferenceRepository } from "../domain/international-reference-repository.interface";
import type { InternationalReference } from "../domain/international-reference.entity";

export class PrismaInternationalReferenceRepository implements IInternationalReferenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarPublicadas(): Promise<InternationalReference[]> {
    return this.prisma.internationalReference.findMany({
      where: { publicado: true },
      orderBy: [{ categoria: "asc" }, { titulo: "asc" }],
    });
  }
}
