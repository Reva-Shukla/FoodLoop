@echo off
echo ============================================================================
echo   Compiling FoodLoop Backend (Core Java)
echo ============================================================================

if not exist bin mkdir bin

dir /s /b src\*.java > sources.txt
javac -encoding UTF-8 -cp "lib/*" -d bin @sources.txt
del sources.txt

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backend compiled successfully into bin/
) else (
    echo [ERROR] Compilation failed with error level %ERRORLEVEL%
)
pause
