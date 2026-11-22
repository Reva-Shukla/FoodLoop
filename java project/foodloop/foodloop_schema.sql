-- ============================================================
-- FoodLoop — MySQL Database Schema (Phase 7B Aligned)
-- Aligned with React frontend DTOs & backend-integration-readiness.md
-- ============================================================

DROP DATABASE IF EXISTS foodloop;
CREATE DATABASE foodloop;
USE foodloop;

-- ============================================================
-- 1. Hostels — Chitkara Campus 7 Dining Halls
-- ============================================================
CREATE TABLE hostels (
    hostel_id   VARCHAR(50)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    category    ENUM('BOYS', 'GIRLS') NOT NULL,
    category_label VARCHAR(50) NOT NULL,
    campus      VARCHAR(150) DEFAULT 'Chitkara University, Punjab (Rajpura)'
);

INSERT INTO hostels (hostel_id, name, category, category_label) VALUES
('mess-b-franklin',   'Franklin Mess',    'BOYS',  'Boys'' Hostel'),
('mess-b-alfred',     'Alfred Mess',      'BOYS',  'Boys'' Hostel'),
('mess-b-magellan',   'Magellan Mess',    'BOYS',  'Boys'' Hostel'),
('mess-b-archimedes', 'Archimedes Mess',  'BOYS',  'Boys'' Hostel'),
('mess-g-pi',         'Pi Mess',          'GIRLS', 'Girls'' Hostel'),
('mess-g-ibn',        'IBN Mess',         'GIRLS', 'Girls'' Hostel'),
('mess-g-nightingale','Nightingale Mess',  'GIRLS', 'Girls'' Hostel');

-- ============================================================
-- 2. Users — MESS / NGO / ADMIN roles
-- ============================================================
CREATE TABLE users (
    user_id          INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    role             ENUM('MESS', 'NGO', 'ADMIN') NOT NULL,
    location         VARCHAR(200),
    food_preference  VARCHAR(20),
    assigned_mess_id VARCHAR(50) DEFAULT NULL,
    organization     VARCHAR(200) DEFAULT NULL,
    department       VARCHAR(100) DEFAULT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_mess_id) REFERENCES hostels(hostel_id)
);

-- ============================================================
-- 3. Meal Records — Prepared vs Served tracking
-- ============================================================
CREATE TABLE meal_records (
    meal_id      INT AUTO_INCREMENT PRIMARY KEY,
    mess_id      VARCHAR(50) NOT NULL,
    food_name    VARCHAR(200) NOT NULL,
    food_type    ENUM('VEG', 'NON_VEG') NOT NULL DEFAULT 'VEG',
    meal_type    VARCHAR(30) DEFAULT 'Lunch',
    prepared     INT NOT NULL DEFAULT 0,
    served       INT NOT NULL DEFAULT 0,
    surplus      INT GENERATED ALWAYS AS (GREATEST(0, prepared - served)) STORED,
    meal_date    DATE NOT NULL,
    logged_by    VARCHAR(100) DEFAULT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
);

-- ============================================================
-- 4. Donations — Surplus food published for redistribution
-- ============================================================
CREATE TABLE donations (
    donation_id          INT AUTO_INCREMENT PRIMARY KEY,
    meal_record_id       INT DEFAULT NULL,
    mess_id              VARCHAR(50) NOT NULL,
    food_name            VARCHAR(200) NOT NULL,
    quantity             INT NOT NULL DEFAULT 0,
    food_type            ENUM('VEG', 'NON_VEG') NOT NULL DEFAULT 'VEG',
    pickup_location      VARCHAR(300),
    deadline             DATETIME NOT NULL,
    preparation_datetime DATETIME DEFAULT NULL,
    storage_conditions   VARCHAR(300) DEFAULT NULL,
    allergens            VARCHAR(300) DEFAULT NULL,
    status               ENUM('AVAILABLE', 'CLAIMED', 'PICKED_UP', 'EXPIRED') DEFAULT 'AVAILABLE',
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_record_id) REFERENCES meal_records(meal_id),
    FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
);

