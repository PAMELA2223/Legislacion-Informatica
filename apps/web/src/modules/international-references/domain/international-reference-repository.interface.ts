import type { InternationalReference } from "./international-reference.entity";

export interface IInternationalReferenceRepository {
  listarPublicadas(): Promise<InternationalReference[]>;
}
