@echo off
setlocal EnableDelayedExpansion
title Verificacion de Calidad - Plataforma Legislacion Informatica

echo ============================================================
echo  VERIFICACION DE CALIDAD (FASE 10)
echo  Ejecuta, en orden: lint, tipos, pruebas y build de produccion.
echo  Este script NO modifica el codigo, solo revisa y reporta.
echo ============================================================
echo.

if not exist "%~dp0apps\web" goto :sin_carpeta
cd /d "%~dp0apps\web"
echo Trabajando en: %cd%
echo.
goto :verificar_deps

:sin_carpeta
echo [ERROR] No se encontro la carpeta: %~dp0apps\web
echo Verifica que descomprimiste el .zip completo y que no
echo moviste este archivo fuera de la carpeta del proyecto.
goto :final

:verificar_deps
if not exist "node_modules" goto :sin_deps
goto :lint

:sin_deps
echo [ERROR] No se encontraron las dependencias instaladas.
echo Ejecuta primero INSTALAR.bat.
goto :final

:lint
echo [1/4] Analizando el codigo (ESLint)...
echo.
call npm run lint
if errorlevel 1 goto :fallo_lint
echo.
echo   OK: sin errores de lint.
echo.
goto :tipos

:fallo_lint
echo.
echo [ERROR] Se encontraron errores de lint. Corrigelos y vuelve a
echo ejecutar este archivo. El resto de las verificaciones se
echo omiten hasta que el lint pase.
goto :final

:tipos
echo [2/4] Verificando tipos de TypeScript...
echo.
call npm run typecheck
if errorlevel 1 goto :fallo_tipos
echo.
echo   OK: sin errores de tipos.
echo.
goto :pruebas

:fallo_tipos
echo.
echo [ERROR] Se encontraron errores de tipos. Revisa el mensaje
echo de arriba.
goto :final

:pruebas
echo [3/4] Ejecutando pruebas unitarias (Vitest)...
echo.
call npm run test
if errorlevel 1 goto :fallo_pruebas
echo.
echo   OK: todas las pruebas pasaron.
echo.
goto :build

:fallo_pruebas
echo.
echo [ERROR] Una o mas pruebas fallaron. Revisa el mensaje de arriba.
goto :final

:build
echo [4/4] Generando build de produccion (npm run build)...
echo   Esto puede tardar varios minutos, por favor espera...
echo.
call npx prisma generate >nul 2>nul
call npm run build
if errorlevel 1 goto :fallo_build
echo.
echo ============================================================
echo  TODO CORRECTO
echo  Lint, tipos, pruebas y build pasaron sin errores.
echo  El proyecto esta listo para desplegarse (ver
echo  DESPLEGAR-VERCEL.bat o PUBLICAR-GITHUB.bat).
echo ============================================================
goto :final

:fallo_build
echo.
echo [ERROR] Fallo el build de produccion. Revisa el mensaje de
echo arriba. Causas comunes: variables de entorno faltantes en
echo .env.local, o un error de compilacion en el codigo.
goto :final

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
