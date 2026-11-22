package foodloop.src.Dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import foodloop.src.Database.DBConnection;
import foodloop.src.Model.User;
import foodloop.src.Util.PasswordUtil;

public class UserDAO {

    public boolean addUser(User user) throws SQLException {
        String sql = "INSERT INTO users (name, email, password, role, location, food_preference, assigned_mess_id, organization, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setString(3, PasswordUtil.hashPassword(user.getPassword()));
            ps.setString(4, user.getRole());
            ps.setString(5, user.getLocation());
            ps.setString(6, user.getFoodPreference());
            ps.setString(7, user.getAssignedMessId());
            ps.setString(8, user.getOrganization());
            ps.setString(9, user.getDepartment());

            return ps.executeUpdate() == 1;
        }
    }

    public User getUser(String email) throws SQLException {
        String sql = "SELECT u.user_id, u.name, u.email, u.password, u.role, u.location, u.food_preference, u.assigned_mess_id, h.name AS mess_name, u.organization, u.department FROM users u LEFT JOIN hostels h ON u.assigned_mess_id = h.hostel_id WHERE u.email = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new User(
                        rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getString("role"),
                        rs.getString("location"),
                        rs.getString("food_preference"),
                        rs.getString("assigned_mess_id"),
                        rs.getString("mess_name"),
                        rs.getString("organization"),
                        rs.getString("department")
                    );
                }
            }
        }
        return null;
    }

    public User getUserById(int userId) throws SQLException {
        String sql = "SELECT u.user_id, u.name, u.email, u.password, u.role, u.location, u.food_preference, u.assigned_mess_id, h.name AS mess_name, u.organization, u.department FROM users u LEFT JOIN hostels h ON u.assigned_mess_id = h.hostel_id WHERE u.user_id = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new User(
                        rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getString("role"),
                        rs.getString("location"),
                        rs.getString("food_preference"),
                        rs.getString("assigned_mess_id"),
                        rs.getString("mess_name"),
                        rs.getString("organization"),
                        rs.getString("department")
                    );
                }
            }
        }
        return null;
    }

    public boolean login(String email, String password) throws SQLException {
        User user = getUser(email);
        if (user == null) {
            return false;
        }
        return PasswordUtil.verifyPassword(password, user.getPassword());
    }

    public List<User> getAllUsers() throws SQLException {
        List<User> users = new ArrayList<>();
        String sql = "SELECT u.user_id, u.name, u.email, u.password, u.role, u.location, u.food_preference, u.assigned_mess_id, h.name AS mess_name, u.organization, u.department FROM users u LEFT JOIN hostels h ON u.assigned_mess_id = h.hostel_id";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                users.add(new User(
                    rs.getInt("user_id"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("password"),
                    rs.getString("role"),
                    rs.getString("location"),
                    rs.getString("food_preference"),
                    rs.getString("assigned_mess_id"),
                    rs.getString("mess_name"),
                    rs.getString("organization"),
                    rs.getString("department")
                ));
            }
        }
        return users;
    }

    public int getTotalUsers() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM users";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("total");
            }
        }
        return 0;
    }
}
