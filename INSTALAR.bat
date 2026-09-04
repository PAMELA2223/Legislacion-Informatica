@echo off
setlocal EnableDelayedExpansion
title Instalando Plataforma Legislacion Informatica

echo ============================================================
echo  INSTALADOR - Plataforma Legislacion Informatica
echo ============================================================
echo.
echo Carpeta donde se encuentra este archivo:
echo %~dp0
echo.

echo [1/5] Verificando Node.js...
where node >nul 2>nul
if errorlevel 1 goto :sin_node
for /f "delims=" %%v in ('node -v') do echo   Node.js encontrado: %%v
echo.
goto :paso2

:sin_node
echo.
echo [ERROR] No se encontro Node.js instalado en este equipo.
echo Descarga e instala la version LTS desde: https://nodejs.org/
echo Luego vuelve a ejecutar este archivo.
goto :final

:paso2
echo [2/5] Verificando npm...
where npm >nul 2>nul
if errorlevel 1 goto :sin_npm
for /f "delims=" %%v in ('npm -v') do echo   npm encontrado: %%v
echo.
goto :paso3

:sin_npm
echo.
echo [ERROR] npm no esta disponible. Reinstala Node.js desde https://nodejs.org/
goto :final

:paso3
echo [3/5] Buscando la carpeta del proyecto apps\web ...
if not exist "%~dp0apps\web" goto :sin_carpeta
cd /d "%~dp0apps\web"
echo   Carpeta encontrada. Trabajando en: %cd%
echo.
goto :paso4

:sin_carpeta
echo.
echo [ERROR] No se encontro la carpeta: %~dp0apps\web
echo.
echo Esto normalmente significa que el .zip no se descomprimio
echo correctamente, o que moviste este archivo fuera de la carpeta
echo del proyecto.
echo.
echo SOLUCION: descomprime el .zip completo en una carpeta nueva
echo usando "Extraer todo" y ejecuta este archivo desde ahi,
echo sin mover ningun otro archivo de su lugar.
goto :final

:paso4
echo [4/5] Instalando dependencias del proyecto...
echo   Esto puede tardar varios minutos, por favor espera...
echo.
call npm install
if errorlevel 1 goto :fallo_install
echo.
echo   Dependencias instaladas correctamente.
echo.
goto :env

:fallo_install
echo.
echo [ERROR] Fallo el comando npm install. Revisa el mensaje de arriba.
echo Causas comunes: sin conexion a internet, antivirus bloqueando npm,
echo o permisos insuficientes - prueba ejecutar como administrador.
goto :final

:env
if exist ".env.local" goto :env_existe
if not exist ".env.example" goto :env_sin_ejemplo
copy ".env.example" ".env.local" >nul
echo   Se creo el archivo .env.local a partir de .env.example
goto :sync_env

:env_existe
echo   El archivo .env.local ya existe, no se sobreescribe.
goto :sync_env

:env_sin_ejemplo
echo   ADVERTENCIA: no se encontro .env.example.
echo   Debes crear manualmente apps\web\.env.local
goto :sync_env

:sync_env
echo.
echo   Sincronizando .env.local -^> .env
echo   (Prisma solo lee el archivo .env, no .env.local, asi que
echo    nos aseguramos de que ambos tengan las mismas credenciales)
if exist ".env.local" copy /y ".env.local" ".env" >nul
echo   OK.
goto :prisma

:prisma
echo.
echo [5/5] Generando cliente de Prisma...
call npx prisma generate
if errorlevel 1 (
    echo   ADVERTENCIA: no se pudo generar el cliente de Prisma.
    echo   Esto es normal si aun no configuraste DATABASE_URL en .env.local
)
echo.

echo ============================================================
echo  INSTALACION FINALIZADA
echo ============================================================
echo.
echo Siguientes pasos:
echo   1. Edita el archivo apps\web\.env.local con tus credenciales
echo      de Supabase: URL, anon key y DATABASE_URL
echo   2. Ejecuta INICIAR.bat para levantar el proyecto
echo.

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
