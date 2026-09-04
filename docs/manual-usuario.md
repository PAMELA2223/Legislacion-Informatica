# Manual de Usuario

Plataforma de Legislación Informática — guía funcional por rol.

## 1. Roles de la plataforma

| Rol | Descripción |
|---|---|
| **Invitado** | Cualquier visitante sin sesión iniciada. Ve la página de inicio pública y puede registrarse o iniciar sesión. |
| **Estudiante** | Rol por defecto al registrarse. Accede a módulos, biblioteca, evaluaciones, casos prácticos, autoevaluación, foro, ranking, retos, glosario, noticias y su tutoría. |
| **Docente** | Además de lo anterior, gestiona a sus estudiantes asignados y su seguimiento de tutoría. |
| **Administrador** | Acceso al panel `/admin`: gestiona usuarios, contenido (cursos, biblioteca, casos prácticos, evaluaciones, glosario, noticias), foro, tutorías, estadísticas y logs de auditoría. |

## 2. Primeros pasos

### 2.1 Crear una cuenta

1. Entra a la página de inicio y pulsa **Crear cuenta**.
2. Completa **Nombre completo**, **Correo electrónico** y **Contraseña**
   (mínimo 8 caracteres, con al menos una mayúscula y un número).
3. Confirma la contraseña y acepta los Términos y Condiciones.
4. Pulsa **Crear cuenta**. Revisa tu correo para confirmar la cuenta si tu
   configuración de Supabase lo requiere.
5. Inicia sesión con tus credenciales.

Toda cuenta nueva se crea con rol **Estudiante**. Si necesitas rol de
Docente o Administrador, contacta a un administrador de la plataforma.

### 2.2 Iniciar sesión

1. Entra a `/login`.
2. Ingresa tu correo y contraseña.
3. Usa el ícono del ojo para mostrar/ocultar la contraseña si lo
   necesitas.
4. Si olvidaste tu contraseña, pulsa **¿Olvidaste tu contraseña?** e
   ingresa tu correo: recibirás un enlace para restablecerla.

### 2.3 Cerrar sesión

Desde el menú superior (barra de navegación), abre el menú de tu perfil y
selecciona **Cerrar sesión**.

## 3. Guía para Estudiantes

| Sección | Qué encontrarás |
|---|---|
| **Inicio** (`/dashboard`) | Resumen de tu progreso, próximos pasos y accesos rápidos. |
| **Módulos** (`/modulos`) | 8 módulos educativos progresivos; cada uno con lecciones y actividades. |
| **Biblioteca** (`/biblioteca`) | Constitución, LOPDP, COIP y Ley de Comercio Electrónico, con buscador y consulta por artículo. Puedes marcar documentos como favoritos. |
| **Evaluaciones** (`/evaluaciones`) | Evaluaciones asociadas a los módulos, con retroalimentación. |
| **Casos prácticos** (`/casos-practicos`) | Escenarios reales con la normativa aplicable; resuelve y recibe retroalimentación jurídica. |
| **Autoevaluación** (`/autoevaluacion`) | Diagnóstico inicial y final sobre 6 ejes de competencia digital. |
| **Mi tutoría** (`/mi-tutoria`) | Seguimiento con tu docente asignado: tareas, objetivos y reuniones. Si aún no tienes tutor, puedes solicitar uno. |
| **Foro** (`/foro`) | Crea hilos, comenta y reacciona a publicaciones de la comunidad. |
| **Ranking** (`/ranking`) | Tabla de posiciones según tu XP y nivel. |
| **Retos** (`/retos`) | Objetivos con progreso (ej. completar módulos, aprobar evaluaciones) que otorgan XP e insignias. |
| **Glosario** (`/glosario`) | Términos de legislación informática explicados. |
| **Noticias** (`/noticias`) | Novedades normativas y de la plataforma. |
| **Buscador** (`/buscar`) | Búsqueda global sobre todo el contenido de la plataforma. |

**Gamificación**: al completar lecciones, aprobar evaluaciones o resolver
casos correctamente, ganas **XP** que sube tu **nivel** y puede
desbloquear **insignias** — visibles en tu perfil y en el ranking.

## 4. Guía para Docentes

Todo lo del rol Estudiante, más:

| Sección | Qué encontrarás |
|---|---|
| **Mis estudiantes** (`/docente/estudiantes`) | Lista de estudiantes bajo tu tutoría, con acceso a su seguimiento individual. |
| **Agregar estudiante** (`/docente/agregar-estudiante`) | Vincula un nuevo estudiante a tu tutoría. |
| Seguimiento por estudiante | Asigna tareas, define objetivos, registra reuniones y observaciones, comparte recursos. |

## 5. Guía para Administradores

Panel disponible en `/admin`:

| Sección | Qué gestionas |
|---|---|
| **Usuarios** (`/admin/usuarios`) | Ver usuarios registrados y cambiar su rol (Estudiante / Docente / Administrador). |
| **Cursos** (`/admin/cursos`) | Módulos y lecciones educativas. |
| **Biblioteca** (`/admin/biblioteca`) | Documentos jurídicos y sus artículos. |
| **Casos prácticos** (`/admin/casos-practicos`) | Escenarios, normativa aplicable y retroalimentación. |
| **Evaluaciones** (`/admin/evaluaciones`) | Preguntas, opciones y umbrales de aprobación. |
| **Glosario** (`/admin/glosario`) | Términos y definiciones. |
| **Noticias** (`/admin/noticias`) | Publicaciones de novedades. |
| **Foro** (`/admin/foro`) | Moderación de hilos y publicaciones. |
| **Tutorías** (`/admin/tutorias`) | Reasignación de tutorías entre docentes. |
| **Estadísticas** (`/admin/estadisticas`) | Métricas de uso de la plataforma. |
| **Logs** (`/admin/logs`) | Auditoría de acciones administrativas. |

**Cómo asignar el primer administrador**: ejecuta
`scripts/hacer-admin.ts` (ver `README.md` / manual técnico) indicando el
correo de la cuenta que ya se registró como Estudiante — se elevará su rol
a Administrador.

## 6. Preguntas frecuentes

**¿Por qué no veo el enlace "Módulos" ni "Biblioteca" si soy
Administrador?**
El panel de Administrador gestiona el contenido (`/admin/*`); la
navegación de estudio (`/modulos`, `/biblioteca`, etc.) es específica de
Estudiante/Docente, ya que un administrador no "cursa" la plataforma, la
gestiona.

**Olvidé mi contraseña, ¿qué hago?**
En `/login`, pulsa **¿Olvidaste tu contraseña?**, ingresa tu correo y
sigue el enlace que recibirás por email.

**¿Mis datos están seguros?**
La autenticación se gestiona con Supabase Auth y toda la comunicación
viaja cifrada por HTTPS. Solo un Administrador puede ver o modificar el
rol de otros usuarios; ningún dato de contraseña se almacena en texto
plano (lo gestiona Supabase Auth).
