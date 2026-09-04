@echo off
setlocal EnableDelayedExpansion
title Prisma Studio - Ver Base de Datos

echo ============================================================
echo  ABRIENDO PRISMA STUDIO
echo  Interfaz visual para ver tus tablas en el navegador.
echo ============================================================
echo.

if not exist "%~dp0apps\web" goto :sin_carpeta
cd /d "%~dp0apps\web"
goto :abrir

:sin_carpeta
echo [ERROR] No se encontro la carpeta: %~dp0apps\web
goto :final

:abrir
echo Se abrira en tu navegador: http://localhost:5555
echo Para cerrar, presiona CTRL + C en esta ventana.
echo.
start "" cmd /c "timeout /t 3 >nul && start http://localhost:5555"
call npx prisma studio

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
