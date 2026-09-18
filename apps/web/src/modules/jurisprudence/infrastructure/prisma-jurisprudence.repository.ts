import type { PrismaClient } from "@prisma/client";
import type { IJurisprudenceRepository } from "../domain/jurisprudence-repository.interface";
import type { JurisprudenceCase } from "../domain/jurisprudence.entity";

export class PrismaJurisprudenceRepository implements IJurisprudenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarPublicados(): Promise<JurisprudenceCase[]> {
    return this.prisma.jurisprudenceCase.findMany({
      where: { publicado: true },
      orderBy: { anio: "desc" },
    });
  }
}
