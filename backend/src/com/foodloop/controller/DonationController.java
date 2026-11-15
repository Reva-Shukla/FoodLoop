package com.foodloop.controller;

import com.foodloop.exceptions.FoodLoopException;
import com.foodloop.model.*;
import com.foodloop.service.AuthService;
import com.foodloop.service.DonationService;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller: DonationController
 * Handles donation creation, listing, updating, cancellation,
 * search/filter with polymorphic methods, CSV report export, and PriorityQueue urgency retrieval.
 */
public class DonationController extends BaseHttpHandler {
    private final AuthService authService;
    private final DonationService donationService;

    public DonationController(AuthService authService, DonationService donationService) {
        this.authService = authService;
        this.donationService = donationService;
    }

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        Donor donor = requireAuthenticatedDonor(exchange, authService);
        if (donor == null) return; // 401 response already sent

        // Route: /api/donations/export (CSV file download)
        if (path.endsWith("/export") && "GET".equalsIgnoreCase(method)) {
            handleExportCsv(exchange, donor);
            return;
        }

        // Route: /api/donations/expiring-soon (PriorityQueue)
        if (path.endsWith("/expiring-soon") && "GET".equalsIgnoreCase(method)) {
            handleExpiringSoon(exchange, donor);
            return;
        }

        // Route: /api/donations/history
        if (path.endsWith("/history") && "GET".equalsIgnoreCase(method)) {
            handleListDonations(exchange, donor);
            return;
        }

        // Route: /api/donations/my
        if (path.endsWith("/my") && "GET".equalsIgnoreCase(method)) {
            handleListDonations(exchange, donor);
            return;
        }

        // Route: /api/donations/{id}/cancel
        if (path.matches(".*/donations/\\d+/cancel$") && ("PUT".equalsIgnoreCase(method) || "POST".equalsIgnoreCase(method))) {
            Long donationId = extractIdFromPath(path, 2);
            handleCancelDonation(exchange, donor, donationId);
            return;
        }

        // Route: /api/donations/{id}
        if (path.matches(".*/donations/\\d+$")) {
            Long donationId = extractIdFromPath(path, 1);
            if ("GET".equalsIgnoreCase(method)) {
                handleGetDonationById(exchange, donor, donationId);
            } else if ("PUT".equalsIgnoreCase(method)) {
                handleUpdateDonation(exchange, donor, donationId);
            } else {
                sendError(exchange, 405, "Method not allowed");
            }
            return;
        }

        // Route: /api/donations (Root for collections)
        if (path.endsWith("/donations") || path.endsWith("/donations/")) {
            if ("POST".equalsIgnoreCase(method)) {
                handleCreateDonation(exchange, donor);
            } else if ("GET".equalsIgnoreCase(method)) {
                handleListDonations(exchange, donor);
            } else {
                sendError(exchange, 405, "Method not allowed");
            }
            return;
        }

