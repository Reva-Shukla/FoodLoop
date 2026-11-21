import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import {
  HeartHandshake,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Utensils,
  Clock,
  MapPin,
  AlertTriangle
} from 'lucide-react';

export default function CreateDonation() {
  const { user, activeHostel } = useAuth();
  const { mealRecords, createDonation, getMealAllocations } = useFoodLoop();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMealId = searchParams.get('mealId');

  const messId = activeHostel?.id || 'mess-b-franklin';

  // Compute meals with unallocated surplus for this mess
  const [eligibleMeals, setEligibleMeals] = useState([]);
  const [selectedMealId, setSelectedMealId] = useState('');
  const [selectedMealAlloc, setSelectedMealAlloc] = useState(null);
  const [loadingEligible, setLoadingEligible] = useState(true);

  // Form state
  const [portions, setPortions] = useState('');
  const [prepDateTime, setPrepDateTime] = useState('');
  const [deadlineDateTime, setDeadlineDateTime] = useState('');
  const [storageConditions, setStorageConditions] = useState('Heated insulated container');
  const [allergens, setAllergens] = useState('None');
  const [pickupLocation, setPickupLocation] = useState(
    `${activeHostel?.name || 'Franklin Mess'} Kitchen Dispatch Gate 1`
  );
  const [unservedConfirmed, setUnservedConfirmed] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize default date/times (prep: now - 1hr, deadline: now + 3hrs)
  useEffect(() => {
    const now = new Date();
    const oneHrAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const threeHrsLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const toLocalISO = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setPrepDateTime(toLocalISO(oneHrAgo));
    setDeadlineDateTime(toLocalISO(threeHrsLater));
  }, []);

  // Fetch eligible meals and their allocations
  useEffect(() => {
    let mounted = true;
    const fetchEligible = async () => {
      setLoadingEligible(true);
      const messMeals = mealRecords.filter((m) => m.messId === messId);
      const results = [];

      for (const m of messMeals) {
        const alloc = await getMealAllocations(m.id);
        if (alloc.unallocatedSurplus > 0) {
          results.push({ meal: m, alloc });
        }
      }

      if (mounted) {
        setEligibleMeals(results);
        if (preselectedMealId) {
          const match = results.find((r) => r.meal.id === preselectedMealId);
          if (match) {
            setSelectedMealId(match.meal.id);
            setSelectedMealAlloc(match.alloc);
          } else if (results.length > 0) {
            setSelectedMealId(results[0].meal.id);
            setSelectedMealAlloc(results[0].alloc);
          }
        } else if (results.length > 0) {
          setSelectedMealId(results[0].meal.id);
          setSelectedMealAlloc(results[0].alloc);
        }
        setLoadingEligible(false);
      }
    };

    fetchEligible();
    return () => {
      mounted = false;
    };
  }, [mealRecords, messId, preselectedMealId, getMealAllocations]);

  // Handle meal dropdown change
  const handleMealChange = async (e) => {
    const mealId = e.target.value;
    setSelectedMealId(mealId);
    setError('');

    const match = eligibleMeals.find((r) => r.meal.id === mealId);
    if (match) {
      setSelectedMealAlloc(match.alloc);
    } else if (mealId) {
      const alloc = await getMealAllocations(mealId);
      setSelectedMealAlloc(alloc);
    } else {
      setSelectedMealAlloc(null);
    }
  };

  const selectedMeal = selectedMealAlloc?.meal;
  const maxAvailable = selectedMealAlloc?.unallocatedSurplus || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedMealId || !selectedMeal) {
      setError('Please select an eligible meal record to donate surplus from.');
      return;
    }

    const portionNum = parseInt(portions, 10);
    if (!portionNum || portionNum <= 0) {
      setError('Donation quantity must be a positive whole number of portions.');
      return;
    }

    if (portionNum > maxAvailable) {
      setError(`Donation quantity (${portionNum}) cannot exceed the selected meal's unallocated surplus (${maxAvailable} portions).`);
      return;
    }

    if (!prepDateTime || !deadlineDateTime) {
      setError('Please specify both preparation date/time and pickup deadline.');
      return;
    }

    const prepDate = new Date(prepDateTime);
    const deadlineDate = new Date(deadlineDateTime);
    const now = new Date();

    if (deadlineDate <= prepDate) {
      setError('Pickup deadline must be after the preparation date and time.');
      return;
    }

    if (deadlineDate <= now) {
      setError('Pickup deadline must be in the future.');
      return;
    }

    if (!pickupLocation.trim()) {
      setError('Designated pickup location cannot be blank.');
      return;
    }

    if (!unservedConfirmed) {
      setError('Please confirm that this food is unserved surplus and not dining plate leftovers.');
      return;
    }

    setLoading(true);
    try {
      await createDonation({
        mealRecordId: selectedMeal.id,
        messId: activeHostel?.id || 'mess-b-franklin',
        messName: activeHostel?.name || 'Franklin Mess',
        foodName: selectedMeal.foodName,
        foodType: selectedMeal.foodType,
        portions: portionNum,
        preparationDateTime: prepDateTime,
        pickupDeadline: deadlineDateTime,
        storageConditions: storageConditions.trim(),
        allergens: allergens.trim(),
        pickupLocation: pickupLocation.trim(),
        unservedSurplusConfirmed: true,
      });

      navigate('/mess/my-donations');
    } catch (err) {
      setError(err.message || 'Failed to create donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Donation">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header Intro */}
        <div style={{ marginBottom: 24 }}>
          <div className="kicker kicker-saffron" style={{ marginBottom: 8 }}>
            <Sparkles size={12} color="var(--color-saffron-dark)" />
            <span>Surplus Redistribution • {activeHostel?.name || 'Franklin Mess'}</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
              color: 'var(--color-forest-dark)',
              marginBottom: 6,
            }}
          >
            Create Surplus Food Donation
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
            List verified, unserved surplus food for authorized NGO collection. Donations must be tied directly to a recorded meal batch.
          </p>
        </div>

        {/* Form Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-cream-border)',
            padding: 'clamp(24px, 4vw, 36px)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {error && (
            <div
              style={{
                backgroundColor: '#FDECE8',
                border: '1.5px solid #F6B8A6',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.86rem',
                color: '#A83B24',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {eligibleMeals.length === 0 && !loadingEligible ? (
            <div style={{ padding: '36px 16px', textAlign: 'center' }}>
              <AlertTriangle size={36} color="var(--color-saffron-dark)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--color-forest-dark)', marginBottom: 8 }}>
                No Eligible Surplus Available
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 20px auto' }}>
                All recorded meals for {activeHostel?.name} currently have 0 unallocated surplus. Please record a new meal with surplus portions first.
              </p>
              <Link to="/mess/record-meal" className="btn btn-primary">
                Record New Meal
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Field 1: Meal Record Selector */}
              <div>
                <label
                  htmlFor="don-mealRecord"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 6,
                  }}
                >
                  Select Meal Record Batch
                </label>
                <select
                  id="don-mealRecord"
                  value={selectedMealId}
                  onChange={handleMealChange}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-cream-border)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                >
                  {eligibleMeals.map(({ meal, alloc }) => (
                    <option key={meal.id} value={meal.id}>
                      {meal.date} • {meal.mealType} — {meal.foodName} ({alloc.unallocatedSurplus} portions available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-populated Meal Info Banner */}
              {selectedMeal && (
                <div
                  style={{
                    backgroundColor: 'var(--color-cream-tint)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Auto-Populated Batch Details
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                      {selectedMeal.foodName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Type: <strong>{selectedMeal.foodType}</strong> • Service: {selectedMeal.mealType} ({selectedMeal.date})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Unallocated Surplus
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-saffron-dark)' }}>
                      {maxAvailable} portions
                    </div>
                  </div>
                </div>
              )}

              {/* Field 2: Donation Quantity */}
              <div>
                <label
                  htmlFor="don-portions"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 6,
                  }}
                >
                  Donation Quantity (in Portions)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    id="don-portions"
                    type="number"
                    min="1"
                    max={maxAvailable}
                    step="1"
                    value={portions}
                    onChange={(e) => setPortions(e.target.value)}
                    placeholder={`Max ${maxAvailable} portions`}
                    required
                    style={{
                      flex: 1,
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-cream-border)',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setPortions(String(maxAvailable))}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-cream-border)',
                      backgroundColor: 'var(--color-cream-light)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--color-forest)',
                      cursor: 'pointer',
                    }}
                  >
                    Donate Full Batch ({maxAvailable})
                  </button>
                </div>
              </div>

              {/* Field 3: Timing (Prep & Deadline) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label
                    htmlFor="don-prep"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Preparation Date & Time
                  </label>
                  <input
                    id="don-prep"
                    type="datetime-local"
                    value={prepDateTime}
                    onChange={(e) => setPrepDateTime(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-cream-border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="don-deadline"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Pickup Deadline (Thermal Safe Window)
                  </label>
                  <input
                    id="don-deadline"
                    type="datetime-local"
                    value={deadlineDateTime}
                    onChange={(e) => setDeadlineDateTime(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-cream-border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Field 4: Storage & Allergens */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label
                    htmlFor="don-storage"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Storage Conditions
                  </label>
                  <input
                    id="don-storage"
                    type="text"
                    value={storageConditions}
                    onChange={(e) => setStorageConditions(e.target.value)}
                    placeholder="e.g. Heated container / Chafing dish"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-cream-border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="don-allergens"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Allergen Information
                  </label>
                  <input
                    id="don-allergens"
                    type="text"
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                    placeholder="e.g. Dairy (Ghee), Gluten (Wheat), None"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-cream-border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Field 5: Pickup Location */}
              <div>
                <label
                  htmlFor="don-location"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 6,
                  }}
                >
                  Designated Campus Pickup Location
                </label>
                <input
                  id="don-location"
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Franklin Mess Kitchen Dispatch Gate 1"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-cream-border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Mandatory Unserved Surplus Confirmation Checkbox */}
              <div
                style={{
                  backgroundColor: 'rgba(24, 60, 50, 0.04)',
                  border: '1.5px solid var(--color-sage)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <input
                  id="don-unservedCheck"
                  type="checkbox"
                  checked={unservedConfirmed}
                  onChange={(e) => setUnservedConfirmed(e.target.checked)}
                  required
                  style={{
                    marginTop: 3,
                    width: 18,
                    height: 18,
                    cursor: 'pointer',
                    accentColor: 'var(--color-forest)',
                  }}
                />
                <label
                  htmlFor="don-unservedCheck"
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--color-forest-dark)',
                    lineHeight: 1.45,
                    cursor: 'pointer',
                  }}
                >
                  <strong>Manager Declaration:</strong> I confirm that this food is unserved kitchen surplus and has not been served or taken from dining plates. It has been held under appropriate thermal sanitary conditions.
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <Link to="/mess/dashboard" className="btn btn-secondary">
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-saffron"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <HeartHandshake size={17} />
                  <span>{loading ? 'Publishing Donation...' : 'Publish Surplus Donation'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
