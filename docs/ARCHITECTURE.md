# FoodLoop — System Architecture & API Documentation

## 1. High-Level Architecture Overview

FoodLoop is designed around a decoupled, three-tier architecture that prioritizes food safety, concurrency control, and mathematical conservation of dining surplus.

```mermaid
flowchart TD
    subgraph Client_Tier["Client Tier (React 18 SPA)"]
        UI_MESS["Mess Manager Portal (/mess/*)"]
        UI_NGO["NGO Partner Portal (/ngo/*)"]
        UI_ADMIN["Supervisor Analytics (/supervisor/*)"]
        CTX_AUTH["AuthContext (Session & Role RBAC)"]
        CTX_DATA["FoodLoopContext (Data Synchronization)"]
    end

    subgraph API_Tier["Application Tier (Java HTTPServer REST API)"]
        PROXY["Vite Dev/Prod Reverse Proxy (/api -> :8089)"]
        ROUTER["ApiServer (Route Dispatcher)"]
        SEC_FILTER["AuthUtil & SessionManager (RBAC & CSRF Guard)"]
        
        H_AUTH["AuthHandler (/api/auth)"]
        H_HOSTEL["HostelHandler (/api/hostels)"]
        H_MEAL["MealRecordHandler (/api/meals)"]
        H_DON["DonationHandler (/api/donations)"]
        H_CLAIM["ClaimHandler (/api/claims)"]
        H_PICKUP["PickupHandler (/api/pickups)"]
        H_WASTE["WasteRecordHandler (/api/waste)"]
        H_SUPERVISOR["SupervisorHandler (/api/supervisor)"]
    end

    subgraph Data_Tier["Persistence Tier (MySQL 8.0 InnoDB)"]
        DAO_HOSTEL["HostelDAO"]
        DAO_USER["UserDAO"]
        DAO_MEAL["MealRecordDAO"]
        DAO_DON["DonationDAO"]
        DAO_WASTE["WasteRecordDAO"]
        
        DB[("MySQL 8.0 Engine\n(utf8mb4, Row Locking,\nGenerated Columns, FKs)")]
    end

    UI_MESS --> PROXY
    UI_NGO --> PROXY
    UI_ADMIN --> PROXY
    PROXY --> ROUTER
    ROUTER --> SEC_FILTER
    SEC_FILTER --> H_AUTH
    SEC_FILTER --> H_HOSTEL
    SEC_FILTER --> H_MEAL
    SEC_FILTER --> H_DON
    SEC_FILTER --> H_CLAIM
    SEC_FILTER --> H_PICKUP
    SEC_FILTER --> H_WASTE
    SEC_FILTER --> H_SUPERVISOR

    H_HOSTEL --> DAO_HOSTEL
    H_AUTH --> DAO_USER
    H_MEAL --> DAO_MEAL
    H_DON --> DAO_DON
    H_CLAIM --> DAO_DON
    H_PICKUP --> DAO_DON
    H_WASTE --> DAO_WASTE
    H_SUPERVISOR --> DAO_HOSTEL
    H_SUPERVISOR --> DAO_MEAL
    H_SUPERVISOR --> DAO_DON
    H_SUPERVISOR --> DAO_WASTE

    DAO_HOSTEL --> DB
    DAO_USER --> DB
    DAO_MEAL --> DB
    DAO_DON --> DB
    DAO_WASTE --> DB
```

---

## 2. Seven-Table Database Schema

FoodLoop's target schema enforces referential integrity, time-temperature metadata, and strict sample/demo data separation:

