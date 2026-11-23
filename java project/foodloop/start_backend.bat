@echo off
set "foodloopURL=jdbc:mysql://localhost:3306/foodloop_demo_rehearsal"
set "DB_USERNAME=sameer"
set "DB_PASSWORD=F2F_SAMEER"
cd /d "d:\Sem-3\java programs\New folder\FoodLoop\java project\foodloop"
java -cp "out;lib/*" ApiServer > backend.log 2>&1