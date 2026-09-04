import { defineConfig } from "vitest/config";
import path from "path";

// Configuración de pruebas unitarias. Se limita a src/**, ejecutando en
// entorno Node (no jsdom) porque las pruebas cubren capas de dominio y
// aplicación (lógica pura, sin DOM). Los módulos de infraestructura
// (Supabase, Prisma) quedan fuera a propósito: se validan mediante pruebas
// de integración manuales / smoke tests documentadas en el manual técnico,
// ya que requieren credenciales reales de un proyecto Supabase.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/modules/**/domain/**", "src/modules/**/application/**"],
    },
  },
});
