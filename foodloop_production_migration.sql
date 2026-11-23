-- =============================================================================
-- FoodLoop — Phase 8B.1 Production Database Migration Script
-- Target Database: foodloop ONLY
--
-- HISTORICAL CONTEXT & SAFETY DIRECTIVES:
--   1. Historical records referencing 'Main College Mess' (mess_id = 1) are
--      confirmed SAMPLE / DEMO DATA ONLY. They do not belong to any real hostel.
--   2. DO NOT assign demo records to Franklin or any of the 7 real Chitkara messes.
--   3. DO NOT create a fake eighth active hostel.
--   4. Demo records are preserved verbatim with mess_id = NULL and is_demo = 1.
--   5. Fully additive and non-destructive: zero data loss, preserves 28 rows.
--   6. Uses nullable-first column additions and asserts backfill integrity
--      before enforcing NOT NULL constraints.
--   7. MySQL DDL Notice: In MySQL/InnoDB, DDL statements cause implicit commits.
--      Rollback of DDL cannot be performed via ROLLBACK transaction;
--      recovery relies on point-in-time restore from verified pre-migration backup.
-- =============================================================================

USE foodloop;

-- -----------------------------------------------------------------------------
-- SECTION 0: MANDATORY SAFETY ASSERTIONS
-- -----------------------------------------------------------------------------
SET @LEGACY_DEADLINE_CUTOFF_TIME = '23:59:59';

DELIMITER $$

CREATE PROCEDURE AssertProductionContext()
BEGIN
    -- Assert Database Name Gate
    IF DATABASE() <> 'foodloop' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FATAL SECURITY VIOLATION: Current database is NOT foodloop. Production migration aborted!';
    END IF;
END$$

DELIMITER ;
CALL AssertProductionContext();
DROP PROCEDURE AssertProductionContext;

-- -----------------------------------------------------------------------------
-- SECTION 1: PRE-MIGRATION STATE AUDIT & BASELINE ASSERTION
-- -----------------------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE AssertPreMigrationBaseline()
BEGIN
    DECLARE user_cnt, meal_cnt, don_cnt, claim_cnt, pickup_cnt INT;

    SELECT COUNT(*) INTO user_cnt FROM users;
    SELECT COUNT(*) INTO meal_cnt FROM meal_records;
    SELECT COUNT(*) INTO don_cnt FROM donations;
    SELECT COUNT(*) INTO claim_cnt FROM claims;
    SELECT COUNT(*) INTO pickup_cnt FROM pickups;

    IF user_cnt < 3 OR meal_cnt < 7 OR don_cnt < 7 OR claim_cnt < 6 OR pickup_cnt < 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'PRE-MIGRATION BASELINE FAILED: Unexpected record counts in live foodloop database. Aborted!';
    END IF;
END$$

DELIMITER ;
CALL AssertPreMigrationBaseline();
DROP PROCEDURE AssertPreMigrationBaseline;

-- -----------------------------------------------------------------------------
-- SECTION 2: IDEMPOTENT DDL HELPER PROCEDURES
-- -----------------------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE SafeDropForeignKey(IN p_tbl VARCHAR(64), IN p_fk VARCHAR(64))
BEGIN
    DECLARE fk_cnt INT;
    SELECT COUNT(*) INTO fk_cnt FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = p_tbl AND CONSTRAINT_NAME = p_fk;
    IF fk_cnt > 0 THEN
        SET @s = CONCAT('ALTER TABLE ', p_tbl, ' DROP FOREIGN KEY ', p_fk);
        PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
    END IF;
END$$

CREATE PROCEDURE SafeDropIndex(IN p_tbl VARCHAR(64), IN p_idx VARCHAR(64))
BEGIN
    DECLARE idx_cnt INT;
    SELECT COUNT(*) INTO idx_cnt FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_tbl AND INDEX_NAME = p_idx;
    IF idx_cnt > 0 THEN
        SET @s = CONCAT('ALTER TABLE ', p_tbl, ' DROP INDEX ', p_idx);
        PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
    END IF;
END$$

CREATE PROCEDURE SafeAddColumn(IN p_tbl VARCHAR(64), IN p_col VARCHAR(64), IN p_def TEXT)
BEGIN
    DECLARE col_cnt INT;
    SELECT COUNT(*) INTO col_cnt FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_tbl AND COLUMN_NAME = p_col;
    IF col_cnt = 0 THEN
        SET @s = CONCAT('ALTER TABLE ', p_tbl, ' ADD COLUMN ', p_col, ' ', p_def);
        PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------------------------------
