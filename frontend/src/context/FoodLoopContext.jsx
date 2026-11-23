import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { foodLoopService } from '../services/foodLoopService';
import { useAuth } from './AuthContext';
import { CHITKARA_CAMPUS_DIRECTORY } from '../data/hostels';

const FoodLoopContext = createContext(null);

export const FoodLoopProvider = ({ children }) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [mealRecords, setMealRecords] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [claims, setClaims] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [hostels, setHostels] = useState(CHITKARA_CAMPUS_DIRECTORY);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // Role-aware data loader: queries only permitted endpoints per role
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const role = user?.role;

      // Hostels directory is public for all
      const hostelsPromise = foodLoopService.getHostels().catch(() => CHITKARA_CAMPUS_DIRECTORY);

      if (!user) {
        // Logged-out state: reset private states to avoid data leakage across sessions
        const hostelsData = await hostelsPromise;
        if (Array.isArray(hostelsData)) setHostels(hostelsData);
        setDonations([]);
        setMealRecords([]);
        setWasteRecords([]);
        setClaims([]);
        setPickups([]);
        setDbError(null);
        return;
      }

      // Permitted requests by role:
      // - MESS: donations, meals, waste
      // - NGO: donations, meals, waste, claims (own), pickups (own)
      // - ADMIN: all endpoints (donations, meals, waste, claims, pickups)
      const fetchDonations = foodLoopService.getDonations();
      const fetchMeals = foodLoopService.getMealRecords();
      const fetchWaste = foodLoopService.getWasteRecords();

      const fetchClaims = (role === 'NGO' || role === 'ADMIN')
        ? foodLoopService.getClaims()
        : Promise.resolve([]);

      const fetchPickups = (role === 'NGO' || role === 'ADMIN')
        ? foodLoopService.getPickups()
        : Promise.resolve([]);

      const [hostelsRes, donationsRes, mealsRes, wasteRes, claimsRes, pickupsRes] =
        await Promise.allSettled([
          hostelsPromise,
          fetchDonations,
          fetchMeals,
          fetchWaste,
          fetchClaims,
          fetchPickups,
        ]);

      let criticalError = null;

      if (hostelsRes.status === 'fulfilled' && Array.isArray(hostelsRes.value)) {
        setHostels(hostelsRes.value);
      }

      if (donationsRes.status === 'fulfilled') {
        setDonations(Array.isArray(donationsRes.value) ? donationsRes.value : []);
      } else if (donationsRes.reason?.isDatabaseError || donationsRes.reason?.status === 500) {
        criticalError = donationsRes.reason.message;
      }

      if (mealsRes.status === 'fulfilled') {
        setMealRecords(Array.isArray(mealsRes.value) ? mealsRes.value : []);
      } else if (mealsRes.reason?.isDatabaseError || mealsRes.reason?.status === 500) {
        criticalError = mealsRes.reason.message;
      }

      if (wasteRes.status === 'fulfilled') {
        setWasteRecords(Array.isArray(wasteRes.value) ? wasteRes.value : []);
      } else if (wasteRes.reason?.isDatabaseError || wasteRes.reason?.status === 500) {
        criticalError = wasteRes.reason.message;
      }

      if (claimsRes.status === 'fulfilled') {
        setClaims(Array.isArray(claimsRes.value) ? claimsRes.value : []);
      } else if (claimsRes.reason?.isDatabaseError || claimsRes.reason?.status === 500) {
        criticalError = claimsRes.reason.message;
      }

      if (pickupsRes.status === 'fulfilled') {
        setPickups(Array.isArray(pickupsRes.value) ? pickupsRes.value : []);
      } else if (pickupsRes.reason?.isDatabaseError || pickupsRes.reason?.status === 500) {
        criticalError = pickupsRes.reason.message;
      }

      setDbError(criticalError);
    } catch (err) {
      console.warn('FoodLoop data refresh notice:', err.message);
      if (err.isDatabaseError || err.isNetworkError || err.status === 500) {
        setDbError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const clearDbError = () => setDbError(null);

  // Log a new meal record via POST /api/meals
  const logMealRecord = async (record) => {
    try {
      const created = await foodLoopService.logMealRecord(record);
      setMealRecords((prev) => [created, ...prev]);
      await refreshData();
      return created;
    } catch (err) {
      if (err.isDatabaseError) setDbError(err.message);
      throw err;
    }
  };

  // Create a new surplus donation batch via POST /api/donations
  const createDonation = async (newDonation) => {
    try {
      const created = await foodLoopService.createDonation(newDonation);
      setDonations((prev) => [created, ...prev]);
      await refreshData();
      return created;
    } catch (err) {
      if (err.isDatabaseError) setDbError(err.message);
      throw err;
    }
  };

  // Record actual discarded surplus waste via POST /api/waste
  const createWasteRecord = async (newWaste) => {
    try {
      const created = await foodLoopService.createWasteRecord(newWaste);
      setWasteRecords((prev) => [created, ...prev]);
      await refreshData();
      return created;
    } catch (err) {
      if (err.isDatabaseError) setDbError(err.message);
      throw err;
    }
  };

  // NGO claim action via POST /api/donations/{id}/claim
  const claimDonation = async (donationId, ngoInfo) => {
    try {
      const result = await foodLoopService.claimDonation(donationId, ngoInfo);
      await refreshData();
      return result;
    } catch (err) {
      if (err.isDatabaseError) setDbError(err.message);
      throw err;
    }
  };

  // Complete collection pickup via POST /api/pickups/{id}/complete
  const completePickup = async (identifier, ngoId = null) => {
    try {
      const result = await foodLoopService.completePickup(identifier, ngoId);
      await refreshData();
      return result;
    } catch (err) {
      if (err.isDatabaseError) setDbError(err.message);
      throw err;
    }
  };

  // Helper to get allocation breakdown for a specific meal
  const getMealAllocations = async (mealRecordId) => {
    return foodLoopService.getMealAllocations(mealRecordId);
  };

  // Helper to get dynamic overview metrics for a mess
  const getMessSummary = async (messId, timeFilter) => {
    return foodLoopService.getMessSummary(messId, timeFilter);
  };

  // Helper to get dynamic overview metrics for an NGO
  const getNgoSummary = async (ngoId) => {
    return foodLoopService.getNgoSummary(ngoId);
  };

  // Helper for available food discovery
  const getAvailableDonations = async () => {
    return foodLoopService.getAvailableDonations();
  };

  // Helper for smart recommendations
  const getRecommendedDonations = async (options) => {
    return foodLoopService.getRecommendedDonations(options);
  };

  // Helper for my claims
  const getMyClaims = async (ngoId) => {
    return foodLoopService.getMyClaims(ngoId);
  };

  // Helper for my pickups
  const getMyPickups = async (ngoId) => {
    return foodLoopService.getMyPickups(ngoId);
  };

  return (
    <FoodLoopContext.Provider
      value={{
        donations,
        mealRecords,
        wasteRecords,
        claims,
        pickups,
        hostels,
        loading,
        dbError,
        isDatabaseConnected: !dbError,
        clearDbError,
        logMealRecord,
        createDonation,
        createWasteRecord,
        claimDonation,
        completePickup,
        getMealAllocations,
        getMessSummary,
        getNgoSummary,
        getAvailableDonations,
        getRecommendedDonations,
        getMyClaims,
        getMyPickups,
        refreshData,
      }}
    >
      {children}
    </FoodLoopContext.Provider>
  );
};

export const useFoodLoop = () => {
  const context = useContext(FoodLoopContext);
  if (!context) {
    throw new Error('useFoodLoop must be used within a FoodLoopProvider');
  }
  return context;
};
