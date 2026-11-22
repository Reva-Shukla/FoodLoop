package foodloop.src.Model;

public class User {
    private int userId;
    private String name;
    private String email;
    private String password;
    private String role;
    private String location;
    private String foodPreference;
    private String assignedMessId;
    private String assignedMessName;
    private String organization;
    private String department;

    // Full constructor (DB read with all fields)
    public User(int userId, String name, String email, String password,
                String role, String location, String foodPreference,
                String assignedMessId, String assignedMessName,
                String organization, String department) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.location = location;
        this.foodPreference = foodPreference;
        this.assignedMessId = assignedMessId;
        this.assignedMessName = assignedMessName;
        this.organization = organization;
        this.department = department;
    }

    // Legacy constructor (backward compatibility with existing code)
    public User(int userId, String name, String email, String password,
                String role, String location, String foodPreference) {
        this(userId, name, email, password, role, location, foodPreference,
             null, null, null, null);
    }

    public int getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
    public String getLocation() { return location; }
    public String getFoodPreference() { return foodPreference; }
    public String getAssignedMessId() { return assignedMessId; }
    public String getAssignedMessName() { return assignedMessName; }
    public String getOrganization() { return organization; }
    public String getDepartment() { return department; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setLocation(String location) { this.location = location; }
    public void setFoodPreference(String foodPreference) { this.foodPreference = foodPreference; }
    public void setAssignedMessId(String assignedMessId) { this.assignedMessId = assignedMessId; }
    public void setOrganization(String organization) { this.organization = organization; }
    public void setDepartment(String department) { this.department = department; }
}
