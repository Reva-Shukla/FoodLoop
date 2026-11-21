import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import DonationDetailsModal from '../../components/ngo/DonationDetailsModal';
import { RESEARCHED_POTENTIAL_NGOS, REGIONAL_INFRASTRUCTURE_NOTE } from '../../data/researchedNgos';
import {
  Utensils,
  HeartHandshake,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';

export default function NgoDashboard() {
  const { user } = useAuth();
  const {
    donations,
    claims,
    pickups,
    getNgoSummary,
    getAvailableDonations,
    getRecommendedDonations,
    claimDonation,
    completePickup,
  } = useFoodLoop();
  const navigate = useNavigate();

  const ngoId = user?.id || 'user-ngo-01';

  const [summary, setSummary] = useState({
    availableDonationsCount: 0,
    activeClaimsCount: 0,
    scheduledPickupsCount: 0,
    portionsCollected: 0,
    upcomingPickups: [],
    recentClaims: [],
    recentCompletedPickups: [],
  });

  const [recommendedPreview, setRecommendedPreview] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [activePartnerModal, setActivePartnerModal] = useState(false);

  // Close researched partner modal on Escape key
  useEffect(() => {
    if (!activePartnerModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActivePartnerModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePartnerModal]);

  useEffect(() => {
    let mounted = true;
    const loadDashboardData = async () => {
      const sum = await getNgoSummary(ngoId);
      const recs = await getRecommendedDonations({ dietaryPreference: 'ANY' });
      if (mounted) {
        setSummary(sum);
        setRecommendedPreview(recs.slice(0, 3));
      }
    };

    loadDashboardData();
    return () => {
      mounted = false;
    };
  }, [donations, claims, pickups, ngoId, getNgoSummary, getRecommendedDonations]);

  const handleClaim = async (donationId) => {
    setClaiming(true);
    try {
      await claimDonation(donationId, {
        id: user?.id || 'user-ngo-01',
        name: user?.name || 'Regional Relief Coordinator',
        claimedAt: new Date().toISOString(),
      });
      // Navigate to claims page on success
      navigate('/ngo/my-claims');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <DashboardLayout title="NGO Partner Portal">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto' }}>
        {/* Welcome Editorial Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-cream-border)',
            padding: 'clamp(24px, 3.5vw, 36px)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            background: 'linear-gradient(135deg, #FFFFFF 60%, rgba(245, 240, 227, 0.45) 100%)',
          }}
        >
          <div>
            <div className="kicker kicker-terracotta" style={{ marginBottom: 8 }}>
              <span>Surplus Food Discovery • Chitkara University</span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.7rem, 2.5vw, 2.3rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
                lineHeight: 1.2,
              }}
            >
              Good food, greater purpose.
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', margin: 0, maxWidth: 560 }}>
              Discover surplus meals across all 7 campus messes. Make every collection count.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <Link
              to="/ngo/available-food"
              className="btn btn-primary btn-md"
              style={{
                backgroundColor: 'var(--color-terracotta)',
                boxShadow: '0 4px 12px rgba(201, 108, 75, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Utensils size={17} />
              <span>Browse Available Food</span>
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              onClick={() => setActivePartnerModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-forest)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                textDecoration: 'underline',
                padding: '2px 4px',
              }}
            >
              <Info size={13} />
              <span>Researched Regional Organisations</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Dynamic Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {/* Metric 1: Available Donations across campus */}
          <div
            style={{
              backgroundColor: 'rgba(253, 243, 227, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(230, 162, 60, 0.35)',
              padding: '20px 22px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-saffron-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Available Batches
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--color-saffron-dark)', lineHeight: 1 }}>
              {summary.availableDonationsCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              active across 7 campus messes
            </div>
          </div>

          {/* Metric 2: Active Claims */}
          <div
            style={{
              backgroundColor: 'rgba(251, 239, 234, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(201, 108, 75, 0.3)',
              padding: '20px 22px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Active Claims
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--color-terracotta)', lineHeight: 1 }}>
              {summary.activeClaimsCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              claimed by your organisation
            </div>
          </div>

          {/* Metric 3: Scheduled Pickups */}
          <div
            style={{
              backgroundColor: 'rgba(235, 242, 233, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(169, 198, 160, 0.4)',
              padding: '20px 22px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Scheduled Pickups
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--color-forest)', lineHeight: 1 }}>
              {summary.scheduledPickupsCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              pending collection dispatch
            </div>
          </div>

          {/* Metric 4: Portions Collected */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(24, 60, 50, 0.2)',
              padding: '20px 22px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-forest-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Portions Collected
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1 }}>
              {summary.portionsCollected} <span style={{ fontSize: '1rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>portions</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              completed collections to date
            </div>
          </div>
        </div>

        {/* Section 2: Recommended Food Preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--color-terracotta)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                Recommended Batches
              </h3>
            </div>
            <Link
              to="/ngo/recommended"
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--color-forest)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>View all recommendations</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {recommendedPreview.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-cream-border)',
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Utensils size={32} color="var(--color-cream-border)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                No active surplus donations currently available for recommendation.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {recommendedPreview.map((don) => (
                <div
                  key={don.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-cream-border)',
                    padding: '18px 20px',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: don.foodType === 'NON_VEG' ? 'var(--color-terracotta-light)' : 'var(--color-sage-subtle)',
                          color: don.foodType === 'NON_VEG' ? 'var(--color-terracotta-dark)' : 'var(--color-forest)',
                        }}
                      >
                        {don.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}
                      </span>

                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-terracotta)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} />
                        <span>
                          Until {new Date(don.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.12rem', color: 'var(--color-forest-dark)', margin: '0 0 4px 0' }}>
                      {don.foodName}
                    </h4>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {don.messName} • <strong>{don.portions} portions</strong>
                    </div>

                    {don.recommendationReasons && don.recommendationReasons.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {don.recommendationReasons.map((r, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.68rem',
                              padding: '2px 6px',
                              backgroundColor: 'rgba(230, 162, 60, 0.15)',
                              color: 'var(--color-saffron-dark)',
                              borderRadius: 'var(--radius-xs)',
                              fontWeight: 600,
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-cream-border)', paddingTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDonation(don)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-forest)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDonation(don)}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: 'var(--color-terracotta)' }}
                    >
                      Claim Batch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Upcoming Pickups & Recent Activity (Split Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Upcoming Pickups */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '22px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="var(--color-terracotta)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                  Upcoming Pickup Deadlines
                </h3>
              </div>
              <Link to="/ngo/my-pickups" style={{ fontSize: '0.8rem', color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>
                View all pickups
              </Link>
            </div>

            {summary.upcomingPickups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)' }}>
                <Package size={28} color="var(--color-cream-border)" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No pending collections scheduled.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.upcomingPickups.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--color-cream-light)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-cream-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-forest-dark)' }}>
                        {p.foodName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {p.messName} • {p.portions} portions
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--color-terracotta)',
                          display: 'block',
                        }}
                      >
                        {new Date(p.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Link
                        to="/ngo/my-pickups"
                        style={{ fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        Dispatch
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Claims */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '22px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HeartHandshake size={18} color="var(--color-forest)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                  Recent Claims & Activity
                </h3>
              </div>
              <Link to="/ngo/my-claims" style={{ fontSize: '0.8rem', color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>
                View all claims
              </Link>
            </div>

            {summary.recentClaims.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)' }}>
                <HeartHandshake size={28} color="var(--color-cream-border)" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No recent claims found for your account.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.recentClaims.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--color-cream-tint)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-cream-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-forest-dark)' }}>
                        {c.foodName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {c.messName} • {c.portions} portions
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor:
                          c.status === 'ACTIVE'
                            ? 'var(--color-terracotta-light)'
                            : c.status === 'COMPLETED'
                            ? 'var(--color-sage-subtle)'
                            : '#F5F5F5',
                        color:
                          c.status === 'ACTIVE'
                            ? 'var(--color-terracotta-dark)'
                            : c.status === 'COMPLETED'
                            ? 'var(--color-forest)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Researched Organisations Modal / Drawer */}
        {activePartnerModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(16, 41, 34, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setActivePartnerModal(false)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 680,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px 32px',
                boxShadow: 'var(--shadow-xl)',
                border: '1.5px solid var(--color-cream-border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <span className="kicker kicker-forest">Regional Research Reference</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-forest-dark)', margin: '4px 0 0 0' }}>
                    Researched Potential Redistribution Organisations
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePartnerModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-sage-subtle)',
                  border: '1px solid var(--color-sage)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontSize: '0.82rem',
                  color: 'var(--color-forest)',
                  marginBottom: 20,
                  lineHeight: 1.45,
                }}
              >
                <strong>Academic / Project Reference Notice:</strong> {REGIONAL_INFRASTRUCTURE_NOTE.disclaimer}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {RESEARCHED_POTENTIAL_NGOS.map((org) => (
                  <div
                    key={org.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-cream-border)',
                      backgroundColor: 'var(--color-cream-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.94rem', color: 'var(--color-forest-dark)' }}>{org.name}</strong>
                      <span style={{ fontSize: '0.72rem', padding: '2px 6px', backgroundColor: 'var(--color-forest-surface)', borderRadius: 4, color: 'var(--color-forest)', fontWeight: 600 }}>
                        {org.type}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--color-terracotta)', fontWeight: 600, marginBottom: 6 }}>
                      Service Area: {org.serviceArea}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {org.activities}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <span>Source: {org.sourceReference}</span>
                      <a
                        href={org.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-forest)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                      >
                        <span>Official Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--color-cream-border)',
                  paddingTop: 14,
                  lineHeight: 1.45,
                }}
              >
                {REGIONAL_INFRASTRUCTURE_NOTE.rajpuraCoverageLimitation}
              </div>
            </div>
          </div>
        )}

        {/* Donation Details Modal */}
        {selectedDonation && (
          <DonationDetailsModal
            donation={selectedDonation}
            onClose={() => setSelectedDonation(null)}
            onClaim={handleClaim}
            canClaim={selectedDonation.status === 'AVAILABLE'}
            claiming={claiming}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
