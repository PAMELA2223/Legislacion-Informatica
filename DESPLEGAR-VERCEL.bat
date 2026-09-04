@echo off
setlocal EnableDelayedExpansion
title Desplegar en Vercel - Plataforma Legislacion Informatica

echo ============================================================
echo  DESPLEGAR EN VERCEL
echo  Publica la plataforma en internet usando Vercel.
echo ============================================================
echo.

if not exist "%~dp0apps\web" goto :sin_carpeta
cd /d "%~dp0apps\web"
echo Trabajando en: %cd%
echo.
goto :vercel_cli

:sin_carpeta
echo [ERROR] No se encontro la carpeta: %~dp0apps\web
goto :final

:vercel_cli
echo [1/3] Verificando Vercel CLI...
where vercel >nul 2>nul
if errorlevel 1 goto :instalar_cli
for /f "delims=" %%v in ('vercel --version') do echo   Vercel CLI encontrado: %%v
echo.
goto :login

:instalar_cli
echo   No se encontro Vercel CLI. Instalando globalmente...
echo   (esto solo se hace una vez)
echo.
call npm install -g vercel
if errorlevel 1 goto :fallo_cli
echo.
goto :login

:fallo_cli
echo.
echo [ERROR] No se pudo instalar Vercel CLI. Puedes desplegar sin
echo la terminal desde https://vercel.com/new importando tu
echo repositorio de GitHub (ver PUBLICAR-GITHUB.bat).
goto :final

:login
echo [2/3] Iniciando sesion en Vercel (se abrira el navegador)...
echo.
call vercel login
if errorlevel 1 goto :fallo_login
echo.
goto :deploy

:fallo_login
echo.
echo [ERROR] No se pudo iniciar sesion. Vuelve a intentarlo.
goto :final

:deploy
echo [3/3] Desplegando a produccion...
echo.
echo   La primera vez, la CLI te preguntara:
echo     - "Set up and deploy?"            -^> Y
echo     - "Which scope?"                  -^> tu cuenta/equipo
echo     - "Link to existing project?"     -^> N (la primera vez)
echo     - "What's your project's name?"   -^> Enter para el sugerido
echo     - "In which directory is your code located?" -^> ./ (Enter)
echo.
echo   IMPORTANTE: este comando NO configura las variables de
echo   entorno por ti. Antes o despues de este paso, agrega en
echo   https://vercel.com -^> tu proyecto -^> Settings -^> Environment
echo   Variables las mismas claves de apps\web\.env.local:
echo     NEXT_PUBLIC_SUPABASE_URL
echo     NEXT_PUBLIC_SUPABASE_ANON_KEY
echo     SUPABASE_SERVICE_ROLE_KEY
echo     DATABASE_URL
echo     DIRECT_URL
echo     NEXT_PUBLIC_SITE_URL  (usa la URL que te da Vercel, ej.
echo                            https://tu-proyecto.vercel.app)
echo   Ver docs\manual-tecnico.md para el detalle completo.
echo.
pause
call vercel --prod
if errorlevel 1 goto :fallo_deploy
echo.
echo ============================================================
echo  DESPLIEGUE COMPLETADO
echo  Copia la URL que muestra la terminal arriba: ahi vive tu
echo  plataforma en produccion.
echo ============================================================
goto :final

:fallo_deploy
echo.
echo [ERROR] Fallo el despliegue. Revisa el mensaje de arriba.
echo Causas comunes: variables de entorno faltantes o incorrectas,
echo o un error de build (ejecuta primero VERIFICAR-CALIDAD.bat).
goto :final

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
