package com.foodloop.dao;

import com.foodloop.database.DatabaseConnection;
import com.foodloop.model.Donor;
import com.foodloop.model.DonorType;
import com.foodloop.util.PasswordHasher;

import java.sql.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * DAO: DonorDAO
 * Syllabus Concepts Demonstrated:
 *  - Generics: Extends AbstractDAO<Donor, Long>
 *  - JDBC Transactions: setAutoCommit(false) & commit() across users and donors tables
 *  - PreparedStatement: Secure parameterized SQL execution
 *  - Collections: ConcurrentHashMap for thread-safe access
 */
public class DonorDAO extends AbstractDAO<Donor, Long> {
    private static final Map<Long, Donor> DONOR_STORE = new ConcurrentHashMap<>();
    private static final Map<Long, Long> USER_TO_DONOR_INDEX = new ConcurrentHashMap<>();
    private static final AtomicLong DONOR_ID_GENERATOR = new AtomicLong(10);

    private final UserDAO userDAO;

    public DonorDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
        initSeedData();
    }

    private void initSeedData() {
        if (DONOR_STORE.isEmpty()) {
            // Seed Donor 1: Restaurant
            Donor d1 = new Donor(1L, "Chef Rajesh Sharma", "rajesh@greenbowl.com",
                    PasswordHasher.hashPassword("Password123!"), "+91 98765 43210",
                    1L, "Green Bowl Restaurant", DonorType.RESTAURANT,
                    "45 Indiranagar 100ft Road", "Bengaluru");
            saveInMemoryOnly(d1);

            // Seed Donor 2: College Mess
            Donor d2 = new Donor(2L, "Ananya Desai", "ananya@sunrisemess.edu",
                    PasswordHasher.hashPassword("Password123!"), "+91 98220 12345",
                    2L, "Sunrise Hostel & Mess", DonorType.COLLEGE_MESS,
                    "Campus Block C, Tech University", "Bengaluru");
            saveInMemoryOnly(d2);

            // Seed Donor 3: Caterer
            Donor d3 = new Donor(3L, "Vikram Mehta", "vikram@royalfeast.com",
                    PasswordHasher.hashPassword("Password123!"), "+91 98990 67890",
                    3L, "Royal Feast Caterers", DonorType.CATERER,
                    "12 Lake View Enclave, Whitefield", "Bengaluru");
            saveInMemoryOnly(d3);
        }
    }

    private void saveInMemoryOnly(Donor d) {
        DONOR_STORE.put(d.getDonorId(), d);
        USER_TO_DONOR_INDEX.put(d.getId(), d.getDonorId());
        userDAO.registerInCache(d);
    }

    @Override
    public Donor save(Donor donor) {
        validateEntityNotNull(donor);

        if (DatabaseConnection.isMySQLActive()) {
            // Transaction across users and donors tables
            Connection conn = null;
            try {
                conn = DatabaseConnection.getConnection();
                conn.setAutoCommit(false); // JDBC Transaction start

                // 1. Insert into users
                String userSql = "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, 'DONOR')";
                try (PreparedStatement uStmt = conn.prepareStatement(userSql, Statement.RETURN_GENERATED_KEYS)) {
                    uStmt.setString(1, donor.getName());
                    uStmt.setString(2, donor.getEmail().trim().toLowerCase());
                    uStmt.setString(3, donor.getPasswordHash());
                    uStmt.setString(4, donor.getPhone());
                    uStmt.executeUpdate();

                    try (ResultSet rs = uStmt.getGeneratedKeys()) {
                        if (rs.next()) {
                            donor.setId(rs.getLong(1));
                        }
                    }
                }

                // 2. Insert into donors
                String donorSql = "INSERT INTO donors (user_id, business_name, donor_type, address, city) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement dStmt = conn.prepareStatement(donorSql, Statement.RETURN_GENERATED_KEYS)) {
                    dStmt.setLong(1, donor.getId());
                    dStmt.setString(2, donor.getBusinessName());
                    dStmt.setString(3, donor.getDonorType().name());
                    dStmt.setString(4, donor.getAddress());
                    dStmt.setString(5, donor.getCity());
                    dStmt.executeUpdate();

                    try (ResultSet rs = dStmt.getGeneratedKeys()) {
                        if (rs.next()) {
                            donor.setDonorId(rs.getLong(1));
                        }
                    }
                }

                conn.commit(); // Transaction commit
            } catch (SQLException e) {
                if (conn != null) {
                    try { conn.rollback(); } catch (SQLException ex) { /* ignored */ }
                }
                throw new RuntimeException("Failed to save donor via JDBC PreparedStatement: " + e.getMessage(), e);
            } finally {
                if (conn != null) {
                    try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { /* ignored */ }
                }
            }
        } else {
            if (donor.getId() == null) {
                donor.setId(DONOR_ID_GENERATOR.incrementAndGet());
            }
            if (donor.getDonorId() == null) {
                donor.setDonorId(donor.getId());
            }
        }

        saveInMemoryOnly(donor);
        return donor;
    }

    @Override
    public Optional<Donor> findById(Long donorId) {
        if (donorId == null) return Optional.empty();

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "SELECT u.id as user_id, u.name, u.email, u.password_hash, u.phone, "
                       + "d.id as donor_id, d.business_name, d.donor_type, d.address, d.city, d.created_at "
                       + "FROM donors d JOIN users u ON d.user_id = u.id WHERE d.id = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setLong(1, donorId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Donor d = mapRowToDonor(rs);
                        saveInMemoryOnly(d);
                        return Optional.of(d);
                    }
                }
            } catch (SQLException e) {
                System.err.println("DonorDAO.findById MySQL error: " + e.getMessage());
            }
        }
        return Optional.ofNullable(DONOR_STORE.get(donorId));
    }

    public Optional<Donor> findByUserId(Long userId) {
        if (userId == null) return Optional.empty();

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "SELECT u.id as user_id, u.name, u.email, u.password_hash, u.phone, "
                       + "d.id as donor_id, d.business_name, d.donor_type, d.address, d.city, d.created_at "
                       + "FROM donors d JOIN users u ON d.user_id = u.id WHERE u.id = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setLong(1, userId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Donor d = mapRowToDonor(rs);
                        saveInMemoryOnly(d);
                        return Optional.of(d);
                    }
                }
            } catch (SQLException e) {
                System.err.println("DonorDAO.findByUserId MySQL error: " + e.getMessage());
            }
        }

        Long donorId = USER_TO_DONOR_INDEX.get(userId);
        if (donorId != null) {
            return Optional.ofNullable(DONOR_STORE.get(donorId));
        }
        return Optional.empty();
    }

    public Optional<Donor> findByEmail(String email) {
        if (email == null) return Optional.empty();
        String normalized = email.trim().toLowerCase();

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "SELECT u.id as user_id, u.name, u.email, u.password_hash, u.phone, "
                       + "d.id as donor_id, d.business_name, d.donor_type, d.address, d.city, d.created_at "
                       + "FROM donors d JOIN users u ON d.user_id = u.id WHERE LOWER(u.email) = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, normalized);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Donor d = mapRowToDonor(rs);
                        saveInMemoryOnly(d);
                        return Optional.of(d);
                    }
                }
            } catch (SQLException e) {
                System.err.println("DonorDAO.findByEmail MySQL error: " + e.getMessage());
            }
        }

        for (Donor d : DONOR_STORE.values()) {
            if (d.getEmail() != null && d.getEmail().equalsIgnoreCase(normalized)) {
                return Optional.of(d);
            }
        }
        return Optional.empty();
    }

    @Override
    public List<Donor> findAll() {
        return new ArrayList<>(DONOR_STORE.values());
    }

    @Override
    public boolean update(Donor donor) {
        validateEntityNotNull(donor);
        if (donor.getDonorId() == null) return false;

        if (DatabaseConnection.isMySQLActive()) {
            Connection conn = null;
            try {
                conn = DatabaseConnection.getConnection();
                conn.setAutoCommit(false);

                // Update users table
                String userSql = "UPDATE users SET name = ?, phone = ?, password_hash = ? WHERE id = ?";
                try (PreparedStatement uStmt = conn.prepareStatement(userSql)) {
                    uStmt.setString(1, donor.getName());
                    uStmt.setString(2, donor.getPhone());
                    uStmt.setString(3, donor.getPasswordHash());
                    uStmt.setLong(4, donor.getId());
                    uStmt.executeUpdate();
                }

                // Update donors table
                String donorSql = "UPDATE donors SET business_name = ?, donor_type = ?, address = ?, city = ? WHERE id = ?";
                try (PreparedStatement dStmt = conn.prepareStatement(donorSql)) {
                    dStmt.setString(1, donor.getBusinessName());
                    dStmt.setString(2, donor.getDonorType().name());
                    dStmt.setString(3, donor.getAddress());
                    dStmt.setString(4, donor.getCity());
                    dStmt.setLong(5, donor.getDonorId());
                    dStmt.executeUpdate();
                }

                conn.commit();
            } catch (SQLException e) {
                if (conn != null) {
                    try { conn.rollback(); } catch (SQLException ex) { /* ignored */ }
                }
                System.err.println("DonorDAO.update error: " + e.getMessage());
                return false;
            } finally {
                if (conn != null) {
                    try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { /* ignored */ }
                }
            }
        }

        saveInMemoryOnly(donor);
        return true;
    }

    @Override
    public boolean deleteById(Long donorId) {
        if (donorId == null) return false;
        Donor removed = DONOR_STORE.remove(donorId);
        if (removed != null) {
            USER_TO_DONOR_INDEX.remove(removed.getId());
            userDAO.deleteById(removed.getId());
        }
        return true;
    }

    private Donor mapRowToDonor(ResultSet rs) throws SQLException {
        Donor d = new Donor();
        d.setId(rs.getLong("user_id"));
        d.setName(rs.getString("name"));
        d.setEmail(rs.getString("email"));
        d.setPasswordHash(rs.getString("password_hash"));
        d.setPhone(rs.getString("phone"));
        d.setDonorId(rs.getLong("donor_id"));
        d.setBusinessName(rs.getString("business_name"));
        d.setDonorType(DonorType.fromString(rs.getString("donor_type")));
        d.setAddress(rs.getString("address"));
        d.setCity(rs.getString("city"));
        return d;
    }
}
