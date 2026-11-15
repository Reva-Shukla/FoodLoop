package com.foodloop.util;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

/**
 * Utility: ValidationUtil
 * Validation logic for donor registration, profile, and food donation details.
 */
public class ValidationUtil {
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    // Matches phones: optional country code, spaces, dashes, 7-15 digits
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^(\\+?[0-9]{1,4}[\\s-]?)?[0-9]{7,14}$"
    );

    public static boolean isValidEmail(String email) {
        if (email == null) return false;
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    public static boolean isValidPhone(String phone) {
        if (phone == null) return false;
        String cleaned = phone.replaceAll("[\\s()-]", "");
        return PHONE_PATTERN.matcher(cleaned).matches();
    }

    public static boolean isNonEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }

    public static boolean isFutureDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return false;
        return dateTime.isAfter(LocalDateTime.now());
    }

    public static boolean isValidQuantity(double quantity) {
        return quantity > 0.0 && !Double.isNaN(quantity) && !Double.isInfinite(quantity);
    }
}
