-- ============================================================
-- FoodLoop Rehearsal DB — Test Data Cleanup Script
-- Removes ONLY non-demo data created during testing sessions
-- NEVER touches is_demo=1 rows or original demo records
-- ============================================================
USE foodloop_demo_rehearsal;

-- Safety check: confirm correct database
SELECT DATABASE() AS current_db;

-- Remove test waste records (is_demo=0, created during testing)
DELETE FROM waste_records WHERE is_demo = 0;

-- Remove test meal records linked to E2E test sessions (is_demo=0)
DELETE FROM meal_records WHERE is_demo = 0 AND food_name LIKE 'E2E%';

-- Remove test donations with AVAILABLE status (created this session)
-- Only the two we just created: Roti and Dal Makhani
DELETE FROM donations WHERE is_demo = 0 AND food_name IN ('Roti', 'Dal Makhani') AND status = 'AVAILABLE';

-- Summary after cleanup
SELECT 'meal_records' AS tbl, SUM(is_demo=0) AS test_rows, SUM(is_demo=1) AS demo_rows FROM meal_records
UNION ALL
SELECT 'donations', SUM(is_demo=0), SUM(is_demo=1) FROM donations
UNION ALL
SELECT 'waste_records', SUM(is_demo=0), SUM(is_demo=1) FROM waste_records;
