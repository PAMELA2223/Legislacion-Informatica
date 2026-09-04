/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // No anunciar la versión de Next.js en las respuestas (superficie de
  // ataque / fingerprinting menor).
  poweredByHeader: false,

  // Compresión gzip/brotli de las respuestas del servidor Next.js.
  // (Vercel además aplica su propia compresión a nivel de CDN/edge).
  compress: true,

  images: {
    // Formatos modernos: el navegador recibe AVIF/WebP cuando los soporta,
    // reduciendo peso de imagen sin cambiar el markup (next/image).
    formats: ["image/avif", "image/webp"],
  },

  eslint: {
    // El lint ya se ejecuta como paso independiente en CI (ver
    // .github/workflows/ci.yml); mantenerlo también dentro de `next build`
    // evita que un error de lint pase desapercibido en un despliegue manual.
    ignoreDuringBuilds: false,
  },

  async headers() {
    // Cabeceras de seguridad HTTP aplicadas a TODAS las rutas.
    // Referencia: https://owasp.org/www-project-secure-headers/
    const securityHeaders = [
      // Evita que la app se cargue dentro de un <iframe> ajeno (clickjacking).
      { key: "X-Frame-Options", value: "DENY" },
      // Evita que el navegador intente adivinar el tipo MIME de un recurso.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Limita cuánta información de referer se envía a otros orígenes.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Restringe APIs sensibles del navegador que la app no usa.
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      // Fuerza HTTPS en el navegador durante 2 años, incluidos subdominios.
      // Vercel sirve siempre sobre HTTPS, por lo que esto es seguro en
      // producción; en `next dev` (HTTP) el navegador simplemente lo ignora.
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
