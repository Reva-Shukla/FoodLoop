import React from 'react';
import { Menu, Building2, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardHeader({ onToggleMobile, title }) {
  const { user, role, activeHostel, logout, USER_ROLES } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--color-cream-border)',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onToggleMobile}
          aria-label="Open sidebar"
          className="header-mobile-toggle"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-forest)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <Menu size={24} />
        </button>

        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.28rem',
              fontWeight: 600,
              color: 'var(--color-forest-dark)',
              margin: 0,
            }}
          >
            {title || user?.portalName || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Right: Active Mess (for Mess Manager), Campus Tag, and Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Active Mess indicator for Mess Manager */}
        {role === USER_ROLES.MESS && activeHostel && (
          <Link
            to="/mess/select-hostel"
            title="Click to switch active hostel mess"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 12px',
              backgroundColor: 'var(--color-saffron-light)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(230, 162, 60, 0.35)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-saffron-dark)',
              textDecoration: 'none',
            }}
          >
            <Building2 size={14} />
            <span>{activeHostel.name}</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.8, textDecoration: 'underline' }}>Change</span>
          </Link>
        )}

        {/* Campus Location Tag */}
        <div
          className="header-campus-tag"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--color-forest-surface)',
            padding: '5px 10px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          <MapPin size={13} color="var(--color-forest)" />
          <span>Chitkara University</span>
        </div>

        {/* User Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px',
            backgroundColor: 'var(--color-cream-tint)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-cream-border)',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'var(--color-forest)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest-dark)' }}>
            {user?.name?.split(' ')[0] || 'User'}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .header-mobile-toggle {
            display: block !important;
          }
        }
        @media (max-width: 600px) {
          .header-campus-tag {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
