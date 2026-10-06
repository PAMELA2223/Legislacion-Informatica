# Control de acceso: "solo entran dos personas y luego hay que esperar horas"

## Diagnóstico
La plataforma **no tiene un sistema de turnos/horarios** (no existe tabla, middleware ni validación de turnos en el código ni en la base de datos). El síntoma tiene dos causas reales:

1. **Cupo de correos de Supabase (causa del "2 y esperar horas").** El servicio de correo incluido en Supabase solo permite unos ~2 correos por hora para TODO el proyecto. Si el despliegue no tiene `SUPABASE_SERVICE_ROLE_KEY`, el registro usa `supabase.auth.signUp` (respaldo en `supabase-auth.repository.ts → registroEstandar`), que envía un correo de confirmación por cada estudiante: tras 2 registros el resto recibe `email rate limit exceeded` hasta que pase la hora. La app lo traducía como "Demasiados intentos. Espera unos minutos", ocultando la causa. La recuperación de contraseña usa el mismo cupo.
2. **Contador por IP compartido.** `/api/auth/registro` y `/api/auth/confirmar-cuenta` limitaban 10 intentos cada 15 min **por IP**. En un laboratorio todos salen por la misma IP pública, así que el contador funcionaba como cupo global del aula.

## Cambios
- `src/lib/limite-intentos.ts`: nueva `superaLimiteAuth(accion, ip, correo)` con dos contadores separados: por persona (IP + correo, 10/15 min, frena fuerza bruta sobre una cuenta) y techo anti-abuso por red (300/hora, dimensionado para un aula). Los intentos rechazados no consumen cupo.
- `src/app/api/auth/registro/route.ts` y `confirmar-cuenta/route.ts`: usan el límite por persona; el registro registra en el log del servidor cuándo falta la clave de servicio.
- `src/modules/auth/domain/registro.ts`: `email rate limit exceeded` muestra un mensaje propio (límite de correos de la plataforma, avisar al administrador).

## Configuración necesaria en producción (Vercel / Supabase)
1. Vercel → Environment Variables: `SUPABASE_SERVICE_ROLE_KEY` (Production) y volver a desplegar. Con ella el registro no envía correos.
2. Supabase → Authentication → Sign In / Providers → Email: desactivar **Confirm email**.
3. Para recuperación de contraseña con muchos estudiantes: configurar un SMTP propio (Authentication → Emails → SMTP Settings).
4. Opcional: Authentication → Rate Limits, revisar el límite de inicios de sesión por IP si un aula grande entra a la vez.

## Pruebas
`src/lib/limite-intentos.test.ts` y `src/app/api/auth/registro/route.test.ts`: turno 08:00–12:00 con A 08:10, B 08:30, C 09:00, D 10:15, E 11:40 (misma IP) → todos entran; 35–40 estudiantes en el mismo minuto → todos entran; quien insiste con su correo es frenado sin afectar al resto; el bloqueo dura minutos.
