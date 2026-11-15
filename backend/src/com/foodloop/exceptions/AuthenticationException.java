package com.foodloop.exceptions;

/**
 * Thrown when credentials fail or session token is invalid/expired.
 */
public class AuthenticationException extends FoodLoopException {
    public AuthenticationException(String message) {
        super(message, 401);
    }
}
