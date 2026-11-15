package com.foodloop.exceptions;

/**
 * Thrown when donor input validation fails (e.g. invalid phone, missing business name).
 */
public class InvalidDonorException extends FoodLoopException {
    public InvalidDonorException(String message) {
        super(message, 400);
    }
}
