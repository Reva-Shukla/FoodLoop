package Handler;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
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
import foodloop.src.Dao.WasteRecordDAO;
import foodloop.src.Model.Donation;
import foodloop.src.Model.MealRecord;
import foodloop.src.Model.WasteRecord;

public class MealRecordHandler implements HttpHandler {
    private final MealRecordDAO mealRecordDAO = new MealRecordDAO();
    private final DonationDAO donationDAO = new DonationDAO();
    private final WasteRecordDAO wasteRecordDAO = new WasteRecordDAO();

    private static final Pattern ALLOCATIONS_PATTERN =
            Pattern.compile("^/api/meals/(\\d+)/allocations/?$");
    private static final Pattern SINGLE_MEAL_PATTERN =
            Pattern.compile("^/api/meals/(\\d+)/?$");

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            AuthUtil.validateCsrf(exchange);
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod().toUpperCase();

            Matcher allocMatcher = ALLOCATIONS_PATTERN.matcher(path);
            if (allocMatcher.matches()) {
                if ("GET".equals(method)) {
                    int mealId = Integer.parseInt(allocMatcher.group(1));
                    handleAllocations(exchange, mealId);
                    return;
                } else {
                    JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
                    return;
                }
            }

            Matcher singleMatcher = SINGLE_MEAL_PATTERN.matcher(path);
            if (singleMatcher.matches()) {
                if ("GET".equals(method)) {
                    int mealId = Integer.parseInt(singleMatcher.group(1));
                    handleGetOne(exchange, mealId);
                    return;
                } else {
                    JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
                    return;
                }
            }

            if ("/api/meals".equals(path) || "/api/meals/".equals(path)) {
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

        if ("MESS".equalsIgnoreCase(session.getRole())) {
            // Mess managers are strictly bound to their assigned mess
            messId = session.getAssignedMessId();
        }

        List<MealRecord> records;
        if (messId != null && !messId.isEmpty() && !"ALL".equalsIgnoreCase(messId)) {
            records = mealRecordDAO.getMealRecords(messId);
        } else {
            records = mealRecordDAO.getAllMealRecords();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (MealRecord m : records) {
            result.add(toDto(m));
        }
        JsonResponseUtil.sendJson(exchange, result, 200);
    }

    private void handleGetOne(HttpExchange exchange, int mealId) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireAuth(exchange);
        MealRecord record = mealRecordDAO.getMealRecordById(mealId);
        if (record == null) {
            throw new AuthUtil.NotFoundException("Meal record not found: " + mealId);
        }

        if ("MESS".equalsIgnoreCase(session.getRole())
                && !record.getMessId().equalsIgnoreCase(session.getAssignedMessId())) {
            throw new AuthUtil.ForbiddenException("Forbidden: You can only view your assigned mess.");
        }

        JsonResponseUtil.sendJson(exchange, toDto(record), 200);
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

        String messId = json.has("messId") ? json.get("messId").getAsString().trim() : null;
        if ("MESS".equalsIgnoreCase(session.getRole())) {
            messId = session.getAssignedMessId();
        }
        if (messId == null || messId.isEmpty()) {
            throw new AuthUtil.ValidationException("Hostel mess ID is required.");
        }

        String foodName = json.has("foodName") ? json.get("foodName").getAsString().trim() : null;
        if (foodName == null || foodName.isEmpty()) {
            throw new AuthUtil.ValidationException("Food name is required.");
        }

        String foodType = json.has("foodType") ? json.get("foodType").getAsString().trim().toUpperCase() : "VEG";
        if (!"VEG".equals(foodType) && !"NON_VEG".equals(foodType)) {
            throw new AuthUtil.ValidationException("Food type must be either VEG or NON_VEG.");
        }

        String mealType = json.has("mealType") ? json.get("mealType").getAsString().trim() : "Lunch";

        int prepared = 0;
        if (json.has("preparedPortions")) {
            prepared = json.get("preparedPortions").getAsInt();
        } else if (json.has("prepared")) {
            prepared = json.get("prepared").getAsInt();
        }

        int served = 0;
        if (json.has("servedPortions")) {
            served = json.get("servedPortions").getAsInt();
        } else if (json.has("served")) {
            served = json.get("served").getAsInt();
        }

        if (prepared <= 0) {
            throw new AuthUtil.ValidationException("Prepared portions must be a positive integer.");
        }
        if (served < 0) {
            throw new AuthUtil.ValidationException("Served portions cannot be negative.");
        }
        if (served > prepared) {
            throw new AuthUtil.ValidationException("Served portions (" + served + ") cannot exceed prepared portions (" + prepared + ").");
        }

        String mealDate = json.has("date") ? json.get("date").getAsString().trim()
                : (json.has("mealDate") ? json.get("mealDate").getAsString().trim() : null);
        if (mealDate == null || mealDate.isEmpty()) {
            throw new AuthUtil.ValidationException("Meal date is required (YYYY-MM-DD).");
        }

        String loggedBy = session.getName();

        MealRecord newRecord = new MealRecord(
                messId,
                foodName,
                foodType,
                mealType,
                prepared,
                served,
                mealDate,
                loggedBy
        );

        boolean added = mealRecordDAO.addMealRecord(newRecord);
        if (!added) {
            throw new SQLException("Failed to save meal record.");
        }

        // Return latest meal record for this mess
        List<MealRecord> messMeals = mealRecordDAO.getMealRecords(messId);
        MealRecord created = messMeals.isEmpty() ? newRecord : messMeals.get(0);

        JsonResponseUtil.sendJson(exchange, toDto(created), 201);
    }

