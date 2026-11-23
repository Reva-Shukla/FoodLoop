# FoodLoop — College Presentation Demo Script (5–7 Minutes)

*Target Audience: College Evaluators, Project Guides, and Viva Panel*  
*Theme: "Every Meal Deserves a Destination."*

---

## ⏱️ Timeline Overview

| Timestamp | Phase | Presenter Action | Key Talking Points |
| :--- | :--- | :--- | :--- |
| **0:00 – 1:00** | Landing Page & Mission | Open `http://localhost:3000` | Problem statement, 7 Chitkara messes directory, strict food-safety rules. |
| **1:00 – 2:30** | Mess Manager Portal | Quick Login as Mess Manager | Select Franklin Mess, log meal batch, explain auto-calculated surplus, publish surplus donation. |
| **2:30 – 3:30** | Waste Audit Logging | Discard remaining surplus | Log portion discard with reason ("Overproduction"), show cohort mass-balance. |
| **3:30 – 4:45** | NGO Partner Portal | Quick Login as NGO Partner | Browse available surplus, review food safety details, claim donation, complete pickup. |
| **4:45 – 6:00** | Supervisor Executive Analytics | Quick Login as Admin | Real-time campus KPI cards, all 7 hostel comparison, food conservation formulas, waste breakdown. |
| **6:00 – 7:00** | Technical Architecture & Q&A | Summary Slide / Repo | Decoupled architecture, MySQL row locking, zero data loss, food safety enforcement. |

---

## 🎙️ Step-by-Step Walkthrough

### Part 1: Landing Page & Campus Directory (1 Minute)
1. **Show:** The FoodLoop landing page at `http://localhost:3000`.
2. **Explain:**
   > *"Good morning respected evaluators. Across university campuses, hundreds of wholesome meals are prepared daily in student messes. Due to attendance variations, safe surplus food remains unserved at the end of meal hours. FoodLoop solves this by providing an end-to-end food-safety and redistribution platform for Chitkara University."*
3. **Show:** Scroll to the Campus Dining Directory.
   > *"Notice our campus directory: exactly seven confirmed hostel messes—four Boys' messes (Franklin, Alfred, Magellan, Archimedes) and three Girls' messes (Pi, IBN, Nightingale). Each hostel operates with independent dining cycles and surplus logging."*

### Part 2: Mess Manager — Meal & Surplus Publication (1.5 Minutes)
1. **Action:** Click "Demo Accounts" in sidebar or top bar -> Select **Mess Manager** (`mess@test.com`).
2. **Action:** Navigate to **Record Meal** (`/mess/record-meal`).
3. **Data Input:**
   - Active Hostel: **Franklin Mess**
   - Meal Type: **Lunch**
   - Food Name: **Paneer Butter Masala with Jeera Rice**
   - Food Type: **VEG**
   - Prepared Portions: **200**
   - Served Portions: **160**
4. **Action:** Click "Save Meal Record".
5. **Highlight:**
   > *"Notice that surplus is automatically calculated by our database stored generated column: 200 prepared minus 160 served leaves exactly 40 portions of surplus. The system enforces that served portions can never exceed prepared portions."*
6. **Action:** Click "Publish Donation" on the newly created meal.
   - Portions to Donate: **30** (leaving 10 unallocated)
   - Pickup Location: **Franklin Mess Kitchen Dispatch Area**
   - Safe Pickup Deadline: Select tomorrow or 4 hours from now
   - Storage Conditions: **Heated Insulated Container**
   - Allergens: **Dairy (Paneer)**
   - Check **"I confirm this is unserved, batch-prepared kitchen surplus (no plate leftovers)."**
7. **Highlight:**
   > *"Food safety is non-negotiable in FoodLoop. Only unserved kitchen surplus is eligible. Plate leftovers or table scraps are strictly rejected by both our frontend form and our backend REST API."*

### Part 3: Kitchen Waste Logging & Mass Balance (1 Minute)
1. **Action:** Return to **Meal Allocations** -> Click **Log Waste** for the remaining 10 portions.
   - Portions Discarded: **10**
   - Reason: **Overproduction**
   - Notes: **Surplus buffer expired kitchen holding window**
2. **Action:** Submit and view the Allocation breakdown.
3. **Highlight:**
   > *"Look at the mathematical conservation: 200 prepared = 160 served + 30 donated/reserved + 10 discarded waste. Zero portions remain unaccounted for. This ensures total transparency for university audits."*

### Part 4: NGO Partner — Claim & Pickup (1.5 Minutes)
1. **Action:** Switch role -> Select **Helping Hands NGO** (`ngo@test.com`).
2. **Action:** Navigate to **Available Donations** (`/ngo/available`).
3. **Show:** The newly published Paneer Butter Masala batch appears with real-time countdown.
4. **Highlight:**
   > *"Notice how the NGO sees full food-safety metadata: storage conditions, allergens, and the collection deadline. Notice also that historical demo records are cleanly separated and never appear as active donations."*
5. **Action:** Click **"Claim Donation"**.
6. **Action:** Go to **My Pickups** -> Locate the scheduled pickup.
7. **Action:** Click **"Complete Pickup"**.
8. **Highlight:**
   > *"When the NGO confirms collection on-site, the backend executes an atomic row-locked transaction: the pickup transitions to COMPLETED, and the donation transitions to PICKED_UP. The food is now marked as safely redistributed."*

### Part 5: Campus Supervisor Analytics (1.5 Minutes)
1. **Action:** Switch role -> Select **Campus Supervisor** (`admin@test.com`).
2. **Show:** The **Supervisor Dashboard** (`/supervisor/dashboard`).
3. **Highlight:**
   > *"The supervisor dashboard provides high-level executive oversight. The top KPI cards show Total Prepared, Total Served, Food Donated, and Discarded Waste across the entire campus. Notice our redistribution efficiency rate and food utilization rate."*
4. **Show:** Scroll down to the **Hostel Mess Performance Comparison**.
   > *"Here all seven Chitkara messes are tracked side-by-side using stacked horizontal bars. Evaluators can filter by Boys' Hostels, Girls' Hostels, or specific dates. Furthermore, historical sample demo data is strictly excluded from these campus totals to ensure genuine audit accuracy."*
5. **Show:** Navigate to **Waste Records** (`/supervisor/waste-records`).
   > *"Supervisors can review kitchen discard reasons across messes to identify overproduction trends and optimize future procurement."*

---

## 💡 Quick Tips for the Demo Team
- Keep both PowerShell terminals visible in the background if evaluators want to inspect server logs.
- Highlight that passwords are encrypted using PBKDF2 with 10,000 iterations and cryptographic salts.
- Point out that all data is live in MySQL and persists across browser page reloads.
