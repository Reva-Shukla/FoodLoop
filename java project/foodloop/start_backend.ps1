$env:foodloopURL = "jdbc:mysql://localhost:3306/foodloop_demo_rehearsal"
$env:DB_USERNAME = "sameer"
$env:DB_PASSWORD = "F2F_SAMEER"
$javaPath = "java"
$arguments = "-cp","out;lib/*","ApiServer"
$workingDir = "d:\\Sem-3\\java programs\\New folder\\FoodLoop\\java project\\foodloop"
Start-Process -FilePath $javaPath -ArgumentList $arguments -WorkingDirectory $workingDir -NoNewWindow -PassThru | Out-Null