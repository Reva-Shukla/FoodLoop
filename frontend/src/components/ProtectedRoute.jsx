import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDestinationForRole } from '../data/demoAccounts';

/**
 * ProtectedRoute Guard
 * - Displays a loading indicator while session restoration (GET /api/auth/me) resolves.
 * - Redirects unauthenticated users to /login preserving the requested location.
 * - Restricts access based on user role (MESS, NGO, ADMIN).
 * - Redirects users attempting cross-role navigation to their authorized portal.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-cream)',
          color: 'var(--color-forest)',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-sand)',
            borderTopColor: 'var(--color-forest)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            letterSpacing: '0.02em',
          }}
        >
          Verifying FoodLoop session...
        </p>
      </div>
    );
  }

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
