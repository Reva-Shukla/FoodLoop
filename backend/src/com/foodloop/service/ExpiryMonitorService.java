package com.foodloop.service;

import com.foodloop.dao.DonationDAO;

import java.time.LocalDateTime;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service: ExpiryMonitorService
 * Syllabus Concepts Demonstrated:
 *  - Multithreading: ScheduledExecutorService running recurring background worker threads
 *  - ThreadFactory: Custom named daemon threads for clear identification in log output
 *  - Concurrency Safety: Invokes thread-safe batch expiry updates without blocking user requests
 */
public class ExpiryMonitorService {
    private final DonationDAO donationDAO;
    private ScheduledExecutorService scheduler;
    private final int checkIntervalSeconds;

    public ExpiryMonitorService(DonationDAO donationDAO) {
        this(donationDAO, 30); // Checks every 30 seconds by default
    }

    public ExpiryMonitorService(DonationDAO donationDAO, int checkIntervalSeconds) {
        this.donationDAO = donationDAO;
        this.checkIntervalSeconds = checkIntervalSeconds;
    }

    /**
     * Starts the background monitoring thread.
     */
    public synchronized void start() {
        if (scheduler != null && !scheduler.isShutdown()) {
            return;
        }

        // Custom ThreadFactory to name worker threads clearly for college demonstration
        ThreadFactory threadFactory = new ThreadFactory() {
            private final AtomicInteger threadCount = new AtomicInteger(1);

            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r, "FoodLoop-ExpiryWorker-" + threadCount.getAndIncrement());
                t.setDaemon(true); // Daemon thread exits when JVM stops
                return t;
            }
        };

        scheduler = Executors.newSingleThreadScheduledExecutor(threadFactory);

        System.out.printf("[ExpiryMonitorService] Background worker starting. Interval: %ds%n", checkIntervalSeconds);

        // Schedule periodic check
        scheduler.scheduleWithFixedDelay(
                this::runExpiryCheck,
                5, // Initial delay 5 seconds
                checkIntervalSeconds,
                TimeUnit.SECONDS
        );
    }

    /**
     * Periodic task executed by the background thread.
     */
    private void runExpiryCheck() {
        String threadName = Thread.currentThread().getName();
        try {
            LocalDateTime now = LocalDateTime.now();
            int expiredCount = donationDAO.markExpiredDonations(now);
            if (expiredCount > 0) {
                System.out.printf("[%s] Checked donations: marked %d pending donation(s) as EXPIRED.%n",
                        threadName, expiredCount);
            }
        } catch (Exception e) {
            System.err.printf("[%s] Error during expiry evaluation: %s%n", threadName, e.getMessage());
        }
    }

    /**
     * Gracefully stops the scheduler.
     */
    public synchronized void stop() {
        if (scheduler != null) {
            System.out.println("[ExpiryMonitorService] Shutting down background expiry monitor thread.");
            scheduler.shutdown();
            try {
                if (!scheduler.awaitTermination(3, TimeUnit.SECONDS)) {
                    scheduler.shutdownNow();
                }
            } catch (InterruptedException e) {
                scheduler.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }
}
