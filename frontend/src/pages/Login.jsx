import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle, Lock, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div style={{
      maxWidth: 480,
      margin: '40px auto',
      width: '100%'
    }}>
      <div className="card" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            color: 'var(--primary)'
          }}>
            <LogIn size={26} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: 6 }}>
            Donor Login
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Welcome back to FoodLoop. Share your surplus meals today.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: '0.88rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={15} color="var(--primary)" /> Registered Email
            </label>
            <input
              type="email"
              placeholder="e.g. rajesh@greenbowl.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={15} color="var(--primary)" /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* 1-Click Demo Evaluation Credentials */}
        <div style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px dashed var(--border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--sage)',
            marginBottom: 10,
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} /> Quick Demo Logins (College Evaluation)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('rajesh@greenbowl.com', 'Password123!')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                backgroundColor: 'var(--cream-bg)',
                borderRadius: 8,
                border: '1px solid var(--border-light)',
                fontSize: '0.82rem',
                color: 'var(--text-main)'
              }}
            >
              🥗 <strong>Green Bowl Restaurant</strong> (rajesh@greenbowl.com)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ananya@sunrisemess.edu', 'Password123!')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                backgroundColor: 'var(--cream-bg)',
                borderRadius: 8,
                border: '1px solid var(--border-light)',
                fontSize: '0.82rem',
                color: 'var(--text-main)'
              }}
            >
              🏢 <strong>Sunrise Hostel & Mess</strong> (ananya@sunrisemess.edu)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have a donor account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            Register as a Donor
          </Link>
        </div>
      </div>
    </div>
  );
}
