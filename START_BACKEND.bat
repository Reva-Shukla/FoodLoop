@echo off
REM =========================================================================
REM FoodLoop Backend Presentation Startup Script
REM Database: foodloop_demo_rehearsal (Isolated Rehearsal Database ONLY)
REM =========================================================================

set "PORT=8080"
set "foodloopURL=jdbc:mysql://localhost:3306/foodloop_demo_rehearsal"
set "DB_USERNAME=sameer"
set "DB_PASSWORD=F2F_SAMEER"

cd /d "D:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"

echo ===================================================
echo [1/2] Compiling FoodLoop Java Backend...
echo ===================================================
if not exist "out" mkdir out

dir /s /b "src\*.java" > sources.txt
javac -cp "lib\*" -sourcepath src -d out @sources.txt
if errorlevel 1 (
    echo.
    echo [ERROR] Compilation failed! Review the errors above.
    pause
    exit /b 1
)
echo Compilation successful. Generated classes in out\

echo.
echo ===================================================
echo [2/2] Starting FoodLoop REST API Server on port 8080...
echo Database: %foodloopURL%
echo ===================================================
echo.
REM Support both class location styles: out (direct) and out/foodloop.src
java -cp "out;lib\*;src" foodloop.src.ApiServer
if errorlevel 1 (
    java -cp "out;lib\*;src" ApiServer
)

pause
