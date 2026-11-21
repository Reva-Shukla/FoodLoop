import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import DonationDetailsModal from '../../components/ngo/DonationDetailsModal';
import { analyticsService } from '../../services/analyticsService';
import { CHITKARA_CAMPUS_DIRECTORY } from '../../data/hostels';
import {
  HeartHandshake,
  Search,
  Filter,
  Clock,
  Building2,
  Calendar,
  Eye,
  RotateCcw,
  CheckCircle2,
  Package
} from 'lucide-react';

export default function SupervisorDonations() {
  const { user } = useAuth();
  const { donations } = useFoodLoop();

  // Filters
  const [period, setPeriod] = useState('ALL'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [category, setCategory] = useState('ALL');
  const [messId, setMessId] = useState('ALL');
  const [dietary, setDietary] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'CLAIMED' | 'PICKED_UP' | 'EXPIRED'
  const [search, setSearch] = useState('');
  const [sortDeadlineAsc, setSortDeadlineAsc] = useState(true);

  // Modal
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Summary Metrics
  const summary = useMemo(() => {
    let availableCount = 0;
    let availablePortions = 0;
    let claimedCount = 0;
    let claimedPortions = 0;
    let pickedUpCount = 0;
    let pickedUpPortions = 0;
    let expiredCount = 0;
    let expiredPortions = 0;

    donations.forEach((d) => {
      const q = parseInt(d.portions, 10) || 0;
      if (d.status === 'AVAILABLE') {
        availableCount++;
        availablePortions += q;
      } else if (d.status === 'CLAIMED') {
        claimedCount++;
        claimedPortions += q;
      } else if (d.status === 'PICKED_UP' || d.status === 'COMPLETED') {
        pickedUpCount++;
        pickedUpPortions += q;
      } else if (d.status === 'EXPIRED') {
        expiredCount++;
        expiredPortions += q;
      }
    });

    return {
      availableCount,
      availablePortions,
      claimedCount,
      claimedPortions,
      pickedUpCount,
      pickedUpPortions,
      expiredCount,
      expiredPortions,
    };
  }, [donations]);

  // Filtered donations list
  const filteredDonations = useMemo(() => {
    let list = donations.filter((d) => {
      // Period
      if (!analyticsService.isDateInFilter(d.createdAt, period)) return false;

      // Category
      if (category !== 'ALL') {
        const h = CHITKARA_CAMPUS_DIRECTORY.find((dir) => dir.id === d.messId);
        if (!h || h.category !== category) return false;
      }

      // Mess
      if (messId !== 'ALL' && d.messId !== messId) return false;

      // Dietary
      if (dietary !== 'ALL' && d.foodType !== dietary) return false;

      // Status
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const mFood = d.foodName.toLowerCase().includes(q);
        const mMess = d.messName.toLowerCase().includes(q);
        const mNgo = d.claimedByNGO ? d.claimedByNGO.name.toLowerCase().includes(q) : false;
        if (!mFood && !mMess && !mNgo) return false;
      }

      return true;
    });

    // Sort by deadline
    list.sort((a, b) => {
      const dateA = new Date(a.pickupDeadline);
      const dateB = new Date(b.pickupDeadline);
      return sortDeadlineAsc ? dateA - dateB : dateB - dateA;
    });

    return list;
  }, [donations, period, category, messId, dietary, statusFilter, search, sortDeadlineAsc]);

  const handleReset = () => {
    setPeriod('ALL');
    setCategory('ALL');
    setMessId('ALL');
    setDietary('ALL');
    setStatusFilter('ALL');
    setSearch('');
    setSortDeadlineAsc(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'AVAILABLE') {
      return { label: 'Available', bg: 'var(--color-saffron-light)', color: 'var(--color-saffron-dark)' };
    }
    if (status === 'CLAIMED') {
      return { label: 'Claimed', bg: 'var(--color-terracotta-light)', color: 'var(--color-terracotta-dark)' };
    }
    if (status === 'PICKED_UP' || status === 'COMPLETED') {
      return { label: 'Picked Up', bg: 'var(--color-sage-subtle)', color: 'var(--color-forest)' };
    }
    return { label: 'Expired', bg: '#F5F5F5', color: 'var(--text-muted)' };
  };

  return (
    <DashboardLayout title="Campus Donations Monitoring">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="kicker kicker-forest" style={{ marginBottom: 6 }}>
              <span>Redistribution Tracking</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
              }}
            >
              Donation Batches Directory
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
              Campus-wide audit of all surplus food batches published, claimed, collected, or expired across the 7 dining halls.
            </p>
          </div>
        </div>

        {/* 4 Summary Counter Cards (Counts vs Portions explicitly distinguished) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(230, 162, 60, 0.4)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', backgroundColor: 'rgba(253, 243, 227, 0.4)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-saffron-dark)', textTransform: 'uppercase' }}>
              Available
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-saffron-dark)', marginTop: 2 }}>
              {summary.availableCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>batches</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <strong>{summary.availablePortions} portions</strong> awaiting claim
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(201, 108, 75, 0.35)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', backgroundColor: 'rgba(251, 239, 234, 0.4)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-terracotta)', textTransform: 'uppercase' }}>
              Claimed
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-terracotta)', marginTop: 2 }}>
              {summary.claimedCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>batches</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <strong>{summary.claimedPortions} portions</strong> en route to pickup
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(169, 198, 160, 0.4)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', backgroundColor: 'rgba(235, 242, 233, 0.4)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
              Picked Up
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-forest)', marginTop: 2 }}>
              {summary.pickedUpCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>batches</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <strong>{summary.pickedUpPortions} portions</strong> successfully collected
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-cream-border)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', backgroundColor: '#F9F9F9' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Expired
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>
              {summary.expiredCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>batches</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <strong>{summary.expiredPortions} portions</strong> passed deadline
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            alignItems: 'flex-end',
          }}
        >
          {/* Period */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.82rem' }}>
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setMessId('ALL');
              }}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.82rem' }}
            >
              <option value="ALL">All Hostels</option>
              <option value="BOYS">Boys' Hostels (4)</option>
              <option value="GIRLS">Girls' Hostels (3)</option>
            </select>
          </div>

          {/* Mess */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Dining Mess</label>
            <select value={messId} onChange={(e) => setMessId(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.82rem' }}>
              <option value="ALL">All 7 Messes</option>
              {CHITKARA_CAMPUS_DIRECTORY.filter((h) => category === 'ALL' || h.category === category).map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* Dietary */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Dietary</label>
            <select value={dietary} onChange={(e) => setDietary(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.82rem' }}>
              <option value="ALL">All Diets</option>
              <option value="VEG">Veg Only</option>
              <option value="NON_VEG">Non-Veg Only</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.82rem' }}>
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="CLAIMED">Claimed</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Search</label>
            <input
              type="text"
              placeholder="Search food or NGO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.82rem' }}
            />
          </div>

          {/* Reset */}
          <div>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Donations Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Batch / Food Item</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Source Mess</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Dietary</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right', color: 'var(--color-forest-dark)' }}>Quantity</th>
                  <th
                    style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', cursor: 'pointer' }}
                    onClick={() => setSortDeadlineAsc(!sortDeadlineAsc)}
                  >
                    Pickup Deadline ↕
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Claiming NGO</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No donation records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => {
                    const badge = getStatusBadge(d.status);
                    return (
                      <tr
                        key={d.id}
                        style={{ borderBottom: '1px solid var(--color-cream-border)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-cream-light)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{d.foodName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ref: #{d.id}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest)' }}>
                          {d.messName}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: 'var(--radius-pill)', backgroundColor: d.foodType === 'NON_VEG' ? 'var(--color-terracotta-light)' : 'var(--color-sage-subtle)', color: d.foodType === 'NON_VEG' ? 'var(--color-terracotta-dark)' : 'var(--color-forest)', fontWeight: 700 }}>
                            {d.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                          {d.portions} portions
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(d.pickupDeadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--color-forest-dark)' }}>
                          {d.claimedByNGO ? <strong>{d.claimedByNGO.name}</strong> : <span style={{ color: 'var(--text-muted)' }}>Unclaimed</span>}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedDonation(d)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--color-cream-border)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '4px 8px',
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
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Read-Only Details Modal */}
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
