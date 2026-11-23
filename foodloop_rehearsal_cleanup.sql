-- =============================================================================
-- FoodLoop — Phase 7E Sandbox Cleanup Script (APPROVAL-GATED)
-- TARGET: foodloop_rehearsal_sandbox ONLY
--
-- NOTE: DO NOT EXECUTE AUTOMATICALLY.
-- Keep the sandbox intact after rehearsal to allow team inspection.
-- Execute this cleanup only after Sameer and the team review the rehearsal results.
-- =============================================================================

-- Safety assertion: Never drop the live database
DELIMITER $$
CREATE PROCEDURE SafeDropRehearsalSandbox()
BEGIN
    -- Verify target is strictly the sandbox
    SET @target_db = 'foodloop_rehearsal_sandbox';
    
    -- Confirm sandbox exists
    IF (SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = @target_db) = 1 THEN
        SET @sql = CONCAT('DROP DATABASE ', @target_db);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Sandbox foodloop_rehearsal_sandbox dropped successfully.' AS cleanup_status;
    ELSE
        SELECT 'Sandbox foodloop_rehearsal_sandbox does not exist. Nothing to clean up.' AS cleanup_status;
    END IF;
END$$
DELIMITER ;

CALL SafeDropRehearsalSandbox();
DROP PROCEDURE SafeDropRehearsalSandbox;
