-- =============================================================================
-- FoodLoop — Phase 7E Rehearsal Verification Script (READ-ONLY)
-- Target Database: foodloop_rehearsal_sandbox ONLY
-- =============================================================================

USE foodloop_rehearsal_sandbox;

-- -----------------------------------------------------------------------------
-- 0. Sandbox Security Context Check
-- -----------------------------------------------------------------------------
SELECT DATABASE() AS active_database,
       CASE WHEN DATABASE() = 'foodloop_rehearsal_sandbox' THEN 'PASS (Isolated Sandbox)' 
            ELSE 'FATAL ERROR: WRONG DATABASE' END AS isolation_status;

-- -----------------------------------------------------------------------------
-- 1. Table Existence Check (Expected: exactly 7 tables)
-- -----------------------------------------------------------------------------
SELECT TABLE_NAME, ENGINE, TABLE_ROWS, CREATE_TIME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'foodloop_rehearsal_sandbox' 
ORDER BY TABLE_NAME;

-- -----------------------------------------------------------------------------
-- 2. Row Count Preservation Verification (Zero records lost)
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
-- 4. Audit Unfabricated Fields
-- -----------------------------------------------------------------------------
SELECT user_id, role, organization,
       CASE WHEN organization IS NULL THEN 'PASS (Unfabricated)' ELSE 'INSPECT' END AS status
FROM users WHERE user_id = 2;

SELECT pickup_id, claim_id, pickup_date, scheduled_at, completed_at, status,
       CASE WHEN completed_at IS NULL THEN 'PASS (Unfabricated)' ELSE 'INSPECT' END AS status_check
FROM pickups;

SELECT donation_id, food_name, quantity, meal_record_id,
       CASE WHEN meal_record_id IS NULL THEN 'PASS (Unfabricated Standalone Batch)' ELSE 'INSPECT' END AS status_check
FROM donations;

-- -----------------------------------------------------------------------------
-- 5. Foreign Key Constraints & Referential Integrity Check (0 Orphans)
-- -----------------------------------------------------------------------------
SELECT 'Orphaned meal_records (mess_id)' AS check_name, COUNT(*) AS invalid_count,
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM meal_records m LEFT JOIN hostels h ON m.mess_id = h.hostel_id WHERE h.hostel_id IS NULL
UNION ALL
SELECT 'Orphaned donations (mess_id)', COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE h.hostel_id IS NULL
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
-- 6. Mathematical Conservation Formula Verification
-- -----------------------------------------------------------------------------
SELECT 
    (SELECT COALESCE(SUM(prepared), 0) FROM meal_records) AS total_prepared,
    (SELECT COALESCE(SUM(served), 0) FROM meal_records) AS total_served,
    (SELECT COALESCE(SUM(surplus), 0) FROM meal_records) AS total_surplus,
    (SELECT COALESCE(SUM(d.quantity), 0) FROM donations d INNER JOIN pickups p ON d.donation_id = p.donation_id WHERE p.status = 'COMPLETED') AS total_donated_pickups,
    (SELECT COALESCE(SUM(d.quantity), 0) FROM donations d WHERE d.status IN ('AVAILABLE', 'CLAIMED')) AS total_active_reserved,
    (SELECT COALESCE(SUM(portions_discarded), 0) FROM waste_records) AS total_wasted;

-- -----------------------------------------------------------------------------
-- 7. Java DAO Query Compatibility Simulation
-- -----------------------------------------------------------------------------
-- 7a. HostelDAO: getAllHostels()
SELECT hostel_id, name, category, category_label, campus 
FROM hostels 
ORDER BY category, name;

-- 7b. UserDAO: getUser(email) / getAllUsers()
SELECT u.user_id, u.name, u.email, u.role, u.location, u.food_preference, 
       u.assigned_mess_id, h.name AS mess_name, u.organization, u.department 
FROM users u 
LEFT JOIN hostels h ON u.assigned_mess_id = h.hostel_id;

-- 7c. MealRecordDAO: getAllMealRecords()
SELECT m.meal_id, m.mess_id, h.name AS mess_name, m.food_name, m.food_type, 
       m.meal_type, m.prepared, m.served, m.surplus, m.meal_date, m.logged_by, m.created_at 
FROM meal_records m 
LEFT JOIN hostels h ON m.mess_id = h.hostel_id 
ORDER BY m.meal_date DESC, m.created_at DESC;

-- 7d. DonationDAO: getAllDonations()
SELECT d.donation_id, d.meal_record_id, d.mess_id, h.name AS mess_name, 
       d.food_name, d.quantity, d.food_type, d.pickup_location, d.deadline, 
       d.preparation_datetime, d.storage_conditions, d.allergens, d.status, d.created_at 
FROM donations d 
LEFT JOIN hostels h ON d.mess_id = h.hostel_id 
ORDER BY d.created_at DESC;

-- 7e. DonationDAO: getAllClaims()
SELECT c.claim_id, c.donation_id, c.ngo_id, u.name AS ngo_name, d.mess_id, 
       h.name AS mess_name, d.food_name, d.food_type, d.quantity, c.claim_date, 
       c.pickup_deadline, c.pickup_location, c.status 
FROM claims c 
INNER JOIN donations d ON c.donation_id = d.donation_id 
INNER JOIN users u ON c.ngo_id = u.user_id 
LEFT JOIN hostels h ON d.mess_id = h.hostel_id 
ORDER BY c.claim_date DESC;

-- 7f. DonationDAO: getAllPickups()
SELECT p.pickup_id, p.claim_id, p.donation_id, p.ngo_id, u.name AS ngo_name, 
       d.mess_id, h.name AS mess_name, d.food_name, d.food_type, d.quantity, 
       d.pickup_location, p.pickup_deadline, p.pickup_date, p.scheduled_at, 
       p.completed_at, p.status 
FROM pickups p 
INNER JOIN claims c ON p.claim_id = c.claim_id 
INNER JOIN donations d ON p.donation_id = d.donation_id 
INNER JOIN users u ON p.ngo_id = u.user_id 
LEFT JOIN hostels h ON d.mess_id = h.hostel_id 
ORDER BY p.scheduled_at DESC;

-- 7g. WasteRecordDAO: getAllWasteRecords()
SELECT w.waste_id, w.meal_record_id, w.mess_id, h.name AS mess_name, 
       w.food_name, w.food_type, w.portions_discarded, w.reason, w.notes, w.discarded_at 
FROM waste_records w 
LEFT JOIN hostels h ON w.mess_id = h.hostel_id 
ORDER BY w.discarded_at DESC;
