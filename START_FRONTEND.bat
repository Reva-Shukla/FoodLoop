@echo off
REM =========================================================================
REM FoodLoop Frontend Presentation Startup Script
REM URL: http://localhost:3000
REM Proxy target: http://localhost:8080 (Java Backend REST API)
REM =========================================================================

cd /d "D:\Sem-3\java programs\New folder\FoodLoop\frontend"

echo ===================================================
echo Starting FoodLoop React/Vite Frontend...
echo Target Backend: http://localhost:8080
echo Frontend URL:   http://localhost:3000
echo ===================================================
echo.

set "VITE_API_TARGET=http://localhost:8080"
npm run dev

pause
