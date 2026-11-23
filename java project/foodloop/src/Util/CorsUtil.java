package Util;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.regex.Pattern;

public class CorsUtil {
    private static final Pattern ALLOWED_ORIGIN_PATTERN =
            Pattern.compile("^https?://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?$");

    public static boolean handleCors(HttpExchange exchange) throws IOException {
        String origin = exchange.getRequestHeaders().getFirst("Origin");
        if (origin != null && isAllowedOrigin(origin)) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", origin);
            exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers",
                    "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Session-Token");
            exchange.getResponseHeaders().set("Access-Control-Max-Age", "3600");
        } else if (origin == null) {
            // Local tool / CLI / non-browser request
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "http://localhost:5173");
            exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
        }

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return true;
        }
        return false;
    }

    public static boolean isAllowedOrigin(String origin) {
        if (origin == null || origin.trim().isEmpty()) {
            return false;
        }
        return ALLOWED_ORIGIN_PATTERN.matcher(origin.trim()).matches();
    }
}
