package com.foodloop.dao;

import com.foodloop.database.DatabaseConnection;
import com.foodloop.model.*;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

/**
 * DAO: DonationDAO
 * Syllabus Concepts Demonstrated:
 *  - Generics: Extends AbstractDAO<Donation, Long>
 *  - Multithreading & Synchronization: Synchronized status updates with locks preventing race conditions
 *  - JDBC & PreparedStatement: Safe parameterized SQL queries
 *  - Collections: ConcurrentHashMap, ArrayList, PriorityQueue integration
 */
public class DonationDAO extends AbstractDAO<Donation, Long> {
    private static final Map<Long, Donation> DONATION_STORE = new ConcurrentHashMap<>();
    private static final AtomicLong DONATION_ID_GENERATOR = new AtomicLong(20);

    // Fine-grained locks per donation ID to ensure thread-safety during concurrent claims/updates
    private static final Map<Long, ReentrantLock> DONATION_LOCKS = new ConcurrentHashMap<>();

    public DonationDAO() {
        initSeedDonations();
    }

    private void initSeedDonations() {
        if (DONATION_STORE.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();

            // 1. Pending Biryani donation
            Donation d1 = new Donation(1L, 1L, "Vegetable Dum Biryani & Raita",
                    "Freshly prepared surplus vegetarian dum biryani with cooling cucumber raita. Completely unserved from lunch buffet.",
                    35.0, "plates", FoodCategory.VEGETARIAN, FoodType.COOKED, true,
                    now.minusHours(2), now.plusHours(6),
                    "Green Bowl Restaurant, Back Delivery Door, Indiranagar",
                    "Between 4:00 PM and 6:30 PM today",
                    "Packed in insulated food-grade catering trays. Keep upright during transport.");
            d1.setStatus(DonationStatus.PENDING);
            d1.setDonorBusinessName("Green Bowl Restaurant");
            d1.setDonorPhone("+91 98765 43210");
            d1.setDonorCity("Bengaluru");
            DONATION_STORE.put(d1.getId(), d1);

            // 2. Accepted Paneer donation
            Donation d2 = new Donation(2L, 1L, "Paneer Butter Masala & Rotis",
                    "Surplus rich paneer gravy and 60 tandoori rotis safely stored in hot cases.",
                    25.0, "plates", FoodCategory.VEGETARIAN, FoodType.COOKED, true,
                    now.minusHours(3), now.plusHours(5),
                    "Green Bowl Restaurant, Indiranagar",
                    "Ready immediately",
                    "Bring your own thermal containers if possible.");
            d2.setStatus(DonationStatus.ACCEPTED);
            d2.setClaimedByNgoId(1L);
            d2.setNgoName("Anna Kshetra Foundation");
            d2.setNgoPhone("+91 98111 22334");
            d2.setClaimedAt(now.minusHours(1));
            d2.setDonorBusinessName("Green Bowl Restaurant");
            d2.setDonorPhone("+91 98765 43210");
            d2.setDonorCity("Bengaluru");
            DONATION_STORE.put(d2.getId(), d2);

            // 3. Pending Sandwiches
            Donation d3 = new Donation(3L, 1L, "Assorted Sandwiches & Fruit Bowls",
                    "Club sandwiches and freshly cut seasonal fruit containers from afternoon corporate meeting.",
                    20.0, "packets", FoodCategory.VEGETARIAN, FoodType.FRESH, true,
                    now.minusHours(1), now.plusHours(8),
                    "Green Bowl Restaurant, Indiranagar",
                    "Pickup before 8:00 PM",
                    "Refrigerated in kitchen chillers.");
            d3.setStatus(DonationStatus.PENDING);
            d3.setDonorBusinessName("Green Bowl Restaurant");
            d3.setDonorPhone("+91 98765 43210");
            d3.setDonorCity("Bengaluru");
            DONATION_STORE.put(d3.getId(), d3);

            // 4. Expired Mess Dal
            Donation d4 = new Donation(4L, 2L, "Dal Makhani, Steamed Rice & Subzi",
                    "College mess lunch surplus. Nutritious lentils and fresh mixed vegetables.",
                    50.0, "plates", FoodCategory.VEGETARIAN, FoodType.COOKED, true,
                    now.minusHours(24), now.minusHours(18),
                    "Campus Mess Counter 2",
                    "Yesterday lunch",
                    "Expired item kept for history audit demonstration.");
            d4.setStatus(DonationStatus.EXPIRED);
            d4.setDonorBusinessName("Sunrise Hostel & Mess");
            d4.setDonorPhone("+91 98220 12345");
            d4.setDonorCity("Bengaluru");
            DONATION_STORE.put(d4.getId(), d4);

            // 5. Completed Idlis
            Donation d5 = new Donation(5L, 2L, "South Indian Sambhar & Idlis",
                    "Morning breakfast surplus. High protein lentil stew with steamed rice cakes.",
                    40.0, "plates", FoodCategory.VEGETARIAN, FoodType.COOKED, true,
                    now.minusHours(48), now.minusHours(40),
                    "Campus Mess Counter 1",
                    "Completed pickup demonstration",
                    "Picked up by Anna Kshetra Foundation and distributed.");
            d5.setStatus(DonationStatus.COMPLETED);
            d5.setClaimedByNgoId(1L);
            d5.setNgoName("Anna Kshetra Foundation");
            d5.setNgoPhone("+91 98111 22334");
            d5.setClaimedAt(now.minusHours(44));
            d5.setCompletedAt(now.minusHours(42));
            d5.setDonorBusinessName("Sunrise Hostel & Mess");
            d5.setDonorPhone("+91 98220 12345");
            d5.setDonorCity("Bengaluru");
            DONATION_STORE.put(d5.getId(), d5);
        }
    }

