package com.foodloop.exceptions;

/**
 * Thrown when food donation attributes are invalid (e.g. quantity <= 0, expiry in past).
 */
public class InvalidDonationException extends FoodLoopException {
    public InvalidDonationException(String message) {
        super(message, 400);
    }
}
