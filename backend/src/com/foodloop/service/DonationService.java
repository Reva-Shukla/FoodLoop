package com.foodloop.service;

import com.foodloop.dao.DonationDAO;
import com.foodloop.dao.DonorDAO;
import com.foodloop.exceptions.DonationNotFoundException;
import com.foodloop.exceptions.InvalidDonationException;
import com.foodloop.exceptions.UnauthorizedActionException;
import com.foodloop.interfaces.DonationOperations;
import com.foodloop.interfaces.Reportable;
import com.foodloop.model.*;
import com.foodloop.util.ValidationUtil;

import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service: DonationService
 * Syllabus Concepts Demonstrated:
 *  - Interfaces: Implements DonationOperations and Reportable
 *  - Polymorphism / Method Overloading: 3 overloaded variations of searchDonations(...)
 *  - Collections: ArrayList, HashMap, PriorityQueue (for urgency ordering)
 *  - Lambdas & Streams: Filtering by status, date sorting, calculating total quantity & counts
 *  - File Handling / I/O: CSV donation report export
 *  - Exception Handling: Custom exception throwing and validation checks
 */
public class DonationService implements DonationOperations, Reportable {
    private final DonationDAO donationDAO;
    private final DonorDAO donorDAO;

    public DonationService(DonationDAO donationDAO, DonorDAO donorDAO) {
        this.donationDAO = donationDAO;
        this.donorDAO = donorDAO;
    }

    @Override
    public Donation createDonation(Donation donation) throws InvalidDonationException {
        // Validation 1: Food name
        if (!ValidationUtil.isNonEmpty(donation.getFoodName())) {
            throw new InvalidDonationException("Food item name cannot be empty.");
        }

        // Validation 2: Quantity must be > 0
        if (!ValidationUtil.isValidQuantity(donation.getQuantity())) {
            throw new InvalidDonationException("Donation quantity must be greater than zero.");
        }

        // Validation 3: Quantity unit
        if (!ValidationUtil.isNonEmpty(donation.getQuantityUnit())) {
            throw new InvalidDonationException("Quantity unit (e.g., plates, kg, packets) is required.");
        }

        // Validation 4: Expiry must be in the future
        if (!ValidationUtil.isFutureDateTime(donation.getExpiryDatetime())) {
            throw new InvalidDonationException("Expiry date and time must be later than the current time.");
        }

        // Validation 5: Preparation time must not be after expiry
        if (donation.getPreparationDatetime() != null
                && donation.getPreparationDatetime().isAfter(donation.getExpiryDatetime())) {
            throw new InvalidDonationException("Preparation time cannot be later than expiry time.");
        }

        // Validation 6: Pickup details
        if (!ValidationUtil.isNonEmpty(donation.getPickupAddress())) {
            throw new InvalidDonationException("Pickup address is required.");
        }
        if (!ValidationUtil.isNonEmpty(donation.getPickupTime())) {
            throw new InvalidDonationException("Pickup availability time is required.");
        }

        // Food Safety Rule: Unserved surplus declaration
        if (!donation.isUnservedSurplus()) {
            throw new InvalidDonationException(
                "FoodLoop only accepts unserved surplus food. Plate leftovers cannot be accepted due to safety guidelines."
            );
        }

        // Default initial status
        donation.setStatus(DonationStatus.PENDING);
        donation.setCreatedAt(LocalDateTime.now());
        donation.setUpdatedAt(LocalDateTime.now());

        // Attach donor metadata if available
        if (donation.getDonorId() != null) {
            donorDAO.findById(donation.getDonorId()).ifPresent(d -> {
                donation.setDonorBusinessName(d.getBusinessName());
                donation.setDonorPhone(d.getPhone());
                donation.setDonorCity(d.getCity());
            });
        }

        return donationDAO.save(donation);
    }

    @Override
    public Optional<Donation> getDonationById(Long donationId) {
        return donationDAO.findById(donationId);
    }

