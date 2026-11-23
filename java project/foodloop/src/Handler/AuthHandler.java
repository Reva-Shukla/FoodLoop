package Handler;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;
import Util.AuthUtil;
import Util.CorsUtil;
import Util.JsonResponseUtil;
import Util.SessionManager;
import foodloop.src.Dao.UserDAO;
import foodloop.src.Model.User;
import foodloop.src.Util.PasswordUtil;

public class AuthHandler implements HttpHandler {
    private final UserDAO userDAO = new UserDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            AuthUtil.validateCsrf(exchange);
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod().toUpperCase();

            if (path.endsWith("/login") && "POST".equals(method)) {
                handleLogin(exchange);
            } else if (path.endsWith("/register") && "POST".equals(method)) {
                handleRegister(exchange);
            } else if (path.endsWith("/me") && "GET".equals(method)) {
                handleMe(exchange);
            } else if (path.endsWith("/logout") && "POST".equals(method)) {
                handleLogout(exchange);
            } else {
                JsonResponseUtil.sendError(exchange, "Endpoint not found: " + path, 404);
            }
        } catch (AuthUtil.ApiException e) {
            JsonResponseUtil.sendError(exchange, e.getMessage(), e.getStatusCode());
        } catch (SQLException e) {
            JsonResponseUtil.sendError(exchange, "Database error: " + e.getMessage(), 500);
        } catch (Exception e) {
            JsonResponseUtil.sendError(exchange, "Internal server error: " + e.getMessage(), 500);
        }
    }

    private void handleLogin(HttpExchange exchange) throws Exception {
        String body = JsonResponseUtil.readRequestBody(exchange);
        JsonObject json;
        try {
            json = JsonParser.parseString(body).getAsJsonObject();
        } catch (Exception e) {
            throw new AuthUtil.ValidationException("Invalid JSON request body.");
        }

        String email = json.has("email") ? json.get("email").getAsString().trim() : null;
        String password = json.has("password") ? json.get("password").getAsString() : null;

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            throw new AuthUtil.ValidationException("Please provide both email and password.");
        }

        User user = userDAO.getUser(email);
        if (user == null || !PasswordUtil.verifyPassword(password, user.getPassword())) {
            throw new AuthUtil.UnauthorizedException("Invalid email or password.");
        }

        SessionManager.UserSession session = SessionManager.createSession(user);
        SessionManager.setSessionCookie(exchange, session.getSessionId(), false);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("token", session.getSessionId());
        resp.put("user", session.toUserDto());
        resp.put("destination", session.getDestination());
        JsonResponseUtil.sendJson(exchange, resp, 200);
    }

    private void handleRegister(HttpExchange exchange) throws Exception {
        String body = JsonResponseUtil.readRequestBody(exchange);
        JsonObject json;
        try {
            json = JsonParser.parseString(body).getAsJsonObject();
        } catch (Exception e) {
            throw new AuthUtil.ValidationException("Invalid JSON request body.");
        }

        String name = json.has("name") ? json.get("name").getAsString().trim() : null;
        String email = json.has("email") ? json.get("email").getAsString().trim().toLowerCase() : null;
        String password = json.has("password") ? json.get("password").getAsString() : null;
        String role = json.has("role") ? json.get("role").getAsString().trim().toUpperCase() : null;
        String organization = json.has("organization") ? json.get("organization").getAsString().trim() : null;
        String messId = json.has("proposedMessId") ? json.get("proposedMessId").getAsString().trim()
                : (json.has("assignedMessId") ? json.get("assignedMessId").getAsString().trim() : null);
        String location = json.has("location") ? json.get("location").getAsString().trim() : null;
        String foodPreference = json.has("foodPreference") ? json.get("foodPreference").getAsString().trim() : "VEG";
        String department = json.has("department") ? json.get("department").getAsString().trim() : null;

        if (name == null || name.isEmpty()) {
            throw new AuthUtil.ValidationException("Name is required.");
        }
        if (email == null || !email.contains("@")) {
            throw new AuthUtil.ValidationException("Valid email address is required.");
        }
        if (password == null || password.length() < 6) {
            throw new AuthUtil.ValidationException("Password must be at least 6 characters.");
        }
        if (role == null || (!"MESS".equals(role) && !"NGO".equals(role))) {
            if ("ADMIN".equalsIgnoreCase(role)) {
                throw new AuthUtil.ForbiddenException("Public registration for ADMIN role is not permitted.");
            }
            throw new AuthUtil.ValidationException("Role must be MESS or NGO.");
        }
        if ("MESS".equals(role) && (messId == null || messId.isEmpty())) {
            throw new AuthUtil.ValidationException("Assigned mess ID is required for Mess Managers.");
        }

        // Check duplicate email
        User existing = userDAO.getUser(email);
        if (existing != null) {
            throw new AuthUtil.ConflictException("Email is already registered: " + email);
        }

        User newUser = new User(
                0,
                name,
                email,
                password,
                role,
                location,
                foodPreference,
                messId,
                null,
                organization,
                department
        );

        boolean created = userDAO.addUser(newUser);
        if (!created) {
            throw new SQLException("Failed to create user record.");
        }

        User inserted = userDAO.getUser(email);
        int generatedId = inserted != null ? inserted.getUserId() : 1;

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Application submitted for campus approval.");
        resp.put("requestId", generatedId);
        JsonResponseUtil.sendJson(exchange, resp, 201);
    }

    private void handleMe(HttpExchange exchange) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireAuth(exchange);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("token", session.getSessionId());
        resp.put("user", session.toUserDto());
        JsonResponseUtil.sendJson(exchange, resp, 200);
    }

    private void handleLogout(HttpExchange exchange) throws Exception {
        String token = SessionManager.extractSessionToken(exchange);
        if (token != null) {
            SessionManager.invalidateSession(token);
        }
        SessionManager.setSessionCookie(exchange, "", true);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Logged out successfully");
        JsonResponseUtil.sendJson(exchange, resp, 200);
    }
}
