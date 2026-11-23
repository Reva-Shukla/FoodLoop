package foodloop.src.Dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import foodloop.src.Database.DBConnection;
import foodloop.src.Model.Claim;
import foodloop.src.Model.Donation;
import foodloop.src.Model.Pickup;

public class DonationDAO {

    // ==================== DONATIONS ====================

    public List<Donation> getDonationsByMealId(int mealRecordId) throws SQLException {
        List<Donation> donations = new ArrayList<>();
        String sql = "SELECT d.donation_id, d.meal_record_id, d.mess_id, h.name AS mess_name, d.food_name, d.quantity, d.food_type, d.pickup_location, d.deadline, d.preparation_datetime, d.storage_conditions, d.allergens, d.status, d.created_at FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE d.meal_record_id = ? ORDER BY d.created_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, mealRecordId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    donations.add(buildDonation(rs));
                }
            }
        }
        return donations;
    }

    public int addDonationWithAllocationCheck(Donation donation) throws SQLException, Util.AuthUtil.ValidationException {
        if (donation.getMealRecordId() <= 0) {
            String sql = "INSERT INTO donations (meal_record_id, mess_id, food_name, quantity, food_type, pickup_location, deadline, preparation_datetime, storage_conditions, allergens, status) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')";
            try (Connection con = DBConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, donation.getMessId());
                ps.setString(2, donation.getFoodName());
                ps.setInt(3, donation.getQuantity());
                ps.setString(4, donation.getFoodType());
                ps.setString(5, donation.getPickupLocation());
                ps.setString(6, donation.getDeadline());
                ps.setString(7, donation.getPreparationDatetime());
                ps.setString(8, donation.getStorageConditions());
                ps.setString(9, donation.getAllergens());
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) return rs.getInt(1);
                }
            }
            return 1;
        }

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                int surplus = 0;
                String mealSql = "SELECT surplus FROM meal_records WHERE meal_id = ? FOR UPDATE";
                try (PreparedStatement ps = con.prepareStatement(mealSql)) {
                    ps.setInt(1, donation.getMealRecordId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            con.rollback();
                            throw new Util.AuthUtil.NotFoundException("Parent meal record not found: " + donation.getMealRecordId());
                        }
                        surplus = rs.getInt("surplus");
                    }
                }

                int allocatedDonations = 0;
                String donSumSql = "SELECT COALESCE(SUM(quantity), 0) AS total FROM donations WHERE meal_record_id = ? AND status IN ('AVAILABLE', 'CLAIMED', 'PICKED_UP')";
                try (PreparedStatement ps = con.prepareStatement(donSumSql)) {
                    ps.setInt(1, donation.getMealRecordId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) allocatedDonations = rs.getInt("total");
                    }
                }

                int allocatedWaste = 0;
                String wasteSumSql = "SELECT COALESCE(SUM(portions_discarded), 0) AS total FROM waste_records WHERE meal_record_id = ?";
                try (PreparedStatement ps = con.prepareStatement(wasteSumSql)) {
                    ps.setInt(1, donation.getMealRecordId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) allocatedWaste = rs.getInt("total");
                    }
                }

                int unallocatedSurplus = Math.max(0, surplus - allocatedDonations - allocatedWaste);
                if (donation.getQuantity() > unallocatedSurplus) {
                    con.rollback();
                    throw new Util.AuthUtil.ValidationException(
                        "Donation portion volume (" + donation.getQuantity() + ") exceeds available unallocated surplus (" + unallocatedSurplus + ")."
                    );
                }

                String insertSql = "INSERT INTO donations (meal_record_id, mess_id, food_name, quantity, food_type, pickup_location, deadline, preparation_datetime, storage_conditions, allergens, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')";
                int generatedId = 0;
                try (PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, donation.getMealRecordId());
                    ps.setString(2, donation.getMessId());
                    ps.setString(3, donation.getFoodName());
                    ps.setInt(4, donation.getQuantity());
                    ps.setString(5, donation.getFoodType());
                    ps.setString(6, donation.getPickupLocation());
                    ps.setString(7, donation.getDeadline());
                    ps.setString(8, donation.getPreparationDatetime());
                    ps.setString(9, donation.getStorageConditions());
                    ps.setString(10, donation.getAllergens());
                    ps.executeUpdate();
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        if (rs.next()) generatedId = rs.getInt(1);
                    }
                }

                con.commit();
                return generatedId;
            } catch (SQLException | RuntimeException e) {
                con.rollback();
                throw e;
            }
        }
    }

    public boolean addDonation(Donation donation) throws SQLException {
        String sql = "INSERT INTO donations (meal_record_id, mess_id, food_name, quantity, food_type, pickup_location, deadline, preparation_datetime, storage_conditions, allergens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            if (donation.getMealRecordId() > 0) {
                ps.setInt(1, donation.getMealRecordId());
            } else {
                ps.setNull(1, Types.INTEGER);
            }
            ps.setString(2, donation.getMessId());
            ps.setString(3, donation.getFoodName());
            ps.setInt(4, donation.getQuantity());
            ps.setString(5, donation.getFoodType());
            ps.setString(6, donation.getPickupLocation());
            ps.setString(7, donation.getDeadline());
            ps.setString(8, donation.getPreparationDatetime());
            ps.setString(9, donation.getStorageConditions());
            ps.setString(10, donation.getAllergens());

            return ps.executeUpdate() == 1;
        }
    }

    public int getTotalDonated(String messId) throws SQLException {
        String sql = "SELECT COALESCE(SUM(quantity), 0) AS total FROM donations WHERE mess_id = ? AND status IN ('AVAILABLE', 'CLAIMED', 'PICKED_UP')";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, messId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("total");
            }
        }
        return 0;
    }

    // Legacy overload
    public int getTotalDonated(int messId) throws SQLException {
        return getTotalDonated(String.valueOf(messId));
    }

    public List<Donation> getDonations(String messId) throws SQLException {
        List<Donation> donations = new ArrayList<>();
        String sql = "SELECT d.donation_id, d.meal_record_id, d.mess_id, h.name AS mess_name, d.food_name, d.quantity, d.food_type, d.pickup_location, d.deadline, d.preparation_datetime, d.storage_conditions, d.allergens, d.status, d.created_at FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE d.mess_id = ? ORDER BY d.created_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, messId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    donations.add(buildDonation(rs));
                }
            }
        }
        return donations;
    }

    // Legacy overload
    public List<Donation> getDonations(int messId) throws SQLException {
        return getDonations(String.valueOf(messId));
    }

    public Donation getDonationById(int donationId) throws SQLException {
        String sql = "SELECT d.donation_id, d.meal_record_id, d.mess_id, h.name AS mess_name, d.food_name, d.quantity, d.food_type, d.pickup_location, d.deadline, d.preparation_datetime, d.storage_conditions, d.allergens, d.status, d.created_at FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE d.donation_id = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, donationId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return buildDonation(rs);
            }
        }
        return null;
    }

    public List<Donation> getAvailableDonations() throws SQLException {
        List<Donation> donations = new ArrayList<>();
        String sql = "SELECT d.donation_id, d.meal_record_id, d.mess_id, h.name AS mess_name, d.food_name, d.quantity, d.food_type, d.pickup_location, d.deadline, d.preparation_datetime, d.storage_conditions, d.allergens, d.status, d.created_at FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE d.status = 'AVAILABLE' AND d.deadline > NOW() AND d.is_demo = FALSE ORDER BY d.deadline ASC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                donations.add(buildDonation(rs));
            }
        }
        return donations;
    }

    public List<Donation> getAllDonations() throws SQLException {
        List<Donation> donations = new ArrayList<>();
        String sql = "SELECT d.donation_id, d.meal_record_id, d.mess_id, h.name AS mess_name, d.food_name, d.quantity, d.food_type, d.pickup_location, d.deadline, d.preparation_datetime, d.storage_conditions, d.allergens, d.status, d.created_at FROM donations d LEFT JOIN hostels h ON d.mess_id = h.hostel_id ORDER BY d.created_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                donations.add(buildDonation(rs));
            }
        }
        return donations;
    }

    // ==================== CLAIMS ====================

    public boolean claimDonation(int donationId, int ngoId) throws SQLException {
        String checkSql = "SELECT d.donation_id, d.deadline, d.pickup_location FROM donations d WHERE d.donation_id = ? AND d.status = 'AVAILABLE' AND d.deadline > NOW() AND d.is_demo = FALSE FOR UPDATE";

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                String deadlineStr;
                String pickupLocation;

                // 1. Check donation is available and not expired
                try (PreparedStatement ps = con.prepareStatement(checkSql)) {
                    ps.setInt(1, donationId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            con.rollback();
                            return false;
                        }
                        deadlineStr = rs.getString("deadline");
                        pickupLocation = rs.getString("pickup_location");
                    }
                }

                // 2. Create claim record
                String claimSql = "INSERT INTO claims (donation_id, ngo_id, pickup_deadline, pickup_location) VALUES (?, ?, ?, ?)";
                int claimId;

                try (PreparedStatement ps1 = con.prepareStatement(claimSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps1.setInt(1, donationId);
                    ps1.setInt(2, ngoId);
                    ps1.setString(3, deadlineStr);
                    ps1.setString(4, pickupLocation);
                    if (ps1.executeUpdate() != 1) {
                        con.rollback();
                        return false;
                    }
                    try (ResultSet rs = ps1.getGeneratedKeys()) {
                        if (rs.next()) {
                            claimId = rs.getInt(1);
                        } else {
                            throw new SQLException("Claim ID not generated!");
                        }
                    }
                }

                // 3. Create pickup record
                String pickupSql = "INSERT INTO pickups (claim_id, donation_id, ngo_id, pickup_deadline, pickup_location) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement ps2 = con.prepareStatement(pickupSql)) {
                    ps2.setInt(1, claimId);
                    ps2.setInt(2, donationId);
                    ps2.setInt(3, ngoId);
                    ps2.setString(4, deadlineStr);
                    ps2.setString(5, pickupLocation);
                    if (ps2.executeUpdate() != 1) {
                        con.rollback();
                        return false;
                    }
                }

                // 4. Update donation status
                String updateSql = "UPDATE donations SET status = 'CLAIMED' WHERE donation_id = ?";
                try (PreparedStatement ps3 = con.prepareStatement(updateSql)) {
                    ps3.setInt(1, donationId);
                    if (ps3.executeUpdate() != 1) {
                        con.rollback();
                        return false;
                    }
                }

                con.commit();
                return true;
            } catch (SQLException e) {
                con.rollback();
                throw e;
            }
        }
    }

    public List<Donation> getMyClaims(int ngoId) throws SQLException {
        List<Donation> donations = new ArrayList<>();
        String sql = "SELECT c.claim_id, c.donation_id, c.claim_date, c.status AS claim_status, d.donation_id, d.meal_record_id, d.mess_id, h.name AS mess_name, d.food_name, d.quantity, d.food_type, d.pickup_location, d.deadline, d.preparation_datetime, d.storage_conditions, d.allergens, d.status, d.created_at FROM claims c INNER JOIN donations d ON c.donation_id = d.donation_id LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE c.ngo_id = ? ORDER BY c.claim_date DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, ngoId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    donations.add(buildDonation(rs));
                }
            }
        }
        return donations;
    }

    public List<Claim> getAllClaims() throws SQLException {
        List<Claim> claims = new ArrayList<>();
        String sql = "SELECT c.claim_id, c.donation_id, c.ngo_id, u.name AS ngo_name, d.mess_id, h.name AS mess_name, d.food_name, d.food_type, d.quantity, c.claim_date, c.pickup_deadline, c.pickup_location, c.status FROM claims c INNER JOIN donations d ON c.donation_id = d.donation_id INNER JOIN users u ON c.ngo_id = u.user_id LEFT JOIN hostels h ON d.mess_id = h.hostel_id ORDER BY c.claim_date DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                claims.add(new Claim(
                    rs.getInt("claim_id"),
                    rs.getInt("donation_id"),
                    rs.getInt("ngo_id"),
                    rs.getString("ngo_name"),
                    rs.getString("mess_id"),
                    rs.getString("mess_name"),
                    rs.getString("food_name"),
                    rs.getString("food_type"),
                    rs.getInt("quantity"),
                    rs.getString("claim_date"),
                    rs.getString("pickup_deadline"),
                    rs.getString("pickup_location"),
                    rs.getString("status")
                ));
            }
        }
        return claims;
    }

    // ==================== PICKUPS ====================

    public List<Pickup> getMyPickups(int ngoId) throws SQLException {
        List<Pickup> pickups = new ArrayList<>();
        String sql = "SELECT p.pickup_id, p.claim_id, p.donation_id, p.ngo_id, u.name AS ngo_name, d.mess_id, h.name AS mess_name, d.food_name, d.food_type, d.quantity, d.pickup_location, p.pickup_deadline, p.pickup_date, p.scheduled_at, p.completed_at, p.status FROM pickups p INNER JOIN claims c ON p.claim_id = c.claim_id INNER JOIN donations d ON p.donation_id = d.donation_id INNER JOIN users u ON p.ngo_id = u.user_id LEFT JOIN hostels h ON d.mess_id = h.hostel_id WHERE p.ngo_id = ? ORDER BY p.scheduled_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, ngoId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    pickups.add(buildPickup(rs));
                }
            }
        }
        return pickups;
    }

    public boolean completePickup(int pickupId, int ngoId) throws SQLException {
        String checkSql = "SELECT p.pickup_id, p.donation_id, c.claim_id, p.pickup_deadline, p.status FROM pickups p INNER JOIN claims c ON p.claim_id = c.claim_id WHERE p.pickup_id = ? AND p.ngo_id = ? FOR UPDATE";

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                int donationId;
                int claimId;

                try (PreparedStatement ps = con.prepareStatement(checkSql)) {
                    ps.setInt(1, pickupId);
                    ps.setInt(2, ngoId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            con.rollback();
                            return false;
                        }
                        String status = rs.getString("status");
                        if (!"SCHEDULED".equalsIgnoreCase(status)) {
                            con.rollback();
                            throw new Util.AuthUtil.ConflictException("Pickup is already " + status + " and cannot be completed.");
                        }
                        Timestamp deadline = rs.getTimestamp("pickup_deadline");
                        if (deadline != null && deadline.before(new Timestamp(System.currentTimeMillis()))) {
                            con.rollback();
                            throw new Util.AuthUtil.ConflictException("Collection deadline has expired. This pickup cannot be completed.");
                        }
                        donationId = rs.getInt("donation_id");
                        claimId = rs.getInt("claim_id");
                    }
                }

                // Update pickup → COMPLETED
                String pickupSql = "UPDATE pickups SET status = 'COMPLETED', completed_at = NOW() WHERE pickup_id = ? AND status = 'SCHEDULED'";
                try (PreparedStatement ps1 = con.prepareStatement(pickupSql)) {
                    ps1.setInt(1, pickupId);
                    if (ps1.executeUpdate() != 1) {
                        con.rollback();
                        return false;
                    }
                }

                // Update donation → PICKED_UP
                String donationSql = "UPDATE donations SET status = 'PICKED_UP' WHERE donation_id = ? AND status = 'CLAIMED'";
                try (PreparedStatement ps2 = con.prepareStatement(donationSql)) {
                    ps2.setInt(1, donationId);
                    if (ps2.executeUpdate() != 1) {
                        con.rollback();
                        return false;
                    }
                }

                // Update claim → COMPLETED
                String claimSql = "UPDATE claims SET status = 'COMPLETED' WHERE claim_id = ?";
                try (PreparedStatement ps3 = con.prepareStatement(claimSql)) {
                    ps3.setInt(1, claimId);
                    ps3.executeUpdate();
                }

                con.commit();
                return true;
            } catch (SQLException e) {
                con.rollback();
                throw e;
            }
        }
    }

    public List<Pickup> getAllPickups() throws SQLException {
        List<Pickup> pickups = new ArrayList<>();
        String sql = "SELECT p.pickup_id, p.claim_id, p.donation_id, p.ngo_id, u.name AS ngo_name, d.mess_id, h.name AS mess_name, d.food_name, d.food_type, d.quantity, d.pickup_location, p.pickup_deadline, p.pickup_date, p.scheduled_at, p.completed_at, p.status FROM pickups p INNER JOIN claims c ON p.claim_id = c.claim_id INNER JOIN donations d ON p.donation_id = d.donation_id INNER JOIN users u ON p.ngo_id = u.user_id LEFT JOIN hostels h ON d.mess_id = h.hostel_id ORDER BY p.scheduled_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                pickups.add(buildPickup(rs));
            }
        }
        return pickups;
    }

    // ==================== STATISTICS ====================

    public int getTotalDonations() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM donations";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt("total");
        }
        return 0;
    }

    public int getTotalFoodPickedUp() throws SQLException {
        String sql = "SELECT COALESCE(SUM(d.quantity), 0) AS total FROM donations d INNER JOIN pickups p ON d.donation_id = p.donation_id WHERE p.status = 'COMPLETED'";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt("total");
        }
        return 0;
    }

    public int getPendingPickups() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM pickups WHERE status = 'SCHEDULED'";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt("total");
        }
        return 0;
    }

    public int getCompletedPickups() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM pickups WHERE status = 'COMPLETED'";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt("total");
        }
        return 0;
    }

    // ==================== BUILDERS ====================

    private Donation buildDonation(ResultSet rs) throws SQLException {
        return new Donation(
            rs.getInt("donation_id"),
            rs.getInt("meal_record_id"),
            rs.getString("mess_id"),
            rs.getString("mess_name"),
            rs.getString("food_name"),
            rs.getInt("quantity"),
            rs.getString("food_type"),
            rs.getString("pickup_location"),
            rs.getString("deadline"),
            rs.getString("preparation_datetime"),
            rs.getString("storage_conditions"),
            rs.getString("allergens"),
            rs.getString("status"),
            rs.getString("created_at")
        );
    }

    private Pickup buildPickup(ResultSet rs) throws SQLException {
        return new Pickup(
            rs.getInt("pickup_id"),
            rs.getInt("claim_id"),
            rs.getInt("donation_id"),
            rs.getInt("ngo_id"),
            rs.getString("ngo_name"),
            rs.getString("mess_id"),
            rs.getString("mess_name"),
            rs.getString("food_name"),
            rs.getString("food_type"),
            rs.getInt("quantity"),
            rs.getString("pickup_location"),
            rs.getString("pickup_deadline"),
            rs.getString("pickup_date"),
            rs.getString("scheduled_at"),
            rs.getString("completed_at"),
            rs.getString("status")
        );
    }
}
