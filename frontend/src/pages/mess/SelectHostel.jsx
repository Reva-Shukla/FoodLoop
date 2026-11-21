import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getBoysMesses, getGirlsMesses, HOSTEL_CATEGORIES } from '../../data/hostels';
import { Building2, Check, ArrowRight, Utensils, Sparkles } from 'lucide-react';

export default function SelectHostel() {
  const { activeHostel, setActiveHostel } = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(activeHostel?.id || 'mess-b-franklin');
  const [activeTab, setActiveTab] = useState(
    activeHostel?.category === HOSTEL_CATEGORIES.GIRLS ? HOSTEL_CATEGORIES.GIRLS : HOSTEL_CATEGORIES.BOYS
  );

  const boysMesses = getBoysMesses();
  const girlsMesses = getGirlsMesses();
  const displayedMesses = activeTab === HOSTEL_CATEGORIES.BOYS ? boysMesses : girlsMesses;

  const handleSelectHostel = (mess) => {
    setSelected(mess.id);
    setActiveHostel(mess);
  };

  const handleProceed = () => {
    navigate('/mess/dashboard');
  };

  return (
    <DashboardLayout title="Select Hostel Mess">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header Introduction */}
        <div style={{ marginBottom: 28 }}>
          <div className="kicker kicker-saffron" style={{ marginBottom: 8 }}>
            <Sparkles size={12} color="var(--color-saffron-dark)" />
            <span>Campus Dining Directory</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.7rem, 2.5vw, 2.2rem)',
              color: 'var(--color-forest-dark)',
              marginBottom: 8,
            }}
          >
            Select your active hostel mess.
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', margin: 0 }}>
            Choose the dining hall you are managing. All meal logs, surplus calculations, donations, and waste entries will be strictly linked to this mess.
          </p>
        </div>

        {/* Tab Filters for Categories */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-cream-tint)',
            padding: 4,
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-cream-border)',
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab(HOSTEL_CATEGORIES.BOYS)}
            style={{
              padding: '8px 22px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: activeTab === HOSTEL_CATEGORIES.BOYS ? 'var(--color-forest)' : 'transparent',
              color: activeTab === HOSTEL_CATEGORIES.BOYS ? 'var(--color-cream)' : 'var(--color-forest)',
              transition: 'all 0.2s',
            }}
          >
            Boys' Hostel Messes ({boysMesses.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(HOSTEL_CATEGORIES.GIRLS)}
            style={{
              padding: '8px 22px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: activeTab === HOSTEL_CATEGORIES.GIRLS ? 'var(--color-forest)' : 'transparent',
              color: activeTab === HOSTEL_CATEGORIES.GIRLS ? 'var(--color-cream)' : 'var(--color-forest)',
              transition: 'all 0.2s',
            }}
          >
            Girls' Hostel Messes ({girlsMesses.length})
          </button>
        </div>

        {/* Hostel List Tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {displayedMesses.map((mess) => {
            const isSelected = selected === mess.id;
            return (
              <div
                key={mess.id}
                onClick={() => handleSelectHostel(mess)}
                style={{
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 22px',
                  border: isSelected ? '2px solid var(--color-forest)' : '1.5px solid var(--color-cream-border)',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  backgroundColor: isSelected ? 'rgba(24, 60, 50, 0.04)' : '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--color-forest)' : 'var(--color-forest-surface)',
                      color: isSelected ? '#FFFFFF' : 'var(--color-forest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.18s',
                    }}
                  >
                    <Utensils size={18} />
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
                      {mess.categoryLabel} • Chitkara University
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: isSelected ? '2px solid var(--color-forest)' : '2px solid var(--color-cream-border)',
                    backgroundColor: isSelected ? 'var(--color-forest)' : 'transparent',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button & Confirmation */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-forest-dark)' }}>
              Active Selection:{' '}
              <span style={{ color: 'var(--color-saffron-dark)', fontWeight: 700 }}>
                {activeHostel?.name || 'Franklin Mess'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              All dashboard charts, records and donation quotas will reflect this dining hall.
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceed}
            className="btn btn-primary"
            style={{
              padding: '12px 26px',
              fontSize: '0.94rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Proceed to Mess Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
