import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import DonationDetailsModal from '../../components/ngo/DonationDetailsModal';
import {
  HeartHandshake,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  Package,
  Eye,
  ArrowRight,
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';

export default function MyClaims() {
  const { user } = useAuth();
  const { claims, donations, getMyClaims, getDonationById } = useFoodLoop();
  const navigate = useNavigate();

  const ngoId = user?.id || 'user-ngo-01';

  const [myClaimsList, setMyClaimsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
  const [search, setSearch] = useState('');

  // Modal
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchClaims = async () => {
      setLoading(true);
      const list = await getMyClaims(ngoId);
      if (mounted) {
        setMyClaimsList(list);
        setLoading(false);
      }
    };

    fetchClaims();
    return () => {
      mounted = false;
    };
  }, [claims, donations, ngoId, getMyClaims]);

  const handleViewDetails = async (donationId) => {
    const don = await getDonationById(donationId);
    if (don) {
      setSelectedDonation(don);
    }
  };

  const filteredClaims = useMemo(() => {
    const now = new Date();
    return myClaimsList.filter((claim) => {
      // Dynamic status calculation
      let currentStatus = claim.status;
      if (currentStatus === 'ACTIVE' && new Date(claim.pickupDeadline) <= now) {
        currentStatus = 'EXPIRED';
      }

      // Filter by status
      if (statusFilter !== 'ALL' && currentStatus !== statusFilter) {
        return false;
      }

      // Filter by text
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = claim.foodName.toLowerCase().includes(q);
        const matchMess = claim.messName.toLowerCase().includes(q);
        const matchId = claim.id.toLowerCase().includes(q);
        if (!matchName && !matchMess && !matchId) return false;
      }

      return true;
    });
  }, [myClaimsList, statusFilter, search]);

  const getStatusBadge = (status, deadline) => {
    const isExpired = new Date(deadline) <= new Date();
    if (status === 'ACTIVE' && isExpired) {
      return {
        label: 'Expired',
        bg: '#F5F5F5',
        color: 'var(--text-muted)',
      };
    }
    if (status === 'ACTIVE') {
      return {
        label: 'Active Claim',
        bg: 'var(--color-terracotta-light)',
        color: 'var(--color-terracotta-dark)',
      };
    }
    if (status === 'COMPLETED') {
      return {
        label: 'Collected',
        bg: 'var(--color-sage-subtle)',
        color: 'var(--color-forest)',
      };
    }
    return {
      label: status,
      bg: '#F5F5F5',
      color: 'var(--text-muted)',
    };
  };

  return (
    <DashboardLayout title="My Claims">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="kicker kicker-terracotta" style={{ marginBottom: 6 }}>
              <span>Redistribution Claims</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
              }}
            >
              My Claims
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
              Track food batches claimed by your organization across campus messes.
            </p>
          </div>

          <Link
            to="/ngo/my-pickups"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Package size={15} />
            <span>Go to My Pickups</span>
          </Link>
        </div>

        {/* Filters & Status Tabs */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'ALL', label: 'All Claims' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'EXPIRED', label: 'Expired' },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: active ? '1.5px solid var(--color-terracotta)' : '1px solid var(--color-cream-border)',
                    backgroundColor: active ? 'var(--color-terracotta)' : 'var(--color-cream-light)',
                    color: active ? '#FFFFFF' : 'var(--color-forest-dark)',
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search claims..."
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-cream-border)',
                fontSize: '0.84rem',
                outline: 'none',
                backgroundColor: 'var(--color-cream-tint)',
              }}
            />
          </div>
        </div>

        {/* Table View */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            overflowX: 'auto',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {loading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your claims...
            </div>
          ) : filteredClaims.length === 0 ? (
            <div style={{ padding: '56px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HeartHandshake size={36} color="var(--color-cream-border)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ margin: 0, fontSize: '0.94rem' }}>
                No claims match your selected filter.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Claim ID / Batch</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Source Mess</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', textAlign: 'right' }}>Portions</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Pickup Deadline</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => {
                  const now = new Date();
                  const isExpired = new Date(claim.pickupDeadline) <= now;
                  const currentStatus = (claim.status === 'ACTIVE' && isExpired) ? 'EXPIRED' : claim.status;
                  const badge = getStatusBadge(claim.status, claim.pickupDeadline);

                  return (
                    <tr
                      key={claim.id}
                      style={{
                        borderBottom: '1px solid var(--color-cream-border)',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-cream-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                          {claim.foodName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Claimed {new Date(claim.claimedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                          {claim.messName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          {claim.pickupLocation}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                        {claim.portions} portions
                      </td>

                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: isExpired ? '#A83B24' : 'var(--color-terracotta)', fontWeight: isExpired ? 500 : 600 }}>
                        {new Date(claim.pickupDeadline).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} ({new Date(claim.pickupDeadline).toLocaleDateString()})
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
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleViewDetails(claim.donationId)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--color-cream-border)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.76rem',
                              color: 'var(--color-forest)',
                              fontWeight: 600,
                            }}
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>

                          {currentStatus === 'ACTIVE' && (
                            <Link
                              to="/ngo/my-pickups"
                              className="btn btn-primary btn-sm"
                              style={{
                                backgroundColor: 'var(--color-terracotta)',
                                padding: '5px 10px',
                                fontSize: '0.76rem',
                                textDecoration: 'none',
                              }}
                            >
                              <span>Pickup</span>
                              <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Donation Details Modal */}
        {selectedDonation && (
          <DonationDetailsModal
            donation={selectedDonation}
            onClose={() => setSelectedDonation(null)}
            canClaim={false}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
