$env:foodloopURL = "jdbc:mysql://localhost:3306/foodloop_demo_rehearsal"
$env:DB_USERNAME = "sameer"
$env:DB_PASSWORD = "F2F_SAMEER"
$workingDir = "D:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"
Start-Process -FilePath "java" -ArgumentList "-cp","out;lib/*","ApiServer" -WorkingDirectory $workingDir -RedirectStandardOutput "backend_ps.log" -RedirectStandardError "backend_ps_err.log" -NoNewWindow
