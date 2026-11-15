package com.foodloop.model;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Entity: NGO
 * Syllabus Concepts Demonstrated:
 *  - Inheritance: Extends User base class (shares User table)
 *  - Polymorphism / Method Overriding: Overrides abstract User methods
 *  - Team Integration: Provided to ensure full compatibility with Member 2 (NGO Module)
 */
public class NGO extends User {
    private Long ngoId;
    private String organizationName;
    private String registrationNumber;
    private String address;
    private String city;
    private String contactPerson;

    public NGO() {
        super();
    }

    public NGO(Long userId, String name, String email, String passwordHash, String phone,
               Long ngoId, String organizationName, String registrationNumber,
               String address, String city, String contactPerson) {
        super(userId, name, email, passwordHash, phone);
        this.ngoId = ngoId;
        this.organizationName = organizationName;
        this.registrationNumber = registrationNumber;
        this.address = address;
        this.city = city;
        this.contactPerson = contactPerson;
    }

    @Override
    public String getRole() {
        return "NGO";
    }

    @Override
    public String getDisplayName() {
        return this.organizationName != null ? this.organizationName : super.getName();
    }

    @Override
    public Map<String, Object> toProfileMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("userId", getId());
        map.put("ngoId", this.ngoId);
        map.put("name", getName());
        map.put("email", getEmail());
        map.put("phone", getPhone());
        map.put("role", getRole());
        map.put("organizationName", this.organizationName);
        map.put("registrationNumber", this.registrationNumber);
        map.put("address", this.address);
        map.put("city", this.city);
        map.put("contactPerson", this.contactPerson);
        return map;
    }

    public Long getNgoId() {
        return ngoId;
    }

    public void setNgoId(Long ngoId) {
        this.ngoId = ngoId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
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

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }
}
