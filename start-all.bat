@echo off
echo ============================================================================
echo   FoodLoop - Food Donation & Redistribution Platform
echo   Launching Member 1: Donor Management Module
echo ============================================================================

echo Starting Backend Server in a new window...
start "FoodLoop Backend (Core Java :8080)" cmd /k "cd /d %~dp0backend && run.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend Dev Server in a new window...
start "FoodLoop Frontend (React.js :3000)" cmd /k "cd /d %~dp0frontend && run.bat"

echo.
echo Both servers started!
echo Open your browser at: http://localhost:3000
echo Backend API running at: http://localhost:8080
echo.
pause
