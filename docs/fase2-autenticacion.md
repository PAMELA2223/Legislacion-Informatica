# FASE 2 — AUTENTICACIÓN
## Estado: ✅ Completa

## 1. Qué se construyó

| Requisito de la Fase 2 | Archivo(s) |
|---|---|
| Página de inicio (Landing) | `app/(public)/page.tsx` |
| Login | `app/(auth)/login/page.tsx` + `login-form.tsx` |
| Registro | `app/(auth)/registro/page.tsx` + `register-form.tsx` |
| Recuperar contraseña | `app/(auth)/recuperar-password/page.tsx` + `reset-password-form.tsx` |
| Perfil | `app/(dashboard)/perfil/page.tsx` |
| Roles (Admin/Docente/Estudiante/Invitado) | `domain/user.entity.ts` (enum `Rol`), `prisma/schema.prisma` |
| Protección de rutas por rol / JWT | `middleware.ts` |
| Supabase Auth | `infrastructure/supabase-auth.repository.ts`, `lib/supabase-client.ts`, `lib/supabase-server.ts` |

## 2. Arquitectura aplicada (Clean Architecture)

```
modules/auth/
├── domain/            → User, Rol, UserRules, IAuthRepository (contrato)
├── application/        → RegisterUseCase, LoginUseCase, LogoutUseCase,
│                          RequestPasswordResetUseCase, UpdatePasswordUseCase,
│                          GetCurrentUserUseCase
├── infrastructure/     → SupabaseAuthRepository (implementa IAuthRepository)
└── presentation/       → LoginForm, RegisterForm, ResetPasswordForm
```

Ningún caso de uso ni componente de presentación importa Supabase directamente:
todos dependen de `IAuthRepository`, cumpliendo el principio de inversión de
dependencias (SOLID) definido en la Fase 1.

## 3. Seguridad implementada

- Autenticación gestionada por Supabase Auth (JWT firmado, cookies `httpOnly` vía `@supabase/ssr`).
- Middleware de Next.js valida sesión y **rol** antes de servir rutas de `/dashboard`, `/perfil`, `/admin` y `/docente`.
- Validación de contraseña en el dominio (`UserRules.passwordEsValida`): mínimo 8 caracteres, 1 mayúscula, 1 número.
- Recuperación de contraseña vía enlace firmado de un solo uso (flujo nativo de Supabase).

## 4. Pendiente de configuración (antes de ejecutar)

1. Crear proyecto gratuito en [supabase.com](https://supabase.com).
2. Copiar `.env.example` a `.env.local` y completar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `DATABASE_URL`.
3. Ejecutar `npm install` dentro de `apps/web`.
4. Ejecutar `npx prisma migrate dev` para crear la tabla `users`.
5. Ejecutar `npm run dev`.

## 5. Verificación de errores / QA realizado

- ✅ Tipado estricto en TypeScript en las 4 capas del módulo `auth`.
- ✅ Manejo de errores en cada caso de uso (mensajes claros al usuario).
- ✅ Middleware con `matcher` limitado a rutas protegidas (no afecta rendimiento de rutas públicas).
- ✅ Formularios con estados de carga (`isLoading`) y validación de campos requeridos.
- ⏳ Pendiente para Fase 10: pruebas automatizadas end-to-end (Playwright) y auditoría de seguridad completa.

## 6. Checklist de cierre

- [x] Página de inicio
- [x] Login
- [x] Registro
- [x] Recuperar contraseña
- [x] Perfil
- [x] Roles (Administrador, Docente, Estudiante, Invitado)
- [x] JWT vía Supabase Auth
- [x] Protección de rutas por middleware
- [x] Documentación técnica actualizada

**Pendiente tu aprobación para iniciar la Fase 3 (Módulos Educativos).**
