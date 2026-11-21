import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import {
  Utensils,
  PlusCircle,
  HeartHandshake,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  History,
  Package,
  Layers
} from 'lucide-react';

export default function MessDashboard() {
  const { user, activeHostel } = useAuth();
  const { mealRecords, donations, wasteRecords, getMessSummary } = useFoodLoop();

  const [timeFilter, setTimeFilter] = useState('TODAY'); // 'TODAY' | 'WEEK' | 'MONTH'
  const [summary, setSummary] = useState({
    totalPrepared: 0,
    totalServed: 0,
    totalSurplus: 0,
    foodDonated: 0,
    foodWasted: 0,
    remainingFood: 0,
    activeReserved: 0,
    unallocatedSurplus: 0,
    recentMeals: [],
    recentDonations: [],
  });

  const messId = activeHostel?.id || 'mess-b-franklin';

  // Compute dynamic summary whenever mealRecords, donations, wasteRecords or filter changes
  useEffect(() => {
    let mounted = true;
    getMessSummary(messId, timeFilter).then((res) => {
      if (mounted) {
        setSummary(res);
      }
    });
    return () => {
      mounted = false;
    };
  }, [messId, timeFilter, mealRecords, donations, wasteRecords, getMessSummary]);

  // Donut chart math
  const surplusTotal = summary.totalSurplus || 0;
  const donatedPortions = summary.foodDonated || 0;
  const wastedPortions = summary.foodWasted || 0;
  const reservedPortions = summary.activeReserved || 0;
  const unallocatedPortions = summary.unallocatedSurplus || 0;

  return (
    <DashboardLayout title="Mess Overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Top Header Banner with Mess Context & Time Filter */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-saffron)',
                }}
              >
                Campus Mess Operations
              </span>
              <span style={{ color: 'var(--color-cream-border)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {activeHostel?.categoryLabel || "Boys' Hostel"}
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 2vw, 1.9rem)',
                color: 'var(--color-forest-dark)',
                margin: 0,
              }}
            >
              {activeHostel?.name || 'Franklin Mess'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Logged in as <strong>{user?.name || 'Chef Vikram'}</strong> • Monitoring meal service & surplus redistribution.
            </p>
          </div>

          {/* Time Range Filter Buttons */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-cream-tint)',
              padding: 4,
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-cream-border)',
            }}
          >
            {[
              { key: 'TODAY', label: 'Today' },
              { key: 'WEEK', label: 'This Week' },
              { key: 'MONTH', label: 'This Month' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTimeFilter(tab.key)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: timeFilter === tab.key ? 'var(--color-forest)' : 'transparent',
                  color: timeFilter === tab.key ? 'var(--color-cream)' : 'var(--color-forest)',
                  transition: 'all 0.18s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Key Operational Metric Cards (Measured strictly in portions) */}
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
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Total Prepared
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1 }}>
              {summary.totalPrepared}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              portions cooked
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
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Total Served
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-forest)', lineHeight: 1 }}>
              {summary.totalServed}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              portions consumed
            </div>
          </div>

          {/* Card 3: Total Surplus */}
          <div
            style={{
              backgroundColor: 'rgba(253, 243, 227, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(230, 162, 60, 0.4)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-saffron-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Total Surplus
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-saffron-dark)', lineHeight: 1 }}>
              {summary.totalSurplus}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              prepared − served
            </div>
          </div>

          {/* Card 4: Food Donated */}
          <div
            style={{
              backgroundColor: 'rgba(235, 242, 233, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(169, 198, 160, 0.4)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Food Donated
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-forest)', lineHeight: 1 }}>
              {summary.foodDonated}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              completed pickups only
            </div>
          </div>

          {/* Card 5: Food Wasted */}
          <div
            style={{
              backgroundColor: 'rgba(251, 239, 234, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(201, 108, 75, 0.3)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Food Wasted
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-terracotta)', lineHeight: 1 }}>
              {summary.foodWasted}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              recorded discarded
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
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Remaining Food
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1 }}>
              {summary.remainingFood}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              surplus − donated − wasted
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          <Link
            to="/mess/record-meal"
            className="btn btn-primary"
            style={{
              padding: '12px 18px',
              justifyContent: 'space-between',
              fontSize: '0.92rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <PlusCircle size={18} />
              <span>Record New Meal</span>
            </div>
            <ArrowUpRight size={16} />
          </Link>

          <Link
            to="/mess/create-donation"
            className="btn btn-saffron"
            style={{
              padding: '12px 18px',
              justifyContent: 'space-between',
              fontSize: '0.92rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <HeartHandshake size={18} />
              <span>Create Donation Batch</span>
            </div>
            <ArrowUpRight size={16} />
          </Link>

          <Link
            to="/mess/record-waste"
            className="btn btn-secondary"
            style={{
              padding: '12px 18px',
              justifyContent: 'space-between',
              fontSize: '0.92rem',
              borderColor: 'rgba(201, 108, 75, 0.4)',
              color: 'var(--color-terracotta)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Trash2 size={18} />
              <span>Record Discarded Waste</span>
            </div>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Dynamic Visualizations Row: Surplus Distribution & Prepared vs Served */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 20,
          }}
          className="dashboard-charts-grid"
        >
          {/* Chart 1: Surplus Breakdown & Allocation */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-cream-border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                  Surplus Allocation Breakdown
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Total Surplus: {surplusTotal} portions in selected period
                </span>
              </div>
              <Layers size={18} color="var(--color-sage-dark)" />
            </div>

            {surplusTotal === 0 ? (
              <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No surplus recorded for this time period.
              </div>
            ) : (
              <div>
                {/* Segmented Progress Bar */}
                <div
                  style={{
                    height: 22,
                    borderRadius: 'var(--radius-pill)',
                    overflow: 'hidden',
                    display: 'flex',
                    backgroundColor: 'var(--color-cream-tint)',
                    marginBottom: 20,
                  }}
                >
                  {donatedPortions > 0 && (
                    <div
                      style={{
                        width: `${(donatedPortions / surplusTotal) * 100}%`,
                        backgroundColor: 'var(--color-forest)',
                        transition: 'width 0.4s ease',
                      }}
                      title={`Donated: ${donatedPortions} portions`}
                    />
                  )}
                  {reservedPortions > 0 && (
                    <div
                      style={{
                        width: `${(reservedPortions / surplusTotal) * 100}%`,
                        backgroundColor: 'var(--color-saffron)',
                        transition: 'width 0.4s ease',
                      }}
                      title={`Active Donations (Reserved): ${reservedPortions} portions`}
                    />
                  )}
                  {wastedPortions > 0 && (
                    <div
                      style={{
                        width: `${(wastedPortions / surplusTotal) * 100}%`,
                        backgroundColor: 'var(--color-terracotta)',
                        transition: 'width 0.4s ease',
                      }}
                      title={`Wasted: ${wastedPortions} portions`}
                    />
                  )}
                  {unallocatedPortions > 0 && (
                    <div
                      style={{
                        width: `${(unallocatedPortions / surplusTotal) * 100}%`,
                        backgroundColor: 'var(--color-sage)',
                        transition: 'width 0.4s ease',
                      }}
                      title={`Unallocated Surplus: ${unallocatedPortions} portions`}
                    />
                  )}
                </div>

                {/* Legend */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-forest)' }} />
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-dark)' }}>
                      <strong>Donated (Picked Up):</strong> {donatedPortions}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-saffron)' }} />
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-dark)' }}>
                      <strong>Active Reserved:</strong> {reservedPortions}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-terracotta)' }} />
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-dark)' }}>
                      <strong>Discarded Waste:</strong> {wastedPortions}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-sage)' }} />
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-dark)' }}>
                      <strong>Unallocated Surplus:</strong> {unallocatedPortions}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart 2: Prepared vs Served Trend Indicator */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-cream-border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                  Kitchen Efficiency
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Prepared vs Served Ratio
                </span>
              </div>
              <TrendingUp size={18} color="var(--color-forest)" />
            </div>

            {summary.totalPrepared === 0 ? (
              <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No meals recorded for this time period.
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-forest)' }}>Consumed / Served</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                      {Math.round((summary.totalServed / summary.totalPrepared) * 100)}% ({summary.totalServed} portions)
                    </span>
                  </div>
                  <div style={{ height: 12, backgroundColor: 'var(--color-cream-tint)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (summary.totalServed / summary.totalPrepared) * 100)}%`,
                        backgroundColor: 'var(--color-forest)',
                        borderRadius: 'var(--radius-pill)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-saffron-dark)' }}>Surplus Ratio</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-saffron-dark)' }}>
                      {Math.round((summary.totalSurplus / summary.totalPrepared) * 100)}% ({summary.totalSurplus} portions)
                    </span>
                  </div>
                  <div style={{ height: 12, backgroundColor: 'var(--color-cream-tint)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (summary.totalSurplus / summary.totalPrepared) * 100)}%`,
                        backgroundColor: 'var(--color-saffron)',
                        borderRadius: 'var(--radius-pill)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, backgroundColor: 'var(--color-cream-tint)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  A lower surplus ratio indicates tighter alignment between project attendance and kitchen production.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Meals & Recent Donations 2-Column Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
            gap: 20,
          }}
          className="dashboard-tables-grid"
        >
          {/* Recent Meals */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-cream-border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                Recent Meal Logs
              </h3>
              <Link to="/mess/meal-history" style={{ fontSize: '0.82rem', color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'underline' }}>
                View All History →
              </Link>
            </div>

            {summary.recentMeals.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No meals recorded for this mess yet. <Link to="/mess/record-meal" style={{ color: 'var(--color-forest)', textDecoration: 'underline' }}>Record one now</Link>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.recentMeals.map((meal) => (
                  <div
                    key={meal.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: 'var(--color-cream-light)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-cream-border)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-forest-surface)', color: 'var(--color-forest)' }}>
                          {meal.mealType}
                        </span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                          {meal.foodName}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {meal.date} • {meal.foodType}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-saffron-dark)' }}>
                        {meal.surplusPortions} surplus
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {meal.servedPortions}/{meal.preparedPortions} served
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Donations */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-cream-border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                Active & Recent Donations
              </h3>
              <Link to="/mess/my-donations" style={{ fontSize: '0.82rem', color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'underline' }}>
                All Donations →
              </Link>
            </div>

            {summary.recentDonations.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No donations created for this mess yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.recentDonations.map((don) => (
                  <div
                    key={don.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--color-cream-light)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-cream-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-forest-dark)', marginBottom: 2 }}>
                        {don.foodName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {don.portions} portions • {don.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}
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
                          don.status === 'AVAILABLE'
                            ? 'var(--color-saffron-light)'
                            : don.status === 'CLAIMED'
                            ? 'var(--color-terracotta-light)'
                            : don.status === 'PICKED_UP' || don.status === 'COMPLETED'
                            ? 'var(--color-sage-light)'
                            : '#FDECE8',
                        color:
                          don.status === 'AVAILABLE'
                            ? 'var(--color-saffron-dark)'
                            : don.status === 'CLAIMED'
                            ? 'var(--color-terracotta)'
                            : don.status === 'PICKED_UP' || don.status === 'COMPLETED'
                            ? 'var(--color-forest)'
                            : '#A83B24',
                      }}
                    >
                      {don.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-charts-grid,
          .dashboard-tables-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
