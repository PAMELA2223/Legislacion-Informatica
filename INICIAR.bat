@echo off
setlocal EnableDelayedExpansion
title Plataforma Legislacion Informatica - Servidor de Desarrollo

echo ============================================================
echo  INICIANDO - Plataforma Legislacion Informatica
echo ============================================================
echo.

if not exist "%~dp0apps\web" goto :sin_carpeta
cd /d "%~dp0apps\web"
echo Trabajando en: %cd%
echo.
goto :dependencias

:sin_carpeta
echo [ERROR] No se encontro la carpeta: %~dp0apps\web
echo Verifica que descomprimiste el .zip completo y que no
echo moviste este archivo fuera de la carpeta del proyecto.
goto :final

:dependencias
echo Verificando dependencias instaladas...
if not exist "node_modules" goto :sin_deps
echo   OK.
echo.
goto :entorno

:sin_deps
echo.
echo [ERROR] No se encontraron las dependencias instaladas.
echo Ejecuta primero INSTALAR.bat antes de iniciar el proyecto.
goto :final

:entorno
echo Verificando variables de entorno...
if not exist ".env.local" goto :sin_env
echo   OK.
echo.
goto :limpiar_cache

:limpiar_cache
echo Limpiando cache de compilacion anterior (.next)...
if exist ".next" rmdir /s /q ".next"
echo   OK.
echo.
goto :arrancar

:sin_env
echo.
echo [ERROR] No se encontro el archivo .env.local
echo Ejecuta INSTALAR.bat primero y luego configura tus
echo credenciales de Supabase en apps\web\.env.local
goto :final

:arrancar
echo ============================================================
echo  Iniciando servidor de desarrollo...
echo  La plataforma se abrira en: http://localhost:3000
echo  Para detener el servidor, presiona CTRL + C en esta ventana.
echo ============================================================
echo.

start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"

call npm run dev

echo.
echo El servidor se detuvo.

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
