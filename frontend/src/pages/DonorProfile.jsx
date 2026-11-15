import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  KeyRound, 
  CheckCircle, 
  AlertCircle,
  Building
} from 'lucide-react';

export default function DonorProfile() {
  const { donor, updateDonorState } = useAuth();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    name: '',
    phone: '',
    address: '',
    city: ''
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (donor) {
      setProfileForm({
        businessName: donor.businessName || '',
        name: donor.name || '',
        phone: donor.phone || '',
        address: donor.address || '',
        city: donor.city || ''
      });
    }
  }, [donor]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    if (!profileForm.businessName.trim()) {
      setProfileMsg({ type: 'error', text: 'Business Name is required.' });
      return;
    }
    if (!profileForm.name.trim()) {
      setProfileMsg({ type: 'error', text: 'Manager contact name is required.' });
      return;
    }
    if (!profileForm.phone.trim()) {
      setProfileMsg({ type: 'error', text: 'Valid phone number is required.' });
      return;
    }

    try {
      setLoadingProfile(true);
      const res = await api.donor.updateProfile(profileForm);
      updateDonorState(res.data);
      setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!passwordForm.currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setLoadingPassword(true);
      await api.donor.changePassword(passwordForm);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.9rem', color: 'var(--primary)', marginBottom: 4 }}>
          Donor Profile & Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Manage your business credentials, contact info, and security settings.
        </p>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Left Column: Business & Contact Info */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store size={20} /> Business Details
          </h2>

          {profileMsg.text && (
            <div style={{
              backgroundColor: profileMsg.type === 'error' ? '#FEE2E2' : '#DCFCE7',
              border: `1px solid ${profileMsg.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
              color: profileMsg.type === 'error' ? '#B91C1C' : '#166534',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.88rem',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {profileMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Business Name *</label>
              <input
                type="text"
                value={profileForm.businessName}
                onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label>Manager / Contact Person *</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label>Registered Email (Immutable)</label>
              <input
                type="email"
                value={donor?.email || ''}
                readOnly
                style={{ backgroundColor: 'var(--cream-bg)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label>Phone Number *</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label>Donor Category</label>
              <input
                type="text"
                value={donor?.donorTypeLabel || 'Donor'}
                readOnly
                style={{ backgroundColor: 'var(--cream-bg)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label>City *</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label>Full Address *</label>
              <textarea
                rows={2}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingProfile}
              style={{ width: '100%', padding: '11px' }}
            >
              <Save size={16} />
              <span>{loadingProfile ? 'Saving...' : 'Update Profile Details'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Change Password & Account Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Change Password Card */}
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={20} /> Security & Password
            </h2>

            {passwordMsg.text && (
              <div style={{
                backgroundColor: passwordMsg.type === 'error' ? '#FEE2E2' : '#DCFCE7',
                border: `1px solid ${passwordMsg.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
                color: passwordMsg.type === 'error' ? '#B91C1C' : '#166534',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.88rem',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                {passwordMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label>Current Password *</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>New Password * (Min 6 characters)</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={loadingPassword}
                style={{ width: '100%', padding: '11px' }}
              >
                <Lock size={16} />
                <span>{loadingPassword ? 'Updating...' : 'Change Password'}</span>
              </button>
            </form>
          </div>

          {/* Account Overview Card */}
          <div className="card" style={{ padding: '24px', backgroundColor: 'var(--primary-light)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: 12 }}>
              Account Verification
            </h3>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><strong>Donor ID:</strong> #{donor?.donorId}</div>
              <div><strong>System User ID:</strong> #{donor?.userId}</div>
              <div><strong>Status:</strong> <span style={{ color: '#16A34A', fontWeight: 700 }}>VERIFIED DONOR</span></div>
              <div><strong>Joined:</strong> {donor?.createdAt ? new Date(donor.createdAt).toLocaleDateString() : 'Active'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
