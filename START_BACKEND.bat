@echo off
REM ==========================================
REM FoodLoop Backend Startup Script
REM Uses foodloop_demo_rehearsal database ONLY
REM ==========================================

set "foodloopURL=jdbc:mysql://localhost:3306/foodloop_demo_rehearsal"
set "DB_USERNAME=sameer"
set "DB_PASSWORD=F2F_SAMEER"

cd /d "D:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"

echo [1/2] Compiling Java sources...
dir /s /b "src\*.java" > sources.txt
javac -cp "lib\*" -sourcepath src -d out @sources.txt
if errorlevel 1 (
    echo COMPILE FAILED. Check output above.
    pause
    exit /b 1
)
echo Compile OK.

echo [2/2] Starting ApiServer on port 8080...
java -cp "out;lib\*" ApiServer

pause