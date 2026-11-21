# FoodLoop Frontend — Campus Food Redistribution Platform

**Tagline:** Every Meal Deserves a Destination.  
**Initial Pilot:** Chitkara University, Punjab (Rajpura Campus).

---

## Architecture & Implementation Overview

FoodLoop is built as a single, interconnected React application serving three role-based portals:
1. **Mess Manager Portal (`MESS`)** — Track food production, log meal batches, calculate real-time surplus, create donations, and record kitchen waste.
2. **NGO Partner Portal (`NGO`)** — Discover available surplus batches across all 7 campus dining halls, receive smart batch recommendations, claim full batches, and confirm collection.
3. **Campus Supervisor Portal (`ADMIN`)** — High-level campus analytics and sustainability monitoring (Phase 5).

### Core Principles
- **Say Less, Show More:** Premium editorial design paired with modern web application ergonomics.
- **Portion-Standardized:** All food metrics across every portal are measured exclusively in integer **portions** (servings).
- **Strict Dietary Standards:** Exclusively `VEG` (Veg) and `NON_VEG` (Non-Veg), aligned with the Java backend model.
- **Single Source of Truth:** Shared service (`foodLoopService.js`), context (`FoodLoopContext.jsx`), and persistent browser storage (`storage.js`).

---

## Connected Redistribution Lifecycle

The frontend implements a unified, multi-party state machine:

```
[ Meal Recorded in Mess ]
       │
       ▼ (Surplus = Prepared − Served)
[ Donation Created ] ── status: AVAILABLE ──────────────────────────────┐
       │                                                                 │
       ▼ (NGO Claims Batch)                                              │ (Deadline passes)
[ Donation Claimed ] ── status: CLAIMED; Pickup: SCHEDULED ───┐          │
       │                                                      │          │
       ▼ (NGO Arrives & Confirms Handover)                    ▼          ▼
[ Pickup Completed ] ── status: PICKED_UP; Pickup: COMPLETED  [ EXPIRED / MISSED ]
       │                                                      (Reservation Released)
       ▼
(Donated portions reflected in Mess Manager metrics)
```

---

## Mathematical Formulation & Allocation Integrity

### 1. Per-Batch Meal Allocation Formulas
$$\text{Surplus} = \text{Prepared} - \text{Served}$$
$$\text{Remaining Surplus} = \text{Surplus} - \text{Donated (Picked Up)} - \text{Wasted (Discarded)}$$
$$\text{Active Reserved} = \sum \text{Donations}(\text{Status} \in \{\text{AVAILABLE}, \text{CLAIMED}\})$$
$$\text{Unallocated Surplus} = \text{Remaining Surplus} - \text{Active Reserved}$$

### 2. State Transition Rules
- **Donation Creation:** Allowed only if $\text{Donation Quantity} \le \text{Unallocated Surplus}$.
- **Waste Recording:** Discards can only draw from unallocated surplus. Active donation reservations cannot be discarded.
- **Prior to Collection Handover:** A claimed batch remains an **Active Reservation** ($\text{Donated} = 0$).
- **Upon Handover Completion:** Handover transitions status to `PICKED_UP`. Active reservation is released ($\text{Reserved} = 0$) and permanently added to $\text{Donated}$.

---

## Confirmed Campus Directory (7 Dining Halls)

### Boys' Hostel Messes
1. **Franklin Mess** (`mess-b-franklin`)
2. **Alfred Mess** (`mess-b-alfred`)
3. **Magellan Mess** (`mess-b-magellan`)
4. **Archimedes Mess** (`mess-b-archimedes`)

### Girls' Hostel Messes
1. **Pi Mess** (`mess-g-pi`)
2. **IBN Mess** (`mess-g-ibn`)
3. **Nightingale Mess** (`mess-g-nightingale`)

---

## Researched Regional Redistribution Organisations

*Academic & project reference entities operating in the Punjab / Chandigarh Tricity region:*

1. **Robin Hood Army (Chandigarh Tricity & Patiala Chapters)**
   - Portal: [robinhoodarmy.com](https://robinhoodarmy.com)
   - Focus: Volunteer-driven surplus cooked food recovery.
2. **Feeding India by Zomato (Chandigarh / Tricity Network)**
   - Portal: [feedingindia.org](https://www.feedingindia.org)
   - Focus: Large-batch institutional food recovery.
3. **FSSAI Indian Food Sharing Alliance (IFSA)**
   - Portal: [sharefood.eatrightindia.gov.in](https://sharefood.eatrightindia.gov.in)
   - Focus: Apex government surplus food recovery and FoSTaC safety standards.
4. **Community Langar Seva Initiatives (Rajpura & Patiala District)**
   - Traditional zero-waste community kitchens offering hot meals daily.

*Notice: These entities are researched external reference organizations for academic and design purposes; no formal partnership or authentication is claimed.*

---

## Future Enhancements (Deferred to Next Evaluation)

Following coordination with the Java backend developer, the following verification features have been deliberately postponed to keep the current evaluation scope focused and aligned with existing backend capabilities:

1. **QR-Based Donation Passes:** Dynamic visual QR-code generation encoding verified batch and mess provenance.
2. **Unique Pickup Verification Codes:** Auto-generation and two-factor code entry (`FL-XX-XXX`) during handover.
3. **Server-Side Handover Verification Service:** Cryptographic token exchange between Mess Manager and NGO devices.
4. **Camera-Based Mobile Scanning:** Direct in-app camera scanner for volunteer verification upon arrival.

*Current collection confirmation uses standard direct handover verification compatible with the existing Java backend.*

---

## Tech Stack
- **React 18** (Vite build tool)
- **React Router v6**
- **Lucide React** (icons)
- **Vanilla CSS3** (Custom design tokens & Harvest & Hope palette)
