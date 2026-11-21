import React from 'react';
import { ChefHat, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function CommunitiesSection() {
  const { USER_ROLES } = useAuth();

  const communities = [
    {
      role: USER_ROLES.MESS,
      title: 'Mess Manager',
      portalTitle: 'Track & Donate',
      desc: 'Log surplus portions immediately after meal service.',
      icon: ChefHat,
      accent: 'var(--color-saffron)',
      bg: 'var(--color-saffron-light)',
      borderColor: 'rgba(230, 162, 60, 0.35)',
    },
    {
      role: USER_ROLES.NGO,
      title: 'NGO Partner',
      portalTitle: 'Claim & Collect',
      desc: 'Claim available campus batches and arrange prompt collection.',
      icon: HeartHandshake,
      accent: 'var(--color-terracotta)',
      bg: 'var(--color-terracotta-light)',
      borderColor: 'rgba(201, 108, 75, 0.35)',
    },
    {
      role: USER_ROLES.ADMIN,
      title: 'Campus Supervisor',
      portalTitle: 'Monitor & Improve',
      desc: 'Review consumption insights to optimize future dining.',
      icon: ShieldCheck,
      accent: 'var(--color-forest)',
      bg: 'var(--color-forest-surface)',
      borderColor: 'rgba(24, 60, 50, 0.25)',
    },
  ];

  return (
    <section
      id="communities"
      style={{
        paddingTop: 'clamp(56px, 7vw, 96px)',
        paddingBottom: 'clamp(56px, 7vw, 96px)',
        backgroundColor: 'var(--color-cream)',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px auto' }}>
          <div className="kicker kicker-light" style={{ backgroundColor: 'rgba(24, 60, 50, 0.06)' }}>
            <span>One Connected Network</span>
          </div>

          <h2 className="display-section" style={{ marginTop: 10, marginBottom: 12 }}>
            Three roles.{' '}
            <span className="editorial-italic" style={{ color: 'var(--color-terracotta)' }}>
              One shared purpose.
            </span>
          </h2>

          <p className="lead-text" style={{ margin: '0 auto', fontSize: '1.05rem' }}>
            A coordinated system connecting kitchen staff, regional volunteers, and campus management.
          </p>
        </div>

        {/* 3 Roles Grid (Concise, no bullet lists) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
          className="communities-grid"
        >
          {communities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.role}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${c.borderColor}`,
                  padding: '32px 28px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: c.bg,
                      color: c.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 2,
                    }}
                  >
                    {c.title}
                  </h3>

                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '1.05rem',
                      color: c.accent,
                      marginBottom: 14,
                    }}
                  >
                    {c.portalTitle}
                  </div>

                  <p
                    style={{
                      fontSize: '0.94rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 28,
                    }}
                  >
                    {c.desc}
                  </p>
                </div>

                <Link
                  to={`/login?role=${c.role}`}
                  className="btn btn-secondary btn-sm"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    borderColor: c.borderColor,
                    fontWeight: 600,
                  }}
                >
                  <span>Launch Portal</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
