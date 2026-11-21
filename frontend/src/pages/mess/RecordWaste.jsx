import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import {
  Trash2,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  History
} from 'lucide-react';

export default function RecordWaste() {
  const { user, activeHostel } = useAuth();
  const { mealRecords, createWasteRecord, getMealAllocations } = useFoodLoop();
  const navigate = useNavigate();

  const messId = activeHostel?.id || 'mess-b-franklin';

  const [eligibleMeals, setEligibleMeals] = useState([]);
  const [selectedMealId, setSelectedMealId] = useState('');
  const [selectedMealAlloc, setSelectedMealAlloc] = useState(null);
  const [loadingEligible, setLoadingEligible] = useState(true);

  // Form State
  const [portions, setPortions] = useState('');
  const [reason, setReason] = useState('Expired surplus');
  const [notes, setNotes] = useState('');
  const [discardedAt, setDiscardedAt] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize date/time
  useEffect(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    setDiscardedAt(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
    );
  }, []);

  // Fetch meals for this mess with available unallocated surplus
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
        if (results.length > 0) {
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
  }, [mealRecords, messId, getMealAllocations]);

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
  const maxDiscardable = selectedMealAlloc?.unallocatedSurplus || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!selectedMealId || !selectedMeal) {
      setError('Please select a meal record batch.');
      return;
    }

    const portionNum = parseInt(portions, 10);
    if (!portionNum || portionNum <= 0) {
      setError('Discarded portions must be a positive whole number.');
      return;
    }

    if (portionNum > maxDiscardable) {
      setError(`Discarded quantity (${portionNum}) cannot exceed available unallocated surplus (${maxDiscardable} portions). Active donation reservations cannot be discarded.`);
      return;
    }

    setLoading(true);
    try {
      const created = await createWasteRecord({
        mealRecordId: selectedMeal.id,
        messId: activeHostel?.id || 'mess-b-franklin',
        messName: activeHostel?.name || 'Franklin Mess',
        foodName: selectedMeal.foodName,
        foodType: selectedMeal.foodType,
        portionsDiscarded: portionNum,
        reason,
        notes: notes.trim(),
        discardedAt,
      });

      setSuccess(created);
    } catch (err) {
      setError(err.message || 'Failed to record waste.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Record Waste">
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        {/* Header Intro */}
        <div style={{ marginBottom: 24 }}>
          <div className="kicker kicker-terracotta" style={{ marginBottom: 8 }}>
            <Trash2 size={12} color="var(--color-terracotta)" />
            <span>Surplus Disposal Audit • {activeHostel?.name || 'Franklin Mess'}</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
              color: 'var(--color-forest-dark)',
              marginBottom: 6,
            }}
          >
            Record Discarded Food Waste
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
            Document unserved surplus that could not be redistributed due to expiry, contamination, or logistical lapse.
          </p>
        </div>

        {/* Success Confirmation */}
        {success ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--color-terracotta)',
              padding: 32,
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--color-terracotta-light)',
                color: 'var(--color-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--color-forest-dark)', marginBottom: 6 }}>
              Waste Record Documented
            </h3>

            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Recorded <strong>{success.portionsDiscarded} portions</strong> of <strong>{success.foodName}</strong> as discarded ({success.reason}).
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setSuccess(null);
                  setPortions('');
                  setNotes('');
                }}
                className="btn btn-secondary"
              >
                Record Another Waste Entry
              </button>

              <Link to="/mess/dashboard" className="btn btn-primary">
                Return to Overview
              </Link>
            </div>
          </div>
        ) : (
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
                <CheckCircle2 size={36} color="var(--color-sage-dark)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--color-forest-dark)', marginBottom: 8 }}>
                  Zero Discardable Surplus
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 20px auto' }}>
                  There are no unallocated or expired surplus portions available for disposal in {activeHostel?.name}. All recorded meals have either been served or allocated.
                </p>
                <Link to="/mess/dashboard" className="btn btn-secondary">
                  Back to Mess Overview
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Field 1: Meal Batch Selector */}
                <div>
                  <label
                    htmlFor="waste-meal"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Select Origin Meal Record
                  </label>
                  <select
                    id="waste-meal"
                    value={selectedMealId}
                    onChange={handleMealChange}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-cream-border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  >
                    {eligibleMeals.map(({ meal, alloc }) => (
                      <option key={meal.id} value={meal.id}>
                        {meal.date} • {meal.mealType} — {meal.foodName} ({alloc.unallocatedSurplus} portions unallocated)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch Information Pill */}
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
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Selected Batch
                      </div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                        {selectedMeal.foodName} ({selectedMeal.foodType})
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Max Discardable Portions
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-terracotta)' }}>
                        {maxDiscardable} portions
                      </div>
                    </div>
                  </div>
                )}

                {/* Field 2: Portions Discarded */}
                <div>
                  <label
                    htmlFor="waste-portions"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Portions Discarded / Disposed
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      id="waste-portions"
                      type="number"
                      min="1"
                      max={maxDiscardable}
                      step="1"
                      value={portions}
                      onChange={(e) => setPortions(e.target.value)}
                      placeholder={`Max ${maxDiscardable} portions`}
                      required
                      style={{
                        flex: 1,
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--color-cream-border)',
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.92rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setPortions(String(maxDiscardable))}
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
                      Discard All ({maxDiscardable})
                    </button>
                  </div>
                </div>

                {/* Field 3: Reason for Waste */}
                <div>
                  <label
                    htmlFor="waste-reason"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Disposal Reason
                  </label>
                  <select
                    id="waste-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-cream-border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Expired surplus">Expired surplus (thermal safe window lapsed)</option>
                    <option value="Unsuitable for redistribution">Unsuitable for redistribution (sensory/quality degradation)</option>
                    <option value="Unclaimed surplus">Unclaimed surplus (no NGO pickup requested)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Field 4: Date & Time */}
                <div>
                  <label
                    htmlFor="waste-time"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Discard Date & Time
                  </label>
                  <input
                    id="waste-time"
                    type="datetime-local"
                    value={discardedAt}
                    onChange={(e) => setDiscardedAt(e.target.value)}
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

                {/* Field 5: Notes */}
                <div>
                  <label
                    htmlFor="waste-notes"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Operational Notes (Optional)
                  </label>
                  <textarea
                    id="waste-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide details for campus waste audit log..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-cream-border)',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <Link to="/mess/dashboard" className="btn btn-secondary">
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-terracotta"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Trash2 size={16} />
                    <span>{loading ? 'Recording...' : 'Record Waste Entry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
