# Manual Técnico

Plataforma de Legislación Informática — Fase 10: Optimización y Despliegue

## 1. Visión general de la arquitectura

Aplicación **Next.js 14 (App Router)** monolítica, con arquitectura modular
por capas dentro de cada dominio (`src/modules/<dominio>/`):

```
<dominio>/
├── domain/           # Entidades, tipos y reglas de negocio puras
│                      #  (sin dependencias de Next.js, Supabase ni Prisma)
├── application/       # Casos de uso: orquestan domain + infrastructure
├── infrastructure/    # Implementaciones concretas (Prisma, Supabase)
└── presentation/       # Componentes React (client/server components)
```

`application/` depende de **interfaces** definidas en `domain/`
(ej. `IAuthRepository`), nunca de `infrastructure/` directamente. Esto
permite probar los casos de uso con un repositorio falso (ver
`src/modules/auth/application/auth.use-cases.test.ts`) sin tocar red ni
base de datos.

### Autenticación y autorización

- **Autenticación**: Supabase Auth (`@supabase/ssr`), tanto en cliente
  (`src/lib/supabase-client.ts`) como en servidor (`supabase-server.ts`).
- **Middleware** (`src/middleware.ts`): corre en el Edge Runtime y solo
  verifica que exista una sesión válida para las rutas protegidas. No
  puede consultar Prisma (no soporta drivers de PostgreSQL en el edge).
- **Autorización por rol (RBAC)**: la fuente de verdad del rol
  (`ADMINISTRADOR | DOCENTE | ESTUDIANTE | INVITADO`) es siempre
  **Prisma/PostgreSQL**, consultada en cada página/layout de servidor vía
  `src/lib/authorization.ts` (`requireAutenticado`, `requireRole`, etc.),
  nunca el JWT de Supabase ni nada manipulable desde el cliente.
- Un **INVITADO** con sesión iniciada no tiene acceso al área interna,
  solo a las páginas públicas.

## 2. Optimizaciones de la Fase 10

### 2.1 Código

- `npm run typecheck` (`tsc --noEmit`) agregado como paso independiente de
  verificación de tipos, separado de `next build`.
- Páginas de error de segmento (`src/app/error.tsx`), error raíz
  (`src/app/global-error.tsx`), 404 (`src/app/not-found.tsx`) y estado de
  carga (`src/app/loading.tsx`) — antes inexistentes, ahora con estilo
  consistente con el resto de la plataforma.

### 2.2 Seguridad

Cabeceras HTTP aplicadas globalmente en `next.config.js` (`headers()`):

| Cabecera | Valor | Propósito |
|---|---|---|
| `X-Frame-Options` | `DENY` | Evita clickjacking (no se puede embeber en un `<iframe>` ajeno) |
| `X-Content-Type-Options` | `nosniff` | Evita que el navegador reinterprete el tipo MIME de un recurso |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita qué URL de origen se filtra a otros dominios |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Desactiva APIs del navegador que la app no usa |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Fuerza HTTPS en el navegador (Vercel ya sirve todo por HTTPS) |

Además:

- `poweredByHeader: false` — no se expone la versión de Next.js.
- El rol autorizado se sigue validando **solo en servidor** contra Prisma
  (ver sección 1); ningún cambio de esta fase alteró ese modelo.
- Las credenciales de Supabase/Postgres viven exclusivamente en variables
  de entorno (`.env.local` en desarrollo, Environment Variables en
  Vercel), nunca en el código ni en el repositorio (`.gitignore` ya
  excluía `.env` y `.env.local`; se mantiene sin cambios).
- `SUPABASE_SERVICE_ROLE_KEY` se usa **solo en el servidor** (rutas
  `api/admin/*`), nunca se expone al cliente (no lleva prefijo
  `NEXT_PUBLIC_`).

### 2.3 SEO

- `src/app/layout.tsx`: metadata enriquecida (`title` con plantilla,
  `description`, `keywords`, Open Graph, Twitter Card, `metadataBase`
  tomado de `NEXT_PUBLIC_SITE_URL`).
