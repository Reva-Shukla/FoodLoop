import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FoodLoopLogo from '../components/common/FoodLoopLogo';
import RotatingStamp from '../components/common/RotatingStamp';
import { WheatMotif, LeafMotif } from '../components/common/BotanicalElements';
import { Eye, EyeOff, ArrowRight, ArrowLeft, ShieldAlert, Sparkles, ChefHat, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login, loginDemo, demoAccounts, USER_ROLES } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Destination from previous protected route or default
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from || res.destination, { replace: true });
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      // Find the account email
      const account = demoAccounts.find((a) => a.role === role);
      if (account) {
        setEmail(account.email);
        setPassword('FoodLoop@123');
      }

      const res = await loginDemo(role);
      if (res.success) {
        navigate(from || res.destination, { replace: true });
      } else {
        setError(res.error || 'Demo login failed.');
      }
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
        backgroundColor: 'var(--color-cream)',
      }}
      className="login-split-container"
    >
      {/* ================= LEFT SECTION ================= */}
      <div
        style={{
          backgroundColor: 'var(--color-forest)',
          color: 'var(--color-cream)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(36px, 5vw, 64px)',
        }}
        className="login-left-pane"
      >
        {/* Background Image with Rich Culinary Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.22,
            filter: 'contrast(1.1) saturate(1.1)',
          }}
          aria-hidden="true"
        />

        {/* Botanical Silhouette Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            right: -30,
            opacity: 0.08,
            pointerEvents: 'none',
            transform: 'rotate(-10deg)',
          }}
          aria-hidden="true"
        >
          <WheatMotif size={360} color="#FFFFFF" />
        </div>

        {/* Top: Logo & Back Link */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <FoodLoopLogo variant="light" size="default" />
          </Link>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-sage)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(169, 198, 160, 0.1)',
              transition: 'background-color 0.2s',
            }}
          >
            <ArrowLeft size={14} />
            <span>Home</span>
          </Link>
        </div>

        {/* Center: Editorial Manifesto */}
        <div style={{ position: 'relative', zIndex: 2, margin: '48px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              backgroundColor: 'rgba(169, 198, 160, 0.16)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(169, 198, 160, 0.25)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-sage)',
              marginBottom: 20,
            }}
          >
            <LeafMotif size={14} color="var(--color-sage)" />
            <span>Campus Food Stewardship</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.1rem, 3.2vw, 3rem)',
              fontWeight: 500,
              lineHeight: 1.12,
              color: 'var(--color-cream)',
              marginBottom: 16,
            }}
          >
            Connecting campus kitchens with communities<br />
            <span className="editorial-italic" style={{ color: 'var(--color-sage)' }}>
              that need them.
            </span>
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '1.2rem',
              color: 'var(--color-saffron)',
              margin: 0,
            }}
          >
            Every Meal Deserves a Destination.
          </p>
        </div>

        {/* Bottom: Stamp & Campus Tag */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-cream-muted)' }}>
            Chitkara University • Rajpura, Punjab
          </span>
          <div style={{ opacity: 0.85 }}>
            <RotatingStamp size={80} dark={true} />
          </div>
        </div>
      </div>

      {/* ================= RIGHT SECTION ================= */}
      <div
        style={{
          backgroundColor: 'var(--color-cream)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(36px, 6vw, 72px) clamp(24px, 5vw, 64px)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 460, width: '100%', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 3vw, 2.6rem)',
                fontWeight: 600,
                color: 'var(--color-forest-dark)',
                marginBottom: 8,
              }}
            >
              Welcome back.
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', margin: 0 }}>
              Sign in with your campus account or choose a demo persona below.
            </p>
          </div>

          {/* Quick Demo Access Buttons */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-forest)',
                }}
              >
                Quick Demo Access
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                1-Click Sign In
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleQuickDemo(USER_ROLES.MESS)}
                disabled={loading}
                title="Login as Mess Manager (mess@test.com)"
                style={{
                  padding: '10px 8px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-cream-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-saffron)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-cream-border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <ChefHat size={18} color="var(--color-saffron-dark)" />
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-forest-dark)', textAlign: 'center' }}>
                  Mess Manager
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo(USER_ROLES.NGO)}
                disabled={loading}
                title="Login as NGO Partner (ngo@test.com)"
                style={{
                  padding: '10px 8px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-cream-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-terracotta)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-cream-border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <HeartHandshake size={18} color="var(--color-terracotta)" />
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-forest-dark)', textAlign: 'center' }}>
                  NGO Partner
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo(USER_ROLES.ADMIN)}
                disabled={loading}
                title="Login as Campus Supervisor (admin@test.com)"
                style={{
                  padding: '10px 8px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-cream-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-forest)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-cream-border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <ShieldCheck size={18} color="var(--color-forest)" />
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-forest-dark)', textAlign: 'center' }}>
                  Supervisor
                </span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-cream-border)' }} />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Or sign in manually
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-cream-border)' }} />
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: '#FDECE8',
                border: '1.5px solid #F6B8A6',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                fontSize: '0.86rem',
                color: '#A83B24',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
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
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. mess@test.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--color-cream-border)',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.94rem',
                  color: 'var(--text-dark)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-forest)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-cream-border)')}
              />
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: 'var(--color-forest-dark)',
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="FoodLoop@123"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-cream-border)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.94rem',
                    color: 'var(--text-dark)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-forest)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-cream-border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign In Submit Button */}
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
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Registration Link & Demo Disclaimer */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'underline' }}>
                Create an account
              </Link>
            </p>

            <div
              style={{
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                backgroundColor: 'var(--color-cream-tint)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <strong>Demo Credentials:</strong> Use password <code style={{ color: 'var(--color-forest)', fontWeight: 700 }}>FoodLoop@123</code> with <code>mess@test.com</code>, <code>ngo@test.com</code>, or <code>admin@test.com</code>.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-split-container {
            grid-template-columns: 1fr !important;
          }
          .login-left-pane {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
