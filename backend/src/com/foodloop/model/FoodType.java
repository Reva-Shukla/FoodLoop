package com.foodloop.model;

/**
 * Enum: FoodType
 * Food freshness classification as shown in UI reference.
 */
public enum FoodType {
    FRESH("Fresh"),
    COOKED("Cooked"),
    PACKAGED("Packaged");

    private final String label;

    FoodType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static FoodType fromString(String type) {
        if (type == null) return FRESH;
        try {
            return FoodType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return FRESH;
        }
    }
}
