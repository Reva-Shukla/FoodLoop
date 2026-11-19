package foodloop.src.Menu;

import java.sql.SQLException;
import java.util.List;
import java.util.Scanner;
import foodloop.src.Dao.DonationDAO;
import foodloop.src.Dao.MealRecordDAO;
import foodloop.src.Dao.UserDAO;
import foodloop.src.Model.Claim;
import foodloop.src.Model.Donation;
import foodloop.src.Model.Pickup;
import foodloop.src.Model.User;

public class AdminMenu {
    Scanner input = new Scanner(System.in);
    public void showMenu(User user) {
        boolean running = true;

        while (running) {
            System.out.println("\n===== ADMIN DASHBOARD =====");
            System.out.println("Welcome " + user.getName());
            System.out.println("1. View All Users");
            System.out.println("2. View All Donations");
            System.out.println("3. View All Claims");
            System.out.println("4. View All Pickups");
            System.out.println("5. FoodLoop Statistics");
            System.out.println("6. Logout");

            System.out.print("Enter your choice: ");
            int choice = input.nextInt();
            input.nextLine();

            switch (choice) {
                case 1:
                    viewAllUsers();
                    break;
                
                case 2:
                    viewAllDonations();
                    break;

                case 3:
                    viewAllClaims();
                    break;
                
                case 4:
                    viewAllPickups();
                    break;

                case 5:
                    viewStatistics();
                    break;

                case 6:
                    running = false;
                    System.out.println("Admin logged out!");
                    break;

                default:
                    System.out.println("Feature not implemented yet!");
            }
        }
    }

    public void viewAllUsers() {
        UserDAO dao = new UserDAO();
        try {
            List<User> users = dao.getAllUsers();
            if (users.isEmpty()) {
                System.out.println("No users registered!");
                return;
            }
            System.out.println("\n===== ALL REGISTERED USERS =====");
            for (User u : users) {
                System.out.println("User ID: " + u.getUserId());
                System.out.println("Name: " + u.getName());
                System.out.println("Email: " + u.getEmail());
                System.out.println("Role: " + u.getRole());
                System.out.println("Location: " + u.getLocation());
                System.out.println("Food Preference: " + u.getFoodPreference());
                System.out.println("-----------------------------");
            }
        } 
        catch (Exception e) {
            System.out.println("Database Error: " + e.getMessage());
        }
    }

    public void viewAllDonations() {
        DonationDAO dao = new DonationDAO();
        try {
            List<Donation> donations = dao.getAllDonations();
            if (donations.isEmpty()) {
                System.out.println("No donations found!");
                return;
            }
            System.out.println("\n===== ALL FOOD DONATIONS =====");
            for (Donation d : donations) {
                System.out.println("Donation ID: " + d.getDonationId());
                System.out.println("Mess ID: " + d.getMessId());
                System.out.println("Food Name: " + d.getFoodName());
                System.out.println("Quantity: " + d.getQuantity());
                System.out.println("Food Type: " + d.getFoodType());
                System.out.println("Pickup Location: " + d.getPickupLocation());
                System.out.println("Deadline: " + d.getDeadline());
                System.out.println("Status: " + d.getStatus());
                System.out.println("-----------------------------");
            }

        } 
        catch (SQLException e) {
            System.out.println("Database Error: " + e.getMessage());
        }
    }

    public void viewAllClaims() {
        DonationDAO dao = new DonationDAO();

        try {
            List<Claim> claims = dao.getAllClaims();
            if (claims.isEmpty()) {
                System.out.println("No claims found!");
                return;
            }
            System.out.println("\n===== ALL FOOD CLAIMS =====");
            for(Claim c : claims){
                System.out.println("Claim ID: " + c.getClaimId());
                System.out.println("Donation ID: " + c.getDonationId());
                System.out.println("NGO ID: " + c.getNgoId());
                System.out.println("NGO Name: " + c.getNgoName());
                System.out.println("Food Name: " + c.getFoodName());
                System.out.println("Quantity: " + c.getQuantity());
                System.out.println("Claim Date: " + c.getClaimDate());
                System.out.println("Claim Status: " + c.getStatus());
                System.out.println("-----------------------------");
            }
        } 
        catch (SQLException e) {
            System.out.println("Database Error: " + e.getMessage());
        }
    }

    public void viewAllPickups() {

        DonationDAO dao = new DonationDAO();

        try {
            List<Pickup> pickups = dao.getAllPickups();
            if (pickups.isEmpty()) {
                System.out.println("No pickup records found!");
                return;
            }

            System.out.println("\n===== ALL FOOD PICKUPS =====");
            for (Pickup p : pickups) {
                System.out.println("Pickup ID: " + p.getPickupId());
                System.out.println("Claim ID: " + p.getClaimId());
                System.out.println("Donation ID: " + p.getDonationId());
                System.out.println("NGO Name: " + p.getNgoName());
                System.out.println("Food Name: " + p.getFoodName());
                System.out.println("Quantity: " + p.getQuantity());
                System.out.println("Pickup Location: " + p.getPickupLocation());
                System.out.println("Pickup Date: " + p.getPickupDate());
                System.out.println("Pickup Status: " + p.getStatus());
                System.out.println("-----------------------------");
            }
        } 
        catch (SQLException e) {
            System.out.println("Database Error: " + e.getMessage());
        }
    }   

    public void viewStatistics() {
        UserDAO userDAO = new UserDAO();
        MealRecordDAO mealDAO = new MealRecordDAO();
        DonationDAO donationDAO = new DonationDAO();

        try {

            int totalUsers = userDAO.getTotalUsers();

            int totalMeals = mealDAO.getTotalMeals();
            int totalSurplus = mealDAO.getAllSurplus();

            int totalDonations = donationDAO.getTotalDonations();
            int totalFoodPickedUp = donationDAO.getTotalFoodPickedUp();

            int pendingPickups = donationDAO.getPendingPickups();
            int completedPickups = donationDAO.getCompletedPickups();

            System.out.println("\n===== FOODLOOP STATISTICS =====");

            System.out.println("Total Registered Users: " + totalUsers);
            System.out.println("Total Meals Recorded: " + totalMeals);
            System.out.println("Total Surplus Food: " + totalSurplus);

            System.out.println("\nTotal Donations: " + totalDonations);
            System.out.println("Total Food Picked Up: " + totalFoodPickedUp);

            System.out.println("\nPending Pickups: " + pendingPickups);
            System.out.println("Completed Pickups: " + completedPickups);

            System.out.println("===============================");

        } 
        catch (SQLException e){
            System.out.println("Database Error: " + e.getMessage());
        }
    }
}

