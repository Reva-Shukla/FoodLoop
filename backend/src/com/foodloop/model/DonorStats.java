package com.foodloop.model;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Value Object: DonorStats
 * Encapsulates computed donor impact and operational statistics.
 */
public class DonorStats {
    private String businessName;
    private long totalDonations;
    private long pendingDonations;
    private long acceptedDonations;
    private long inProgressDonations;
    private long completedDonations;
    private long expiredDonations;
    private long cancelledDonations;
    private double totalFoodQuantity;
    private double activeFoodQuantity;

    public DonorStats() {}

    public DonorStats(String businessName, long totalDonations, long pendingDonations,
                      long acceptedDonations, long inProgressDonations, long completedDonations,
                      long expiredDonations, long cancelledDonations,
                      double totalFoodQuantity, double activeFoodQuantity) {
        this.businessName = businessName;
        this.totalDonations = totalDonations;
        this.pendingDonations = pendingDonations;
        this.acceptedDonations = acceptedDonations;
        this.inProgressDonations = inProgressDonations;
        this.completedDonations = completedDonations;
        this.expiredDonations = expiredDonations;
        this.cancelledDonations = cancelledDonations;
        this.totalFoodQuantity = totalFoodQuantity;
        this.activeFoodQuantity = activeFoodQuantity;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("businessName", businessName);
        map.put("totalDonations", totalDonations);
        map.put("pendingDonations", pendingDonations);
        map.put("acceptedDonations", acceptedDonations);
        map.put("inProgressDonations", inProgressDonations);
        map.put("completedDonations", completedDonations);
        map.put("expiredDonations", expiredDonations);
        map.put("cancelledDonations", cancelledDonations);
        map.put("totalFoodQuantity", totalFoodQuantity);
        map.put("activeFoodQuantity", activeFoodQuantity);
        return map;
    }

    // Getters and Setters
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public long getTotalDonations() { return totalDonations; }
    public void setTotalDonations(long totalDonations) { this.totalDonations = totalDonations; }
    public long getPendingDonations() { return pendingDonations; }
    public void setPendingDonations(long pendingDonations) { this.pendingDonations = pendingDonations; }
    public long getAcceptedDonations() { return acceptedDonations; }
    public void setAcceptedDonations(long acceptedDonations) { this.acceptedDonations = acceptedDonations; }
    public long getInProgressDonations() { return inProgressDonations; }
    public void setInProgressDonations(long inProgressDonations) { this.inProgressDonations = inProgressDonations; }
    public long getCompletedDonations() { return completedDonations; }
    public void setCompletedDonations(long completedDonations) { this.completedDonations = completedDonations; }
    public long getExpiredDonations() { return expiredDonations; }
    public void setExpiredDonations(long expiredDonations) { this.expiredDonations = expiredDonations; }
    public long getCancelledDonations() { return cancelledDonations; }
    public void setCancelledDonations(long cancelledDonations) { this.cancelledDonations = cancelledDonations; }
    public double getTotalFoodQuantity() { return totalFoodQuantity; }
    public void setTotalFoodQuantity(double totalFoodQuantity) { this.totalFoodQuantity = totalFoodQuantity; }
    public double getActiveFoodQuantity() { return activeFoodQuantity; }
    public void setActiveFoodQuantity(double activeFoodQuantity) { this.activeFoodQuantity = activeFoodQuantity; }
}
