package Handler;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import Util.AuthUtil;
import Util.CorsUtil;
import Util.JsonResponseUtil;
import Util.SessionManager;
import foodloop.src.Dao.DonationDAO;
import foodloop.src.Dao.MealRecordDAO;
import foodloop.src.Model.Donation;
import foodloop.src.Model.MealRecord;

public class DonationHandler implements HttpHandler {
    private final DonationDAO donationDAO = new DonationDAO();
    private final MealRecordDAO mealRecordDAO = new MealRecordDAO();

    private static final Pattern CLAIM_PATTERN =
            Pattern.compile("^/api/donations/(\\d+)/claim/?$");
    private static final Pattern SINGLE_DONATION_PATTERN =
            Pattern.compile("^/api/donations/(\\d+)/?$");

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            AuthUtil.validateCsrf(exchange);
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod().toUpperCase();

            Matcher claimMatcher = CLAIM_PATTERN.matcher(path);
            if (claimMatcher.matches()) {
                if ("POST".equals(method)) {
                    int donationId = Integer.parseInt(claimMatcher.group(1));
                    handleClaim(exchange, donationId);
                    return;
                } else {
                    JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
                    return;
                }
            }

            Matcher singleMatcher = SINGLE_DONATION_PATTERN.matcher(path);
            if (singleMatcher.matches()) {
                if ("GET".equals(method)) {
                    int donationId = Integer.parseInt(singleMatcher.group(1));
                    handleGetOne(exchange, donationId);
                    return;
                } else {
                    JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
                    return;
                }
            }