    private ReentrantLock getLockForDonation(Long donationId) {
        return DONATION_LOCKS.computeIfAbsent(donationId, k -> new ReentrantLock());
    }

    @Override
    public Donation save(Donation donation) {
        validateEntityNotNull(donation);

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "INSERT INTO donations ("
                    + "donor_id, food_name, description, quantity, quantity_unit, category, "
                    + "food_type, is_unserved_surplus, preparation_datetime, expiry_datetime, "
                    + "pickup_address, pickup_time, instructions, status"
                    + ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setLong(1, donation.getDonorId());
                stmt.setString(2, donation.getFoodName());
                stmt.setString(3, donation.getDescription());
                stmt.setDouble(4, donation.getQuantity());
                stmt.setString(5, donation.getQuantityUnit());
                stmt.setString(6, donation.getCategory().name());
                stmt.setString(7, donation.getFoodType().name());
                stmt.setBoolean(8, donation.isUnservedSurplus());
                stmt.setTimestamp(9, Timestamp.valueOf(donation.getPreparationDatetime()));
                stmt.setTimestamp(10, Timestamp.valueOf(donation.getExpiryDatetime()));
                stmt.setString(11, donation.getPickupAddress());
                stmt.setString(12, donation.getPickupTime());
                stmt.setString(13, donation.getInstructions());
                stmt.setString(14, donation.getStatus().name());

                stmt.executeUpdate();
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        donation.setId(rs.getLong(1));
                    }
                }
            } catch (SQLException e) {
                throw new RuntimeException("Error executing PreparedStatement in DonationDAO.save: " + e.getMessage(), e);
            }
        } else {
            if (donation.getId() == null) {
                donation.setId(DONATION_ID_GENERATOR.incrementAndGet());
            }
        }

        DONATION_STORE.put(donation.getId(), donation);
        return donation;
    }

    @Override
    public Optional<Donation> findById(Long id) {
        if (id == null) return Optional.empty();

        if (DatabaseConnection.isMySQLActive()) {
            String sql = "SELECT d.*, dn.business_name, u.phone as donor_phone, dn.city as donor_city, "
                       + "n.organization_name as ngo_name, nu.phone as ngo_phone "
                       + "FROM donations d "
                       + "JOIN donors dn ON d.donor_id = dn.id "
                       + "JOIN users u ON dn.user_id = u.id "
                       + "LEFT JOIN ngos n ON d.claimed_by_ngo_id = n.id "
                       + "LEFT JOIN users nu ON n.user_id = nu.id "
                       + "WHERE d.id = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setLong(1, id);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Donation d = mapRowToDonation(rs);
                        DONATION_STORE.put(d.getId(), d);
                        return Optional.of(d);
                    }
                }
            } catch (SQLException e) {
                System.err.println("DonationDAO.findById MySQL error: " + e.getMessage());
            }
        }
        return Optional.ofNullable(DONATION_STORE.get(id));
    }

    @Override
    public List<Donation> findAll() {
        return new ArrayList<>(DONATION_STORE.values());
    }

    public List<Donation> findByDonorId(Long donorId) {
        if (donorId == null) return Collections.emptyList();

        List<Donation> results = new ArrayList<>();
        if (DatabaseConnection.isMySQLActive()) {
            String sql = "SELECT d.*, dn.business_name, u.phone as donor_phone, dn.city as donor_city, "
                       + "n.organization_name as ngo_name, nu.phone as ngo_phone "
                       + "FROM donations d "
                       + "JOIN donors dn ON d.donor_id = dn.id "
                       + "JOIN users u ON dn.user_id = u.id "
                       + "LEFT JOIN ngos n ON d.claimed_by_ngo_id = n.id "
                       + "LEFT JOIN users nu ON n.user_id = nu.id "
                       + "WHERE d.donor_id = ? ORDER BY d.created_at DESC";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setLong(1, donorId);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Donation d = mapRowToDonation(rs);
                        results.add(d);
                        DONATION_STORE.put(d.getId(), d);
                    }
                    return results;
                }
            } catch (SQLException e) {
                System.err.println("DonationDAO.findByDonorId MySQL error: " + e.getMessage());
            }
        }

        for (Donation d : DONATION_STORE.values()) {
            if (Objects.equals(d.getDonorId(), donorId)) {
                results.add(d);
            }
        }
        results.sort(Comparator.comparing(Donation::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    @Override
    public boolean update(Donation donation) {
        validateEntityNotNull(donation);
        if (donation.getId() == null) return false;

        ReentrantLock lock = getLockForDonation(donation.getId());
        lock.lock();
        try {
            if (DatabaseConnection.isMySQLActive()) {
                String sql = "UPDATE donations SET "
                        + "food_name = ?, description = ?, quantity = ?, quantity_unit = ?, "
                        + "category = ?, food_type = ?, is_unserved_surplus = ?, "
                        + "preparation_datetime = ?, expiry_datetime = ?, pickup_address = ?, "
                        + "pickup_time = ?, instructions = ?, status = ?, updated_at = NOW() "
                        + "WHERE id = ?";
                try (Connection conn = DatabaseConnection.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, donation.getFoodName());
                    stmt.setString(2, donation.getDescription());
                    stmt.setDouble(3, donation.getQuantity());
                    stmt.setString(4, donation.getQuantityUnit());
                    stmt.setString(5, donation.getCategory().name());
                    stmt.setString(6, donation.getFoodType().name());
                    stmt.setBoolean(7, donation.isUnservedSurplus());
                    stmt.setTimestamp(8, Timestamp.valueOf(donation.getPreparationDatetime()));
                    stmt.setTimestamp(9, Timestamp.valueOf(donation.getExpiryDatetime()));
                    stmt.setString(10, donation.getPickupAddress());
                    stmt.setString(11, donation.getPickupTime());
                    stmt.setString(12, donation.getInstructions());
                    stmt.setString(13, donation.getStatus().name());
                    stmt.setLong(14, donation.getId());

                    stmt.executeUpdate();
                } catch (SQLException e) {
                    System.err.println("DonationDAO.update error: " + e.getMessage());
                    return false;
                }
            }
            donation.setUpdatedAt(LocalDateTime.now());
            DONATION_STORE.put(donation.getId(), donation);
            return true;
        } finally {
            lock.unlock();
        }
    }

    /**
     * Multithreading & Thread Safety:
     * Atomically changes donation status from expectedStatus to newStatus using fine-grained
     * locks and conditional SQL, preventing concurrent double-claiming or double-cancellation.
     */
    public boolean updateStatusWithThreadSafety(Long donationId, DonationStatus expectedStatus,
                                                DonationStatus newStatus, String changedBy) {
        if (donationId == null) return false;

        ReentrantLock lock = getLockForDonation(donationId);
        lock.lock(); // Synchronized lock block
        try {
            Donation current = DONATION_STORE.get(donationId);
            if (current == null) return false;

            if (expectedStatus != null && current.getStatus() != expectedStatus) {
                return false; // Condition not met (e.g. already claimed or cancelled)
            }

            DonationStatus prevStatus = current.getStatus();

            if (DatabaseConnection.isMySQLActive()) {
                String sql = "UPDATE donations SET status = ?, updated_at = NOW() WHERE id = ? AND status = ?";
                try (Connection conn = DatabaseConnection.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, newStatus.name());
                    stmt.setLong(2, donationId);
                    stmt.setString(3, expectedStatus != null ? expectedStatus.name() : prevStatus.name());
                    int updated = stmt.executeUpdate();
                    if (updated == 0) return false;

                    // Audit trail logging
                    recordAuditLog(conn, donationId, prevStatus.name(), newStatus.name(),
                            "STATUS_CHANGE", Thread.currentThread().getName(), "By: " + changedBy);
                } catch (SQLException e) {
                    System.err.println("Error in thread-safe status update: " + e.getMessage());
                    return false;
                }
            }

            current.setStatus(newStatus);
            current.setUpdatedAt(LocalDateTime.now());
            return true;
        } finally {
            lock.unlock();
        }
    }

    /**
     * Multithreading Expiry Monitor Batch Operation:
     * Scans pending donations and transitions expired ones to EXPIRED.
     */
    public int markExpiredDonations(LocalDateTime threshold) {
        int count = 0;
        if (DatabaseConnection.isMySQLActive()) {
            String sql = "UPDATE donations SET status = 'EXPIRED', updated_at = NOW() "
                       + "WHERE status = 'PENDING' AND expiry_datetime <= ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setTimestamp(1, Timestamp.valueOf(threshold));
                count = stmt.executeUpdate();
            } catch (SQLException e) {
                System.err.println("Error batch expiring donations in MySQL: " + e.getMessage());
            }
        }

        // Update in-memory store
        for (Donation d : DONATION_STORE.values()) {
            if (d.getStatus() == DonationStatus.PENDING && d.getExpiryDatetime() != null
                    && !d.getExpiryDatetime().isAfter(threshold)) {
                d.setStatus(DonationStatus.EXPIRED);
                d.setUpdatedAt(LocalDateTime.now());
                count++;
            }
        }
        return count;
    }

    @Override
    public boolean deleteById(Long id) {
        if (id == null) return false;
        DONATION_STORE.remove(id);
        DONATION_LOCKS.remove(id);
        return true;
    }

    private void recordAuditLog(Connection conn, Long donationId, String prevStatus,
                                String newStatus, String actionType, String threadName, String notes) {
        String logSql = "INSERT INTO donation_audit_log (donation_id, previous_status, new_status, action_type, thread_name, notes) "
                      + "VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(logSql)) {
            stmt.setLong(1, donationId);
            stmt.setString(2, prevStatus);
            stmt.setString(3, newStatus);
            stmt.setString(4, actionType);
            stmt.setString(5, threadName);
            stmt.setString(6, notes);
            stmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Could not write audit log: " + e.getMessage());
        }
    }

    private Donation mapRowToDonation(ResultSet rs) throws SQLException {
        Donation d = new Donation();
        d.setId(rs.getLong("id"));
        d.setDonorId(rs.getLong("donor_id"));
        d.setFoodName(rs.getString("food_name"));
        d.setDescription(rs.getString("description"));
        d.setQuantity(rs.getDouble("quantity"));
        d.setQuantityUnit(rs.getString("quantity_unit"));
        d.setCategory(FoodCategory.fromString(rs.getString("category")));
        d.setFoodType(FoodType.fromString(rs.getString("food_type")));
        d.setUnservedSurplus(rs.getBoolean("is_unserved_surplus"));

        Timestamp prepTs = rs.getTimestamp("preparation_datetime");
        if (prepTs != null) d.setPreparationDatetime(prepTs.toLocalDateTime());

        Timestamp expTs = rs.getTimestamp("expiry_datetime");
        if (expTs != null) d.setExpiryDatetime(expTs.toLocalDateTime());

        d.setPickupAddress(rs.getString("pickup_address"));
        d.setPickupTime(rs.getString("pickup_time"));
        d.setInstructions(rs.getString("instructions"));
        d.setStatus(DonationStatus.fromString(rs.getString("status")));

        long claimedBy = rs.getLong("claimed_by_ngo_id");
        if (!rs.wasNull()) d.setClaimedByNgoId(claimedBy);

        Timestamp claimTs = rs.getTimestamp("claimed_at");
        if (claimTs != null) d.setClaimedAt(claimTs.toLocalDateTime());

        Timestamp compTs = rs.getTimestamp("completed_at");
        if (compTs != null) d.setCompletedAt(compTs.toLocalDateTime());

        Timestamp crTs = rs.getTimestamp("created_at");
        if (crTs != null) d.setCreatedAt(crTs.toLocalDateTime());

        Timestamp upTs = rs.getTimestamp("updated_at");
        if (upTs != null) d.setUpdatedAt(upTs.toLocalDateTime());

        // Joined presentation attributes if available
        try { d.setDonorBusinessName(rs.getString("business_name")); } catch (Exception e) {}
        try { d.setDonorPhone(rs.getString("donor_phone")); } catch (Exception e) {}
        try { d.setDonorCity(rs.getString("donor_city")); } catch (Exception e) {}
        try { d.setNgoName(rs.getString("ngo_name")); } catch (Exception e) {}
        try { d.setNgoPhone(rs.getString("ngo_phone")); } catch (Exception e) {}

        return d;
    }
}
