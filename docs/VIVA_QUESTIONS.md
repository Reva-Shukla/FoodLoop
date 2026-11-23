# FoodLoop — Technical Viva Questions & Answers (20 Questions)

*Prepared for Chitkara University CSE Project Viva & Technical Evaluations*

---

### Category 1: Backend Architecture & Java HttpServer

#### Q1: Why did you choose standard `com.sun.net.httpserver.HttpServer` instead of Spring Boot?
**Answer:**
We deliberately chose the lightweight standard library `com.sun.net.httpserver.HttpServer` to demonstrate mastery of core Java network programming, custom routing, and multi-threading without relying on bulky framework abstractions. It has zero external framework dependencies, boots in under 500 milliseconds, runs with low memory overhead, and allows us to implement custom filters, CORS handlers, and dispatchers from scratch.

#### Q2: How does the Java backend handle concurrent requests?
**Answer:**
`HttpServer` is paired with an `ExecutorService` (via `Executors.newCachedThreadPool()` or fixed thread pools). Each incoming HTTP exchange is handed off to a dedicated worker thread. Thread safety is maintained by using stateless handler classes and delegating database concurrency to transactional row-locking at the database layer.

#### Q3: How is Cross-Origin Resource Sharing (CORS) implemented securely in FoodLoop?
**Answer:**
Rather than using an insecure wildcard (`Access-Control-Allow-Origin: *`) which prevents cookie exchange, our `CorsUtil` implements origin reflection against an explicit whitelist (`http://localhost:3000`, `http://localhost:5173`). For preflight `OPTIONS` requests, it returns `HTTP 204 No Content` with `Access-Control-Allow-Credentials: true` and permitted headers. Malicious origins are rejected with `HTTP 403 Forbidden`.

---

### Category 2: JDBC, Concurrency & Database Transactions

#### Q4: How do you prevent two NGOs from claiming the same donation at the exact same moment (race condition)?
**Answer:**
We use pessimistic row-level locking with SQL `FOR UPDATE` inside an explicit transaction:
```sql
SELECT donation_id, status FROM donations WHERE donation_id = ? AND status = 'AVAILABLE' FOR UPDATE;
```
By disabling `autoCommit(false)`, the first thread obtains an exclusive row lock on the donation record. The second concurrent thread blocks until the first transaction commits. When the second thread acquires the lock, it observes `status = 'CLAIMED'` and immediately rolls back with `HTTP 409 Conflict`.

#### Q5: What is a stored generated column in MySQL, and how does FoodLoop use it?
**Answer:**
A stored generated column is computed automatically by MySQL from an expression and stored physically on disk. In `meal_records`, we define:
```sql
surplus INT GENERATED ALWAYS AS (prepared - served) STORED
```
This guarantees that surplus is always mathematically consistent with prepared and served portions, prevents manual tampering, and allows indexing for high-performance reporting.

#### Q6: Why do MySQL DDL statements cause implicit commits, and why does this matter for database migrations?
**Answer:**
In MySQL InnoDB, data definition statements (`CREATE TABLE`, `ALTER TABLE`, `DROP INDEX`, etc.) cannot be executed within a transaction. MySQL automatically issues an implicit `COMMIT` before and after each DDL statement. Therefore, a multi-statement DDL migration cannot be rolled back using SQL `ROLLBACK`. To handle this safely, FoodLoop's migration scripts use idempotent helper procedures (`SafeAddColumn`, `SafeDropForeignKey`) and preflight assertions, backed by fresh physical `mysqldump` restore procedures.

#### Q7: How does FoodLoop enforce referential integrity across the 7 tables?
**Answer:**
We enforce foreign key constraints with `ON UPDATE CASCADE` and `ON DELETE SET NULL` or `RESTRICT`. For example:
- `fk_meals_hostel`: `meal_records.mess_id -> hostels.hostel_id`
- `fk_donations_meal`: `donations.meal_record_id -> meal_records.meal_id`
- `fk_pickups_donation`: `pickups.donation_id -> donations.donation_id`
In InnoDB, foreign keys allow `NULL` values. This allows historical sample demo records to have `mess_id = NULL` without violating referential integrity.

---

### Category 3: Authentication, Security & Sessions

#### Q8: How are user passwords stored securely in FoodLoop?
**Answer:**
Passwords are hashed using PBKDF2 (Password-Based Key Derivation Function 2) with HMAC-SHA256, 10,000 iterations, and a cryptographically random 16-byte salt:
```
PBKDF2:10000:<salt_hex>:<hash_hex>
```
To support legacy seed data during migration rehearsals, our `PasswordUtil` includes an automated fallback verification mechanism that transparently checks legacy SHA-256 hashes without storing plaintexts.

#### Q9: How is session authentication and Role-Based Access Control (RBAC) managed?
**Answer:**
Upon successful login, `SessionManager` generates a secure random session token (32 bytes / 64 hex characters) stored in an in-memory concurrent map with user metadata. The token is transmitted via an `HttpOnly` cookie and JSON Bearer token. `AuthUtil.requireRole(exchange, "MESS" | "NGO" | "ADMIN")` validates role authorization on every protected route.

#### Q10: How does FoodLoop guard against Cross-Site Request Forgery (CSRF)?
**Answer:**
We enforce custom header verification (`X-Requested-With: XMLHttpRequest`). Because modern web browsers forbid cross-origin scripts from appending custom headers to simple requests without explicit preflight authorization, state-changing mutations (`POST`, `PUT`) sent without this header are blocked with `HTTP 403 Forbidden`.

