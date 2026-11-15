@echo off
echo ============================================================================
echo   Starting FoodLoop Backend Server (Core Java HTTP Server on Port 8080)
echo ============================================================================

if not exist bin\com\foodloop\Main.class (
    echo Compiling backend first...
    call build.bat
)

java -cp "bin;lib/*" com.foodloop.Main 8080
pause
