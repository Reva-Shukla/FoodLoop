$ErrorActionPreference = "Stop"
$proj = "D:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"
$srcDir = Join-Path $proj "src"
$libDir = Join-Path $proj "lib"
$outDir = Join-Path $proj "out"
$sourcesFile = Join-Path $proj "sources.txt"
$compileLog = Join-Path $proj "compile.log"

# Gather all .java files
$javaFiles = Get-ChildItem -Path $srcDir -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName
$javaFiles | Set-Content -Path $sourcesFile -Encoding UTF8
Write-Host "Found $($javaFiles.Count) .java files"

# Ensure out dir exists
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# Build classpath
$cp = (Get-ChildItem -Path $libDir -Filter "*.jar" | Select-Object -ExpandProperty FullName) -join ";"

# Compile
$result = & javac -cp $cp -d $outDir "@$sourcesFile" 2>&1
$result | Out-File -FilePath $compileLog -Encoding UTF8

if ($LASTEXITCODE -ne 0) {
    Write-Host "COMPILE FAILED"
    Get-Content $compileLog
    exit 1
}

$classCount = (Get-ChildItem -Path $outDir -Recurse -Filter "*.class").Count
Write-Host "COMPILE OK — $classCount class files generated"
