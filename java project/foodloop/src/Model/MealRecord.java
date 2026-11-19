package foodloop.src.Model;

public class MealRecord {
    private int mealId;
    private int messId;
    private String foodName;
    private int prepared;
    private int served;
    private String mealDate;

    public MealRecord(int messId, String foodName,int prepared, int served, String mealDate){
        this.messId = messId;
        this.foodName = foodName;
        this.prepared = prepared;
        this.served = served;
        this.mealDate = mealDate;
    }

    public int getMealId(){
        return mealId;
    }

    public int getMessId(){
        return messId;
    }

    public String getFoodName(){
        return foodName;
    }

    public int getPrepared(){
        return prepared;
    }

    public int getServed(){
        return served;
    }

   public String getMealDate() {
    if (mealDate == null || mealDate.isEmpty()) {
        return "Not Available";
    }

    return mealDate;
}


}
