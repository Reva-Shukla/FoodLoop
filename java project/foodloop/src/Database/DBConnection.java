package foodloop.src.Database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/foodloop";

    public static Connection getConnection() throws SQLException {
        String url = System.getenv("foodloopURL");
        if (url == null || url.isEmpty()) {
            url = DEFAULT_URL;
        }

        String username = System.getenv("DB_USERNAME");
        if (username == null || username.isEmpty()) {
            username = "root";
        }

        String password = System.getenv("DB_PASSWORD");
        if (password == null || password.isEmpty()) {
            throw new SQLException(
                "Set the DB_PASSWORD environment variable first."
            );
        }

        return DriverManager.getConnection(url, username, password);
    }
}
