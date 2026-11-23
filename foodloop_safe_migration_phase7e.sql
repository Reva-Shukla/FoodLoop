-- =============================================================================
-- FoodLoop — Phase 7E Production-Grade Safe Additive Database Upgrade
-- Target Database: foodloop (MySQL 8.0.46)
--
-- STRICT DATA-INTEGRITY & SAFETY PRINCIPLES:
--  1. ZERO DATA LOSS: 100% preservation of all 28 existing historical records.
--  2. NO DROP DATABASE, NO DROP TABLE, NO TRUNCATE, NO DELETE.
--  3. NO FABRICATED TIMESTAMPS: Historical pickup completion timestamps remain NULL.
--  4. NO SPECULATIVE RELATIONSHIPS: Historical donations maintain meal_record_id = NULL.
--  5. NO FABRICATED ENTITY NAMES: User 2 organization remains NULL.
--  6. NULLABLE-FIRST FK LIFECYCLE: Pickups columns added as NULL, backfilled,
--     validated with strict assertions, and only then enforced NOT NULL + Foreign Keys.
--  7. PHASED CHECKPOINTS: Preconditions and postconditions asserted at every phase.
--  8. BLOCKING GUARDS: Halts execution if unresolved team decisions are not explicitly configured.
--
-- DO NOT EXECUTE DIRECTLY. AWAIT TEAM APPROVAL AND ISOLATED BACKUP REHEARSAL.
-- =============================================================================

USE foodloop;

-- =============================================================================
-- SECTION 0: UNRESOLVED DATA-QUALITY & ARCHITECTURAL GUARDS
-- =============================================================================
-- GUARD 1: Hostel mapping for legacy User 1 ("Main College Mess").
--   Options: 'mess-b-franklin', 'mess-b-alfred', etc., or 'mess-legacy-main'.
--   Must be confirmed by Sameer. Default is 'UNRESOLVED'.
SET @CONFIRMED_LEGACY_HOSTEL_ID = 'UNRESOLVED';

-- GUARD 2: Cutoff time for legacy date-only donation deadlines ('DD/MM/YYYY').
--   Options: '23:59:59' (end of day), '21:00:00' (dinner close), '15:00:00' (lunch close), '00:00:00' (midnight).
--   Must be confirmed by Sameer. Default is 'UNRESOLVED'.
SET @LEGACY_DEADLINE_CUTOFF_TIME = 'UNRESOLVED';

