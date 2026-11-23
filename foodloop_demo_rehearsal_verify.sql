-- =============================================================================
-- FoodLoop — Phase 8B.1 Production Verification Script (STRICTLY READ-ONLY)
-- Target Database: foodloop_demo_rehearsal ONLY
--
-- This script performs complete non-destructive validation of the production
-- schema, row preservation, foreign keys, demo data isolation, and application query contracts.
-- =============================================================================

USE foodloop_demo_rehearsal;

-- -----------------------------------------------------------------------------
-- 0. Database Context & Safety Check
-- -----------------------------------------------------------------------------
SELECT DATABASE() AS active_database,
       CASE WHEN DATABASE() = 'foodloop_demo_rehearsal' THEN 'PASS (Production Database)' 
            ELSE 'FATAL ERROR: WRONG DATABASE' END AS context_status;

-- -----------------------------------------------------------------------------
-- 1. Table Existence Check (Expected: exactly 7 tables)
-- -----------------------------------------------------------------------------
SELECT TABLE_NAME, ENGINE, TABLE_ROWS, CREATE_TIME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'foodloop_demo_rehearsal' 
ORDER BY TABLE_NAME;

-- -----------------------------------------------------------------------------
-- 2. Row Count Preservation Verification (Zero records lost, baseline >= 28)
-- -----------------------------------------------------------------------------
SELECT 'users' AS table_name, COUNT(*) AS live_count, '>= 3' AS expected,
       CASE WHEN COUNT(*) >= 3 THEN 'PASS' ELSE 'FAIL' END AS status FROM users
UNION ALL
SELECT 'meal_records', COUNT(*), '>= 7',
       CASE WHEN COUNT(*) >= 7 THEN 'PASS' ELSE 'FAIL' END FROM meal_records
UNION ALL
SELECT 'donations', COUNT(*), '>= 7',
       CASE WHEN COUNT(*) >= 7 THEN 'PASS' ELSE 'FAIL' END FROM donations
UNION ALL
SELECT 'claims', COUNT(*), '>= 6',
       CASE WHEN COUNT(*) >= 6 THEN 'PASS' ELSE 'FAIL' END FROM claims
UNION ALL
SELECT 'pickups', COUNT(*), '>= 5',
       CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'FAIL' END FROM pickups
UNION ALL
SELECT 'hostels', COUNT(*), '= 7',
       CASE WHEN COUNT(*) = 7 THEN 'PASS' ELSE 'FAIL' END FROM hostels
UNION ALL
SELECT 'waste_records', COUNT(*), '>= 0',
       CASE WHEN COUNT(*) >= 0 THEN 'PASS' ELSE 'FAIL' END FROM waste_records;

-- -----------------------------------------------------------------------------
-- 3. Verify Chitkara Campus Hostels (Expected: exactly 7 confirmed messes)
-- -----------------------------------------------------------------------------
SELECT hostel_id, name, category, category_label, campus 
FROM hostels 
ORDER BY category, name;

-- -----------------------------------------------------------------------------
-- 4. Audit Demo Data Isolation & Non-Fabrication
-- -----------------------------------------------------------------------------
-- 4a. User 1: Demo Mess Manager with no forced hostel assignment
SELECT user_id, name, role, is_demo, assigned_mess_id,
       CASE WHEN is_demo = 1 AND assigned_mess_id IS NULL THEN 'PASS (Demo Isolated)' ELSE 'FAIL' END AS demo_status
FROM users WHERE user_id = 1;

-- 4b. User 2: NGO organization remains NULL (no synthetic company names)
SELECT user_id, name, role, organization,
       CASE WHEN organization IS NULL THEN 'PASS (Unfabricated)' ELSE 'INSPECT' END AS org_status
FROM users WHERE user_id = 2;

-- 4c. Meal Records Demo Isolation: exactly 7 demo records with mess_id = NULL
SELECT meal_id, food_name, is_demo, mess_id, prepared, served, surplus,
       CASE WHEN is_demo = 1 AND mess_id IS NULL THEN 'PASS (Demo Isolated)' ELSE 'FAIL' END AS demo_status
FROM meal_records
WHERE is_demo = 1;

-- 4d. Donations Demo Isolation & Food Safety Check
SELECT donation_id, food_name, is_demo, mess_id, status, legacy_deadline, deadline,
       CASE WHEN is_demo = 1 AND mess_id IS NULL THEN 'PASS (Demo Isolated)' ELSE 'FAIL' END AS demo_status,
       CASE WHEN status IN ('PICKED_UP', 'CLAIMED', 'EXPIRED') THEN 'PASS (Non-Redistributable)' ELSE 'FAIL' END AS safety_check,
       CASE WHEN legacy_deadline IS NOT NULL THEN 'PASS (Legacy String Preserved)' ELSE 'FAIL' END AS legacy_deadline_check
FROM donations
WHERE is_demo = 1;

-- 4e. Historical pickups timestamps must remain NULL (no fabricated dates)
SELECT pickup_id, claim_id, pickup_date, scheduled_at, completed_at, status,
       CASE WHEN completed_at IS NULL AND scheduled_at IS NULL THEN 'PASS (Unfabricated)' ELSE 'INSPECT' END AS timestamp_check
