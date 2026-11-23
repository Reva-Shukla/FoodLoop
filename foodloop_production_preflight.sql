-- =============================================================================
-- FoodLoop — Phase 8B.1 Production Preflight Verification Script (STRICTLY READ-ONLY)
-- Target Database: foodloop ONLY
--
-- PURPOSE:
--   Runs comprehensive preflight checks against the live foodloop database
--   BEFORE authorizing migration execution, including database user privileges.
-- =============================================================================

USE foodloop;

-- -----------------------------------------------------------------------------
-- 1. Verify Active Database Context & User Grants
-- -----------------------------------------------------------------------------
SELECT DATABASE() AS current_database,
       CURRENT_USER() AS connected_user,
       VERSION() AS mysql_version,
       @@global.time_zone AS system_tz,
       @@session.time_zone AS session_tz;

SHOW GRANTS FOR CURRENT_USER();

-- -----------------------------------------------------------------------------
-- 2. Verify Exact 5 Baseline Tables Exist
-- -----------------------------------------------------------------------------
SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH, CREATE_TIME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'foodloop' 
ORDER BY TABLE_NAME;

-- -----------------------------------------------------------------------------
-- 3. Verify Exact Baseline Row Counts (28 rows minimum)
-- -----------------------------------------------------------------------------
SELECT 'users' AS table_name, COUNT(*) AS current_rows, 3 AS baseline_expected,
       CASE WHEN COUNT(*) >= 3 THEN 'PASS' ELSE 'FAIL' END AS status FROM users
UNION ALL
SELECT 'meal_records', COUNT(*), 7,
       CASE WHEN COUNT(*) >= 7 THEN 'PASS' ELSE 'FAIL' END FROM meal_records
UNION ALL
SELECT 'donations', COUNT(*), 7,
       CASE WHEN COUNT(*) >= 7 THEN 'PASS' ELSE 'FAIL' END FROM donations
UNION ALL
SELECT 'claims', COUNT(*), 6,
       CASE WHEN COUNT(*) >= 6 THEN 'PASS' ELSE 'FAIL' END FROM claims
UNION ALL
SELECT 'pickups', COUNT(*), 5,
       CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'FAIL' END FROM pickups;

-- -----------------------------------------------------------------------------
-- 4. Audit Existing Foreign Keys and Constraints
-- -----------------------------------------------------------------------------
SELECT CONSTRAINT_NAME, TABLE_NAME, CONSTRAINT_TYPE 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'foodloop' 
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- -----------------------------------------------------------------------------
-- 5. Audit Legacy mess_id Values (Expected: All reference mess_id = 1)
-- -----------------------------------------------------------------------------
SELECT 'meal_records' AS table_name, mess_id, COUNT(*) AS row_count FROM meal_records GROUP BY mess_id
UNION ALL
SELECT 'donations', mess_id, COUNT(*) FROM donations GROUP BY mess_id;

-- -----------------------------------------------------------------------------
-- 6. Audit Donation Deadlines & Current Statuses (Expected: 0 AVAILABLE)
-- -----------------------------------------------------------------------------
SELECT donation_id, food_name, deadline, status,
       CASE WHEN status <> 'AVAILABLE' THEN 'PASS (Safe from Redistribution)' ELSE 'WARN' END AS safety_audit
FROM donations;

-- -----------------------------------------------------------------------------
-- 7. Audit Pickups Linkage to Parent Claims
-- -----------------------------------------------------------------------------
SELECT p.pickup_id, p.claim_id, c.donation_id, c.ngo_id, p.status 
FROM pickups p 
INNER JOIN claims c ON p.claim_id = c.claim_id;

-- =============================================================================
-- END OF SCRIPT: foodloop_production_preflight.sql
-- =============================================================================
