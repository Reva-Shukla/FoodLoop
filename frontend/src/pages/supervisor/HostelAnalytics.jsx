import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import { analyticsService } from '../../services/analyticsService';
import { CHITKARA_CAMPUS_DIRECTORY } from '../../data/hostels';
import {
  Building2,
  Filter,
  TrendingUp,
  ArrowUpDown,
  Utensils,
  HeartHandshake,
  Trash2,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

export default function HostelAnalytics() {
  const { user } = useAuth();
  const { mealRecords, donations, wasteRecords } = useFoodLoop();

  const [period, setPeriod] = useState('ALL'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [category, setCategory] = useState('ALL'); // 'ALL' | 'BOYS' | 'GIRLS'
  const [sortField, setSortField] = useState('totalSurplus');
  const [sortAsc, setSortAsc] = useState(false);

  // Drill-down selected hostel
  const [selectedMessId, setSelectedMessId] = useState('mess-b-franklin');
  const [comparisonList, setComparisonList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchComparison = async () => {
      setLoading(true);
      const list = await analyticsService.getHostelComparison({ period, category });
      if (mounted) {
        setComparisonList(list);
        setLoading(false);
      }
    };

    fetchComparison();
    return () => {
      mounted = false;
    };
  }, [mealRecords, donations, wasteRecords, period, category]);

  // Sort comparison table
  const sortedHostels = useMemo(() => {
    return [...comparisonList].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'redistributionRate' || sortField === 'surplusWastageRate') {
        valA = a[`${sortField}Num`] || 0;
        valB = b[`${sortField}Num`] || 0;
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [comparisonList, sortField, sortAsc]);

  // Drill-down data for currently selected hostel
  const selectedHostelInfo = useMemo(() => {
    return CHITKARA_CAMPUS_DIRECTORY.find((h) => h.id === selectedMessId) || CHITKARA_CAMPUS_DIRECTORY[0];
  }, [selectedMessId]);

  const selectedHostelStats = useMemo(() => {
    return comparisonList.find((h) => h.messId === selectedMessId) || null;
  }, [comparisonList, selectedMessId]);

  // Associated records for drill-down
  const hostelMeals = useMemo(() => {
    return mealRecords
      .filter((m) => m.messId === selectedMessId)
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [mealRecords, selectedMessId]);

  const hostelDonations = useMemo(() => {
    return donations
      .filter((d) => d.messId === selectedMessId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [donations, selectedMessId]);

  const hostelWaste = useMemo(() => {
    return wasteRecords
      .filter((w) => w.messId === selectedMessId)
      .sort((a, b) => new Date(b.discardedAt) - new Date(a.discardedAt));
  }, [wasteRecords, selectedMessId]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <DashboardLayout title="Hostel Mess Analytics">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="kicker kicker-forest" style={{ marginBottom: 6 }}>
              <span>Campus Dining Analytics</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
              }}
            >
              Hostel Mess Analytics
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
              Comparative portion auditing and individual mess drill-downs across all 7 dining halls.
            </p>
          </div>

          {/* Period Filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'TODAY', label: 'Today' },
              { id: 'WEEK', label: 'This Week' },
              { id: 'MONTH', label: 'This Month' },
              { id: 'ALL', label: 'All Time' },
            ].map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: active ? '1.5px solid var(--color-forest)' : '1px solid var(--color-cream-border)',
                    backgroundColor: active ? 'var(--color-forest)' : '#FFFFFF',
                    color: active ? '#FFFFFF' : 'var(--color-forest-dark)',
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Sortable Comparison Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-cream-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--color-forest-dark)', margin: 0 }}>
              Performance Table ({sortedHostels.length} Messes)
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Click any row or column to inspect & sort
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', cursor: 'pointer' }} onClick={() => toggleSort('messName')}>
                    Hostel Mess <ArrowUpDown size={11} style={{ verticalAlign: 'middle' }} />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('totalPrepared')}>
                    Prepared <ArrowUpDown size={11} style={{ verticalAlign: 'middle' }} />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('totalServed')}>
                    Served <ArrowUpDown size={11} style={{ verticalAlign: 'middle' }} />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', cursor: 'pointer', color: 'var(--color-saffron-dark)' }} onClick={() => toggleSort('totalSurplus')}>
                    Surplus <ArrowUpDown size={11} style={{ verticalAlign: 'middle' }} />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', cursor: 'pointer', color: 'var(--color-forest)' }} onClick={() => toggleSort('foodDonated')}>
                    Donated <ArrowUpDown size={11} style={{ verticalAlign: 'middle' }} />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', cursor: 'pointer', color: 'var(--color-terracotta)' }} onClick={() => toggleSort('foodWasted')}>
                    Wasted <ArrowUpDown size={11} style={{ verticalAlign: 'middle' }} />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>
                    Remaining
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('redistributionRate')}>
                    Redist. % <ArrowUpDown size={11} style={{ verticalAlign: 'middle' }} />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('surplusWastageRate')}>
                    Waste % <ArrowUpDown size={11} style={{ verticalAlign: 'middle' }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedHostels.map((h) => {
                  const isSelected = h.messId === selectedMessId;
                  return (
                    <tr
                      key={h.messId}
                      onClick={() => setSelectedMessId(h.messId)}
                      style={{
                        borderBottom: '1px solid var(--color-cream-border)',
                        backgroundColor: isSelected ? 'var(--color-cream-light)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-cream-tint)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: isSelected ? 'var(--color-forest)' : 'var(--color-forest-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{h.messName}</span>
                          {isSelected && <span style={{ fontSize: '0.68rem', padding: '1px 5px', backgroundColor: 'var(--color-forest)', color: '#FFFFFF', borderRadius: 3 }}>Active</span>}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.categoryLabel}</div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>{h.totalPrepared}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>{h.totalServed}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--color-saffron-dark)' }}>{h.totalSurplus}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--color-forest)' }}>{h.foodDonated}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--color-terracotta)' }}>{h.foodWasted}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>{h.remainingFood}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--color-forest)' }}>{h.redistributionRate}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--color-terracotta)' }}>{h.surplusWastageRate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Detailed Mess Drill-Down Panel */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Header of Drill-down */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="kicker kicker-forest">Selected Dining Hall Drill-Down</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-forest-dark)', margin: '4px 0 0 0' }}>
                {selectedHostelInfo.name} ({selectedHostelInfo.categoryLabel})
              </h3>
            </div>

            {selectedHostelStats && (
              <div style={{ display: 'flex', gap: 14, fontSize: '0.84rem' }}>
                <span style={{ padding: '6px 12px', backgroundColor: 'var(--color-cream-light)', borderRadius: 'var(--radius-sm)' }}>
                  Prep: <strong>{selectedHostelStats.totalPrepared}</strong>
                </span>
                <span style={{ padding: '6px 12px', backgroundColor: 'var(--color-saffron-light)', color: 'var(--color-saffron-dark)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                  Surplus: {selectedHostelStats.totalSurplus}
                </span>
                <span style={{ padding: '6px 12px', backgroundColor: 'var(--color-sage-subtle)', color: 'var(--color-forest)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                  Donated: {selectedHostelStats.foodDonated}
                </span>
                <span style={{ padding: '6px 12px', backgroundColor: 'var(--color-terracotta-light)', color: 'var(--color-terracotta-dark)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                  Wasted: {selectedHostelStats.foodWasted}
                </span>
              </div>
            )}
          </div>

          {/* Drill-down Three Column Layout (Recent Meals, Donations, Waste) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Meal Records */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-forest-dark)', marginBottom: 10 }}>
                <Utensils size={15} color="var(--color-forest)" />
                <span>Recorded Meals ({hostelMeals.length})</span>
              </div>

              {hostelMeals.length === 0 ? (
                <div style={{ padding: '20px 10px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', backgroundColor: 'var(--color-cream-tint)', borderRadius: 'var(--radius-sm)' }}>
                  No meal records for this mess.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {hostelMeals.map((m) => (
                    <div key={m.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', backgroundColor: 'var(--color-cream-light)', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{m.foodName}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: 2 }}>
                        <span>{m.mealType} • {m.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}</span>
                        <span>Surplus: <strong>{m.surplusPortions}</strong> ({m.preparedPortions}p/{m.servedPortions}s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Donation Activity */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-forest-dark)', marginBottom: 10 }}>
                <HeartHandshake size={15} color="var(--color-saffron-dark)" />
                <span>Donation Batches ({hostelDonations.length})</span>
              </div>

              {hostelDonations.length === 0 ? (
                <div style={{ padding: '20px 10px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', backgroundColor: 'var(--color-cream-tint)', borderRadius: 'var(--radius-sm)' }}>
                  No donation batches published.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {hostelDonations.map((d) => (
                    <div key={d.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', backgroundColor: 'var(--color-cream-light)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{d.foodName}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', padding: '1px 6px', borderRadius: 3, backgroundColor: d.status === 'PICKED_UP' ? 'var(--color-sage-subtle)' : d.status === 'CLAIMED' ? 'var(--color-terracotta-light)' : 'var(--color-saffron-light)', color: d.status === 'PICKED_UP' ? 'var(--color-forest)' : d.status === 'CLAIMED' ? 'var(--color-terracotta-dark)' : 'var(--color-saffron-dark)' }}>
                          {d.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: 2 }}>
                        <span>Quantity: <strong>{d.portions} portions</strong></span>
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Waste Records */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-forest-dark)', marginBottom: 10 }}>
                <Trash2 size={15} color="var(--color-terracotta)" />
                <span>Discarded Surplus Logs ({hostelWaste.length})</span>
              </div>

              {hostelWaste.length === 0 ? (
                <div style={{ padding: '20px 10px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', backgroundColor: 'var(--color-cream-tint)', borderRadius: 'var(--radius-sm)' }}>
                  No discarded surplus logged.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {hostelWaste.map((w) => (
                    <div key={w.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', backgroundColor: 'var(--color-cream-light)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{w.foodName}</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-terracotta)' }}>{w.portionsDiscarded} portions</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Reason: {w.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
