/**
 * Central FoodLoop Data Service
 * 
 * Architectural Role:
 * - Single source of truth for all three portals (Mess Manager, NGO, Campus Supervisor).
 * - Standardized entirely on PORTIONS (no kilograms).
 * - Global Dietary standard: strictly 'VEG' and 'NON_VEG' (Jain & Vegan normalized).
 * - Enforces meal-batch level allocations:
 *     Surplus = Prepared - Served
 *     Donated = Portions from completed pickups only (PICKED_UP / COMPLETED)
 *     Wasted = Actual recorded discarded surplus
 *     Remaining = Surplus - Donated - Wasted
 *     Active Reservations = Portions in AVAILABLE or CLAIMED status
 *     Unallocated Surplus = Remaining - Active Reservations
 * - Manages connected redistribution lifecycle:
 *     Donation: AVAILABLE -> CLAIMED -> PICKED_UP (or EXPIRED)
 *     Pickup: SCHEDULED -> COMPLETED (or MISSED)
 * - Persisted via localStorage with seed data initialized once.
 */

import { CHITKARA_CAMPUS_DIRECTORY } from '../data/hostels';
import { storage } from './storage';

// Helper to format ISO date string to YYYY-MM-DD
export const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Initial Seed Data in PORTIONS (seeded once, user records never wiped)
const INITIAL_MEAL_RECORDS = [
  {
    id: 'meal-seed-001',
    messId: 'mess-b-franklin',
    messName: 'Franklin Mess',
    date: getTodayDateString(),
    mealType: 'Lunch',
    foodName: 'Dal Makhani & Steamed Basmati Rice',
    foodType: 'VEG',
    preparedPortions: 150,
    servedPortions: 110,
    surplusPortions: 40,
    loggedBy: 'Vikram Singh',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'meal-seed-002',
    messId: 'mess-b-franklin',
    messName: 'Franklin Mess',
    date: getTodayDateString(),
    mealType: 'Breakfast',
    foodName: 'Aloo Paratha & Curd',
    foodType: 'VEG',
    preparedPortions: 180,
    servedPortions: 165,
    surplusPortions: 15,
    loggedBy: 'Vikram Singh',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'meal-seed-003',
    messId: 'mess-g-pi',
    messName: 'Pi Mess',
    date: getTodayDateString(),
    mealType: 'Lunch',
    foodName: 'Mixed Vegetable Pulao & Raita',
    foodType: 'VEG',
    preparedPortions: 140,
    servedPortions: 115,
    surplusPortions: 25,
    loggedBy: 'Sunita Verma',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_DONATIONS = [
  {
    id: 'don-seed-001',
    mealRecordId: 'meal-seed-001',
    messId: 'mess-b-franklin',
    messName: 'Franklin Mess',
    foodName: 'Dal Makhani & Steamed Basmati Rice',
    foodType: 'VEG',
    portions: 20,
    preparationDateTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    pickupDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    storageConditions: 'Heated insulated container',
    allergens: 'Dairy (Butter, Cream)',
    pickupLocation: 'Franklin Mess Kitchen Dispatch Gate 1',
    unservedSurplusConfirmed: true,
    status: 'AVAILABLE', // AVAILABLE | CLAIMED | PICKED_UP | EXPIRED
    claimedByNGO: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'don-seed-002',
    mealRecordId: 'meal-seed-003',
    messId: 'mess-g-pi',
    messName: 'Pi Mess',
    foodName: 'Mixed Vegetable Pulao & Raita',
    foodType: 'VEG',
    portions: 15,
    preparationDateTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    pickupDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    storageConditions: 'Covered temperature-controlled chafing dish',
    allergens: 'Dairy (Curd/Raita)',
    pickupLocation: 'Pi Hostel Girls Gate Dispatch Counter',
    unservedSurplusConfirmed: true,
    status: 'CLAIMED',
    claimedByNGO: {
      id: 'user-ngo-01',
      name: 'Regional Relief Coordinator',
      claimedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_CLAIMS = [
  {
    id: 'claim-seed-001',
    donationId: 'don-seed-002',
    ngoId: 'user-ngo-01',
    ngoName: 'Regional Relief Coordinator',
    messId: 'mess-g-pi',
    messName: 'Pi Mess',
    foodName: 'Mixed Vegetable Pulao & Raita',
    foodType: 'VEG',
    portions: 15,
    claimedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    pickupDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    pickupLocation: 'Pi Hostel Girls Gate Dispatch Counter',
    status: 'ACTIVE', // ACTIVE | COMPLETED | EXPIRED
  },
];

const INITIAL_PICKUPS = [
  {
    id: 'pku-seed-001',
    claimId: 'claim-seed-001',
    donationId: 'don-seed-002',
    ngoId: 'user-ngo-01',
    ngoName: 'Regional Relief Coordinator',
    messId: 'mess-g-pi',
    messName: 'Pi Mess',
    foodName: 'Mixed Vegetable Pulao & Raita',
    foodType: 'VEG',
    portions: 15,
    pickupDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    pickupLocation: 'Pi Hostel Girls Gate Dispatch Counter',
    storageConditions: 'Covered temperature-controlled chafing dish',
    allergens: 'Dairy (Curd/Raita)',
    status: 'SCHEDULED', // SCHEDULED | COMPLETED | MISSED
    scheduledAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completedAt: null,
  },
];

const INITIAL_WASTE_RECORDS = [
  {
    id: 'wst-seed-001',
    mealRecordId: 'meal-seed-002',
    messId: 'mess-b-franklin',
    messName: 'Franklin Mess',
    foodName: 'Aloo Paratha & Curd',
    foodType: 'VEG',
    portionsDiscarded: 5,
    reason: 'Unclaimed surplus',
    notes: 'Breakfast serving window closed; temperature dropped below safe holding.',
    discardedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const foodLoopService = {
  // ================= Campus Hostels =================
  getHostels: async () => {
    return CHITKARA_CAMPUS_DIRECTORY;
  },

  // ================= Meal Records =================
  getMealRecords: async (messId = null) => {
    let records = storage.get(storage.keys.MEAL_RECORDS);
    if (!records) {
      records = INITIAL_MEAL_RECORDS;
      storage.set(storage.keys.MEAL_RECORDS, records);
    }
    // Normalise any legacy dietary values to VEG / NON_VEG
    records = records.map((r) => ({
      ...r,
      foodType: r.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG',
    }));

    if (messId) {
      return records.filter((r) => r.messId === messId);
    }
    return records;
  },

  getMealRecordById: async (id) => {
    const records = await foodLoopService.getMealRecords();
    return records.find((r) => r.id === id) || null;
  },

  logMealRecord: async (recordData) => {
    const records = await foodLoopService.getMealRecords();
    const prepared = parseInt(recordData.preparedPortions, 10) || 0;
    const served = parseInt(recordData.servedPortions, 10) || 0;
    const surplus = Math.max(0, prepared - served);

    const newRecord = {
      ...recordData,
      id: `meal-${Date.now()}`,
      foodType: recordData.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG',
      preparedPortions: prepared,
      servedPortions: served,
      surplusPortions: surplus,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...records];
    storage.set(storage.keys.MEAL_RECORDS, updated);
    return newRecord;
  },

  // ================= Donations =================
  getDonations: async (messId = null) => {
    let donations = storage.get(storage.keys.DONATIONS);
    if (!donations) {
      donations = INITIAL_DONATIONS;
      storage.set(storage.keys.DONATIONS, donations);
    }

    // Automatically check and flag expired donations & normalize dietary values
    const now = new Date();
    let hasChanges = false;
    const checkedDonations = donations.map((d) => {
      let status = d.status;
      let foodType = d.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG';

      if ((status === 'AVAILABLE' || status === 'CLAIMED') && d.pickupDeadline) {
        if (new Date(d.pickupDeadline) < now) {
          hasChanges = true;
          status = 'EXPIRED';
        }
      }
      if (foodType !== d.foodType || status !== d.status) {
        hasChanges = true;
      }
      return {
        ...d,
        foodType,
        status,
      };
    });

    if (hasChanges) {
      storage.set(storage.keys.DONATIONS, checkedDonations);
      donations = checkedDonations;
    }

    if (messId) {
      return donations.filter((d) => d.messId === messId);
    }
    return donations;
  },

  getDonationById: async (id) => {
    const donations = await foodLoopService.getDonations();
    return donations.find((d) => d.id === id) || null;
  },

  createDonation: async (donationData) => {
    const donations = await foodLoopService.getDonations();
    const portions = parseInt(donationData.portions, 10) || 0;

    // Verify unallocated surplus before allowing donation
    if (donationData.mealRecordId) {
      const alloc = await foodLoopService.getMealAllocations(donationData.mealRecordId);
      if (portions > alloc.unallocatedSurplus) {
        throw new Error(
          `Donation quantity (${portions} portions) exceeds the unallocated surplus (${alloc.unallocatedSurplus} portions) of this meal.`
        );
      }
    }

    const created = {
      ...donationData,
      id: `don-${Date.now()}`,
      foodType: donationData.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG',
      portions,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };

    const updated = [created, ...donations];
    storage.set(storage.keys.DONATIONS, updated);
    return created;
  },

  // ================= Claims & Connected Redistribution =================
  getClaims: async (ngoId = null) => {
    let claims = storage.get(storage.keys.CLAIMS);
    if (!claims) {
      claims = INITIAL_CLAIMS;
      storage.set(storage.keys.CLAIMS, claims);
    }

    const now = new Date();
    let hasChanges = false;
    const checkedClaims = claims.map((c) => {
      if (c.status === 'ACTIVE' && c.pickupDeadline && new Date(c.pickupDeadline) < now) {
        hasChanges = true;
        return { ...c, status: 'EXPIRED' };
      }
      return c;
    });

    if (hasChanges) {
      storage.set(storage.keys.CLAIMS, checkedClaims);
      claims = checkedClaims;
    }

    if (ngoId) {
      return claims.filter((c) => c.ngoId === ngoId);
    }
    return claims;
  },

  getMyClaims: async (ngoId) => {
    return foodLoopService.getClaims(ngoId);
  },

  getPickups: async (ngoId = null) => {
    let pickups = storage.get(storage.keys.PICKUPS);
    if (!pickups) {
      pickups = INITIAL_PICKUPS;
      storage.set(storage.keys.PICKUPS, pickups);
    }

    const now = new Date();
    let hasChanges = false;
    const checkedPickups = pickups.map((p) => {
      if (p.status === 'SCHEDULED' && p.pickupDeadline && new Date(p.pickupDeadline) < now) {
        hasChanges = true;
        return { ...p, status: 'MISSED' };
      }
      return p;
    });

    if (hasChanges) {
      storage.set(storage.keys.PICKUPS, checkedPickups);
      pickups = checkedPickups;
    }

    if (ngoId) {
      return pickups.filter((p) => p.ngoId === ngoId);
    }
    return pickups;
  },

  getMyPickups: async (ngoId) => {
    return foodLoopService.getPickups(ngoId);
  },

  getAvailableDonations: async () => {
    await foodLoopService.refreshExpiredDonations();
    const donations = await foodLoopService.getDonations();
    const now = new Date();
    return donations.filter(
      (d) => d.status === 'AVAILABLE' && new Date(d.pickupDeadline) > now
    );
  },

  getRecommendedDonations: async (options = {}) => {
    const { dietaryPreference = 'ANY', collectionCapacity = null } = options;
    const available = await foodLoopService.getAvailableDonations();
    const now = new Date();

    // Dietary filtering (strictly VEG / NON_VEG)
    let filtered = available;
    if (dietaryPreference === 'VEG') {
      filtered = filtered.filter((d) => d.foodType === 'VEG');
    } else if (dietaryPreference === 'NON_VEG') {
      filtered = filtered.filter((d) => d.foodType === 'NON_VEG');
    }

    // Capacity filtering: include only batches that fit in full
    if (collectionCapacity && Number(collectionCapacity) > 0) {
      const capNum = Number(collectionCapacity);
      filtered = filtered.filter((d) => Number(d.portions) <= capNum);
    }

    // Sort by earliest pickup deadline
    filtered.sort((a, b) => new Date(a.pickupDeadline) - new Date(b.pickupDeadline));

    // Generate clear, transparent reason tags
    return filtered.map((d) => {
      const reasons = [];
      if (dietaryPreference !== 'ANY') {
        reasons.push(
          dietaryPreference === 'VEG'
            ? 'Matches your Veg preference'
            : 'Matches your Non-Veg preference'
        );
      }
      if (collectionCapacity && Number(collectionCapacity) > 0) {
        reasons.push(`Fits your collection capacity (${d.portions} portions)`);
      }
      const msLeft = new Date(d.pickupDeadline) - now;
      if (msLeft > 0 && msLeft <= 3 * 60 * 60 * 1000) {
        reasons.push('Collection deadline approaching');
      }
      return {
        ...d,
        recommendationReasons: reasons,
      };
    });
  },

  claimDonation: async (donationId, ngoInfo) => {
    await foodLoopService.refreshExpiredDonations();
    const donations = await foodLoopService.getDonations();
    const donation = donations.find((d) => d.id === donationId);

    if (!donation) {
      throw new Error('Donation record not found.');
    }
    if (donation.status !== 'AVAILABLE') {
      throw new Error(`This donation is already ${donation.status.toLowerCase()} and cannot be claimed.`);
    }
    if (new Date(donation.pickupDeadline) <= new Date()) {
      throw new Error('This donation pickup deadline has expired.');
    }

    if (!donation.pickupLocation || !donation.pickupDeadline) {
      throw new Error('Incomplete donation: pickup location or collection deadline missing.');
    }

    const nowISO = new Date().toISOString();
    const claimId = `claim-${Date.now()}`;
    const pickupId = `pku-${Date.now()}`;

    // Update donation status to CLAIMED
    const updatedDonations = donations.map((d) => {
      if (d.id === donationId) {
        return {
          ...d,
          status: 'CLAIMED',
          claimedByNGO: {
            id: ngoInfo.id,
            name: ngoInfo.name || 'NGO Partner',
            claimedAt: nowISO,
          },
        };
      }
      return d;
    });
    storage.set(storage.keys.DONATIONS, updatedDonations);

    // Create Claim record
    const claims = await foodLoopService.getClaims();
    const newClaim = {
      id: claimId,
      donationId,
      ngoId: ngoInfo.id,
      ngoName: ngoInfo.name || 'NGO Partner',
      messId: donation.messId,
      messName: donation.messName,
      foodName: donation.foodName,
      foodType: donation.foodType,
      portions: donation.portions,
      claimedAt: nowISO,
      pickupDeadline: donation.pickupDeadline,
      pickupLocation: donation.pickupLocation,
      status: 'ACTIVE',
    };
    storage.set(storage.keys.CLAIMS, [newClaim, ...claims]);

    // Create Pickup record
    const pickups = await foodLoopService.getPickups();
    const newPickup = {
      id: pickupId,
      claimId,
      donationId,
      ngoId: ngoInfo.id,
      ngoName: ngoInfo.name || 'NGO Partner',
      messId: donation.messId,
      messName: donation.messName,
      foodName: donation.foodName,
      foodType: donation.foodType,
      portions: donation.portions,
      pickupDeadline: donation.pickupDeadline,
      pickupLocation: donation.pickupLocation,
      storageConditions: donation.storageConditions || 'Standard safe holding',
      allergens: donation.allergens || 'None reported',
      status: 'SCHEDULED',
      scheduledAt: nowISO,
      completedAt: null,
    };
    storage.set(storage.keys.PICKUPS, [newPickup, ...pickups]);

    return {
      donation: updatedDonations.find((d) => d.id === donationId),
      claim: newClaim,
      pickup: newPickup,
    };
  },

  completePickup: async (identifier, ngoId = null) => {
    await foodLoopService.refreshExpiredDonations();
    const pickups = await foodLoopService.getPickups();
    // Allow lookup by pickup ID or donation ID
    const pickup = pickups.find((p) => p.id === identifier || p.donationId === identifier);

    if (!pickup) {
      throw new Error('Scheduled pickup record not found.');
    }
    if (ngoId && pickup.ngoId !== ngoId) {
      throw new Error('Unauthorized: This pickup belongs to another NGO partner.');
    }
    if (pickup.status === 'COMPLETED') {
      throw new Error('This collection has already been completed.');
    }
    if (pickup.status === 'MISSED' || new Date(pickup.pickupDeadline) <= new Date()) {
      throw new Error('This pickup deadline has passed and collection cannot be completed.');
    }

    const nowISO = new Date().toISOString();

    // 1. Mark Pickup COMPLETED
    const updatedPickups = pickups.map((p) => {
      if (p.id === pickup.id) {
        return {
          ...p,
          status: 'COMPLETED',
          completedAt: nowISO,
        };
      }
      return p;
    });
    storage.set(storage.keys.PICKUPS, updatedPickups);

    // 2. Mark Donation PICKED_UP
    const donations = await foodLoopService.getDonations();
    const updatedDonations = donations.map((d) => {
      if (d.id === pickup.donationId) {
        return {
          ...d,
          status: 'PICKED_UP',
          completedAt: nowISO,
        };
      }
      return d;
    });
    storage.set(storage.keys.DONATIONS, updatedDonations);

    // 3. Mark Claim COMPLETED
    const claims = await foodLoopService.getClaims();
    const updatedClaims = claims.map((c) => {
      if (c.id === pickup.claimId || c.donationId === pickup.donationId) {
        return {
          ...c,
          status: 'COMPLETED',
          completedAt: nowISO,
        };
      }
      return c;
    });
    storage.set(storage.keys.CLAIMS, updatedClaims);

    return {
      pickup: updatedPickups.find((p) => p.id === pickup.id),
      donation: updatedDonations.find((d) => d.id === pickup.donationId),
    };
  },

  getNgoSummary: async (ngoId) => {
    await foodLoopService.refreshExpiredDonations();
    const available = await foodLoopService.getAvailableDonations();
    const claims = await foodLoopService.getMyClaims(ngoId);
    const pickups = await foodLoopService.getMyPickups(ngoId);

    const now = new Date();
    const activeClaims = claims.filter(
      (c) => c.status === 'ACTIVE' && new Date(c.pickupDeadline) > now
    );
    const scheduledPickups = pickups.filter(
      (p) => p.status === 'SCHEDULED' && new Date(p.pickupDeadline) > now
    );
    const completedPickups = pickups.filter((p) => p.status === 'COMPLETED');

    const portionsCollected = completedPickups.reduce(
      (sum, p) => sum + (parseInt(p.portions, 10) || 0),
      0
    );

    return {
      availableDonationsCount: available.length,
      activeClaimsCount: activeClaims.length,
      scheduledPickupsCount: scheduledPickups.length,
      portionsCollected,
      upcomingPickups: scheduledPickups.slice(0, 5),
      recentClaims: claims.slice(0, 5),
      recentCompletedPickups: completedPickups.slice(0, 5),
    };
  },

  refreshExpiredDonations: async () => {
    const now = new Date();
    let donationsChanged = false;
    let claimsChanged = false;
    let pickupsChanged = false;

    let donations = storage.get(storage.keys.DONATIONS, INITIAL_DONATIONS);
    const updatedDonations = donations.map((d) => {
      let foodType = d.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG';
      if ((d.status === 'AVAILABLE' || d.status === 'CLAIMED') && d.pickupDeadline) {
        if (new Date(d.pickupDeadline) < now) {
          donationsChanged = true;
          return { ...d, foodType, status: 'EXPIRED' };
        }
      }
      if (d.foodType !== foodType) {
        donationsChanged = true;
        return { ...d, foodType };
      }
      return d;
    });
    if (donationsChanged) {
      storage.set(storage.keys.DONATIONS, updatedDonations);
    }

    let claims = storage.get(storage.keys.CLAIMS, INITIAL_CLAIMS);
    const updatedClaims = claims.map((c) => {
      if (c.status === 'ACTIVE' && c.pickupDeadline && new Date(c.pickupDeadline) < now) {
        claimsChanged = true;
        return { ...c, status: 'EXPIRED' };
      }
      return c;
    });
    if (claimsChanged) {
      storage.set(storage.keys.CLAIMS, updatedClaims);
    }

    let pickups = storage.get(storage.keys.PICKUPS, INITIAL_PICKUPS);
    const updatedPickups = pickups.map((p) => {
      if (p.status === 'SCHEDULED' && p.pickupDeadline && new Date(p.pickupDeadline) < now) {
        pickupsChanged = true;
        return { ...p, status: 'MISSED' };
      }
      return p;
    });
    if (pickupsChanged) {
      storage.set(storage.keys.PICKUPS, updatedPickups);
    }
  },

  // ================= Waste Records =================
  getWasteRecords: async (messId = null) => {
    let waste = storage.get(storage.keys.WASTE_RECORDS);
    if (!waste) {
      waste = INITIAL_WASTE_RECORDS;
      storage.set(storage.keys.WASTE_RECORDS, waste);
    }
    waste = waste.map((w) => ({
      ...w,
      foodType: w.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG',
    }));

    if (messId) {
      return waste.filter((w) => w.messId === messId);
    }
    return waste;
  },

  createWasteRecord: async (wasteData) => {
    const wasteList = await foodLoopService.getWasteRecords();
    const portions = parseInt(wasteData.portionsDiscarded, 10) || 0;

    // Verify portions against unallocated undiscarded surplus
    if (wasteData.mealRecordId) {
      const alloc = await foodLoopService.getMealAllocations(wasteData.mealRecordId);
      // Waste cannot exceed remaining minus active reserved (cannot discard food actively reserved for donation)
      if (portions > alloc.unallocatedSurplus) {
        throw new Error(
          `Discard quantity (${portions} portions) exceeds available unallocated surplus (${alloc.unallocatedSurplus} portions). Active donation reservations cannot be discarded.`
        );
      }
    }

    const created = {
      ...wasteData,
      id: `wst-${Date.now()}`,
      foodType: wasteData.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG',
      portionsDiscarded: portions,
      discardedAt: wasteData.discardedAt || new Date().toISOString(),
    };

    const updated = [created, ...wasteList];
    storage.set(storage.keys.WASTE_RECORDS, updated);
    return created;
  },

  // ================= Core Batch-Level Allocation Calculation =================
  getMealAllocations: async (mealRecordId) => {
    await foodLoopService.refreshExpiredDonations();
    const meal = await foodLoopService.getMealRecordById(mealRecordId);
    if (!meal) {
      return {
        surplus: 0,
        donatedPortions: 0,
        activeReserved: 0,
        wastedPortions: 0,
        remainingPortions: 0,
        unallocatedSurplus: 0,
        donations: [],
        wasteRecords: [],
      };
    }

    const allDonations = await foodLoopService.getDonations();
    const allWaste = await foodLoopService.getWasteRecords();

    const mealDonations = allDonations.filter((d) => d.mealRecordId === mealRecordId);
    const mealWaste = allWaste.filter((w) => w.mealRecordId === mealRecordId);

    const surplus = Math.max(0, (meal.preparedPortions || 0) - (meal.servedPortions || 0));

    // Donated = completed pickups only
    const donatedPortions = mealDonations
      .filter((d) => d.status === 'PICKED_UP' || d.status === 'COMPLETED')
      .reduce((sum, d) => sum + (parseInt(d.portions, 10) || 0), 0);

    // Active reserved = AVAILABLE or CLAIMED
    const activeReserved = mealDonations
      .filter((d) => d.status === 'AVAILABLE' || d.status === 'CLAIMED')
      .reduce((sum, d) => sum + (parseInt(d.portions, 10) || 0), 0);

    // Wasted = recorded discarded portions
    const wastedPortions = mealWaste.reduce(
      (sum, w) => sum + (parseInt(w.portionsDiscarded, 10) || 0),
      0
    );

    // Remaining = Surplus - Donated - Wasted
    const remainingPortions = Math.max(0, surplus - donatedPortions - wastedPortions);

    // Unallocated = Remaining - Active Reservations
    const unallocatedSurplus = Math.max(0, remainingPortions - activeReserved);

    return {
      meal,
      surplus,
      donatedPortions,
      activeReserved,
      wastedPortions,
      remainingPortions,
      unallocatedSurplus,
      donations: mealDonations,
      wasteRecords: mealWaste,
    };
  },

  // ================= Mess Dynamic Overview Metrics =================
  getMessSummary: async (messId, timeFilter = 'TODAY') => {
    await foodLoopService.refreshExpiredDonations();
    const meals = await foodLoopService.getMealRecords(messId);
    const donations = await foodLoopService.getDonations(messId);
    const waste = await foodLoopService.getWasteRecords(messId);

    const now = new Date();
    const todayStr = getTodayDateString();

    const isDateInRange = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (timeFilter === 'TODAY') {
        return dateStr.startsWith(todayStr);
      }
      if (timeFilter === 'WEEK') {
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (timeFilter === 'MONTH') {
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      return true;
    };

    const filteredMeals = meals.filter((m) => isDateInRange(m.date || m.createdAt));
    const filteredDonations = donations.filter((d) => isDateInRange(d.createdAt));
    const filteredWaste = waste.filter((w) => isDateInRange(w.discardedAt));

    const totalPrepared = filteredMeals.reduce((acc, m) => acc + (m.preparedPortions || 0), 0);
    const totalServed = filteredMeals.reduce((acc, m) => acc + (m.servedPortions || 0), 0);
    const totalSurplus = Math.max(0, totalPrepared - totalServed);

    // Completed pickups only
    const foodDonated = filteredDonations
      .filter((d) => d.status === 'PICKED_UP' || d.status === 'COMPLETED')
      .reduce((acc, d) => acc + (parseInt(d.portions, 10) || 0), 0);

    // Active reservations
    const activeReserved = filteredDonations
      .filter((d) => d.status === 'AVAILABLE' || d.status === 'CLAIMED')
      .reduce((acc, d) => acc + (parseInt(d.portions, 10) || 0), 0);

    // Actual discarded food
    const foodWasted = filteredWaste.reduce(
      (acc, w) => acc + (parseInt(w.portionsDiscarded, 10) || 0),
      0
    );

    // Remaining food = Total Surplus - Donated - Wasted
    const remainingFood = Math.max(0, totalSurplus - foodDonated - foodWasted);

    // Unallocated = Remaining - Active Reservations
    const unallocatedSurplus = Math.max(0, remainingFood - activeReserved);

    return {
      totalPrepared,
      totalServed,
      totalSurplus,
      foodDonated,
      foodWasted,
      remainingFood,
      activeReserved,
      unallocatedSurplus,
      mealCount: filteredMeals.length,
      donationCount: filteredDonations.length,
      wasteCount: filteredWaste.length,
      recentMeals: filteredMeals.slice(0, 5),
      recentDonations: filteredDonations.slice(0, 5),
    };
  },
};
