package com.foodloop.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Utility: PasswordHasher
 * Syllabus Concept: Java Security & Cryptography
 * 
 * Provides secure password hashing using SHA-256 with cryptographically strong
 * random salts, satisfying the strict requirement to never store plain-text passwords.
 */
public class PasswordHasher {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int SALT_BYTES = 16;

    /**
     * Hashes a raw password with a newly generated salt.
     * Returned string format: "saltHex:sha256Hex"
     */
    public static String hashPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        byte[] salt = new byte[SALT_BYTES];
        SECURE_RANDOM.nextBytes(salt);
        String saltHex = HexFormat.of().formatHex(salt);
        String hashHex = computeSha256(rawPassword, saltHex);
        return saltHex + ":" + hashHex;
    }

    /**
     * Verifies raw password against stored "saltHex:hashHex" string.
     */
    public static boolean verifyPassword(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null || !storedHash.contains(":")) {
            return false;
        }
        String[] parts = storedHash.split(":", 2);
        String saltHex = parts[0];
        String expectedHash = parts[1];
        String computedHash = computeSha256(rawPassword, saltHex);
        return MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.UTF_8),
                computedHash.getBytes(StandardCharsets.UTF_8)
        );
    }

    private static String computeSha256(String password, String saltHex) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(saltHex.getBytes(StandardCharsets.UTF_8));
            byte[] digest = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available in JVM", e);
        }
    }
}
