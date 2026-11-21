import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { foodLoopService } from '../services/foodLoopService';
import { CHITKARA_CAMPUS_DIRECTORY } from '../data/hostels';

const FoodLoopContext = createContext(null);

export const FoodLoopProvider = ({ children }) => {
  const [donations, setDonations] = useState([]);
  const [mealRecords, setMealRecords] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [claims, setClaims] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [hostels] = useState(CHITKARA_CAMPUS_DIRECTORY);
  const [loading, setLoading] = useState(true);

  // Load all shared records from the central service
  const refreshData = useCallback(async () => {
    try {
      const [donationsData, mealsData, wasteData, claimsData, pickupsData] = await Promise.all([
        foodLoopService.getDonations(),
        foodLoopService.getMealRecords(),
        foodLoopService.getWasteRecords(),
        foodLoopService.getClaims(),
        foodLoopService.getPickups(),
      ]);
      setDonations(donationsData);
      setMealRecords(mealsData);
      setWasteRecords(wasteData);
      setClaims(claimsData);
      setPickups(pickupsData);
    } catch (err) {
      console.error('Failed to load FoodLoop data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Log a new meal record
  const logMealRecord = async (record) => {
    const created = await foodLoopService.logMealRecord(record);
    setMealRecords((prev) => [created, ...prev]);
    return created;
  };

  // Create a new surplus donation batch
  const createDonation = async (newDonation) => {
    const created = await foodLoopService.createDonation(newDonation);
    setDonations((prev) => [created, ...prev]);
    return created;
  };

  // Record actual discarded surplus waste
  const createWasteRecord = async (newWaste) => {
    const created = await foodLoopService.createWasteRecord(newWaste);
    setWasteRecords((prev) => [created, ...prev]);
    return created;
  };

  // NGO claim action
  const claimDonation = async (donationId, ngoInfo) => {
    const result = await foodLoopService.claimDonation(donationId, ngoInfo);
    // Refresh all related shared records
    await refreshData();
    return result;
  };

  // Complete collection pickup
  const completePickup = async (identifier, ngoId = null) => {
    const result = await foodLoopService.completePickup(identifier, ngoId);
    // Refresh all related shared records
    await refreshData();
    return result;
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
