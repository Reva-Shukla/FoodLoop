package foodloop.src.Util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class PasswordUtil {
    private static final int PBKDF2_ITERATIONS = 10000;
    private static final int SALT_BYTES = 16;
    private static final int KEY_LENGTH_BITS = 256;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Hash a plain-text password using PBKDF2WithHmacSHA256 with a secure random salt.
     * Returns format: PBKDF2:10000:<saltHex>:<hashHex>
     */
    public static String hashPassword(String password) {
        if (password == null) {
            throw new IllegalArgumentException("Password cannot be null");
        }
        byte[] salt = new byte[SALT_BYTES];
        SECURE_RANDOM.nextBytes(salt);
        byte[] hash = pbkdf2(password.toCharArray(), salt, PBKDF2_ITERATIONS, KEY_LENGTH_BITS);
        return "PBKDF2:" + PBKDF2_ITERATIONS + ":" + toHex(salt) + ":" + toHex(hash);
    }

    /**
     * Verify a plain-text password against a stored password string.
     * Supports:
     * 1. Modern PBKDF2 hashes (PBKDF2:<iterations>:<saltHex>:<hashHex>)
     * 2. Teammate Phase 7B SHA-256 hashes (64 hex characters)
     * 3. Seed demonstration accounts (e.g. Demo@123) for backward compatibility
     */
    public static boolean verifyPassword(String plainText, String storedHash) {
        if (plainText == null || storedHash == null || storedHash.isEmpty()) {
            return false;
        }

        // 1. PBKDF2 format
        if (storedHash.startsWith("PBKDF2:")) {
            String[] parts = storedHash.split(":");
            if (parts.length != 4) {
                return false;
            }
            try {
                int iterations = Integer.parseInt(parts[1]);
                byte[] salt = fromHex(parts[2]);
                byte[] expectedHash = fromHex(parts[3]);
                byte[] actualHash = pbkdf2(plainText.toCharArray(), salt, iterations, expectedHash.length * 8);
                return MessageDigest.isEqual(expectedHash, actualHash);
            } catch (Exception e) {
                return false;
            }
        }

        // 2. Legacy SHA-256 hash (64 hex chars)
        if (storedHash.length() == 64 && isHex(storedHash)) {
            String sha256 = hashSha256(plainText);
            return MessageDigest.isEqual(
                storedHash.toLowerCase().getBytes(StandardCharsets.UTF_8),
                sha256.toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        }

        // 3. Raw seed password comparison (e.g. initial foodloop_schema.sql demo accounts)
        return MessageDigest.isEqual(
            plainText.getBytes(StandardCharsets.UTF_8),
            storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Hash using legacy SHA-256. Preserved for backward compatibility.
     */
    public static String hashSha256(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return toHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private static byte[] pbkdf2(char[] password, byte[] salt, int iterations, int keyLength) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, keyLength);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return skf.generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("PBKDF2 computation failed", e);
        }
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static byte[] fromHex(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                                 + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    private static boolean isHex(String s) {
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'))) {
                return false;
            }
        }
        return true;
    }
}
