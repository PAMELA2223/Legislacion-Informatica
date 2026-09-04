// Utilidad compartida de gamificación básica. El sistema completo (insignias,
// retos, ranking con foro, etc.) se construye en la Fase 8; aquí solo se
// otorga el XP necesario para que el Dashboard (Fase 7) muestre datos reales.

import type { PrismaClient } from "@prisma/client";

/** Fórmula simple de nivel: cada 100 XP sube un nivel */
export function calcularNivel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export async function otorgarXP(prisma: PrismaClient, userId: string, cantidad: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: cantidad } },
  });
  const nivel = calcularNivel(user.xp);
  if (nivel !== user.nivel) {
    await prisma.user.update({ where: { id: userId }, data: { nivel } });
  }
}
