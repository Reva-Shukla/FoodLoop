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
  History,
  PlusCircle,
  HeartHandshake,
  Trash2,
  Calendar,
  Layers,
  Utensils
} from 'lucide-react';

export default function MealHistory() {
  const { activeHostel } = useAuth();
  const { mealRecords, donations, wasteRecords } = useFoodLoop();

  const messId = activeHostel?.id || 'mess-b-franklin';

  // Filters state
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [foodTypeFilter, setFoodTypeFilter] = useState('ALL');

  // Selected meal for detail view
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Filter meal records for this mess and matching filters
  const filteredMeals = useMemo(() => {
    return mealRecords
      .filter((m) => m.messId === messId)
      .filter((m) => {
        if (search && !m.foodName.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (dateFilter && m.date !== dateFilter) {
          return false;
        }
        if (typeFilter !== 'ALL' && m.mealType !== typeFilter) {
          return false;
        }
        if (foodTypeFilter !== 'ALL' && m.foodType !== foodTypeFilter) {
          return false;
        }
        return true;
      });
  }, [mealRecords, messId, search, dateFilter, typeFilter, foodTypeFilter]);

  // Associated records for the selected meal modal
  const selectedMealDetails = useMemo(() => {
    if (!selectedMeal) return null;

    const mealDonations = donations.filter((d) => d.mealRecordId === selectedMeal.id);
    const mealWaste = wasteRecords.filter((w) => w.mealRecordId === selectedMeal.id);

    const surplus = selectedMeal.surplusPortions || 0;
    const completedDonated = mealDonations
      .filter((d) => d.status === 'PICKED_UP' || d.status === 'COMPLETED')
      .reduce((sum, d) => sum + (parseInt(d.portions, 10) || 0), 0);

    const activeReserved = mealDonations
      .filter((d) => d.status === 'AVAILABLE' || d.status === 'CLAIMED')
      .reduce((sum, d) => sum + (parseInt(d.portions, 10) || 0), 0);

    const wasted = mealWaste.reduce(
      (sum, w) => sum + (parseInt(w.portionsDiscarded, 10) || 0),
      0
    );

    const remaining = Math.max(0, surplus - completedDonated - wasted);
    const unallocated = Math.max(0, remaining - activeReserved);

    return {
      meal: selectedMeal,
      mealDonations,
      mealWaste,
      surplus,
      completedDonated,
      activeReserved,
      wasted,
      remaining,
      unallocated,
    };
  }, [selectedMeal, donations, wasteRecords]);

  // Close details modal on Escape key
  useEffect(() => {
    if (!selectedMeal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedMeal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMeal]);

  return (
    <DashboardLayout title="Meal History">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Top Header & Quick Action */}
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
              Meal Production & Service History
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Historical meal records for <strong>{activeHostel?.name || 'Franklin Mess'}</strong>.
            </p>
          </div>

          <Link
            to="/mess/record-meal"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <PlusCircle size={15} />
            <span>Record New Meal</span>
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Search by food name */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food name..."
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

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-cream-border)',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Meal Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-cream-border)',
                fontSize: '0.86rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">All Meal Types</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Evening Snacks">Evening Snacks</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {/* Food Type Filter */}
          <div>
            <select
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-cream-border)',
                fontSize: '0.86rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">All Diet Types</option>
              <option value="VEG">VEG (Vegetarian)</option>
              <option value="NON_VEG">NON_VEG</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            overflowX: 'auto',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {filteredMeals.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Utensils size={32} color="var(--color-cream-border)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontSize: '0.94rem', margin: 0 }}>
                No meal records match the current filters.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Meal Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Food Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Diet</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', textAlign: 'right' }}>Prepared</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', textAlign: 'right' }}>Served</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', textAlign: 'right' }}>Surplus</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)', textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeals.map((meal) => (
                  <tr
                    key={meal.id}
                    style={{
                      borderBottom: '1px solid var(--color-cream-border)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-cream-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {meal.date}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--color-forest-surface)',
                          color: 'var(--color-forest)',
                        }}
                      >
                        {meal.mealType}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                      {meal.foodName}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: meal.foodType === 'VEG' ? 'var(--color-sage-light)' : '#FDECE8',
                          color: meal.foodType === 'VEG' ? 'var(--color-forest)' : '#A83B24',
                        }}
                      >
                        {meal.foodType}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {meal.preparedPortions}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {meal.servedPortions}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-saffron-dark)' }}>
                      {meal.surplusPortions}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedMeal(meal)}
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
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Meal Details Modal */}
        {selectedMealDetails && (
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
            onClick={() => setSelectedMeal(null)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 620,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px 32px',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
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
                    Meal Service Breakdown
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.45rem',
                      color: 'var(--color-forest-dark)',
                      margin: '4px 0 0 0',
                    }}
                  >
                    {selectedMealDetails.meal.foodName}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {selectedMealDetails.meal.date} • {selectedMealDetails.meal.mealType} ({selectedMealDetails.meal.foodType})
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMeal(null)}
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

              {/* Portion Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 24,
                  backgroundColor: 'var(--color-cream-light)',
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prepared</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                    {selectedMealDetails.meal.preparedPortions}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Served</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                    {selectedMealDetails.meal.servedPortions}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Surplus</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-saffron-dark)' }}>
                    {selectedMealDetails.surplus}
                  </div>
                </div>
              </div>

              {/* Allocation Breakdown */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-cream-tint)',
                  marginBottom: 24,
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: 8 }}>
                  Portion Allocation Status:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem' }}>
                  <div>Donated (Completed): <strong>{selectedMealDetails.completedDonated} portions</strong></div>
                  <div>Active Reserved: <strong>{selectedMealDetails.activeReserved} portions</strong></div>
                  <div>Recorded Waste: <strong>{selectedMealDetails.wasted} portions</strong></div>
                  <div style={{ color: 'var(--color-forest-dark)', fontWeight: 700 }}>
                    Unallocated Surplus: {selectedMealDetails.unallocated} portions
                  </div>
                </div>
              </div>

              {/* Associated Donations */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: 10 }}>
                  Associated Donations ({selectedMealDetails.mealDonations.length})
                </h4>
                {selectedMealDetails.mealDonations.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No donations created for this meal yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedMealDetails.mealDonations.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'var(--color-cream-light)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{d.portions} portions</span>
                        <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Associated Waste Records */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: 10 }}>
                  Associated Waste Entries ({selectedMealDetails.mealWaste.length})
                </h4>
                {selectedMealDetails.mealWaste.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No waste recorded for this meal.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedMealDetails.mealWaste.map((w) => (
                      <div
                        key={w.id}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#FDECE8',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          color: '#A83B24',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{w.portionsDiscarded} portions ({w.reason})</span>
                        <span style={{ fontSize: '0.74rem' }}>{new Date(w.discardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {selectedMealDetails.unallocated > 0 && (
                  <Link
                    to={`/mess/create-donation?mealId=${selectedMealDetails.meal.id}`}
                    className="btn btn-saffron btn-sm"
                  >
                    Donate Surplus ({selectedMealDetails.unallocated} available)
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedMeal(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
