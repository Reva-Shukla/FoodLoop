/**
 * Central FoodLoop Data Service â€” Phase 7D Java API Integration
 *
 * Replaces client-side LocalStorage mutations with live HTTP REST API calls
 * to the Java backend via apiClient:
 * - /api/hostels
 * - /api/meals & /api/meals/{id}/allocations
 * - /api/donations & /api/donations/available & /api/donations/recommended & /api/donations/{id}/claim
 * - /api/claims
 * - /api/pickups & /api/pickups/{id}/complete
 * - /api/waste
 *
 * Preserves mathematical conservation laws and PORTION-based measurement.
 * Never silently falls back to LocalStorage upon database connectivity failures.
 */

import { apiClient, ApiError } from './apiClient';
import { CHITKARA_CAMPUS_DIRECTORY } from '../data/hostels';

export const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const foodLoopService = {
  /**
   * 1. Campus Hostels (GET /api/hostels)
   */
  getHostels: async () => {
    try {
      const data = await apiClient.get('/hostels');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('GET /api/hostels fetch warning, using campus directory:', err.message);
    }
    return CHITKARA_CAMPUS_DIRECTORY;
  },

  /**
   * 2. Meal Records (GET /api/meals)
   */
  getMealRecords: async (messId = null) => {
    const query = messId && messId !== 'ALL' ? `?messId=${encodeURIComponent(messId)}` : '';
    const records = await apiClient.get(`/meals${query}`);
    return Array.isArray(records) ? records : [];
  },

  /**
   * 3. Single Meal Record (GET /api/meals/{id})
   */
  getMealRecordById: async (id) => {
    return apiClient.get(`/meals/${id}`);
  },

  /**
   * 4. Log Meal Record (POST /api/meals)
   */
  logMealRecord: async (recordData) => {
    const payload = {
      messId: recordData.messId,
      mealType: recordData.mealType || 'Lunch',
      foodName: recordData.foodName?.trim(),
      foodType: recordData.foodType || 'VEG',
      preparedPortions: parseInt(recordData.preparedPortions, 10),
      servedPortions: parseInt(recordData.servedPortions, 10),
      date: recordData.date || recordData.mealDate || getTodayDateString(),
    };

    return apiClient.post('/meals', payload);
  },

  /**
   * 5. Batch Allocations (GET /api/meals/{id}/allocations)
   */
  getMealAllocations: async (mealRecordId) => {
    return apiClient.get(`/meals/${mealRecordId}/allocations`);
  },

  /**
   * 6. Donations List (GET /api/donations)
   */
  getDonations: async (messId = null) => {
    const query = messId && messId !== 'ALL' ? `?messId=${encodeURIComponent(messId)}` : '';
    const donations = await apiClient.get(`/donations${query}`);
    return Array.isArray(donations) ? donations : [];
  },

  /**
   * 7. Single Donation (GET /api/donations/{id})
   */
  getDonationById: async (id) => {
    return apiClient.get(`/donations/${id}`);
  },

  /**
   * 8. Available Donations for NGO Discovery (GET /api/donations/available)
   */
  getAvailableDonations: async () => {
    const list = await apiClient.get('/donations/available');
    return Array.isArray(list) ? list : [];
  },

  /**
   * 9. Smart Recommendations for NGO (GET /api/donations/recommended)
   */
  getRecommendedDonations: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.dietary) params.append('dietary', options.dietary);
    if (options.capacity) params.append('capacity', options.capacity);
    if (options.urgent) params.append('urgent', 'true');

    const qs = params.toString() ? `?${params.toString()}` : '';
    const list = await apiClient.get(`/donations/recommended${qs}`);
    return Array.isArray(list) ? list : [];
  },

  /**
   * 10. Publish Surplus Donation (POST /api/donations)
   */
  createDonation: async (donationData) => {
    const payload = {
      mealRecordId: parseInt(donationData.mealRecordId, 10) || 0,
      messId: donationData.messId,
      foodName: donationData.foodName?.trim(),
      foodType: donationData.foodType || 'VEG',
      portions: parseInt(donationData.portions, 10),
      preparationDateTime: donationData.preparationDateTime,
      pickupDeadline: donationData.pickupDeadline,
      storageConditions: donationData.storageConditions,
      allergens: donationData.allergens || 'None declared',
      pickupLocation: donationData.pickupLocation,
      unservedSurplusConfirmed: Boolean(donationData.unservedSurplusConfirmed),
    };

    return apiClient.post('/donations', payload);
  },

  /**
   * 11. Claim Donation (POST /api/donations/{id}/claim)
   */
  claimDonation: async (donationId, ngoInfo = null) => {
    return apiClient.post(`/donations/${donationId}/claim`, {
      notes: ngoInfo?.notes || '',
    });
  },

  /**
   * 12. Claims Directory (GET /api/claims)
   */
  getClaims: async (ngoId = null) => {
    const query = ngoId ? `?ngoId=${encodeURIComponent(ngoId)}` : '';
    const claims = await apiClient.get(`/claims${query}`);
    return Array.isArray(claims) ? claims : [];
  },

  getMyClaims: async (ngoId) => {
    return foodLoopService.getClaims(ngoId);
  },

  /**
   * 13. Pickups Directory (GET /api/pickups)
   */
  getPickups: async (ngoId = null) => {
    const query = ngoId ? `?ngoId=${encodeURIComponent(ngoId)}` : '';
    const pickups = await apiClient.get(`/pickups${query}`);
    return Array.isArray(pickups) ? pickups : [];
  },

  getMyPickups: async (ngoId) => {
    return foodLoopService.getPickups(ngoId);
  },

  /**
   * 14. Complete Handover Pickup (POST /api/pickups/{id}/complete)
   */
  completePickup: async (identifier, ngoId = null) => {
    const pickupId = typeof identifier === 'object' ? identifier.id || identifier.pickupId : identifier;
    return apiClient.post(`/pickups/${pickupId}/complete`, { ngoId });
  },

  /**
   * 15. Waste Discards (GET /api/waste)
   */
  getWasteRecords: async (messId = null) => {
    const query = messId && messId !== 'ALL' ? `?messId=${encodeURIComponent(messId)}` : '';
    const records = await apiClient.get(`/waste${query}`);
    return Array.isArray(records) ? records : [];
  },

  /**
   * 16. Record Waste (POST /api/waste)
   */
  createWasteRecord: async (wasteData) => {
    const payload = {
      mealRecordId: parseInt(wasteData.mealRecordId, 10) || 0,
      messId: wasteData.messId,
      foodName: wasteData.foodName?.trim(),
      foodType: wasteData.foodType || 'VEG',
      portionsDiscarded: parseInt(wasteData.portionsDiscarded, 10),
      reason: wasteData.reason || 'Overproduction',
      notes: wasteData.notes || '',
    };

    return apiClient.post('/waste', payload);
  },

  /**
   * 17. Mess Summary Metrics
   */
  getMessSummary: async (messId, timeFilter = 'TODAY') => {
    const [meals, donations, waste] = await Promise.all([
      foodLoopService.getMealRecords(messId),
      foodLoopService.getDonations(messId),
      foodLoopService.getWasteRecords(messId),
    ]);

    let preparedPortions = 0;
    let servedPortions = 0;
    let surplusPortions = 0;

    for (const m of meals) {
      const p = m.preparedPortions || m.prepared || 0;
      const s = m.servedPortions || m.served || 0;
      preparedPortions += p;
      servedPortions += s;
      surplusPortions += Math.max(0, p - s);
    }

    let donatedPortions = 0;
    let activeReserved = 0;
    for (const d of donations) {
      const qty = parseInt(d.portions || d.quantity, 10) || 0;
      if (d.status === 'PICKED_UP' || d.status === 'COMPLETED') {
        donatedPortions += qty;
      } else if (d.status === 'AVAILABLE' || d.status === 'CLAIMED') {
        activeReserved += qty;
      }
    }

    let wastedPortions = 0;
    for (const w of waste) {
      wastedPortions += parseInt(w.portionsDiscarded, 10) || 0;
    }

    const remainingPortions = Math.max(0, surplusPortions - donatedPortions - wastedPortions);
    const unallocatedSurplus = Math.max(0, remainingPortions - activeReserved);

    return {
      preparedPortions,
      servedPortions,
      surplusPortions,
      donatedPortions,
      activeReserved,
      wastedPortions,
      remainingPortions,
      unallocatedSurplus,
      mealBatchesCount: meals.length,
      activeDonationsCount: donations.filter((d) => d.status === 'AVAILABLE').length,
    };
  },

  /**
   * 18. NGO Summary Metrics
   */
  getNgoSummary: async (ngoId) => {
    const [claims, pickups, availableDonations] = await Promise.all([
      foodLoopService.getClaims(ngoId),
      foodLoopService.getPickups(ngoId),
      foodLoopService.getAvailableDonations(),
    ]);

    const activeClaims = claims.filter((c) => c.status === 'ACTIVE');

    const scheduledPickups = pickups.filter(
      (p) => p.status === 'SCHEDULED'
    );

    const completedPickups = pickups.filter(
      (p) => p.status === 'COMPLETED'
    );

    const portionsCollected = completedPickups.reduce(
      (total, p) => total + (parseInt(p.portions ?? p.quantity, 10) || 0),
      0
    );

    const upcomingPickups = [...scheduledPickups]
      .sort(
        (a, b) =>
          new Date(a.pickupDeadline).getTime() -
          new Date(b.pickupDeadline).getTime()
      )
      .slice(0, 5);

    return {
      availableDonationsCount: availableDonations.length,
      activeClaimsCount: activeClaims.length,
      scheduledPickupsCount: scheduledPickups.length,
      portionsCollected,
      upcomingPickups,
      recentClaims: claims.slice(0, 5),
      recentCompletedPickups: completedPickups.slice(0, 5),
    };
  },
  refreshExpiredDonations: async () => {
    // Backend DonationExpiryMonitor runs continuously on the server
    return true;
  },
};