- `src/app/robots.ts`: genera `/robots.txt` dinámicamente. Bloquea el
  rastreo de toda el área autenticada (`/dashboard`, `/admin`, `/api`,
  etc.) y de la API; permite el resto.
- `src/app/sitemap.ts`: genera `/sitemap.xml` con las rutas públicas
  (landing, login, registro, recuperar contraseña).
- `src/app/manifest.ts`: genera `/manifest.webmanifest` (nombre, colores,
  íconos) para instalación como PWA y mejor presentación en móviles.

> Assets pendientes (favicon e íconos) — ver
> `apps/web/public/images/LEEME.md`.

### 2.4 Accesibilidad

- Enlace "Saltar al contenido principal" (`src/app/layout.tsx`), visible
  solo al recibir foco por teclado, apuntando a `id="contenido-principal"`
  agregado en los layouts de landing y dashboard.
- Estilo `:focus-visible` global y consistente (`globals.css`), reforzando
  el indicador de foco en toda la aplicación (WCAG 2.4.7).
- `eslint-config-next` ya incluye las reglas de `eslint-plugin-jsx-a11y`
  (`next/core-web-vitals`), que se siguen verificando en cada `npm run
  lint` / CI.
- Página de login/registro (Fases anteriores): labels reales asociados a
  cada input, `aria-label` en los toggles de contraseña, alertas de error
  con `role="alert"`, `prefers-reduced-motion` respetado en animaciones.

### 2.5 Rendimiento

- `next/font/google` con `display: "swap"` (evita texto invisible
  mientras carga la tipografía → mejora CLS/LCP).
- `next.config.js`: `images.formats: ["image/avif", "image/webp"]` — Next
  sirve automáticamente el formato más liviano que soporte el navegador
  cuando se usa `next/image`.
- `compress: true` (compresión gzip/brotli de las respuestas).
- Ilustraciones construidas en SVG inline (no imágenes rasterizadas
  pesadas) — ver `login-illustration.tsx` y `tech-legal-graphic.tsx`.

### 2.6 Responsive

Ya cubierto en fases anteriores (sidebar de escritorio + drawer móvil,
grillas que colapsan a una columna, panel visual de login/registro oculto
bajo `lg`). Esta fase no modificó el comportamiento responsive existente,
solo verificó que las nuevas páginas (error, 404, loading) también lo
respeten.

### 2.7 Pruebas

- **Vitest** (`vitest.config.ts`) configurado para pruebas unitarias de
  `domain/` y `application/` — capas puras, sin red ni base de datos.
- Pruebas incluidas como ejemplo/base para ampliar:
  - `src/modules/auth/domain/user.entity.test.ts` — validación de
    contraseña y reglas de autorización por rol.
  - `src/modules/auth/application/auth.use-cases.test.ts` — `RegisterUseCase`
    con un repositorio falso (test double), sin tocar Supabase.
  - `src/modules/gamification/domain/gamification.entity.test.ts` —
    cálculo de retos y criterios de insignias.
- Scripts: `npm run test`, `npm run test:watch`, `npm run test:coverage`.
- **Fuera de alcance de las pruebas automatizadas** (requieren
  credenciales reales de un proyecto Supabase): flujos de
  `infrastructure/` (Supabase, Prisma) y Route Handlers de `src/app/api`.
  Para estos casos existen los scripts de verificación manual ya
  incluidos en el proyecto (`DIAGNOSTICAR.bat`, `VERIFICAR-TUTORIA.bat`).
- CI ejecuta lint + typecheck + test + build en cada push/PR (ver 2.9).

### 2.8 Documentación

- Este manual técnico y el [manual de usuario](./manual-usuario.md).
- `README.md` en la raíz del repositorio (quickstart, scripts, estructura).
- Bitácora de decisiones por fase ya existente en `docs/fase*.md`, sin
  modificar.

### 2.9 CI/CD e infraestructura de despliegue

- `.github/workflows/ci.yml`: en cada push/PR a `main` ejecuta, contra
  `apps/web`: `npm ci` → `lint` → `typecheck` → `test` → `prisma generate`
  → `build` (con variables de entorno ficticias, solo para que el build
  compile; no se conecta a servicios reales en CI).
