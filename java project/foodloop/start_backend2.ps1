$env:foodloopURL = "jdbc:mysql://localhost:3306/foodloop_demo_rehearsal"
$env:DB_USERNAME = "sameer"
$env:DB_PASSWORD = "F2F_SAMEER"
Set-Location -LiteralPath "D:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"
java -cp "out;lib/*" ApiServer