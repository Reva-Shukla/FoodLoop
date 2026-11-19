package foodloop.src.Model;

public class Pickup {
    private int pickupId;
    private int claimId;
    private int donationId;
    private String foodName;
    private int quantity;
    private String pickupLocation;
    private String pickupDate;
    private String status;
    private String ngoName;

    public Pickup(int pickupId, int claimId, int donationId,String foodName, int quantity,String pickupLocation, String pickupDate,String status,String ngoName){
        this.pickupId = pickupId;
        this.claimId = claimId;
        this.donationId = donationId;
        this.foodName = foodName;
        this.quantity = quantity;
        this.pickupLocation = pickupLocation;
        this.pickupDate = pickupDate;
        this.status = status;
        this.ngoName=ngoName;
    }

    public int getPickupId() {
        return pickupId;
    }

    public int getClaimId() {
        return claimId;
    }

    public int getDonationId() {
        return donationId;
    }

    public String getFoodName() {
        return foodName;
    }

    public int getQuantity() {
        return quantity;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public String getPickupDate() {
        if (pickupDate == null || pickupDate.isEmpty()) {
        return "Not Available";
    }

    java.time.LocalDate date = java.time.LocalDate.parse(
        pickupDate,
        java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")
    );

    return date.format(
        java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy")
    );
    }

    public String getStatus() {
        return status;
    }

    public String getNgoName() {
        return ngoName;
    }
}

