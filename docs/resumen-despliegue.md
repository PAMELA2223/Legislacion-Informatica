# RESUMEN DE DESPLIEGUE
## Plataforma de Legislación Informática — cómo quedó publicada en producción

## 1. Arquitectura de despliegue (visión general)

```
Código fuente (GitHub)
        ↓
   Vercel (hosting + build automático)
        ↓
Supabase (Auth + Base de datos PostgreSQL)
```

- **GitHub**: repositorio `PAMELA2223/Legislacion-Informatica` — control de versiones y disparador de despliegues automáticos
- **Vercel**: hospeda la aplicación Next.js, ejecuta el build y sirve el sitio en `https://legislacion-informatica-seven.vercel.app`
- **Supabase**: autenticación de usuarios (Supabase Auth) + base de datos PostgreSQL (con Prisma como ORM)

## 2. Pasos principales realizados

### 2.1 Preparación del proyecto para producción
- Se creó `vercel.json` (dentro de `apps/web`) especificando el comando de build (`npx prisma generate && npm run build`), ya que el proyecto necesita generar el cliente de Prisma antes de compilar
- Se creó `.env.example` documentando todas las variables de entorno necesarias, sin exponer valores reales
- Se verificó que `.gitignore` excluyera `.env`, `.env.local` y `node_modules` para nunca subir credenciales

### 2.2 Publicación en GitHub
- Se inicializó el repositorio Git local y se conectó a un repositorio remoto en GitHub
- **Incidente resuelto:** una carpeta con un nombre de archivo inválido (residuo de un comando anterior) impedía que Git subiera los cambios por exceder el límite de longitud de ruta de Windows — se identificó y eliminó
- **Incidente resuelto:** el primer intento de subida fue rechazado porque el repositorio remoto ya tenía un commit inicial (el README que GitHub crea automáticamente); se combinó el historial y se completó la subida

### 2.3 Configuración de la base de datos (Supabase)
- Se usó el **Connection Pooler** de Supabase en vez de la conexión directa, porque la conexión directa requiere IPv6 (no disponible en muchas redes domésticas/de oficina)
- Se configuraron dos cadenas de conexión distintas:
  - `DATABASE_URL` → Transaction Pooler (puerto 6543), usada por la aplicación en tiempo de ejecución
  - `DIRECT_URL` → Session Pooler (puerto 5432), usada por Prisma para migraciones
- Se ejecutaron las migraciones de Prisma para crear todas las tablas (usuarios, módulos, evaluaciones, tutoría, etc.)
- Se cargó el contenido inicial mediante el seed (módulos educativos, biblioteca jurídica, insignias, glosario)

### 2.4 Despliegue en Vercel
- Se importó el repositorio de GitHub como nuevo proyecto en Vercel
- **Root Directory** se configuró como `apps/web` (el proyecto es un monorepo: el código de Next.js no está en la raíz del repositorio)
- Se agregaron las variables de entorno de producción (Supabase URL, anon key, service role key, `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL`)
- **Incidente resuelto:** `NEXT_PUBLIC_SUPABASE_URL` había quedado con el valor de ejemplo (`tu-proyecto.supabase.co`) en vez del real, causando que el registro/login fallara con "Failed to fetch" (`ERR_NAME_NOT_RESOLVED`, porque ese dominio no existe). Se corrigió el valor real y se volvió a desplegar
- Se confirmó el build exitoso (lint, tipos, pruebas unitarias y build de producción, verificado con `VERIFICAR-CALIDAD.bat`)

### 2.5 Configuración de Supabase Auth para producción
- Se actualizó el **Site URL** en Supabase Authentication de `http://localhost:3000` a la URL real de Vercel
- Se agregó la URL de Vercel a los **Redirect URLs** (necesario para que funcione la recuperación de contraseña)

### 2.6 Contenido legal mínimo
- Se crearon las páginas públicas `/terminos` y `/privacidad` (enlazadas desde el formulario de registro), con contenido simplificado apropiado para un proyecto académico — aclarando explícitamente que no son documentos legales formales

## 3. Flujo de actualización continua

Una vez conectado el repositorio de GitHub a Vercel, cualquier cambio que se suba a la rama `main` (mediante `PUBLICAR-GITHUB.bat`) dispara **automáticamente** un nuevo despliegue en Vercel — no es necesario repetir el proceso de importación.

## 4. Scripts de automatización disponibles

| Script | Qué hace |
|---|---|
| `INSTALAR.bat` | Instala dependencias y prepara `.env.local` |
| `CONFIGURAR-BASE-DATOS.bat` | Ejecuta migraciones de Prisma y carga el seed |
| `VERIFICAR-CALIDAD.bat` | Corre lint, tipos, pruebas y build de producción |
| `PUBLICAR-GITHUB.bat` | Sube los cambios a GitHub (con recuperación automática si el remoto tiene contenido nuevo) |
| `DESPLEGAR-VERCEL.bat` | Despliega directamente a Vercel desde la terminal (alternativa a la integración automática de GitHub) |
| `INICIAR.bat` | Levanta el proyecto en modo desarrollo local |
| `DIAGNOSTICAR.bat` / `VERIFICAR-TUTORIA.bat` | Scripts de solo lectura para verificar la conexión a la base de datos y la integridad del módulo de tutoría |

## 5. Resultado final verificado

- ✅ 52 rutas generadas correctamente en el build de producción (páginas + endpoints de API)
- ✅ Registro, login y recuperación de contraseña funcionando en producción
- ✅ Base de datos con los 4 roles (Administrador, Docente, Estudiante, Invitado) y el RBAC verificado en servidor
- ✅ Contenido académico (módulos, biblioteca, evaluaciones, casos prácticos, tutoría) accesible desde la URL pública
