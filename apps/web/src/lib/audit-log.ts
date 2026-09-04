import type { PrismaClient } from "@prisma/client";

export async function registrarLog(
  prisma: PrismaClient,
  userId: string,
  accion: string,
  entidad: string,
  detalle?: string
) {
  await prisma.auditLog.create({ data: { userId, accion, entidad, detalle } });
}
