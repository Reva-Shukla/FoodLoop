import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import {
  Search,
  Filter,
  Eye,
  X,
  Package,
  HeartHandshake,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  MapPin,
  ShieldCheck
} from 'lucide-react';

export default function MyDonations() {
  const { activeHostel } = useAuth();
  const { donations } = useFoodLoop();

  const messId = activeHostel?.id || 'mess-b-franklin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedDonation) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedDonation(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDonation]);

  // Filter donations for this mess
  const filteredDonations = useMemo(() => {
    return donations
      .filter((d) => d.messId === messId)
      .filter((d) => {
        if (search && !d.foodName.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (statusFilter !== 'ALL') {
          // Map PICKED_UP and COMPLETED together
          if (statusFilter === 'PICKED_UP') {
            return d.status === 'PICKED_UP' || d.status === 'COMPLETED';
          }
          return d.status === statusFilter;
        }
        return true;
      });
  }, [donations, messId, search, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'var(--color-saffron-light)',
          color: 'var(--color-saffron-dark)',
          label: 'Available',
        };
      case 'CLAIMED':
        return {
          bg: 'var(--color-terracotta-light)',
          color: 'var(--color-terracotta)',
          label: 'Claimed (En Route)',
        };
      case 'PICKED_UP':
      case 'COMPLETED':
        return {
          bg: 'var(--color-sage-light)',
          color: 'var(--color-forest)',
          label: 'Picked Up (Completed)',
        };
      case 'EXPIRED':
        return {
          bg: '#FDECE8',
          color: '#A83B24',
          label: 'Expired',
        };
      default:
        return {
          bg: 'var(--color-cream-tint)',
          color: 'var(--text-dark)',
          label: status,
        };
    }
  };

  return (
    <DashboardLayout title="My Donations">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header & Quick Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 2.2vw, 1.9rem)',
                color: 'var(--color-forest-dark)',
                margin: 0,
              }}
            >
              Surplus Donation Batches
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Batches published for NGO collection from <strong>{activeHostel?.name || 'Franklin Mess'}</strong>.
            </p>
          </div>

          <Link
            to="/mess/create-donation"
            className="btn btn-saffron btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <HeartHandshake size={15} />
            <span>Create New Donation</span>
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donation food name..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-cream-border)',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Status Filter Buttons */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-cream-tint)',
              padding: 3,
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-cream-border)',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {[
              { key: 'ALL', label: 'All' },
              { key: 'AVAILABLE', label: 'Available' },
              { key: 'CLAIMED', label: 'Claimed' },
              { key: 'PICKED_UP', label: 'Picked Up' },
              { key: 'EXPIRED', label: 'Expired' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: statusFilter === tab.key ? 700 : 500,
                  backgroundColor: statusFilter === tab.key ? 'var(--color-forest)' : 'transparent',
                  color: statusFilter === tab.key ? 'var(--color-cream)' : 'var(--color-forest)',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Donations Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            overflowX: 'auto',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {filteredDonations.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Package size={32} color="var(--color-cream-border)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontSize: '0.94rem', margin: 0 }}>
                No donations match the selected filter.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Batch / Food</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Dietary</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', textAlign: 'right' }}>Portions</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Pickup Deadline</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((don) => {
                  const badge = getStatusBadge(don.status);
                  return (
                    <tr
                      key={don.id}
                      style={{
                        borderBottom: '1px solid var(--color-cream-border)',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-cream-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                          {don.foodName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Created {new Date(don.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            backgroundColor: don.foodType === 'NON_VEG' ? 'var(--color-terracotta-light)' : 'var(--color-sage-subtle)',
                            borderRadius: 'var(--radius-pill)',
                            color: don.foodType === 'NON_VEG' ? 'var(--color-terracotta-dark)' : 'var(--color-forest)',
                          }}
                        >
                          {don.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                        {don.portions} portions
                      </td>

                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(don.pickupDeadline).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDonation(don)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--color-cream-border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.78rem',
                            color: 'var(--color-forest)',
                            fontWeight: 600,
                          }}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Detailed Donation Modal */}
        {selectedDonation && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(16, 41, 34, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setSelectedDonation(null)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 580,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px 32px',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--color-saffron)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Donation Details
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.45rem',
                      color: 'var(--color-forest-dark)',
                      margin: '4px 0 0 0',
                    }}
                  >
                    {selectedDonation.foodName}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Source: <strong style={{ color: 'var(--color-forest)' }}>{selectedDonation.messName}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 4,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: getStatusBadge(selectedDonation.status).bg,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 20,
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getStatusBadge(selectedDonation.status).color, textTransform: 'uppercase' }}>
                  Status: {getStatusBadge(selectedDonation.status).label}
                </span>

                <span style={{ fontSize: '0.94rem', fontWeight: 800, color: getStatusBadge(selectedDonation.status).color }}>
                  {selectedDonation.portions} portions
                </span>
              </div>

              {/* Details List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dietary Type</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{selectedDonation.foodType}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pickup Location</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{selectedDonation.pickupLocation || 'Kitchen Dispatch Gate 1'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Thermal / Storage</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{selectedDonation.storageConditions || 'Standard safe holding'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Allergens</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{selectedDonation.allergens || 'None reported'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pickup Deadline</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-terracotta)' }}>
                    {new Date(selectedDonation.pickupDeadline).toLocaleString()}
                  </span>
                </div>

                {selectedDonation.claimedByNGO && (
                  <div style={{ backgroundColor: 'var(--color-cream-light)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', marginBottom: 4 }}>
                      NGO Claim Details:
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--color-forest-dark)' }}>
                      <strong>{selectedDonation.claimedByNGO.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Claimed at: {new Date(selectedDonation.claimedByNGO.claimedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
