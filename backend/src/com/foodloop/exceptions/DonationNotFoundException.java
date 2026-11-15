package com.foodloop.exceptions;

/**
 * Thrown when requested donation is not found.
 */
public class DonationNotFoundException extends FoodLoopException {
    public DonationNotFoundException(Long donationId) {
        super("Donation with ID " + donationId + " was not found.", 404);
    }
}
