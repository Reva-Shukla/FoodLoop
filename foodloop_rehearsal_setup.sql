-- =============================================================================
-- FoodLoop — Phase 7E Isolated Sandbox Setup Script
-- Target Schema: foodloop_rehearsal_sandbox ONLY
--
-- PURPOSE:
--   Creates a logically isolated sandbox database and clones the exact schema
--   and data from live 'foodloop' WITHOUT modifying live 'foodloop'.
--
-- SAFETY GUARANTEES:
--   1. Operates under LOCK TABLES (foodloop.* READ, sandbox.* WRITE) to obtain
--      an absolute, deterministic consistent snapshot preventing race conditions.
--   2. Explicitly recreates all original Foreign Keys, Primary Keys, Indexes,
--      Check Constraints, and Generated Columns within the sandbox namespace.
--      (Avoids the flaw of 'CREATE TABLE ... LIKE' which drops foreign keys).
--   3. All foreign keys in the sandbox reference sandbox tables exclusively.
--   4. Zero write or DDL operations against the live 'foodloop' database.
-- =============================================================================

USE foodloop_rehearsal_sandbox;

-- Safety assertion: Abort immediately if not inside the sandbox
DELIMITER $$
CREATE PROCEDURE AssertSandboxContext()
BEGIN
    IF DATABASE() <> 'foodloop_rehearsal_sandbox' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FATAL SECURITY VIOLATION: Current database context is not foodloop_rehearsal_sandbox.';
    END IF;
END$$
DELIMITER ;
CALL AssertSandboxContext();
DROP PROCEDURE AssertSandboxContext;

-- -----------------------------------------------------------------------------
-- Step 1: Recreate Complete Schemas with Internal Foreign Keys
-- -----------------------------------------------------------------------------

