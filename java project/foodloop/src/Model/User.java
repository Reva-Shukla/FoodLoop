package foodloop.src.Model;

public class User {
     private int userId;
    private String name;
    private String email;
    private String password;
    private String role;
    private String location;
    private String foodPreference;

    public User(int userId, String name, String email,String password, String role,String location, String foodPreference) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.location = location;
        this.foodPreference = foodPreference;
    }

    public int getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public String getLocation() {
        return location;
    }

    public String getFoodPreference() {
        return foodPreference;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setFoodPreference(String foodPreference) {
        this.foodPreference = foodPreference;
    }
}
