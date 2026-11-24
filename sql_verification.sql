-- ===================================================
-- FoodLoop SQL Verification Suite (rehearsal DB only)
-- ===================================================
USE foodloop_demo_rehearsal;

-- 1. Confirm database identity
SELECT DATABASE() AS db_name;

-- 2. Table existence
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'foodloop_demo_rehearsal'
ORDER BY table_name;

-- 3. Row counts (baseline sanity)
SELECT 'users'       AS tbl, COUNT(*) AS rows FROM users       UNION ALL
SELECT 'donations',          COUNT(*) FROM donations            UNION ALL
SELECT 'claims',             COUNT(*) FROM claims               UNION ALL
SELECT 'pickups',            COUNT(*) FROM pickups              UNION ALL
SELECT 'meal_records',       COUNT(*) FROM meal_records         UNION ALL
SELECT 'wastage_records',    COUNT(*) FROM wastage_records      ORDER BY tbl;

-- 4. User role distribution
SELECT role, COUNT(*) AS count FROM users GROUP BY role ORDER BY role;

-- 5. FK constraints present
SELECT
  TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'foodloop_demo_rehearsal'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- 6. Quantity conservation: donated >= claimed >= picked up
SELECT
  d.id AS donation_id,
  d.quantity AS donated_qty,
  COALESCE((SELECT SUM(c.quantity) FROM claims c WHERE c.donation_id = d.id), 0) AS total_claimed,
  COALESCE((SELECT SUM(p.quantity_collected) FROM pickups p
              JOIN claims c2 ON p.claim_id = c2.id
            WHERE c2.donation_id = d.id), 0) AS total_collected,
  d.quantity - COALESCE((SELECT SUM(c.quantity) FROM claims c WHERE c.donation_id = d.id), 0) AS remaining
FROM donations d
ORDER BY d.id;

-- 7. Duplicate claim prevention: each NGO can claim a donation only once
SELECT ngo_id, donation_id, COUNT(*) AS claim_count
FROM claims
GROUP BY ngo_id, donation_id
HAVING COUNT(*) > 1;

-- 8. Orphaned claims (no matching donation)
SELECT c.id FROM claims c
LEFT JOIN donations d ON c.donation_id = d.id
WHERE d.id IS NULL;

-- 9. Orphaned pickups (no matching claim)
SELECT p.id FROM pickups p
LEFT JOIN claims c ON p.claim_id = c.id
WHERE c.id IS NULL;

-- 10. AVAILABLE donation check
SELECT id, food_name, quantity, status, expiry_date
FROM donations WHERE status = 'AVAILABLE' LIMIT 10;

-- 11. Waste records sanity
SELECT wr.id, wr.meal_record_id, wr.wasted_quantity, mr.quantity
FROM wastage_records wr
JOIN meal_records mr ON wr.meal_record_id = mr.id
WHERE wr.wasted_quantity > mr.quantity;

-- 12. Enum integrity check on donations
SELECT DISTINCT status FROM donations;
SELECT DISTINCT status FROM claims;
SELECT DISTINCT status FROM pickups;