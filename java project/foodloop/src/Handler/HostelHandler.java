package Handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import Util.CorsUtil;
import Util.JsonResponseUtil;
import foodloop.src.Dao.HostelDAO;
import foodloop.src.Model.Hostel;

public class HostelHandler implements HttpHandler {
    private final HostelDAO hostelDAO = new HostelDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            String method = exchange.getRequestMethod().toUpperCase();
            if ("GET".equals(method)) {
                handleGet(exchange);
            } else {
                JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
            }
        } catch (SQLException e) {
            JsonResponseUtil.sendError(exchange, "Database error: " + e.getMessage(), 500);
        } catch (Exception e) {
            JsonResponseUtil.sendError(exchange, "Internal server error: " + e.getMessage(), 500);
        }
    }

    private void handleGet(HttpExchange exchange) throws Exception {
        List<Hostel> hostels = hostelDAO.getAllHostels();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Hostel h : hostels) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", h.getHostelId());
            map.put("hostelId", h.getHostelId());
            map.put("name", h.getName());
            map.put("category", h.getCategory());
            map.put("categoryLabel", h.getCategoryLabel());
            map.put("campus", h.getCampus());
            result.add(map);
        }
        JsonResponseUtil.sendJson(exchange, result, 200);
    }
}
