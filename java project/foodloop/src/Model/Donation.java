package foodloop.src.Model;

public class Donation {
    private int donationId;
    private int mealRecordId;
    private String messId;
    private String messName;
    private String foodName;
    private int quantity;
    private String foodType;
    private String pickupLocation;
    private String deadline;
    private String preparationDatetime;
    private String storageConditions;
    private String allergens;
    private String status;
    private String createdAt;

    // Full constructor (DB read with all fields)
    public Donation(int donationId, int mealRecordId, String messId, String messName,
                    String foodName, int quantity, String foodType,
                    String pickupLocation, String deadline,
                    String preparationDatetime, String storageConditions,
                    String allergens, String status, String createdAt) {
        this.donationId = donationId;
        this.mealRecordId = mealRecordId;
        this.messId = messId;
        this.messName = messName;
        this.foodName = foodName;
        this.quantity = quantity;
        this.foodType = foodType;
        this.pickupLocation = pickupLocation;
        this.deadline = deadline;
        this.preparationDatetime = preparationDatetime;
        this.storageConditions = storageConditions;
        this.allergens = allergens;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Legacy constructor (creating a new donation — insert)
    public Donation(int messId, String foodName, int quantity,
                    String foodType, String pickupLocation, String deadline) {
        this.messId = String.valueOf(messId);
        this.foodName = foodName;
        this.quantity = quantity;
        this.foodType = foodType;
        this.pickupLocation = pickupLocation;
        this.deadline = deadline;
        this.status = "AVAILABLE";
    }

    // Legacy constructor (reading from DB — backward compat)
    public Donation(int messId, String foodName, int quantity,
                    String foodType, String pickupLocation, String deadline,
                    int donationId, String status) {
        this(donationId, 0, String.valueOf(messId), null, foodName, quantity,
             foodType, pickupLocation, deadline, null, null, null, status, null);
    }

    public int getDonationId() { return donationId; }
    public int getMealRecordId() { return mealRecordId; }
    public String getMessId() { return messId; }
    public int getMessIdInt() {
        try { return Integer.parseInt(messId); } catch (NumberFormatException e) { return 0; }
    }
    public String getMessName() { return messName; }
    public String getFoodName() { return foodName; }
    public int getQuantity() { return quantity; }
    public String getFoodType() { return foodType; }
    public String getPickupLocation() { return pickupLocation; }

    public String getDeadline() {
        if (deadline == null || deadline.isEmpty()) {
            return "Not Available";
        }
        return deadline;
    }

    public String getPreparationDatetime() { return preparationDatetime; }
    public String getStorageConditions() { return storageConditions; }
    public String getAllergens() { return allergens; }
    public String getStatus() { return status; }
    public String getCreatedAt() { return createdAt; }
}
