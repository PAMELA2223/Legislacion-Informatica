@echo off
setlocal EnableDelayedExpansion
title Cargar Recursos (videos y PDFs) - Plataforma Legislacion Informatica

echo ============================================================
echo  CARGAR RECURSOS (VIDEOS Y PDFS)
echo  Te va a preguntar, uno por uno, la URL de cada video/PDF
echo  que le falte a tus modulos y documentos de biblioteca.
echo ============================================================
echo.

if not exist "%~dp0apps\web" goto :sin_carpeta
cd /d "%~dp0apps\web"
echo Trabajando en: %cd%
echo.
goto :verificar_deps

:sin_carpeta
echo [ERROR] No se encontro la carpeta: %~dp0apps\web
goto :final

:verificar_deps
if not exist "node_modules" goto :sin_deps
goto :ejecutar

:sin_deps
echo [ERROR] No se encontraron las dependencias instaladas.
echo Ejecuta primero INSTALAR.bat.
goto :final

:ejecutar
call npx tsx scripts/cargar-recursos.ts
if errorlevel 1 goto :fallo
goto :final

:fallo
echo.
echo [ERROR] Algo fallo al ejecutar el script. Revisa el mensaje
echo de arriba. Causa comun: DATABASE_URL incorrecta en .env.local
echo (ejecuta DIAGNOSTICAR.bat para revisar la conexion).
goto :final

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
