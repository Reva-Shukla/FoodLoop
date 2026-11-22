package Util;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.OutputStream;

public class JsonResponseUtil {
    private static final Gson gson = new Gson();

    public static void sendJson(HttpExchange exchange, Object responseObj, int statusCode) throws IOException {
        String json = gson.toJson(responseObj);
        byte[] bytes = json.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    public static void sendError(HttpExchange exchange, String message, int statusCode) throws IOException {
        sendJson(exchange, java.util.Collections.singletonMap("error", message), statusCode);
    }
}
