package foodloop.src.Model;

public class WasteRecord {
    private int wasteId;
    private int mealRecordId;
    private String messId;
    private String messName;
    private String foodName;
    private String foodType;
    private int portionsDiscarded;
    private String reason;
    private String notes;
    private String discardedAt;

    // Full constructor (DB read)
    public WasteRecord(int wasteId, int mealRecordId, String messId,
                       String messName, String foodName, String foodType,
                       int portionsDiscarded, String reason,
                       String notes, String discardedAt) {
        this.wasteId = wasteId;
        this.mealRecordId = mealRecordId;
        this.messId = messId;
        this.messName = messName;
        this.foodName = foodName;
        this.foodType = foodType;
        this.portionsDiscarded = portionsDiscarded;
        this.reason = reason;
        this.notes = notes;
        this.discardedAt = discardedAt;
    }

    // Insert constructor (no wasteId yet)
    public WasteRecord(int mealRecordId, String messId, String foodName,
                       String foodType, int portionsDiscarded,
                       String reason, String notes) {
        this(0, mealRecordId, messId, null, foodName, foodType,
             portionsDiscarded, reason, notes, null);
    }

    public int getWasteId() { return wasteId; }
    public int getMealRecordId() { return mealRecordId; }
    public String getMessId() { return messId; }
    public String getMessName() { return messName; }
    public String getFoodName() { return foodName; }
    public String getFoodType() { return foodType; }
    public int getPortionsDiscarded() { return portionsDiscarded; }
    public String getReason() { return reason; }
    public String getNotes() { return notes; }

    public String getDiscardedAt() {
        if (discardedAt == null || discardedAt.isEmpty()) {
            return "Not Available";
        }
        return discardedAt;
    }
}
