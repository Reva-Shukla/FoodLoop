package com.foodloop;

import com.foodloop.controller.*;
import com.foodloop.dao.*;
import com.foodloop.service.*;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Main Application Entry Point
 * Project: FoodLoop - Food Donation & Redistribution Platform
 * Module: Member 1 - Donor Management
 * 
 * Syllabus Concepts Demonstrated:
 *  - Multithreading: HTTP Thread Pool (ExecutorService) + Background Expiry Monitor (ScheduledExecutorService)
 *  - Core Java HTTP Server: com.sun.net.httpserver.HttpServer without Spring Boot
 *  - Dependency Injection: Manual constructor injection of DAOs and Services
 *  - Graceful Shutdown: JVM ShutdownHook closing thread pools and HTTP server
 */
public class Main {
    private static final int DEFAULT_PORT = 8080;

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {}
        }
        String envPort = System.getenv("PORT");
        if (envPort != null) {
            try { port = Integer.parseInt(envPort); } catch (NumberFormatException ignored) {}
        }

        printBanner(port);

        try {
            // 1. Initialize DAOs
            UserDAO userDAO = new UserDAO();
            DonorDAO donorDAO = new DonorDAO(userDAO);
            DonationDAO donationDAO = new DonationDAO();

            // 2. Initialize Services
            DonorService donorService = new DonorService(donorDAO, userDAO);
            AuthService authService = new AuthService(donorDAO);
            DonationService donationService = new DonationService(donationDAO, donorDAO);

            // 3. Initialize & Start Multithreaded Expiry Monitor Service
            ExpiryMonitorService expiryMonitor = new ExpiryMonitorService(donationDAO, 30);
            expiryMonitor.start();

            // 4. Create Core Java HTTP Server
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // 5. Multithreading: Configure custom ExecutorService thread pool for handling HTTP requests
            ThreadFactory httpThreadFactory = new ThreadFactory() {
                private final AtomicInteger count = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "FoodLoop-HttpWorker-" + count.getAndIncrement());
                    t.setDaemon(true);
                    return t;
                }
            };
            ExecutorService httpThreadPool = Executors.newFixedThreadPool(8, httpThreadFactory);
            server.setExecutor(httpThreadPool);

            // 6. Register REST Endpoints
            server.createContext("/api/auth", new AuthController(authService, donorService));
            server.createContext("/api/donors", new DonorController(authService, donorService, donationService));
            server.createContext("/api/donations", new DonationController(authService, donationService));
            server.createContext("/api/integration", new IntegrationController(donationService));

            // 7. Start HTTP Server
            server.start();

            System.out.println("============================================================================");
            System.out.printf("  FoodLoop Backend Server running on: http://localhost:%d%n", port);
            System.out.println("  Core Java HTTP Server: Active (Zero Spring Boot dependencies)");
            System.out.println("  Multithreaded Expiry Monitor: Running (Interval: 30s)");
            System.out.println("============================================================================");
            System.out.println("  Key Endpoints:");
            System.out.printf("   - Auth:        http://localhost:%d/api/auth/login%n", port);
            System.out.printf("   - Dashboard:   http://localhost:%d/api/donors/dashboard%n", port);
            System.out.printf("   - Donations:   http://localhost:%d/api/donations%n", port);
            System.out.printf("   - CSV Export:  http://localhost:%d/api/donations/export%n", port);
            System.out.printf("   - NGO Match:   http://localhost:%d/api/integration/donations/available%n", port);
            System.out.println("============================================================================\n");

            // 8. Add JVM Shutdown Hook
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n[FoodLoop] Gracefully shutting down server and worker threads...");
                expiryMonitor.stop();
                server.stop(1);
                httpThreadPool.shutdown();
                System.out.println("[FoodLoop] Shutdown complete. Goodbye!");
            }));

        } catch (IOException e) {
            System.err.println("Fatal error starting FoodLoop HTTP Server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void printBanner(int port) {
        System.out.println("""
            ============================================================================
              FoodLoop - Food Donation & Redistribution Platform
              Member 1: Donor Management Module
              Tagline: "Every Meal Deserves a Destination."
            ============================================================================
              Java Syllabus Demonstration Matrix:
              [x] Classes & Objects:     User, Donor, NGO, Donation, FoodItem, DonorStats
              [x] Inheritance:           User (Abstract Parent) -> Donor, NGO
              [x] Polymorphism:          Method overriding + 3 overloaded search methods
              [x] Abstraction:           Abstract User class & Generic DAO abstraction
              [x] Interfaces:            Authenticatable, DonationOperations, Reportable, GenericDAO
              [x] Collections:           ArrayList, HashMap, PriorityQueue (expiry urgency)
              [x] Lambdas & Streams:     Stats calculation, filter predicates & comparators
              [x] Multithreading:        ScheduledExecutorService (expiry) + HTTP thread pool
              [x] Thread Safety:         Fine-grained ReentrantLocks & conditional status updates
              [x] File Handling:         CSV Report generation & download
              [x] Exceptions:            Custom hierarchy (InvalidDonor, DuplicateEmail, etc.)
              [x] JDBC & MySQL:          PreparedStatement & transaction rollback/commit
            ============================================================================
            """);
    }
}