```mermaid
erDiagram
    hostels ||--o{ users : "assigned_mess_id"
    hostels ||--o{ meal_records : "mess_id"
    hostels ||--o{ donations : "mess_id"
    hostels ||--o{ waste_records : "mess_id"
    meal_records ||--o{ donations : "meal_record_id"
    meal_records ||--o{ waste_records : "meal_record_id"
    users ||--o{ claims : "ngo_id"
    donations ||--o{ claims : "donation_id"
    claims ||--o| pickups : "claim_id"
    donations ||--o{ pickups : "donation_id"
    users ||--o{ pickups : "ngo_id"

    hostels {
        varchar hostel_id PK
        varchar name
        enum category "BOYS, GIRLS"
        varchar category_label
        varchar campus
    }
    users {
        int user_id PK
        varchar name
        varchar email UK
        varchar password
        enum role "MESS, NGO, ADMIN"
        varchar assigned_mess_id FK
        varchar organization
        varchar department
        boolean is_demo
        timestamp created_at
    }
    meal_records {
        int meal_id PK
        varchar mess_id FK
        varchar food_name
        enum food_type "VEG, NON_VEG"
        varchar meal_type
        int prepared
        int served
        int surplus "STORED GENERATED (prepared - served)"
        date meal_date
        varchar logged_by
        boolean is_demo
        timestamp created_at
    }
    donations {
        int donation_id PK
        int meal_record_id FK
        varchar mess_id FK
        varchar food_name
        int quantity
        enum food_type "VEG, NON_VEG"
        varchar pickup_location
        datetime deadline
        datetime preparation_datetime
        varchar storage_conditions
        varchar allergens
        varchar legacy_deadline
        enum status "AVAILABLE, CLAIMED, PICKED_UP, EXPIRED"
        boolean is_demo
        timestamp created_at
    }
    claims {
        int claim_id PK
        int donation_id FK
        int ngo_id FK
        datetime claim_date
        datetime pickup_deadline
        varchar pickup_location
        enum status "PENDING, APPROVED, REJECTED, ACTIVE, COMPLETED, EXPIRED"
    }
    pickups {
        int pickup_id PK
        int claim_id FK
        int donation_id FK
        int ngo_id FK
        datetime pickup_deadline
        varchar pickup_location
        datetime scheduled_at
        datetime completed_at
        enum status "SCHEDULED, COMPLETED, MISSED"
    }
    waste_records {
        int waste_id PK
        int meal_record_id FK
        varchar mess_id FK
        varchar food_name
        enum food_type "VEG, NON_VEG"
        int portions_discarded
        varchar reason
        text notes
        boolean is_demo
        timestamp discarded_at
    }
```

---

## 3. Mathematical Food Conservation Model

Every meal cohort in FoodLoop follows strict mass conservation:

$$\text{Surplus} = \max(0, \text{Prepared} - \text{Served})$$

$$\text{Surplus} = \text{Donated (Completed Pickups)} + \text{Active / Claimed Reserved} + \text{Wasted (Discard Logs)} + \text{Unallocated Remaining}$$

- **Zero Over-Allocation:** When publishing a donation, the transactional query checks:
  $$\text{New Donation Portions} \le \text{Surplus} - \sum \text{Allocated Donations} - \sum \text{Discarded Waste}$$
  If the requested volume exceeds unallocated surplus, the transaction rolls back with `HTTP 400 ValidationException`.

---

## 4. REST API Endpoint Specification

### Authentication & Sessions (`/api/auth`)
- `POST /api/auth/login`: Authenticates user with PBKDF2 / SHA-256 password hash; issues session token via HttpOnly cookie and JSON Bearer token.
- `GET /api/auth/me`: Validates session token and returns sanitized user profile.
- `POST /api/auth/logout`: Invalidates session token on server and clears cookie.

### Campus Directory (`/api/hostels`)
- `GET /api/hostels`: Returns public directory of all 7 Chitkara messes (Franklin, Alfred, Magellan, Archimedes, Pi, IBN, Nightingale).

### Meal Management (`/api/meals`)
- `GET /api/meals`: Lists meal records (scoped to assigned mess for `MESS` role; all meals for `ADMIN`).
- `POST /api/meals`: Logs a new meal batch with prepared and served quantities; surplus is auto-generated by the database.
- `GET /api/meals/{id}/allocations`: Returns full cohort mass-balance metrics (surplus, donated, reserved, wasted, unallocated).

### Surplus Donations (`/api/donations`)
- `GET /api/donations`: Lists all donation records.
- `GET /api/donations/available`: Returns unexpired available surplus donations (`status = 'AVAILABLE'`, `deadline > NOW()`, `is_demo = FALSE`).
- `POST /api/donations`: Publishes a verified unserved surplus batch with future deadline and allergen disclosures.
- `POST /api/donations/{id}/claim`: (`NGO` only) Atomically locks row (`SELECT FOR UPDATE`), verifies `is_demo = FALSE`, transitions status to `CLAIMED`, and generates scheduled pickup.

### Pickups (`/api/pickups`)
- `GET /api/pickups`: Lists scheduled and completed pickups.
- `POST /api/pickups/{id}/complete`: (`NGO` only) Confirms physical collection on-site; atomically transitions pickup to `COMPLETED` and donation to `PICKED_UP`.

### Waste Audit (`/api/waste`)
- `GET /api/waste`: Retrieves discarded food logs with reason categorization.
- `POST /api/waste`: (`MESS` only) Logs discarded kitchen surplus with audit reason (e.g. Overproduction, Expired, Quality Reject).

### Supervisor Analytics (`/api/supervisor`)
- `GET /api/supervisor/metrics`: Returns campus-wide dining totals (prepared, served, surplus, donated, wasted) excluding sample/demo records.
- `GET /api/supervisor/hostel-comparison`: Returns stacked performance metrics across all 7 Chitkara hostel messes.
- `GET /api/supervisor/waste-breakdown`: Aggregates kitchen waste by discard reason.
