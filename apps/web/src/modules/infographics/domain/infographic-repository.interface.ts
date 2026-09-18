import type { Infographic } from "./infographic.entity";

export interface IInfographicRepository {
  listarPublicadas(): Promise<Infographic[]>;
}
