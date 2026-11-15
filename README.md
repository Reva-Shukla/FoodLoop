# FoodLoop – Member 1: Donor Management Module

> **Tagline:** *"Every Meal Deserves a Destination."*  
> **Course / Subject:** Advanced Java Programming & Full-Stack Development  
> **Module Owner:** Member 1 – Donor Management  
> **Team Scope:** 4-Member Collaborative Platform (Donor, NGO/Pickup, Smart Matching, Admin/Impact)

---

## 1. Project Overview

**FoodLoop** is an automated food donation and redistribution platform designed to combat institutional food waste. Surplus unserved food from **restaurants, college messes, student hostels, and commercial caterers** is cataloged by donors and made available to verified NGOs and charity distribution centers.

As **Member 1**, this module delivers the complete **Donor Management Subsystem**:
1. **Donor Registration & Authentication:** Secure onboarding with role classification (Restaurant, College Mess, Hostel, Caterer), cryptographic password hashing (SHA-256 + salt), and session token management.
2. **Donor Dashboard:** Real-time impact metrics (total food redirected, pending matches, accepted pickups, completed distributions, and expired listings).
3. **Food Donation Posting:** Form matching the project UI mockup with food attributes, preparation time, expiry deadline, pickup window, and mandatory unserved surplus certification.
4. **Donation Management & Audit:** Real-time tracking with status transitions (`PENDING`, `ACCEPTED`, `PICKUP_IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `EXPIRED`), inline editing, and cancellation.
5. **Urgency Monitoring (PriorityQueue):** Immediate display of food items closest to expiry.
6. **Donation History & CSV Export:** Historical audit table with search/filtering and CSV reporting via Java File I/O.
7. **Donor Profile & Security:** Business details update and secure password rotation.

---

## 2. Technology Stack & Strict Compliance

| Layer | Technology | Compliance Details |
|---|---|---|
| **Frontend** | React 18.3, JavaScript (ES6+), React Router v6, CSS | Clean natural sustainability theme (Forest Green, Sage, Cream, Saffron). Zero TypeScript. |
| **Backend** | **Core Java (JDK 17+)** | Built using **`com.sun.net.httpserver.HttpServer`**. **NO Spring Boot, NO Spring Framework, NO Node.js backend.** |
| **Database** | **MySQL (`foodloop_db`) & JDBC** | Safe queries via **`PreparedStatement`**, ACID transactions (`setAutoCommit(false)`), and resilient fallback storage. |
| **Concurrency** | **Java Multithreading & Synchronization** | **`ScheduledExecutorService`** for automated background expiry monitoring; **`ExecutorService`** thread pool for HTTP requests; **`ReentrantLock`** for thread-safe state transitions. |
| **OOP** | **Core Java OOP Principles** | Abstract classes, inheritance, polymorphism (overloading & overriding), interfaces, collections, lambdas, and stream API. |

---

## 3. Java Syllabus Demonstration Matrix

This module was intentionally architected to demonstrate academic Java syllabus concepts:

| Syllabus Concept | Exact Class / Interface | Implementation Details |
|---|---|---|
| **Classes & Objects** | `Donation.java`, `FoodItem.java`, `DonorStats.java` | Rich domain entities encapsulating business rules, timestamps, and validation methods. |
| **Inheritance** | `User.java` (Parent) <br> `Donor.java` (Child) <br> `NGO.java` (Child) | Abstract `User` base class inherited by `Donor` (Member 1) and `NGO` (Member 2 ready). |
| **Polymorphism (Method Overriding)** | `Donor.java`, `NGO.java` | Overrides `getRole()`, `getDisplayName()`, `toProfileMap()`, and `toString()`. |
| **Polymorphism (Method Overloading)** | `DonationService.java` | 3 distinct overloaded versions of `searchDonations()`: <br> 1. `searchDonations(donorId, keyword)` <br> 2. `searchDonations(donorId, keyword, status)` <br> 3. `searchDonations(donorId, keyword, status, sortBy)` |
| **Abstraction** | `User.java`, `AbstractDAO.java`, `BaseHttpHandler.java` | Abstract methods enforcing contract compliance and eliminating redundant boilerplate. |
| **Interfaces** | `Authenticatable.java`, `DonationOperations.java`, `Reportable.java`, `GenericDAO.java` | Decoupled contracts implemented by service and model layers. |
| **Collections: ArrayList** | `DonationDAO.java`, `DonationService.java` | Maintains dynamic lists of food donations for processing and serialization. |
| **Collections: HashMap** | `DonorDAO.java`, `DonationDAO.java`, `AuthService.java` | Caches sessions, maps entities by ID, and groups donations by status. |
| **Collections: PriorityQueue** | `DonationService.java` (`getExpiringSoonDonations`) | Employs `PriorityQueue<Donation>` utilizing `Donation.compareTo` to prioritize items closest to expiry. |
| **Lambdas & Stream API** | `DonationService.java`, `DonorController.java` | Filtering (`.filter(...)`), sorting (`.sorted(Comparator...)`), summing total food quantity (`.mapToDouble(Donation::getQuantity).sum()`), and counting statuses. |
| **Generics** | `GenericDAO<T, ID>.java`, `AbstractDAO<T, ID>.java` | Type-safe, reusable data access object pattern handling any persistent model entity. |
| **Exception Handling** | `FoodLoopException.java`, `InvalidDonorException.java`, `DuplicateEmailException.java`, `InvalidDonationException.java`, `DonationNotFoundException.java` | Comprehensive custom exception hierarchy mapped directly to appropriate HTTP status codes (400, 401, 403, 404, 409, 500). |
| **Multithreading** | `ExpiryMonitorService.java` | Background recurring daemon thread running via `ScheduledExecutorService` checking for expired donations every 30 seconds. |
| **Thread Safety** | `DonationDAO.java` (`updateStatusWithThreadSafety`) | Fine-grained `ReentrantLock` per donation ID and conditional SQL updates preventing concurrent double-claiming. |
| **File Handling & I/O** | `DonationService.java` (`generateCsvReport`) | Dynamically generates structured CSV reports for audit download via `/api/donations/export`. |
| **JDBC & SQL Security** | `UserDAO.java`, `DonorDAO.java`, `DonationDAO.java` | Parameterized SQL queries using `PreparedStatement` to prevent SQL injection and manage transactional rollbacks. |

---

## 4. Directory Structure

```
FoodLoop/
│
├── start-all.bat                    <-- 1-Click launcher for both backend & frontend
├── README.md                        <-- System documentation & team guide
│
├── database/
│   └── foodloop.sql                 <-- MySQL schema, tables, indexes & seed data
│
├── backend/
│   ├── build.bat                    <-- Compiles Java sources with javac
│   ├── run.bat                      <-- Starts Core Java server on :8080
│   ├── run.ps1                      <-- PowerShell runner
│   ├── lib/
│   │   └── mysql-connector-j-8.4.0.jar <-- Official MySQL JDBC driver
│   ├── bin/                         <-- Compiled .class bytecode
│   └── src/
│       └── com/foodloop/
│           ├── Main.java            <-- Application bootstrap & HTTP thread pool
│           ├── model/
│           │   ├── User.java        <-- Abstract parent user
│           │   ├── Donor.java       <-- Donor model (extends User)
│           │   ├── NGO.java         <-- NGO model (extends User, Member 2 ready)
│           │   ├── Donation.java    <-- Implements Comparable<Donation>
│           │   ├── FoodItem.java    <-- Domain food attributes
│           │   ├── DonorStats.java  <-- Computed KPI counters
│           │   ├── DonationStatus.java (Enum)
│           │   ├── DonorType.java      (Enum)
│           │   ├── FoodType.java       (Enum)
│           │   └── FoodCategory.java   (Enum)
│           ├── interfaces/
│           │   ├── Authenticatable.java
│           │   ├── DonationOperations.java
│           │   ├── Reportable.java
│           │   └── GenericDAO.java
│           ├── exceptions/
│           │   ├── FoodLoopException.java
│           │   ├── InvalidDonorException.java
│           │   ├── DuplicateEmailException.java
│           │   ├── InvalidDonationException.java
│           │   ├── DonationNotFoundException.java
│           │   ├── DatabaseOperationException.java
│           │   ├── AuthenticationException.java
│           │   └── UnauthorizedActionException.java
│           ├── database/
│           │   └── DatabaseConnection.java <-- JDBC Singleton & auto-fallback
│           ├── dao/
│           │   ├── AbstractDAO.java
│           │   ├── UserDAO.java
│           │   ├── DonorDAO.java
│           │   └── DonationDAO.java
│           ├── service/
│           │   ├── AuthService.java
│           │   ├── DonorService.java
│           │   ├── DonationService.java
│           │   └── ExpiryMonitorService.java <-- Multithreaded background worker
│           ├── controller/
│           │   ├── BaseHttpHandler.java     <-- CORS & JSON abstraction
│           │   ├── AuthController.java
│           │   ├── DonorController.java
│           │   ├── DonationController.java
│           │   └── IntegrationController.java <-- Member 2 NGO claiming API
│           └── util/
│               ├── SimpleJson.java          <-- Pure Java JSON parser & serializer
│               ├── PasswordHasher.java      <-- SHA-256 + salt security
│               └── ValidationUtil.java
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── StatusBadge.jsx
        │   ├── Toast.jsx
        │   ├── DonationDetailModal.jsx
        │   └── EditDonationModal.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── AddDonation.jsx       <-- Matches reference UI mockup & history table
            ├── ManageDonations.jsx
            ├── DonationHistory.jsx
            └── DonorProfile.jsx
```

---

## 5. Database Setup (MySQL)

1. Open **MySQL Workbench** or your MySQL command line client.
2. Execute the script located at `database/foodloop.sql`:
   ```sql
   source /path/to/FoodLoop/database/foodloop.sql;
   ```
3. The script creates:
   - Database: `foodloop_db`
   - Tables: `users`, `donors`, `ngos`, `donations`, `donation_audit_log`
   - Foreign key constraints, unique email indices, and sample donors & donations.

> **Resilient Lab Mode:** If MySQL is not running on the evaluator's machine, `DatabaseConnection.java` detects this gracefully and automatically activates the in-memory fallback store with full pre-loaded sample data. The application will never crash during evaluation!

---

## 6. Execution Steps

### Option A: One-Click Launch (Windows)
Double-click `FoodLoop/start-all.bat`. This automatically opens two command windows:
1. Backend on `http://localhost:8080`
2. Frontend on `http://localhost:3000`

### Option B: Manual Terminal Execution

#### 1. Start the Java Backend:
```powershell
cd FoodLoop/backend
.\run.bat
```
*(Or manually: `javac -encoding UTF-8 -cp "lib/*" -d bin (Get-ChildItem -Recurse -Filter "*.java").FullName` followed by `java -cp "bin;lib/*" com.foodloop.Main 8080`)*

#### 2. Start the React Frontend:
```powershell
cd FoodLoop/frontend
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 7. Pre-Configured Test Credentials

For quick evaluation during college lab demonstrations, 1-click test login buttons are integrated directly on the Login page:

| Business Name | Donor Type | Email | Password |
|---|---|---|---|
| **Green Bowl Restaurant** | Restaurant | `rajesh@greenbowl.com` | `Password123!` |
| **Sunrise Hostel & Mess** | College Mess | `ananya@sunrisemess.edu` | `Password123!` |
| **Royal Feast Caterers** | Caterer | `vikram@royalfeast.com` | `Password123!` |

---

## 8. Team Integration Guide (Members 2, 3 & 4)

To ensure seamless integration with the other 3 team members, Member 1 has provided clean, documented endpoints and shared database tables:

### A. Member 2: NGO and Pickup Management
Member 2's module can query available surplus food and trigger atomic claims:
- **`GET /api/integration/donations/available`**: Retrieves all `PENDING` unexpired donations sorted by expiry date ascending.
- **`POST /api/integration/donations/{id}/claim`**: Claims a donation atomically using thread-safe locking.
  ```json
  {
    "ngoId": 1,
    "ngoName": "Anna Kshetra Foundation",
    "ngoPhone": "+91 98111 22334"
  }
  ```
  Transitions donation status to `ACCEPTED` and logs the event in `donation_audit_log`.

### B. Member 3: Smart Matching Algorithm
- Can inspect the `donations` and `donors` tables directly.
- The `category`, `food_type`, `quantity`, `pickup_address`, and `expiry_datetime` fields are standardized for matching against NGO demand profiles.

### C. Member 4: Admin & Platform Analytics
- Can aggregate platform metrics from `donations` (status distribution, total kilograms/plates saved, donor contribution leaderboards).
- Can inspect `donation_audit_log` to monitor background thread activity and status changes.
