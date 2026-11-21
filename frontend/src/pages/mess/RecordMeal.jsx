import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import { getTodayDateString } from '../../services/foodLoopService';
import { PlusCircle, CheckCircle2, ShieldAlert, ArrowRight, Sparkles, Utensils } from 'lucide-react';

export default function RecordMeal() {
  const { user, activeHostel } = useAuth();
  const { logMealRecord } = useFoodLoop();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: getTodayDateString(),
    mealType: 'Lunch',
    foodName: '',
    foodType: 'VEG',
    preparedPortions: '',
    servedPortions: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Live calculation of surplus
  const preparedNum = parseInt(formData.preparedPortions, 10) || 0;
  const servedNum = parseInt(formData.servedPortions, 10) || 0;
  const calculatedSurplus = formData.preparedPortions !== '' && formData.servedPortions !== ''
    ? Math.max(0, preparedNum - servedNum)
    : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    // Form Validations
    if (!formData.foodName.trim()) {
      setError('Food name cannot be blank.');
      return;
    }

    if (!formData.date) {
      setError('Please provide a valid service date.');
      return;
    }

    if (preparedNum <= 0) {
      setError('Prepared portions must be a positive whole number greater than zero.');
      return;
    }

    if (servedNum < 0) {
      setError('Served portions cannot be a negative number.');
      return;
    }

    if (servedNum > preparedNum) {
      setError('Served portions cannot exceed prepared portions.');
      return;
    }

    setLoading(true);
    try {
      const created = await logMealRecord({
        messId: activeHostel?.id || 'mess-b-franklin',
        messName: activeHostel?.name || 'Franklin Mess',
        date: formData.date,
        mealType: formData.mealType,
        foodName: formData.foodName.trim(),
        foodType: formData.foodType,
        preparedPortions: preparedNum,
        servedPortions: servedNum,
        loggedBy: user?.name || 'Chef Vikram',
      });

      setSuccess(created);
    } catch (err) {
      setError(err.message || 'Failed to record meal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Record Meal">
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        {/* Header Intro */}
        <div style={{ marginBottom: 24 }}>
          <div className="kicker kicker-saffron" style={{ marginBottom: 8 }}>
            <Sparkles size={12} color="var(--color-saffron-dark)" />
            <span>{activeHostel?.name || 'Franklin Mess'} • Daily Kitchen Service</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
              color: 'var(--color-forest-dark)',
              marginBottom: 6,
            }}
          >
            Record Prepared & Served Meal
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
            Log post-service portions to calculate batch surplus. Unallocated surplus will immediately be available for donation creation.
          </p>
        </div>

        {/* Success Confirmation Modal / Card */}
        {success ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--color-sage)',
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
                backgroundColor: 'var(--color-forest)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 size={28} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--color-forest-dark)', marginBottom: 6 }}>
              Meal Record Saved Successfully
            </h3>

            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Logged <strong>{success.foodName}</strong> for <strong>{success.mealType}</strong> ({success.date}).
              Calculated surplus:{' '}
              <span style={{ color: 'var(--color-saffron-dark)', fontWeight: 700 }}>
                {success.surplusPortions} portions
              </span>.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {success.surplusPortions > 0 && (
                <Link
                  to={`/mess/create-donation?mealId=${success.id}`}
                  className="btn btn-saffron"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
                >
                  <Utensils size={16} />
                  <span>Create Donation for This Meal</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setSuccess(null);
                  setFormData({
                    date: getTodayDateString(),
                    mealType: 'Lunch',
                    foodName: '',
                    foodType: 'VEG',
                    preparedPortions: '',
                    servedPortions: '',
                  });
                }}
                className="btn btn-secondary"
              >
                Record Another Meal
              </button>

              <Link to="/mess/meal-history" className="btn btn-primary">
                View Meal History
              </Link>
            </div>
          </div>
        ) : (
          /* Form Card */
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Row 1: Date & Meal Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label
                    htmlFor="meal-date"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Service Date
                  </label>
                  <input
                    id="meal-date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
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
                  />
                </div>

                <div>
                  <label
                    htmlFor="meal-type"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Meal Type
                  </label>
                  <select
                    id="meal-type"
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleChange}
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
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Evening Snacks">Evening Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Food Name & Food Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 0.7fr)', gap: 16 }}>
                <div>
                  <label
                    htmlFor="meal-foodName"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Food / Dish Name
                  </label>
                  <input
                    id="meal-foodName"
                    name="foodName"
                    type="text"
                    value={formData.foodName}
                    onChange={handleChange}
                    placeholder="e.g. Rajma Masala & Steamed Jeera Rice"
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
                  />
                </div>

                <div>
                  <label
                    htmlFor="meal-foodType"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Dietary Classification
                  </label>
                  <select
                    id="meal-foodType"
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleChange}
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
                    <option value="VEG">VEG (Vegetarian)</option>
                    <option value="NON_VEG">NON_VEG (Non-Vegetarian)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Portions Prepared & Served */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label
                    htmlFor="meal-prepared"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Portions Prepared
                  </label>
                  <input
                    id="meal-prepared"
                    name="preparedPortions"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.preparedPortions}
                    onChange={handleChange}
                    placeholder="e.g. 150"
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
                  />
                </div>

                <div>
                  <label
                    htmlFor="meal-served"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)',
                      marginBottom: 6,
                    }}
                  >
                    Portions Served / Consumed
                  </label>
                  <input
                    id="meal-served"
                    name="servedPortions"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.servedPortions}
                    onChange={handleChange}
                    placeholder="e.g. 110"
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
                  />
                </div>
              </div>

              {/* Real-time Calculated Surplus Preview Callout */}
              <div
                style={{
                  backgroundColor: 'var(--color-cream-tint)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  border: '1.5px dashed var(--color-cream-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Calculated Batch Surplus
                  </span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    Formula: Prepared ({preparedNum}) − Served ({servedNum})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: calculatedSurplus > 0 ? 'var(--color-saffron-dark)' : 'var(--color-forest)',
                    }}
                  >
                    {calculatedSurplus} portions
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <Link to="/mess/dashboard" className="btn btn-secondary">
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <PlusCircle size={17} />
                  <span>{loading ? 'Saving Record...' : 'Save Meal Record'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
