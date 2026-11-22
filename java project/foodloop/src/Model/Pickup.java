package foodloop.src.Model;

public class Pickup {
    private int pickupId;
    private int claimId;
    private int donationId;
    private int ngoId;
    private String ngoName;
    private String messId;
    private String messName;
    private String foodName;
    private String foodType;
    private int quantity;
    private String pickupLocation;
    private String pickupDeadline;
    private String pickupDate;
    private String scheduledAt;
    private String completedAt;
    private String status;

    // Full constructor (DB read with all fields)
    public Pickup(int pickupId, int claimId, int donationId, int ngoId,
                  String ngoName, String messId, String messName,
                  String foodName, String foodType, int quantity,
                  String pickupLocation, String pickupDeadline,
                  String pickupDate, String scheduledAt,
                  String completedAt, String status) {
        this.pickupId = pickupId;
        this.claimId = claimId;
        this.donationId = donationId;
        this.ngoId = ngoId;
        this.ngoName = ngoName;
        this.messId = messId;
        this.messName = messName;
        this.foodName = foodName;
        this.foodType = foodType;
        this.quantity = quantity;
        this.pickupLocation = pickupLocation;
        this.pickupDeadline = pickupDeadline;
        this.pickupDate = pickupDate;
        this.scheduledAt = scheduledAt;
        this.completedAt = completedAt;
        this.status = status;
    }

    // Legacy constructor (backward compatibility)
    public Pickup(int pickupId, int claimId, int donationId,
                  String foodName, int quantity, String pickupLocation,
                  String pickupDate, String status, String ngoName) {
        this(pickupId, claimId, donationId, 0, ngoName, null, null,
             foodName, null, quantity, pickupLocation, null,
             pickupDate, null, null, status);
    }

    public int getPickupId() { return pickupId; }
    public int getClaimId() { return claimId; }
    public int getDonationId() { return donationId; }
    public int getNgoId() { return ngoId; }
    public String getNgoName() { return ngoName; }
    public String getMessId() { return messId; }
    public String getMessName() { return messName; }
    public String getFoodName() { return foodName; }
    public String getFoodType() { return foodType; }
    public int getQuantity() { return quantity; }
    public String getPickupLocation() { return pickupLocation; }
    public String getPickupDeadline() { return pickupDeadline; }

    public String getPickupDate() {
        if (pickupDate == null || pickupDate.isEmpty()) {
            return "Not Available";
        }
        // DB returns ISO/MySQL format (e.g. "2026-11-22 14:30:00") — return as-is
        if (pickupDate.length() >= 10) {
            return pickupDate.substring(0, 10);
        }
        return pickupDate;
    }

    public String getScheduledAt() { return scheduledAt; }
    public String getCompletedAt() { return completedAt; }
    public String getStatus() { return status; }
}
