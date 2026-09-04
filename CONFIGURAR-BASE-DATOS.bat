@echo off
setlocal EnableDelayedExpansion
title Configurar Base de Datos - Plataforma Legislacion Informatica

echo ============================================================
echo  CONFIGURAR BASE DE DATOS
echo  Este script crea las tablas en Supabase y carga el
echo  contenido inicial (8 modulos + biblioteca juridica).
echo ============================================================
echo.

if not exist "%~dp0apps\web" goto :sin_carpeta
cd /d "%~dp0apps\web"
echo Trabajando en: %cd%
echo.
goto :verificar_env

:sin_carpeta
echo [ERROR] No se encontro la carpeta: %~dp0apps\web
echo Verifica que descomprimiste el .zip completo y que no
echo moviste este archivo fuera de la carpeta del proyecto.
goto :final

:verificar_env
echo [1/4] Verificando archivo de variables de entorno...
if not exist ".env.local" goto :sin_env
echo   OK: se encontro .env.local
echo.
echo   Sincronizando .env.local -^> .env
echo   (Prisma solo lee el archivo .env, no .env.local, asi que
echo    nos aseguramos de que ambos tengan las mismas credenciales)
copy /y ".env.local" ".env" >nul
echo   OK: .env actualizado con las credenciales correctas.
echo.
goto :verificar_deps

:sin_env
echo.
echo [ERROR] No se encontro el archivo .env.local
echo Ejecuta INSTALAR.bat primero y configura tus credenciales
echo de Supabase en apps\web\.env.local
goto :final

:verificar_deps
echo [2/4] Verificando dependencias instaladas...
if not exist "node_modules" goto :sin_deps
echo   OK.
echo.
goto :migrar

:sin_deps
echo.
echo [ERROR] No se encontraron las dependencias instaladas.
echo Ejecuta primero INSTALAR.bat.
goto :final

:migrar
echo [3/4] Creando/actualizando las tablas en Supabase...
echo   Esto puede tardar un momento, por favor espera...
echo.
call npx prisma migrate dev --name init
if errorlevel 1 goto :fallo_migrar
echo.
echo   Tablas creadas/actualizadas correctamente.
echo.
goto :seed

:fallo_migrar
echo.
echo [ERROR] Fallo la creacion de tablas.
echo Causas comunes:
echo   - DATABASE_URL mal escrito en .env.local
echo   - La contrasena de la base de datos es incorrecta
echo   - Caracteres especiales en la contrasena sin codificar
echo     (por ejemplo @ debe escribirse como %%40)
echo   - Sin conexion a internet
echo Revisa el mensaje de arriba para mas detalles.
goto :final

:seed
echo [4/4] Cargando contenido inicial: modulos y biblioteca juridica...
echo.
call npm run prisma:seed
if errorlevel 1 goto :fallo_seed
echo.
echo ============================================================
echo  BASE DE DATOS LISTA
echo ============================================================
echo.
echo Se crearon las tablas y se cargaron:
echo   - 8 modulos educativos
echo   - 4 documentos de biblioteca juridica con sus articulos
echo.
echo Ya puedes ejecutar INICIAR.bat para levantar el proyecto.
echo.
goto :final

:fallo_seed
echo.
echo [ADVERTENCIA] Las tablas se crearon pero fallo la carga de
echo contenido inicial. Revisa el mensaje de arriba. Puedes volver
echo a intentarlo ejecutando este mismo archivo de nuevo.
goto :final

:final
echo.
echo ------------------------------------------------------------
echo Presiona una tecla para cerrar esta ventana...
pause >nul
endlocal
