package com.foodloop.exceptions;

/**
 * Thrown when attempting to register with an email that is already registered.
 */
public class DuplicateEmailException extends FoodLoopException {
    public DuplicateEmailException(String email) {
        super("An account with email '" + email + "' already exists in FoodLoop.", 409);
    }
}