            if (path.endsWith("/available") && "GET".equals(method)) {
                handleAvailable(exchange);
            } else if (path.endsWith("/recommended") && "GET".equals(method)) {
                handleRecommended(exchange);
            } else if ("/api/donations".equals(path) || "/api/donations/".equals(path)) {
                if ("GET".equals(method)) {
                    handleList(exchange);
                } else if ("POST".equals(method)) {
                    handleCreate(exchange);
                } else {
                    JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
                }
            } else {
                JsonResponseUtil.sendError(exchange, "Endpoint not found: " + path, 404);
            }
        } catch (AuthUtil.ApiException e) {
            JsonResponseUtil.sendError(exchange, e.getMessage(), e.getStatusCode());
        } catch (SQLException e) {
            JsonResponseUtil.sendError(exchange, "Database error: " + e.getMessage(), 500);
        } catch (Exception e) {
            JsonResponseUtil.sendError(exchange, "Internal server error: " + e.getMessage(), 500);
        }
    }

    private void handleList(HttpExchange exchange) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireAuth(exchange);
        Map<String, String> query = JsonResponseUtil.parseQueryParams(exchange);
        String messId = query.get("messId");
        String status = query.get("status");
        String dietary = query.get("dietary");

        if ("MESS".equalsIgnoreCase(session.getRole())) {
            messId = session.getAssignedMessId();
        }

        List<Donation> list;
        if (messId != null && !messId.isEmpty() && !"ALL".equalsIgnoreCase(messId)) {
            list = donationDAO.getDonations(messId);
        } else {
            list = donationDAO.getAllDonations();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Donation d : list) {
            if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                if (!status.equalsIgnoreCase(d.getStatus())) continue;
            }
            if (dietary != null && !dietary.isEmpty() && !"ALL".equalsIgnoreCase(dietary)) {
                if (!dietary.equalsIgnoreCase(d.getFoodType())) continue;
            }
            result.add(toDto(d));
        }
        JsonResponseUtil.sendJson(exchange, result, 200);
    }

    private void handleAvailable(HttpExchange exchange) throws Exception {
        AuthUtil.requireAuth(exchange);
        List<Donation> available = donationDAO.getAvailableDonations();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Donation d : available) {
            result.add(toDto(d));
        }
        JsonResponseUtil.sendJson(exchange, result, 200);
    }

    private void handleRecommended(HttpExchange exchange) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireAuth(exchange);
        Map<String, String> query = JsonResponseUtil.parseQueryParams(exchange);

        String dietary = query.get("dietary");
        if (dietary == null || dietary.isEmpty()) {
            dietary = session.getFoodPreference();
        }

        int capacity = 0;
        if (query.get("capacity") != null) {
            try {
                capacity = Integer.parseInt(query.get("capacity"));
            } catch (NumberFormatException ignored) {}
        }

        boolean urgentOnly = "true".equalsIgnoreCase(query.get("urgent"));

        List<Donation> available = donationDAO.getAvailableDonations();
        List<Donation> filtered = new ArrayList<>();
        long now = System.currentTimeMillis();
        long fourHours = 4 * 60 * 60 * 1000L;

        for (Donation d : available) {
            if (dietary != null && !dietary.isEmpty() && !"ALL".equalsIgnoreCase(dietary)) {
                if (!dietary.equalsIgnoreCase(d.getFoodType())) continue;
            }
            if (capacity > 0 && d.getQuantity() > capacity) {
                continue;
            }
            if (urgentOnly) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    long dl = sdf.parse(d.getDeadline()).getTime();
                    if (dl - now > fourHours) continue;
                } catch (Exception ignored) {}
            }
            filtered.add(d);
        }

        // Sort: earlier deadline first, then higher portions
        Collections.sort(filtered, new Comparator<Donation>() {
            @Override
            public int compare(Donation a, Donation b) {
                int cmp = a.getDeadline().compareTo(b.getDeadline());
                if (cmp != 0) return cmp;
                return Integer.compare(b.getQuantity(), a.getQuantity());
            }
        });

        List<Map<String, Object>> result = new ArrayList<>();
        for (Donation d : filtered) {
            result.add(toDto(d));
        }
        JsonResponseUtil.sendJson(exchange, result, 200);
    }

    private void handleGetOne(HttpExchange exchange, int donationId) throws Exception {
        AuthUtil.requireAuth(exchange);
        Donation donation = donationDAO.getDonationById(donationId);
        if (donation == null) {
            throw new AuthUtil.NotFoundException("Donation record not found: " + donationId);
        }
        JsonResponseUtil.sendJson(exchange, toDto(donation), 200);
    }

    private void handleCreate(HttpExchange exchange) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireRole(exchange, "MESS", "ADMIN");
        String body = JsonResponseUtil.readRequestBody(exchange);
        JsonObject json;
        try {
            json = JsonParser.parseString(body).getAsJsonObject();
        } catch (Exception e) {
            throw new AuthUtil.ValidationException("Invalid JSON request body.");
        }

        boolean confirmed = json.has("unservedSurplusConfirmed") && json.get("unservedSurplusConfirmed").getAsBoolean();
        if (!confirmed) {
            throw new AuthUtil.ValidationException("Must confirm that food is strictly unserved surplus meeting hygiene standards. Plate leftovers can NEVER be donated.");
        }

        int mealRecordId = json.has("mealRecordId") ? json.get("mealRecordId").getAsInt() : 0;
        if (mealRecordId <= 0) {
            throw new AuthUtil.ValidationException("A valid meal record ID is required to publish a surplus donation and verify available surplus.");
        }
        int portions = 0;
        if (json.has("portions")) {
            portions = json.get("portions").getAsInt();
        } else if (json.has("quantity")) {
            portions = json.get("quantity").getAsInt();
        }
        if (portions <= 0) {
            throw new AuthUtil.ValidationException("Portion quantity must be a positive integer.");
        }

        String messId = json.has("messId") ? json.get("messId").getAsString().trim() : null;
        String foodName = json.has("foodName") ? json.get("foodName").getAsString().trim() : null;
        String foodType = json.has("foodType") ? json.get("foodType").getAsString().trim().toUpperCase() : "VEG";

        // Strict food safety guard: plate leftovers and table scraps are never redistributable
        if (foodName != null && !foodName.isEmpty()) {
            String lowerFood = foodName.toLowerCase();
            if (lowerFood.contains("plate leftover") || lowerFood.contains("plate waste")
                    || lowerFood.contains("table scrap") || lowerFood.contains("consumed remnant")
                    || lowerFood.contains("half eaten") || lowerFood.contains("used plate")
                    || lowerFood.contains("scrap")) {
                throw new AuthUtil.ValidationException("Food safety violation: Plate leftovers and consumed remnants can NEVER be redistributed.");
            }
        }

        String prepDateTime = json.has("preparationDateTime") ? json.get("preparationDateTime").getAsString().trim() : null;
        String deadline = json.has("pickupDeadline") ? json.get("pickupDeadline").getAsString().trim()
                : (json.has("deadline") ? json.get("deadline").getAsString().trim() : null);
        String storageConditions = json.has("storageConditions") ? json.get("storageConditions").getAsString().trim() : null;
        String allergens = json.has("allergens") ? json.get("allergens").getAsString().trim() : "None";
        String pickupLocation = json.has("pickupLocation") ? json.get("pickupLocation").getAsString().trim() : null;

        if (deadline == null || deadline.isEmpty()) {
            throw new AuthUtil.ValidationException("Pickup deadline is required.");
        }
        if (pickupLocation == null || pickupLocation.isEmpty()) {
            throw new AuthUtil.ValidationException("Pickup location is required.");
        }

        // Normalize timestamps if needed (ISO or SQL format)
        deadline = normalizeDateTime(deadline);
        if (prepDateTime != null) {
            prepDateTime = normalizeDateTime(prepDateTime);
        }

        try {
            Timestamp deadlineTs = Timestamp.valueOf(deadline);
            if (deadlineTs.before(new Timestamp(System.currentTimeMillis()))) {
                throw new AuthUtil.ValidationException("Pickup deadline must be set in the future.");
            }
        } catch (IllegalArgumentException ignored) {
            // Allow if format has custom representation checked downstream
        }

        if (mealRecordId > 0) {
            MealRecord meal = mealRecordDAO.getMealRecordById(mealRecordId);
            if (meal == null) {
                throw new AuthUtil.NotFoundException("Referenced meal record does not exist: " + mealRecordId);
            }
            if (messId == null || messId.isEmpty()) {
                messId = meal.getMessId();
            }
            if (foodName == null || foodName.isEmpty()) {
                foodName = meal.getFoodName();
            }
            foodType = meal.getFoodType();
        }

        if ("MESS".equalsIgnoreCase(session.getRole())) {
            messId = session.getAssignedMessId();
        }
        if (messId == null || messId.isEmpty()) {
            throw new AuthUtil.ValidationException("Hostel mess ID is required.");
        }
        if (foodName == null || foodName.isEmpty()) {
            throw new AuthUtil.ValidationException("Food name is required.");
        }

        Donation newDonation = new Donation(
                0,
                mealRecordId,
                messId,
                null,
                foodName,
                portions,
                foodType,
                pickupLocation,
                deadline,
                prepDateTime,
                storageConditions,
                allergens,
                "AVAILABLE",
                null
        );

        int generatedId = donationDAO.addDonationWithAllocationCheck(newDonation);
        Donation created = donationDAO.getDonationById(generatedId);
        if (created == null) {
            created = newDonation;
        }

        JsonResponseUtil.sendJson(exchange, toDto(created), 201);
    }

    private void handleClaim(HttpExchange exchange, int donationId) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireRole(exchange, "NGO", "ADMIN");
        boolean claimed = donationDAO.claimDonation(donationId, session.getUserId());
        if (!claimed) {
            throw new AuthUtil.ConflictException("Donation is no longer available or deadline has passed.");
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Donation claimed successfully");
        resp.put("donationId", donationId);
        resp.put("claimedBy", session.getName());
        JsonResponseUtil.sendJson(exchange, resp, 200);
    }

    private String normalizeDateTime(String dt) {
        if (dt == null) return null;
        // If ISO format like 2026-11-23T18:00:00.000Z or 2026-11-23T18:00
        if (dt.contains("T")) {
            dt = dt.replace("T", " ");
            if (dt.contains(".")) {
                dt = dt.substring(0, dt.indexOf('.'));
            }
            if (dt.endsWith("Z")) {
                dt = dt.substring(0, dt.length() - 1);
            }
            if (dt.length() == 16) { // YYYY-MM-DD HH:mm
                dt += ":00";
            }
        }
        return dt;
    }

    private Map<String, Object> toDto(Donation d) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", d.getDonationId());
        map.put("donationId", d.getDonationId());
        map.put("mealRecordId", d.getMealRecordId());
        map.put("messId", d.getMessId());
        map.put("messName", d.getMessName() != null ? d.getMessName() : (d.getMessId() == null ? "Legacy Sample Data" : null));
        map.put("isDemo", d.getMessId() == null);
        map.put("foodName", d.getFoodName());
        map.put("foodType", d.getFoodType());
        map.put("portions", d.getQuantity());
        map.put("quantity", d.getQuantity());
        map.put("preparationDateTime", d.getPreparationDatetime());
        map.put("pickupDeadline", d.getDeadline());
        map.put("deadline", d.getDeadline());
        map.put("storageConditions", d.getStorageConditions());
        map.put("allergens", d.getAllergens());
        map.put("pickupLocation", d.getPickupLocation());
        map.put("unservedSurplusConfirmed", true);
        map.put("status", d.getStatus());
        map.put("createdAt", d.getCreatedAt());
        return map;
    }
}
