package foodloop.src.Model;

public class MealRecord {
    private int mealId;
    private String messId;
    private String messName;
    private String foodName;
    private String foodType;
    private String mealType;
    private int prepared;
    private int served;
    private int surplus;
    private String mealDate;
    private String loggedBy;
    private String createdAt;

    // Full constructor (DB read with all fields)
    public MealRecord(int mealId, String messId, String messName,
                      String foodName, String foodType, String mealType,
                      int prepared, int served, int surplus,
                      String mealDate, String loggedBy, String createdAt) {
        this.mealId = mealId;
        this.messId = messId;
        this.messName = messName;
        this.foodName = foodName;
        this.foodType = foodType;
        this.mealType = mealType;
        this.prepared = prepared;
        this.served = served;
        this.surplus = surplus;
        this.mealDate = mealDate;
        this.loggedBy = loggedBy;
        this.createdAt = createdAt;
    }

    // Legacy constructor (backward compatibility — uses int messId)
    public MealRecord(int messId, String foodName, int prepared, int served, String mealDate) {
        this(0, String.valueOf(messId), null, foodName, "VEG", "Lunch",
             prepared, served, Math.max(0, prepared - served), mealDate, null, null);
    }

    // Constructor for creating new records (insert)
    public MealRecord(String messId, String foodName, String foodType,
                      String mealType, int prepared, int served,
                      String mealDate, String loggedBy) {
        this(0, messId, null, foodName, foodType, mealType,
             prepared, served, Math.max(0, prepared - served), mealDate, loggedBy, null);
    }

    public int getMealId() { return mealId; }
    public String getMessId() { return messId; }
    public int getMessIdInt() {
        try { return Integer.parseInt(messId); } catch (NumberFormatException e) { return 0; }
    }
    public String getMessName() { return messName; }
    public String getFoodName() { return foodName; }
    public String getFoodType() { return foodType; }
    public String getMealType() { return mealType; }
    public int getPrepared() { return prepared; }
    public int getServed() { return served; }
    public int getSurplus() { return surplus; }

    public String getMealDate() {
        if (mealDate == null || mealDate.isEmpty()) {
            return "Not Available";
        }
        return mealDate;
    }

    public String getLoggedBy() { return loggedBy; }
    public String getCreatedAt() { return createdAt; }
}
