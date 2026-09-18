import type { IVideoRepository } from "../domain/video-repository.interface";

export class ListarVideosPublicadosUseCase {
  constructor(private readonly repo: IVideoRepository) {}
  async execute() {
    return this.repo.listarPublicados();
  }
}
