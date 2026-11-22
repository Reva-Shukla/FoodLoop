package foodloop.src;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;

public class ApiServer {
    private static final int PORT = 8080;
    private HttpServer server;

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(PORT), 0);
        // Register contexts for each API endpoint
        server.createContext("/api/users", new Handler.UserHandler());
        server.createContext("/api/meals", new Handler.MealRecordHandler());
        server.createContext("/api/donations", new Handler.DonationHandler());
        server.createContext("/api/claims", new Handler.ClaimHandler());
        server.createContext("/api/pickups", new Handler.PickupHandler());
        server.createContext("/api/waste", new Handler.WasteRecordHandler());
        server.createContext("/api/hostels", new Handler.HostelHandler());
        // Enable CORS for all responses
        server.createContext("/", exchange -> {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.setExecutor(null); // default executor
        server.start();
        System.out.println("API server started on port " + PORT);
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    public static void main(String[] args) throws IOException {
        new ApiServer().start();
    }
}
