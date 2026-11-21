import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FoodLoopLogo from './FoodLoopLogo';
import { ArrowUpRight, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/#hero' },
    { label: 'The Problem', href: '/#the-problem' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Our Campus', href: '/#our-campus' },
    { label: 'Sustainability', href: '/#sustainability' },
    { label: 'Communities', href: '/#communities' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        backgroundColor: isScrolled
          ? 'rgba(245, 240, 227, 0.94)'
          : 'rgba(245, 240, 227, 0.7)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: isScrolled
          ? '1px solid rgba(24, 60, 50, 0.1)'
          : '1px solid transparent',
        transition: 'all 0.3s ease',
        boxShadow: isScrolled ? '0 4px 20px rgba(24, 60, 50, 0.05)' : 'none',
      }}
    >
      <div
        className="container"
        style={{
          height: 'var(--nav-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <FoodLoopLogo />
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
          className="desktop-nav-menu"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.92rem',
                fontWeight: 500,
                color: 'var(--color-forest)',
                opacity: 0.82,
                transition: 'opacity 0.2s, color 0.2s',
                position: 'relative',
                padding: '4px 0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.color = 'var(--color-forest-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.82';
                e.currentTarget.style.color = 'var(--color-forest)';
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
          className="nav-actions-desktop"
        >
          {user ? (
            <Link
              to={user.destination || '/'}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
            >
              <User size={15} color="var(--color-forest)" />
              <span>{user.name.split(' ')[0]} ({user.roleTitle})</span>
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-forest)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(24, 60, 50, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Sign In
            </Link>
          )}

          <Link
            to="/login"
            className="btn btn-primary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Get Started</span>
            <ArrowUpRight size={15} />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="mobile-nav-toggle"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-forest)',
              padding: 6,
            }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-cream-light)',
            borderBottom: '1px solid rgba(24, 60, 50, 0.12)',
            padding: '20px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: 'var(--shadow-md)',
          }}
          className="mobile-drawer"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--color-forest)',
                padding: '8px 0',
                borderBottom: '1px solid rgba(24, 60, 50, 0.06)',
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Sign In (Demo Portals)
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .desktop-nav-menu { display: none !important; }
          .mobile-nav-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
