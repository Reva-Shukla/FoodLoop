package com.foodloop.controller;

import com.foodloop.exceptions.DuplicateEmailException;
import com.foodloop.exceptions.FoodLoopException;
import com.foodloop.model.Donor;
import com.foodloop.service.AuthService;
import com.foodloop.service.DonorService;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller: AuthController
 * Handles donor registration, authentication, session token issuance, and logout.
 */
public class AuthController extends BaseHttpHandler {
    private final AuthService authService;
    private final DonorService donorService;

    public AuthController(AuthService authService, DonorService donorService) {
        this.authService = authService;
        this.donorService = donorService;
    }

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if (path.endsWith("/register") && "POST".equalsIgnoreCase(method)) {
            handleRegister(exchange);
        } else if (path.endsWith("/login") && "POST".equalsIgnoreCase(method)) {
            handleLogin(exchange);
        } else if (path.endsWith("/logout") && "POST".equalsIgnoreCase(method)) {
            handleLogout(exchange);
        } else {
            sendError(exchange, 404, "Endpoint not found: " + method + " " + path);
        }
    }

    private void handleRegister(HttpExchange exchange) throws IOException {
        Map<String, Object> body = readJsonBody(exchange);

        String name = (String) body.get("name");
        String businessName = (String) body.get("businessName");
        String email = (String) body.get("email");
        String phone = (String) body.get("phone");
        String password = (String) body.get("password");
        String confirmPassword = (String) body.get("confirmPassword");
        String donorType = (String) body.get("donorType");
        String address = (String) body.get("address");
        String city = (String) body.get("city");

        try {
            Donor donor = donorService.registerDonor(
                    name, businessName, email, phone, password, confirmPassword,
                    donorType, address, city
            );

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("donor", donor.toProfileMap());

            sendSuccess(exchange, 201, "Donor registered successfully! You can now log in.", data);
        } catch (FoodLoopException e) {
            sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (Exception e) {
            sendError(exchange, 500, "Registration failed: " + e.getMessage());
        }
    }

    private void handleLogin(HttpExchange exchange) throws IOException {
        Map<String, Object> body = readJsonBody(exchange);

        String email = (String) body.get("email");
        String password = (String) body.get("password");

        try {
            AuthService.AuthResult result = authService.login(email, password);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("token", result.getToken());
            data.put("donor", result.getDonor().toProfileMap());

            sendSuccess(exchange, 200, "Login successful. Welcome back!", data);
        } catch (FoodLoopException e) {
            sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (Exception e) {
            sendError(exchange, 500, "Login failed: " + e.getMessage());
        }
    }

    private void handleLogout(HttpExchange exchange) throws IOException {
        String token = extractBearerToken(exchange);
        if (token != null) {
            authService.logout(token);
        }
        sendSuccess(exchange, 200, "Logged out successfully.", null);
    }
}
