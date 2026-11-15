package com.foodloop.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Entity: Donation
 * Syllabus Concepts Demonstrated:
 *  - Classes & Objects: Rich domain model representing surplus food donation
 *  - Comparable<Donation>: Natural ordering based on expiry time, used by PriorityQueue
 *  - Encapsulation: Complete field validation and state inspection methods
 */
public class Donation implements Comparable<Donation> {
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private Long id;
    private Long donorId;
    private String foodName;
    private String description;
    private double quantity;
    private String quantityUnit; // e.g. plates, kg, packets
    private FoodCategory category;
    private FoodType foodType;
    private boolean isUnservedSurplus;
    private LocalDateTime preparationDatetime;
    private LocalDateTime expiryDatetime;
    private String pickupAddress;
    private String pickupTime;
    private String instructions;
    private DonationStatus status;

    // Recipient & Lifecycle Tracking (Shared with Member 2 / NGO claims)
    private Long claimedByNgoId;
    private LocalDateTime claimedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Joined Presentation Fields
    private String donorBusinessName;
    private String donorPhone;
    private String donorCity;
    private String ngoName;
    private String ngoPhone;

    public Donation() {
        this.status = DonationStatus.PENDING;
        this.isUnservedSurplus = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Donation(Long id, Long donorId, String foodName, String description,
                    double quantity, String quantityUnit, FoodCategory category,
                    FoodType foodType, boolean isUnservedSurplus,
                    LocalDateTime preparationDatetime, LocalDateTime expiryDatetime,
                    String pickupAddress, String pickupTime, String instructions) {
        this.id = id;
        this.donorId = donorId;
        this.foodName = foodName;
        this.description = description;
        this.quantity = quantity;
        this.quantityUnit = quantityUnit;
        this.category = category;
        this.foodType = foodType;
        this.isUnservedSurplus = isUnservedSurplus;
        this.preparationDatetime = preparationDatetime;
        this.expiryDatetime = expiryDatetime;
        this.pickupAddress = pickupAddress;
        this.pickupTime = pickupTime;
        this.instructions = instructions;
        this.status = DonationStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Comparable implementation for PriorityQueue:
     * Donations expiring sooner have higher priority.
     */
    @Override
    public int compareTo(Donation other) {
        if (this.expiryDatetime == null && other.expiryDatetime == null) return 0;
        if (this.expiryDatetime == null) return 1;
        if (other.expiryDatetime == null) return -1;
        return this.expiryDatetime.compareTo(other.expiryDatetime);
    }

    // Business Logic Helper Methods
    public boolean isExpiredNow() {
        return expiryDatetime != null && expiryDatetime.isBefore(LocalDateTime.now());
    }

    public boolean isEligibleForEdit() {
        return this.status == DonationStatus.PENDING;
    }

    public boolean isEligibleForCancel() {
        return this.status == DonationStatus.PENDING;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", this.id);
        map.put("donorId", this.donorId);
        map.put("foodName", this.foodName);
        map.put("description", this.description);
        map.put("quantity", this.quantity);
        map.put("quantityUnit", this.quantityUnit);
        map.put("category", this.category != null ? this.category.getLabel() : null);
        map.put("categoryCode", this.category != null ? this.category.name() : null);
        map.put("foodType", this.foodType != null ? this.foodType.getLabel() : null);
        map.put("foodTypeCode", this.foodType != null ? this.foodType.name() : null);
        map.put("isUnservedSurplus", this.isUnservedSurplus);
        map.put("preparationDatetime", this.preparationDatetime != null ? this.preparationDatetime.toString() : null);
        map.put("expiryDatetime", this.expiryDatetime != null ? this.expiryDatetime.toString() : null);
        map.put("pickupAddress", this.pickupAddress);
        map.put("pickupTime", this.pickupTime);
        map.put("instructions", this.instructions);
        map.put("status", this.status != null ? this.status.name() : null);
        map.put("statusDescription", this.status != null ? this.status.getDescription() : null);
        map.put("isEligibleForEdit", isEligibleForEdit());
        map.put("isEligibleForCancel", isEligibleForCancel());
        map.put("isExpired", isExpiredNow());

        // Recipient details
        map.put("claimedByNgoId", this.claimedByNgoId);
        map.put("claimedAt", this.claimedAt != null ? this.claimedAt.toString() : null);
        map.put("completedAt", this.completedAt != null ? this.completedAt.toString() : null);
        map.put("donorBusinessName", this.donorBusinessName);
        map.put("donorPhone", this.donorPhone);
        map.put("donorCity", this.donorCity);
        map.put("ngoName", this.ngoName);
        map.put("ngoPhone", this.ngoPhone);
        map.put("createdAt", this.createdAt != null ? this.createdAt.toString() : null);
        map.put("updatedAt", this.updatedAt != null ? this.updatedAt.toString() : null);
        return map;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDonorId() {
        return donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
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

    public LocalDateTime getPreparationDatetime() {
        return preparationDatetime;
    }

    public void setPreparationDatetime(LocalDateTime preparationDatetime) {
        this.preparationDatetime = preparationDatetime;
    }

    public LocalDateTime getExpiryDatetime() {
        return expiryDatetime;
    }

    public void setExpiryDatetime(LocalDateTime expiryDatetime) {
        this.expiryDatetime = expiryDatetime;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(String pickupTime) {
        this.pickupTime = pickupTime;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getClaimedByNgoId() {
        return claimedByNgoId;
    }

    public void setClaimedByNgoId(Long claimedByNgoId) {
        this.claimedByNgoId = claimedByNgoId;
    }

    public LocalDateTime getClaimedAt() {
        return claimedAt;
    }

    public void setClaimedAt(LocalDateTime claimedAt) {
        this.claimedAt = claimedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getDonorBusinessName() {
        return donorBusinessName;
    }

    public void setDonorBusinessName(String donorBusinessName) {
        this.donorBusinessName = donorBusinessName;
    }

    public String getDonorPhone() {
        return donorPhone;
    }

    public void setDonorPhone(String donorPhone) {
        this.donorPhone = donorPhone;
    }

    public String getDonorCity() {
        return donorCity;
    }

    public void setDonorCity(String donorCity) {
        this.donorCity = donorCity;
    }

    public String getNgoName() {
        return ngoName;
    }

    public void setNgoName(String ngoName) {
        this.ngoName = ngoName;
    }

    public String getNgoPhone() {
        return ngoPhone;
    }

    public void setNgoPhone(String ngoPhone) {
        this.ngoPhone = ngoPhone;
    }

    @Override
    public String toString() {
        return String.format("Donation[id=%d, food='%s', qty=%.1f %s, status=%s, expiry=%s]",
                id, foodName, quantity, quantityUnit, status, expiryDatetime);
    }
}
