/**
 * Central Authentication Service
 * 
 * Architectural Role:
 * - Central mock authentication module for Phase 2 demonstration.
 * - Manages demo accounts, credentials validation, and session formatting.
 * - Designed with async function signatures so it can be swapped seamlessly
 *   with Java REST API endpoints (e.g., fetch('/api/auth/login')) in the future.
 */

import { DEMO_ACCOUNTS, DEMO_PASSWORD, getDemoAccountByEmail, getDemoAccountByRole, getDestinationForRole, USER_ROLES } from '../data/demoAccounts';
import { storage } from './storage';

export const authService = {
  /**
   * Authenticate with email & password (supports manual demo credentials)
   */
  login: async (email, password) => {
    // Artificial slight delay for realistic UI transition
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!email || !password) {
      return {
        success: false,
        error: 'Please enter both your email address and password.',
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const account = getDemoAccountByEmail(cleanEmail);

    if (!account) {
      return {
        success: false,
        error: 'No demo account found with this email. Please check your credentials or use a quick demo button.',
      };
    }

    if (password !== DEMO_PASSWORD) {
      return {
        success: false,
        error: 'Incorrect password. For demonstration access, use password: Demo@123',
      };
    }

    // Never store actual passwords in localStorage
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
      loginTimestamp: new Date().toISOString(),
    };

    return {
      success: true,
      user: sessionUser,
      destination: getDestinationForRole(account.role),
    };
  },

  /**
   * 1-Click quick demo access by role (MESS, NGO, ADMIN)
   */
  loginDemo: async (role) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const account = getDemoAccountByRole(role);
    if (!account) {
      return {
        success: false,
        error: `Demo role "${role}" not found.`,
      };
    }

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
      loginTimestamp: new Date().toISOString(),
    };

    return {
      success: true,
      user: sessionUser,
      destination: getDestinationForRole(account.role),
    };
  },

  /**
   * Frontend registration preview (demonstration only, no DB mutation)
   */
  registerPreview: async ({ name, email, password, confirmPassword, role }) => {
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (!name || !email || !password || !confirmPassword || !role) {
      return {
        success: false,
        error: 'All fields are required.',
      };
    }

    // Basic email format validation
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

    // Supervisor registration forbidden
    if (role === USER_ROLES.ADMIN || role === 'ADMIN' || role === 'SUPERVISOR') {
      return {
        success: false,
        error: 'Campus Supervisor accounts cannot be registered publicly.',
      };
    }

    return {
      success: true,
      message: 'Registration preview submitted successfully. Official onboarding will become available once the Java backend integration is complete. Please use the preconfigured demo accounts to explore the portals.',
    };
  },

  getDemoAccounts: () => DEMO_ACCOUNTS,
  getDestinationForRole,
  USER_ROLES,
  DEMO_PASSWORD,
};
