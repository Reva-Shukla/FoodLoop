package com.foodloop.dao;

import com.foodloop.database.DatabaseConnection;
import com.foodloop.model.User;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * DAO: UserDAO
 * Syllabus Concepts Demonstrated:
 *  - Generics: Extends AbstractDAO<User, Long>
 *  - JDBC & PreparedStatement: Parameterized SQL queries preventing injection
 *  - Collections: ConcurrentHashMap for thread-safe caching and fallback
 */
public class UserDAO extends AbstractDAO<User, Long> {
    // Thread-safe in-memory store for fallback/demo
    private static final Map<Long, User> USER_STORE = new ConcurrentHashMap<>();
    private static final Map<String, Long> EMAIL_INDEX = new ConcurrentHashMap<>();
    private static final AtomicLong ID_GENERATOR = new AtomicLong(10);

    public UserDAO() {}

    @Override
    public User save(User user) {
        validateEntityNotNull(user);

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setString(1, user.getName());
                stmt.setString(2, user.getEmail().trim().toLowerCase());
                stmt.setString(3, user.getPasswordHash());
                stmt.setString(4, user.getPhone());
                stmt.setString(5, user.getRole());

                stmt.executeUpdate();
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        user.setId(rs.getLong(1));
                    }
                }
            } catch (SQLException e) {
                throw new RuntimeException("Error executing PreparedStatement in UserDAO: " + e.getMessage(), e);
            }
        } else {
            if (user.getId() == null) {
                user.setId(ID_GENERATOR.incrementAndGet());
            }
        }

        // Cache in memory
        USER_STORE.put(user.getId(), user);
        EMAIL_INDEX.put(user.getEmail().trim().toLowerCase(), user.getId());
        return user;
    }

    @Override
    public Optional<User> findById(Long id) {
        if (id == null) return Optional.empty();

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "SELECT id, name, email, password_hash, phone, role, created_at, updated_at FROM users WHERE id = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setLong(1, id);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        // Return cached subclass or minimal User representation
                        User cached = USER_STORE.get(id);
                        if (cached != null) return Optional.of(cached);
                    }
                }
            } catch (SQLException e) {
                System.err.println("UserDAO.findById MySQL error: " + e.getMessage());
            }
        }
        return Optional.ofNullable(USER_STORE.get(id));
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        String normalized = email.trim().toLowerCase();

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "SELECT id, name, email, password_hash, phone, role FROM users WHERE email = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, normalized);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Long uid = rs.getLong("id");
                        User cached = USER_STORE.get(uid);
                        if (cached != null) {
                            cached.setPasswordHash(rs.getString("password_hash"));
                            return Optional.of(cached);
                        }
                    }
                }
            } catch (SQLException e) {
                System.err.println("UserDAO.findByEmail MySQL error: " + e.getMessage());
            }
        }

        Long uid = EMAIL_INDEX.get(normalized);
        if (uid != null) {
            return Optional.ofNullable(USER_STORE.get(uid));
        }
        return Optional.empty();
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(USER_STORE.values());
    }

    @Override
    public boolean update(User user) {
        validateEntityNotNull(user);
        if (user.getId() == null) return false;

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "UPDATE users SET name = ?, phone = ?, password_hash = ? WHERE id = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, user.getName());
                stmt.setString(2, user.getPhone());
                stmt.setString(3, user.getPasswordHash());
                stmt.setLong(4, user.getId());
                stmt.executeUpdate();
            } catch (SQLException e) {
                System.err.println("UserDAO.update MySQL error: " + e.getMessage());
            }
        }
        USER_STORE.put(user.getId(), user);
        return true;
    }

    @Override
    public boolean deleteById(Long id) {
        if (id == null) return false;
        User removed = USER_STORE.remove(id);
        if (removed != null) {
            EMAIL_INDEX.remove(removed.getEmail().trim().toLowerCase());
        }
        return true;
    }

    public void registerInCache(User user) {
        if (user != null && user.getId() != null) {
            USER_STORE.put(user.getId(), user);
            if (user.getEmail() != null) {
                EMAIL_INDEX.put(user.getEmail().trim().toLowerCase(), user.getId());
            }
        }
    }
}
