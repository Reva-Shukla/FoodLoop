package com.foodloop.interfaces;

/**
 * Interface: Authenticatable
 * Syllabus Concept: Java Interfaces & Abstraction
 * 
 * Defines the contract for any entity in the FoodLoop platform that can
 * authenticate with credentials and manage secure passwords.
 */
public interface Authenticatable {
    String getEmail();
    String getPasswordHash();
    void setPasswordHash(String passwordHash);
    boolean verifyPassword(String rawPassword);
}
