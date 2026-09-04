import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Rutas autenticadas / privadas: no deben indexarse en buscadores.
// Debe reflejar el área protegida por el middleware (ver src/middleware.ts).
const RUTAS_PRIVADAS = [
  "/dashboard",
  "/perfil",
  "/admin",
  "/docente",
  "/modulos",
  "/biblioteca",
  "/buscar",
  "/evaluaciones",
  "/casos-practicos",
  "/autoevaluacion",
  "/ranking",
  "/retos",
  "/foro",
  "/glosario",
  "/noticias",
  "/mi-tutoria",
  "/api",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: RUTAS_PRIVADAS,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
