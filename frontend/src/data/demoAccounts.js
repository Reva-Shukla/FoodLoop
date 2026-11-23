/**
 * FoodLoop Demo Accounts
 * Aligned with existing Java backend and MySQL database test account identities.
 * 
 * Strict Requirements:
 * - Roles: MESS, NGO, ADMIN
 * - ADMIN displayed as "Campus Supervisor" throughout frontend
 * - Demo Password: FoodLoop@123 (temporary frontend-only demo credential)
 */

export const USER_ROLES = {
  MESS: 'MESS',
  NGO: 'NGO',
  ADMIN: 'ADMIN',
};

export const DEMO_PASSWORD = 'FoodLoop@123';

export const DEMO_ACCOUNTS = [
  {
    id: 'user-mess-01',
    email: 'mess@test.com',
    role: USER_ROLES.MESS,
    roleTitle: 'Mess Manager',
    portalName: 'Track & Donate',
    name: 'Vikram Singh',
    assignedMessId: 'mess-b-franklin',
    assignedMessName: 'Franklin Mess',
    destination: '/mess/select-hostel',
    badgeColor: 'var(--color-saffron)',
    badgeBg: 'var(--color-saffron-light)',
    description: 'Hostel mess manager responsible for meal count recording and surplus batch creation.',
  },
  {
    id: 'user-ngo-01',
    email: 'ngo@test.com',
    role: USER_ROLES.NGO,
    roleTitle: 'NGO Partner',
    portalName: 'Claim & Collect',
    name: 'Regional Relief Coordinator',
    organization: 'NGO Demo Partner',
    destination: '/ngo/dashboard',
    badgeColor: 'var(--color-terracotta)',
    badgeBg: 'var(--color-terracotta-light)',
    description: 'Authorized volunteer coordinator discovering available surplus batches and managing collection.',
  },
  {
    id: 'user-admin-01',
    email: 'admin@test.com',
    role: USER_ROLES.ADMIN,
    // Must be displayed as Campus Supervisor throughout the frontend
    roleTitle: 'Campus Supervisor',
    portalName: 'Monitor & Improve',
    name: 'Dr. R. K. Sharma',
    department: 'University Administration & Student Welfare',
    destination: '/supervisor/dashboard',
    badgeColor: 'var(--color-forest)',
    badgeBg: 'rgba(24, 60, 50, 0.08)',
    description: 'University supervisor overseeing dining operations, waste trend metrics, and campus compliance.',
  },
];

export const getDemoAccountByEmail = (email) => {
  if (!email) return null;
  return DEMO_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
  ) || null;
};

export const getDemoAccountByRole = (role) => {
  if (!role) return null;
  return DEMO_ACCOUNTS.find((acc) => acc.role === role) || null;
};

export const getDestinationForRole = (role) => {
  switch (role) {
    case USER_ROLES.MESS:
      return '/mess/select-hostel';
    case USER_ROLES.NGO:
      return '/ngo/dashboard';
    case USER_ROLES.ADMIN:
      return '/supervisor/dashboard';
    default:
      return '/';
  }
};
