import type { PrismaClient } from "@prisma/client";
import type { IFaqRepository } from "../domain/faq-repository.interface";
import type { FaqItem } from "../domain/faq.entity";

export class PrismaFaqRepository implements IFaqRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarPublicadas(): Promise<FaqItem[]> {
    return this.prisma.faqItem.findMany({
      where: { publicado: true },
      orderBy: [{ categoria: "asc" }, { orden: "asc" }],
    });
  }
}
