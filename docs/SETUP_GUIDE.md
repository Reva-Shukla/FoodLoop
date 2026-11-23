# FoodLoop — Setup & Deployment Guide

This guide provides exact Windows PowerShell commands for running FoodLoop locally or in a team staging environment without exposing credentials or executing unapproved production mutations.

---

## 1. System Requirements

- **Operating System:** Windows 10/11, macOS, or Linux
- **Java Development Kit:** JDK 17 or higher (`java -version`, `javac -version`)
- **Node.js:** Node v18.0.0 or higher (`node -v`, `npm -v`)
- **MySQL Database:** MySQL Server 8.0+

---

## 2. Environment Configuration

FoodLoop avoids hardcoded database credentials by resolving connection settings from process-scoped environment variables at runtime.

### Standard PowerShell Environment Variables:

```powershell
# Port for the Java REST API server:
$env:PORT = "8089"

# MySQL Database JDBC Connection URL:
# For local MySQL:
$env:foodloopURL = "jdbc:mysql://localhost:3306/foodloop_rehearsal_sandbox?allowPublicKeyRetrieval=true&useSSL=false"

# For shared remote MySQL (e.g. over Tailscale):
# $env:foodloopURL = "jdbc:mysql://100.74.31.79:3306/foodloop_rehearsal_sandbox?allowPublicKeyRetrieval=true&useSSL=false&connectTimeout=30000&socketTimeout=60000"

# Database Credentials:
$env:DB_USERNAME = "sameer"
$env:DB_PASSWORD = "YOUR_DATABASE_PASSWORD"

# Vite Frontend Proxy Target:
$env:VITE_API_TARGET = "http://localhost:8089"
```

---

## 3. Starting the Java Backend API Server

Open a PowerShell terminal at the repository root `e:\FoodLoop`:

```powershell
# Step 1: Set process-scoped variables
$env:PORT = "8089"
$env:DB_USERNAME = "sameer"
$env:DB_PASSWORD = "YOUR_DATABASE_PASSWORD"
$env:foodloopURL = "jdbc:mysql://100.74.31.79:3306/foodloop_rehearsal_sandbox?allowPublicKeyRetrieval=true&useSSL=false&connectTimeout=30000&socketTimeout=60000"

# Step 2: Compile Java source classes
javac -cp "java project/lib/*;java project" -d "java project" "java project/foodloop/src/ApiServer.java" "java project/foodloop/src/TestRunner.java"

# Step 3: Launch ApiServer
java -cp "java project/lib/*;java project;java project/foodloop/src" foodloop.src.ApiServer
```

*Expected Terminal Output:*
```
FoodLoop API server started on port 8089
Serving endpoints for /api/auth, /api/hostels, /api/meals, /api/donations, /api/claims, /api/pickups, /api/waste, /api/supervisor
```

---

## 4. Starting the React/Vite Frontend

Open a second PowerShell terminal:

```powershell
# Step 1: Navigate to frontend directory
cd e:\FoodLoop\frontend

# Step 2: Set proxy target
$env:VITE_API_TARGET = "http://localhost:8089"

# Step 3: Install dependencies (first time only)
npm install

# Step 4: Run Vite development server
npm run dev
```

*Expected Terminal Output:*
```
  VITE v5.4.21  ready in 450 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 5. Running the Automated QA Test Suite

To verify system integrity without affecting browser state:

```powershell
# Run the 56-assertion backend test runner:
java -cp "java project/lib/*;java project;java project/foodloop/src" foodloop.src.TestRunner
```

To run the complete 51-assertion API workflow test suite against the live running server:
```powershell
python scratch/test_api_workflows.py
```

---

## 6. Offline / Standalone Local Demo Fallback

If Sameer's laptop or the network goes offline during a presentation:

1. Install MySQL 8.0 on your local laptop.
2. Create a local testing schema:
   ```sql
   CREATE DATABASE foodloop_local;
   ```
3. Restore the verified pre-migration dump:
   ```powershell
   mysql -u root -p foodloop_local < E:\FoodLoop_Backups\foodloop_before_phase7e_20261123_175850.sql
   ```
4. Run the production migration script against the local database:
   ```powershell
   # Point migration script to local database and execute:
   mysql -u root -p foodloop_local < e:\FoodLoop\foodloop_production_migration.sql
   ```
5. Point the backend at `jdbc:mysql://localhost:3306/foodloop_local`.
