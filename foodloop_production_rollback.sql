-- =============================================================================
-- FoodLoop — Phase 8B.1 Production Rollback Script (EMERGENCY DDL REVERSAL)
-- Target Database: foodloop ONLY
--
-- PURPOSE:
--   Reverts schema changes back to the original 5-table baseline structure in
--   the event that an emergency post-migration rollback is requested.
--
-- ARCHITECTURAL NOTICE & ROLLBACK LIMITATIONS:
--   1. MySQL DDL Implicit Commits: In MySQL/InnoDB, DDL statements trigger implicit
--      commits before and after each execution. There is NO transactional rollback
--      (ROLLBACK statement cannot undo ALTER TABLE or CREATE TABLE).
--   2. Scope of this script: This script executes reverse DDL to safely drop added
--      tables, columns, indexes, and foreign keys.
--   3. Baseline preservation: Preserves all 28 original historical demo records.
--      Any post-migration waste records logged in 'waste_records' will be lost
--      when the table is dropped.
--   4. Definitive Restore Method: For total, guaranteed point-in-time restoration,
--      always restore from the fresh pre-migration SQL dump file:
--      mysql -h 100.74.31.79 -P 3306 -u sameer -p foodloop < <pre_migration_backup.sql>
-- =============================================================================

USE foodloop;

-- -----------------------------------------------------------------------------
-- SECTION 0: SAFETY CONTEXT CHECK
-- -----------------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE AssertRollbackContext()
BEGIN
    IF DATABASE() <> 'foodloop' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FATAL ERROR: Current database is NOT foodloop. Rollback aborted!';
    END IF;
END$$
DELIMITER ;
CALL AssertRollbackContext();
DROP PROCEDURE AssertRollbackContext;

-- -----------------------------------------------------------------------------
-- SECTION 1: IDEMPOTENT DDL HELPERS
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

CREATE PROCEDURE SafeDropColumn(IN p_tbl VARCHAR(64), IN p_col VARCHAR(64))
BEGIN
    DECLARE col_cnt INT;
    SELECT COUNT(*) INTO col_cnt FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_tbl AND COLUMN_NAME = p_col;
    IF col_cnt > 0 THEN
        SET @s = CONCAT('ALTER TABLE ', p_tbl, ' DROP COLUMN ', p_col);
        PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------------------------------
-- SECTION 2: DROP PERFORMANCE INDEXES
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

-- -----------------------------------------------------------------------------
-- SECTION 3: REVERT TABLE 'waste_records'
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS waste_records;

-- -----------------------------------------------------------------------------
-- SECTION 4: REVERT TABLE 'pickups'
-- -----------------------------------------------------------------------------
CALL SafeDropForeignKey('pickups', 'fk_pickups_donation');
CALL SafeDropForeignKey('pickups', 'fk_pickups_ngo');

CALL SafeDropColumn('pickups', 'completed_at');
CALL SafeDropColumn('pickups', 'scheduled_at');
CALL SafeDropColumn('pickups', 'pickup_location');
CALL SafeDropColumn('pickups', 'pickup_deadline');
CALL SafeDropColumn('pickups', 'ngo_id');
CALL SafeDropColumn('pickups', 'donation_id');

-- -----------------------------------------------------------------------------
-- SECTION 5: REVERT TABLE 'claims'
-- -----------------------------------------------------------------------------
CALL SafeDropColumn('claims', 'pickup_location');
CALL SafeDropColumn('claims', 'pickup_deadline');

ALTER TABLE claims
    MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'APPROVED';

UPDATE claims SET status = 'APPROVED' WHERE status IN ('ACTIVE', 'COMPLETED');

-- -----------------------------------------------------------------------------
-- SECTION 6: REVERT TABLE 'donations'
-- -----------------------------------------------------------------------------
CALL SafeDropForeignKey('donations', 'fk_donations_hostel');
CALL SafeDropForeignKey('donations', 'fk_donations_meal');

CALL SafeDropColumn('donations', 'created_at');
CALL SafeDropColumn('donations', 'is_demo');
CALL SafeDropColumn('donations', 'allergens');
CALL SafeDropColumn('donations', 'storage_conditions');
CALL SafeDropColumn('donations', 'preparation_datetime');
CALL SafeDropColumn('donations', 'meal_record_id');

