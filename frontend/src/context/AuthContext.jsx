import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { storage } from '../services/storage';
import { USER_ROLES, DEMO_ACCOUNTS } from '../data/demoAccounts';
import { CHITKARA_CAMPUS_DIRECTORY } from '../data/hostels';

const AuthContext = createContext(null);

const STORAGE_KEY_ACTIVE_HOSTEL = 'foodloop_active_hostel';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return storage.get(storage.keys.CURRENT_USER, null);
  });

  const [activeHostel, setActiveHostelState] = useState(() => {
    return storage.get(STORAGE_KEY_ACTIVE_HOSTEL, CHITKARA_CAMPUS_DIRECTORY[0]);
  });

  const setActiveHostel = (hostel) => {
    setActiveHostelState(hostel);
    storage.set(STORAGE_KEY_ACTIVE_HOSTEL, hostel);
  };

  /**
   * Manual email/password login
   */
  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setUser(res.user);
      storage.set(storage.keys.CURRENT_USER, res.user);
    }
    return res;
  };

  /**
   * 1-Click Demo login by role (MESS, NGO, ADMIN)
   */
  const loginDemo = async (role) => {
    // Clear any previous role session first
    storage.remove(storage.keys.CURRENT_USER);
    const res = await authService.loginDemo(role);
    if (res.success) {
      setUser(res.user);
      storage.set(storage.keys.CURRENT_USER, res.user);
    }
    return res;
  };

  /**
   * Logout and clear demo session
   */
  const logout = () => {
    setUser(null);
    storage.remove(storage.keys.CURRENT_USER);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated,
        activeHostel,
        setActiveHostel,
        login,
        loginDemo,
        logout,
        demoAccounts: DEMO_ACCOUNTS,
        USER_ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
