/**
 * Client-Side Storage Service
 * Provides localStorage persistence with fallback in-memory cache for demo environment.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'foodloop_current_user',
  ACTIVE_HOSTEL: 'foodloop_active_hostel',
  DONATIONS: 'foodloop_donations_v1',
  MEAL_RECORDS: 'foodloop_meal_records_v1',
  WASTE_RECORDS: 'foodloop_waste_records_v1',
  CLAIMS: 'foodloop_claims_v1',
  PICKUPS: 'foodloop_pickups_v1',
  ACTIVITY_LOGS: 'foodloop_activity_logs_v1',
};

const memoryStore = {};

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return memoryStore[key] ?? defaultValue;
    }
  },

  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      memoryStore[key] = value;
    }
  },

  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  },

  keys: STORAGE_KEYS,
};