-- Restore legacy deadline format if preserved
UPDATE donations
SET deadline = DATE_FORMAT(deadline, '%d/%m/%Y')
WHERE legacy_deadline IS NULL AND deadline IS NOT NULL;

UPDATE donations
SET deadline = legacy_deadline
WHERE legacy_deadline IS NOT NULL;

CALL SafeDropColumn('donations', 'legacy_deadline');

ALTER TABLE donations
    MODIFY COLUMN deadline VARCHAR(25) DEFAULT NULL,
    MODIFY COLUMN food_type VARCHAR(30) DEFAULT NULL,
    MODIFY COLUMN food_name VARCHAR(100) NOT NULL,
    MODIFY COLUMN pickup_location VARCHAR(150) DEFAULT NULL,
    MODIFY COLUMN mess_id INT NOT NULL;

UPDATE donations SET mess_id = 1;

ALTER TABLE donations
    ADD CONSTRAINT donations_ibfk_1
    FOREIGN KEY (mess_id) REFERENCES users(user_id);

-- -----------------------------------------------------------------------------
-- SECTION 7: REVERT TABLE 'meal_records'
-- -----------------------------------------------------------------------------
CALL SafeDropForeignKey('meal_records', 'fk_meals_hostel');

CALL SafeDropColumn('meal_records', 'created_at');
CALL SafeDropColumn('meal_records', 'is_demo');
CALL SafeDropColumn('meal_records', 'logged_by');
CALL SafeDropColumn('meal_records', 'meal_type');
CALL SafeDropColumn('meal_records', 'food_type');

ALTER TABLE meal_records
    MODIFY COLUMN meal_date VARCHAR(10) DEFAULT NULL,
    MODIFY COLUMN food_name VARCHAR(100) NOT NULL,
    MODIFY COLUMN mess_id INT NOT NULL;

UPDATE meal_records SET mess_id = 1;

ALTER TABLE meal_records
    ADD CONSTRAINT meal_records_ibfk_1
    FOREIGN KEY (mess_id) REFERENCES users(user_id);

-- -----------------------------------------------------------------------------
-- SECTION 8: REVERT TABLE 'users'
-- -----------------------------------------------------------------------------
CALL SafeDropForeignKey('users', 'fk_users_hostel');

CALL SafeDropColumn('users', 'created_at');
CALL SafeDropColumn('users', 'is_demo');
CALL SafeDropColumn('users', 'department');
CALL SafeDropColumn('users', 'organization');
CALL SafeDropColumn('users', 'assigned_mess_id');

ALTER TABLE users MODIFY COLUMN email VARCHAR(100) NOT NULL;

-- -----------------------------------------------------------------------------
-- SECTION 9: DROP TABLE 'hostels'
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS hostels;

-- Clean up helper procedures
DROP PROCEDURE SafeDropForeignKey;
DROP PROCEDURE SafeDropIndex;
DROP PROCEDURE SafeDropColumn;

-- -----------------------------------------------------------------------------
-- SECTION 10: VERIFY ORIGINAL 5-TABLE BASELINE RESTORED
-- -----------------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE AssertRollbackIntegrity()
BEGIN
    DECLARE tbl_count INT;
    SELECT COUNT(*) INTO tbl_count FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodloop';
    IF tbl_count <> 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ROLLBACK VERIFICATION FAILED: Expected exactly 5 tables in restored foodloop schema.';
    END IF;

    IF (SELECT COUNT(*) FROM users) < 3 OR 
       (SELECT COUNT(*) FROM meal_records) < 7 OR 
       (SELECT COUNT(*) FROM donations) < 7 OR 
       (SELECT COUNT(*) FROM claims) < 6 OR 
       (SELECT COUNT(*) FROM pickups) < 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ROLLBACK VERIFICATION FAILED: Row count mismatch in original tables.';
    END IF;
END$$
DELIMITER ;
CALL AssertRollbackIntegrity();
DROP PROCEDURE AssertRollbackIntegrity;

-- =============================================================================
-- END OF SCRIPT: foodloop_production_rollback.sql
-- =============================================================================
