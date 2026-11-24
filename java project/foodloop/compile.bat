@echo off
setlocal

set "PROJ=d:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"
set "SRC=%PROJ%\src"
set "LIB=%PROJ%\lib"
set "OUT=%PROJ%\out"

REM Gather all .java files into sources.txt
dir /s /b "%SRC%\*.java" > "%PROJ%\sources.txt"
if errorlevel 1 (echo ERROR: could not list sources & exit /b 1)

REM Compile
javac -cp "%LIB%\*" -d "%OUT%" @"%PROJ%\sources.txt" > "%PROJ%\compile.log" 2>&1
if errorlevel 1 (
  echo COMPILE FAILED - see compile.log
  type "%PROJ%\compile.log"
  exit /b 1
)

echo COMPILE OK
dir /s /b "%OUT%\*.class" | find /c ".class"
endlocal
