package com.foodloop.exceptions;

/**
 * Thrown when an authenticated donor attempts an action on a donation they do not own,
 * or when trying to cancel an already completed or accepted donation.
 */
public class UnauthorizedActionException extends FoodLoopException {
    public UnauthorizedActionException(String message) {
        super(message, 403);
    }
}
