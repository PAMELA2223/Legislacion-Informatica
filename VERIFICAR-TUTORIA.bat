@echo off
setlocal EnableDelayedExpansion
title Verificacion - Modulo de Tutoria

echo ============================================================
echo  VERIFICACION DE INTEGRIDAD Y SEGURIDAD - TUTORIA
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
call npx tsx scripts/verificar-tutoria.ts

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
