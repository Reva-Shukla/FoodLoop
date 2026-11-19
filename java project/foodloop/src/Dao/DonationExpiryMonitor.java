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

             String sql = "UPDATE donations SET status = 'EXPIRED' WHERE status = 'AVAILABLE' AND STR_TO_DATE(deadline, '%d/%m/%Y') < CURDATE()";

            try (Connection con = DBConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(sql)) {
                int updated = ps.executeUpdate();
                if (updated > 0) {
                    System.out.println(
                        "[Background Thread] " + updated +
                        " donation(s) marked as EXPIRED."
                    );
                } 
                else {
                    System.out.println(
                        "[Background Thread] No expired donations found."
                    );
                }

            } 
            catch (SQLException e) {
                System.out.println(
                    "[Background Thread] Error: " + e.getMessage()
                );
            }

        },60, 60, TimeUnit.SECONDS);
    }

    public void stop() {
        if (scheduler != null) {
            scheduler.shutdown();
            System.out.println("Donation expiry monitor stopped.");
        }
    }
}
