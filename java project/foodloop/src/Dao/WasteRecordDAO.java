package foodloop.src.Dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import foodloop.src.Database.DBConnection;
import foodloop.src.Model.WasteRecord;

public class WasteRecordDAO {

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
