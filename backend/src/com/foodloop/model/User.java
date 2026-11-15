package com.foodloop.model;

import com.foodloop.interfaces.Authenticatable;
import com.foodloop.util.PasswordHasher;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Abstract Base Class: User
 * Syllabus Concepts Demonstrated:
 *  - Abstraction: Abstract base class with abstract methods
 *  - Inheritance: Parent class for Donor and NGO
 *  - Interfaces: Implements Authenticatable interface
 *  - Encapsulation: Private fields with protected/public accessors
 */
public abstract class User implements Authenticatable {
    private Long id;
    private String name;
    private String email;
    private String passwordHash;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public User() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Parameterized constructor
    public User(Long id, String name, String email, String passwordHash, String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // --- Abstract methods (Must be implemented by subclasses Donor & NGO) ---
    public abstract String getRole();
    public abstract String getDisplayName();
    public abstract Map<String, Object> toProfileMap();

    // --- Interface method implementations ---
    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public String getPasswordHash() {
        return passwordHash;
    }

    @Override
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean verifyPassword(String rawPassword) {
        return PasswordHasher.verifyPassword(rawPassword, this.passwordHash);
    }

    // --- Standard Getters & Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    @Override
    public String toString() {
        return String.format("User[id=%d, email='%s', role='%s']", id, email, getRole());
    }
}