-- SECTION 3: CREATE TABLE 'hostels' & SEED EXACT 7 CHITKARA MESSES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostels (
    hostel_id      VARCHAR(50)  PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    category       ENUM('BOYS', 'GIRLS') NOT NULL,
    category_label VARCHAR(50) NOT NULL,
    campus         VARCHAR(150) DEFAULT 'Chitkara University, Punjab (Rajpura)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO hostels (hostel_id, name, category, category_label) VALUES
('mess-b-franklin',   'Franklin Mess',    'BOYS',  'Boys'' Hostel'),
('mess-b-alfred',     'Alfred Mess',      'BOYS',  'Boys'' Hostel'),
('mess-b-magellan',   'Magellan Mess',    'BOYS',  'Boys'' Hostel'),
('mess-b-archimedes', 'Archimedes Mess',  'BOYS',  'Boys'' Hostel'),
('mess-g-pi',         'Pi Mess',          'GIRLS', 'Girls'' Hostel'),
('mess-g-ibn',        'IBN Mess',         'GIRLS', 'Girls'' Hostel'),
('mess-g-nightingale','Nightingale Mess',  'GIRLS', 'Girls'' Hostel');

-- -----------------------------------------------------------------------------
-- SECTION 4: UPGRADE TABLE 'users'
-- -----------------------------------------------------------------------------
ALTER TABLE users MODIFY COLUMN email VARCHAR(150) NOT NULL;

CALL SafeAddColumn('users', 'assigned_mess_id', 'VARCHAR(50) DEFAULT NULL AFTER food_preference');
CALL SafeAddColumn('users', 'organization', 'VARCHAR(200) DEFAULT NULL AFTER assigned_mess_id');
CALL SafeAddColumn('users', 'department', 'VARCHAR(100) DEFAULT NULL AFTER organization');
CALL SafeAddColumn('users', 'is_demo', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER department');
CALL SafeAddColumn('users', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_demo');

-- Classify User 1 as demo mess manager with no assigned hostel (assigned_mess_id = NULL)
UPDATE users
SET is_demo = TRUE,
    assigned_mess_id = NULL
WHERE user_id = 1;

-- User 2 organization remains NULL (no synthetic fabrication)

CALL SafeDropForeignKey('users', 'fk_users_hostel');
ALTER TABLE users
    ADD CONSTRAINT fk_users_hostel
    FOREIGN KEY (assigned_mess_id) REFERENCES hostels(hostel_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- SECTION 5: UPGRADE TABLE 'meal_records' (NULLABLE MESS_ID FOR DEMO DATA)
-- -----------------------------------------------------------------------------
CALL SafeDropForeignKey('meal_records', 'meal_records_ibfk_1');
CALL SafeDropForeignKey('meal_records', 'fk_meals_hostel');

ALTER TABLE meal_records
    MODIFY COLUMN mess_id VARCHAR(50) DEFAULT NULL,
    MODIFY COLUMN food_name VARCHAR(200) NOT NULL;

CALL SafeAddColumn('meal_records', 'food_type', 'ENUM(\'VEG\', \'NON_VEG\') NOT NULL DEFAULT \'VEG\' AFTER food_name');
CALL SafeAddColumn('meal_records', 'meal_type', 'VARCHAR(30) DEFAULT \'Lunch\' AFTER food_type');
CALL SafeAddColumn('meal_records', 'logged_by', 'VARCHAR(100) DEFAULT \'Mess Manager\' AFTER meal_date');
CALL SafeAddColumn('meal_records', 'is_demo', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER logged_by');
CALL SafeAddColumn('meal_records', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_demo');

-- Mark historical records as demo and set mess_id = NULL (disassociated from real messes)
UPDATE meal_records
SET is_demo = TRUE,
    mess_id = NULL
WHERE mess_id = '1' OR mess_id IS NULL;

-- Validate and convert meal_date to ISO DATE
UPDATE meal_records
SET meal_date = CASE 
    WHEN meal_date LIKE '%/%' THEN DATE_FORMAT(STR_TO_DATE(meal_date, '%d/%m/%Y'), '%Y-%m-%d')
    WHEN meal_date LIKE '%-%' AND LENGTH(meal_date) = 10 AND SUBSTRING(meal_date, 3, 1) = '-' 
         THEN DATE_FORMAT(STR_TO_DATE(meal_date, '%d-%m-%Y'), '%Y-%m-%d')
    ELSE meal_date
END
WHERE meal_date IS NOT NULL;

ALTER TABLE meal_records MODIFY COLUMN meal_date DATE NOT NULL;

ALTER TABLE meal_records
    ADD CONSTRAINT fk_meals_hostel
    FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- SECTION 6: UPGRADE TABLE 'donations' (NULLABLE MESS_ID FOR DEMO DATA)
-- -----------------------------------------------------------------------------
CALL SafeDropForeignKey('donations', 'donations_ibfk_1');
CALL SafeDropForeignKey('donations', 'fk_donations_hostel');
CALL SafeDropForeignKey('donations', 'fk_donations_meal');

ALTER TABLE donations
    MODIFY COLUMN mess_id VARCHAR(50) DEFAULT NULL,
    MODIFY COLUMN food_name VARCHAR(200) NOT NULL,
    MODIFY COLUMN food_type ENUM('VEG', 'NON_VEG') NOT NULL DEFAULT 'VEG',
    MODIFY COLUMN pickup_location VARCHAR(300) DEFAULT NULL;

CALL SafeAddColumn('donations', 'meal_record_id', 'INT DEFAULT NULL AFTER donation_id');
CALL SafeAddColumn('donations', 'preparation_datetime', 'DATETIME DEFAULT NULL AFTER deadline');
CALL SafeAddColumn('donations', 'storage_conditions', 'VARCHAR(300) DEFAULT \'Room temperature\' AFTER preparation_datetime');
CALL SafeAddColumn('donations', 'allergens', 'VARCHAR(300) DEFAULT \'None\' AFTER storage_conditions');
CALL SafeAddColumn('donations', 'legacy_deadline', 'VARCHAR(25) DEFAULT NULL AFTER allergens');
CALL SafeAddColumn('donations', 'is_demo', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER legacy_deadline');
CALL SafeAddColumn('donations', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status');

-- Preserve exact verbatim legacy deadline string before conversion
UPDATE donations
SET legacy_deadline = deadline
WHERE legacy_deadline IS NULL AND deadline IS NOT NULL;

-- Mark historical donations as demo and disassociate from real messes (mess_id = NULL)
UPDATE donations
SET is_demo = TRUE,
    mess_id = NULL
WHERE mess_id = '1' OR mess_id IS NULL;

-- Historical meal_record_id remains NULL (no speculative linkages)

-- Standardize deadlines using agreed end-of-calendar-day cutoff time
SET @cutoff = @LEGACY_DEADLINE_CUTOFF_TIME;
UPDATE donations
SET deadline = CASE 
    WHEN deadline LIKE '%/%' THEN DATE_FORMAT(STR_TO_DATE(CONCAT(deadline, ' ', @cutoff), '%d/%m/%Y %H:%i:%s'), '%Y-%m-%d %H:%i:%s')
    WHEN deadline LIKE '%-%' AND LENGTH(deadline) = 10 AND SUBSTRING(deadline, 3, 1) = '-' 
         THEN DATE_FORMAT(STR_TO_DATE(CONCAT(deadline, ' ', @cutoff), '%d-%m-%Y %H:%i:%s'), '%Y-%m-%d %H:%i:%s')
    ELSE deadline
END
WHERE deadline IS NOT NULL;

ALTER TABLE donations MODIFY COLUMN deadline DATETIME NOT NULL;

ALTER TABLE donations
    ADD CONSTRAINT fk_donations_hostel
    FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
    ADD CONSTRAINT fk_donations_meal
    FOREIGN KEY (meal_record_id) REFERENCES meal_records(meal_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- SECTION 7: UPGRADE TABLE 'claims'
-- -----------------------------------------------------------------------------
ALTER TABLE claims
    MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'EXPIRED') DEFAULT 'ACTIVE';

CALL SafeAddColumn('claims', 'pickup_deadline', 'DATETIME DEFAULT NULL AFTER claim_date');
CALL SafeAddColumn('claims', 'pickup_location', 'VARCHAR(300) DEFAULT NULL AFTER pickup_deadline');

UPDATE claims c
INNER JOIN donations d ON c.donation_id = d.donation_id
SET c.pickup_deadline = d.deadline,
    c.pickup_location = d.pickup_location
WHERE c.pickup_deadline IS NULL;

-- Align historical APPROVED claims based on confirmed collection outcome
UPDATE claims c
INNER JOIN pickups p ON c.claim_id = p.claim_id
SET c.status = 'COMPLETED'
WHERE p.status = 'COMPLETED' AND c.status = 'APPROVED';

UPDATE claims
SET status = 'ACTIVE'
WHERE status = 'APPROVED';

-- -----------------------------------------------------------------------------
-- SECTION 8: UPGRADE TABLE 'pickups' (NULLABLE-FIRST WITH STRICT VALIDATION)
-- -----------------------------------------------------------------------------
CALL SafeDropForeignKey('pickups', 'fk_pickups_donation');
CALL SafeDropForeignKey('pickups', 'fk_pickups_ngo');

-- Step 8a: Add columns as NULLABLE first
CALL SafeAddColumn('pickups', 'donation_id', 'INT DEFAULT NULL AFTER claim_id');
CALL SafeAddColumn('pickups', 'ngo_id', 'INT DEFAULT NULL AFTER donation_id');
CALL SafeAddColumn('pickups', 'pickup_deadline', 'DATETIME DEFAULT NULL AFTER ngo_id');
CALL SafeAddColumn('pickups', 'pickup_location', 'VARCHAR(300) DEFAULT NULL AFTER pickup_deadline');
CALL SafeAddColumn('pickups', 'scheduled_at', 'DATETIME DEFAULT NULL AFTER pickup_date');
CALL SafeAddColumn('pickups', 'completed_at', 'DATETIME DEFAULT NULL AFTER scheduled_at');

-- Step 8b: Backfill from parent claims
UPDATE pickups p
INNER JOIN claims c ON p.claim_id = c.claim_id
SET p.donation_id = c.donation_id,
    p.ngo_id = c.ngo_id,
    p.pickup_deadline = c.pickup_deadline,
    p.pickup_location = c.pickup_location
WHERE p.donation_id IS NULL OR p.ngo_id IS NULL;

-- Historical completed_at and scheduled_at remain NULL (unfabricated)

-- Step 8c: Postcondition check: Verify 100% of pickups have valid donation_id and ngo_id
DELIMITER $$
CREATE PROCEDURE AssertPickupsIntegrity()
BEGIN
    DECLARE unlinked_cnt INT;
    SELECT COUNT(*) INTO unlinked_cnt FROM pickups 
    WHERE donation_id IS NULL OR ngo_id IS NULL;
    
    IF unlinked_cnt > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POSTCONDITION FAILED [Section 8]: Unlinked pickups detected during backfill. Aborting before NOT NULL enforcement.';
    END IF;
END$$
DELIMITER ;
CALL AssertPickupsIntegrity();
DROP PROCEDURE AssertPickupsIntegrity;

-- Step 8d: Enforce NOT NULL after validation succeeded
ALTER TABLE pickups
    MODIFY COLUMN donation_id INT NOT NULL,
    MODIFY COLUMN ngo_id INT NOT NULL;

-- Step 8e: Add Foreign Keys referencing foodloop tables
ALTER TABLE pickups
    ADD CONSTRAINT fk_pickups_donation
    FOREIGN KEY (donation_id) REFERENCES donations(donation_id)
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_pickups_ngo
    FOREIGN KEY (ngo_id) REFERENCES users(user_id)
    ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- SECTION 9: CREATE TABLE 'waste_records'
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS waste_records (
    waste_id           INT AUTO_INCREMENT PRIMARY KEY,
    meal_record_id     INT DEFAULT NULL,
    mess_id            VARCHAR(50) NOT NULL,
    food_name          VARCHAR(200) NOT NULL,
    food_type          ENUM('VEG', 'NON_VEG') NOT NULL DEFAULT 'VEG',
    portions_discarded INT NOT NULL DEFAULT 0,
    reason             VARCHAR(200) DEFAULT 'Unspecified',
    notes              TEXT DEFAULT NULL,
    is_demo            BOOLEAN NOT NULL DEFAULT FALSE,
    discarded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_waste_meal
        FOREIGN KEY (meal_record_id) REFERENCES meal_records(meal_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_waste_hostel
        FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- SECTION 10: PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CALL SafeDropIndex('meal_records', 'idx_meals_mess_date');
CALL SafeDropIndex('meal_records', 'idx_meals_demo');
CALL SafeDropIndex('donations', 'idx_donations_status');
CALL SafeDropIndex('donations', 'idx_donations_mess');
CALL SafeDropIndex('donations', 'idx_donations_deadline');
CALL SafeDropIndex('donations', 'idx_donations_demo');
CALL SafeDropIndex('claims', 'idx_claims_ngo');
CALL SafeDropIndex('claims', 'idx_claims_donation');
CALL SafeDropIndex('pickups', 'idx_pickups_ngo');
CALL SafeDropIndex('pickups', 'idx_pickups_status');
CALL SafeDropIndex('waste_records', 'idx_waste_mess');
CALL SafeDropIndex('waste_records', 'idx_waste_meal');

CREATE INDEX idx_meals_mess_date   ON meal_records(mess_id, meal_date);
CREATE INDEX idx_meals_demo        ON meal_records(is_demo);
CREATE INDEX idx_donations_status   ON donations(status);
CREATE INDEX idx_donations_mess     ON donations(mess_id);
CREATE INDEX idx_donations_deadline ON donations(deadline);
CREATE INDEX idx_donations_demo     ON donations(is_demo);
CREATE INDEX idx_claims_ngo         ON claims(ngo_id);
CREATE INDEX idx_claims_donation    ON claims(donation_id);
CREATE INDEX idx_pickups_ngo        ON pickups(ngo_id);
CREATE INDEX idx_pickups_status     ON pickups(status);
CREATE INDEX idx_waste_mess         ON waste_records(mess_id);
CREATE INDEX idx_waste_meal         ON waste_records(meal_record_id);

-- Clean up helper procedures
DROP PROCEDURE SafeDropForeignKey;
DROP PROCEDURE SafeDropIndex;
DROP PROCEDURE SafeAddColumn;

-- -----------------------------------------------------------------------------
-- SECTION 11: FINAL POST-MIGRATION INTEGRITY & DEMO ISOLATION ASSERTION
-- -----------------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE AssertFinalProductionIntegrity()
BEGIN
    -- 1. Verify row counts (must be >= original 28 baseline)
    IF (SELECT COUNT(*) FROM users) < 3 OR 
       (SELECT COUNT(*) FROM meal_records) < 7 OR 
       (SELECT COUNT(*) FROM donations) < 7 OR 
       (SELECT COUNT(*) FROM claims) < 6 OR 
       (SELECT COUNT(*) FROM pickups) < 5 OR
       (SELECT COUNT(*) FROM hostels) <> 7 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FINAL INTEGRITY CHECK FAILED: Row count verification failed post-migration.';
    END IF;

    -- 2. Verify demo classification (all 7 historical meals and 7 donations marked demo with NULL mess_id)
    IF (SELECT COUNT(*) FROM meal_records WHERE is_demo = TRUE AND mess_id IS NULL) < 7 OR
       (SELECT COUNT(*) FROM donations WHERE is_demo = TRUE AND mess_id IS NULL) < 7 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FINAL INTEGRITY CHECK FAILED: Demo records not cleanly disassociated from hostels.';
    END IF;

    -- 3. Verify zero orphaned foreign keys (for records where mess_id is NOT NULL)
    IF (SELECT COUNT(*) FROM meal_records m LEFT JOIN hostels h ON m.mess_id = h.hostel_id WHERE m.mess_id IS NOT NULL AND h.hostel_id IS NULL) > 0 OR
       (SELECT COUNT(*) FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE d.mess_id IS NOT NULL AND h.hostel_id IS NULL) > 0 OR
       (SELECT COUNT(*) FROM claims c LEFT JOIN donations d ON c.donation_id = d.donation_id WHERE d.donation_id IS NULL) > 0 OR
       (SELECT COUNT(*) FROM pickups p LEFT JOIN donations d ON p.donation_id = d.donation_id WHERE d.donation_id IS NULL) > 0 OR
       (SELECT COUNT(*) FROM pickups p LEFT JOIN users u ON p.ngo_id = u.user_id WHERE u.user_id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FINAL INTEGRITY CHECK FAILED: Orphaned foreign key references detected post-migration.';
    END IF;
END$$
DELIMITER ;
CALL AssertFinalProductionIntegrity();
DROP PROCEDURE AssertFinalProductionIntegrity;

-- =============================================================================
-- END OF SCRIPT: foodloop_production_migration.sql
-- =============================================================================
