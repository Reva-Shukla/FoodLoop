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
import foodloop.src.Dao.UserDAO;
import foodloop.src.Model.User;

public class UserHandler implements HttpHandler {
    private final UserDAO userDAO = new UserDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            AuthUtil.validateCsrf(exchange);
            String method = exchange.getRequestMethod().toUpperCase();
            switch (method) {
                case "GET":
                    handleGet(exchange);
                    break;
                case "POST":
                    handlePost(exchange);
                    break;
                default:
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
        AuthUtil.requireRole(exchange, "ADMIN");
        List<User> users = userDAO.getAllUsers();
        List<Map<String, Object>> sanitized = new ArrayList<>();
        for (User u : users) {
            // Never serialize passwords or hashes
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getUserId());
            map.put("userId", u.getUserId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("assignedMessId", u.getAssignedMessId());
            map.put("assignedMessName", u.getAssignedMessName());
            map.put("organization", u.getOrganization());
            map.put("department", u.getDepartment());
            map.put("location", u.getLocation());
            map.put("foodPreference", u.getFoodPreference());
            sanitized.add(map);
        }
        JsonResponseUtil.sendJson(exchange, sanitized, 200);
    }

    private void handlePost(HttpExchange exchange) throws IOException {
        JsonResponseUtil.sendError(exchange, "Use /api/auth/register for user registration", 400);
    }
}