FROM pickups;

-- -----------------------------------------------------------------------------
-- 5. Foreign Key Constraints & Referential Integrity Check (0 Orphans)
-- -----------------------------------------------------------------------------
SELECT 'Orphaned meal_records (mess_id)' AS check_name, COUNT(*) AS invalid_count,
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM meal_records m LEFT JOIN hostels h ON m.mess_id = h.hostel_id WHERE m.mess_id IS NOT NULL AND h.hostel_id IS NULL
UNION ALL
SELECT 'Orphaned donations (mess_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE d.mess_id IS NOT NULL AND h.hostel_id IS NULL
UNION ALL
SELECT 'Orphaned donations (meal_record_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM donations d LEFT JOIN meal_records m ON d.meal_record_id = m.meal_id 
WHERE d.meal_record_id IS NOT NULL AND m.meal_id IS NULL
UNION ALL
SELECT 'Orphaned claims (donation_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM claims c LEFT JOIN donations d ON c.donation_id = d.donation_id WHERE d.donation_id IS NULL
UNION ALL
SELECT 'Orphaned claims (ngo_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM claims c LEFT JOIN users u ON c.ngo_id = u.user_id WHERE u.user_id IS NULL
UNION ALL
SELECT 'Orphaned pickups (claim_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM pickups p LEFT JOIN claims c ON p.claim_id = c.claim_id WHERE c.claim_id IS NULL
UNION ALL
SELECT 'Orphaned pickups (donation_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM pickups p LEFT JOIN donations d ON p.donation_id = d.donation_id WHERE d.donation_id IS NULL
UNION ALL
SELECT 'Orphaned pickups (ngo_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM pickups p LEFT JOIN users u ON p.ngo_id = u.user_id WHERE u.user_id IS NULL
UNION ALL
SELECT 'Orphaned waste_records (mess_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM waste_records w LEFT JOIN hostels h ON w.mess_id = h.hostel_id WHERE h.hostel_id IS NULL
UNION ALL
SELECT 'Orphaned users (assigned_mess_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM users u LEFT JOIN hostels h ON u.assigned_mess_id = h.hostel_id 
WHERE u.assigned_mess_id IS NOT NULL AND h.hostel_id IS NULL;

-- -----------------------------------------------------------------------------
-- 6. Cross-Database Foreign Key Isolation Check (Must be 0 cross-DB refs)
-- -----------------------------------------------------------------------------
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME, 
    COLUMN_NAME, 
    REFERENCED_TABLE_SCHEMA, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME,
    CASE WHEN REFERENCED_TABLE_SCHEMA = 'foodloop_demo_rehearsal' THEN 'PASS' ELSE 'FATAL FAIL' END AS isolation_check
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'foodloop_demo_rehearsal' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 7. Analytics Isolation: Verify Demo Records Do NOT Inflate Campus Hostels
-- -----------------------------------------------------------------------------
SELECT h.hostel_id, h.name,
       COUNT(m.meal_id) AS meal_count,
       COALESCE(SUM(m.prepared), 0) AS total_prepared,
       COALESCE(SUM(m.served), 0) AS total_served,
       COALESCE(SUM(m.surplus), 0) AS total_surplus
FROM hostels h
LEFT JOIN meal_records m ON h.hostel_id = m.mess_id AND m.is_demo = FALSE
GROUP BY h.hostel_id, h.name
ORDER BY h.category, h.name;

-- -----------------------------------------------------------------------------
-- 8. Java DAO Query Compatibility Verification
-- -----------------------------------------------------------------------------
-- 8a. HostelDAO: getAllHostels()
SELECT hostel_id, name, category, category_label, campus 
FROM hostels 
ORDER BY category, name;

-- 8b. UserDAO: getUser(email) / getAllUsers()
SELECT u.user_id, u.name, u.email, u.role, u.location, u.food_preference, 
       u.assigned_mess_id, h.name AS mess_name, u.organization, u.department, u.is_demo 
FROM users u 
LEFT JOIN hostels h ON u.assigned_mess_id = h.hostel_id;

-- 8c. MealRecordDAO: getAllMealRecords()
SELECT m.meal_id, m.mess_id, h.name AS mess_name, m.food_name, m.food_type, 
       m.meal_type, m.prepared, m.served, m.surplus, m.meal_date, m.logged_by, m.is_demo, m.created_at 
FROM meal_records m 
LEFT JOIN hostels h ON m.mess_id = h.hostel_id 
ORDER BY m.meal_date DESC, m.created_at DESC;

-- 8d. DonationDAO: getAllDonations()
SELECT d.donation_id, d.meal_record_id, d.mess_id, h.name AS mess_name, 
       d.food_name, d.quantity, d.food_type, d.pickup_location, d.deadline, 
       d.preparation_datetime, d.storage_conditions, d.allergens, d.status, d.is_demo, d.created_at 
FROM donations d 
LEFT JOIN hostels h ON d.mess_id = h.hostel_id 
ORDER BY d.created_at DESC;

-- =============================================================================
-- END OF SCRIPT: foodloop_demo_rehearsal_verify.sql
-- =============================================================================
