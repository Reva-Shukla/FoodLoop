package Util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sun.net.httpserver.HttpExchange;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public class JsonResponseUtil {
    private static final Gson gson = new GsonBuilder()
            .serializeNulls()
            .disableHtmlEscaping()
            .create();

    public static Gson getGson() {
        return gson;
    }

    public static void sendJson(HttpExchange exchange, Object responseObj, int statusCode) throws IOException {
        String json = gson.toJson(responseObj);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    public static void sendError(HttpExchange exchange, String message, int statusCode) throws IOException {
        Map<String, Object> errorMap = new LinkedHashMap<>();
        errorMap.put("success", false);
        errorMap.put("error", message != null ? message : "An unexpected error occurred");
        errorMap.put("message", message != null ? message : "An unexpected error occurred");
        sendJson(exchange, errorMap, statusCode);
    }

    public static String readRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    public static Map<String, String> parseQueryParams(HttpExchange exchange) {
        String query = exchange.getRequestURI().getRawQuery();
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, String> params = new HashMap<>();
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf('=');
            if (idx > 0) {
                try {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    params.put(key, value);
                } catch (Exception ignored) {
                }
            } else if (idx < 0 && !pair.isEmpty()) {
                params.put(pair, "");
            }
        }
        return params;
    }
}
