package foodloop.src.Dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import foodloop.src.Database.DBConnection;

public class DonationExpiryMonitor {
    private ScheduledExecutorService scheduler;

    public void start() {
        scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleAtFixedRate(() -> {
            System.out.println("\n[Background Thread] Checking expired donations...");

            // Mark expired donations (deadline is now a proper DATETIME column)
            String donationSql = "UPDATE donations SET status = 'EXPIRED' WHERE status = 'AVAILABLE' AND deadline < NOW()";
            // Mark missed pickups
            String pickupSql = "UPDATE pickups SET status = 'MISSED' WHERE status = 'SCHEDULED' AND pickup_deadline < NOW()";
            // Mark expired claims
            String claimSql = "UPDATE claims SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND pickup_deadline < NOW()";

            try (Connection con = DBConnection.getConnection()) {
                // Expire donations
                try (PreparedStatement ps1 = con.prepareStatement(donationSql)) {
                    int updated = ps1.executeUpdate();
                    if (updated > 0) {
                        System.out.println("[Background Thread] " + updated + " donation(s) marked as EXPIRED.");
                    }
                }

                // Miss pickups
                try (PreparedStatement ps2 = con.prepareStatement(pickupSql)) {
                    int updated = ps2.executeUpdate();
                    if (updated > 0) {
                        System.out.println("[Background Thread] " + updated + " pickup(s) marked as MISSED.");
                    }
                }

                // Expire claims
                try (PreparedStatement ps3 = con.prepareStatement(claimSql)) {
                    int updated = ps3.executeUpdate();
                    if (updated > 0) {
                        System.out.println("[Background Thread] " + updated + " claim(s) marked as EXPIRED.");
                    }
                }

                System.out.println("[Background Thread] Expiry check complete.");

            } catch (SQLException e) {
                System.out.println("[Background Thread] Error: " + e.getMessage());
            }

        }, 60, 60, TimeUnit.SECONDS);
    }

    public void stop() {
        if (scheduler != null) {
            scheduler.shutdown();
            System.out.println("Donation expiry monitor stopped.");
        }
    }
}
