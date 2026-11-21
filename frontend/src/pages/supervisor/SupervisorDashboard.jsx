import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import { analyticsService } from '../../services/analyticsService';
import { CHITKARA_CAMPUS_DIRECTORY } from '../../data/hostels';
import {
  ShieldCheck,
  Building2,
  Utensils,
  HeartHandshake,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Filter,
  CheckCircle2,
  Info,
  Package
} from 'lucide-react';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const { donations, mealRecords, wasteRecords, pickups } = useFoodLoop();

  // Filter state
  const [period, setPeriod] = useState('TODAY'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [category, setCategory] = useState('ALL'); // 'ALL' | 'BOYS' | 'GIRLS'
  const [messId, setMessId] = useState('ALL');

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalPrepared: 0,
    totalServed: 0,
    totalSurplus: 0,
    foodDonated: 0,
    foodWasted: 0,
    remainingFood: 0,
    activeReserved: 0,
    unallocatedSurplus: 0,
    redistributionRate: '0.0%',
    redistributionRateNum: 0,
    surplusWastageRate: '0.0%',
    surplusWastageRateNum: 0,
    servingUtilisation: '0.0%',
    mealCount: 0,
  });

  const [hostelComparison, setHostelComparison] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [donationSummary, setDonationSummary] = useState({
    available: { count: 0, portions: 0 },
    claimed: { count: 0, portions: 0 },
    pickedUp: { count: 0, portions: 0 },
    expired: { count: 0, portions: 0 },
    totalBatches: 0,
    totalPortions: 0,
  });
  const [attention, setAttention] = useState({
    highestWasteMess: 'None',
    highestWasteRateMess: 'None',
    topRedistributor: 'None',
    approachingCount: 0,
    missedCount: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch all analytics on filter change
  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      const filter = { period, category, messId };
      const [m, comp, trend, donSum, att] = await Promise.all([
        analyticsService.getCampusMetrics(filter),
        analyticsService.getHostelComparison(filter),
        analyticsService.getMealTrendData(filter),
        analyticsService.getDonationStatusSummary(filter),
        analyticsService.getOperationalAttention(filter),
      ]);

      if (mounted) {
        setMetrics(m);
        setHostelComparison(comp);
        setTrendData(trend);
        setDonationSummary(donSum);
        setAttention(att);
        setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [donations, mealRecords, wasteRecords, pickups, period, category, messId]);

  // Compute Donut SVG parameters
  const donutData = [
    { label: 'Donated', value: metrics.foodDonated, color: 'var(--color-forest)' },
    { label: 'Wasted', value: metrics.foodWasted, color: 'var(--color-terracotta)' },
    { label: 'Remaining', value: metrics.remainingFood, color: 'var(--color-saffron)' },
  ];
  const donutTotal = metrics.totalSurplus || 1; // avoid divide by zero

  // SVG Donut calculation
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <DashboardLayout title="Campus Supervisor Portal">
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 26 }}>
        {/* Editorial Welcome Header */}
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
            background: 'linear-gradient(135deg, #FFFFFF 65%, rgba(24, 60, 50, 0.04) 100%)',
          }}
        >
          <div>
            <div className="kicker kicker-forest" style={{ marginBottom: 8 }}>
              <span>Campus Sustainability Intelligence • Chitkara University</span>
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
              Campus at a glance.
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', margin: 0, maxWidth: 600 }}>
              Monitor every portion. Understand every outcome across all residential dining halls.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                backgroundColor: 'rgba(24, 60, 50, 0.08)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(24, 60, 50, 0.2)',
                fontSize: '0.82rem',
                color: 'var(--color-forest)',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={16} />
              <span>Campus Supervisor</span>
            </div>

            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Period: <strong>{period}</strong> • Cohort-Grouped
            </span>
          </div>
        </div>

        {/* Global Analytical Filter Toolbar */}
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
            gap: 16,
          }}
        >
          {/* Period Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: 4 }}>
              Period:
            </span>
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
                    borderRadius: 'var(--radius-sm)',
                    border: active ? '1.5px solid var(--color-forest)' : '1px solid var(--color-cream-border)',
                    backgroundColor: active ? 'var(--color-forest)' : 'var(--color-cream-light)',
                    color: active ? '#FFFFFF' : 'var(--color-forest-dark)',
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Category & Specific Mess Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Category:
              </span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setMessId('ALL');
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-cream-border)',
                  fontSize: '0.82rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Hostels (7)</option>
                <option value="BOYS">Boys' Hostels (4)</option>
                <option value="GIRLS">Girls' Hostels (3)</option>
              </select>
            </div>

            {/* Individual Mess */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Mess:
              </span>
              <select
                value={messId}
                onChange={(e) => setMessId(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-cream-border)',
                  fontSize: '0.82rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
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
          </div>
        </div>

        {/* 6 Primary Metric Cards (Measured strictly in Portions) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          {/* Card 1: Total Prepared */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Total Prepared
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1.1 }}>
              {metrics.totalPrepared}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              {metrics.mealCount} recorded meal batches
            </div>
          </div>

          {/* Card 2: Total Served */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Total Served
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1.1 }}>
              {metrics.totalServed}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-forest)', marginTop: 6, fontWeight: 600 }}>
              Utilisation: {metrics.servingUtilisation}
            </div>
          </div>

          {/* Card 3: Total Surplus */}
          <div
            style={{
              backgroundColor: 'rgba(253, 243, 227, 0.45)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(230, 162, 60, 0.4)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-saffron-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Total Surplus
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-saffron-dark)', lineHeight: 1.1 }}>
              {metrics.totalSurplus}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              prepared − served
            </div>
          </div>

          {/* Card 4: Food Donated */}
          <div
            style={{
              backgroundColor: 'rgba(235, 242, 233, 0.45)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(169, 198, 160, 0.4)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Food Donated
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-forest)', lineHeight: 1.1 }}>
              {metrics.foodDonated}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-forest)', marginTop: 6, fontWeight: 600 }}>
              Rate: {metrics.redistributionRate}
            </div>
          </div>

          {/* Card 5: Food Wasted */}
          <div
            style={{
              backgroundColor: 'rgba(251, 239, 234, 0.45)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(201, 108, 75, 0.35)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Food Wasted
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-terracotta)', lineHeight: 1.1 }}>
              {metrics.foodWasted}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-terracotta)', marginTop: 6, fontWeight: 600 }}>
              Wastage Rate: {metrics.surplusWastageRate}
            </div>
          </div>

          {/* Card 6: Remaining Food */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Remaining Food
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1.1 }}>
              {metrics.remainingFood}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              Reserved: {metrics.activeReserved} • Unalloc: {metrics.unallocatedSurplus}
            </div>
          </div>
        </div>

        {/* Section 2: Visualisation Split (Trend Chart & Surplus Allocation Donut) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Chart A: Prepared vs Served Trend */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '24px 26px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} color="var(--color-forest)" />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                    Prepared vs. Served Trend
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-forest-dark)' }}>
                    <span style={{ width: 10, height: 10, backgroundColor: 'var(--color-forest-dark)', borderRadius: 2 }} />
                    Prepared
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-sage-dark)' }}>
                    <span style={{ width: 10, height: 10, backgroundColor: 'var(--color-sage)', borderRadius: 2 }} />
                    Served
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                Portion comparison grouped by meal service date across selected dining halls.
              </p>
            </div>

            {/* Custom SVG Trend Bar Visualizer */}
            {trendData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                No meal records in the selected period.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {trendData.map((d) => {
                  const maxVal = Math.max(...trendData.map((t) => t.prepared), 1);
                  const prepWidth = (d.prepared / maxVal) * 100;
                  const servedWidth = (d.served / maxVal) * 100;

                  return (
                    <div key={d.date} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                          {d.date}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Prep: <strong>{d.prepared}</strong> | Srv: <strong>{d.served}</strong> | Surplus: <strong style={{ color: 'var(--color-saffron-dark)' }}>{d.surplus}</strong>
                        </span>
                      </div>

                      {/* Stacked Bars */}
                      <div style={{ height: 12, width: '100%', backgroundColor: 'var(--color-cream-light)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${prepWidth}%`,
                            backgroundColor: 'rgba(24, 60, 50, 0.25)',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            borderRadius: 4,
                          }}
                        />
                        <div
                          style={{
                            height: '100%',
                            width: `${servedWidth}%`,
                            backgroundColor: 'var(--color-forest)',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart B: Surplus Allocation Donut & Lifecycle Breakdown */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '24px 26px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <BarChart3 size={18} color="var(--color-terracotta)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                  Surplus Outcome Allocation
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                Distribution of total surplus ({metrics.totalSurplus} portions) across completed donations, discarded waste, and remaining surplus.
              </p>
            </div>

            {/* Donut Layout */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
              {/* Circular Ring SVG */}
              <div style={{ position: 'relative', width: 160, height: 160 }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="var(--color-cream-light)"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  {metrics.totalSurplus > 0 &&
                    donutData.map((slice, i) => {
                      const slicePercent = slice.value / donutTotal;
                      const strokeDasharray = `${slicePercent * circumference} ${circumference}`;
                      const strokeDashoffset = -accumulatedPercent * circumference;
                      accumulatedPercent += slicePercent;

                      return (
                        <circle
                          key={i}
                          cx="80"
                          cy="80"
                          r={radius}
                          stroke={slice.color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          fill="none"
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      );
                    })}
                </svg>

                {/* Donut Center Label */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Redistributed
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1 }}>
                    {metrics.redistributionRate}
                  </div>
                </div>
              </div>

              {/* Legend & Exact Quantities */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 150 }}>
                {donutData.map((d, i) => {
                  const pct = metrics.totalSurplus > 0 ? ((d.value / metrics.totalSurplus) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 12, height: 12, backgroundColor: d.color, borderRadius: 3 }} />
                        <span style={{ fontSize: '0.84rem', color: 'var(--color-forest-dark)', fontWeight: 600 }}>
                          {d.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                        {d.value} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Hostel Performance Comparison (All 7 Messes Stacked Horizontal Bars) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '24px 26px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} color="var(--color-forest)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                  Hostel Mess Performance Comparison
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Surplus breakdown across all 7 confirmed campus dining halls.
              </p>
            </div>

            <Link
              to="/supervisor/hostel-analytics"
              style={{
                fontSize: '0.84rem',
                color: 'var(--color-forest)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>Detailed Hostel Analytics</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Stacked Horizontal Comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {hostelComparison.map((h) => {
              const sur = h.totalSurplus || 0;
              const donPct = sur > 0 ? (h.foodDonated / sur) * 100 : 0;
              const wstPct = sur > 0 ? (h.foodWasted / sur) * 100 : 0;
              const remPct = sur > 0 ? (h.remainingFood / sur) * 100 : 0;

              return (
                <div key={h.messId} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ color: 'var(--color-forest-dark)' }}>{h.messName}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({h.categoryLabel})</span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      <span>Surplus: <strong>{sur}</strong></span>
                      <span>Donated: <strong style={{ color: 'var(--color-forest)' }}>{h.foodDonated}</strong></span>
                      <span>Wasted: <strong style={{ color: 'var(--color-terracotta)' }}>{h.foodWasted}</strong></span>
                      <span>Remaining: <strong style={{ color: 'var(--color-saffron-dark)' }}>{h.remainingFood}</strong></span>
                    </div>
                  </div>

                  {/* Stacked Bar */}
                  <div style={{ height: 14, width: '100%', backgroundColor: 'var(--color-cream-light)', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                    {sur > 0 ? (
                      <>
                        <div style={{ width: `${donPct}%`, backgroundColor: 'var(--color-forest)', height: '100%' }} title={`Donated: ${h.foodDonated} portions`} />
                        <div style={{ width: `${wstPct}%`, backgroundColor: 'var(--color-terracotta)', height: '100%' }} title={`Wasted: ${h.foodWasted} portions`} />
                        <div style={{ width: `${remPct}%`, backgroundColor: 'var(--color-saffron)', height: '100%' }} title={`Remaining: ${h.remainingFood} portions`} />
                      </>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        No surplus recorded
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Operational Attention Panel & Donation Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Operational Attention Panel */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '22px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AlertTriangle size={18} color="var(--color-saffron-dark)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                Operational Attention
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.84rem' }}>
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-cream-light)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Highest Recorded Discarded Surplus
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-terracotta)', marginTop: 2 }}>
                  {attention.highestWasteMess}
                </div>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-cream-light)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Top Surplus Redistributor
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-forest)', marginTop: 2 }}>
                  {attention.topRedistributor}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-cream-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Approaching Deadlines
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-terracotta)', marginTop: 2 }}>
                    {attention.approachingCount} <span style={{ fontSize: '0.78rem', fontWeight: 400 }}>pickups</span>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-cream-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Missed / Expired
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>
                    {attention.missedCount} <span style={{ fontSize: '0.78rem', fontWeight: 400 }}>pickups</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Activity Summary */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '22px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={18} color="var(--color-forest)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                  Donation Activity Status
                </h3>
              </div>

              <Link to="/supervisor/donations" style={{ fontSize: '0.8rem', color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>
                View all donations
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-saffron-light)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-saffron-dark)', textTransform: 'uppercase' }}>
                  Available Batches
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-saffron-dark)' }}>
                  {donationSummary.available.count}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {donationSummary.available.portions} portions
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-terracotta-light)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-terracotta-dark)', textTransform: 'uppercase' }}>
                  Claimed Batches
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-terracotta-dark)' }}>
                  {donationSummary.claimed.count}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {donationSummary.claimed.portions} portions
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
                  Picked Up
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                  {donationSummary.pickedUp.count}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {donationSummary.pickedUp.portions} portions
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#F5F5F5' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Expired
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {donationSummary.expired.count}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {donationSummary.expired.portions} portions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
