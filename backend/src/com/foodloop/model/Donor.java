package com.foodloop.model;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Entity: Donor
 * Syllabus Concepts Demonstrated:
 *  - Inheritance: Extends User base class
 *  - Polymorphism / Method Overriding: Overrides abstract methods from User
 *  - Encapsulation: Manages specific business profile fields
 */
public class Donor extends User {
    private Long donorId; // Primary key in donors table
    private String businessName;
    private DonorType donorType;
    private String address;
    private String city;

    public Donor() {
        super();
    }

    public Donor(Long userId, String name, String email, String passwordHash, String phone,
                 Long donorId, String businessName, DonorType donorType, String address, String city) {
        super(userId, name, email, passwordHash, phone);
        this.donorId = donorId;
        this.businessName = businessName;
        this.donorType = donorType;
        this.address = address;
        this.city = city;
    }

    // --- Polymorphic Method Overriding ---
    @Override
    public String getRole() {
        return "DONOR";
    }

    @Override
    public String getDisplayName() {
        return this.businessName != null ? this.businessName : super.getName();
    }

    @Override
    public Map<String, Object> toProfileMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("userId", getId());
        map.put("donorId", this.donorId);
        map.put("name", getName());
        map.put("email", getEmail());
        map.put("phone", getPhone());
        map.put("role", getRole());
        map.put("businessName", this.businessName);
        map.put("donorType", this.donorType != null ? this.donorType.name() : null);
        map.put("donorTypeLabel", this.donorType != null ? this.donorType.getLabel() : null);
        map.put("address", this.address);
        map.put("city", this.city);
        map.put("createdAt", getCreatedAt() != null ? getCreatedAt().toString() : null);
        return map;
    }

    // --- Specific Getters & Setters ---
    public Long getDonorId() {
        return donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public DonorType getDonorType() {
        return donorType;
    }

    public void setDonorType(DonorType donorType) {
        this.donorType = donorType;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    @Override
    public String toString() {
        return String.format("Donor[donorId=%d, business='%s', type=%s, city='%s']", 
                donorId, businessName, donorType, city);
    }
}