---

### Category 4: Food Safety & Mathematical Conservation

#### Q11: What is FoodLoop's policy on plate leftovers versus unserved kitchen surplus?
**Answer:**
FoodLoop strictly prohibits the redistribution of plate leftovers, touched food, or dining hall table scraps due to microbiological and biohazard contamination risks. Only food that remained unserved in batch holding inside the kitchen under temperature control is eligible for donation. This is enforced by:
1. Compulsory mess manager food-safety affirmations on the frontend.
2. Keyword rejection filters on the backend (`DonationHandler` rejects "leftover", "plate scrap", etc. with `HTTP 400`).
3. Compulsory storage condition and allergen declarations.

#### Q12: Explain the mass-balance conservation equation in FoodLoop.
**Answer:**
FoodLoop enforces closed-loop quantity conservation for every meal batch:
$$\text{Prepared} = \text{Served} + \text{Donated (Completed)} + \text{Active / Claimed Reserved} + \text{Wasted (Discard Logs)} + \text{Unallocated Surplus}$$
This ensures that every portion cooked in a university kitchen is accounted for across its lifecycle.

#### Q13: How does FoodLoop treat the historical "Main College Mess" sample data?
**Answer:**
The original historical records referencing "Main College Mess" (`mess_id = 1`) were confirmed to be prototype sample/demo data. To maintain absolute historical honesty:
1. They are NOT assigned to Franklin Mess or any real hostel.
2. They are flagged with `is_demo = TRUE` and `mess_id = NULL`.
3. In `SupervisorHandler`, analytics queries filter `if (m.getMessId() == null || !hostelMap.containsKey(m.getMessId())) continue;`. This guarantees that historical demo portions (890 portions) do not inflate genuine Chitkara University dining metrics.
4. All 7 demo donations have closed statuses (`PICKED_UP`, `CLAIMED`, `EXPIRED`) and are excluded from active NGO listings.

---

### Category 5: Frontend Architecture & State Management

#### Q14: How does React communicate with the Java backend without CORS conflicts in development?
**Answer:**
In development, Vite runs on port 3000 and proxies all requests starting with `/api` directly to the Java backend running on port 8089 via `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_TARGET || 'http://localhost:8089',
      changeOrigin: true
    }
  }
}
```
This bypasses cross-origin restrictions in the browser while maintaining standard relative URLs (`/api/...`).

#### Q15: How is global state managed in the frontend?
**Answer:**
State is managed using React Context API with two primary providers:
- `AuthContext`: Holds current user profile, active session, assigned hostel, and role-switching utilities.
- `FoodLoopContext`: Provides shared caching and role-aware data fetching for meals, donations, claims, and hostels using `Promise.allSettled`.

---

### Category 6: Operational Excellence & Future Enhancements

#### Q16: How do you verify that an isolated database migration does not accidentally touch the live production database?
**Answer:**
We implement three defense-in-depth safety layers:
1. Execution runner gates: `DatabaseRunner` verifies `con.getCatalog()` and `SELECT DATABASE()` before executing any SQL statement.
2. Script assertions: The first statement in the migration script creates a temporary stored procedure that asserts `DATABASE() = 'target_db'` and throws `SIGNAL SQLSTATE '45000'` if the database name differs.
3. Backup sanitization: All SQL dumps are stripped of `CREATE DATABASE` and `USE` directives, ensuring they restore strictly into the connected database.

#### Q17: What happens if an NGO claims a donation but fails to arrive before the safe collection deadline?
**Answer:**
FoodLoop includes a multithreaded daemon monitor (`DonationExpiryMonitor`) and automated deadline checks. In `DonationDAO`, claims and pickups check `deadline > NOW()`. If a pickup deadline passes, the pickup status transitions to `MISSED`, the donation transitions to `EXPIRED`, and the uncollected food is marked for safe disposal to prevent contaminated food from reaching the public.

#### Q18: What are the primary bottlenecks in this architecture and how would you scale it?
**Answer:**
1. In-memory sessions: Currently stored in memory; scaling across multiple server nodes would require an external distributed cache like Redis.
2. Database connections: Currently using `DriverManager.getConnection()`; in high-traffic enterprise production, introducing a connection pool like HikariCP would reduce connection creation overhead.
3. Read/Write splitting: Supervisor analytics queries could be offloaded to read replicas to avoid blocking operational kitchen meal logging.

#### Q19: What design patterns did you implement in the codebase?
**Answer:**
- **Data Access Object (DAO) Pattern:** Decouples business logic in HTTP handlers from low-level JDBC SQL queries.
- **Data Transfer Object (DTO) Pattern:** Sanitizes entity models before serializing to JSON (e.g. omitting password hashes).
- **Front Controller / Dispatcher Pattern:** `ApiServer` routes HTTP requests to modular handler instances.
- **Singleton / Static Utility Pattern:** Centralizes cross-cutting concerns in `JsonResponseUtil`, `AuthUtil`, and `CorsUtil`.

#### Q20: What is the single biggest real-world impact of FoodLoop?
**Answer:**
FoodLoop bridges the communication and accountability gap between college dining operations and community NGOs. By automating surplus verification, enforcing strict food-safety protocols, and providing total transparency into kitchen discard trends, FoodLoop turns potential campus food waste into safe, dignified meals for people in need.
