# Registro sin confirmación por correo

El estudiante se registra y **entra directamente** a la plataforma, sin abrir su correo para confirmar la cuenta. El resto del proceso de registro, inicio de sesión y recuperación de contraseña se mantiene.

## Cómo funciona

| Paso | Antes | Ahora |
|---|---|---|
| Registro | Supabase creaba la cuenta **sin confirmar** y enviaba un correo con un enlace | El servidor de la plataforma crea la cuenta **ya confirmada** con la clave de servicio. **No se envía ningún correo** |
| Después de registrarse | "Revisa tu correo…" y vuelta al inicio de sesión | Inicia sesión automáticamente y entra a la plataforma (primero, a la autoevaluación inicial) |
| Cuentas antiguas sin confirmar | No podían ingresar hasta confirmar | Al iniciar sesión con su contraseña correcta, se activan solas |
| Mensajes de error | En inglés ("Invalid login credentials") | En español ("Correo o contraseña incorrectos.") |

Se hace desde el servidor, y no solo desactivando la opción en el panel de Supabase, para que funcione **sin depender de esa configuración**. Si faltara la clave de servicio, el registro usa automáticamente el método anterior como respaldo, de modo que nunca falla.

## Lo que se corrigió además

1. **La recuperación de contraseña estaba rota.** El enlace del correo llevaba a `/recuperar-password/nueva`, una página que no existía (error 404). Ahora existe:
   - detecta el enlace;
   - permite crear la nueva contraseña, con la misma regla de seguridad del registro;
   - si el enlace venció o ya se usó, lo explica y ofrece pedir otro.

   La recuperación **sigue usando el correo**, porque es la única forma segura de comprobar que la cuenta es de quien la solicita.
2. **Brecha de seguridad en el rol.** La fila del usuario se creaba con el rol que venía en los datos del registro, y ese dato puede escribirlo el propio usuario. Sin confirmación por correo, cualquiera habría podido crearse una cuenta de administrador en segundos. Ahora el rol inicial solo se toma de `app_metadata`, que únicamente el servidor puede escribir. Los registros nuevos siempre son **Estudiante**; los administradores se asignan desde el panel, como hasta ahora.

## Configuración

- **Vercel:** debe existir `SUPABASE_SERVICE_ROLE_KEY`, que ya estaba configurada. `NEXT_PUBLIC_SITE_URL` debe ser la dirección pública de la plataforma.
- **Supabase → Authentication → URL Configuration → Redirect URLs:** agregar `https://legislacion-informatica-vyus.vercel.app/**`. Sin esto, Supabase rechaza el enlace de recuperación hacia `/recuperar-password/nueva`.
- **Recomendado: Supabase → Authentication → Sign In / Providers → Email → desactivar "Confirm email".** No es obligatorio, porque el registro ya no depende de esta opción. Desactivarla evita correos de confirmación si alguna vez se usa el registro de respaldo.

No requiere migración de la base de datos.

## Consideración

Sin confirmación por correo, la plataforma **no verifica que el correo pertenezca a quien se registra**: alguien podría registrarse con un correo ajeno. Es el comportamiento solicitado; si más adelante se necesita, puede volver a activarse la verificación.

## Verificación

- **Pruebas unitarias:** 174 en total, incluidas las de validación del registro, el rol seguro, la traducción de errores, el registro directo, el respaldo y la activación de cuentas antiguas.
- **Navegador:** 18/18 verificaciones sobre las páginas reales (registro, inicio de sesión y recuperación) y sin errores de JavaScript. Se comprobó, entre otras cosas, que el registro **no llama** al servicio de Supabase que envía el correo de confirmación.
- La clave de servicio no aparece en ningún archivo que se envía al navegador.
- Las llamadas reales a Supabase no pudieron hacerse en el entorno de desarrollo: se simularon con el formato oficial de sus respuestas.
