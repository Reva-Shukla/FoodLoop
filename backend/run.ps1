# FoodLoop Backend Runner PowerShell Script
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  Starting FoodLoop Backend Server (Core Java HTTP Server on Port 8080)" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green

$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendDir

if (-not (Test-Path "bin\com\foodloop\Main.class")) {
    Write-Host "Compiling Java sources..." -ForegroundColor Yellow
    if (-not (Test-Path "bin")) { New-Item -ItemType Directory -Path "bin" | Out-Null }
    $files = (Get-ChildItem -Path "src" -Recurse -Filter "*.java").FullName
    & javac -encoding UTF-8 -cp "lib/*" -d bin $files
}

Write-Host "Launching Java Application..." -ForegroundColor Cyan
& java -cp "bin;lib/*" com.foodloop.Main 8080
