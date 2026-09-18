import type { PrismaClient } from "@prisma/client";
import type { IVideoRepository } from "../domain/video-repository.interface";
import type { VideoResource } from "../domain/video.entity";

export class PrismaVideoRepository implements IVideoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarPublicados(): Promise<VideoResource[]> {
    return this.prisma.videoResource.findMany({
      where: { publicado: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
