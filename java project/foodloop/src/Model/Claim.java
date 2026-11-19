package foodloop.src.Model;

public class Claim {
    private int claimId;
    private int donationId;
    private int ngoId;
    private String ngoName;
    private String foodName;
    private int quantity;
    private String claimDate;
    private String status;

    public Claim(int claimId, int donationId, int ngoId,String ngoName, String foodName, int quantity,String claimDate, String status){
        this.claimId = claimId;
        this.donationId = donationId;
        this.ngoId = ngoId;
        this.ngoName = ngoName;
        this.foodName = foodName;
        this.quantity = quantity;
        this.claimDate = claimDate;
        this.status = status;
    }

    public int getClaimId() {
        return claimId;
    }

    public int getDonationId() { 
        return donationId; 
    }

    public int getNgoId() { 
        return ngoId; 
    }
    public String getNgoName() { 
        return ngoName; 
    }

    public String getFoodName() { 
        return foodName; 
    }

    public int getQuantity() { 
        return quantity; 
    }

    public String getClaimDate() {
    if (claimDate == null || claimDate.isEmpty()) {
        return "Not Available";
    }

    java.time.LocalDate date = java.time.LocalDate.parse(
        claimDate.substring(0, 10)
    );

    return date.format(
        java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy")
    );
}

    public String getStatus() { 
        return status; 
    }
}

