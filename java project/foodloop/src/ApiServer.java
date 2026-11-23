package foodloop.src;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import Util.CorsUtil;
import Util.JsonResponseUtil;

public class ApiServer {
    private static final int DEFAULT_PORT = 8080;
    private HttpServer server;
    private final int port;

    public ApiServer() {
        String envPort = System.getenv("PORT");
        int p = DEFAULT_PORT;
        if (envPort != null && !envPort.isEmpty()) {
            try {
                p = Integer.parseInt(envPort);
            } catch (NumberFormatException ignored) {}
        }
        this.port = p;
    }

    public ApiServer(int port) {
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);

        // Register contexts for all FoodLoop REST API endpoints
        server.createContext("/api/auth", new Handler.AuthHandler());
        server.createContext("/api/hostels", new Handler.HostelHandler());
        server.createContext("/api/meals", new Handler.MealRecordHandler());
        server.createContext("/api/donations", new Handler.DonationHandler());
        server.createContext("/api/claims", new Handler.ClaimHandler());
        server.createContext("/api/pickups", new Handler.PickupHandler());
        server.createContext("/api/waste", new Handler.WasteRecordHandler());
        server.createContext("/api/supervisor", new Handler.SupervisorHandler());
        server.createContext("/api/users", new Handler.UserHandler());

        // Root health check & non-wildcard credentialed CORS fallback
        server.createContext("/", exchange -> {
            if (CorsUtil.handleCors(exchange)) {
                return;
            }
            if ("/".equals(exchange.getRequestURI().getPath())) {
                Map<String, Object> status = new LinkedHashMap<>();
                status.put("name", "FoodLoop REST API");
                status.put("version", "1.0.0-Phase7C");
                status.put("status", "UP");
                status.put("campus", "Chitkara University, Punjab (Rajpura)");
                JsonResponseUtil.sendJson(exchange, status, 200);
            } else {
                JsonResponseUtil.sendError(exchange, "Resource not found: " + exchange.getRequestURI().getPath(), 404);
            }
        });

        // Use thread pool for concurrent request handling
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println("FoodLoop API server started on port " + port);
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
            System.out.println("FoodLoop API server stopped.");
        }
    }

    public int getPort() {
        return port;
    }

    public static void main(String[] args) throws IOException {
        new ApiServer().start();
    }
}