    @Override
    public List<Donation> getDonationsByDonor(Long donorId) {
        return donationDAO.findByDonorId(donorId);
    }

    @Override
    public Donation updateDonation(Long donorId, Long donationId, Donation updatedData)
            throws DonationNotFoundException, InvalidDonationException {
        Donation existing = donationDAO.findById(donationId)
                .orElseThrow(() -> new DonationNotFoundException(donationId));

        if (!Objects.equals(existing.getDonorId(), donorId)) {
            throw new InvalidDonationException("You are not authorized to edit this donation.");
        }

        // Only PENDING donations can be edited
        if (!existing.isEligibleForEdit()) {
            throw new InvalidDonationException(
                "Cannot edit donation in '" + existing.getStatus() + "' status. Only PENDING donations can be edited."
            );
        }

        // Validate updated fields
        if (updatedData.getFoodName() != null && !updatedData.getFoodName().trim().isEmpty()) {
            existing.setFoodName(updatedData.getFoodName().trim());
        }
        if (updatedData.getDescription() != null) {
            existing.setDescription(updatedData.getDescription().trim());
        }
        if (updatedData.getQuantity() > 0) {
            existing.setQuantity(updatedData.getQuantity());
        }
        if (updatedData.getQuantityUnit() != null) {
            existing.setQuantityUnit(updatedData.getQuantityUnit().trim());
        }
        if (updatedData.getCategory() != null) {
            existing.setCategory(updatedData.getCategory());
        }
        if (updatedData.getFoodType() != null) {
            existing.setFoodType(updatedData.getFoodType());
        }
        if (updatedData.getExpiryDatetime() != null) {
            if (!ValidationUtil.isFutureDateTime(updatedData.getExpiryDatetime())) {
                throw new InvalidDonationException("New expiry datetime must be in the future.");
            }
            existing.setExpiryDatetime(updatedData.getExpiryDatetime());
        }
        if (updatedData.getPickupAddress() != null) {
            existing.setPickupAddress(updatedData.getPickupAddress().trim());
        }
        if (updatedData.getPickupTime() != null) {
            existing.setPickupTime(updatedData.getPickupTime().trim());
        }
        if (updatedData.getInstructions() != null) {
            existing.setInstructions(updatedData.getInstructions().trim());
        }

        donationDAO.update(existing);
        return existing;
    }

    @Override
    public boolean cancelDonation(Long donorId, Long donationId)
            throws DonationNotFoundException, InvalidDonationException {
        Donation existing = donationDAO.findById(donationId)
                .orElseThrow(() -> new DonationNotFoundException(donationId));

        if (!Objects.equals(existing.getDonorId(), donorId)) {
            throw new InvalidDonationException("You are not authorized to cancel this donation.");
        }

        if (!existing.isEligibleForCancel()) {
            throw new InvalidDonationException(
                "Cannot cancel donation in '" + existing.getStatus() + "' status. Only PENDING donations can be cancelled."
            );
        }

        return donationDAO.updateStatusWithThreadSafety(
                donationId, DonationStatus.PENDING, DonationStatus.CANCELLED, "Donor #" + donorId
        );
    }

    // =========================================================================
    // POLYMORPHISM & METHOD OVERLOADING
    // =========================================================================

    /**
     * Overload 1: Basic keyword search
     */
    @Override
    public List<Donation> searchDonations(Long donorId, String keyword) {
        return searchDonations(donorId, keyword, null, "DATE_DESC");
    }

    /**
     * Overload 2: Keyword search with status filter
     */
    @Override
    public List<Donation> searchDonations(Long donorId, String keyword, DonationStatus status) {
        return searchDonations(donorId, keyword, status, "DATE_DESC");
    }

