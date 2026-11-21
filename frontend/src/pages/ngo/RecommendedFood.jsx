import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import DonationDetailsModal from '../../components/ngo/DonationDetailsModal';
import {
  Sparkles,
  Utensils,
  Filter,
  Clock,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function RecommendedFood() {
  const { user } = useAuth();
  const { donations, getRecommendedDonations, claimDonation } = useFoodLoop();
  const navigate = useNavigate();

  // NGO Preference Controls
  const [dietaryPreference, setDietaryPreference] = useState('ANY'); // 'ANY' | 'VEG' | 'NON_VEG'
  const [collectionCapacity, setCollectionCapacity] = useState('');

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchRecommendations = async () => {
      setLoading(true);
      const recs = await getRecommendedDonations({
        dietaryPreference,
        collectionCapacity: collectionCapacity ? Number(collectionCapacity) : null,
      });
      if (mounted) {
        setRecommendations(recs);
        setLoading(false);
      }
    };

    fetchRecommendations();
    return () => {
      mounted = false;
    };
  }, [donations, dietaryPreference, collectionCapacity, getRecommendedDonations]);

  const handleClaim = async (donationId) => {
    setClaiming(true);
    try {
      await claimDonation(donationId, {
        id: user?.id || 'user-ngo-01',
        name: user?.name || 'Regional Relief Coordinator',
        claimedAt: new Date().toISOString(),
      });
      navigate('/ngo/my-claims');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <DashboardLayout title="Recommended Food">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Editorial Heading */}
        <div>
          <div className="kicker kicker-terracotta" style={{ marginBottom: 6 }}>
            <Sparkles size={12} color="var(--color-terracotta)" />
            <span>Smart Batch Matching</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
              color: 'var(--color-forest-dark)',
              margin: '0 0 6px 0',
            }}
          >
            Recommended Food
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0, maxWidth: 640 }}>
            Curated surplus food matches tailored to your team's dietary redistribution goals and transport capacity.
          </p>
        </div>

        {/* Preferences Control Panel */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-forest-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Set Recommendation Criteria
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
              alignItems: 'flex-end',
            }}
          >
            {/* Dietary Preference Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest-dark)', marginBottom: 6 }}>
                Dietary Focus
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'ANY', label: 'Any Diet' },
                  { value: 'VEG', label: 'Veg Only' },
                  { value: 'NON_VEG', label: 'Non-Veg Only' },
                ].map((item) => {
                  const active = dietaryPreference === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDietaryPreference(item.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: active ? '1.5px solid var(--color-forest)' : '1px solid var(--color-cream-border)',
                        backgroundColor: active ? 'var(--color-forest)' : 'var(--color-cream-light)',
                        color: active ? '#FFFFFF' : 'var(--color-forest-dark)',
                        fontSize: '0.82rem',
                        fontWeight: active ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimated Collection Capacity */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest-dark)', marginBottom: 6 }}>
                Estimated Vehicle Capacity (Portions)
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50 portions (leave blank for any size)"
                value={collectionCapacity}
                onChange={(e) => setCollectionCapacity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--color-cream-border)',
                  fontSize: '0.86rem',
                  outline: 'none',
                  backgroundColor: 'var(--color-cream-tint)',
                }}
              />
            </div>
          </div>

          <div
            style={{
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              paddingTop: 8,
              borderTop: '1px solid var(--color-cream-border)',
            }}
          >
            <HelpCircle size={13} />
            <span>
              Matches are sorted by earliest pickup deadline. Full-batch collection only (partial claims are not supported).
            </span>
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <Sparkles size={32} color="var(--color-cream-border)" style={{ margin: '0 auto 10px auto' }} />
            <p>Matching batches with your criteria...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Utensils size={36} color="var(--color-cream-border)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: '0 0 6px 0' }}>
              No Matching Batches Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 460, margin: '0 auto 16px auto' }}>
              No currently available batches match your selected dietary preference or capacity threshold ({collectionCapacity ? `${collectionCapacity} portions` : 'any'}).
            </p>
            <button
              type="button"
              onClick={() => {
                setDietaryPreference('ANY');
                setCollectionCapacity('');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Preference Criteria
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recommendations.map((don) => {
              const isVeg = don.foodType === 'VEG';
              return (
                <div
                  key={don.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-cream-border)',
                    padding: '20px 24px',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: isVeg ? 'var(--color-sage-subtle)' : 'var(--color-terracotta-light)',
                          color: isVeg ? 'var(--color-forest)' : 'var(--color-terracotta-dark)',
                        }}
                      >
                        {isVeg ? 'Veg' : 'Non-Veg'}
                      </span>

                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {don.messName}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                      {don.foodName}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <span>
                        Quantity: <strong style={{ color: 'var(--color-forest-dark)' }}>{don.portions} portions</strong>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-terracotta)' }}>
                        <Clock size={13} />
                        <span>Deadline: {new Date(don.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>

                    {/* Recommendation Reasons */}
                    {don.recommendationReasons && don.recommendationReasons.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {don.recommendationReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: 'rgba(230, 162, 60, 0.15)',
                              color: 'var(--color-saffron-dark)',
                              border: '1px solid rgba(230, 162, 60, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <CheckCircle2 size={11} color="var(--color-saffron-dark)" />
                            <span>{reason}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDonation(don)}
                      className="btn btn-secondary btn-sm"
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
              );
            })}
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
