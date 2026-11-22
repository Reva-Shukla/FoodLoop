package foodloop.src.Dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import foodloop.src.Database.DBConnection;
import foodloop.src.Model.MealRecord;

public class MealRecordDAO {

    public boolean addMealRecord(MealRecord meal) throws SQLException {
        String sql = "INSERT INTO meal_records (mess_id, food_name, food_type, meal_type, prepared, served, meal_date, logged_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, meal.getMessId());
            ps.setString(2, meal.getFoodName());
            ps.setString(3, meal.getFoodType());
            ps.setString(4, meal.getMealType());
            ps.setInt(5, meal.getPrepared());
            ps.setInt(6, meal.getServed());
            ps.setString(7, meal.getMealDate());
            ps.setString(8, meal.getLoggedBy());

            return ps.executeUpdate() == 1;
        }
    }

    public List<MealRecord> getMealRecords(String messId) throws SQLException {
        List<MealRecord> records = new ArrayList<>();
        String sql = "SELECT m.meal_id, m.mess_id, h.name AS mess_name, m.food_name, m.food_type, m.meal_type, m.prepared, m.served, m.surplus, m.meal_date, m.logged_by, m.created_at FROM meal_records m LEFT JOIN hostels h ON m.mess_id = h.hostel_id WHERE m.mess_id = ? ORDER BY m.meal_date DESC, m.created_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, messId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    records.add(buildMealRecord(rs));
                }
            }
        }
        return records;
    }

    // Legacy overload for int messId
    public List<MealRecord> getMealRecords(int messId) throws SQLException {
        return getMealRecords(String.valueOf(messId));
    }

    public List<MealRecord> getAllMealRecords() throws SQLException {
        List<MealRecord> records = new ArrayList<>();
        String sql = "SELECT m.meal_id, m.mess_id, h.name AS mess_name, m.food_name, m.food_type, m.meal_type, m.prepared, m.served, m.surplus, m.meal_date, m.logged_by, m.created_at FROM meal_records m LEFT JOIN hostels h ON m.mess_id = h.hostel_id ORDER BY m.meal_date DESC, m.created_at DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                records.add(buildMealRecord(rs));
            }
        }
        return records;
    }

    public MealRecord getMealRecordById(int mealId) throws SQLException {
        String sql = "SELECT m.meal_id, m.mess_id, h.name AS mess_name, m.food_name, m.food_type, m.meal_type, m.prepared, m.served, m.surplus, m.meal_date, m.logged_by, m.created_at FROM meal_records m LEFT JOIN hostels h ON m.mess_id = h.hostel_id WHERE m.meal_id = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, mealId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return buildMealRecord(rs);
                }
            }
        }
        return null;
    }

    public int getTotalSurplus(String messId) throws SQLException {
        String sql = "SELECT COALESCE(SUM(surplus), 0) AS total FROM meal_records WHERE mess_id = ?";
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
    public int getTotalSurplus(int messId) throws SQLException {
        return getTotalSurplus(String.valueOf(messId));
    }

    public int getTotalMeals() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM meal_records";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt("total");
        }
        return 0;
    }

    public int getAllSurplus() throws SQLException {
        String sql = "SELECT COALESCE(SUM(surplus), 0) AS total FROM meal_records";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt("total");
        }
        return 0;
    }

    private MealRecord buildMealRecord(ResultSet rs) throws SQLException {
        return new MealRecord(
            rs.getInt("meal_id"),
            rs.getString("mess_id"),
            rs.getString("mess_name"),
            rs.getString("food_name"),
            rs.getString("food_type"),
            rs.getString("meal_type"),
            rs.getInt("prepared"),
            rs.getInt("served"),
            rs.getInt("surplus"),
            rs.getString("meal_date"),
            rs.getString("logged_by"),
            rs.getString("created_at")
        );
    }
}
