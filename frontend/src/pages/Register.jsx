import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import FoodLoopLogo from '../components/common/FoodLoopLogo';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Building2, HeartHandshake } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MESS',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.registerPreview(formData);
      if (res.success) {
        setSuccessNotice(true);
      } else {
        setError(res.error || 'Validation failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-cream)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px 36px',
      }}
    >
      {/* Top Header */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--color-forest)',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </Link>

        <FoodLoopLogo size="small" />
      </div>

      {/* Main Container */}
      <div className="container" style={{ maxWidth: 540, margin: '36px auto' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-cream-border)',
            padding: 'clamp(28px, 5vw, 44px)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div className="kicker kicker-terracotta" style={{ marginBottom: 8 }}>
              <Sparkles size={12} color="var(--color-terracotta)" />
              <span>Campus Onboarding Preview</span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 2.5vw, 2.3rem)',
                color: 'var(--color-forest-dark)',
                marginBottom: 6,
              }}
            >
              Create an account.
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
              Join the Chitkara University campus surplus food network.
            </p>
          </div>

          {/* Success Notice Card */}
          {successNotice ? (
            <div
              style={{
                backgroundColor: 'var(--color-sage-light)',
                border: '1.5px solid var(--color-sage)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 22px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-forest)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <CheckCircle2 size={26} />
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-forest-dark)', marginBottom: 8 }}>
                Registration Preview Recorded
              </h3>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 20 }}>
                This is a frontend preview. Actual account creation will become available upon Java backend integration. Please use the preconfigured demo accounts to experience the live portals.
              </p>

              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                <span>Return to Login with Demo Accounts</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Error Message */}
              {error && (
                <div
                  style={{
                    backgroundColor: '#FDECE8',
                    border: '1.5px solid #F6B8A6',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    fontSize: '0.86rem',
                    color: '#A83B24',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Account Type Selector (Mess Manager or NGO only) */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 8,
                  }}
                >
                  Account Type
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'MESS' }))}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: formData.role === 'MESS' ? '2px solid var(--color-forest)' : '1.5px solid var(--color-cream-border)',
                      backgroundColor: formData.role === 'MESS' ? 'var(--color-forest-surface)' : '#FFFFFF',
                      color: 'var(--color-forest-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                  >
                    <Building2 size={16} color="var(--color-saffron-dark)" />
                    <span>Mess Manager</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'NGO' }))}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: formData.role === 'NGO' ? '2px solid var(--color-forest)' : '1.5px solid var(--color-cream-border)',
                      backgroundColor: formData.role === 'NGO' ? 'var(--color-forest-surface)' : '#FFFFFF',
                      color: 'var(--color-forest-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                  >
                    <HeartHandshake size={16} color="var(--color-terracotta)" />
                    <span>NGO Partner</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  *Campus Supervisor access is restricted to university administration.
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-name"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 6,
                  }}
                >
                  {formData.role === 'MESS' ? 'Mess Manager Full Name' : 'Organisation / Coordinator Name'}
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formData.role === 'MESS' ? 'e.g. Vikram Singh' : 'e.g. Regional Relief Coordinator'}
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

              {/* Email Address */}
              <div>
                <label
                  htmlFor="reg-email"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 6,
                  }}
                >
                  Email Address
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@chitkara.edu.in or volunteer@partner.org"
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

              {/* Password */}
              <div>
                <label
                  htmlFor="reg-password"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 6,
                  }}
                >
                  Password (min. 6 characters)
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="reg-confirm"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 6,
                  }}
                >
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '0.96rem',
                  marginTop: 6,
                }}
              >
                <span>{loading ? 'Submitting Preview...' : 'Submit Registration Preview'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Footer note */}
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'underline' }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        FoodLoop • Chitkara University, Punjab
      </div>
    </div>
  );
}
