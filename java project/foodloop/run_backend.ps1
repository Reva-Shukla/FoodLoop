$env:foodloopURL = "jdbc:mysql://localhost:3306/foodloop_demo_rehearsal"
$env:DB_USERNAME = "sameer"
$env:DB_PASSWORD = "F2F_SAMEER"
$proj = "D:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"
$libDir = Join-Path $proj "lib"
$outDir = Join-Path $proj "out"
$cp = "$outDir;" + ((Get-ChildItem -Path $libDir -Filter "*.jar" | Select-Object -ExpandProperty FullName) -join ";")
Write-Host "Starting ApiServer on classpath: $cp"
Set-Location -LiteralPath $proj
& java -cp $cp ApiServer