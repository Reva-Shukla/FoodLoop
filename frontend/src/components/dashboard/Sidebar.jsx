import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FoodLoopLogo from '../common/FoodLoopLogo';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  HeartHandshake,
  Package,
  Trash2,
  Building2,
  Utensils,
  ShieldCheck,
  Home,
  LogOut,
  X,
  User,
  Sparkles,
  ArrowRightLeft,
  BarChart3,
  CheckCircle2,
  Users,
  FileText
} from 'lucide-react';

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, role, activeHostel, logout, demoAccounts, loginDemo, USER_ROLES } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchDemo = async (targetRole) => {
    const res = await loginDemo(targetRole);
    if (res.success) {
      if (onClose) onClose();
      navigate(res.destination);
    }
  };

  // Role-specific navigation items
  const getNavItems = () => {
    switch (role) {
      case USER_ROLES.MESS:
        return [
          { to: '/mess/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/mess/record-meal', label: 'Record Meal', icon: PlusCircle },
          { to: '/mess/meal-history', label: 'Meal History', icon: History },
          { to: '/mess/create-donation', label: 'Create Donation', icon: HeartHandshake },
          { to: '/mess/my-donations', label: 'My Donations', icon: Package },
          { to: '/mess/record-waste', label: 'Record Waste', icon: Trash2 },
        ];
      case USER_ROLES.NGO:
        return [
          { to: '/ngo/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/ngo/available-food', label: 'Available Food', icon: Utensils },
          { to: '/ngo/recommended', label: 'Recommended Food', icon: Sparkles },
          { to: '/ngo/my-claims', label: 'My Claims', icon: HeartHandshake },
          { to: '/ngo/my-pickups', label: 'My Pickups', icon: Package },
        ];
      case USER_ROLES.ADMIN:
        return [
          { to: '/supervisor/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/supervisor/hostel-analytics', label: 'Hostel Analytics', icon: BarChart3 },
          { to: '/supervisor/waste-records', label: 'Waste Records', icon: Trash2 },
          { to: '/supervisor/donations', label: 'Donations', icon: HeartHandshake },
          { to: '/supervisor/claims-pickups', label: 'Claims & Pickups', icon: CheckCircle2 },
          { to: '/supervisor/users', label: 'Manage Users', icon: Users },
          { to: '/supervisor/reports', label: 'Reports', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <aside
        style={{
          width: 280,
          backgroundColor: 'var(--color-forest-dark)',
          color: 'var(--color-cream)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgba(245, 240, 227, 0.08)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexShrink: 0,
          transition: 'transform 0.3s ease',
        }}
        className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Top: Brand, Mess Indicator & Navigation */}
        <div style={{ padding: '24px 18px 16px', overflowY: 'auto' }}>
          {/* Logo & Mobile Close */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Link to={user?.destination || '/'} onClick={onClose} style={{ textDecoration: 'none' }}>
              <FoodLoopLogo variant="light" size="default" />
            </Link>

            <button
              onClick={onClose}
              className="sidebar-mobile-close"
              aria-label="Close sidebar"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-cream)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Current Mess Indicator & Switch Mess Action (For Mess Manager) */}
          {role === USER_ROLES.MESS && (
            <div
              style={{
                backgroundColor: 'rgba(230, 162, 60, 0.12)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(230, 162, 60, 0.28)',
                padding: '12px 14px',
                marginBottom: 22,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--color-saffron)',
                  }}
                >
                  Active Dining Mess
                </span>

                <Link
                  to="/mess/select-hostel"
                  onClick={onClose}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    color: 'var(--color-cream)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    opacity: 0.9,
                  }}
                >
                  <ArrowRightLeft size={11} />
                  <span>Switch</span>
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={16} color="var(--color-saffron)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {activeHostel?.name || 'Franklin Mess'}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-cream-muted)', marginTop: 2, paddingLeft: 24 }}>
                {activeHostel?.categoryLabel || "Boys' Hostel"} • Chitkara
              </div>
            </div>
          )}

          {/* Non-Mess Role Badge / Org Info */}
          {role !== USER_ROLES.MESS && (
            <div
              style={{
                backgroundColor: role === USER_ROLES.NGO ? 'rgba(201, 108, 75, 0.12)' : 'rgba(169, 198, 160, 0.12)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${role === USER_ROLES.NGO ? 'rgba(201, 108, 75, 0.3)' : 'rgba(169, 198, 160, 0.25)'}`,
                padding: '12px 14px',
                marginBottom: 22,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: role === USER_ROLES.NGO ? 'var(--color-terracotta)' : 'var(--color-sage)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: role === USER_ROLES.NGO ? 'var(--color-terracotta-light)' : 'var(--color-sage)',
                  }}
                >
                  {user?.roleTitle || 'Portal User'}
                </span>
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25 }}>
                {user?.name || 'Authorized Partner'}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-cream-muted)', marginTop: 4 }}>
                {role === USER_ROLES.NGO ? (user?.organization || 'Food Redistribution Partner') : 'University Administration'}
              </div>

              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--color-sage)',
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: '1px solid rgba(245, 240, 227, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>Chitkara University • Rajpura</span>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-sage)',
                marginBottom: 8,
                paddingLeft: 12,
              }}
            >
              {role === USER_ROLES.MESS ? 'Mess Operations' : 'Portal Navigation'}
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FFFFFF' : 'var(--text-cream-muted)',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Demo Persona Switcher (clearly labelled as demo-only development feature) */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(245, 240, 227, 0.08)' }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-sage)',
                marginBottom: 6,
                paddingLeft: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Sparkles size={11} color="var(--color-saffron)" />
              <span>Demo Persona Switcher</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleSwitchDemo(acc.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: acc.role === role ? 700 : 500,
                    color: acc.role === role ? 'var(--color-saffron)' : 'var(--text-cream-muted)',
                    backgroundColor: acc.role === role ? 'rgba(230, 162, 60, 0.12)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s',
                  }}
                >
                  <span>{acc.roleTitle}</span>
                  {acc.role === role && <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Active</span>}
                </button>
              ))}
              <div style={{ fontSize: '0.62rem', color: 'var(--text-cream-muted)', opacity: 0.75, padding: '4px 12px 0', lineHeight: 1.3 }}>
                Demo only • Disabled on Java backend integration
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: User Card & Global Actions */}
        <div
          style={{
            padding: '14px 18px 20px',
            borderTop: '1px solid rgba(245, 240, 227, 0.08)',
            backgroundColor: 'rgba(11, 29, 24, 0.4)',
          }}
        >
          {/* User Profile Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(169, 198, 160, 0.2)',
                color: 'var(--color-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(169, 198, 160, 0.3)',
              }}
            >
              <User size={16} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: 'var(--color-cream)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.name || 'Chef Vikram'}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-cream-muted)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.email || 'mess@test.com'}
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.8rem',
                color: 'var(--text-cream-muted)',
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s',
              }}
            >
              <Home size={14} />
              <span>Back to Landing Page</span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.8rem',
                color: '#FFB4A2',
                background: 'transparent',
                border: 'none',
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background-color 0.15s',
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 920px) {
          .dashboard-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: var(--shadow-xl);
          }
          .dashboard-sidebar.mobile-open {
            transform: translateX(0);
          }
          .sidebar-mobile-close {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
