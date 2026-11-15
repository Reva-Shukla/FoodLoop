package com.foodloop.exceptions;

/**
 * Custom Exception Base Class
 * Syllabus Concept: Java Exception Handling & Custom Exception Hierarchy
 */
public class FoodLoopException extends Exception {
    private final int statusCode;

    public FoodLoopException(String message) {
        super(message);
        this.statusCode = 400;
    }

    public FoodLoopException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public FoodLoopException(String message, Throwable cause, int statusCode) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
