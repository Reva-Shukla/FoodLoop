package Handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.SQLException;
import java.time.Instant;
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
import foodloop.src.Model.Pickup;

public class PickupHandler implements HttpHandler {
    private final DonationDAO donationDAO = new DonationDAO();

    private static final Pattern COMPLETE_PATTERN =
            Pattern.compile("^/api/pickups/(\\d+)/complete/?$");

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            AuthUtil.validateCsrf(exchange);
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod().toUpperCase();

            Matcher completeMatcher = COMPLETE_PATTERN.matcher(path);
            if (completeMatcher.matches()) {
                if ("POST".equals(method)) {
                    int pickupId = Integer.parseInt(completeMatcher.group(1));
                    handleComplete(exchange, pickupId);
                    return;
                } else {
                    JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
                    return;
                }
            }

            if ("/api/pickups".equals(path) || "/api/pickups/".equals(path)) {
                if ("GET".equals(method)) {
                    handleList(exchange);
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
        SessionManager.UserSession session = AuthUtil.requireRole(exchange, "NGO", "ADMIN");
        Map<String, String> query = JsonResponseUtil.parseQueryParams(exchange);
        String statusFilter = query.get("status");

        List<Pickup> pickups;

        if ("NGO".equalsIgnoreCase(session.getRole())) {
            pickups = donationDAO.getMyPickups(session.getUserId());
        } else {
            String ngoIdParam = query.get("ngoId");

            if (ngoIdParam != null) {
                try {
                    int ngoId = Integer.parseInt(ngoIdParam);
                    if (ngoId <= 0) {
                        JsonResponseUtil.sendError(exchange, "Invalid NGO ID", 400);
                        return;
                    }
                    pickups = donationDAO.getMyPickups(ngoId);
                } catch (NumberFormatException e) {
                    JsonResponseUtil.sendError(exchange, "Invalid NGO ID", 400);
                    return;
                }
            } else {
                pickups = donationDAO.getAllPickups();
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Pickup p : pickups) {
            if (statusFilter != null && !statusFilter.isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
                if (!statusFilter.equalsIgnoreCase(p.getStatus())) {
                    continue;
                }
            }
            result.add(toDto(p));
        }
        JsonResponseUtil.sendJson(exchange, result, 200);
    }

    private void handleComplete(HttpExchange exchange, int pickupId) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireRole(exchange, "NGO", "ADMIN");
        int ngoId = session.getUserId();

        // If ADMIN is completing on behalf of an NGO, look up the pickup's owner NGO
        if ("ADMIN".equalsIgnoreCase(session.getRole())) {
            List<Pickup> all = donationDAO.getAllPickups();
            for (Pickup p : all) {
                if (p.getPickupId() == pickupId) {
                    ngoId = p.getNgoId();
                    break;
                }
            }
        }

        boolean completed = donationDAO.completePickup(pickupId, ngoId);
        if (!completed) {
            throw new AuthUtil.ConflictException(
                "Pickup could not be completed. It may not belong to your account or is no longer scheduled."
            );
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Pickup completed successfully. Food handover recorded.");
        resp.put("pickupId", pickupId);
        resp.put("completedAt", Instant.now().toString());
        JsonResponseUtil.sendJson(exchange, resp, 200);
    }

    private Map<String, Object> toDto(Pickup p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getPickupId());
        map.put("pickupId", p.getPickupId());
        map.put("claimId", p.getClaimId());
        map.put("donationId", p.getDonationId());
        map.put("ngoId", p.getNgoId());
        map.put("ngoName", p.getNgoName());
        map.put("messId", p.getMessId());
        map.put("messName", p.getMessName());
        map.put("foodName", p.getFoodName());
        map.put("foodType", p.getFoodType());
        map.put("portions", p.getQuantity());
        map.put("quantity", p.getQuantity());
        map.put("pickupLocation", p.getPickupLocation());
        map.put("pickupDeadline", p.getPickupDeadline());
        map.put("pickupDate", p.getPickupDate());
        map.put("scheduledAt", p.getScheduledAt());
        map.put("completedAt", p.getCompletedAt());
        map.put("status", p.getStatus());
        return map;
    }
}
