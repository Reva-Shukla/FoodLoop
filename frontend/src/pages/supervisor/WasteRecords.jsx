import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import { analyticsService } from '../../services/analyticsService';
import { CHITKARA_CAMPUS_DIRECTORY } from '../../data/hostels';
import {
  Trash2,
  Filter,
  Search,
  Calendar,
  Building2,
  AlertTriangle,
  RotateCcw,
  Eye,
  X,
  PieChart,
  BarChart3
} from 'lucide-react';

export default function WasteRecords() {
  const { user } = useAuth();
  const { wasteRecords } = useFoodLoop();

  // Filters
  const [period, setPeriod] = useState('ALL'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [category, setCategory] = useState('ALL');
  const [messId, setMessId] = useState('ALL');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Analytics summary state
  const [wasteData, setWasteData] = useState({
    totalDiscarded: 0,
    reasons: [],
    highestMess: { messName: 'None', portions: 0 },
    topReason: { reason: 'None', portions: 0 },
    recordsCount: 0,
    records: [],
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Close details modal on Escape key
  useEffect(() => {
    if (!selectedRecord) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedRecord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecord]);

  useEffect(() => {
    let mounted = true;
    const fetchWaste = async () => {
      setLoading(true);
      const res = await analyticsService.getWasteBreakdown({ period, category, messId });
      if (mounted) {
        setWasteData(res);
        setLoading(false);
      }
    };

    fetchWaste();
    return () => {
      mounted = false;
    };
  }, [wasteRecords, period, category, messId]);

  // Filter the individual table rows
  const filteredRecords = useMemo(() => {
    return wasteData.records.filter((w) => {
      if (reasonFilter !== 'ALL' && w.reason !== reasonFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mFood = w.foodName.toLowerCase().includes(q);
        const mMess = w.messName.toLowerCase().includes(q);
        const mNotes = (w.notes || '').toLowerCase().includes(q);
        if (!mFood && !mMess && !mNotes) return false;
      }
      return true;
    });
  }, [wasteData.records, reasonFilter, search]);

  const handleReset = () => {
    setPeriod('ALL');
    setCategory('ALL');
    setMessId('ALL');
    setReasonFilter('ALL');
    setSearch('');
  };

  return (
    <DashboardLayout title="Waste Records">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="kicker kicker-terracotta" style={{ marginBottom: 6 }}>
              <span>Kitchen Loss & Disposal Monitoring</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
              }}
            >
              Discarded Surplus Records
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
              Read-only campus audit logs of unserved surplus food discarded at hostel mess kitchens.
            </p>
          </div>

          <div
            style={{
              padding: '6px 14px',
              backgroundColor: 'var(--color-terracotta-light)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(201, 108, 75, 0.3)',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--color-terracotta-dark)',
            }}
          >
            {wasteData.totalDiscarded} portions total discarded
          </div>
        </div>

        {/* 4 Summary Highlight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-cream-border)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Total Discarded Surplus
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-terracotta)', lineHeight: 1.1 }}>
              {wasteData.totalDiscarded} <span style={{ fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>portions</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Across {wasteData.recordsCount} disposal events
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-cream-border)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Highest Discard Mess
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1.2 }}>
              {wasteData.highestMess.messName}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-terracotta)', marginTop: 4, fontWeight: 600 }}>
              {wasteData.highestMess.portions} portions recorded
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-cream-border)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Primary Disposal Reason
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1.2 }}>
              {wasteData.topReason.reason}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {wasteData.topReason.portions} portions ({wasteData.totalDiscarded > 0 ? ((wasteData.topReason.portions / wasteData.totalDiscarded) * 100).toFixed(1) : 0}%)
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-cream-border)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Audit Compliance
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-forest)', lineHeight: 1.2 }}>
              100% Verified
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Every log tied to source batch & notes
            </div>
          </div>
        </div>

        {/* Reason Breakdown Bars */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-cream-border)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--color-forest-dark)', margin: '0 0 14px 0' }}>
            Disposal Reasons Breakdown
          </h3>
          {wasteData.reasons.length === 0 ? (
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
              No waste records in the selected period.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wasteData.reasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{r.reason}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong>{r.portions} portions</strong> ({r.percentage}%)
                    </span>
                  </div>
                  <div style={{ height: 10, width: '100%', backgroundColor: 'var(--color-cream-light)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${r.percentage}%`, height: '100%', backgroundColor: 'var(--color-terracotta)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters Toolbar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            alignItems: 'flex-end',
          }}
        >
          {/* Period Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.84rem' }}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Hostel Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setMessId('ALL');
              }}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.84rem' }}
            >
              <option value="ALL">All Categories</option>
              <option value="BOYS">Boys' Hostels (4)</option>
              <option value="GIRLS">Girls' Hostels (3)</option>
            </select>
          </div>

          {/* Mess Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Dining Mess
            </label>
            <select
              value={messId}
              onChange={(e) => setMessId(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.84rem' }}
            >
              <option value="ALL">All 7 Messes</option>
              {CHITKARA_CAMPUS_DIRECTORY.filter(
                (h) => category === 'ALL' || h.category === category
              ).map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Disposal Reason
            </label>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.84rem' }}
            >
              <option value="ALL">All Reasons</option>
              <option value="Over-prepared / unserved">Over-prepared / unserved</option>
              <option value="Quality degradation">Quality degradation</option>
              <option value="Unclaimed surplus">Unclaimed surplus</option>
              <option value="Mess closing time">Mess closing time</option>
              <option value="Contamination risk">Contamination risk</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Search Records
            </label>
            <input
              type="text"
              placeholder="Search dish or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', fontSize: '0.84rem' }}
            />
          </div>

          {/* Reset Button */}
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

        {/* Waste Records Audit Table */}
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
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Hostel Mess</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Food / Batch</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right', color: 'var(--color-terracotta)' }}>Portions Discarded</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Disposal Reason</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Audit Notes</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No waste records match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((w) => (
                    <tr
                      key={w.id}
                      style={{ borderBottom: '1px solid var(--color-cream-border)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-cream-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(w.discardedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                        {w.messName}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{w.foodName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {w.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg'} • Batch Ref: #{w.mealRecordId || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-terracotta)' }}>
                        {w.portionsDiscarded} portions
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-terracotta-light)', color: 'var(--color-terracotta-dark)', fontWeight: 600 }}>
                          {w.reason}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 220 }}>
                        {w.notes || 'No notes entered'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(w)}
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
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Waste Details Modal */}
        {selectedRecord && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(16, 41, 34, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setSelectedRecord(null)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 520,
                width: '100%',
                padding: '28px 30px',
                boxShadow: 'var(--shadow-xl)',
                border: '1.5px solid var(--color-cream-border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <span className="kicker kicker-terracotta">Waste Disposal Log Details</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--color-forest-dark)', margin: '4px 0 0 0' }}>
                    {selectedRecord.foodName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.86rem', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dining Mess</span>
                  <strong>{selectedRecord.messName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Portions Discarded</span>
                  <strong style={{ color: 'var(--color-terracotta)' }}>{selectedRecord.portionsDiscarded} portions</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Disposal Reason</span>
                  <strong>{selectedRecord.reason}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Timestamp</span>
                  <span>{new Date(selectedRecord.discardedAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Source Meal Ref</span>
                  <span>#{selectedRecord.mealRecordId || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Manager Audit Notes</span>
                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-cream-light)', borderRadius: 'var(--radius-sm)', color: 'var(--color-forest-dark)' }}>
                    {selectedRecord.notes || 'No additional notes provided.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close Audit View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
