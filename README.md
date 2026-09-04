# Plataforma de Legislación Informática

Plataforma educativa web sobre legislación informática del Ecuador:
módulos formativos, biblioteca jurídica, evaluaciones, casos prácticos,
autoevaluación de competencias, tutoría docente-estudiante y
gamificación.

> Documentación extendida en [`/docs`](./docs):
> - [`docs/manual-tecnico.md`](./docs/manual-tecnico.md) — arquitectura, stack, despliegue.
> - [`docs/manual-usuario.md`](./docs/manual-usuario.md) — guía funcional por rol.
> - `docs/fase*.md` — bitácora de decisiones de cada fase del proyecto.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| UI | React 18, Tailwind CSS, lucide-react |
| Autenticación | Supabase Auth |
| Base de datos | PostgreSQL (Supabase) + Prisma ORM |
| Pruebas | Vitest |
| CI | GitHub Actions |
| Despliegue | Vercel |

## Estructura del repositorio

```
plataforma/
├── apps/
│   └── web/                  # Aplicación Next.js (todo el código vive aquí)
│       ├── src/
│       │   ├── app/          # Rutas (App Router): (public), (auth), (dashboard), api
│       │   ├── modules/      # Arquitectura modular por dominio:
│       │   │                 #   domain/ · application/ · infrastructure/ · presentation/
│       │   ├── components/   # Componentes UI compartidos
│       │   └── lib/          # Utilidades transversales (Prisma, Supabase, auth, etc.)
│       ├── prisma/           # Esquema y semillas de base de datos
│       └── vercel.json
├── docs/                     # Manuales y bitácora de fases
└── .github/workflows/ci.yml  # Integración continua
```

## Requisitos

- Node.js 20+
- Una cuenta de [Supabase](https://supabase.com) (plan gratuito es suficiente)

## Puesta en marcha local

```bash
cd apps/web
npm install
cp .env.example .env.local   # completar con tus credenciales de Supabase
npx prisma generate
npx prisma migrate dev
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Scripts disponibles (dentro de `apps/web`)

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (tras `build`) |
| `npm run lint` | ESLint (incluye reglas de accesibilidad `jsx-a11y`) |
| `npm run typecheck` | Verificación de tipos con `tsc --noEmit` |
| `npm run test` | Pruebas unitarias (Vitest) |
| `npm run test:watch` | Pruebas en modo watch |
| `npm run test:coverage` | Pruebas con reporte de cobertura |
| `npm run prisma:generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | Aplica migraciones en desarrollo |
| `npm run prisma:seed` | Carga datos de ejemplo |

## Despliegue

Ver la sección "Despliegue" del [manual técnico](./docs/manual-tecnico.md#despliegue-en-vercel)
para el paso a paso completo (Vercel + variables de entorno + dominio).

## Licencia

Proyecto académico (trabajo de titulación). Uso educativo.
