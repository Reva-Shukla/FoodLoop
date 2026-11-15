package com.foodloop.interfaces;

import com.foodloop.model.Donation;
import com.foodloop.model.DonationStatus;
import com.foodloop.exceptions.InvalidDonationException;
import com.foodloop.exceptions.DonationNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Interface: DonationOperations
 * Syllabus Concept: Java Interfaces & Polymorphic Contracts
 * 
 * Defines standard operations performed on food donations, shared between
 * Donor Management (Member 1) and future modules (NGO Claiming, Smart Matching).
 */
public interface DonationOperations {
    Donation createDonation(Donation donation) throws InvalidDonationException;
    Optional<Donation> getDonationById(Long donationId);
    List<Donation> getDonationsByDonor(Long donorId);
    Donation updateDonation(Long donorId, Long donationId, Donation updatedData) 
            throws DonationNotFoundException, InvalidDonationException;
    boolean cancelDonation(Long donorId, Long donationId) 
            throws DonationNotFoundException, InvalidDonationException;
    
    // Method overloading demonstrated in implementation
    List<Donation> searchDonations(Long donorId, String keyword);
    List<Donation> searchDonations(Long donorId, String keyword, DonationStatus status);
    List<Donation> searchDonations(Long donorId, String keyword, DonationStatus status, String sortBy);
}
