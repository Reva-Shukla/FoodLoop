package foodloop.src.Dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import foodloop.src.Database.DBConnection;
import foodloop.src.Model.Claim;
import foodloop.src.Model.Donation;
import foodloop.src.Model.Pickup;

import java.sql.Statement;

public class DonationDAO {
    public boolean addDonation(Donation donation) throws SQLException{
        Connection con=DBConnection.getConnection();
        String sql="insert into donations(mess_id,food_name,quantity,food_type,pickup_location,deadline) values(?,?,?,?,?,?)";

        PreparedStatement ps=con.prepareStatement(sql);

        ps.setInt(1,donation.getMessId());
        ps.setString(2,donation.getFoodName());
        ps.setInt(3,donation.getQuantity());
        ps.setString(4,donation.getFoodType());
        ps.setString(5,donation.getPickupLocation());
        ps.setString(6,donation.getDeadline());

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

    public int getTotalDonated(int messId) throws SQLException {
        String sql = "SELECT COALESCE(SUM(quantity), 0) AS total FROM donations WHERE mess_id = ? AND status IN ('AVAILABLE', 'CLAIMED', 'PICKED_UP')";

        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, messId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return rs.getInt("total");
            }
        }
        return 0;
    }

    public List<Donation> getDonations(int messId) throws SQLException{
        List<Donation> donations=new ArrayList<>();
        String sql="select * from donations where mess_id=?";
        try(Connection con=DBConnection.getConnection();
            PreparedStatement ps=con.prepareStatement(sql)){
                 ps.setInt(1,messId);

                ResultSet rs=ps.executeQuery();
                while (rs.next()){
                    Donation donate=new Donation(
                        rs.getInt("mess_id"),
                        rs.getString("food_name"),
                        rs.getInt("quantity"),
                        rs.getString("food_type"),
                        rs.getString("pickup_location"),
                        rs.getString("deadline"),
                        rs.getInt("donation_id"),
                        rs.getString("status")
                    );
                    donations.add(donate);
                }
        }
        return donations;
    }

    public List<Donation> getAvailableDonations() throws SQLException{
        List<Donation> donations=new ArrayList<>();
        String sql="select * from donations WHERE status = 'AVAILABLE'";

        try(Connection con=DBConnection.getConnection();
            PreparedStatement ps=con.prepareStatement(sql)){

                ResultSet rs=ps.executeQuery();
                while (rs.next()){
                    Donation donate=new Donation(
                        rs.getInt("mess_id"),
                        rs.getString("food_name"),
                        rs.getInt("quantity"),
                        rs.getString("food_type"),
                        rs.getString("pickup_location"),
                        rs.getString("deadline"),
                        rs.getInt("donation_id"),
                        rs.getString("status")
                    );
                    donations.add(donate);
                }
        }
        return donations;
    }

    public boolean claimDonation(int donationId, int ngoId) throws SQLException{
        String checkSql="select donation_id from donations where donation_id=? and status='AVAILABLE' for update";

        try(Connection con=DBConnection.getConnection()){
            con.setAutoCommit(false);

            try{
                try(PreparedStatement ps=con.prepareStatement(checkSql)){
                    ps.setInt(1,donationId);

                    try(ResultSet rs=ps.executeQuery()){
                        if(!rs.next()){
                            con.rollback();
                            return false;
                        }
                    }
                }

                String claimSql="INSERT INTO claims(donation_id, ngo_id)VALUES (?, ?)";
                int claimId;

                try(PreparedStatement ps1=con.prepareStatement(claimSql,Statement.RETURN_GENERATED_KEYS)){
                    ps1.setInt(1,donationId);
                    ps1.setInt(2, ngoId);
                    int inserted=ps1.executeUpdate();
                    if(inserted!=1){
                        return false;
                    }

                    try (ResultSet rs=ps1.getGeneratedKeys()){
                        if (rs.next()) {
                            claimId=rs.getInt(1);
                        } else{
                            throw new SQLException("Claim ID not generated!");
                        }
                    }
                }

            String pickupSql = "INSERT INTO pickups(claim_id) VALUES (?)";
            try (PreparedStatement ps2 = con.prepareStatement(pickupSql)) {
                ps2.setInt(1, claimId);
                int inserted = ps2.executeUpdate();
                if (inserted != 1) {
                    con.rollback();
                    return false;
                }
            }

                String updateSql="update donations set status='CLAIMED' where donation_id=?";
                try(PreparedStatement ps3=con.prepareStatement(updateSql)){
                    ps3.setInt(1,donationId);
                    int updated=ps3.executeUpdate();
                    if(updated!=1){
                        con.rollback();
                        return false;
                    }           
                }
                con.commit();
                return true;
            }
            catch(SQLException e){
                con.rollback();
                throw e;
            }
        }
    }

    public List<Donation> getMyClaims(int ngoId) throws SQLException{
        List<Donation> donations=new ArrayList<>();
       String sql = "SELECT c.claim_id, c.donation_id, c.claim_date,c.status,d.mess_id,d.food_name,d.quantity,d.food_type,d.pickup_location,d.deadline FROM claims c INNER JOIN donations d ON c.donation_id = d.donation_id WHERE c.ngo_id = ?";
       try(Connection con=DBConnection.getConnection();
            PreparedStatement ps=con.prepareStatement(sql)){
            ps.setInt(1, ngoId);

            try(ResultSet rs=ps.executeQuery()){
            
                while(rs.next()){
                    Donation donate=new Donation(
                        rs.getInt("mess_id"),
                        rs.getString("food_name"),
                        rs.getInt("quantity"),
                        rs.getString("food_type"),
                        rs.getString("pickup_location"),
                        rs.getString("deadline"),
                        rs.getInt("donation_id"),
                        rs.getString("status")
                    );
                    donations.add(donate);
                }
            }
        }
        return donations;
    }

    public List<Pickup> getMyPickups(int ngoId) throws SQLException{
        List<Pickup> pickups = new ArrayList<>();

    String sql = "SELECT p.pickup_id, p.claim_id, c.donation_id,c.ngo_id, u.name AS ngo_name, d.food_name,d.quantity, d.pickup_location, p.pickup_date, p.status FROM pickups p INNER JOIN claims c ON p.claim_id = c.claim_id INNER JOIN donations d ON c.donation_id = d.donation_id INNER JOIN users u ON c.ngo_id = u.user_id";

    try (Connection con = DBConnection.getConnection();
         PreparedStatement ps = con.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            Pickup pickup = new Pickup(
                rs.getInt("pickup_id"),
                rs.getInt("claim_id"),
                rs.getInt("donation_id"),
                rs.getString("food_name"),
                rs.getInt("quantity"),
                rs.getString("pickup_location"),
                rs.getString("pickup_date"),
                rs.getString("status"),
                rs.getString("ngo_name")
            );
            pickups.add(pickup);
        }
    }

    return pickups;
    }

    public boolean completePickup(int pickupId, int ngoId) throws SQLException{
        String checkSql="SELECT p.pickup_id,c.donation_id FROM pickups p INNER JOIN claims c ON p.claim_id = c.claim_id WHERE p.pickup_id = ? AND c.ngo_id = ? AND p.status = 'SCHEDULED' FOR UPDATE";
        try(Connection con=DBConnection.getConnection()){
            con.setAutoCommit(false);
            try{
                int donationId;
                try(PreparedStatement ps=con.prepareStatement(checkSql)){
                    ps.setInt(1, pickupId);
                    ps.setInt(2, ngoId);

                    try(ResultSet rs=ps.executeQuery()){
                        if(!rs.next()){
                            con.rollback();
                            return false;
                        }
                        donationId = rs.getInt("donation_id");
                    }
                }

                String pickupSql="update pickups set status='COMPLETED' where pickup_id=? and status='SCHEDULED'";
                try (PreparedStatement ps1 = con.prepareStatement(pickupSql)) {
                    ps1.setInt(1, pickupId);
                    int updated = ps1.executeUpdate();

                    if (updated != 1) {
                        con.rollback();
                        return false;
                    }
                }
                String donationSql = "UPDATE donations SET status = 'PICKED_UP' WHERE donation_id = ? AND status = 'CLAIMED'";
                try (PreparedStatement ps2 = con.prepareStatement(donationSql)) {
                    ps2.setInt(1, donationId);
                    int updated = ps2.executeUpdate();
                    if (updated != 1) {
                        con.rollback();
                        return false;
                    }
                }
                con.commit();
                return true;

            } 
            catch (SQLException e) {
                con.rollback();
                throw e;
            }
        }
    }

    public List<Donation> getAllDonations() throws SQLException {
        List<Donation> donations = new ArrayList<>();
        String sql = "SELECT * FROM donations";
        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Donation donate = new Donation(
                    rs.getInt("mess_id"),
                    rs.getString("food_name"),
                    rs.getInt("quantity"),
                    rs.getString("food_type"),
                    rs.getString("pickup_location"),
                    rs.getString("deadline"),
                    rs.getInt("donation_id"),
                    rs.getString("status")
                );
                donations.add(donate);
            }
        }
        return donations;
    }

    public List<Claim> getAllClaims() throws SQLException {
        List<Claim> claims = new ArrayList<>();
        String sql = "SELECT c.claim_id, c.donation_id, c.ngo_id,u.name AS ngo_name, d.food_name, d.quantity,c.claim_date, c.status FROM claims c INNER JOIN donations d ON c.donation_id = d.donation_id INNER JOIN users u ON c.ngo_id = u.user_id";

        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()){

            while (rs.next()) {
                Claim claim = new Claim(
                    rs.getInt("claim_id"),
                    rs.getInt("donation_id"),
                    rs.getInt("ngo_id"),
                    rs.getString("ngo_name"),
                    rs.getString("food_name"),
                    rs.getInt("quantity"),
                    rs.getString("claim_date"),
                    rs.getString("status")
                );
                claims.add(claim);
            }
        }
        return claims;
    }

    public List<Pickup> getAllPickups() throws SQLException {
        List<Pickup> pickups = new ArrayList<>();
        String sql = "SELECT p.pickup_id, p.claim_id, c.donation_id,u.name AS ngo_name, d.food_name, d.quantity,d.pickup_location, p.pickup_date, p.status FROM pickups p INNER JOIN claims c ON p.claim_id = c.claim_id INNER JOIN donations d ON c.donation_id = d.donation_id INNER JOIN users u ON c.ngo_id = u.user_id";

        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Pickup pickup = new Pickup(
                    rs.getInt("pickup_id"),
                    rs.getInt("claim_id"),
                    rs.getInt("donation_id"),
                    rs.getString("food_name"),
                    rs.getInt("quantity"),
                    rs.getString("pickup_location"),
                    rs.getString("pickup_date"),
                    rs.getString("status"),
                    rs.getString("ngo_name")
                );
                pickups.add(pickup);
            }
        }
        return pickups;
    }

    public int getTotalDonations() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM donations";
        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("total");
            }
        }
        return 0;
    }

    public int getTotalFoodPickedUp() throws SQLException {
        String sql = "SELECT COALESCE(SUM(d.quantity), 0) AS total FROM donations d INNER JOIN claims c ON d.donation_id = c.donation_id INNER JOIN pickups p ON c.claim_id = p.claim_id WHERE p.status = 'COMPLETED'";
        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("total");
            }
        }
        return 0;
    }

    public int getPendingPickups() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM pickups WHERE status = 'SCHEDULED'";
        try (Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("total");
            }
        }
        return 0;
    }

    public int getCompletedPickups() throws SQLException {
        String sql = "SELECT COUNT(*) AS total FROM pickups WHERE status = 'COMPLETED'";
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

