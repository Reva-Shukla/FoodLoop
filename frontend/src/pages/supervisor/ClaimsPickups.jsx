import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import {
  HeartHandshake,
  Package,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  RotateCcw
} from 'lucide-react';

export default function ClaimsPickups() {
  const { user } = useAuth();
  const { claims, pickups } = useFoodLoop();

  const [activeTab, setActiveTab] = useState('CLAIMS'); // 'CLAIMS' | 'PICKUPS'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Summary counts
  const summary = useMemo(() => {
    const now = new Date();
    let activeClaims = 0;
    let scheduledPickups = 0;
    let completedPickups = 0;
    let missedPickups = 0;

    claims.forEach((c) => {
      if (c.status === 'ACTIVE' && new Date(c.pickupDeadline) > now) {
        activeClaims++;
      }
    });

    pickups.forEach((p) => {
      if (p.status === 'COMPLETED') {
        completedPickups++;
      } else if (p.status === 'MISSED' || new Date(p.pickupDeadline) <= now) {
        missedPickups++;
      } else if (p.status === 'SCHEDULED') {
        scheduledPickups++;
      }
    });

    return {
      activeClaims,
      scheduledPickups,
      completedPickups,
      missedPickups,
      totalClaims: claims.length,
      totalPickups: pickups.length,
    };
  }, [claims, pickups]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    const now = new Date();
    return claims.filter((c) => {
      const isExpired = new Date(c.pickupDeadline) <= now;
      const derivedStatus = c.status === 'ACTIVE' && isExpired ? 'EXPIRED' : c.status;

      if (statusFilter !== 'ALL' && derivedStatus !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mFood = c.foodName.toLowerCase().includes(q);
        const mMess = c.messName.toLowerCase().includes(q);
        const mNgo = (c.ngoName || '').toLowerCase().includes(q);
        const mId = c.id.toLowerCase().includes(q);
        if (!mFood && !mMess && !mNgo && !mId) return false;
      }
      return true;
    });
  }, [claims, statusFilter, search]);

  // Filtered Pickups
  const filteredPickups = useMemo(() => {
    const now = new Date();
    return pickups.filter((p) => {
      const isExpired = new Date(p.pickupDeadline) <= now;
      const derivedStatus = p.status === 'SCHEDULED' && isExpired ? 'MISSED' : p.status;

      if (statusFilter !== 'ALL' && derivedStatus !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mFood = p.foodName.toLowerCase().includes(q);
        const mMess = p.messName.toLowerCase().includes(q);
        const mNgo = (p.ngoName || '').toLowerCase().includes(q);
        const mId = p.id.toLowerCase().includes(q);
        if (!mFood && !mMess && !mNgo && !mId) return false;
      }
      return true;
    });
  }, [pickups, statusFilter, search]);

  return (
    <DashboardLayout title="Claims & Pickups Monitoring">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="kicker kicker-forest" style={{ marginBottom: 6 }}>
              <span>Logistics & Handover Auditing</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
              }}
            >
              Claims & Collection Pickups
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
              Campus-wide administrative audit of NGO claims, scheduled dispatches, and confirmed handovers.
            </p>
          </div>
        </div>

        {/* 4 Summary Counter Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ backgroundColor: 'rgba(251, 239, 234, 0.45)', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(201, 108, 75, 0.35)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-terracotta)', textTransform: 'uppercase' }}>
              Active Claims
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-terracotta)', marginTop: 2 }}>
              {summary.activeClaims}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Batches reserved by NGOs
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(235, 242, 233, 0.45)', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(169, 198, 160, 0.4)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
              Scheduled Pickups
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-forest)', marginTop: 2 }}>
              {summary.scheduledPickups}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Pending arrival at mess
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-cream-border)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-forest-dark)', textTransform: 'uppercase' }}>
              Completed Pickups
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginTop: 2 }}>
              {summary.completedPickups}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Confirmed handovers
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-cream-border)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', backgroundColor: '#F9F9F9' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Missed / Expired
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>
              {summary.missedPickups}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Passed deadline without collection
            </div>
          </div>
        </div>

        {/* Tab Selector & Filter Bar */}
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
            gap: 16,
          }}
        >
          {/* Main Tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('CLAIMS');
                setStatusFilter('ALL');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: activeTab === 'CLAIMS' ? '1.5px solid var(--color-forest)' : '1px solid var(--color-cream-border)',
                backgroundColor: activeTab === 'CLAIMS' ? 'var(--color-forest)' : 'var(--color-cream-light)',
                color: activeTab === 'CLAIMS' ? '#FFFFFF' : 'var(--color-forest-dark)',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'CLAIMS' ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <HeartHandshake size={14} />
              <span>Claims Directory ({claims.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('PICKUPS');
                setStatusFilter('ALL');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: activeTab === 'PICKUPS' ? '1.5px solid var(--color-forest)' : '1px solid var(--color-cream-border)',
                backgroundColor: activeTab === 'PICKUPS' ? 'var(--color-forest)' : 'var(--color-cream-light)',
                color: activeTab === 'PICKUPS' ? '#FFFFFF' : 'var(--color-forest-dark)',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'PICKUPS' ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Package size={14} />
              <span>Collection Pickups ({pickups.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} by food, mess, NGO...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-cream-border)',
                fontSize: '0.82rem',
                outline: 'none',
                backgroundColor: 'var(--color-cream-tint)',
              }}
            />
          </div>
        </div>

        {/* Tables Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          {activeTab === 'CLAIMS' ? (
            /* Claims Table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Claim Ref</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Donation Ref</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>NGO Partner</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Source Mess</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Food Item</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Portions</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Claim Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Deadline</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No claims match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((c) => {
                      const now = new Date();
                      const isExpired = new Date(c.pickupDeadline) <= now;
                      const status = c.status === 'ACTIVE' && isExpired ? 'EXPIRED' : c.status;

                      return (
                        <tr
                          key={c.id}
                          style={{ borderBottom: '1px solid var(--color-cream-border)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-cream-light)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                            {c.id}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            #{c.donationId}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                            {c.ngoName || 'NGO Partner'}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest)' }}>
                            {c.messName}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.foodName}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                            {c.portions} portions
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {new Date(c.claimedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: isExpired ? '#A83B24' : 'var(--color-terracotta)' }}>
                            {new Date(c.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor:
                                  status === 'ACTIVE'
                                    ? 'var(--color-terracotta-light)'
                                    : status === 'COMPLETED'
                                    ? 'var(--color-sage-subtle)'
                                    : '#F5F5F5',
                                color:
                                  status === 'ACTIVE'
                                    ? 'var(--color-terracotta-dark)'
                                    : status === 'COMPLETED'
                                    ? 'var(--color-forest)'
                                    : 'var(--text-muted)',
                              }}
                            >
                              {status === 'COMPLETED' ? 'Collected' : status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Pickups Table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Pickup ID</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Claim Ref</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>NGO Account</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Source Mess</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Portions</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Pickup Location</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Deadline</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Completion Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPickups.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No pickups match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredPickups.map((p) => {
                      const now = new Date();
                      const isExpired = new Date(p.pickupDeadline) <= now;
                      const status = p.status === 'SCHEDULED' && isExpired ? 'MISSED' : p.status;

                      return (
                        <tr
                          key={p.id}
                          style={{ borderBottom: '1px solid var(--color-cream-border)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-cream-light)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                            {p.id}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            #{p.claimId || 'N/A'}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.ngoName || 'NGO Partner'}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest)' }}>
                            {p.messName}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                            {p.portions} portions
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {p.pickupLocation || 'Kitchen Dispatch Gate 1'}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: isExpired ? '#A83B24' : 'var(--color-terracotta)' }}>
                            {new Date(p.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {p.completedAt
                              ? new Date(p.completedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : <span style={{ color: 'var(--text-muted)' }}>Pending Handover</span>}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor:
                                  status === 'SCHEDULED'
                                    ? 'var(--color-terracotta-light)'
                                    : status === 'COMPLETED'
                                    ? 'var(--color-sage-subtle)'
                                    : '#F5F5F5',
                                color:
                                  status === 'SCHEDULED'
                                    ? 'var(--color-terracotta-dark)'
                                    : status === 'COMPLETED'
                                    ? 'var(--color-forest)'
                                    : 'var(--text-muted)',
                              }}
                            >
                              {status === 'COMPLETED' ? 'Collected' : status === 'MISSED' ? 'Missed' : 'Scheduled'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