        sendError(exchange, 404, "Endpoint not found: " + method + " " + path);
    }

    private void handleCreateDonation(HttpExchange exchange, Donor donor) throws IOException {
        Map<String, Object> body = readJsonBody(exchange);

        String foodName = (String) body.get("foodName");
        String description = (String) body.get("description");

        double quantity = 0.0;
        Object qtyObj = body.get("quantity");
        if (qtyObj instanceof Number) {
            quantity = ((Number) qtyObj).doubleValue();
        } else if (qtyObj instanceof String) {
            try { quantity = Double.parseDouble((String) qtyObj); } catch (Exception ignored) {}
        }

        String quantityUnit = (String) body.get("quantityUnit");
        String categoryStr = (String) body.get("category");
        String foodTypeStr = (String) body.get("foodType");
        Boolean isUnservedSurplus = body.get("isUnservedSurplus") instanceof Boolean
                ? (Boolean) body.get("isUnservedSurplus") : true;

        String prepTimeStr = (String) body.get("preparationDatetime");
        String expiryTimeStr = (String) body.get("expiryDatetime");
        String pickupAddress = (String) body.get("pickupAddress");
        String pickupTime = (String) body.get("pickupTime");
        String instructions = (String) body.get("instructions");

        // Parse datetimes
        LocalDateTime prepDateTime = LocalDateTime.now();
        if (prepTimeStr != null && !prepTimeStr.trim().isEmpty()) {
            try {
                prepDateTime = LocalDateTime.parse(prepTimeStr.trim().substring(0, Math.min(19, prepTimeStr.length())));
            } catch (DateTimeParseException ignored) {}
        }

        LocalDateTime expiryDateTime = null;
        if (expiryTimeStr != null && !expiryTimeStr.trim().isEmpty()) {
            try {
                expiryDateTime = LocalDateTime.parse(expiryTimeStr.trim().substring(0, Math.min(19, expiryTimeStr.length())));
            } catch (DateTimeParseException e) {
                sendError(exchange, 400, "Invalid expiry date/time format. Use ISO format (YYYY-MM-DDTHH:MM).");
                return;
            }
        }

        // Construct Donation entity
        Donation d = new Donation();
        d.setDonorId(donor.getDonorId());
        d.setFoodName(foodName);
        d.setDescription(description);
        d.setQuantity(quantity);
        d.setQuantityUnit(quantityUnit != null ? quantityUnit : "plates");
        d.setCategory(FoodCategory.fromString(categoryStr));
        d.setFoodType(FoodType.fromString(foodTypeStr));
        d.setUnservedSurplus(isUnservedSurplus);
        d.setPreparationDatetime(prepDateTime);
        d.setExpiryDatetime(expiryDateTime);
        d.setPickupAddress(pickupAddress != null ? pickupAddress : donor.getAddress());
        d.setPickupTime(pickupTime);
        d.setInstructions(instructions);

        try {
            Donation created = donationService.createDonation(d);
            sendSuccess(exchange, 201, "Food donation posted successfully! It is now visible to partner NGOs.", created.toMap());
        } catch (FoodLoopException e) {
            sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (Exception e) {
            sendError(exchange, 500, "Failed to create donation: " + e.getMessage());
        }
    }

    private void handleListDonations(HttpExchange exchange, Donor donor) throws IOException {
        Map<String, String> qp = getQueryParams(exchange);
        String search = qp.get("search");
        String statusStr = qp.get("status");
        String sortBy = qp.get("sortBy");

        DonationStatus status = null;
        if (statusStr != null && !statusStr.isEmpty() && !"ALL".equalsIgnoreCase(statusStr)) {
            status = DonationStatus.fromString(statusStr);
        }

        // Polymorphic overloaded call utilizing Stream API internally
        List<Donation> list = donationService.searchDonations(donor.getDonorId(), search, status, sortBy);

        List<Map<String, Object>> mapped = list.stream().map(Donation::toMap).collect(Collectors.toList());
        sendSuccess(exchange, 200, "Donations retrieved.", mapped);
    }

    private void handleGetDonationById(HttpExchange exchange, Donor donor, Long donationId) throws IOException {
        Optional<Donation> opt = donationService.getDonationById(donationId);
        if (opt.isEmpty() || !Objects.equals(opt.get().getDonorId(), donor.getDonorId())) {
            sendError(exchange, 404, "Donation not found or access denied.");
            return;
        }
        sendSuccess(exchange, 200, "Donation found.", opt.get().toMap());
    }

    private void handleUpdateDonation(HttpExchange exchange, Donor donor, Long donationId) throws IOException {
        Map<String, Object> body = readJsonBody(exchange);

        Donation updateData = new Donation();
        if (body.containsKey("foodName")) updateData.setFoodName((String) body.get("foodName"));
        if (body.containsKey("description")) updateData.setDescription((String) body.get("description"));

        if (body.containsKey("quantity")) {
            Object q = body.get("quantity");
            if (q instanceof Number) updateData.setQuantity(((Number) q).doubleValue());
        }
        if (body.containsKey("quantityUnit")) updateData.setQuantityUnit((String) body.get("quantityUnit"));
        if (body.containsKey("category")) updateData.setCategory(FoodCategory.fromString((String) body.get("category")));
        if (body.containsKey("foodType")) updateData.setFoodType(FoodType.fromString((String) body.get("foodType")));

        if (body.containsKey("expiryDatetime")) {
            String exp = (String) body.get("expiryDatetime");
            try {
                updateData.setExpiryDatetime(LocalDateTime.parse(exp.substring(0, Math.min(19, exp.length()))));
            } catch (Exception ignored) {}
        }

        if (body.containsKey("pickupAddress")) updateData.setPickupAddress((String) body.get("pickupAddress"));
        if (body.containsKey("pickupTime")) updateData.setPickupTime((String) body.get("pickupTime"));
        if (body.containsKey("instructions")) updateData.setInstructions((String) body.get("instructions"));

        try {
            Donation updated = donationService.updateDonation(donor.getDonorId(), donationId, updateData);
            sendSuccess(exchange, 200, "Donation updated successfully.", updated.toMap());
        } catch (FoodLoopException e) {
            sendError(exchange, e.getStatusCode(), e.getMessage());
        }
    }

    private void handleCancelDonation(HttpExchange exchange, Donor donor, Long donationId) throws IOException {
        try {
            boolean success = donationService.cancelDonation(donor.getDonorId(), donationId);
            if (success) {
                sendSuccess(exchange, 200, "Donation #" + donationId + " has been cancelled.", null);
            } else {
                sendError(exchange, 400, "Could not cancel donation. It may have already been claimed or cancelled.");
            }
        } catch (FoodLoopException e) {
            sendError(exchange, e.getStatusCode(), e.getMessage());
        }
    }

    private void handleExpiringSoon(HttpExchange exchange, Donor donor) throws IOException {
        List<Donation> urgent = donationService.getExpiringSoonDonations(donor.getDonorId(), 5);
        List<Map<String, Object>> mapped = urgent.stream().map(Donation::toMap).collect(Collectors.toList());
        sendSuccess(exchange, 200, "Expiring soon donations retrieved via PriorityQueue.", mapped);
    }

    private void handleExportCsv(HttpExchange exchange, Donor donor) throws IOException {
        String csv = donationService.generateCsvReport(donor.getDonorId());
        String filename = "foodloop_donations_" + donor.getDonorId() + ".csv";
        sendCsvResponse(exchange, csv, filename);
    }

    private Long extractIdFromPath(String path, int offsetFromEnd) {
        String[] parts = path.split("/");
        int idx = parts.length - offsetFromEnd;
        if (idx >= 0) {
            try {
                return Long.parseLong(parts[idx]);
            } catch (NumberFormatException ignored) {}
        }
        return -1L;
    }
}
