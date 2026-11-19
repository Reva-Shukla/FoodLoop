package foodloop.src.Database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    public static Connection getConnection() throws SQLException {
        System.out.println("Connecting to FoodLoop...");

        String url = System.getenv("foodloopURL");
        String username = "sameer";
        String password = System.getenv("DB_PASSWORD");

        if (username == null || username.isEmpty()) {
            throw new SQLException(
                "Set the DB_USERNAME environment variable first."
            );
        }

        if (password == null || password.isEmpty()) {
            throw new SQLException(
                "Set the DB_PASSWORD environment variable first."
            );
        }

        return DriverManager.getConnection(url, username, password);
    }
}


