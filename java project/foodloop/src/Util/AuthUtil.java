package Util;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class AuthUtil {

    public static class ApiException extends RuntimeException {
        private final int statusCode;
        public ApiException(String message, int statusCode) {
            super(message);
            this.statusCode = statusCode;
        }
        public int getStatusCode() { return statusCode; }
    }

    public static class UnauthorizedException extends ApiException {
        public UnauthorizedException(String message) {
            super(message, 401);
        }
    }

    public static class ForbiddenException extends ApiException {
        public ForbiddenException(String message) {
            super(message, 403);
        }
    }

    public static class ValidationException extends ApiException {
        public ValidationException(String message) {
            super(message, 400);
        }
    }

    public static class NotFoundException extends ApiException {
        public NotFoundException(String message) {
            super(message, 404);
        }
    }

    public static class ConflictException extends ApiException {
        public ConflictException(String message) {
            super(message, 409);
        }
    }

    /**
     * Resolves the current session, or returns null if not logged in.
     */
    public static SessionManager.UserSession getSession(HttpExchange exchange) {
        String token = SessionManager.extractSessionToken(exchange);
        if (token == null) {
            return null;
        }
        return SessionManager.getSession(token);
    }

    /**
     * Requires authentication. Throws 401 if unauthenticated.
     */
    public static SessionManager.UserSession requireAuth(HttpExchange exchange) {
        SessionManager.UserSession session = getSession(exchange);
        if (session == null) {
            throw new UnauthorizedException("Authentication required. Please log in.");
        }
        return session;
    }

    /**
     * Requires authenticated user to have one of the permitted roles. Throws 403 if unauthorized.
     */
    public static SessionManager.UserSession requireRole(HttpExchange exchange, String... allowedRoles) {
        SessionManager.UserSession session = requireAuth(exchange);
        for (String role : allowedRoles) {
            if (role.equalsIgnoreCase(session.getRole())) {
                return session;
            }
        }
        throw new ForbiddenException("Forbidden: Access denied for role " + session.getRole()
                + ". Required one of: " + Arrays.toString(allowedRoles));
    }

    /**
     * Validates that a Mess Manager is authorized for the given messId.
     * ADMIN is permitted access to all messes.
     */
    public static SessionManager.UserSession requireMessAccess(HttpExchange exchange, String targetMessId) {
        SessionManager.UserSession session = requireRole(exchange, "MESS", "ADMIN");
        if ("ADMIN".equalsIgnoreCase(session.getRole())) {
            return session;
        }
        if (targetMessId != null && !targetMessId.trim().isEmpty()
                && !targetMessId.equalsIgnoreCase(session.getAssignedMessId())) {
            throw new ForbiddenException("Forbidden: You can only view and manage your assigned mess: "
                    + session.getAssignedMessId());
        }
        return session;
    }

    /**
     * CSRF protection for cookie-authenticated state-changing requests (POST, PUT, DELETE).
     */
    public static void validateCsrf(HttpExchange exchange) {
        String method = exchange.getRequestMethod().toUpperCase();
        if ("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method)) {
            return;
        }

        // Only enforce CSRF when authenticated via Cookie (Bearer auth is inherently immune)
        List<String> cookieHeaders = exchange.getRequestHeaders().get("Cookie");
        boolean hasSessionCookie = false;
        if (cookieHeaders != null) {
            for (String h : cookieHeaders) {
                if (h.contains("FOODLOOP_SESSION=")) {
                    hasSessionCookie = true;
                    break;
                }
            }
        }

        if (!hasSessionCookie) {
            return; // Token in header or unauthenticated request
        }

        // Verify custom header presence
        String requestedWith = exchange.getRequestHeaders().getFirst("X-Requested-With");
        String csrfHeader = exchange.getRequestHeaders().getFirst("X-CSRF-Token");
        if (requestedWith != null || csrfHeader != null) {
            return; // Approved custom header
        }

        // Or verify Origin / Referer matches approved origins
        String origin = exchange.getRequestHeaders().getFirst("Origin");
        if (origin != null && CorsUtil.isAllowedOrigin(origin)) {
            return;
        }
        String referer = exchange.getRequestHeaders().getFirst("Referer");
        if (referer != null && (referer.startsWith("http://localhost:") || referer.startsWith("http://127.0.0.1:"))) {
            return;
        }

        throw new ForbiddenException("Forbidden: CSRF verification failed for state-changing request.");
    }
}
