package Handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import Util.AuthUtil;
import Util.CorsUtil;
import Util.JsonResponseUtil;
import foodloop.src.Dao.DonationDAO;
import foodloop.src.Dao.HostelDAO;
import foodloop.src.Dao.MealRecordDAO;
import foodloop.src.Dao.UserDAO;
import foodloop.src.Dao.WasteRecordDAO;
import foodloop.src.Model.Donation;
import foodloop.src.Model.Hostel;
import foodloop.src.Model.MealRecord;
import foodloop.src.Model.User;
import foodloop.src.Model.WasteRecord;

public class SupervisorHandler implements HttpHandler {
    private final MealRecordDAO mealRecordDAO = new MealRecordDAO();
    private final DonationDAO donationDAO = new DonationDAO();
    private final WasteRecordDAO wasteRecordDAO = new WasteRecordDAO();
    private final HostelDAO hostelDAO = new HostelDAO();
    private final UserDAO userDAO = new UserDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handleCors(exchange)) {
            return;
        }

        try {
            AuthUtil.validateCsrf(exchange);
            // ADMIN-only authorization
            AuthUtil.requireRole(exchange, "ADMIN");

            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod().toUpperCase();

            if (!"GET".equals(method)) {
                JsonResponseUtil.sendError(exchange, "Method not allowed", 405);
                return;
            }

            if (path.endsWith("/metrics")) {
                handleMetrics(exchange);
            } else if (path.endsWith("/hostel-comparison")) {
                handleHostelComparison(exchange);
            } else if (path.endsWith("/waste-breakdown")) {
                handleWasteBreakdown(exchange);
            } else if (path.endsWith("/users")) {
                handleUsers(exchange);
            } else if (path.endsWith("/registration-requests")) {
                handleRegistrationRequests(exchange);
            } else {
                JsonResponseUtil.sendError(exchange, "Endpoint not found: " + path, 404);
            }
        } catch (AuthUtil.ApiException e) {
            JsonResponseUtil.sendError(exchange, e.getMessage(), e.getStatusCode());
        } catch (SQLException e) {
            JsonResponseUtil.sendError(exchange, "Database error: " + e.getMessage(), 500);
        } catch (Exception e) {
            JsonResponseUtil.sendError(exchange, "Internal server error: " + e.getMessage(), 500);
        }
    }

    private void handleMetrics(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonResponseUtil.parseQueryParams(exchange);
        String period = query.getOrDefault("period", "TODAY");
        String category = query.getOrDefault("category", "ALL");
        String messId = query.getOrDefault("messId", "ALL");

        List<Hostel> allHostels = hostelDAO.getAllHostels();
        Map<String, Hostel> hostelMap = new LinkedHashMap<>();
        for (Hostel h : allHostels) {
            hostelMap.put(h.getHostelId(), h);
        }

        List<MealRecord> allMeals = mealRecordDAO.getAllMealRecords();
        List<MealRecord> filteredMeals = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (MealRecord m : allMeals) {
            // Exclude demo / unassigned records from genuine campus analytics
            if (m.getMessId() == null || !hostelMap.containsKey(m.getMessId())) {
                continue;
            }
            if (!isDateInFilter(m.getMealDate(), period, today)) {
                continue;
            }
            if (!"ALL".equalsIgnoreCase(messId) && !m.getMessId().equalsIgnoreCase(messId)) {
                continue;
            }
            if (!"ALL".equalsIgnoreCase(category)) {
                Hostel h = hostelMap.get(m.getMessId());
                if (h == null || !category.equalsIgnoreCase(h.getCategory())) {
                    continue;
                }
            }
            filteredMeals.add(m);
        }

        int totalPrepared = 0;
        int totalServed = 0;
        int totalSurplus = 0;
        int foodDonated = 0;
        int foodWasted = 0;
        int activeReserved = 0;

        for (MealRecord m : filteredMeals) {
            int prep = m.getPrepared();
            int srv = m.getServed();
            int sur = Math.max(0, prep - srv);

            totalPrepared += prep;
            totalServed += srv;
            totalSurplus += sur;

            List<Donation> dons = donationDAO.getDonationsByMealId(m.getMealId());
            for (Donation d : dons) {
                int qty = d.getQuantity();
                String st = d.getStatus();
                if ("PICKED_UP".equalsIgnoreCase(st) || "COMPLETED".equalsIgnoreCase(st)) {
                    foodDonated += qty;
                } else if ("AVAILABLE".equalsIgnoreCase(st) || "CLAIMED".equalsIgnoreCase(st)) {
                    activeReserved += qty;
                }
            }

            List<WasteRecord> wsts = wasteRecordDAO.getWasteRecordsByMealId(m.getMealId());
            for (WasteRecord w : wsts) {
                foodWasted += w.getPortionsDiscarded();
            }
        }

        int remainingFood = Math.max(0, totalSurplus - foodDonated - foodWasted);
        int unallocatedSurplus = Math.max(0, remainingFood - activeReserved);

        double redistributionRateNum = totalSurplus > 0 ? (foodDonated * 100.0 / totalSurplus) : 0.0;
        double surplusWastageRateNum = totalSurplus > 0 ? (foodWasted * 100.0 / totalSurplus) : 0.0;
        double servingUtilisationNum = totalPrepared > 0 ? (totalServed * 100.0 / totalPrepared) : 0.0;

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("totalPrepared", totalPrepared);
        resp.put("totalServed", totalServed);
        resp.put("totalSurplus", totalSurplus);
        resp.put("foodDonated", foodDonated);
        resp.put("foodWasted", foodWasted);
        resp.put("remainingFood", remainingFood);
        resp.put("activeReserved", activeReserved);
        resp.put("unallocatedSurplus", unallocatedSurplus);
        resp.put("redistributionRate", totalSurplus > 0 ? String.format("%.1f%%", redistributionRateNum) : "N/A");
        resp.put("redistributionRateNum", Math.round(redistributionRateNum * 10.0) / 10.0);
        resp.put("surplusWastageRate", totalSurplus > 0 ? String.format("%.1f%%", surplusWastageRateNum) : "N/A");
        resp.put("surplusWastageRateNum", Math.round(surplusWastageRateNum * 10.0) / 10.0);
        resp.put("servingUtilisation", totalPrepared > 0 ? String.format("%.1f%%", servingUtilisationNum) : "N/A");
        resp.put("servingUtilisationNum", Math.round(servingUtilisationNum * 10.0) / 10.0);
        resp.put("mealCount", filteredMeals.size());
        resp.put("reportingNote", "Allocation metrics are grouped by source meal cohort to preserve lifecycle integrity.");

        JsonResponseUtil.sendJson(exchange, resp, 200);
    }

    private void handleHostelComparison(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonResponseUtil.parseQueryParams(exchange);
        String period = query.getOrDefault("period", "TODAY");
        String category = query.getOrDefault("category", "ALL");

        List<Hostel> hostels = hostelDAO.getAllHostels();
        List<MealRecord> allMeals = mealRecordDAO.getAllMealRecords();
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Hostel h : hostels) {
            if (!"ALL".equalsIgnoreCase(category) && !category.equalsIgnoreCase(h.getCategory())) {
                continue;
            }

            int prep = 0;
            int srv = 0;
            int sur = 0;
            int don = 0;
            int wst = 0;
            int res = 0;

            for (MealRecord m : allMeals) {
                if (!h.getHostelId().equalsIgnoreCase(m.getMessId())) {
                    continue;
                }
                if (!isDateInFilter(m.getMealDate(), period, today)) {
                    continue;
                }

                prep += m.getPrepared();
                srv += m.getServed();
                sur += Math.max(0, m.getPrepared() - m.getServed());

                List<Donation> dons = donationDAO.getDonationsByMealId(m.getMealId());
                for (Donation d : dons) {
                    if ("PICKED_UP".equalsIgnoreCase(d.getStatus()) || "COMPLETED".equalsIgnoreCase(d.getStatus())) {
                        don += d.getQuantity();
                    } else if ("AVAILABLE".equalsIgnoreCase(d.getStatus()) || "CLAIMED".equalsIgnoreCase(d.getStatus())) {
                        res += d.getQuantity();
                    }
                }

                List<WasteRecord> wsts = wasteRecordDAO.getWasteRecordsByMealId(m.getMealId());
                for (WasteRecord w : wsts) {
                    wst += w.getPortionsDiscarded();
                }
            }

            int rem = Math.max(0, sur - don - wst);
            int unallocated = Math.max(0, rem - res);
            double redistRate = sur > 0 ? (don * 100.0 / sur) : 0.0;
            double wasteRate = sur > 0 ? (wst * 100.0 / sur) : 0.0;

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("hostelId", h.getHostelId());
            map.put("messId", h.getHostelId());
            map.put("hostelName", h.getName());
            map.put("messName", h.getName());
            map.put("category", h.getCategory());
            map.put("categoryLabel", h.getCategoryLabel());
            map.put("prepared", prep);
            map.put("served", srv);
            map.put("surplus", sur);
            map.put("donated", don);
            map.put("wasted", wst);
            map.put("remaining", rem);
            map.put("unallocated", unallocated);
            map.put("activeReserved", res);
            map.put("redistributionRate", sur > 0 ? String.format("%.1f%%", redistRate) : "N/A");
            map.put("wastageRate", sur > 0 ? String.format("%.1f%%", wasteRate) : "N/A");
            result.add(map);
        }

        JsonResponseUtil.sendJson(exchange, result, 200);
    }

    private void handleWasteBreakdown(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonResponseUtil.parseQueryParams(exchange);
        String messId = query.get("messId");

        List<WasteRecord> records;
        if (messId != null && !messId.isEmpty() && !"ALL".equalsIgnoreCase(messId)) {
            records = wasteRecordDAO.getWasteRecords(messId);
        } else {
            records = wasteRecordDAO.getAllWasteRecords();
        }

        Map<String, int[]> reasonAgg = new LinkedHashMap<>();
        // Initialize common categories
        String[] defaultReasons = {"Overproduction", "Expired", "Quality Reject", "Spillage/Handling", "Unspecified"};
        for (String r : defaultReasons) {
            reasonAgg.put(r, new int[]{0, 0}); // [portions, count]
        }

        int totalDiscarded = 0;
        List<Map<String, Object>> recordsDto = new ArrayList<>();
        for (WasteRecord w : records) {
            int portions = w.getPortionsDiscarded();
            totalDiscarded += portions;
            String reason = w.getReason() != null ? w.getReason().trim() : "Unspecified";
            if (!reasonAgg.containsKey(reason)) {
                reasonAgg.put(reason, new int[]{0, 0});
            }
            int[] current = reasonAgg.get(reason);
            current[0] += portions;
            current[1] += 1;

            Map<String, Object> rMap = new LinkedHashMap<>();
            rMap.put("id", w.getWasteId());
            rMap.put("wasteId", w.getWasteId());
            rMap.put("mealRecordId", w.getMealRecordId());
            rMap.put("messId", w.getMessId());
            rMap.put("messName", w.getMessName());
            rMap.put("foodName", w.getFoodName());
            rMap.put("foodType", w.getFoodType());
            rMap.put("portionsDiscarded", portions);
            rMap.put("reason", reason);
            rMap.put("notes", w.getNotes());
            rMap.put("discardedAt", w.getDiscardedAt());
            recordsDto.add(rMap);
        }

        List<Map<String, Object>> reasonsList = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : reasonAgg.entrySet()) {
            int portions = entry.getValue()[0];
            int count = entry.getValue()[1];
            double pct = totalDiscarded > 0 ? (portions * 100.0 / totalDiscarded) : 0.0;
            Map<String, Object> rMap = new LinkedHashMap<>();
            rMap.put("reason", entry.getKey());
            rMap.put("portions", portions);
            rMap.put("count", count);
            rMap.put("percentage", String.format("%.1f%%", pct));
            reasonsList.add(rMap);
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("totalDiscarded", totalDiscarded);
        resp.put("reasons", reasonsList);
        resp.put("records", recordsDto);

        JsonResponseUtil.sendJson(exchange, resp, 200);
    }

    private void handleUsers(HttpExchange exchange) throws Exception {
        List<User> users = userDAO.getAllUsers();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getUserId());
            map.put("userId", u.getUserId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("assignedMessId", u.getAssignedMessId());
            map.put("assignedMessName", u.getAssignedMessName() != null ? u.getAssignedMessName() : (u.getAssignedMessId() == null ? "Unassigned (Legacy Demo)" : null));
            map.put("isDemo", u.getAssignedMessId() == null && "MESS".equalsIgnoreCase(u.getRole()));
            map.put("organization", u.getOrganization());
            map.put("department", u.getDepartment());
            map.put("location", u.getLocation());
            map.put("foodPreference", u.getFoodPreference());
            result.add(map);
        }
        JsonResponseUtil.sendJson(exchange, result, 200);
    }

    private void handleRegistrationRequests(HttpExchange exchange) throws Exception {
        // Pending registration requests preview
        JsonResponseUtil.sendJson(exchange, Collections.emptyList(), 200);
    }

    private boolean isDateInFilter(String dateStr, String period, LocalDate today) {
        if (dateStr == null || dateStr.isEmpty()) return false;
        try {
            LocalDate d = LocalDate.parse(dateStr.substring(0, 10));
            if ("TODAY".equalsIgnoreCase(period)) {
                return d.equals(today);
            }
            if ("WEEK".equalsIgnoreCase(period)) {
                long days = ChronoUnit.DAYS.between(d, today);
                return days >= 0 && days <= 7;
            }
            if ("MONTH".equalsIgnoreCase(period)) {
                long days = ChronoUnit.DAYS.between(d, today);
                return days >= 0 && days <= 30;
            }
            return true; // "ALL"
        } catch (Exception e) {
            return true;
        }
    }
}
