import React from 'react';
import FoodLoopLogo from './FoodLoopLogo';
import { MapPin, Compass, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-forest-dark)',
        color: 'var(--color-cream)',
        paddingTop: 64,
        paddingBottom: 36,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container">
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Col 1: Brand & Tagline */}
          <div style={{ maxWidth: 340 }}>
            <FoodLoopLogo variant="light" size="large" />
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.2rem',
                color: 'var(--color-sage)',
                marginTop: 18,
                marginBottom: 10,
                lineHeight: 1.3,
              }}
            >
              Every Meal Deserves a Destination.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                color: 'var(--text-cream-muted)',
                lineHeight: 1.55,
              }}
            >
              Campus food waste management and surplus redistribution for Chitkara University, Punjab.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-sage)',
                marginBottom: 16,
              }}
            >
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'The Problem', href: '#the-problem' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Our Campus', href: '#our-campus' },
                { label: 'Sustainability', href: '#sustainability' },
                { label: 'Communities', href: '#communities' },
                { label: 'Demo Portals', href: '/login' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      color: 'var(--color-cream)',
                      opacity: 0.8,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Campus Context */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-sage)',
                marginBottom: 16,
              }}
            >
              Campus
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <MapPin size={16} color="var(--color-saffron)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.86rem', color: 'var(--text-cream-muted)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--color-cream)' }}>Chitkara University</strong><br />
                  NH-64, Rajpura, Punjab — 140401
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <ShieldCheck size={16} color="var(--color-sage)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.84rem', color: 'var(--color-sage)' }}>
                  UN Sustainable Development Goals 2 & 12
                </span>
              </div>
            </div>
          </div>

          {/* Col 4: Demo Access */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-sage)',
                marginBottom: 16,
              }}
            >
              Demo Access
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href="/login?role=MESS"
                className="btn btn-outline-cream btn-sm"
                style={{ justifyContent: 'space-between', fontSize: '0.82rem' }}
              >
                <span>Mess Manager</span>
                <ArrowUpRight size={13} />
              </a>
              <a
                href="/login?role=NGO"
                className="btn btn-outline-cream btn-sm"
                style={{ justifyContent: 'space-between', fontSize: '0.82rem' }}
              >
                <span>NGO Partner</span>
                <ArrowUpRight size={13} />
              </a>
              <a
                href="/login?role=ADMIN"
                className="btn btn-outline-cream btn-sm"
                style={{ justifyContent: 'space-between', fontSize: '0.82rem' }}
              >
                <span>Campus Supervisor</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(245, 240, 227, 0.12)',
            paddingTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.82rem',
            color: 'var(--text-cream-muted)',
          }}
        >
          <span>© {new Date().getFullYear()} FoodLoop • Chitkara University, Punjab</span>
          <span style={{ color: 'var(--color-sage)' }}>Every Meal Deserves a Destination</span>
        </div>
      </div>
    </footer>
  );
}
