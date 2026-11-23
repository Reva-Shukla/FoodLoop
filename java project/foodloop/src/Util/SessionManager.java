package Util;

import com.sun.net.httpserver.HttpExchange;
import foodloop.src.Model.User;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    public static class UserSession {
        private final String sessionId;
        private final int userId;
        private final String name;
        private final String email;
        private final String role;
        private final String assignedMessId;
        private final String assignedMessName;
        private final String organization;
        private final String department;
        private final String location;
        private final String foodPreference;
        private final long createdAt;
        private final long expiresAt;

        public UserSession(String sessionId, int userId, String name, String email,
                           String role, String assignedMessId, String assignedMessName,
                           String organization, String department, String location,
                           String foodPreference, long expiresAt) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.role = role != null ? role.toUpperCase() : "MESS";
            this.assignedMessId = assignedMessId;
            this.assignedMessName = assignedMessName;
            this.organization = organization;
            this.department = department;
            this.location = location;
            this.foodPreference = foodPreference;
            this.createdAt = System.currentTimeMillis();
            this.expiresAt = expiresAt;
        }

        public String getSessionId() { return sessionId; }
        public int getUserId() { return userId; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public String getAssignedMessId() { return assignedMessId; }
        public String getAssignedMessName() { return assignedMessName; }
        public String getOrganization() { return organization; }
        public String getDepartment() { return department; }
        public String getLocation() { return location; }
        public String getFoodPreference() { return foodPreference; }
        public boolean isExpired() { return System.currentTimeMillis() > expiresAt; }

        public Map<String, Object> toUserDto() {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", userId);
            map.put("userId", userId);
            map.put("name", name);
            map.put("email", email);
            map.put("role", role);
            map.put("roleTitle", getRoleTitle());
            map.put("portalName", getPortalName());
            map.put("assignedMessId", assignedMessId);
            map.put("assignedMessName", assignedMessName);
            map.put("organization", organization);
            map.put("department", department);
            map.put("location", location);
            map.put("foodPreference", foodPreference);
            map.put("destination", getDestination());
            return map;
        }

        public String getRoleTitle() {
            switch (role) {
                case "MESS": return "Mess Manager";
                case "NGO": return "NGO Partner";
                case "ADMIN": return "Campus Supervisor";
                default: return role;
            }
        }

        public String getPortalName() {
            switch (role) {
                case "MESS": return "Mess Manager Portal";
                case "NGO": return "NGO Partner Portal";
                case "ADMIN": return "Campus Supervisor Portal";
                default: return "FoodLoop Portal";
            }
        }

        public String getDestination() {
            switch (role) {
                case "MESS": return "/mess";
                case "NGO": return "/ngo";
                case "ADMIN": return "/supervisor";
                default: return "/";
            }
        }
    }

    private static final long SESSION_DURATION_MS = 24 * 60 * 60 * 1000L; // 24 hours
    private static final String COOKIE_NAME = "FOODLOOP_SESSION";
    private static final Map<String, UserSession> activeSessions = new ConcurrentHashMap<>();

    public static UserSession createSession(User user) {
        String token = UUID.randomUUID().toString().replace("-", "");
        long expiresAt = System.currentTimeMillis() + SESSION_DURATION_MS;
        UserSession session = new UserSession(
                token,
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAssignedMessId(),
                user.getAssignedMessName(),
                user.getOrganization(),
                user.getDepartment(),
                user.getLocation(),
                user.getFoodPreference(),
                expiresAt
        );
        activeSessions.put(token, session);
        return session;
    }

    public static UserSession createTestSession(int userId, String name, String email, String role, String assignedMessId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        long expiresAt = System.currentTimeMillis() + SESSION_DURATION_MS;
        UserSession session = new UserSession(
                token,
                userId,
                name,
                email,
                role,
                assignedMessId,
                null,
                null,
                null,
                "Chitkara University",
                "VEG",
                expiresAt
        );
        activeSessions.put(token, session);
        return session;
    }

    public static UserSession getSession(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        UserSession session = activeSessions.get(token);
        if (session != null) {
            if (session.isExpired()) {
                activeSessions.remove(token);
                return null;
            }
        }
        return session;
    }

    public static void invalidateSession(String token) {
        if (token != null) {
            activeSessions.remove(token);
        }
    }

    public static String extractSessionToken(HttpExchange exchange) {
        // 1. Check Cookie header
        List<String> cookieHeaders = exchange.getRequestHeaders().get("Cookie");
        if (cookieHeaders != null) {
            for (String header : cookieHeaders) {
                String[] cookies = header.split(";");
                for (String c : cookies) {
                    String[] parts = c.trim().split("=", 2);
                    if (parts.length == 2 && COOKIE_NAME.equalsIgnoreCase(parts[0])) {
                        return parts[1];
                    }
                }
            }
        }

        // 2. Check Authorization header: Bearer <token>
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authHeader.substring(7).trim();
        }

        // 3. Check X-Session-Token header
        String customHeader = exchange.getRequestHeaders().getFirst("X-Session-Token");
        if (customHeader != null && !customHeader.trim().isEmpty()) {
            return customHeader.trim();
        }

        return null;
    }

    public static void setSessionCookie(HttpExchange exchange, String token, boolean delete) {
        if (delete) {
            exchange.getResponseHeaders().add("Set-Cookie",
                    COOKIE_NAME + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
        } else {
            exchange.getResponseHeaders().add("Set-Cookie",
                    COOKIE_NAME + "=" + token + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400");
        }
    }
}
