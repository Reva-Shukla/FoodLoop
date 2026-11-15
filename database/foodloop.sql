-- ============================================================================
-- FoodLoop Database Schema
-- Project: FoodLoop - Food Donation & Redistribution Platform
-- Module: Member 1 - Donor Management
-- Database: foodloop_db
-- ============================================================================

CREATE DATABASE IF NOT EXISTS foodloop_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE foodloop_db;

-- ----------------------------------------------------------------------------
-- Table 1: users (Shared parent table for all platform user types)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    role ENUM('DONOR', 'NGO', 'ADMIN') NOT NULL DEFAULT 'DONOR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- Table 2: donors (Member 1 module table - Donor business profile)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    business_name VARCHAR(160) NOT NULL,
    donor_type ENUM('RESTAURANT', 'COLLEGE_MESS', 'HOSTEL', 'CATERER') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_donor_city (city),
    INDEX idx_donor_type (donor_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- Table 3: ngos (Member 2 module integration ready)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ngos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    organization_name VARCHAR(160) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    contact_person VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ngo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ngo_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- Table 4: donations (Shared donation entity posted by donors, claimed by NGOs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    food_name VARCHAR(160) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL,
    quantity_unit VARCHAR(30) NOT NULL, -- e.g. plates, kg, packets, boxes
    category VARCHAR(60) NOT NULL,      -- Vegetarian, Non-Vegetarian, Vegan, Bakery, etc.
    food_type ENUM('FRESH', 'COOKED', 'PACKAGED') NOT NULL,
    is_unserved_surplus BOOLEAN NOT NULL DEFAULT TRUE, -- Food safety declaration
    preparation_datetime DATETIME NOT NULL,
    expiry_datetime DATETIME NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_time VARCHAR(120) NOT NULL,
    instructions TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'PICKUP_IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    claimed_by_ngo_id BIGINT DEFAULT NULL,
    claimed_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    CONSTRAINT fk_donation_ngo FOREIGN KEY (claimed_by_ngo_id) REFERENCES ngos(id) ON DELETE SET NULL,
    INDEX idx_donation_status (status),
    INDEX idx_donation_expiry (expiry_datetime),
    INDEX idx_donation_donor_status (donor_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- Table 5: donation_audit_log (Tracks status transitions & multithreading events)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donation_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT NOT NULL,
    previous_status VARCHAR(40),
    new_status VARCHAR(40) NOT NULL,
    action_type VARCHAR(60) NOT NULL,
    thread_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    INDEX idx_audit_donation (donation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- Seed Data for Testing & Demonstration
-- Passwords are hashed with SHA-256 + salt (Password: "Password123!")
-- Hash format: salt:sha256Hex (e.g., standard foodloop hash)
-- ============================================================================

-- 1. Insert Users
-- Salt: a1b2c3d4, Hash for 'Password123!' + 'a1b2c3d4'
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
(1, 'Chef Rajesh Sharma', 'rajesh@greenbowl.com', 'a1b2c3d4:47e09968a356eaef6b39bf4b4e18a9fb7f0beeb9bb5247847be5c66e2c388bc5', '+91 98765 43210', 'DONOR'),
(2, 'Ananya Desai', 'ananya@sunrisemess.edu', 'a1b2c3d4:47e09968a356eaef6b39bf4b4e18a9fb7f0beeb9bb5247847be5c66e2c388bc5', '+91 98220 12345', 'DONOR'),
(3, 'Vikram Mehta', 'vikram@royalfeast.com', 'a1b2c3d4:47e09968a356eaef6b39bf4b4e18a9fb7f0beeb9bb5247847be5c66e2c388bc5', '+91 98990 67890', 'DONOR'),
(4, 'Pooja Nair', 'contact@annakshetra.ngo', 'a1b2c3d4:47e09968a356eaef6b39bf4b4e18a9fb7f0beeb9bb5247847be5c66e2c388bc5', '+91 98111 22334', 'NGO')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Donors
INSERT INTO donors (id, user_id, business_name, donor_type, address, city) VALUES
(1, 1, 'Green Bowl Restaurant', 'RESTAURANT', '45 Indiranagar 100ft Road', 'Bengaluru'),
(2, 2, 'Sunrise Hostel & Mess', 'COLLEGE_MESS', 'Campus Block C, Tech University', 'Bengaluru'),
(3, 3, 'Royal Feast Caterers', 'CATERER', '12 Lake View Enclave, Whitefield', 'Bengaluru')
ON DUPLICATE KEY UPDATE business_name=VALUES(business_name);

-- 3. Insert Sample NGO (For Member 2 claim integration demonstration)
INSERT INTO ngos (id, user_id, organization_name, registration_number, address, city, contact_person) VALUES
(1, 4, 'Anna Kshetra Foundation', 'NGO-BLR-2021-8849', '14 Koramangala 4th Block', 'Bengaluru', 'Pooja Nair')
ON DUPLICATE KEY UPDATE organization_name=VALUES(organization_name);

-- 4. Insert Sample Donations
INSERT INTO donations (id, donor_id, food_name, description, quantity, quantity_unit, category, food_type, is_unserved_surplus, preparation_datetime, expiry_datetime, pickup_address, pickup_time, instructions, status, claimed_by_ngo_id, claimed_at) VALUES
(1, 1, 'Vegetable Dum Biryani & Raita', 'Freshly prepared surplus vegetarian dum biryani with cooling cucumber raita. Completely unserved from lunch buffet.', 35.00, 'plates', 'Vegetarian', 'COOKED', TRUE, NOW() - INTERVAL 2 HOUR, NOW() + INTERVAL 6 HOUR, 'Green Bowl Restaurant, Back Delivery Door, Indiranagar', 'Between 4:00 PM and 6:30 PM today', 'Packed in insulated food-grade catering trays. Keep upright during transport.', 'PENDING', NULL, NULL),

(2, 1, 'Paneer Butter Masala & Rotis', 'Surplus rich paneer gravy and 60 tandoori rotis safely stored in hot cases.', 25.00, 'plates', 'Vegetarian', 'COOKED', TRUE, NOW() - INTERVAL 3 HOUR, NOW() + INTERVAL 5 HOUR, 'Green Bowl Restaurant, Indiranagar', 'Ready immediately', 'Bring your own thermal containers if possible.', 'ACCEPTED', 1, NOW() - INTERVAL 1 HOUR),

(3, 1, 'Assorted Sandwiches & Fruit Bowls', 'Club sandwiches and freshly cut seasonal fruit containers from afternoon corporate meeting.', 20.00, 'packets', 'Vegetarian', 'FRESH', TRUE, NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 8 HOUR, 'Green Bowl Restaurant, Indiranagar', 'Pickup before 8:00 PM', 'Refrigerated in kitchen chillers.', 'PENDING', NULL, NULL),

(4, 2, 'Dal Makhani, Steamed Rice & Subzi', 'College mess lunch surplus. Nutritious lentils and fresh mixed vegetables.', 50.00, 'plates', 'Vegetarian', 'COOKED', TRUE, NOW() - INTERVAL 24 HOUR, NOW() - INTERVAL 18 HOUR, 'Campus Mess Counter 2', 'Yesterday lunch', 'Expired item kept for history audit demonstration.', 'EXPIRED', NULL, NULL),

(5, 2, 'South Indian Sambhar & Idlis', 'Morning breakfast surplus. High protein lentil stew with steamed rice cakes.', 40.00, 'plates', 'Vegetarian', 'COOKED', TRUE, NOW() - INTERVAL 48 HOUR, NOW() - INTERVAL 40 HOUR, 'Campus Mess Counter 1', 'Completed pickup demonstration', 'Picked up by Anna Kshetra Foundation and distributed.', 'COMPLETED', 1, NOW() - INTERVAL 44 HOUR)
ON DUPLICATE KEY UPDATE food_name=VALUES(food_name);
