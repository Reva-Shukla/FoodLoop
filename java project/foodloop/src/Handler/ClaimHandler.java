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
import foodloop.src.Model.Donation;

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
        SessionManager.UserSession session = AuthUtil.requireAuth(exchange);
        Map<String, String> query = JsonResponseUtil.parseQueryParams(exchange);

        int ngoId = 0;
        if ("NGO".equalsIgnoreCase(session.getRole())) {
            ngoId = session.getUserId();
        } else if (query.get("ngoId") != null) {
            try {
                ngoId = Integer.parseInt(query.get("ngoId"));
            } catch (NumberFormatException ignored) {}
        }

        List<Map<String, Object>> result = new ArrayList<>();
        if (ngoId > 0) {
            List<Donation> myClaimedDonations = donationDAO.getMyClaims(ngoId);
            for (Donation d : myClaimedDonations) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", d.getDonationId());
                map.put("claimId", d.getDonationId());
                map.put("donationId", d.getDonationId());
                map.put("ngoId", ngoId);
                map.put("ngoName", session.getName());
                map.put("messId", d.getMessId());
                map.put("messName", d.getMessName());
                map.put("foodName", d.getFoodName());
                map.put("foodType", d.getFoodType());
                map.put("portions", d.getQuantity());
                map.put("quantity", d.getQuantity());
                map.put("claimedAt", d.getCreatedAt());
                map.put("claimDate", d.getCreatedAt());
                map.put("pickupDeadline", d.getDeadline());
                map.put("pickupLocation", d.getPickupLocation());
                map.put("status", d.getStatus());
                result.add(map);
            }
        } else {
            AuthUtil.requireRole(exchange, "ADMIN");
            List<Claim> allClaims = donationDAO.getAllClaims();
            for (Claim c : allClaims) {
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
        }

        JsonResponseUtil.sendJson(exchange, result, 200);
    }
}
