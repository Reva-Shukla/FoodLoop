import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [donor, setDonor] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('foodloop_token'));
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage or fetch fresh profile on reload
  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('foodloop_token');
      const savedDonor = localStorage.getItem('foodloop_donor');

      if (savedToken && savedDonor) {
        try {
          setDonor(JSON.parse(savedDonor));
          // Refresh profile in background
          const res = await api.donor.getProfile();
          if (res?.data) {
            setDonor(res.data);
            localStorage.setItem('foodloop_donor', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    const { token: newToken, donor: donorProfile } = res.data;
    
    setToken(newToken);
    setDonor(donorProfile);
    localStorage.setItem('foodloop_token', newToken);
    localStorage.setItem('foodloop_donor', JSON.stringify(donorProfile));
    return res;
  };

  const register = async (donorData) => {
    return await api.auth.register(donorData);
  };

  const logout = async () => {
    try {
      if (token) await api.auth.logout();
    } catch (e) {
      // Ignored
    } finally {
      setToken(null);
      setDonor(null);
      localStorage.removeItem('foodloop_token');
      localStorage.removeItem('foodloop_donor');
    }
  };

  const updateDonorState = (updatedProfile) => {
    setDonor(updatedProfile);
    localStorage.setItem('foodloop_donor', JSON.stringify(updatedProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        donor,
        token,
        isAuthenticated: !!donor && !!token,
        loading,
        login,
        register,
        logout,
        updateDonorState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
