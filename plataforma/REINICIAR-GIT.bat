@echo off
setlocal EnableDelayedExpansion
title Reiniciar Git desde cero - Plataforma Legislacion Informatica

echo ============================================================
echo  REINICIAR GIT DESDE CERO
echo  Borra el historial local de Git (carpeta .git) para poder
echo  subir el proyecto a GitHub como si fuera la primera vez.
echo  NO borra tu codigo, ni node_modules, ni tus archivos .env.
echo ============================================================
echo.

cd /d "%~dp0"
echo Trabajando en: %cd%
echo.

if exist ".git" goto :confirmar

echo No se encontro ninguna carpeta .git aqui: no hay nada que
echo reiniciar. Ya puedes ejecutar PUBLICAR-GITHUB.bat directamente.
goto :final

:confirmar
echo Se encontro un repositorio Git existente en esta carpeta.
echo.
echo IMPORTANTE: esto borra el HISTORIAL LOCAL de commits (la
echo carpeta .git). Si ya subiste este proyecto a GitHub antes,
echo el repositorio remoto (en github.com) NO se borra con esto
echo -- si quieres empezar completamente limpio alla tambien,
echo borra el repositorio desde GitHub (Settings -^> Delete this
echo repository) y crea uno nuevo vacio en github.com/new.
echo.
set /p CONFIRMAR="Escribe SI para borrar el historial local y continuar: "
if /i not "!CONFIRMAR!"=="SI" goto :cancelado

echo.
echo Borrando carpeta .git...
rmdir /s /q ".git"
if exist ".git" goto :fallo_borrado
echo   OK: historial local borrado.
echo.
echo ============================================================
echo  LISTO
echo  Ahora ejecuta PUBLICAR-GITHUB.bat para inicializar un
echo  repositorio nuevo desde cero y subirlo a GitHub.
echo ============================================================
goto :final

:fallo_borrado
echo.
echo [ERROR] No se pudo borrar la carpeta .git por completo.
echo Causa comun: algun programa la tiene abierta (por ejemplo,
echo VS Code, GitHub Desktop, o una terminal parada dentro de
echo esa carpeta). Cierra esos programas e intenta de nuevo.
goto :final

:cancelado
echo.
echo Cancelado. No se borro nada.
goto :final

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
