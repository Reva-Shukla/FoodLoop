package com.foodloop.model;

/**
 * Enum: DonorType
 * Categories of donors supported in Member 1 module.
 */
public enum DonorType {
    RESTAURANT("Restaurant"),
    COLLEGE_MESS("College Mess"),
    HOSTEL("Hostel"),
    CATERER("Caterer");

    private final String label;

    DonorType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static DonorType fromString(String type) {
        if (type == null) return RESTAURANT;
        try {
            return DonorType.valueOf(type.trim().toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return RESTAURANT;
        }
    }
}
