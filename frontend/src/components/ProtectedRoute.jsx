import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDestinationForRole } from '../data/demoAccounts';

/**
 * ProtectedRoute Guard
 * - Redirects unauthenticated users to /login preserving the requested location.
 * - Restricts access based on user role (MESS, NGO, ADMIN).
 * - Redirects users attempting cross-role navigation to their authorized portal.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Role mismatch: redirect to their authorized destination
    const target = getDestinationForRole(user.role);
    return <Navigate to={target} replace />;
  }

  return children;
}
