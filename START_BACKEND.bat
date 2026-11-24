
@echo off
setlocal
REM =========================================================================
REM FoodLoop Backend Presentation Startup Script
REM Database: foodloop_demo_rehearsal ONLY
REM =========================================================================

set "foodloopURL=jdbc:mysql://localhost:3306/foodloop_demo_rehearsal"

cd /d "D:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"

if errorlevel 1 (
    echo [ERROR] Project directory not found.
    pause
    exit /b 1
)

echo ===================================================
echo [1/2] Compiling FoodLoop Java Backend...
echo ===================================================

if not exist "out" mkdir out
REM Compile Java source files directly, quoting each path
setlocal EnableDelayedExpansion
set "SOURCES="

for /r src %%f in (*.java) do (
    set "SOURCES=!SOURCES! "%%f""
)

javac -cp "lib/*" -sourcepath src -d out !SOURCES!

if errorlevel 1 (
    echo.
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)
endlocal
if errorlevel 1 (
    echo.
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)

echo Compilation successful.

echo.
echo ===================================================
echo [2/2] Starting FoodLoop REST API Server on port 8080...
echo ===================================================

java -cp "out;lib/*;src" foodloop.src.ApiServer

if errorlevel 1 (
    java -cp "out;lib/*;src" ApiServer
)

pause
