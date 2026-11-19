package foodloop.src.Dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import foodloop.src.Database.DBConnection;
import foodloop.src.Model.MealRecord;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class MealRecordDAO {
    public boolean addMealRecord(MealRecord meal) throws SQLException{
        Connection con=DBConnection.getConnection();
        String sql="insert into meal_records(mess_id,food_name,prepared,served,meal_date) values(?,?,?,?,?)";

        PreparedStatement ps=con.prepareStatement(sql);

        ps.setInt(1,meal.getMessId());
        ps.setString(2,meal.getFoodName());
        ps.setInt(3,meal.getPrepared());
        ps.setInt(4,meal.getServed());
        ps.setString(5,meal.getMealDate());

        int rowAffected=ps.executeUpdate();
        ps.close();
        con.close();

        if(rowAffected==1){
            return true;
        }
        else{
            return false;
        }
    }

    public List<MealRecord> getMealRecords(int messId) throws SQLException {
        List<MealRecord> records=new ArrayList<>();

        String sql="select * from meal_records where mess_id=?";
        try(Connection con=DBConnection.getConnection();
            PreparedStatement ps=con.prepareStatement(sql)){
                ps.setInt(1,messId);

                ResultSet rs=ps.executeQuery();
                while (rs.next()){
                    MealRecord meal=new MealRecord(
                        rs.getInt("mess_id"),
                        rs.getString("food_name"),
                        rs.getInt("prepared"),
                        rs.getInt("served"),
                        rs.getString("meal_date")
                    );
                    records.add(meal);
                }
            }
            return records;
    }

    public int getTotalSurplus(int messId) throws SQLException{
        String sql="SELECT COALESCE(SUM(surplus), 0) AS total FROM meal_records WHERE mess_id = ?";
        try(Connection con=DBConnection.getConnection();
            PreparedStatement ps=con.prepareStatement(sql)){
            ps.setInt(1,messId);

            ResultSet rs=ps.executeQuery();
            if(rs.next())
                return rs.getInt("total");
        }
        return 0;
    }

    public int getTotalMeals() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM meal_records";
        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            if (rs.next()){
                return rs.getInt("total");
            }
        }
        return 0;
    }

    public int getAllSurplus() throws SQLException {
        String sql = "SELECT COALESCE(SUM(surplus), 0) AS total FROM meal_records";
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
