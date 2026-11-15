package com.foodloop.controller;

import com.foodloop.exceptions.FoodLoopException;
import com.foodloop.model.Donation;
import com.foodloop.service.DonationService;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller: IntegrationController
 * Syllabus Concept: Inter-Module Integration API (Member 2 NGO Claiming & Member 3 Smart Matching)
 * 
 * Exposes documented endpoints for Member 2 (NGO Module) and Member 3 (Matching)
 * to query available food donations and perform thread-safe claiming.
 */
public class IntegrationController extends BaseHttpHandler {
    private final DonationService donationService;

    public IntegrationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        // 1. Available donations for NGO discovery
        if (path.endsWith("/available") && "GET".equalsIgnoreCase(method)) {
            List<Donation> available = donationService.getAvailableDonationsForNGO();
            List<Map<String, Object>> mapped = available.stream()
                    .map(Donation::toMap)
                    .collect(Collectors.toList());
            sendSuccess(exchange, 200, "Available surplus food donations for NGO discovery.", mapped);
            return;
        }

        // 2. NGO claiming endpoint with thread-safety protection
        if (path.matches(".*/donations/\\d+/claim$") && "POST".equalsIgnoreCase(method)) {
            Long donationId = extractDonationId(path);
            handleNgoClaim(exchange, donationId);
            return;
        }

        // 3. View individual donation details for NGO
        if (path.matches(".*/donations/\\d+$") && "GET".equalsIgnoreCase(method)) {
            Long donationId = extractDonationId(path);
            Optional<Donation> opt = donationService.getDonationById(donationId);
            if (opt.isPresent()) {
                sendSuccess(exchange, 200, "Donation details retrieved.", opt.get().toMap());
            } else {
                sendError(exchange, 404, "Donation #" + donationId + " not found.");
            }
            return;
        }

        sendError(exchange, 404, "Integration endpoint not found: " + method + " " + path);
    }

    private void handleNgoClaim(HttpExchange exchange, Long donationId) throws IOException {
        Map<String, Object> body = readJsonBody(exchange);

        Long ngoId = 1L;
        Object nObj = body.get("ngoId");
        if (nObj instanceof Number) {
            ngoId = ((Number) nObj).longValue();
        }

        String ngoName = (String) body.getOrDefault("ngoName", "Partner NGO Organization");
        String ngoPhone = (String) body.getOrDefault("ngoPhone", "+91 98000 11223");

        try {
            boolean success = donationService.claimDonationByNGO(donationId, ngoId, ngoName, ngoPhone);
            if (success) {
                sendSuccess(exchange, 200, "Donation #" + donationId + " claimed successfully by " + ngoName + ".", null);
            } else {
                sendError(exchange, 400, "Unable to claim donation. It may have already been claimed or cancelled.");
            }
        } catch (FoodLoopException e) {
            sendError(exchange, e.getStatusCode(), e.getMessage());
        }
    }

    private Long extractDonationId(String path) {
        String[] parts = path.split("/");
        for (int i = 0; i < parts.length; i++) {
            if ("donations".equalsIgnoreCase(parts[i]) && i + 1 < parts.length) {
                try {
                    return Long.parseLong(parts[i + 1]);
                } catch (NumberFormatException ignored) {}
            }
        }
        return -1L;
    }
}
