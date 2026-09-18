import type { FaqItem } from "../domain/faq.entity";
import type { IFaqRepository } from "../domain/faq-repository.interface";

export class ListarFaqPublicadasUseCase {
  constructor(private readonly repo: IFaqRepository) {}
  async execute() {
    return this.repo.listarPublicadas();
  }
}

/** Agrupa las preguntas por categoría, en el orden en que aparece cada
 * categoría por primera vez — usado por la vista pública para el acordeón. */
export function agruparPorCategoria(items: FaqItem[]): Map<string, FaqItem[]> {
  const grupos = new Map<string, FaqItem[]>();
  for (const item of items) {
    const lista = grupos.get(item.categoria) ?? [];
    lista.push(item);
    grupos.set(item.categoria, lista);
  }
  return grupos;
}
