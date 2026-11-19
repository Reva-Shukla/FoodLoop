package foodloop.src.Menu;

import java.sql.SQLException;
import java.util.List;
import java.util.Scanner;
import foodloop.src.Dao.DonationDAO;
import foodloop.src.Model.Donation;
import foodloop.src.Model.Pickup;
import foodloop.src.Model.User;

public class NGOMenu {
    Scanner input=new Scanner(System.in);

    public void showMenu(User user) {
        System.out.println("===== NGO DASHBOARD =====");
        System.out.println("Welcome " + user.getName());
        boolean running = true;

        while(running){
            System.out.println("1. View Available Donations");
            System.out.println("2. View My Claims");
            System.out.println("3. Claim Donation");
            System.out.println("4. View My Pickup");
            System.out.println("5. Complete Pickup");
            System.out.println("6. Logout");

            System.out.print("Enter your choice: ");
            int choice = input.nextInt();
            input.nextLine();
            
            switch(choice) {
                case 1:
                    viewDonations(user);
                    System.out.println("\n");
                    break;

                case 2:
                    viewMyClaims(user);
                    System.out.println("\n");
                    break;

                case 3:
                    claimDonation(user);
                    System.out.println("\n");
                    break;

                case 4:
                    viewMyPickups(user);
                    System.out.println("\n");
                    break;
                
                case 5:
                    completePickup(user);
                    System.out.println("\n");
                    break;

                case 6:
                    System.out.println("Logging out...");
                    running=false;
                    break;

                default:
                    System.out.println("Invalid choice!");
            }
        }
    }


    public void viewDonations(User user) {
        DonationDAO dao = new DonationDAO();

        try {
            List<Donation> donateList = dao.getAvailableDonations();

            if (donateList.isEmpty()) {
                System.out.println("No available donations found!");
                return;
            }

            System.out.println("\n===== AVAILABLE DONATIONS =====");
            for(Donation donate : donateList){
                System.out.println("Donation ID: " + donate.getDonationId());
                System.out.println("Mess ID: " + donate.getMessId());
                System.out.println("Food Name: " + donate.getFoodName());
                System.out.println("Quantity: " + donate.getQuantity());
                System.out.println("Food Type: " + donate.getFoodType());
                System.out.println("Pickup Location: " + donate.getPickupLocation());
                System.out.println("Deadline: " + donate.getDeadline());
                System.out.println("Status: " + donate.getStatus());
                System.out.println("--------------------------");
            }
        }
        catch (SQLException e) {
            System.out.println("Database Error: " + e.getMessage());
        }
    }

    public void claimDonation(User user){
        viewDonations(user);

        System.out.print("Enter Donation Id to claim: ");
        int donation_id=input.nextInt();
        input.nextLine();

        DonationDAO dao =new DonationDAO();

        try{
            if(dao.claimDonation(donation_id,user.getUserId())){
                System.out.println("Donation claimed successfully!");
            } 
            else{
                System.out.println("Donation is unavailable or does not exist!");
            }
        }
        catch(SQLException e){
            System.out.println(e.getMessage());
        }
    }


    public void viewMyClaims(User user) {
        DonationDAO dao = new DonationDAO();
        try {
            List<Donation> claims = dao.getMyClaims(user.getUserId());
            if (claims.isEmpty()) {
                System.out.println("You haven't claimed any donations yet!");
                return;
            }
            System.out.println("\n===== MY CLAIMS =====");

            for(Donation donate : claims){
                System.out.println("Donation ID: "+donate.getDonationId());
                System.out.println("Food Name: "+donate.getFoodName());
                System.out.println("Quantity: "+donate.getQuantity());
                System.out.println("Food Type: "+donate.getFoodType());
                System.out.println("Pickup Location: "+donate.getPickupLocation());
                System.out.println("Deadline: "+donate.getDeadline());
                System.out.println("Claim Status: "+donate.getStatus());
                System.out.println("--------------------------");
            }
        } catch (SQLException e) {
            System.out.println("Database Error: " + e.getMessage());
        }
    }

    public void viewMyPickups(User user) {
        DonationDAO dao = new DonationDAO();
        try {
            List<Pickup> pickups = dao.getMyPickups(user.getUserId());
            if (pickups.isEmpty()) {
                System.out.println("No pickup records found!");
                return;
            }

            System.out.println("\n===== MY PICKUPS =====");
            for (Pickup pickup : pickups) {
                System.out.println("Pickup ID: " + pickup.getPickupId());
                System.out.println("Claim ID: " + pickup.getClaimId());
                System.out.println("Donation ID: " + pickup.getDonationId());
                System.out.println("Food Name: " + pickup.getFoodName());
                System.out.println("Quantity: " + pickup.getQuantity());
                System.out.println("Pickup Location: " + pickup.getPickupLocation());
                System.out.println("Pickup Date: " + pickup.getPickupDate());
                System.out.println("Pickup Status: " + pickup.getStatus());
                System.out.println("--------------------------");
            }
        } 
        catch (SQLException e) {
            System.out.println("Database Error: " + e.getMessage());
        }
    }

    public void completePickup(User user) {
        viewMyPickups(user);

        System.out.print("Enter Pickup ID to complete: ");
        int pickupId = input.nextInt();
        input.nextLine();

        DonationDAO dao = new DonationDAO();
        try{
            if(dao.completePickup(pickupId,user.getUserId())){
                System.out.println("Pickup completed successfully!");
            }
            else{
                System.out.println("Invalid pickup, already completed, or not yours!");
            }
        }
        catch (SQLException e) {
            System.out.println("Database Error: " + e.getMessage());
        }
    }
}