    private void handleAllocations(HttpExchange exchange, int mealId) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireAuth(exchange);
        MealRecord meal = mealRecordDAO.getMealRecordById(mealId);
        if (meal == null) {
            throw new AuthUtil.NotFoundException("Meal record not found: " + mealId);
        }

        if ("MESS".equalsIgnoreCase(session.getRole())
                && (meal.getMessId() == null || !meal.getMessId().equalsIgnoreCase(session.getAssignedMessId()))) {
            throw new AuthUtil.ForbiddenException("Forbidden: You can only view your assigned mess.");
        }

        List<Donation> donations = donationDAO.getDonationsByMealId(mealId);
        List<WasteRecord> wasteRecords = wasteRecordDAO.getWasteRecordsByMealId(mealId);

        int surplus = meal.getSurplus();
        int donatedPortions = 0;
        int activeReserved = 0;

        List<Map<String, Object>> donationDtos = new ArrayList<>();
        for (Donation d : donations) {
            int qty = d.getQuantity();
            String status = d.getStatus();
            if ("PICKED_UP".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
                donatedPortions += qty;
            } else if ("AVAILABLE".equalsIgnoreCase(status) || "CLAIMED".equalsIgnoreCase(status)) {
                activeReserved += qty;
            }
            Map<String, Object> dDto = new LinkedHashMap<>();
            dDto.put("id", d.getDonationId());
            dDto.put("donationId", d.getDonationId());
            dDto.put("foodName", d.getFoodName());
            dDto.put("portions", qty);
            dDto.put("quantity", qty);
            dDto.put("status", status);
            dDto.put("pickupLocation", d.getPickupLocation());
            dDto.put("pickupDeadline", d.getDeadline());
            donationDtos.add(dDto);
        }

        int wastedPortions = 0;
        List<Map<String, Object>> wasteDtos = new ArrayList<>();
        for (WasteRecord w : wasteRecords) {
            wastedPortions += w.getPortionsDiscarded();
            Map<String, Object> wDto = new LinkedHashMap<>();
            wDto.put("id", w.getWasteId());
            wDto.put("wasteId", w.getWasteId());
            wDto.put("foodName", w.getFoodName());
            wDto.put("portionsDiscarded", w.getPortionsDiscarded());
            wDto.put("reason", w.getReason());
            wDto.put("notes", w.getNotes());
            wDto.put("discardedAt", w.getDiscardedAt());
            wasteDtos.add(wDto);
        }

        int remainingPortions = Math.max(0, surplus - donatedPortions - wastedPortions);
        int unallocatedSurplus = Math.max(0, remainingPortions - activeReserved);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("mealId", mealId);
        resp.put("id", mealId);
        resp.put("surplus", surplus);
        resp.put("donatedPortions", donatedPortions);
        resp.put("activeReserved", activeReserved);
        resp.put("wastedPortions", wastedPortions);
        resp.put("remainingPortions", remainingPortions);
        resp.put("unallocatedSurplus", unallocatedSurplus);
        resp.put("donations", donationDtos);
        resp.put("wasteRecords", wasteDtos);

        JsonResponseUtil.sendJson(exchange, resp, 200);
    }

    private Map<String, Object> toDto(MealRecord m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getMealId());
        map.put("mealId", m.getMealId());
        map.put("messId", m.getMessId());
        map.put("messName", m.getMessName() != null ? m.getMessName() : (m.getMessId() == null ? "Legacy Sample Data" : null));
        map.put("isDemo", m.getMessId() == null);
        map.put("date", m.getMealDate());
        map.put("mealDate", m.getMealDate());
        map.put("mealType", m.getMealType());
        map.put("foodName", m.getFoodName());
        map.put("foodType", m.getFoodType());
        map.put("preparedPortions", m.getPrepared());
        map.put("prepared", m.getPrepared());
        map.put("servedPortions", m.getServed());
        map.put("served", m.getServed());
        map.put("surplusPortions", m.getSurplus());
        map.put("surplus", m.getSurplus());
        map.put("loggedBy", m.getLoggedBy());
        map.put("createdAt", m.getCreatedAt());
        return map;
    }
}
