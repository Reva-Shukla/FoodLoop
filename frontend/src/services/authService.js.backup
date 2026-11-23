/**
 * Central Authentication Service
 *
 * Connects the FoodLoop frontend to the Java backend authentication endpoints:
 * - POST /api/auth/login
 * - GET /api/auth/me
 * - POST /api/auth/logout
 * - POST /api/auth/register
 *
 * Employs HTTP-only cookies managed by the browser with server-side session tokens.
 * Offline demo accounts are strictly isolated and disabled by default in production.
 */

import { apiClient, ApiError } from './apiClient';
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  getDemoAccountByEmail,
  getDemoAccountByRole,
  getDestinationForRole,
  USER_ROLES,
} from '../data/demoAccounts';

// Demo mode is explicitly disabled by default for live integration
const IS_DEMO_SWITCHER_ENABLED = import.meta.env.VITE_ENABLE_DEMO_SWITCHER === 'true';

export const authService = {
  /**
   * Authenticate against the live Java REST API (POST /api/auth/login)
   */
  login: async (email, password) => {
    if (!email || !password) {
      return {
        success: false,
        error: 'Please enter both your email address and password.',
      };
    }

    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res && res.user) {
        return {
          success: true,
          user: res.user,
          destination: res.destination || getDestinationForRole(res.user.role),
        };
      }

      return {
        success: false,
        error: 'Authentication failed. No user profile returned by server.',
      };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isDatabaseError) {
          return {
            success: false,
            error:
              'The campus database is currently unreachable. Live authentication requires an active database connection.',
            isDatabaseError: true,
          };
        }
        if (err.isAuthError) {
          return {
            success: false,
            error: err.message || 'Invalid email or password. Please verify your credentials.',
          };
        }
        return {
          success: false,
          error: err.message || 'Authentication error. Please try again.',
        };
      }

      return {
        success: false,
        error: 'Unable to communicate with the authentication server.',
      };
    }
  },

  /**
   * Validate current session cookie with backend (GET /api/auth/me)
   */
  getMe: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res && res.user) {
        return {
          success: true,
          user: res.user,
        };
      }
      return { success: false, user: null };
    } catch {
      return { success: false, user: null };
    }
  },

  /**
   * Terminate server session and clear cookie (POST /api/auth/logout)
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Clean up client state regardless of server logout response
    }
    return { success: true };
  },

  /**
   * Live partner / mess manager registration (POST /api/auth/register)
   */
  register: async (formData) => {
    try {
      const res = await apiClient.post('/auth/register', {
        name: formData.name?.trim(),
        email: formData.email?.trim().toLowerCase(),
        password: formData.password,
        role: formData.role?.toUpperCase(),
        organization: formData.organization || null,
        proposedMessId: formData.proposedMessId || formData.assignedMessId || null,
        location: formData.location || null,
        foodPreference: formData.foodPreference || 'VEG',
      });

      return {
        success: true,
        message: res.message || 'Registration application submitted successfully.',
        requestId: res.requestId,
      };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isDatabaseError) {
          return {
            success: false,
            error:
              'The campus database is currently unreachable. New registrations cannot be processed right now.',
            isDatabaseError: true,
          };
        }
        return {
          success: false,
          error: err.message,
        };
      }
      return {
        success: false,
        error: 'Failed to submit registration. Please try again.',
      };
    }
  },

  /**
   * User registration wrapper with client validation
   */
  registerPreview: async ({ name, email, password, confirmPassword, role, proposedMessId, organization, location }) => {
    if (!name || !email || !password || !confirmPassword || !role) {
      return {
        success: false,
        error: 'All fields are required.',
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match.',
      };
    }

    if (role === USER_ROLES.ADMIN || role === 'ADMIN' || role === 'SUPERVISOR') {
      return {
        success: false,
        error: 'Campus Supervisor accounts cannot be registered publicly.',
      };
    }

    // Call live registration endpoint
    return authService.register({
      name,
      email,
      password,
      role,
      proposedMessId,
      organization,
      location,
    });
  },

  /**
   * Demo persona switcher — only accessible when explicitly enabled in mock mode
   */
  loginDemo: async (role) => {
    const account = getDemoAccountByRole(role);
    if (!account) {
      return {
        success: false,
        error: `Demo role "${role}" not found.`,
      };
    }

    // Attempt real backend authentication first using demo credentials
    const realAuth = await authService.login(account.email, DEMO_PASSWORD);
    if (realAuth.success) {
      return realAuth;
    }

    // Fall back to isolated offline demo mode only if switcher is explicitly enabled
    if (IS_DEMO_SWITCHER_ENABLED) {
      const sessionUser = {
        id: account.id,
        email: account.email,
        role: account.role,
        roleTitle: account.roleTitle,
        name: account.name,
        portalName: account.portalName,
        assignedMessId: account.assignedMessId || null,
        assignedMessName: account.assignedMessName || null,
        organization: account.organization || null,
        department: account.department || null,
        destination: account.destination,
        isDemoSession: true,
      };

      return {
        success: true,
        user: sessionUser,
        destination: getDestinationForRole(account.role),
      };
    }

    return realAuth;
  },

  getDemoAccounts: () => DEMO_ACCOUNTS,
  getDestinationForRole,
  USER_ROLES,
  DEMO_PASSWORD,
};
