# 🌱 FoodLoop
### *Every Meal Deserves a Destination.*

**FoodLoop** is an enterprise-grade campus food-surplus redistribution and waste reduction platform built specifically for university environments. Operating across Chitkara University (Punjab, Rajpura), FoodLoop digitizes the end-to-end lifecycle of surplus dining hall food—connecting campus mess managers, verified NGO partners, and campus administrators into a unified, food-safe ecosystem.

---

## 🎯 Problem Statement
University campus messes produce substantial quantities of wholesome, freshly prepared food every day. Due to variable student attendance and batch cooking, safe surplus often remains unserved at the end of dining cycles. Without automated tracking, strict food-safety protocols, and real-time coordination, this surplus food risks spoilage while local communities in need go unserved.

**FoodLoop solves this challenge by:**
1. Enforcing strict food-safety standards (only safe, unserved kitchen surplus is redistributable; plate leftovers and table scraps are permanently blocked).
2. Automating meal surplus calculation with immutable mass-balance accounting: `prepared = served + surplus`.
3. Empowering verified NGOs to claim and collect unserved surplus within strict time-temperature safety windows.
4. Providing campus supervisors with real-time audit analytics and discarded waste tracking across all campus hostel kitchens.

---

## 👥 Three Core User Roles

| Role | Portal | Core Responsibilities |
| :--- | :--- | :--- |
| **Mess Manager** (`MESS`) | Mess Kitchen Portal | Logs daily meal batches (prepared & served portions), reviews auto-calculated surplus, publishes verified unserved food donations with expiry deadlines and allergens, and records kitchen waste with structured discard reasons. |
| **NGO Partner** (`NGO`) | Community Partner Portal | Browses real-time available surplus donations across campus, claims donation batches, coordinates pickup logistics, and confirms completed collections on-site. |
| **Campus Supervisor** (`ADMIN`) | Supervisor Executive Analytics | Monitors campus-wide dining performance across all 7 messes, enforces food conservation formulas, audits kitchen waste breakdown, and reviews donation redistribution rates. |

---

## 🏛️ The 7 Chitkara University Hostel Messes

FoodLoop is specifically configured for Chitkara University's campus dining directory:
- **Boys' Hostel Messes (4):** Franklin Mess (`mess-b-franklin`), Alfred Mess (`mess-b-alfred`), Magellan Mess (`mess-b-magellan`), Archimedes Mess (`mess-b-archimedes`).
- **Girls' Hostel Messes (3):** Pi Mess (`mess-g-pi`), IBN Mess (`mess-g-ibn`), Nightingale Mess (`mess-g-nightingale`).

---

## 🛡️ Non-Negotiable Food Safety & Conservation Rules

FoodLoop is engineered around strict public health and mass-balance principles:
1. **Unserved Surplus Only:** Only batch-prepared surplus food that has remained in kitchen holding (unserved) is eligible for donation. Plate leftovers and dining table scraps are strictly rejected by the application (`HTTP 400`).
2. **Time-Temperature Control:** All donations require an explicit future deadline (`deadline > NOW()`), storage condition details (e.g. heated, insulated, refrigerated), and allergen disclosures.
3. **Double-Claim Prevention:** Database row-locking (`SELECT ... FOR UPDATE`) prevents concurrent double-claims and double-completions of pickup batches.
4. **Mass-Balance Conservation:** Every prepared portion is accounted for:
   $$\text{Prepared} = \text{Served} + \text{Donated} + \text{Wasted} + \text{Unallocated Surplus}$$
5. **Sample/Demo Data Isolation:** Historical prototype demo records (`mess_id = NULL`, `is_demo = TRUE`) are safely preserved for historical reference but are strictly excluded from genuine campus dining totals.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide React Icons, React Router DOM 6.
- **Backend API:** Java 17+ Standard Library HTTP Server (`com.sun.net.httpserver.HttpServer`), Multi-Threaded Executor.
- **Database Access:** Java Database Connectivity (JDBC) with MySQL 8.0 Connector (`mysql-connector-j-8.0.33`).
- **Database Engine:** MySQL 8.0 InnoDB (utf8mb4, transactional row locking, stored generated columns, foreign keys).
- **Authentication & Security:** PBKDF2 with SHA-256 password hashing (10,000 iterations + random salt), legacy SHA-256 fallback verification, custom CSRF protection (`X-Requested-With`), HttpOnly cookie and Bearer token session management.

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Java JDK 17 or higher
- Node.js 18+ and npm
- MySQL 8.0+ (accessible locally or via network/Tailscale)

