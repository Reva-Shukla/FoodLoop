package foodloop.src.Model;

public class Donation {
    private int donationId;
    private int messId;
    private String foodName;
    private int quantity;
    private String foodType;
    private String pickupLocation;
    private String deadline;
    private String status;

    public Donation(int messId,String foodName,int quantity,String foodType,String pickupLocation,String deadline){
    this.messId=messId;
    this.foodName=foodName;
    this.quantity=quantity;
    this.foodType=foodType;
    this.pickupLocation=pickupLocation;
    this.deadline=deadline;
    this.status="AVAILABLE";
    }

    public Donation(int messId,String foodName,int quantity,String foodType,String pickupLocation,String deadline,int donationId,String status){
    this.messId=messId;
    this.foodName=foodName;
    this.quantity=quantity;
    this.foodType=foodType;
    this.pickupLocation=pickupLocation;
    this.deadline=deadline;
    this.donationId=donationId;
    this.status=status;
    }

    public int getMessId(){
        return messId;
    }

    public String getFoodName(){
        return foodName;
    }

    public int getQuantity(){
        return quantity;
    }

    public String getFoodType(){
        return foodType;
    }

    public String getPickupLocation(){
        return pickupLocation;
    }

    public String getDeadline(){
       if (deadline == null || deadline.isEmpty()) {
        return "Not Available";
    }

    java.time.LocalDate date = java.time.LocalDate.parse(
        deadline,
        java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")
    );

    return date.format(
        java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy")
    );
    }

    public int getDonationId(){
        return donationId;
    }

    public String getStatus(){
        return status;
    }
}
