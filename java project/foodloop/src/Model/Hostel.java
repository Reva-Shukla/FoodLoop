package foodloop.src.Model;

public class Hostel {
    private String hostelId;
    private String name;
    private String category;
    private String categoryLabel;
    private String campus;

    public Hostel(String hostelId, String name, String category,
                  String categoryLabel, String campus) {
        this.hostelId = hostelId;
        this.name = name;
        this.category = category;
        this.categoryLabel = categoryLabel;
        this.campus = campus;
    }

    public String getHostelId() { return hostelId; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getCategoryLabel() { return categoryLabel; }
    public String getCampus() { return campus; }
}
