package com.foodloop.controller;

import com.foodloop.model.Donor;
import com.foodloop.service.AuthService;
import com.foodloop.util.SimpleJson;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Base Abstract Controller: BaseHttpHandler
 * Syllabus Concepts Demonstrated:
 *  - Abstraction: Common HTTP pipeline, CORS management, and JSON protocol abstraction
 *  - Inheritance: Extended by AuthController, DonorController, DonationController
 *  - Exception Handling: Centralized error response generation
 */
public abstract class BaseHttpHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // 1. Setup full CORS headers for React frontend
        addCorsHeaders(exchange);

        // 2. Handle HTTP OPTIONS preflight
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            processRequest(exchange);
        } catch (Exception e) {
            System.err.printf("[HttpHandler Error] %s %s: %s%n",
                    exchange.getRequestMethod(), exchange.getRequestURI(), e.getMessage());
            e.printStackTrace();
            sendError(exchange, 500, "Internal Server Error: " + e.getMessage());
        }
    }

    protected abstract void processRequest(HttpExchange exchange) throws Exception;

    protected void addCorsHeaders(HttpExchange exchange) {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
        headers.set("Access-Control-Max-Age", "3600");
    }

    protected void sendResponse(HttpExchange exchange, int statusCode, Object data) throws IOException {
        addCorsHeaders(exchange);
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", "application/json; charset=UTF-8");

        String jsonStr;
        if (data instanceof String) {
            jsonStr = (String) data;
        } else {
            jsonStr = SimpleJson.toJson(data);
        }

        byte[] bytes = jsonStr.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    protected void sendSuccess(HttpExchange exchange, int statusCode, String message, Object data) throws IOException {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        sendResponse(exchange, statusCode, resp);
    }

    protected void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        addCorsHeaders(exchange);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("error", message);
        resp.put("status", statusCode);
        sendResponse(exchange, statusCode, resp);
    }

    protected void sendCsvResponse(HttpExchange exchange, String csvContent, String filename) throws IOException {
        addCorsHeaders(exchange);
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", "text/csv; charset=UTF-8");
        headers.set("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        byte[] bytes = csvContent.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    protected String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[1024];
            int read;
            while ((read = is.read(buf)) != -1) {
                baos.write(buf, 0, read);
            }
            return baos.toString(StandardCharsets.UTF_8);
        }
    }

    protected Map<String, Object> readJsonBody(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        return SimpleJson.parseObject(body);
    }

    protected Map<String, String> getQueryParams(HttpExchange exchange) {
        Map<String, String> params = new LinkedHashMap<>();
        URI uri = exchange.getRequestURI();
        String query = uri.getRawQuery();
        if (query == null || query.isEmpty()) {
            return params;
        }
        for (String pair : query.split("&")) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                try {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String val = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    params.put(key, val);
                } catch (Exception ignored) {}
            }
        }
        return params;
    }

    protected String extractBearerToken(HttpExchange exchange) {
        Headers headers = exchange.getRequestHeaders();
        String authHeader = headers.getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        // Fallback: Check token in query param
        Map<String, String> qp = getQueryParams(exchange);
        return qp.get("token");
    }

    protected Donor requireAuthenticatedDonor(HttpExchange exchange, AuthService authService) throws IOException {
        String token = extractBearerToken(exchange);
        if (token == null || token.isEmpty()) {
            sendError(exchange, 401, "Authentication required. Missing Bearer token.");
            return null;
        }

        Optional<Donor> donorOpt = authService.getDonorByToken(token);
        if (donorOpt.isEmpty()) {
            sendError(exchange, 401, "Session expired or invalid token. Please log in again.");
            return null;
        }

        return donorOpt.get();
    }
}
