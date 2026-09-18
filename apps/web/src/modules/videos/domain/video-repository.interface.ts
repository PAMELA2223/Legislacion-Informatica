import type { VideoResource } from "./video.entity";

export interface IVideoRepository {
  listarPublicados(): Promise<VideoResource[]>;
}
