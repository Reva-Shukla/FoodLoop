package com.foodloop.exceptions;

/**
 * Thrown when an underlying JDBC database or transaction operation fails.
 */
public class DatabaseOperationException extends FoodLoopException {
    public DatabaseOperationException(String message, Throwable cause) {
        super("Database operation error: " + message, cause, 500);
    }

    public DatabaseOperationException(String message) {
        super("Database operation error: " + message, 500);
    }
}
