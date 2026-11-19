package foodloop.src;

import foodloop.src.Dao.DonationExpiryMonitor;
import java.sql.SQLException;
import java.util.Scanner;
import foodloop.src.Dao.UserDAO;
import foodloop.src.Menu.MainMenu;
import foodloop.src.Model.User;

public class Main {
    public static void main(String[] args) throws SQLException {
        Scanner input = new Scanner(System.in);

        UserDAO dao = new UserDAO();
        MainMenu menu = new MainMenu();
        DonationExpiryMonitor monitor = new DonationExpiryMonitor();

        try {
            System.out.println("===== FOODLOOP =====");
            System.out.println("1. Login");
            System.out.println("2. Register");
            System.out.println("3. Exit");

            System.out.print("Enter your choice: ");
            int choice = input.nextInt();
            input.nextLine();
            
            if(choice==1){
                System.out.print("Enter Email: ");
                String email=input.nextLine();
                System.out.print("Enter Password: ");
                String password=input.nextLine();
                if(dao.login(email,password)){
                    monitor.start();
                    menu.showMenu(dao.getUser(email));
                }
                else{
                    System.out.println("INVALID EMAIL OR PASSWORD");
                }
            }
            else if(choice==2){
                System.out.print("Enter Name: ");
                String name=input.nextLine();
                System.out.print("Enter Email: ");
                String email=input.nextLine();
                System.out.print("Enter Password: ");
                String password=input.nextLine();
                System.out.print("Enter Role(MESS/NGO/ADMIN): ");
                String role=input.nextLine().trim().toUpperCase();
                System.out.print("Enter Location: ");
                String location=input.nextLine();
                System.out.print("Enter Food Preferences(Veg/non-Veg): ");
                String food_preference=input.nextLine().trim().toUpperCase();
                
                User user=new User(0, name, email, password, role, location, food_preference);
                if(dao.addUser(user)){
                    System.out.println("Registration Successfull");
                }
                else{
                    System.out.println("Registration Failed!!");
                }
            }
            else if(choice==3){
                System.out.println("Thank you for using Foodloop!");
            }
            else{
                System.out.println("INVALID CHOICE!!");
            }
        }
        finally {
            monitor.stop();
            input.close();
        }
    }
}
