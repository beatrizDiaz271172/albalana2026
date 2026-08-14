@echo off
SETLOCAL EnableDelayedExpansion
set "OUTPUT_FILE=proyecto_claude.txt"

echo Creando archivo de contexto para Claude: %OUTPUT_FILE%
echo Estructura del Proyecto > %OUTPUT_FILE%
echo ======================= >> %OUTPUT_FILE%

:: Generar arbol de carpetas ignorando carpetas pesadas
tree /A /F | findstr /V /I /C:"node_modules" /C:".git" /C:"target" /C:".gradle" /C:".settings" /C:".mvn" /C:"build" /C:".metadata" >> %OUTPUT_FILE%

echo. >> %OUTPUT_FILE%
echo Contenido de los Archivos >> %OUTPUT_FILE%
echo ======================== >> %OUTPUT_FILE%

:: Buscar y procesar archivos de React (Frontend)
for /R . %%F in (*.js *.jsx *.ts *.tsx *.json *.css) do (
    set "FILE_PATH=%%F"
    set "RELATIVE_PATH=!FILE_PATH:%CD%\=!"
    
    :: Filtros de exclusion
    echo !RELATIVE_PATH! | findstr /I /C:"node_modules" /C:"package-lock.json" /C:"build" /C:".git" >nul
    if !errorlevel! NEQ 0 (
        echo --- START FILE: !RELATIVE_PATH! --- >> %OUTPUT_FILE%
        type "%%F" >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
        echo --- END FILE: !RELATIVE_PATH! --- >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
    )
)

:: Buscar y procesar archivos de Spring Boot (Backend)
for /R . %%F in (*.java *.properties *.yml *.xml *.gradle) do (
    set "FILE_PATH=%%F"
    set "RELATIVE_PATH=!FILE_PATH:%CD%\=!"
    
    :: Filtros de exclusion
    echo !RELATIVE_PATH! | findstr /I /C:"target" /C:".gradle" /C:".mvn" /C:"build" >nul
    if !errorlevel! NEQ 0 (
        echo --- START FILE: !RELATIVE_PATH! --- >> %OUTPUT_FILE%
        type "%%F" >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
        echo --- END FILE: !RELATIVE_PATH! --- >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
    )
)

echo Proceso completado. Sube el archivo '%OUTPUT_FILE%' a Claude Pro.
pause
