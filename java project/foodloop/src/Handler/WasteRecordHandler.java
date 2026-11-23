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
import Util.AuthUtil;
import Util.CorsUtil;
import Util.JsonResponseUtil;
import Util.SessionManager;
import foodloop.src.Dao.MealRecordDAO;
import foodloop.src.Dao.WasteRecordDAO;
import foodloop.src.Model.MealRecord;
import foodloop.src.Model.WasteRecord;

public class WasteRecordHandler implements HttpHandler {
    private final WasteRecordDAO wasteRecordDAO = new WasteRecordDAO();
    private final MealRecordDAO mealRecordDAO = new MealRecordDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            AuthUtil.validateCsrf(exchange);
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod().toUpperCase();

            if ("/api/waste".equals(path) || "/api/waste/".equals(path)) {
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
        String reason = query.get("reason");

        if ("MESS".equalsIgnoreCase(session.getRole())) {
            messId = session.getAssignedMessId();
        }

        List<WasteRecord> records;
        if (messId != null && !messId.isEmpty() && !"ALL".equalsIgnoreCase(messId)) {
            records = wasteRecordDAO.getWasteRecords(messId);
        } else {
            records = wasteRecordDAO.getAllWasteRecords();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (WasteRecord w : records) {
            if (reason != null && !reason.isEmpty() && !"ALL".equalsIgnoreCase(reason)) {
                if (!reason.equalsIgnoreCase(w.getReason())) continue;
            }
            result.add(toDto(w));
        }
        JsonResponseUtil.sendJson(exchange, result, 200);
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

        int mealRecordId = json.has("mealRecordId") ? json.get("mealRecordId").getAsInt() : 0;
        if (mealRecordId <= 0) {
            throw new AuthUtil.ValidationException("A valid meal record ID is required to log discarded surplus.");
        }

        int portions = 0;
        if (json.has("portionsDiscarded")) {
            portions = json.get("portionsDiscarded").getAsInt();
        } else if (json.has("portions")) {
            portions = json.get("portions").getAsInt();
        }
        if (portions <= 0) {
            throw new AuthUtil.ValidationException("Portions discarded must be a positive integer.");
        }

        String messId = json.has("messId") ? json.get("messId").getAsString().trim() : null;
        String foodName = json.has("foodName") ? json.get("foodName").getAsString().trim() : null;
        String foodType = json.has("foodType") ? json.get("foodType").getAsString().trim().toUpperCase() : "VEG";

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

        String reason = json.has("reason") ? json.get("reason").getAsString().trim() : "Overproduction";
        String notes = json.has("notes") ? json.get("notes").getAsString().trim() : "";

        WasteRecord record = new WasteRecord(
                mealRecordId,
                messId,
                foodName,
                foodType,
                portions,
                reason,
                notes
        );

        int generatedId = wasteRecordDAO.addWasteRecordWithAllocationCheck(record);
        List<WasteRecord> currentList = wasteRecordDAO.getWasteRecords(messId);
        WasteRecord created = currentList.isEmpty() ? record : currentList.get(0);

        JsonResponseUtil.sendJson(exchange, toDto(created), 201);
    }

    private Map<String, Object> toDto(WasteRecord w) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", w.getWasteId());
        map.put("wasteId", w.getWasteId());
        map.put("mealRecordId", w.getMealRecordId());
        map.put("messId", w.getMessId());
        map.put("messName", w.getMessName());
        map.put("foodName", w.getFoodName());
        map.put("foodType", w.getFoodType());
        map.put("portionsDiscarded", w.getPortionsDiscarded());
        map.put("reason", w.getReason());
        map.put("notes", w.getNotes());
        map.put("discardedAt", w.getDiscardedAt());
        return map;
    }
}
