package foodloop.src.Dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import foodloop.src.Database.DBConnection;
import foodloop.src.Model.Hostel;

public class HostelDAO {

    public List<Hostel> getAllHostels() throws SQLException {
        List<Hostel> hostels = new ArrayList<>();
        String sql = "SELECT hostel_id, name, category, category_label, campus FROM hostels ORDER BY category, name";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                hostels.add(new Hostel(
                    rs.getString("hostel_id"),
                    rs.getString("name"),
                    rs.getString("category"),
                    rs.getString("category_label"),
                    rs.getString("campus")
                ));
            }
        }
        return hostels;
    }

    public Hostel getHostelById(String hostelId) throws SQLException {
        String sql = "SELECT hostel_id, name, category, category_label, campus FROM hostels WHERE hostel_id = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, hostelId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Hostel(
                        rs.getString("hostel_id"),
                        rs.getString("name"),
                        rs.getString("category"),
                        rs.getString("category_label"),
                        rs.getString("campus")
                    );
                }
            }
        }
        return null;
    }
}
