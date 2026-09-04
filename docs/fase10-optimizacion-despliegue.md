# Fase 10 — Optimización y Despliegue

## Objetivo

Cerrar el ciclo de desarrollo del trabajo de titulación: optimizar código,
seguridad, SEO, accesibilidad, rendimiento y responsive; agregar pruebas
automatizadas y documentación; y dejar el proyecto listo para
desplegarse en Vercel con su repositorio en GitHub.

## Cambios por área

### Código
- `tsc --noEmit` como script independiente (`npm run typecheck`),
  separado del build.
- Páginas de error de segmento, error raíz, 404 y loading (antes
  inexistentes) — `src/app/{error,global-error,not-found,loading}.tsx`.

### Seguridad
- Cabeceras HTTP de seguridad globales en `next.config.js`
  (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Strict-Transport-Security`).
- `poweredByHeader: false`.
- Confirmado (sin cambios necesarios): `.gitignore` ya excluye
  `.env`/`.env.local`; el rol de autorización sigue validándose solo en
  servidor contra Prisma; `SUPABASE_SERVICE_ROLE_KEY` solo se usa en
  rutas de servidor.

### SEO
- Metadata enriquecida en `layout.tsx` (Open Graph, Twitter Card,
  `metadataBase`, `title` con plantilla).
- `robots.ts` y `sitemap.ts` (rutas nativas de metadata del App Router).
- `manifest.ts` para instalación como PWA / mejor presentación móvil.

### Accesibilidad
- Enlace "Saltar al contenido principal" + `id="contenido-principal"` en
  los layouts navegables.
- `:focus-visible` global reforzado en `globals.css`.
- Reglas `jsx-a11y` ya activas vía `eslint-config-next`, verificadas en
  CI.

### Rendimiento
- Fuente con `display: "swap"`.
- `images.formats: ["image/avif", "image/webp"]` y `compress: true` en
  `next.config.js`.

### Responsive
- Sin cambios de comportamiento; se verificó que las páginas nuevas de
  esta fase (error, 404, loading) también son responsive.

### Pruebas
- Vitest configurado (`vitest.config.ts`) sobre `domain/` y
  `application/`.
- 16 pruebas iniciales: reglas de usuario/autorización
  (`user.entity.test.ts`), `RegisterUseCase` con repositorio falso
  (`auth.use-cases.test.ts`), reglas de gamificación
  (`gamification.entity.test.ts`).
- Scripts: `test`, `test:watch`, `test:coverage`.

### Documentación
- `README.md` (raíz del repo), `docs/manual-tecnico.md`,
  `docs/manual-usuario.md`, este mismo archivo.

### CI/CD y despliegue
- `.github/workflows/ci.yml`: lint → typecheck → test → prisma generate
  → build, en cada push/PR a `main`.
- `apps/web/vercel.json`: framework `nextjs`, `buildCommand` que asegura
  `prisma generate` antes de `next build`.
- Scripts `.bat` nuevos (mismo estilo que los ya existentes en el
  proyecto): `VERIFICAR-CALIDAD.bat`, `PUBLICAR-GITHUB.bat`,
  `DESPLEGAR-VERCEL.bat`.

## Verificación realizada en esta fase

- `npm run lint` — sin errores.
- `npx tsc --noEmit` — sin errores en el código de la aplicación (los
  únicos errores preexistentes detectados están en `scripts/*.ts`, fuera
  del build de Next.js, y dependen de que `prisma generate` se haya
  ejecutado con una base de datos real).
- `npx vitest run` — 16/16 pruebas pasando.
- `next build` — compilación de Next.js verificada exitosa
  (`✓ Compiled successfully`) en un entorno de sandbox sin acceso a
  Google Fonts ni al binario de motor de Prisma; se recomienda repetir
  `npm run build` (o `VERIFICAR-CALIDAD.bat`) una vez en un entorno con
  acceso normal a internet antes de desplegar, como último checkpoint.

## Pendiente de acción manual (no automatizable desde este entorno)

1. Crear el repositorio en GitHub y publicar el código
   (`PUBLICAR-GITHUB.bat`, o manualmente).
2. Crear el proyecto en Vercel e ingresar las variables de entorno de
   producción (`DESPLEGAR-VERCEL.bat`, o manualmente — ver manual
   técnico, sección 4).
3. Ejecutar `npx prisma migrate deploy` contra la base de datos de
   producción.
4. Colocar favicon e íconos en `apps/web/public/` (ver
   `apps/web/public/images/LEEME.md`).
