import React, { useState } from 'react';
import { MapPin, Utensils, Check } from 'lucide-react';
import { getBoysMesses, getGirlsMesses, HOSTEL_CATEGORIES } from '../../data/hostels';

export default function CampusSection() {
  const [activeTab, setActiveTab] = useState(HOSTEL_CATEGORIES.BOYS);

  const boysMesses = getBoysMesses();
  const girlsMesses = getGirlsMesses();
  const displayedMesses = activeTab === HOSTEL_CATEGORIES.BOYS ? boysMesses : girlsMesses;

  return (
    <section
      id="our-campus"
      style={{
        paddingTop: 'clamp(56px, 7vw, 96px)',
        paddingBottom: 'clamp(56px, 7vw, 96px)',
        backgroundColor: 'var(--color-cream-light)',
        borderTop: '1px solid var(--color-cream-border)',
        borderBottom: '1px solid var(--color-cream-border)',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: 640, marginBottom: 36 }}>
          <div className="kicker kicker-light" style={{ backgroundColor: 'rgba(24, 60, 50, 0.08)' }}>
            <MapPin size={12} color="var(--color-forest)" />
            <span>Chitkara University, Punjab</span>
          </div>

          <h2 className="display-section" style={{ marginTop: 10, marginBottom: 12 }}>
            Connected across our{' '}
            <span className="editorial-italic" style={{ color: 'var(--color-forest)' }}>
              hostel messes.
            </span>
          </h2>

          <p className="lead-text" style={{ fontSize: '1.05rem', margin: 0 }}>
            Active across all residential dining facilities in Rajpura.
          </p>
        </div>

        {/* Tab Filters */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-cream-tint)',
            padding: 4,
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-cream-border)',
            marginBottom: 28,
          }}
        >
          <button
            onClick={() => setActiveTab(HOSTEL_CATEGORIES.BOYS)}
            style={{
              padding: '8px 22px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.88rem',
              fontWeight: 600,
              backgroundColor: activeTab === HOSTEL_CATEGORIES.BOYS ? 'var(--color-forest)' : 'transparent',
              color: activeTab === HOSTEL_CATEGORIES.BOYS ? 'var(--color-cream)' : 'var(--color-forest)',
              transition: 'all 0.2s',
            }}
          >
            Boys' Messes ({boysMesses.length})
          </button>

          <button
            onClick={() => setActiveTab(HOSTEL_CATEGORIES.GIRLS)}
            style={{
              padding: '8px 22px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.88rem',
              fontWeight: 600,
              backgroundColor: activeTab === HOSTEL_CATEGORIES.GIRLS ? 'var(--color-forest)' : 'transparent',
              color: activeTab === HOSTEL_CATEGORIES.GIRLS ? 'var(--color-cream)' : 'var(--color-forest)',
              transition: 'all 0.2s',
            }}
          >
            Girls' Messes ({girlsMesses.length})
          </button>
        </div>

        {/* Concise Mess Directory Grid (Clean, elegant badges/tiles) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {displayedMesses.map((mess) => (
            <div
              key={mess.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                border: '1.5px solid var(--color-cream-border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--color-sage)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--color-cream-border)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-forest-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-forest)',
                    flexShrink: 0,
                  }}
                >
                  <Utensils size={17} />
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      margin: 0,
                    }}
                  >
                    {mess.name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {mess.categoryLabel}
                  </span>
                </div>
              </div>

              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-sage)',
                }}
                title="Active"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
