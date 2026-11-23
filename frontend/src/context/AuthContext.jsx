import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { USER_ROLES, DEMO_ACCOUNTS } from '../data/demoAccounts';
import { CHITKARA_CAMPUS_DIRECTORY } from '../data/hostels';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active hostel selection (for mess managers or supervisors)
  const [activeHostel, setActiveHostelState] = useState(CHITKARA_CAMPUS_DIRECTORY[0]);

  // Session restoration on initial load via GET /api/auth/me
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const res = await authService.getMe();
        if (mounted && res.success && res.user) {
          setUser(res.user);
          if (res.user.assignedMessId) {
            const matched = CHITKARA_CAMPUS_DIRECTORY.find(
              (h) => h.id === res.user.assignedMessId
            );
            if (matched) {
              setActiveHostelState(matched);
            }
          }
        }
      } catch (err) {
        console.warn('Session restoration check:', err.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const setActiveHostel = (hostel) => {
    // If user is a MESS manager, verify they cannot select a mess they do not manage
    if (user && user.role === 'MESS' && user.assignedMessId) {
      if (hostel.id !== user.assignedMessId) {
        console.warn('Mess managers are restricted to their assigned dining hall.');
        return;
      }
    }
    setActiveHostelState(hostel);
  };

  /**
   * Manual email/password login against live Java backend
   */
  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.user) {
      setUser(res.user);
      if (res.user.assignedMessId) {
        const matched = CHITKARA_CAMPUS_DIRECTORY.find(
          (h) => h.id === res.user.assignedMessId
        );
        if (matched) {
          setActiveHostelState(matched);
        }
      }
    }
    return res;
  };

  /**
   * 1-Click Demo login by role
   */
  const loginDemo = async (role) => {
    const res = await authService.loginDemo(role);
    if (res.success && res.user) {
      setUser(res.user);
      if (res.user.assignedMessId) {
        const matched = CHITKARA_CAMPUS_DIRECTORY.find(
          (h) => h.id === res.user.assignedMessId
        );
        if (matched) {
          setActiveHostelState(matched);
        }
      }
    }
    return res;
  };

  /**
   * Logout: Terminates server-side session and clears client state
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated,
        loading,
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
