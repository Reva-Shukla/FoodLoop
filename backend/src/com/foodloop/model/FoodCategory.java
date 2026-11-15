package com.foodloop.model;

/**
 * Enum: FoodCategory
 * Dietary and food category grouping.
 */
public enum FoodCategory {
    VEGETARIAN("Vegetarian"),
    NON_VEGETARIAN("Non-Vegetarian"),
    VEGAN("Vegan"),
    BAKERY("Bakery & Breads"),
    DAIRY("Dairy & Desserts"),
    GRAINS_AND_STAPLES("Grains & Staples"),
    BEVERAGES("Beverages"),
    OTHER("Other");

    private final String label;

    FoodCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static FoodCategory fromString(String category) {
        if (category == null) return VEGETARIAN;
        for (FoodCategory c : values()) {
            if (c.name().equalsIgnoreCase(category.trim().replace(" ", "_").replace("-", "_"))
                    || c.label.equalsIgnoreCase(category.trim())) {
                return c;
            }
        }
        return OTHER;
    }
}
