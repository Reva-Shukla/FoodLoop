package com.foodloop.model;

/**
 * Enum: DonationStatus
 * Lifecycle states of a food donation in FoodLoop.
 */
public enum DonationStatus {
    PENDING("Pending donor match"),
    ACCEPTED("Accepted by NGO recipient"),
    PICKUP_IN_PROGRESS("Volunteer / NGO is en route"),
    COMPLETED("Successfully picked up & distributed"),
    CANCELLED("Cancelled by donor"),
    EXPIRED("Passed safe consumption window");

    private final String description;

    DonationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public static DonationStatus fromString(String status) {
        if (status == null) return PENDING;
        try {
            return DonationStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PENDING;
        }
    }
}