-- 1a. Sandbox Users Table
CREATE TABLE IF NOT EXISTS foodloop_rehearsal_sandbox.users (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('MESS','NGO','ADMIN') NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `food_preference` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 1b. Sandbox Meal Records Table (with Check Constraints, Generated Surplus & Sandbox FK)
CREATE TABLE IF NOT EXISTS foodloop_rehearsal_sandbox.meal_records (
  `meal_id` int NOT NULL AUTO_INCREMENT,
  `mess_id` int NOT NULL,
  `food_name` varchar(100) NOT NULL,
  `prepared` int NOT NULL,
  `served` int NOT NULL,
  `surplus` int GENERATED ALWAYS AS ((`prepared` - `served`)) STORED,
  `meal_date` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`meal_id`),
  KEY `mess_id` (`mess_id`),
  CONSTRAINT `meal_records_ibfk_1` FOREIGN KEY (`mess_id`) REFERENCES `foodloop_rehearsal_sandbox`.`users` (`user_id`),
  CONSTRAINT `meal_records_chk_1` CHECK ((`prepared` >= 0)),
  CONSTRAINT `meal_records_chk_2` CHECK (((`served` >= 0) and (`served` <= `prepared`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 1c. Sandbox Donations Table (with Check Constraint & Sandbox FK)
CREATE TABLE IF NOT EXISTS foodloop_rehearsal_sandbox.donations (
  `donation_id` int NOT NULL AUTO_INCREMENT,
  `mess_id` int NOT NULL,
  `food_name` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `food_type` varchar(30) DEFAULT NULL,
  `pickup_location` varchar(150) DEFAULT NULL,
  `deadline` varchar(25) DEFAULT NULL,
  `status` enum('AVAILABLE','CLAIMED','PICKED_UP','EXPIRED') DEFAULT 'AVAILABLE',
  PRIMARY KEY (`donation_id`),
  KEY `mess_id` (`mess_id`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`mess_id`) REFERENCES `foodloop_rehearsal_sandbox`.`users` (`user_id`),
  CONSTRAINT `donations_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 1d. Sandbox Claims Table (with Unique Key & Sandbox FKs)
CREATE TABLE IF NOT EXISTS foodloop_rehearsal_sandbox.claims (
  `claim_id` int NOT NULL AUTO_INCREMENT,
  `donation_id` int NOT NULL,
  `ngo_id` int NOT NULL,
  `claim_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'APPROVED',
  PRIMARY KEY (`claim_id`),
  UNIQUE KEY `donation_id` (`donation_id`),
  KEY `ngo_id` (`ngo_id`),
  CONSTRAINT `claims_ibfk_1` FOREIGN KEY (`donation_id`) REFERENCES `foodloop_rehearsal_sandbox`.`donations` (`donation_id`),
  CONSTRAINT `claims_ibfk_2` FOREIGN KEY (`ngo_id`) REFERENCES `foodloop_rehearsal_sandbox`.`users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 1e. Sandbox Pickups Table (with Unique Key & Sandbox FK)
CREATE TABLE IF NOT EXISTS foodloop_rehearsal_sandbox.pickups (
  `pickup_id` int NOT NULL AUTO_INCREMENT,
  `claim_id` int NOT NULL,
  `pickup_date` datetime DEFAULT NULL,
  `status` enum('SCHEDULED','COMPLETED','MISSED') DEFAULT 'SCHEDULED',
  PRIMARY KEY (`pickup_id`),
  UNIQUE KEY `claim_id` (`claim_id`),
  CONSTRAINT `pickups_ibfk_1` FOREIGN KEY (`claim_id`) REFERENCES `foodloop_rehearsal_sandbox`.`claims` (`claim_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- Step 2: Populate with Deterministic Consistent Snapshot Locking
-- -----------------------------------------------------------------------------
-- Locks live tables in READ mode (holding write operations until unlock)
-- and sandbox tables in WRITE mode to guarantee an internally consistent snapshot.
-- NOTE: Requires coordination with Sameer because concurrent live writes will queue
-- behind this read lock until UNLOCK TABLES completes. Do not assume zero disruption
-- or promise a specific lock duration.
LOCK TABLES 
    foodloop.users READ, 
    foodloop.meal_records READ, 
    foodloop.donations READ, 
    foodloop.claims READ, 
    foodloop.pickups READ,
    foodloop_rehearsal_sandbox.users WRITE,
    foodloop_rehearsal_sandbox.meal_records WRITE,
    foodloop_rehearsal_sandbox.donations WRITE,
    foodloop_rehearsal_sandbox.claims WRITE,
    foodloop_rehearsal_sandbox.pickups WRITE;

-- Clear any partial setup rows if rerun
DELETE FROM foodloop_rehearsal_sandbox.pickups;
DELETE FROM foodloop_rehearsal_sandbox.claims;
DELETE FROM foodloop_rehearsal_sandbox.donations;
DELETE FROM foodloop_rehearsal_sandbox.meal_records;
DELETE FROM foodloop_rehearsal_sandbox.users;

-- Populate in strict dependency order
INSERT INTO foodloop_rehearsal_sandbox.users 
    SELECT * FROM foodloop.users;

INSERT INTO foodloop_rehearsal_sandbox.meal_records 
    SELECT * FROM foodloop.meal_records;

INSERT INTO foodloop_rehearsal_sandbox.donations 
    SELECT * FROM foodloop.donations;

INSERT INTO foodloop_rehearsal_sandbox.claims 
    SELECT * FROM foodloop.claims;

INSERT INTO foodloop_rehearsal_sandbox.pickups 
    SELECT * FROM foodloop.pickups;

-- Release locks immediately
UNLOCK TABLES;

-- -----------------------------------------------------------------------------
-- Step 3: Validate Sandbox Population Baseline
-- -----------------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE ValidateSandboxBaseline()
BEGIN
    DECLARE u_cnt, m_cnt, d_cnt, c_cnt, p_cnt INT;
    SELECT COUNT(*) INTO u_cnt FROM foodloop_rehearsal_sandbox.users;
    SELECT COUNT(*) INTO m_cnt FROM foodloop_rehearsal_sandbox.meal_records;
    SELECT COUNT(*) INTO d_cnt FROM foodloop_rehearsal_sandbox.donations;
    SELECT COUNT(*) INTO c_cnt FROM foodloop_rehearsal_sandbox.claims;
    SELECT COUNT(*) INTO p_cnt FROM foodloop_rehearsal_sandbox.pickups;

    IF u_cnt < 3 OR m_cnt < 7 OR d_cnt < 7 OR c_cnt < 6 OR p_cnt < 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SANDBOX SETUP FAILED: Baseline record counts in foodloop_rehearsal_sandbox do not match expected historical data.';
    END IF;
END$$
DELIMITER ;
CALL ValidateSandboxBaseline();
DROP PROCEDURE ValidateSandboxBaseline;
