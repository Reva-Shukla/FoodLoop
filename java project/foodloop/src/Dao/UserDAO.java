package foodloop.src.Dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import foodloop.src.Database.DBConnection;
import foodloop.src.Model.User;

public class UserDAO {
    
    public boolean addUser(foodloop.src.Model.User user) throws SQLException{
        Connection con=foodloop.src.Database.DBConnection.getConnection();

        String sql="insert into users (name, email, password, role, location, food_preference) VALUES (?, ?, ?, ?, ?, ?)";

        PreparedStatement ps=con.prepareStatement(sql);
        ps.setString(1,user.getName());
        ps.setString(2,user.getEmail());
        ps.setString(3,user.getPassword());
        ps.setString(4,user.getRole());
        ps.setString(5,user.getLocation());
        ps.setString(6,user.getFoodPreference());

        int rowAffected=ps.executeUpdate();
        con.close();

        if(rowAffected==1){
            return true;
        }
        else{
            return false;
        }
    }

    public  User getUser(String email) throws SQLException{
        String sql = "SELECT user_id,name,email,password,role,location,food_preference FROM users WHERE email =?";

        try (Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ResultSet res=ps.executeQuery();

            if(res.next()){
            User acc=new User(res.getInt("user_id"), res.getString("name"), res.getString("email"), res.getString("password"),res.getString("role"), res.getString("location"),res.getString("food_preference"));
            return acc;
            }    
        }
        return null; 
    }

    public boolean login(String email, String password) throws SQLException {
        User acc=getUser(email);
        if(acc==null){
            return false;
        }
        if(acc.getEmail().equals(email) && acc.getPassword().equals(password)){
            return true;
        }
        return false;
    }

    public List<User> getAllUsers() throws SQLException {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM users";

        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                User user = new User(
                    rs.getInt("user_id"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("password"),
                    rs.getString("role"),
                    rs.getString("location"),
                    rs.getString("food_preference")
                );
                users.add(user);
            }
        }
        return users;
    }

    public int getTotalUsers() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM users";
        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            if (rs.next()){
                return rs.getInt("total");
            }
        }
        return 0;
    }
}