-- ============================================================
-- 5. Claims — NGO claims on available donations
-- ============================================================
CREATE TABLE claims (
    claim_id         INT AUTO_INCREMENT PRIMARY KEY,
    donation_id      INT NOT NULL,
    ngo_id           INT NOT NULL,
    claim_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_deadline  DATETIME DEFAULT NULL,
    pickup_location  VARCHAR(300) DEFAULT NULL,
    status           ENUM('ACTIVE', 'COMPLETED', 'EXPIRED') DEFAULT 'ACTIVE',
    FOREIGN KEY (donation_id) REFERENCES donations(donation_id),
    FOREIGN KEY (ngo_id) REFERENCES users(user_id)
);

-- ============================================================
-- 6. Pickups — Scheduled collection handovers
-- ============================================================
CREATE TABLE pickups (
    pickup_id        INT AUTO_INCREMENT PRIMARY KEY,
    claim_id         INT NOT NULL,
    donation_id      INT NOT NULL,
    ngo_id           INT NOT NULL,
    pickup_deadline  DATETIME DEFAULT NULL,
    pickup_location  VARCHAR(300) DEFAULT NULL,
    pickup_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at     DATETIME DEFAULT NULL,
    status           ENUM('SCHEDULED', 'COMPLETED', 'MISSED') DEFAULT 'SCHEDULED',
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id),
    FOREIGN KEY (donation_id) REFERENCES donations(donation_id),
    FOREIGN KEY (ngo_id) REFERENCES users(user_id)
);

-- ============================================================
-- 7. Waste Records — Discarded surplus audit trail
-- ============================================================
CREATE TABLE waste_records (
    waste_id            INT AUTO_INCREMENT PRIMARY KEY,
    meal_record_id      INT DEFAULT NULL,
    mess_id             VARCHAR(50) NOT NULL,
    food_name           VARCHAR(200) NOT NULL,
    food_type           ENUM('VEG', 'NON_VEG') NOT NULL DEFAULT 'VEG',
    portions_discarded  INT NOT NULL DEFAULT 0,
    reason              VARCHAR(200) DEFAULT 'Unspecified',
    notes               TEXT DEFAULT NULL,
    discarded_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_record_id) REFERENCES meal_records(meal_id),
    FOREIGN KEY (mess_id) REFERENCES hostels(hostel_id)
);

-- ============================================================
-- 8. Indexes for common query patterns
-- ============================================================
CREATE INDEX idx_meals_mess_date ON meal_records(mess_id, meal_date);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_mess ON donations(mess_id);
CREATE INDEX idx_donations_deadline ON donations(deadline);
CREATE INDEX idx_claims_ngo ON claims(ngo_id);
CREATE INDEX idx_claims_donation ON claims(donation_id);
CREATE INDEX idx_pickups_ngo ON pickups(ngo_id);
CREATE INDEX idx_pickups_status ON pickups(status);
CREATE INDEX idx_waste_mess ON waste_records(mess_id);
CREATE INDEX idx_waste_meal ON waste_records(meal_record_id);

-- ============================================================
-- 9. Seed Data — Demo accounts (passwords hashed with SHA-256)
--    Raw password for all: Demo@123
--    SHA-256("Demo@123") = a]... (we store the hash below)
-- ============================================================
-- Note: In Java code we use SHA-256 hashing. These inserts use
-- the raw password temporarily; the Java app will hash on register.
-- For initial setup, run the app's register flow or update manually.

INSERT INTO users (name, email, password, role, location, food_preference, assigned_mess_id) VALUES
('Vikram Singh',  'vikram@foodloop.in',  'Demo@123', 'MESS',  'Chitkara University, Rajpura', 'VEG', 'mess-b-franklin'),
('Sunita Verma',  'sunita@foodloop.in',  'Demo@123', 'MESS',  'Chitkara University, Rajpura', 'VEG', 'mess-g-pi'),
('Priya Sharma',  'priya@foodloop.in',   'Demo@123', 'NGO',   'Patiala, Punjab',              'VEG', NULL),
('Admin User',    'admin@foodloop.in',   'Demo@123', 'ADMIN', 'Chitkara University, Rajpura', 'VEG', NULL);