### 1. Database Configuration
FoodLoop uses process-scoped environment variables to configure database connections cleanly without hardcoded credentials:

```powershell
# In PowerShell:
$env:foodloopURL = "jdbc:mysql://localhost:3306/foodloop_rehearsal_sandbox?allowPublicKeyRetrieval=true&useSSL=false"
$env:DB_USERNAME = "sameer"
$env:DB_PASSWORD = "<YOUR_MYSQL_PASSWORD>"
$env:PORT = "8089"
```

### 2. Backend Startup
From the project root:
```powershell
# Compile Java source files:
javac -cp "java project/lib/*;java project" -d "java project" "java project/foodloop/src/ApiServer.java" "java project/foodloop/src/TestRunner.java"

# Start the REST API server on port 8089:
java -cp "java project/lib/*;java project;java project/foodloop/src" foodloop.src.ApiServer
```

### 3. Frontend Startup
In a separate terminal:
```powershell
# Install frontend dependencies (if not already installed):
cd frontend
npm install

# Start Vite dev server proxying to port 8089:
$env:VITE_API_TARGET = "http://localhost:8089"
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated QA & Test Suites

FoodLoop includes a comprehensive automated test harness covering security, RBAC, session management, and food-safety validation:

```powershell
# Run the 56-assertion Java test suite:
java -cp "java project/lib/*;java project;java project/foodloop/src" foodloop.src.TestRunner
```
**Test Results: 56/56 Passed (100%)**
- Password Security & PBKDF2/SHA-256: 9/9 Passed
- Server-Side Session Management & DTO Sanitization: 9/9 Passed
- CORS & Custom Security Headers: 5/5 Passed
- HTTP Routes, RBAC, & Food-Safety Validation: 33/33 Passed

---

## 📁 Project Structure

```
FoodLoop/
├── frontend/                     # React / Vite SPA Client
│   ├── src/
│   │   ├── components/           # Reusable UI & Layout Components
│   │   ├── context/              # AuthContext & FoodLoopContext
│   │   ├── data/hostels.js       # Chitkara 7 Mess Campus Directory
│   │   ├── pages/                # Mess, NGO, and Supervisor Dashboard Pages
│   │   └── services/             # API client & REST services
│   └── vite.config.js            # Reverse proxy configuration
├── java project/                 # Java REST API Backend
│   ├── foodloop/src/
│   │   ├── ApiServer.java        # HTTPServer entry point & route registration
│   │   ├── DatabaseRunner.java   # Isolated SQL execution harness
│   │   ├── TestRunner.java       # Automated QA test runner (56 tests)
│   │   ├── Dao/                  # JDBC Data Access Objects (Hostel, User, Meal, Donation, Waste)
│   │   ├── Handler/              # REST HTTP Handlers (Auth, Hostel, Meal, Donation, Claim, Pickup, Waste, Supervisor)
│   │   ├── Model/                # Core domain entities (User, Hostel, MealRecord, Donation, Claim, Pickup, WasteRecord)
│   │   └── Util/                 # AuthUtil, SessionManager, PasswordUtil, JsonResponseUtil, CorsUtil
│   └── lib/                      # MySQL Connector/J & Gson JARs
├── docs/                         # Comprehensive Documentation Suite
│   ├── ARCHITECTURE.md           # End-to-end architecture & REST API specs
│   ├── SETUP_GUIDE.md            # Windows PowerShell environment setup
│   ├── DEMO_SCRIPT.md            # 5-7 minute presentation script
│   └── VIVA_QUESTIONS.md         # 20 technical viva questions & answers
├── foodloop_production_migration.sql # Additive 98-statement production migration
├── foodloop_production_verify.sql    # 8-suite production verification script
└── README.md                     # Project documentation & overview
```

---

## 👥 The FoodLoop Development Team
Developed by four CSE students at Chitkara University:
- **Mess & Food Waste Management Subsystem**
- **NGO Coordination & Pickup Subsystem**
- **Smart Redistribution & Multithreaded Monitors**
- **UI/UX Architecture, Supervisor Analytics & Security Engineering**

---

## 📜 Project Status & Operational Note
- **Rehearsal & QA Status:** Passed (56/56 Java tests, 51/51 E2E API workflow tests, React build passed).
- **Production Migration Status:** `READY — AWAITING EXPLICIT AUTHORIZATION`. The live `foodloop` database remains strictly untouched until scheduled maintenance window authorization is granted by the server owner.
