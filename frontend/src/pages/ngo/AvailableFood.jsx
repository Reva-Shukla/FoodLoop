import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import DonationDetailsModal from '../../components/ngo/DonationDetailsModal';
import { CHITKARA_CAMPUS_DIRECTORY } from '../../data/hostels';
import {
  Utensils,
  Search,
  Filter,
  Clock,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

// Representative image mapping for common campus dishes
const FOOD_IMAGES = {
  dal: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
  rice: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80',
  pulao: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
  paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80',
  roti: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=700&q=80',
  paratha: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=700&q=80',
  curry: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80',
  default: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
};

const getFoodImage = (foodName = '') => {
  const lower = foodName.toLowerCase();
  for (const [key, url] of Object.entries(FOOD_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return FOOD_IMAGES.default;
};

export default function AvailableFood() {
  const { user } = useAuth();
  const { donations, getAvailableDonations, claimDonation } = useFoodLoop();
  const navigate = useNavigate();

  const [availableList, setAvailableList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'BOYS' | 'GIRLS'
  const [messFilter, setMessFilter] = useState('ALL');
  const [dietaryFilter, setDietaryFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  const [minPortions, setMinPortions] = useState('');
  const [sortBy, setSortBy] = useState('DEADLINE'); // 'DEADLINE' | 'QUANTITY' | 'RECENT'

  // Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchAvailable = async () => {
      setLoading(true);
      const list = await getAvailableDonations();
      if (mounted) {
        setAvailableList(list);
        setLoading(false);
      }
    };

    fetchAvailable();
    return () => {
      mounted = false;
    };
  }, [donations, getAvailableDonations]);

  // Handle Claim
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

  // Reset Filters
  const handleReset = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setMessFilter('ALL');
    setDietaryFilter('ALL');
    setMinPortions('');
    setSortBy('DEADLINE');
  };

  // Filter & Sort
  const filteredDonations = useMemo(() => {
    let result = availableList.filter((d) => {
      // Must be AVAILABLE and unexpired
      if (d.status !== 'AVAILABLE') return false;
      if (new Date(d.pickupDeadline) <= new Date()) return false;

      // Text search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = d.foodName.toLowerCase().includes(query);
        const matchesMess = d.messName.toLowerCase().includes(query);
        if (!matchesName && !matchesMess) return false;
      }

      // Hostel Category
      if (categoryFilter !== 'ALL') {
        const messInfo = CHITKARA_CAMPUS_DIRECTORY.find((h) => h.id === d.messId);
        if (messInfo && messInfo.category !== categoryFilter) return false;
      }

      // Specific Mess
      if (messFilter !== 'ALL' && d.messId !== messFilter) {
        return false;
      }

      // Dietary
      if (dietaryFilter !== 'ALL' && d.foodType !== dietaryFilter) {
        return false;
      }

      // Minimum Portions
      if (minPortions && Number(minPortions) > 0) {
        if (Number(d.portions) < Number(minPortions)) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'DEADLINE') {
        return new Date(a.pickupDeadline) - new Date(b.pickupDeadline);
      }
      if (sortBy === 'QUANTITY') {
        return Number(b.portions) - Number(a.portions);
      }
      if (sortBy === 'RECENT') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    return result;
  }, [availableList, search, categoryFilter, messFilter, dietaryFilter, minPortions, sortBy]);

  return (
    <DashboardLayout title="Available Surplus Food">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="kicker kicker-terracotta" style={{ marginBottom: 6 }}>
              <span>Campus Food Discovery</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
              }}
            >
              Available Surplus Food
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
              Live surplus batches across Chitkara University residential dining halls.
            </p>
          </div>

          <div
            style={{
              padding: '6px 14px',
              backgroundColor: 'var(--color-cream-light)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-cream-border)',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'var(--color-forest)',
            }}
          >
            {filteredDonations.length} {filteredDonations.length === 1 ? 'batch' : 'batches'} available
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Row 1: Search & Reset */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by dish name or mess..."
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-cream-border)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: 'var(--color-cream-tint)',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Row 2: Category, Mess, Dietary, Min Portions, Sort */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                Hostel Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setMessFilter('ALL');
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-cream-border)',
                  fontSize: '0.84rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Hostels</option>
                <option value="BOYS">Boys' Hostels (4)</option>
                <option value="GIRLS">Girls' Hostels (3)</option>
              </select>
            </div>

            {/* Individual Mess Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                Specific Dining Mess
              </label>
              <select
                value={messFilter}
                onChange={(e) => setMessFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-cream-border)',
                  fontSize: '0.84rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="ALL">All 7 Messes</option>
                {CHITKARA_CAMPUS_DIRECTORY.filter(
                  (h) => categoryFilter === 'ALL' || h.category === categoryFilter
                ).map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.category === 'BOYS' ? 'Boys' : 'Girls'})
                  </option>
                ))}
              </select>
            </div>

            {/* Dietary Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                Dietary Preference
              </label>
              <select
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-cream-border)',
                  fontSize: '0.84rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Diets</option>
                <option value="VEG">Veg Only</option>
                <option value="NON_VEG">Non-Veg Only</option>
              </select>
            </div>

            {/* Min Portions */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                Min Portions
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 15"
                value={minPortions}
                onChange={(e) => setMinPortions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-cream-border)',
                  fontSize: '0.84rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              />
            </div>

            {/* Sort Options */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-cream-border)',
                  fontSize: '0.84rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="DEADLINE">Earliest Deadline (Default)</option>
                <option value="QUANTITY">Largest Available Quantity</option>
                <option value="RECENT">Recently Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Discovery Marketplace Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Utensils size={36} color="var(--color-cream-border)" style={{ margin: '0 auto 12px auto' }} />
            <p>Scanning campus messes for surplus food batches...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '60px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Utensils size={40} color="var(--color-cream-border)" style={{ margin: '0 auto 14px auto' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-forest-dark)', margin: '0 0 6px 0' }}>
              No Available Donations Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 440, margin: '0 auto 18px auto' }}>
              No surplus batches match your current filter settings. Try adjusting your search query, dietary preference, or minimum portions.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {filteredDonations.map((don) => {
              const isVeg = don.foodType === 'VEG';
              const now = new Date();
              const deadline = new Date(don.pickupDeadline);
              const msLeft = deadline - now;
              const isUrgent = msLeft > 0 && msLeft <= 2.5 * 60 * 60 * 1000;
              const imageUrl = getFoodImage(don.foodName);

              return (
                <div
                  key={don.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: isUrgent ? '1.5px solid rgba(201, 108, 75, 0.45)' : '1.5px solid var(--color-cream-border)',
                    overflow: 'hidden',
                    boxShadow: isUrgent ? '0 6px 20px rgba(201, 108, 75, 0.1)' : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  className="food-marketplace-card"
                >
                  <div>
                    {/* Top Food Image Container */}
                    <div style={{ position: 'relative', height: 180, backgroundColor: 'var(--color-forest-dark)', overflow: 'hidden' }}>
                      <img
                        src={imageUrl}
                        alt={don.foodName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          filter: 'contrast(1.02)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(16, 41, 34, 0.8) 0%, transparent 60%)',
                        }}
                      />

                      {/* Top Badges */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          right: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: isVeg ? 'rgba(169, 198, 160, 0.95)' : 'rgba(201, 108, 75, 0.95)',
                            color: isVeg ? 'var(--color-forest-dark)' : '#FFFFFF',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        >
                          {isVeg ? 'Veg' : 'Non-Veg'}
                        </span>

                        <span
                          style={{
                            fontSize: '0.64rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'rgba(0, 0, 0, 0.55)',
                            color: '#FFFFFF',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          Representative Image
                        </span>
                      </div>

                      {/* Image Bottom Overlay Info */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 14,
                          right: 14,
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700 }}>
                          {don.portions} <span style={{ fontSize: '0.86rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--color-cream)' }}>portions</span>
                        </div>

                        {isUrgent && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor: 'var(--color-terracotta)',
                              color: '#FFFFFF',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-pill)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Clock size={11} />
                            <span>Approaching Deadline</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '16px 20px 12px' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.25rem',
                          color: 'var(--color-forest-dark)',
                          margin: '0 0 6px 0',
                          lineHeight: 1.25,
                        }}
                      >
                        {don.foodName}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.84rem', color: 'var(--color-forest)', fontWeight: 600, marginBottom: 12 }}>
                        <Building2 size={14} color="var(--color-forest)" />
                        <span>{don.messName}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} color="var(--color-terracotta)" />
                          <span>
                            Pickup deadline: <strong>{deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={13} color="var(--color-forest)" />
                          <span>{don.pickupLocation || 'Kitchen Dispatch Gate 1'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      padding: '12px 20px 16px',
                      borderTop: '1px solid var(--color-cream-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDonation(don)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-forest)',
                        fontSize: '0.84rem',
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
                      Claim Donation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
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
