package com.foodloop.service;

import com.foodloop.dao.DonorDAO;
import com.foodloop.exceptions.AuthenticationException;
import com.foodloop.model.Donor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service: AuthService
 * Thread-safe token authentication and session tracking in Core Java.
 */
public class AuthService {
    private final DonorDAO donorDAO;

    // Session cache: Token -> SessionInfo
    private static final Map<String, SessionInfo> SESSIONS = new ConcurrentHashMap<>();
    private static final long SESSION_EXPIRY_HOURS = 24;

    public static class SessionInfo {
        private final Long donorId;
        private final Long userId;
        private final LocalDateTime expiresAt;

        public SessionInfo(Long donorId, Long userId, LocalDateTime expiresAt) {
            this.donorId = donorId;
            this.userId = userId;
            this.expiresAt = expiresAt;
        }

        public Long getDonorId() { return donorId; }
        public Long getUserId() { return userId; }
        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    public AuthService(DonorDAO donorDAO) {
        this.donorDAO = donorDAO;
    }

    /**
     * Authenticates donor credentials and issues an active session token.
     */
    public AuthResult login(String email, String password) throws AuthenticationException {
        if (email == null || email.trim().isEmpty() || password == null || password.isEmpty()) {
            throw new AuthenticationException("Email and password are required.");
        }

        Donor donor = donorDAO.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password."));

        if (!donor.verifyPassword(password)) {
            throw new AuthenticationException("Invalid email or password.");
        }

        // Generate secure random UUID token
        String token = "fl_sess_" + UUID.randomUUID().toString().replace("-", "");
        SessionInfo session = new SessionInfo(donor.getDonorId(), donor.getId(),
                LocalDateTime.now().plusHours(SESSION_EXPIRY_HOURS));
        SESSIONS.put(token, session);

        return new AuthResult(token, donor);
    }

    public void logout(String token) {
        if (token != null) {
            SESSIONS.remove(token);
        }
    }

    public Optional<Donor> getDonorByToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return Optional.empty();
        }
        String cleanToken = token.replace("Bearer ", "").trim();
        SessionInfo session = SESSIONS.get(cleanToken);
        if (session == null || session.isExpired()) {
            if (session != null) SESSIONS.remove(cleanToken);
            return Optional.empty();
        }
        return donorDAO.findById(session.getDonorId());
    }

    public static class AuthResult {
        private final String token;
        private final Donor donor;

        public AuthResult(String token, Donor donor) {
            this.token = token;
            this.donor = donor;
        }

        public String getToken() { return token; }
        public Donor getDonor() { return donor; }
    }
}