    /**
     * Overload 3: Full search, filter, and sort (Uses Stream API & Lambdas)
     */
    @Override
    public List<Donation> searchDonations(Long donorId, String keyword, DonationStatus status, String sortBy) {
        List<Donation> all = donationDAO.findByDonorId(donorId);

        // 1. Filter by keyword using Lambda predicate
        String kw = (keyword != null) ? keyword.trim().toLowerCase() : "";
        List<Donation> filtered = all.stream()
                .filter(d -> kw.isEmpty()
                        || (d.getFoodName() != null && d.getFoodName().toLowerCase().contains(kw))
                        || (d.getDescription() != null && d.getDescription().toLowerCase().contains(kw))
                        || (d.getCategory() != null && d.getCategory().getLabel().toLowerCase().contains(kw)))
                // 2. Filter by status if provided
                .filter(d -> status == null || d.getStatus() == status)
                .collect(Collectors.toList());

        // 3. Sort using Stream Comparator
        if ("EXPIRY_ASC".equalsIgnoreCase(sortBy)) {
            filtered.sort(Comparator.comparing(Donation::getExpiryDatetime, Comparator.nullsLast(Comparator.naturalOrder())));
        } else if ("QTY_DESC".equalsIgnoreCase(sortBy)) {
            filtered.sort(Comparator.comparing(Donation::getQuantity, Comparator.reverseOrder()));
        } else if ("FOOD_NAME".equalsIgnoreCase(sortBy)) {
            filtered.sort(Comparator.comparing(Donation::getFoodName, String.CASE_INSENSITIVE_ORDER));
        } else {
            // Default: Most recent first (DATE_DESC)
            filtered.sort(Comparator.comparing(Donation::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        }

        return filtered;
    }

    // =========================================================================
    // COLLECTIONS DEMONSTRATION: PRIORITY QUEUE FOR EXPIRING SOON DONATIONS
    // =========================================================================

    /**
     * Demonstrates Java Collections: PriorityQueue
     * Gathers all pending donations for this donor and uses PriorityQueue
     * (ordered by expiry datetime ascending) to extract top urgent donations.
     */
    public List<Donation> getExpiringSoonDonations(Long donorId, int limit) {
        List<Donation> donorList = donationDAO.findByDonorId(donorId);

        // PriorityQueue orders by Donation.compareTo (earliest expiry first)
        PriorityQueue<Donation> queue = new PriorityQueue<>();

        // Add only pending, unexpired donations
        for (Donation d : donorList) {
            if (d.getStatus() == DonationStatus.PENDING && !d.isExpiredNow()) {
                queue.offer(d);
            }
        }

        List<Donation> result = new ArrayList<>();
        int count = 0;
        while (!queue.isEmpty() && count < limit) {
            result.add(queue.poll());
            count++;
        }
        return result;
    }

    // =========================================================================
    // STREAM API & LAMBDAS: DASHBOARD STATISTICS
    // =========================================================================

    public DonorStats getDonorStats(Long donorId) {
        List<Donation> list = donationDAO.findByDonorId(donorId);
        String businessName = donorDAO.findById(donorId).map(Donor::getBusinessName).orElse("My Donations");

        long total = list.size();

        // Stream API counts with Lambda filter
        long pending = list.stream().filter(d -> d.getStatus() == DonationStatus.PENDING).count();
        long accepted = list.stream().filter(d -> d.getStatus() == DonationStatus.ACCEPTED).count();
        long inProgress = list.stream().filter(d -> d.getStatus() == DonationStatus.PICKUP_IN_PROGRESS).count();
        long completed = list.stream().filter(d -> d.getStatus() == DonationStatus.COMPLETED).count();
        long expired = list.stream().filter(d -> d.getStatus() == DonationStatus.EXPIRED).count();
        long cancelled = list.stream().filter(d -> d.getStatus() == DonationStatus.CANCELLED).count();

        // Stream API sum calculation
        double totalQty = list.stream()
                .filter(d -> d.getStatus() != DonationStatus.CANCELLED)
                .mapToDouble(Donation::getQuantity)
                .sum();

        double activeQty = list.stream()
                .filter(d -> d.getStatus() == DonationStatus.PENDING || d.getStatus() == DonationStatus.ACCEPTED)
                .mapToDouble(Donation::getQuantity)
                .sum();

        return new DonorStats(businessName, total, pending, accepted, inProgress,
                completed, expired, cancelled, totalQty, activeQty);
    }

    // =========================================================================
    // INTERFACE IMPLEMENTATION: Reportable & FILE HANDLING (CSV REPORT)
    // =========================================================================

    @Override
    public Map<String, Object> generateSummaryStats(Long donorId) {
        return getDonorStats(donorId).toMap();
    }

    @Override
    public String generateCsvReport(Long donorId) throws IOException {
        List<Donation> list = donationDAO.findByDonorId(donorId);
        StringWriter writer = new StringWriter();

        // CSV Header
        writer.append("Donation ID,Food Name,Quantity,Unit,Category,Food Type,Status,Preparation Time,Expiry Time,NGO Recipient,Claimed At,Created Date\n");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        // CSV Rows
        for (Donation d : list) {
            writer.append(String.valueOf(d.getId())).append(",");
            writer.append("\"").append(escapeCsv(d.getFoodName())).append("\",");
            writer.append(String.valueOf(d.getQuantity())).append(",");
            writer.append("\"").append(escapeCsv(d.getQuantityUnit())).append("\",");
            writer.append("\"").append(d.getCategory() != null ? d.getCategory().getLabel() : "").append("\",");
            writer.append("\"").append(d.getFoodType() != null ? d.getFoodType().getLabel() : "").append("\",");
            writer.append("\"").append(d.getStatus() != null ? d.getStatus().name() : "").append("\",");
            writer.append("\"").append(d.getPreparationDatetime() != null ? d.getPreparationDatetime().format(fmt) : "").append("\",");
            writer.append("\"").append(d.getExpiryDatetime() != null ? d.getExpiryDatetime().format(fmt) : "").append("\",");
            writer.append("\"").append(d.getNgoName() != null ? escapeCsv(d.getNgoName()) : "N/A").append("\",");
            writer.append("\"").append(d.getClaimedAt() != null ? d.getClaimedAt().format(fmt) : "N/A").append("\",");
            writer.append("\"").append(d.getCreatedAt() != null ? d.getCreatedAt().format(fmt) : "").append("\"\n");
        }

        return writer.toString();
    }

    private String escapeCsv(String str) {
        if (str == null) return "";
        return str.replace("\"", "\"\"");
    }

    // =========================================================================
    // TEAM INTEGRATION: MEMBER 2 (NGO CLAIMING) ENDPOINTS
    // =========================================================================

    public List<Donation> getAvailableDonationsForNGO() {
        return donationDAO.findAll().stream()
                .filter(d -> d.getStatus() == DonationStatus.PENDING && !d.isExpiredNow())
                .sorted(Comparator.comparing(Donation::getExpiryDatetime, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    /**
     * Thread-safe claiming method for Member 2 NGO module
     */
    public boolean claimDonationByNGO(Long donationId, Long ngoId, String ngoName, String ngoPhone)
            throws DonationNotFoundException, UnauthorizedActionException {
        Donation d = donationDAO.findById(donationId)
                .orElseThrow(() -> new DonationNotFoundException(donationId));

        if (d.getStatus() != DonationStatus.PENDING) {
            throw new UnauthorizedActionException("Donation is already " + d.getStatus() + " and cannot be claimed.");
        }
        if (d.isExpiredNow()) {
            throw new UnauthorizedActionException("Donation has expired.");
        }

        boolean updated = donationDAO.updateStatusWithThreadSafety(
                donationId, DonationStatus.PENDING, DonationStatus.ACCEPTED, "NGO #" + ngoId
        );

        if (updated) {
            d.setClaimedByNgoId(ngoId);
            d.setNgoName(ngoName);
            d.setNgoPhone(ngoPhone);
            d.setClaimedAt(LocalDateTime.now());
            donationDAO.update(d);
            return true;
        }
        return false;
    }
}
