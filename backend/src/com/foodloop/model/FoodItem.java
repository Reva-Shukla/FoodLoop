package com.foodloop.model;

/**
 * Domain Object: FoodItem
 * Syllabus Concept: Classes, Objects, and Encapsulation
 * 
 * Represents the food details encapsulated within a donation.
 */
public class FoodItem {
    private String name;
    private String description;
    private double quantity;
    private String quantityUnit;
    private FoodCategory category;
    private FoodType foodType;
    private boolean isUnservedSurplus;

    public FoodItem() {}

    public FoodItem(String name, String description, double quantity, String quantityUnit,
                    FoodCategory category, FoodType foodType, boolean isUnservedSurplus) {
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.quantityUnit = quantityUnit;
        this.category = category;
        this.foodType = foodType;
        this.isUnservedSurplus = isUnservedSurplus;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getQuantity() {
        return quantity;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public String getQuantityUnit() {
        return quantityUnit;
    }

    public void setQuantityUnit(String quantityUnit) {
        this.quantityUnit = quantityUnit;
    }

    public FoodCategory getCategory() {
        return category;
    }

    public void setCategory(FoodCategory category) {
        this.category = category;
    }

    public FoodType getFoodType() {
        return foodType;
    }

    public void setFoodType(FoodType foodType) {
        this.foodType = foodType;
    }

    public boolean isUnservedSurplus() {
        return isUnservedSurplus;
    }

    public void setUnservedSurplus(boolean unservedSurplus) {
        isUnservedSurplus = unservedSurplus;
    }
}
