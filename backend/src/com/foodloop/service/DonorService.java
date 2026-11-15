package com.foodloop.service;

import com.foodloop.dao.DonorDAO;
import com.foodloop.dao.UserDAO;
import com.foodloop.exceptions.DuplicateEmailException;
import com.foodloop.exceptions.InvalidDonorException;
import com.foodloop.model.Donor;
import com.foodloop.model.DonorType;
import com.foodloop.util.PasswordHasher;
import com.foodloop.util.ValidationUtil;

import java.util.Optional;

/**
 * Service: DonorService
 * Handles donor business logic, validations, and profile management.
 */
public class DonorService {
    private final DonorDAO donorDAO;
    private final UserDAO userDAO;

    public DonorService(DonorDAO donorDAO, UserDAO userDAO) {
        this.donorDAO = donorDAO;
        this.userDAO = userDAO;
    }

    /**
     * Registers a new donor after strict field validations and duplicate email check.
     */
    public Donor registerDonor(String name, String businessName, String email, String phone,
                               String password, String confirmPassword, String donorTypeStr,
                               String address, String city) throws InvalidDonorException, DuplicateEmailException {
        // 1. Required field validations
        if (!ValidationUtil.isNonEmpty(businessName)) {
            throw new InvalidDonorException("Donor/Business name is required.");
        }
        if (!ValidationUtil.isNonEmpty(name)) {
            throw new InvalidDonorException("Owner/Manager contact name is required.");
        }
        if (!ValidationUtil.isNonEmpty(email) || !ValidationUtil.isValidEmail(email)) {
            throw new InvalidDonorException("A valid email address is required.");
        }
        if (!ValidationUtil.isNonEmpty(phone) || !ValidationUtil.isValidPhone(phone)) {
            throw new InvalidDonorException("A valid phone number (7-15 digits) is required.");
        }
        if (!ValidationUtil.isNonEmpty(address)) {
            throw new InvalidDonorException("Full pickup address is required.");
        }
        if (!ValidationUtil.isNonEmpty(city)) {
            throw new InvalidDonorException("City is required.");
        }
        if (!ValidationUtil.isNonEmpty(password) || password.length() < 6) {
            throw new InvalidDonorException("Password must be at least 6 characters long.");
        }
        if (!password.equals(confirmPassword)) {
            throw new InvalidDonorException("Password and confirm password do not match.");
        }

        // 2. Prevent duplicate email registration
        if (donorDAO.findByEmail(email).isPresent() || userDAO.findByEmail(email).isPresent()) {
            throw new DuplicateEmailException(email);
        }

        // 3. Resolve Donor Type
        DonorType donorType = DonorType.fromString(donorTypeStr);

        // 4. Secure Password Hashing
        String passwordHash = PasswordHasher.hashPassword(password);

        // 5. Construct & persist entity
        Donor newDonor = new Donor(null, name.trim(), email.trim().toLowerCase(),
                passwordHash, phone.trim(), null, businessName.trim(), donorType,
                address.trim(), city.trim());

        return donorDAO.save(newDonor);
    }

    public Optional<Donor> getDonorProfile(Long donorId) {
        return donorDAO.findById(donorId);
    }

    public Donor updateProfile(Long donorId, String name, String businessName,
                               String phone, String address, String city) throws InvalidDonorException {
        Donor donor = donorDAO.findById(donorId)
                .orElseThrow(() -> new InvalidDonorException("Donor profile not found."));

        if (!ValidationUtil.isNonEmpty(businessName)) {
            throw new InvalidDonorException("Business name cannot be empty.");
        }
        if (!ValidationUtil.isNonEmpty(name)) {
            throw new InvalidDonorException("Manager name cannot be empty.");
        }
        if (!ValidationUtil.isNonEmpty(phone) || !ValidationUtil.isValidPhone(phone)) {
            throw new InvalidDonorException("Valid phone number is required.");
        }
        if (!ValidationUtil.isNonEmpty(address)) {
            throw new InvalidDonorException("Address cannot be empty.");
        }
        if (!ValidationUtil.isNonEmpty(city)) {
            throw new InvalidDonorException("City cannot be empty.");
        }

        donor.setName(name.trim());
        donor.setBusinessName(businessName.trim());
        donor.setPhone(phone.trim());
        donor.setAddress(address.trim());
        donor.setCity(city.trim());

        donorDAO.update(donor);
        return donor;
    }

    public void changePassword(Long donorId, String currentPassword,
                               String newPassword, String confirmNewPassword) throws InvalidDonorException {
        Donor donor = donorDAO.findById(donorId)
                .orElseThrow(() -> new InvalidDonorException("Donor profile not found."));

        if (!donor.verifyPassword(currentPassword)) {
            throw new InvalidDonorException("Current password does not match.");
        }
        if (!ValidationUtil.isNonEmpty(newPassword) || newPassword.length() < 6) {
            throw new InvalidDonorException("New password must be at least 6 characters.");
        }
        if (!newPassword.equals(confirmNewPassword)) {
            throw new InvalidDonorException("New password and confirmation do not match.");
        }

        donor.setPasswordHash(PasswordHasher.hashPassword(newPassword));
        donorDAO.update(donor);
    }
}
