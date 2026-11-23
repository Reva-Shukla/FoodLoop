package foodloop.src.Dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import foodloop.src.Database.DBConnection;
import foodloop.src.Model.WasteRecord;

public class WasteRecordDAO {

    public List<WasteRecord> getWasteRecordsByMealId(int mealRecordId) throws SQLException {
        List<WasteRecord> records = new ArrayList<>();
        String sql = "SELECT w.waste_id, w.meal_record_id, w.mess_id, h.name AS mess_name, w.food_name, w.food_type, w.portions_discarded, w.reason, w.notes, w.discarded_at FROM waste_records w LEFT JOIN hostels h ON w.mess_id = h.hostel_id WHERE w.meal_record_id = ? ORDER BY w.discarded_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, mealRecordId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    records.add(buildWasteRecord(rs));
                }
            }
        }
        return records;
    }

    public int addWasteRecordWithAllocationCheck(WasteRecord waste) throws SQLException, Util.AuthUtil.ValidationException {
        if (waste.getMealRecordId() <= 0) {
            String sql = "INSERT INTO waste_records (meal_record_id, mess_id, food_name, food_type, portions_discarded, reason, notes) VALUES (NULL, ?, ?, ?, ?, ?, ?)";
            try (Connection con = DBConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, waste.getMessId());
                ps.setString(2, waste.getFoodName());
                ps.setString(3, waste.getFoodType());
                ps.setInt(4, waste.getPortionsDiscarded());
                ps.setString(5, waste.getReason());
                ps.setString(6, waste.getNotes());
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
                    ps.setInt(1, waste.getMealRecordId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            con.rollback();
                            throw new Util.AuthUtil.NotFoundException("Parent meal record not found: " + waste.getMealRecordId());
                        }
                        surplus = rs.getInt("surplus");
                    }
                }

                int allocatedDonations = 0;
                String donSumSql = "SELECT COALESCE(SUM(quantity), 0) AS total FROM donations WHERE meal_record_id = ? AND status IN ('AVAILABLE', 'CLAIMED', 'PICKED_UP')";
                try (PreparedStatement ps = con.prepareStatement(donSumSql)) {
                    ps.setInt(1, waste.getMealRecordId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) allocatedDonations = rs.getInt("total");
                    }
                }

                int allocatedWaste = 0;
                String wasteSumSql = "SELECT COALESCE(SUM(portions_discarded), 0) AS total FROM waste_records WHERE meal_record_id = ?";
                try (PreparedStatement ps = con.prepareStatement(wasteSumSql)) {
                    ps.setInt(1, waste.getMealRecordId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) allocatedWaste = rs.getInt("total");
                    }
                }

                int unallocatedSurplus = Math.max(0, surplus - allocatedDonations - allocatedWaste);
                if (waste.getPortionsDiscarded() > unallocatedSurplus) {
                    con.rollback();
                    throw new Util.AuthUtil.ValidationException(
                        "Discard portion volume (" + waste.getPortionsDiscarded() + ") exceeds available unallocated surplus (" + unallocatedSurplus + ")."
                    );
                }

                String insertSql = "INSERT INTO waste_records (meal_record_id, mess_id, food_name, food_type, portions_discarded, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
                int generatedId = 0;
                try (PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, waste.getMealRecordId());
                    ps.setString(2, waste.getMessId());
                    ps.setString(3, waste.getFoodName());
                    ps.setString(4, waste.getFoodType());
                    ps.setInt(5, waste.getPortionsDiscarded());
                    ps.setString(6, waste.getReason());
                    ps.setString(7, waste.getNotes());
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

    public boolean addWasteRecord(WasteRecord waste) throws SQLException {
        String sql = "INSERT INTO waste_records (meal_record_id, mess_id, food_name, food_type, portions_discarded, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            if (waste.getMealRecordId() > 0) {
                ps.setInt(1, waste.getMealRecordId());
            } else {
                ps.setNull(1, Types.INTEGER);
            }
            ps.setString(2, waste.getMessId());
            ps.setString(3, waste.getFoodName());
            ps.setString(4, waste.getFoodType());
            ps.setInt(5, waste.getPortionsDiscarded());
            ps.setString(6, waste.getReason());
            ps.setString(7, waste.getNotes());

            return ps.executeUpdate() == 1;
        }
    }

    public List<WasteRecord> getWasteRecords(String messId) throws SQLException {
        List<WasteRecord> records = new ArrayList<>();
        String sql = "SELECT w.waste_id, w.meal_record_id, w.mess_id, h.name AS mess_name, w.food_name, w.food_type, w.portions_discarded, w.reason, w.notes, w.discarded_at FROM waste_records w LEFT JOIN hostels h ON w.mess_id = h.hostel_id WHERE w.mess_id = ? ORDER BY w.discarded_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, messId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    records.add(buildWasteRecord(rs));
                }
            }
        }
        return records;
    }

    public List<WasteRecord> getAllWasteRecords() throws SQLException {
        List<WasteRecord> records = new ArrayList<>();
        String sql = "SELECT w.waste_id, w.meal_record_id, w.mess_id, h.name AS mess_name, w.food_name, w.food_type, w.portions_discarded, w.reason, w.notes, w.discarded_at FROM waste_records w LEFT JOIN hostels h ON w.mess_id = h.hostel_id ORDER BY w.discarded_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                records.add(buildWasteRecord(rs));
            }
        }
        return records;
    }

    public int getTotalWasted(String messId) throws SQLException {
        String sql = "SELECT COALESCE(SUM(portions_discarded), 0) AS total FROM waste_records WHERE mess_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, messId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("total");
            }
        }
        return 0;
    }

    public int getAllWasted() throws SQLException {
        String sql = "SELECT COALESCE(SUM(portions_discarded), 0) AS total FROM waste_records";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt("total");
        }
        return 0;
    }

    private WasteRecord buildWasteRecord(ResultSet rs) throws SQLException {
        return new WasteRecord(
            rs.getInt("waste_id"),
            rs.getInt("meal_record_id"),
            rs.getString("mess_id"),
            rs.getString("mess_name"),
            rs.getString("food_name"),
            rs.getString("food_type"),
            rs.getInt("portions_discarded"),
            rs.getString("reason"),
            rs.getString("notes"),
            rs.getString("discarded_at")
        );
    }
}
