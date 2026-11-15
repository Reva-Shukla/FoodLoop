import React from 'react';
import { X, Clock, MapPin, Calendar, CheckSquare, Building, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DonationDetailModal({ donation, onClose }) {
  if (!donation) return null;

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Donation #{donation.id}
              </span>
              <StatusBadge status={donation.status} />
            </div>
            <h2 style={{ fontSize: '1.45rem', color: 'var(--primary)' }}>{donation.foodName}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--cream-bg)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {donation.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 20, lineHeight: 1.6 }}>
            {donation.description}
          </p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          backgroundColor: 'var(--cream-bg)',
          padding: 18,
          borderRadius: 12,
          marginBottom: 20
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>QUANTITY & PORTION</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
              {donation.quantity} {donation.quantityUnit}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>FOOD TYPE & CATEGORY</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {donation.foodType} • {donation.category}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PREPARATION TIME</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {formatDate(donation.preparationDatetime)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPIRY DEADLINE</div>
            <div style={{ fontSize: '0.9rem', color: donation.isExpired ? '#B91C1C' : 'var(--text-main)', fontWeight: 600 }}>
              {formatDate(donation.expiryDatetime)}
            </div>
          </div>
        </div>

        {/* Pickup & Logistics */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} color="var(--primary)" /> Pickup Information
          </h4>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 6 }}>
            <strong>Address:</strong> {donation.pickupAddress}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 6 }}>
            <strong>Pickup Availability:</strong> {donation.pickupTime}
          </div>
          {donation.instructions && (
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
              <strong>Instructions:</strong> {donation.instructions}
            </div>
          )}
        </div>

        {/* Recipient NGO Information if Claimed */}
        {donation.claimedByNgoId && (
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: 16,
            borderRadius: 12,
            marginBottom: 20
          }}>
            <h4 style={{ fontSize: '0.95rem', color: '#1E40AF', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building size={16} /> Recipient NGO Information
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#1E3A8A' }}>
              <strong>Organization:</strong> {donation.ngoName || `Partner NGO #${donation.claimedByNgoId}`}
            </div>
            {donation.ngoPhone && (
              <div style={{ fontSize: '0.9rem', color: '#1E3A8A' }}>
                <strong>Contact Phone:</strong> {donation.ngoPhone}
              </div>
            )}
            <div style={{ fontSize: '0.85rem', color: '#3B82F6', marginTop: 4 }}>
              Claimed at: {formatDate(donation.claimedAt)}
            </div>
          </div>
        )}

        {/* Food Safety Declaration */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          backgroundColor: '#F0FDF4',
          borderRadius: 8,
          border: '1px solid #BBF7D0',
          fontSize: '0.82rem',
          color: '#166534',
          marginBottom: 24
        }}>
          <CheckSquare size={16} color="#16a34a" />
          <span>Donor verified: 100% Unserved Surplus Food (No plate leftovers).</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
