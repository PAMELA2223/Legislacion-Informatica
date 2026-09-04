@echo off
setlocal EnableDelayedExpansion
title Publicar en GitHub - Plataforma Legislacion Informatica

echo ============================================================
echo  PUBLICAR EN GITHUB
echo  Sube (o actualiza) este proyecto en un repositorio de GitHub.
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/6] Verificando Git...
where git >nul 2>nul
if errorlevel 1 goto :sin_git
for /f "delims=" %%v in ('git --version') do echo   %%v
echo.
goto :limpiar_basura

:sin_git
echo.
echo [ERROR] No se encontro Git instalado en este equipo.
echo Descargalo desde: https://git-scm.com/download/win
echo Luego vuelve a ejecutar este archivo.
goto :final

:limpiar_basura
echo [2/6] Verificando que no existan carpetas invalidas...
if exist "\\?\%~dp0apps\web\src\{app" (
    echo   Se encontro una carpeta residual con nombre invalido
    echo   ^(quedo de una version anterior^) que Git no puede subir.
    echo   Eliminandola...
    rd /s /q "\\?\%~dp0apps\web\src\{app"
    echo   OK: carpeta invalida eliminada.
) else (
    echo   OK: no hay carpetas invalidas.
)
echo.
goto :init_repo

:init_repo
if exist ".git" goto :repo_existe
echo [3/6] Inicializando repositorio Git...
call git init
call git branch -M main
echo   OK: repositorio inicializado.
echo.
goto :remoto

:repo_existe
echo [3/6] Repositorio Git ya existente, se reutiliza.
echo.
goto :remoto

:remoto
git remote get-url origin >nul 2>nul
if not errorlevel 1 goto :remoto_existe

echo [4/6] Este repositorio aun no tiene un remoto "origin" configurado.
echo.
echo   Antes de continuar, crea un repositorio VACIO en GitHub
echo   (sin README, sin .gitignore) desde:
echo   https://github.com/new
echo.
set /p REPO_URL="Pega aqui la URL del repositorio (https://github.com/usuario/repo.git): "
if "!REPO_URL!"=="" goto :sin_url
call git remote add origin "!REPO_URL!"
echo   OK: remoto "origin" configurado.
echo.
goto :commit

:sin_url
echo.
echo [ERROR] No ingresaste ninguna URL. Vuelve a ejecutar este
echo archivo cuando tengas el repositorio creado en GitHub.
goto :final

:remoto_existe
echo [4/6] Remoto "origin" ya configurado:
git remote get-url origin
echo.
goto :commit

:commit
echo [5/6] Preparando cambios...
echo.
echo   IMPORTANTE: los archivos .env y .env.local NUNCA se suben
echo   (estan protegidos por .gitignore). Verifica antes de
echo   continuar que no vayas a subir ninguna credencial real.
echo.
call git add .
set /p MENSAJE="Mensaje del commit (Enter para usar uno por defecto): "
if "!MENSAJE!"=="" set MENSAJE=Actualizacion de la plataforma
call git commit -m "!MENSAJE!"
echo.
goto :push

:push
echo [6/6] Subiendo a GitHub (rama main)...
echo   Si es la primera vez, tu navegador o la terminal pueden
echo   pedirte iniciar sesion en GitHub.
echo.
call git push -u origin main
if errorlevel 1 goto :push_rechazado
echo.
echo ============================================================
echo  PUBLICADO CORRECTAMENTE
echo  Revisa tu repositorio en GitHub para confirmarlo.
echo  Siguiente paso: ejecuta DESPLEGAR-VERCEL.bat, o conecta
echo  el repositorio directamente desde vercel.com/new
echo ============================================================
goto :final

:push_rechazado
echo.
echo   GitHub rechazo la subida porque el repositorio remoto ya
echo   tiene contenido que no esta en tu copia local (por ejemplo,
echo   si al crearlo marcaste "Add a README file").
echo.
echo   Intentando combinar automaticamente el contenido remoto...
echo.
call git pull origin main --allow-unrelated-histories --no-edit
if errorlevel 1 goto :conflicto_manual

call git push -u origin main
if errorlevel 1 goto :fallo_push
echo.
echo ============================================================
echo  PUBLICADO CORRECTAMENTE (se combino con el contenido remoto)
echo ============================================================
goto :final

:conflicto_manual
echo.
echo   No se pudo combinar automaticamente: hay archivos que
echo   existen tanto en tu proyecto como en el repositorio remoto
echo   (por ejemplo, dos versiones distintas de README.md) y Git
echo   no puede decidir cual conservar por si solo.
echo.
echo   Si el repositorio de GitHub es nuevo y solo tiene el README
echo   inicial (sin trabajo real tuyo), lo mas simple es sobrescribir
echo   el remoto con tu proyecto local completo.
echo.
set /p FORZAR="Escribe SI para sobrescribir el remoto con tu proyecto local, o presiona Enter para cancelar: "
if /I "!FORZAR!"=="SI" (
    call git push --force -u origin main
    if errorlevel 1 goto :fallo_push
    echo.
    echo ============================================================
    echo  PUBLICADO CORRECTAMENTE (se sobrescribio el remoto)
    echo ============================================================
    goto :final
)
echo.
echo Operacion cancelada. No se subio nada. Resuelve el conflicto
echo manualmente o vacia el repositorio en GitHub y vuelve a intentar.
goto :final

:fallo_push
echo.
echo [ERROR] Fallo la subida a GitHub. Causas comunes:
echo   - No iniciaste sesion / las credenciales son incorrectas
echo   - La URL del repositorio remoto es incorrecta
echo Revisa el mensaje de arriba para mas detalles.
goto :final

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
