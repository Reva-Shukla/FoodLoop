package com.foodloop.controller;

import com.foodloop.exceptions.FoodLoopException;
import com.foodloop.model.Donation;
import com.foodloop.model.Donor;
import com.foodloop.model.DonorStats;
import com.foodloop.service.AuthService;
import com.foodloop.service.DonationService;
import com.foodloop.service.DonorService;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller: DonorController
 * Handles donor profile retrieval, profile updates, secure password change,
 * and real-time dashboard analytics.
 */
public class DonorController extends BaseHttpHandler {
    private final AuthService authService;
    private final DonorService donorService;
    private final DonationService donationService;

    public DonorController(AuthService authService, DonorService donorService, DonationService donationService) {
        this.authService = authService;
        this.donorService = donorService;
        this.donationService = donationService;
    }

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        Donor donor = requireAuthenticatedDonor(exchange, authService);
        if (donor == null) return; // 401 response already sent

        if (path.endsWith("/profile")) {
            if ("GET".equalsIgnoreCase(method)) {
                handleGetProfile(exchange, donor);
            } else if ("PUT".equalsIgnoreCase(method)) {
                handleUpdateProfile(exchange, donor);
            } else {
                sendError(exchange, 405, "Method not allowed");
            }
        } else if (path.endsWith("/change-password") && "PUT".equalsIgnoreCase(method)) {
            handleChangePassword(exchange, donor);
        } else if (path.endsWith("/dashboard") && "GET".equalsIgnoreCase(method)) {
            handleGetDashboard(exchange, donor);
        } else {
            sendError(exchange, 404, "Endpoint not found: " + method + " " + path);
        }
    }

    private void handleGetProfile(HttpExchange exchange, Donor donor) throws IOException {
        sendSuccess(exchange, 200, "Profile retrieved successfully.", donor.toProfileMap());
    }

    private void handleUpdateProfile(HttpExchange exchange, Donor donor) throws IOException {
        Map<String, Object> body = readJsonBody(exchange);

        String name = (String) body.get("name");
        String businessName = (String) body.get("businessName");
        String phone = (String) body.get("phone");
        String address = (String) body.get("address");
        String city = (String) body.get("city");

        try {
            Donor updated = donorService.updateProfile(
                    donor.getDonorId(), name, businessName, phone, address, city
            );
            sendSuccess(exchange, 200, "Profile updated successfully.", updated.toProfileMap());
        } catch (FoodLoopException e) {
            sendError(exchange, e.getStatusCode(), e.getMessage());
        }
    }

    private void handleChangePassword(HttpExchange exchange, Donor donor) throws IOException {
        Map<String, Object> body = readJsonBody(exchange);

        String currentPassword = (String) body.get("currentPassword");
        String newPassword = (String) body.get("newPassword");
        String confirmPassword = (String) body.get("confirmPassword");

        try {
            donorService.changePassword(donor.getDonorId(), currentPassword, newPassword, confirmPassword);
            sendSuccess(exchange, 200, "Password changed successfully.", null);
        } catch (FoodLoopException e) {
            sendError(exchange, e.getStatusCode(), e.getMessage());
        }
    }

    private void handleGetDashboard(HttpExchange exchange, Donor donor) throws IOException {
        DonorStats stats = donationService.getDonorStats(donor.getDonorId());

        // Get 5 most recent donations
        List<Donation> all = donationService.getDonationsByDonor(donor.getDonorId());
        List<Map<String, Object>> recentActivity = all.stream()
                .limit(5)
                .map(Donation::toMap)
                .collect(Collectors.toList());

        // Get up to 3 donations expiring soon using PriorityQueue
        List<Map<String, Object>> expiringSoon = donationService.getExpiringSoonDonations(donor.getDonorId(), 3)
                .stream()
                .map(Donation::toMap)
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("donor", donor.toProfileMap());
        data.put("stats", stats.toMap());
        data.put("recentActivity", recentActivity);
        data.put("expiringSoon", expiringSoon);

        sendSuccess(exchange, 200, "Dashboard data loaded.", data);
    }
}