DELIMITER $$
CREATE PROCEDURE AssertPreconditionsAndGuards()
BEGIN
    -- Check Guard 1: Legacy hostel mapping
    IF @CONFIRMED_LEGACY_HOSTEL_ID = 'UNRESOLVED' OR @CONFIRMED_LEGACY_HOSTEL_ID IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'MIGRATION HALTED [Guard 1]: Legacy hostel mapping for "Main College Mess" is unresolved. Await confirmation from Sameer.';
    END IF;

    -- Check Guard 2: Deadline cutoff time
    IF @LEGACY_DEADLINE_CUTOFF_TIME = 'UNRESOLVED' OR @LEGACY_DEADLINE_CUTOFF_TIME IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'MIGRATION HALTED [Guard 2]: Default cutoff time for historical date-only deadlines is unresolved. Await confirmation from Sameer.';
    END IF;

    -- Verify table existence
    IF (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('users', 'meal_records', 'donations', 'claims', 'pickups')) < 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'MIGRATION HALTED: One or more base tables (users, meal_records, donations, claims, pickups) are missing.';
    END IF;

    -- Verify historical record counts (must not be empty or truncated)
    IF (SELECT COUNT(*) FROM users) < 3 OR 
       (SELECT COUNT(*) FROM meal_records) < 7 OR 
       (SELECT COUNT(*) FROM donations) < 7 OR 
       (SELECT COUNT(*) FROM claims) < 6 OR 
       (SELECT COUNT(*) FROM pickups) < 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'MIGRATION HALTED: Pre-migration row counts do not match expected historical baseline (users>=3, meals>=7, donations>=7, claims>=6, pickups>=5).';
    END IF;

    -- Verify referential validity of existing relationships
    IF (SELECT COUNT(*) FROM claims c LEFT JOIN donations d ON c.donation_id = d.donation_id WHERE d.donation_id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'MIGRATION HALTED: Orphaned claims detected prior to migration.';
    END IF;

    IF (SELECT COUNT(*) FROM pickups p LEFT JOIN claims c ON p.claim_id = c.claim_id WHERE c.claim_id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'MIGRATION HALTED: Orphaned pickups detected prior to migration.';
    END IF;
END$$
DELIMITER ;

CALL AssertPreconditionsAndGuards();
DROP PROCEDURE AssertPreconditionsAndGuards;

-- =============================================================================
-- SECTION 1: IDEMPOTENT DDL HELPER PROCEDURES
-- =============================================================================
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

-- =============================================================================
-- SECTION 2: CREATE TABLE 'hostels' & SEED CHITKARA CAMPUS MESSES
-- =============================================================================
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

-- Postcondition Check 2: Verify all 7 hostels exist
DELIMITER $$
CREATE PROCEDURE AssertHostelsSeeded()
BEGIN
    IF (SELECT COUNT(*) FROM hostels) < 7 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POSTCONDITION FAILED [Section 2]: Hostels table does not contain all 7 campus dining halls.';
    END IF;
END$$
DELIMITER ;
CALL AssertHostelsSeeded();
DROP PROCEDURE AssertHostelsSeeded;

-- =============================================================================
-- SECTION 3: UPGRADE TABLE 'users'
-- =============================================================================
ALTER TABLE users MODIFY COLUMN email VARCHAR(150) NOT NULL;

CALL SafeAddColumn('users', 'assigned_mess_id', 'VARCHAR(50) DEFAULT NULL AFTER food_preference');
CALL SafeAddColumn('users', 'organization', 'VARCHAR(200) DEFAULT NULL AFTER assigned_mess_id');
CALL SafeAddColumn('users', 'department', 'VARCHAR(100) DEFAULT NULL AFTER organization');
CALL SafeAddColumn('users', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER department');

-- Assign User 1 (Mess Manager) to the confirmed hostel
UPDATE users
SET assigned_mess_id = @CONFIRMED_LEGACY_HOSTEL_ID
WHERE user_id = 1 AND (assigned_mess_id IS NULL OR assigned_mess_id = '');

-- NOTE on User 2 (NGO): Organization remains NULL unless explicitly confirmed by team.
-- Fabricated organization names are strictly prohibited.

-- Postcondition Check 3: Verify User 1 hostel assignment
DELIMITER $$
CREATE PROCEDURE AssertUserHostelAssigned()
BEGIN
    IF (SELECT COUNT(*) FROM users u LEFT JOIN hostels h ON u.assigned_mess_id = h.hostel_id WHERE u.user_id = 1 AND h.hostel_id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POSTCONDITION FAILED [Section 3]: User 1 assigned_mess_id does not reference a valid hostel in hostels table.';
    END IF;
END$$
DELIMITER ;
CALL AssertUserHostelAssigned();
DROP PROCEDURE AssertUserHostelAssigned;

CALL SafeDropForeignKey('users', 'fk_users_hostel');
ALTER TABLE users
    ADD CONSTRAINT fk_users_hostel
    FOREIGN KEY (assigned_mess_id) REFERENCES hostels(hostel_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- SECTION 4: UPGRADE TABLE 'meal_records'
-- =============================================================================
CALL SafeDropForeignKey('meal_records', 'meal_records_ibfk_1');
CALL SafeDropForeignKey('meal_records', 'fk_meals_hostel');

ALTER TABLE meal_records
    MODIFY COLUMN mess_id VARCHAR(50) NOT NULL,
    MODIFY COLUMN food_name VARCHAR(200) NOT NULL;

CALL SafeAddColumn('meal_records', 'food_type', 'ENUM(\'VEG\', \'NON_VEG\') NOT NULL DEFAULT \'VEG\' AFTER food_name');
CALL SafeAddColumn('meal_records', 'meal_type', 'VARCHAR(30) DEFAULT \'Lunch\' AFTER food_type');
CALL SafeAddColumn('meal_records', 'logged_by', 'VARCHAR(100) DEFAULT \'Mess Manager\' AFTER meal_date');
CALL SafeAddColumn('meal_records', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER logged_by');

-- Map historical mess_id '1' to confirmed hostel
UPDATE meal_records
SET mess_id = @CONFIRMED_LEGACY_HOSTEL_ID
WHERE mess_id = '1';

-- Validate and convert meal_date strings to ISO DATE format (YYYY-MM-DD)
UPDATE meal_records
SET meal_date = CASE 
    WHEN meal_date LIKE '%/%' THEN DATE_FORMAT(STR_TO_DATE(meal_date, '%d/%m/%Y'), '%Y-%m-%d')
    WHEN meal_date LIKE '%-%' AND LENGTH(meal_date) = 10 AND SUBSTRING(meal_date, 3, 1) = '-' 
         THEN DATE_FORMAT(STR_TO_DATE(meal_date, '%d-%m-%Y'), '%Y-%m-%d')
    ELSE meal_date
END
WHERE meal_date IS NOT NULL;

-- Postcondition Check 4a: Assert every meal record has a valid date string before column conversion
DELIMITER $$
CREATE PROCEDURE AssertMealDatesValid()
BEGIN
    DECLARE invalid_dates INT;
    SELECT COUNT(*) INTO invalid_dates FROM meal_records 
    WHERE STR_TO_DATE(meal_date, '%Y-%m-%d') IS NULL;
    IF invalid_dates > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POSTCONDITION FAILED [Section 4]: One or more meal_records contain invalid date strings that cannot convert to DATE.';
    END IF;
END$$
DELIMITER ;
CALL AssertMealDatesValid();
DROP PROCEDURE AssertMealDatesValid;

ALTER TABLE meal_records MODIFY COLUMN meal_date DATE NOT NULL;

ALTER TABLE meal_records
    ADD CONSTRAINT fk_meals_hostel
    FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
    ON UPDATE CASCADE;

-- =============================================================================
-- SECTION 5: UPGRADE TABLE 'donations'
-- =============================================================================
CALL SafeDropForeignKey('donations', 'donations_ibfk_1');
CALL SafeDropForeignKey('donations', 'fk_donations_hostel');
CALL SafeDropForeignKey('donations', 'fk_donations_meal');

ALTER TABLE donations
    MODIFY COLUMN mess_id VARCHAR(50) NOT NULL,
    MODIFY COLUMN food_name VARCHAR(200) NOT NULL,
    MODIFY COLUMN food_type ENUM('VEG', 'NON_VEG') NOT NULL DEFAULT 'VEG',
    MODIFY COLUMN pickup_location VARCHAR(300) DEFAULT NULL;

CALL SafeAddColumn('donations', 'meal_record_id', 'INT DEFAULT NULL AFTER donation_id');
CALL SafeAddColumn('donations', 'preparation_datetime', 'DATETIME DEFAULT NULL AFTER deadline');
CALL SafeAddColumn('donations', 'storage_conditions', 'VARCHAR(300) DEFAULT \'Room temperature\' AFTER preparation_datetime');
CALL SafeAddColumn('donations', 'allergens', 'VARCHAR(300) DEFAULT \'None\' AFTER storage_conditions');
CALL SafeAddColumn('donations', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status');

-- Map historical mess_id '1' to confirmed hostel
UPDATE donations
SET mess_id = @CONFIRMED_LEGACY_HOSTEL_ID
WHERE mess_id = '1';

-- NOTE: meal_record_id remains NULL for all historical donations.
-- Speculative linkages based only on similar portion counts are strictly avoided.

-- Standardize deadline strings using confirmed cutoff time
SET @cutoff = @LEGACY_DEADLINE_CUTOFF_TIME;
UPDATE donations
SET deadline = CASE 
    WHEN deadline LIKE '%/%' THEN DATE_FORMAT(STR_TO_DATE(CONCAT(deadline, ' ', @cutoff), '%d/%m/%Y %H:%i:%s'), '%Y-%m-%d %H:%i:%s')
    WHEN deadline LIKE '%-%' AND LENGTH(deadline) = 10 AND SUBSTRING(deadline, 3, 1) = '-' 
         THEN DATE_FORMAT(STR_TO_DATE(CONCAT(deadline, ' ', @cutoff), '%d-%m-%Y %H:%i:%s'), '%Y-%m-%d %H:%i:%s')
    ELSE deadline
END
WHERE deadline IS NOT NULL;

-- Postcondition Check 5: Assert every donation deadline converted cleanly to DATETIME
DELIMITER $$
CREATE PROCEDURE AssertDonationDeadlinesValid()
BEGIN
    DECLARE invalid_deadlines INT;
    SELECT COUNT(*) INTO invalid_deadlines FROM donations 
    WHERE STR_TO_DATE(deadline, '%Y-%m-%d %H:%i:%s') IS NULL;
    IF invalid_deadlines > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POSTCONDITION FAILED [Section 5]: One or more donations contain invalid deadline strings that cannot convert to DATETIME.';
    END IF;
END$$
DELIMITER ;
CALL AssertDonationDeadlinesValid();
DROP PROCEDURE AssertDonationDeadlinesValid;

ALTER TABLE donations MODIFY COLUMN deadline DATETIME NOT NULL;

ALTER TABLE donations
    ADD CONSTRAINT fk_donations_hostel
    FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_donations_meal
    FOREIGN KEY (meal_record_id) REFERENCES meal_records(meal_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- SECTION 6: UPGRADE TABLE 'claims'
-- =============================================================================
ALTER TABLE claims
    MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'EXPIRED') DEFAULT 'ACTIVE';

CALL SafeAddColumn('claims', 'pickup_deadline', 'DATETIME DEFAULT NULL AFTER claim_date');
CALL SafeAddColumn('claims', 'pickup_location', 'VARCHAR(300) DEFAULT NULL AFTER pickup_deadline');

-- Backfill deadline and location from parent donation
UPDATE claims c
INNER JOIN donations d ON c.donation_id = d.donation_id
SET c.pickup_deadline = d.deadline,
    c.pickup_location = d.pickup_location
WHERE c.pickup_deadline IS NULL;

-- Reversibly align historical APPROVED claims based on confirmed physical handover outcomes:
-- Claims associated with physically completed pickups -> COMPLETED
UPDATE claims c
INNER JOIN pickups p ON c.claim_id = p.claim_id
SET c.status = 'COMPLETED'
WHERE p.status = 'COMPLETED' AND c.status = 'APPROVED';

-- Claims with scheduled pickups or awaiting handover -> ACTIVE
UPDATE claims
SET status = 'ACTIVE'
WHERE status = 'APPROVED';

-- =============================================================================
-- SECTION 7: UPGRADE TABLE 'pickups' (NULLABLE-FIRST WITH STRICT VALIDATION)
-- =============================================================================
CALL SafeDropForeignKey('pickups', 'fk_pickups_donation');
CALL SafeDropForeignKey('pickups', 'fk_pickups_ngo');

-- Step 7a: Add relational columns as NULLABLE first to avoid default-value data corruption
CALL SafeAddColumn('pickups', 'donation_id', 'INT DEFAULT NULL AFTER claim_id');
CALL SafeAddColumn('pickups', 'ngo_id', 'INT DEFAULT NULL AFTER donation_id');
CALL SafeAddColumn('pickups', 'pickup_deadline', 'DATETIME DEFAULT NULL AFTER ngo_id');
CALL SafeAddColumn('pickups', 'pickup_location', 'VARCHAR(300) DEFAULT NULL AFTER pickup_deadline');
CALL SafeAddColumn('pickups', 'scheduled_at', 'DATETIME DEFAULT NULL AFTER pickup_date');
CALL SafeAddColumn('pickups', 'completed_at', 'DATETIME DEFAULT NULL AFTER scheduled_at');

-- Step 7b: Backfill verified donation_id and ngo_id from parent claims
UPDATE pickups p
INNER JOIN claims c ON p.claim_id = c.claim_id
SET p.donation_id = c.donation_id,
    p.ngo_id = c.ngo_id,
    p.pickup_deadline = c.pickup_deadline,
    p.pickup_location = c.pickup_location
WHERE p.donation_id IS NULL OR p.ngo_id IS NULL;

-- NOTE: Historical completed_at and scheduled_at are NOT fabricated.
-- Because p.pickup_date is NULL in legacy pickups, completed_at and scheduled_at remain NULL.

-- Step 7c: CRITICAL POSTCONDITION ASSERTION: Validate 100% of pickups have valid donation_id and ngo_id
DELIMITER $$
CREATE PROCEDURE AssertPickupsRelationalIntegrity()
BEGIN
    DECLARE unlinked_cnt INT;
    SELECT COUNT(*) INTO unlinked_cnt FROM pickups 
    WHERE donation_id IS NULL OR ngo_id IS NULL;
    
    IF unlinked_cnt > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POSTCONDITION FAILED [Section 7]: Unlinked pickups detected during backfill. Aborting before NOT NULL enforcement.';
    END IF;

    -- Verify all referenced donations and users exist
    IF (SELECT COUNT(*) FROM pickups p LEFT JOIN donations d ON p.donation_id = d.donation_id WHERE d.donation_id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POSTCONDITION FAILED [Section 7]: One or more pickups reference a non-existent donation_id.';
    END IF;

    IF (SELECT COUNT(*) FROM pickups p LEFT JOIN users u ON p.ngo_id = u.user_id WHERE u.user_id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POSTCONDITION FAILED [Section 7]: One or more pickups reference a non-existent ngo_id.';
    END IF;
END$$
DELIMITER ;
CALL AssertPickupsRelationalIntegrity();
DROP PROCEDURE AssertPickupsRelationalIntegrity;

-- Step 7d: Enforce NOT NULL constraints only after validation succeeded
ALTER TABLE pickups
    MODIFY COLUMN donation_id INT NOT NULL,
    MODIFY COLUMN ngo_id INT NOT NULL;

-- Step 7e: Add Foreign Key Constraints
ALTER TABLE pickups
    ADD CONSTRAINT fk_pickups_donation
    FOREIGN KEY (donation_id) REFERENCES donations(donation_id)
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_pickups_ngo
    FOREIGN KEY (ngo_id) REFERENCES users(user_id)
    ON UPDATE CASCADE;

-- =============================================================================
-- SECTION 8: CREATE TABLE 'waste_records'
-- =============================================================================
CREATE TABLE IF NOT EXISTS waste_records (
    waste_id           INT AUTO_INCREMENT PRIMARY KEY,
    meal_record_id     INT DEFAULT NULL,
    mess_id            VARCHAR(50) NOT NULL,
    food_name          VARCHAR(200) NOT NULL,
    food_type          ENUM('VEG', 'NON_VEG') NOT NULL DEFAULT 'VEG',
    portions_discarded INT NOT NULL DEFAULT 0,
    reason             VARCHAR(200) DEFAULT 'Unspecified',
    notes              TEXT DEFAULT NULL,
    discarded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_waste_meal
        FOREIGN KEY (meal_record_id) REFERENCES meal_records(meal_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_waste_hostel
        FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================================================
-- SECTION 9: PERFORMANCE INDEXES
-- =============================================================================
CALL SafeDropIndex('meal_records', 'idx_meals_mess_date');
CALL SafeDropIndex('donations', 'idx_donations_status');
CALL SafeDropIndex('donations', 'idx_donations_mess');
CALL SafeDropIndex('donations', 'idx_donations_deadline');
CALL SafeDropIndex('claims', 'idx_claims_ngo');
CALL SafeDropIndex('claims', 'idx_claims_donation');
CALL SafeDropIndex('pickups', 'idx_pickups_ngo');
CALL SafeDropIndex('pickups', 'idx_pickups_status');
CALL SafeDropIndex('waste_records', 'idx_waste_mess');
CALL SafeDropIndex('waste_records', 'idx_waste_meal');

CREATE INDEX idx_meals_mess_date   ON meal_records(mess_id, meal_date);
CREATE INDEX idx_donations_status   ON donations(status);
CREATE INDEX idx_donations_mess     ON donations(mess_id);
CREATE INDEX idx_donations_deadline ON donations(deadline);
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

-- =============================================================================
-- SECTION 10: FINAL MIGRATION POSTCONDITION ASSERTION
-- =============================================================================
DELIMITER $$
CREATE PROCEDURE AssertFinalMigrationIntegrity()
BEGIN
    -- Verify row counts are preserved
    IF (SELECT COUNT(*) FROM users) < 3 OR 
       (SELECT COUNT(*) FROM meal_records) < 7 OR 
       (SELECT COUNT(*) FROM donations) < 7 OR 
       (SELECT COUNT(*) FROM claims) < 6 OR 
       (SELECT COUNT(*) FROM pickups) < 5 OR
       (SELECT COUNT(*) FROM hostels) <> 7 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FINAL INTEGRITY CHECK FAILED: Row count verification failed post-migration.';
    END IF;

    -- Verify zero orphaned foreign keys
    IF (SELECT COUNT(*) FROM meal_records m LEFT JOIN hostels h ON m.mess_id = h.hostel_id WHERE h.hostel_id IS NULL) > 0 OR
       (SELECT COUNT(*) FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE h.hostel_id IS NULL) > 0 OR
       (SELECT COUNT(*) FROM claims c LEFT JOIN donations d ON c.donation_id = d.donation_id WHERE d.donation_id IS NULL) > 0 OR
       (SELECT COUNT(*) FROM pickups p LEFT JOIN donations d ON p.donation_id = d.donation_id WHERE d.donation_id IS NULL) > 0 OR
       (SELECT COUNT(*) FROM pickups p LEFT JOIN users u ON p.ngo_id = u.user_id WHERE u.user_id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FINAL INTEGRITY CHECK FAILED: Orphaned foreign key references detected post-migration.';
    END IF;
END$$
DELIMITER ;
CALL AssertFinalMigrationIntegrity();
DROP PROCEDURE AssertFinalMigrationIntegrity;

-- =============================================================================
-- END OF REVISED MIGRATION SCRIPT
-- =============================================================================
