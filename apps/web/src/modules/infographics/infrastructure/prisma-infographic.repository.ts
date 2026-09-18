import type { PrismaClient } from "@prisma/client";
import type { IInfographicRepository } from "../domain/infographic-repository.interface";
import type { Infographic } from "../domain/infographic.entity";

export class PrismaInfographicRepository implements IInfographicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarPublicadas(): Promise<Infographic[]> {
    return this.prisma.infographic.findMany({
      where: { publicado: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
