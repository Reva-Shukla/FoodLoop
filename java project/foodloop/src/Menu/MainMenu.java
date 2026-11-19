package foodloop.src.Menu;

import foodloop.src.Model.User;

public class MainMenu{
    public void showMenu(User user) {
        switch(user.getRole()){
            case "MESS":
                new MessMenu().showMenu(user);
                break;
            case "ADMIN":
                new AdminMenu().showMenu(user);
                break;
            case "NGO":
                new NGOMenu().showMenu(user);
                break;
            default:
                System.out.println("Invalid user role!");
                break;
        }
    }
}