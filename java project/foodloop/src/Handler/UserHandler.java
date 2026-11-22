package Handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import Util.JsonResponseUtil;
import foodloop.src.Dao.UserDAO;
import foodloop.src.Model.User;

public class UserHandler implements HttpHandler {
    private final UserDAO userDAO = new UserDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
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
        } catch (Exception e) {
            JsonResponseUtil.sendError(exchange, e.getMessage(), 500);
        }
    }

    private void handleGet(HttpExchange exchange) throws IOException {
        // Simple example: return list of all users as JSON
        List<User> users = userDAO.getAllUsers();
        JsonResponseUtil.sendJson(exchange, users, 200);
    }

    private void handlePost(HttpExchange exchange) throws IOException {
        // Expect JSON body with user fields (name,email,password,role,location,foodPreference)
        // For brevity, we won't implement full parsing here; just acknowledge.
        JsonResponseUtil.sendJson(exchange, Map.of("message", "User creation not implemented"), 200);
    }
}
