import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Solo se listan rutas públicas (no requieren sesión). El área autenticada
// se excluye a propósito: no aporta SEO y está bloqueada por robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const rutasPublicas: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/login", priority: 0.5 },
    { path: "/registro", priority: 0.5 },
    { path: "/recuperar-password", priority: 0.3 },
  ];

  return rutasPublicas.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
  }));
}