- `apps/web/vercel.json`: fija explícitamente el framework (`nextjs`) y el
  comando de build (`prisma generate && next build`), para que Prisma
  siempre regenere su cliente en cada despliegue en Vercel.

## 3. Variables de entorno

Ver `apps/web/.env.example` para la lista completa y comentada. Resumen:

| Variable | Dónde se usa | Sensible |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | No (clave pública, protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor (`api/admin/*`) | **Sí — nunca exponer al cliente** |
| `DATABASE_URL` | Prisma (runtime, pooler transaccional) | **Sí** |
| `DIRECT_URL` | Prisma (migraciones, pooler de sesión) | **Sí** |
| `NEXT_PUBLIC_SITE_URL` | Enlaces de recuperación de contraseña, SEO (`metadataBase`, sitemap, robots) | No |

## 4. Despliegue en Vercel

### Opción A — Guiado (recomendado, con los `.bat`)

1. `INSTALAR.bat` (si no lo hiciste ya) → completa `apps\web\.env.local`.
2. `VERIFICAR-CALIDAD.bat` → confirma que lint, tipos, pruebas y build
   pasan localmente antes de desplegar.
3. `PUBLICAR-GITHUB.bat` → crea el repositorio en GitHub y sube el código.
4. `DESPLEGAR-VERCEL.bat` → instala la Vercel CLI si falta, inicia sesión
   y despliega a producción.
5. Entra a [vercel.com](https://vercel.com) → tu proyecto → **Settings →
   Environment Variables** y agrega las mismas variables de
   `apps/web/.env.local` (ver tabla de la sección 3). Vuelve a desplegar
   (`Deployments → ⋯ → Redeploy`) después de agregarlas.

### Opción B — Manual, desde el panel de Vercel

1. Sube el proyecto a GitHub (puedes usar `PUBLICAR-GITHUB.bat` o hacerlo
   manualmente).
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio.
3. **Root Directory**: `apps/web` (obligatorio — el `package.json` de
   Next.js vive ahí, no en la raíz del repo).
4. Framework detectado: **Next.js** (automático).
5. Agrega las variables de entorno de la sección 3 en el formulario de
   configuración inicial (o después, en Settings → Environment
   Variables).
6. **Deploy**.
7. Una vez desplegado, copia la URL de producción (ej.
   `https://tu-proyecto.vercel.app`) y actualiza `NEXT_PUBLIC_SITE_URL`
   con ese valor en Environment Variables → vuelve a desplegar.
8. (Opcional) Configura un dominio propio en **Settings → Domains**.

### Migraciones de base de datos en producción

Vercel **no** ejecuta `prisma migrate dev` automáticamente (ese comando es
solo para desarrollo local, ya que puede pedir confirmación interactiva).
Para aplicar el esquema a la base de datos de producción, ejecuta **una
vez**, desde tu máquina, apuntando a las credenciales de producción:

```bash
cd apps/web
npx prisma migrate deploy
npm run prisma:seed   # opcional: carga el contenido inicial
```

## 5. Repositorio GitHub

- `.gitignore` ya excluye `node_modules/`, `.next/`, `.env`, `.env.local`
  y archivos de log — verificado, sin cambios necesarios.
- Flujo recomendado: rama `main` protegida, cambios vía Pull Request; el
  workflow de CI (`.github/workflows/ci.yml`) corre automáticamente en
  cada PR.
- Ver `PUBLICAR-GITHUB.bat` para el paso a paso guiado desde Windows.

## 6. Checklist de salida a producción

- [ ] `VERIFICAR-CALIDAD.bat` (o `npm run lint && npm run typecheck &&
      npm run test && npm run build`) sin errores.
- [ ] Variables de entorno de producción configuradas en Vercel (sección 3).
- [ ] `NEXT_PUBLIC_SITE_URL` apunta al dominio real de producción.
- [ ] `npx prisma migrate deploy` ejecutado contra la base de datos de
      producción.
- [ ] Favicon e íconos colocados en `apps/web/public/` (ver
      `public/images/LEEME.md`).
- [ ] Al menos un usuario `ADMINISTRADOR` creado (`scripts/hacer-admin.ts`)
      para poder gestionar contenido desde `/admin`.
