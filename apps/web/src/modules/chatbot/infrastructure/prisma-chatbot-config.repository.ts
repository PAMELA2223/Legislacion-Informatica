// Configuración del asistente y registro de consultas (estadísticas).
import type { PrismaClient } from "@prisma/client";
import { CONFIG_POR_DEFECTO, FUENTES_CHATBOT, type ConfigChatbot, type FuenteChatbot, type RegistroConsulta } from "../domain/chatbot-config";
import type { MetaConsulta } from "../application/chatbot.use-cases";

const ID = "global";

export class PrismaChatbotConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Configuración vigente. Si todavía no existe (o la migración no se aplicó),
   * se usa la configuración por defecto: el asistente nunca rompe una página.
   */
  async obtener(): Promise<ConfigChatbot> {
    try {
      const c = await this.prisma.chatbotConfig.findUnique({ where: { id: ID } });
      if (!c) return CONFIG_POR_DEFECTO;
      return {
        activo: c.activo,
        fuentes: FUENTES_CHATBOT.filter((f) => c.fuentes.includes(f)) as FuenteChatbot[],
      };
    } catch (error) {
      console.error("[chatbot] No se pudo leer la configuración; se usa la predeterminada.", error);
      return CONFIG_POR_DEFECTO;
    }
  }

  async guardar(config: ConfigChatbot): Promise<void> {
    await this.prisma.chatbotConfig.upsert({
      where: { id: ID },
      update: { activo: config.activo, fuentes: config.fuentes },
      create: { id: ID, activo: config.activo, fuentes: config.fuentes },
    });
  }

  /** Registra una consulta (sin texto). Nunca debe impedir que el estudiante reciba su respuesta. */
  async registrarConsulta(userId: string, meta: MetaConsulta): Promise<void> {
    try {
      await this.prisma.chatbotConsulta.create({
        data: {
          userId,
          modo: meta.modo,
          intencion: meta.intencion,
          tema: meta.tema,
          conInformacion: meta.conInformacion,
          contexto: meta.contexto,
        },
      });
    } catch (error) {
      console.error("[chatbot] No se pudo registrar la consulta para estadísticas.", error);
    }
  }

  async consultasDesde(desde: Date): Promise<RegistroConsulta[]> {
    try {
      return await this.prisma.chatbotConsulta.findMany({
        where: { fecha: { gte: desde }, user: { rol: "ESTUDIANTE" } },
        select: { userId: true, fecha: true, modo: true, intencion: true, tema: true, conInformacion: true },
      });
    } catch {
      return [];
    }
  }
}
