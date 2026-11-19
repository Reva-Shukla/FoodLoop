package foodloop.src.Menu;

import java.util.Scanner;
import foodloop.src.Model.User;
import foodloop.src.Dao.DonationDAO;
import foodloop.src.Dao.MealRecordDAO;
import foodloop.src.Model.Donation;
import foodloop.src.Model.MealRecord;
import java.sql.SQLException;
import java.util.List;

public class MessMenu {
    Scanner input=new Scanner(System.in);
    
     public void showMenu(User user) {
        System.out.println("===== MESS DASHBOARD =====");
        System.out.println("Welcome " + user.getName());
        boolean running = true;

        while(running){
            System.out.println("1. Record Daily Meals");
            System.out.println("2. View Meal Records");
            System.out.println("3. Create Food Donation");
            System.out.println("4. View Donations");
            System.out.println("5. Logout");

            System.out.print("Enter your choice: ");
            int choice = input.nextInt();
            input.nextLine();
            
            switch(choice) {
                case 1:
                    recordMeal(user);
                    System.out.println("\n");
                    break;

                case 2:
                    viewMealRecords(user);
                    System.out.println("\n");
                    break;

                case 3:
                    createDonation(user);
                    System.out.println("\n");
                    break;

                case 4:
                    viewDonations(user);
                    System.out.println("\n");
                    break;

                case 5:
                    System.out.println("Logging out...");
                    running=false;
                    break;

                default:
                    System.out.println("Invalid choice!");
            }
        }
    }


    public void recordMeal(User user) {
        System.out.print("Enter Food Name: ");
        String foodName = input.nextLine();

        System.out.print("Enter Prepared Quantity: ");
        int prepared = input.nextInt();

        System.out.print("Enter Served Quantity: ");
        int served = input.nextInt();
        input.nextLine();

        System.out.print("Enter Meal Date (DD-MM-YYYY): ");
        String mealDate = input.nextLine();

        if(prepared<0||served<0||served>prepared){
            System.out.println("Invalid meal quantities!");
            return;
        }

        MealRecord meal =new MealRecord(user.getUserId(),foodName,prepared,served,mealDate);

        MealRecordDAO dao = new MealRecordDAO();

        try {
            if (dao.addMealRecord(meal)) {
                System.out.println("Meal Record Added Successfully!");
                System.out.println("Surplus: "+(prepared-served));
            } else {
                System.out.println("Failed to add meal record!");
            }
        } catch (SQLException e) {
            System.out.println("Database Error: "+e.getMessage());
        }
    }

    public void viewMealRecords(User user) {
        MealRecordDAO dao=new MealRecordDAO();
        try{
            List<MealRecord> records=dao.getMealRecords(user.getUserId());

            if(records.isEmpty()){
                System.out.println("No meal records found!");
                return ;
            }
            System.out.println("\n===== MEAL RECORDS =====");
            for(MealRecord meal:records){
                System.out.println("Food: "+meal.getFoodName());
                System.out.println("Prepared: "+meal.getPrepared());
                System.out.println("Served: " +meal.getServed());
                System.out.println("Surplus: "+(meal.getPrepared()-meal.getServed()));
                System.out.println("Date: "+meal.getMealDate());
                System.out.println("----------------------");
            }
        }
        catch (SQLException e){
            System.out.println("Database Error: "+e.getMessage());
        }
    }

    public void createDonation(User user){
        System.out.print("Enter Food Name: ");
        String foodName=input.nextLine();

        System.out.print("Enter Quantity: ");
        int quantity=input.nextInt();
        input.nextLine();

        System.out.print("Enter FoodType(Veg/Non-Veg): ");
        String foodType=input.nextLine().trim().toUpperCase();

        System.out.print("Enter Pickup Location: ");
        String pickupLocation=input.nextLine();

        System.out.print("Enter Deadline: ");
        String deadline=input.nextLine();

        try {
            MealRecordDAO mealDao=new MealRecordDAO();
            DonationDAO donationDao=new DonationDAO();

            int totalSurplus=mealDao.getTotalSurplus(user.getUserId());
            int totalDonated=donationDao.getTotalDonated(user.getUserId());
            int remainingSurplus=totalSurplus-totalDonated;


            if (foodName.isBlank()) {
                System.out.println("Food Name is Empty!!");
            }
            else if (quantity <= 0) {
                System.out.println("Quantity must be greater than zero!!");
            }
            else if (foodType.isBlank()||(!foodType.equals("VEG") && !foodType.equals("NON_VEG"))) {
                System.out.println("Invalid Food Type!!");
            }
            else if (pickupLocation.isBlank()) {
                System.out.println("Pickup Location is Empty!!");
            }
            else if (deadline.isBlank()) {
                System.out.println("Deadline is Empty!!");
            }
            else if (quantity > remainingSurplus) {
                System.out.println("Insufficient Surplus!!");
                System.out.println("Remaining Surplus: " + remainingSurplus);
            }
            else {
                Donation donation = new Donation(user.getUserId(), foodName, quantity,foodType, pickupLocation, deadline);

                if (donationDao.addDonation(donation)) {
                    System.out.println("Donation Successful!");
                }
                else {
                    System.out.println("Donation Failed!!");
                }
            }
        }
        catch(SQLException e){
            System.out.println("SQL Error: "+e.getMessage());
        }
    }

    public void viewDonations(User user){
        DonationDAO dao=new DonationDAO();
        try{
            List<Donation> donateList=dao.getDonations(user.getUserId());

            if(donateList.isEmpty()){
                System.out.println("No donation records found!");
                return ;
            }
            System.out.println("\n===== DONATION RECORDS =====");
            for(Donation donate:donateList){
                System.out.println("Donation Id: "+donate.getDonationId());
                System.out.println("Mess Id: "+donate.getMessId());
                System.out.println("Food Name: " +donate.getFoodName());
                System.out.println("Quantity: "+donate.getQuantity());
                System.out.println("FoodType: "+donate.getFoodType());
                System.out.println("Pickup Location: "+donate.getPickupLocation());
                System.out.println("Deadline: "+donate.getDeadline());
                System.out.println("Status: "+donate.getStatus());
                System.out.println("----------------------");
                System.out.println("\n");
            }
        }
        catch (SQLException e){
            System.out.println("Database Error: "+e.getMessage());
        }
    }
}
