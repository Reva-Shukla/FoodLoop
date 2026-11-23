package Handler;

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
import foodloop.src.Dao.DonationDAO;
import foodloop.src.Model.Claim;

public class ClaimHandler implements HttpHandler {
    private final DonationDAO donationDAO = new DonationDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            AuthUtil.validateCsrf(exchange);
            String method = exchange.getRequestMethod().toUpperCase();

            if ("GET".equals(method)) {
                handleGet(exchange);
            } else {
                JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
            }
        } catch (AuthUtil.ApiException e) {
            JsonResponseUtil.sendError(exchange, e.getMessage(), e.getStatusCode());
        } catch (SQLException e) {
            JsonResponseUtil.sendError(exchange, "Database error: " + e.getMessage(), 500);
        } catch (Exception e) {
            JsonResponseUtil.sendError(exchange, "Internal server error: " + e.getMessage(), 500);
        }
    }

    private void handleGet(HttpExchange exchange) throws Exception {
        SessionManager.UserSession session = AuthUtil.requireRole(exchange, "NGO", "ADMIN");
        Map<String, String> query = JsonResponseUtil.parseQueryParams(exchange);

        String role = session.getRole();
        int requestedNgoId = 0;

        if ("NGO".equalsIgnoreCase(role)) {
            requestedNgoId = session.getUserId();
        } else if (query.get("ngoId") != null) {
            try {
                requestedNgoId = Integer.parseInt(query.get("ngoId"));
                if (requestedNgoId <= 0) {
                    JsonResponseUtil.sendError(exchange, "Invalid NGO ID", 400);
                    return;
                }
            } catch (NumberFormatException e) {
                JsonResponseUtil.sendError(exchange, "Invalid NGO ID", 400);
                return;
            }
        }

        List<Claim> claims = donationDAO.getAllClaims();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Claim c : claims) {
            if (requestedNgoId > 0 && c.getNgoId() != requestedNgoId) {
                continue;
            }

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getClaimId());
            map.put("claimId", c.getClaimId());
            map.put("donationId", c.getDonationId());
            map.put("ngoId", c.getNgoId());
            map.put("ngoName", c.getNgoName());
            map.put("messId", c.getMessId());
            map.put("messName", c.getMessName());
            map.put("foodName", c.getFoodName());
            map.put("foodType", c.getFoodType());
            map.put("portions", c.getQuantity());
            map.put("quantity", c.getQuantity());
            map.put("claimedAt", c.getClaimDate());
            map.put("claimDate", c.getClaimDate());
            map.put("pickupDeadline", c.getPickupDeadline());
            map.put("pickupLocation", c.getPickupLocation());
            map.put("status", c.getStatus());
            result.add(map);
        }

        JsonResponseUtil.sendJson(exchange, result, 200);
    }
}
