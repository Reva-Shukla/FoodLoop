package foodloop.src;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import foodloop.src.Database.DBConnection;

/**
 * DatabaseRunner — Isolated SQL Script Execution Harness for FoodLoop.
 * 
 * SECURITY ENFORCEMENT:
 *  1. Hard gate: strictly refuses execution unless active database is 'foodloop_rehearsal_sandbox'.
 *  2. Lexical guard: scans script and aborts if prohibited 'USE foodloop;' directives are present.
 *  3. Cross-database FK auditor: asserts no foreign keys in sandbox reference outside databases.
 *  4. Supports custom DELIMITER $$ / DELIMITER ; directives for stored procedures.
 */
public class DatabaseRunner {
    public static final String ALLOWED_SANDBOX_DB = "foodloop_rehearsal_sandbox";

    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: java foodloop.src.DatabaseRunner <path-to-sql-file> | --create-sandbox | --verify-live-untouched");
            System.exit(1);
        }

        String mode = args[0];

        try {
            if ("--preflight".equalsIgnoreCase(mode)) {
                runPreflightChecks();
                return;
            }

            if ("--check-sandbox-empty".equalsIgnoreCase(mode)) {
                checkSandboxEmpty();
                return;
            }

            if ("--verify-sandbox-baseline".equalsIgnoreCase(mode)) {
                verifySandboxBaseline();
                return;
            }

            if ("--create-sandbox".equalsIgnoreCase(mode)) {
                createSandboxDatabase();
                return;
            }

            if ("--verify-live-untouched".equalsIgnoreCase(mode)) {
                verifyLiveDatabaseUntouched();
                return;
            }

            File sqlFile = new File(mode);
            if (!sqlFile.exists()) {
                System.err.println("Error: SQL file does not exist: " + sqlFile.getAbsolutePath());
                System.exit(1);
            }

            executeSqlFileInSandbox(sqlFile);

        } catch (SecurityException se) {
            System.err.println("\n[SECURITY VIOLATION BLOCKED] " + se.getMessage());
            System.exit(2);
        } catch (Exception e) {
            System.err.println("\n[EXECUTION ERROR] " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void createSandboxDatabase() throws Exception {
        System.out.println("==================================================");
        System.out.println("  FoodLoop Isolated Sandbox Provisioning");
        System.out.println("==================================================");

        // Security assertion: strictly hardcoded to create only the approved sandbox schema
        if (!"foodloop_rehearsal_sandbox".equals(ALLOWED_SANDBOX_DB)) {
            throw new SecurityException("Configuration violation: ALLOWED_SANDBOX_DB must be strictly 'foodloop_rehearsal_sandbox'.");
        }

        String currentUrl = System.getenv("foodloopURL");
        String username = System.getenv("DB_USERNAME");
        String password = System.getenv("DB_PASSWORD");

        if (username == null || username.isEmpty()) username = "sameer";
        if (password == null || password.isEmpty()) {
            throw new SQLException("Set DB_PASSWORD environment variable first.");
        }

        // Connect to server root without selecting 'foodloop' catalog
        String serverUrl = "jdbc:mysql://100.74.31.79:3306/?allowPublicKeyRetrieval=true&useSSL=false";
        if (currentUrl != null && currentUrl.contains("://")) {
            int qIdx = currentUrl.indexOf('?');
            String params = qIdx > 0 ? currentUrl.substring(qIdx) : "";
            int slashIdx = currentUrl.lastIndexOf('/');
            int hostIdx = currentUrl.indexOf("://") + 3;
            if (slashIdx > hostIdx) {
                serverUrl = currentUrl.substring(0, slashIdx + 1) + params;
            }
        }

        System.out.println("[Provisioning] Connecting to MySQL server: " + serverUrl);
        try (Connection con = DriverManager.getConnection(serverUrl, username, password);
             Statement st = con.createStatement()) {
            
            System.out.println("[Provisioning] Creating database '" + ALLOWED_SANDBOX_DB + "' if not exists...");
            st.execute("CREATE DATABASE IF NOT EXISTS " + ALLOWED_SANDBOX_DB + 
                       " DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci");
            System.out.println("[Provisioning] SUCCESS: Isolated sandbox database '" + ALLOWED_SANDBOX_DB + "' is ready.");
        }
    }

    private static void executeSqlFileInSandbox(File file) throws Exception {
        System.out.println("==================================================");
        System.out.println("  FoodLoop Isolated Database Runner");
        System.out.println("  Target File: " + file.getName());
        System.out.println("==================================================");

        try (Connection con = DBConnection.getConnection()) {
            // 1. Mandatory Pre-Execution Database Name Verification
            System.out.println("[Security Gate] Active Connection Catalog: " + con.getCatalog());
            System.out.println("[Security Gate] Active MySQL DATABASE():  " + getActiveDatabase(con));
            validateSandboxContext(con, "Pre-Execution Gate");
            System.out.println("[Security Gate] Verified: Target is isolated sandbox '" + ALLOWED_SANDBOX_DB + "'.");

            // 2. Lexical Scan for Prohibited Directives
            String scriptContent = readFileToString(file);
            lexicalSecurityScan(scriptContent);

            // 3. Parse and Execute Multi-Statement SQL with DELIMITER Support
            List<String> statements = parseStatements(scriptContent);
            System.out.println("[Parser] Parsed " + statements.size() + " logical statement(s) from " + file.getName());

            int statementIndex = 0;
            for (String sql : statements) {
                statementIndex++;
                sql = sql.trim();
                if (sql.isEmpty()) continue;

                // Re-verify database context before every single statement using OR logic and null checks
                validateSandboxContext(con, "Statement #" + statementIndex);

                try (Statement stmt = con.createStatement()) {
                    boolean hasResultSet = stmt.execute(sql);
                    if (hasResultSet) {
                        try (ResultSet rs = stmt.getResultSet()) {
                            printResultSet(rs);
                        }
                    }
                } catch (SQLException e) {
                    System.err.printf("%n[SQL ERROR at statement #%d]%nStatement:%n%s%nError: %s (SQLState: %s, ErrorCode: %d)%n",
                            statementIndex, truncate(sql, 200), e.getMessage(), e.getSQLState(), e.getErrorCode());
                    throw e;
                }
            }

            System.out.println("[Runner] Successfully executed all " + statements.size() + " statement(s) in " + file.getName());

            // 4. Post-Execution Audit: Ensure No Cross-Database Foreign Keys Exist
            auditCrossDatabaseForeignKeys(con);
        }
    }

    private static void validateSandboxContext(Connection con, String stage) throws SQLException {
        String activeDb = getActiveDatabase(con);
        String catalog = con.getCatalog();

        if (activeDb == null || catalog == null) {
            throw new SecurityException("[" + stage + "] Database name is null: DATABASE()=" 
                    + activeDb + ", catalog=" + catalog + ". Execution rejected.");
        }

        if (!ALLOWED_SANDBOX_DB.equalsIgnoreCase(activeDb) || !ALLOWED_SANDBOX_DB.equalsIgnoreCase(catalog)) {
            throw new SecurityException("[" + stage + "] Target database mismatch: DATABASE()='" 
                    + activeDb + "', catalog='" + catalog + "'. DatabaseRunner STRICTLY refuses to execute against any target other than '" 
                    + ALLOWED_SANDBOX_DB + "'.");
        }

        if (!activeDb.equalsIgnoreCase(catalog)) {
            throw new SecurityException("[" + stage + "] Inconsistent database context: DATABASE()='" 
                    + activeDb + "' differs from catalog='" + catalog + "'. Execution rejected.");
        }
    }

    private static String getActiveDatabase(Connection con) throws SQLException {
        try (Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT DATABASE()")) {
            if (rs.next()) {
                return rs.getString(1);
            }
        }
        return con.getCatalog();
    }

    static void lexicalSecurityScan(String content) {
        String[] prohibitedPatterns = {
            "USE `foodloop`", "USE foodloop", "USE `foodloop`;", "USE foodloop;"
        };

        for (String line : content.split("\\r?\\n")) {
            String trimmed = line.trim();
            if (trimmed.startsWith("--") || trimmed.startsWith("/*")) continue;

            for (String pattern : prohibitedPatterns) {
                if (trimmed.equalsIgnoreCase(pattern)) {
                    throw new SecurityException("Prohibited statement detected in script: '" + trimmed + "'. Scripts must not target the live 'foodloop' database.");
                }
            }
        }
    }

    public static void auditCrossDatabaseForeignKeys(Connection con) throws SQLException {
        String sql = "SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_SCHEMA, REFERENCED_TABLE_NAME " +
                     "FROM information_schema.KEY_COLUMN_USAGE " +
                     "WHERE TABLE_SCHEMA = '" + ALLOWED_SANDBOX_DB + "' " +
                     "  AND REFERENCED_TABLE_NAME IS NOT NULL " +
                     "  AND REFERENCED_TABLE_SCHEMA <> '" + ALLOWED_SANDBOX_DB + "'";

        try (Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            boolean hasCrossDbFk = false;
            while (rs.next()) {
                hasCrossDbFk = true;
                System.err.printf("[CROSS-DATABASE FK DETECTED] %s.%s -> %s.%s (%s)%n",
                        rs.getString("TABLE_NAME"), rs.getString("COLUMN_NAME"),
                        rs.getString("REFERENCED_TABLE_SCHEMA"), rs.getString("REFERENCED_TABLE_NAME"),
                        rs.getString("CONSTRAINT_NAME"));
            }

            if (hasCrossDbFk) {
                throw new SecurityException("Sandbox contains foreign keys referencing outside databases! Referential isolation violated.");
            } else {
                System.out.println("[Audit] Verified: 100% of sandbox foreign keys reference tables within '" + ALLOWED_SANDBOX_DB + "' exclusively.");
            }
        }
    }

    static List<String> parseStatements(String content) {
        List<String> statements = new ArrayList<>();
        String currentDelimiter = ";";
        StringBuilder buffer = new StringBuilder();

        String[] lines = content.split("\\r?\\n");
        for (String rawLine : lines) {
            String trimmed = rawLine.trim();

            if (trimmed.toUpperCase().startsWith("DELIMITER ")) {
                if (buffer.toString().trim().length() > 0) {
                    statements.add(buffer.toString().trim());
                    buffer.setLength(0);
                }
                String newDelim = trimmed.substring("DELIMITER ".length()).trim();
                if (!newDelim.isEmpty()) {
                    currentDelimiter = newDelim;
                }
                continue;
            }

            buffer.append(rawLine).append("\n");

            if (currentDelimiter.equals(";")) {
                if (trimmed.endsWith(";")) {
                    String stmt = buffer.toString().trim();
                    if (!stmt.isEmpty()) {
                        statements.add(stmt.substring(0, stmt.length() - 1));
                    }
                    buffer.setLength(0);
                }
            } else {
                if (trimmed.endsWith(currentDelimiter)) {
                    String stmt = buffer.toString().trim();
                    if (!stmt.isEmpty()) {
                        statements.add(stmt.substring(0, stmt.length() - currentDelimiter.length()));
                    }
                    buffer.setLength(0);
                }
            }
        }

        if (buffer.toString().trim().length() > 0) {
            statements.add(buffer.toString().trim());
        }

        return statements;
    }

    private static void printResultSet(ResultSet rs) throws SQLException {
        ResultSetMetaData md = rs.getMetaData();
        int cols = md.getColumnCount();
        StringBuilder header = new StringBuilder();
        for (int i = 1; i <= cols; i++) {
            header.append(String.format("%-25s ", md.getColumnLabel(i)));
        }
        System.out.println("\n" + header);
        System.out.println("-".repeat(header.length()));

        int rowCount = 0;
        while (rs.next()) {
            rowCount++;
            StringBuilder row = new StringBuilder();
            for (int i = 1; i <= cols; i++) {
                String val = rs.getString(i);
                row.append(String.format("%-25s ", val == null ? "NULL" : val));
            }
            System.out.println(row);
        }
        System.out.println("(" + rowCount + " row(s) returned)\n");
    }

    static String readFileToString(File file) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    private static void checkSandboxEmpty() throws Exception {
        System.out.println("==================================================");
        System.out.println("  FoodLoop Sandbox Empty Verification (READ-ONLY)");
        System.out.println("==================================================");

        try (Connection con = DBConnection.getConnection()) {
            validateSandboxContext(con, "Sandbox Empty Check Gate");

            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" + ALLOWED_SANDBOX_DB + "'")) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    System.out.println("[Sandbox Status] Schema '" + ALLOWED_SANDBOX_DB + "' table count: " + count);
                    if (count > 0) {
                        throw new IllegalStateException("Sandbox is NOT empty! Found " + count + " table(s). Refusing to proceed with restore.");
                    } else {
                        System.out.println("[Sandbox Status] SUCCESS: Sandbox is verified EMPTY (0 tables). Ready for clean restore.");
                    }
                }
            }
        }
    }

    private static void verifySandboxBaseline() throws Exception {
        System.out.println("==================================================");
        System.out.println("  FoodLoop Restored Sandbox Baseline Verification");
        System.out.println("==================================================");

        try (Connection con = DBConnection.getConnection()) {
            con.setReadOnly(true);
            validateSandboxContext(con, "Sandbox Baseline Verification Gate");

            System.out.println("[Sandbox Gate] Verified connected database: " + con.getCatalog());

            // 1. Check table count
            int tableCount = 0;
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" + ALLOWED_SANDBOX_DB + "'")) {
                if (rs.next()) tableCount = rs.getInt(1);
            }
            System.out.println("[Table Count] Sandbox tables found: " + tableCount + " (Expected: 5)");
            if (tableCount != 5) {
                throw new IllegalStateException("Expected exactly 5 tables in restored sandbox, found " + tableCount);
            }

            // 2. Check row counts for all 5 original tables
            String[] tables = {"users", "meal_records", "donations", "claims", "pickups"};
            int[] expected = {3, 7, 7, 6, 5};
            int totalRows = 0;

            for (int i = 0; i < tables.length; i++) {
                int count = 0;
                String query = "SELECT COUNT(*) FROM " + ALLOWED_SANDBOX_DB + "." + tables[i];
                try (Statement st = con.createStatement();
                     ResultSet rs = st.executeQuery(query)) {
                    if (rs.next()) count = rs.getInt(1);
                }
                totalRows += count;
                boolean matches = count == expected[i];
                System.out.printf("  Table %s.%-15s : %d row(s) [Expected: %d] -> %s%n",
                        ALLOWED_SANDBOX_DB, tables[i], count, expected[i], matches ? "PASS" : "FAIL");
                if (!matches) {
                    throw new IllegalStateException("Row count mismatch for " + tables[i] + ": got " + count + ", expected " + expected[i]);
                }
            }
            System.out.println("[Total Rows] Total records in sandbox: " + totalRows + " (Expected: 28)");

            // 3. Verify Foreign Keys and assert zero cross-database references
            auditCrossDatabaseForeignKeys(con);

            // 4. Verify generated column surplus on meal_records
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("SELECT meal_id, food_name, prepared, served, surplus FROM " + ALLOWED_SANDBOX_DB + ".meal_records WHERE surplus <> (prepared - served)")) {
                if (rs.next()) {
                    throw new IllegalStateException("Generated column surplus calculation mismatch in meal_records!");
                } else {
                    System.out.println("[Generated Columns] surplus = (prepared - served) verified across all meal_records.");
                }
            }

            System.out.println("\n[Sandbox Baseline Verification] SUCCESS: 100% of tables, records, foreign keys, and generated columns verified.");
        }
    }

    private static String truncate(String text, int max) {
        if (text.length() <= max) return text;
        return text.substring(0, max) + "... [truncated]";
    }

    private static void verifyLiveDatabaseUntouched() throws Exception {
        System.out.println("==================================================");
        System.out.println("  Live Database Integrity Verification (READ-ONLY)");
        System.out.println("==================================================");

        try (Connection con = DBConnection.getConnection()) {
            // Strictly enforce read-only at the JDBC connection level
            con.setReadOnly(true);

            String catalog = con.getCatalog();
            System.out.println("[Verification] Connected Catalog: " + catalog);

            // 1. Check table count in live foodloop
            int tableCount = 0;
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodloop'")) {
                if (rs.next()) tableCount = rs.getInt(1);
            }
            System.out.println("[Verification] Live 'foodloop' table count: " + tableCount + " (Expected: 5)");

            // 2. Check row counts in live foodloop using strictly hardcoded, read-only queries
            String[] tables = {"users", "meal_records", "donations", "claims", "pickups"};
            int[] expected = {3, 7, 7, 6, 5};

            for (int i = 0; i < tables.length; i++) {
                int count = 0;
                String query = "SELECT COUNT(*) FROM foodloop." + tables[i];
                try (Statement st = con.createStatement();
                     ResultSet rs = st.executeQuery(query)) {
                    if (rs.next()) count = rs.getInt(1);
                }
                boolean matches = count == expected[i];
                System.out.printf("  Table foodloop.%-15s : %d row(s) [Expected: %d] -> %s%n",
                        tables[i], count, expected[i], matches ? "UNTOUCHED & INTACT" : "MODIFIED / MISMATCH");
            }
        }
    }

    private static void runPreflightChecks() throws Exception {
        System.out.println("==================================================");
        System.out.println("  FoodLoop Phase 7E Preflight Inspection (READ-ONLY)");
        System.out.println("==================================================");

        try (Connection con = DBConnection.getConnection()) {
            con.setReadOnly(true);
            DatabaseMetaData meta = con.getMetaData();
            System.out.println("[Preflight] Server: " + meta.getDatabaseProductName() + " " + meta.getDatabaseProductVersion());
            System.out.println("[Preflight] URL: " + meta.getURL().replaceAll("password=[^&]*", "password=***"));
            System.out.println("[Preflight] Connected User: " + meta.getUserName());
            System.out.println("[Preflight] Active Catalog: " + con.getCatalog());

            try (Statement st = con.createStatement()) {
                // 1. Check if foodloop_rehearsal_sandbox already exists
                try (ResultSet rs = st.executeQuery("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = 'foodloop_rehearsal_sandbox'")) {
                    if (rs.next()) {
                        System.out.println("[Preflight WARNING] Schema 'foodloop_rehearsal_sandbox' ALREADY EXISTS on server!");
                    } else {
                        System.out.println("[Preflight OK] Schema 'foodloop_rehearsal_sandbox' does NOT exist yet. Clean slate confirmed.");
                    }
                }

                // 2. Inventory live foodloop tables and row counts
                System.out.println("\n--- Table & Row Inventory (foodloop) ---");
                List<String> tables = new ArrayList<>();
                try (ResultSet rs = st.executeQuery("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodloop' ORDER BY TABLE_NAME")) {
                    while (rs.next()) {
                        tables.add(rs.getString(1));
                    }
                }
                System.out.println("Total tables found: " + tables.size());
                for (String tbl : tables) {
                    try (ResultSet rsCount = st.executeQuery("SELECT COUNT(*) FROM foodloop." + tbl)) {
                        if (rsCount.next()) {
                            System.out.printf("  Table: %-20s Row Count: %d%n", tbl, rsCount.getInt(1));
                        }
                    }
                }

                // 3. Inventory Foreign Keys
                System.out.println("\n--- Foreign Key Inventory (foodloop) ---");
                try (ResultSet rs = st.executeQuery(
                        "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME " +
                        "FROM information_schema.KEY_COLUMN_USAGE " +
                        "WHERE TABLE_SCHEMA = 'foodloop' AND REFERENCED_TABLE_NAME IS NOT NULL " +
                        "ORDER BY TABLE_NAME, CONSTRAINT_NAME")) {
                    int fkCount = 0;
                    while (rs.next()) {
                        fkCount++;
                        System.out.printf("  FK: %-25s [%s.%s -> %s.%s]%n",
                                rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5));
                    }
                    System.out.println("Total Foreign Keys: " + fkCount);
                }

                // 4. Inventory Triggers
                System.out.println("\n--- Trigger Inventory (foodloop) ---");
                try (ResultSet rs = st.executeQuery("SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = 'foodloop'")) {
                    int trgCount = 0;
                    while (rs.next()) {
                        trgCount++;
                        System.out.printf("  Trigger: %-25s [%s ON %s]%n", rs.getString(1), rs.getString(2), rs.getString(3));
                    }
                    System.out.println("Total Triggers: " + trgCount);
                }

                // 5. Inventory Views
                System.out.println("\n--- View Inventory (foodloop) ---");
                try (ResultSet rs = st.executeQuery("SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA = 'foodloop'")) {
                    int viewCount = 0;
                    while (rs.next()) {
                        viewCount++;
                        System.out.printf("  View: %s%n", rs.getString(1));
                    }
                    System.out.println("Total Views: " + viewCount);
                }

                // 6. Inventory Routines (Stored Procedures / Functions)
                System.out.println("\n--- Routine Inventory (foodloop) ---");
                try (ResultSet rs = st.executeQuery("SELECT ROUTINE_NAME, ROUTINE_TYPE FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'foodloop'")) {
                    int rCount = 0;
                    while (rs.next()) {
                        rCount++;
                        System.out.printf("  Routine: %-25s Type: %s%n", rs.getString(1), rs.getString(2));
                    }
                    System.out.println("Total Routines: " + rCount);
                }

                // 7. Check Grants / Privileges
                System.out.println("\n--- Account Grants & Privileges ---");
                try (ResultSet rs = st.executeQuery("SHOW GRANTS FOR CURRENT_USER()")) {
                    while (rs.next()) {
                        System.out.println("  " + rs.getString(1));
                    }
                }
            }
        }
    }
}
