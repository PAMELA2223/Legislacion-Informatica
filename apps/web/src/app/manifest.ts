import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Plataforma de Legislación Informática",
    short_name: "Legislación Informática",
    description:
      "Conocimiento y normas para un mundo digital seguro: módulos, biblioteca jurídica, evaluaciones y casos prácticos.",
    start_url: "/",
    display: "standalone",
    background_color: "#070B2A",
    theme_color: "#070B2A",
    lang: "es",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
