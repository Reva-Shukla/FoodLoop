import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle, Store, Phone, Mail, MapPin, Lock, User } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    businessName: '',
    name: '',
    email: '',
    phone: '',
    donorType: 'RESTAURANT',
    address: '',
    city: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!formData.businessName.trim()) {
      setError('Donor/Business Name is required.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Owner/Manager contact name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('A valid email address is required.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setError('A valid phone number (minimum 8 digits) is required.');
      return;
    }
    if (!formData.address.trim()) {
      setError('Full pickup address is required.');
      return;
    }
    if (!formData.city.trim()) {
      setError('City is required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      setSuccess(res.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '30px auto', width: '100%' }}>
      <div className="card" style={{ padding: '36px' }}>
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
            <UserPlus size={26} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: 6 }}>
            Donor Registration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Join FoodLoop as a food donor — Restaurants, Messes, Hostels, and Caterers.
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

        {success && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: '0.88rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Store size={15} color="var(--primary)" /> Business / Entity Name *
              </label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. Green Bowl Kitchen"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={15} color="var(--primary)" /> Owner / Manager Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Chef Rajesh Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={15} color="var(--primary)" /> Email Address *
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. contact@greenbowl.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={15} color="var(--primary)" /> Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label>Donor Type *</label>
              <select
                name="donorType"
                value={formData.donorType}
                onChange={handleChange}
              >
                <option value="RESTAURANT">Restaurant</option>
                <option value="COLLEGE_MESS">College Mess</option>
                <option value="HOSTEL">Hostel</option>
                <option value="CATERER">Caterer</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={15} color="var(--primary)" /> City *
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g. Bengaluru"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} color="var(--primary)" /> Full Pickup Address *
            </label>
            <textarea
              name="address"
              rows={2}
              placeholder="e.g. 45 Indiranagar 100ft Road, Next to Metro Pillar 42"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={15} color="var(--primary)" /> Password *
              </label>
              <input
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={15} color="var(--primary)" /> Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Complete Donor Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have a donor account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
