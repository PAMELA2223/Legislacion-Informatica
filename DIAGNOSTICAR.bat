@echo off
setlocal EnableDelayedExpansion
title Diagnostico - Prisma / Supabase / Usuarios

echo ============================================================
echo  DIAGNOSTICO DE CONEXION PRISMA / SUPABASE
echo  Este script NO modifica nada, solo revisa y reporta.
echo ============================================================
echo.

if not exist "%~dp0apps\web" goto :sin_carpeta
cd /d "%~dp0apps\web"
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
echo Ejecutando diagnostico, esto puede tardar unos segundos...
echo.
call npx tsx scripts/diagnostico.ts
echo.
echo ============================================================
echo  Copia TODO el resultado de arriba y compartelo para
echo  poder diagnosticar el problema con certeza.
echo ============================================================

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
