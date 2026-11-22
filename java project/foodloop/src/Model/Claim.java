package foodloop.src.Model;

public class Claim {
    private int claimId;
    private int donationId;
    private int ngoId;
    private String ngoName;
    private String messId;
    private String messName;
    private String foodName;
    private String foodType;
    private int quantity;
    private String claimDate;
    private String pickupDeadline;
    private String pickupLocation;
    private String status;

    // Full constructor (DB read with all fields)
    public Claim(int claimId, int donationId, int ngoId, String ngoName,
                 String messId, String messName, String foodName, String foodType,
                 int quantity, String claimDate, String pickupDeadline,
                 String pickupLocation, String status) {
        this.claimId = claimId;
        this.donationId = donationId;
        this.ngoId = ngoId;
        this.ngoName = ngoName;
        this.messId = messId;
        this.messName = messName;
        this.foodName = foodName;
        this.foodType = foodType;
        this.quantity = quantity;
        this.claimDate = claimDate;
        this.pickupDeadline = pickupDeadline;
        this.pickupLocation = pickupLocation;
        this.status = status;
    }

    // Legacy constructor (backward compatibility)
    public Claim(int claimId, int donationId, int ngoId, String ngoName,
                 String foodName, int quantity, String claimDate, String status) {
        this(claimId, donationId, ngoId, ngoName, null, null, foodName,
             null, quantity, claimDate, null, null, status);
    }

    public int getClaimId() { return claimId; }
    public int getDonationId() { return donationId; }
    public int getNgoId() { return ngoId; }
    public String getNgoName() { return ngoName; }
    public String getMessId() { return messId; }
    public String getMessName() { return messName; }
    public String getFoodName() { return foodName; }
    public String getFoodType() { return foodType; }
    public int getQuantity() { return quantity; }

    public String getClaimDate() {
        if (claimDate == null || claimDate.isEmpty()) {
            return "Not Available";
        }
        // Handle ISO datetime from DB (e.g. "2026-11-22 10:30:00")
        if (claimDate.length() >= 10) {
            return claimDate.substring(0, 10);
        }
        return claimDate;
    }

    public String getPickupDeadline() { return pickupDeadline; }
    public String getPickupLocation() { return pickupLocation; }
    public String getStatus() { return status; }
}
