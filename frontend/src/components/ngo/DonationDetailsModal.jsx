import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  Building2,
  Calendar,
  Utensils,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function DonationDetailsModal({
  donation,
  onClose,
  onClaim,
  canClaim = false,
  claiming = false,
}) {
  const [confirmClaimOpen, setConfirmClaimOpen] = useState(false);
  const [commitmentChecked, setCommitmentChecked] = useState(false);
  const [claimError, setClaimError] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!donation) return null;

  const isVeg = donation.foodType === 'VEG';
  const isNonVeg = donation.foodType === 'NON_VEG';
  const isExpired = new Date(donation.pickupDeadline) <= new Date();
  const isAvailable = donation.status === 'AVAILABLE' && !isExpired;

  // Check if mandatory handling/location info is present
  const missingLocation = !donation.pickupLocation || donation.pickupLocation.trim() === '';
  const missingDeadline = !donation.pickupDeadline;
  const hasIncompleteInfo = missingLocation || missingDeadline;

  const handleConfirmClaim = async () => {
    if (!commitmentChecked) {
      setClaimError('Please confirm that your team will collect the full portions before the deadline.');
      return;
    }
    setClaimError('');
    try {
      await onClaim(donation.id);
      setConfirmClaimOpen(false);
      onClose();
    } catch (err) {
      setClaimError(err.message || 'Failed to claim donation.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(16, 41, 34, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 620,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          border: '1.5px solid var(--color-cream-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid var(--color-cream-border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isVeg ? 'var(--color-sage-subtle)' : 'var(--color-terracotta-light)',
                  color: isVeg ? 'var(--color-forest)' : 'var(--color-terracotta-dark)',
                  letterSpacing: '0.04em',
                }}
              >
                {isVeg ? 'Veg' : 'Non-Veg'}
              </span>

              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor:
                    donation.status === 'AVAILABLE' && !isExpired
                      ? 'var(--color-saffron-light)'
                      : donation.status === 'CLAIMED'
                      ? 'var(--color-terracotta-light)'
                      : donation.status === 'PICKED_UP'
                      ? 'var(--color-sage-subtle)'
                      : '#F5F5F5',
                  color:
                    donation.status === 'AVAILABLE' && !isExpired
                      ? 'var(--color-saffron-dark)'
                      : donation.status === 'CLAIMED'
                      ? 'var(--color-terracotta-dark)'
                      : donation.status === 'PICKED_UP'
                      ? 'var(--color-forest)'
                      : 'var(--text-muted)',
                }}
              >
                {isExpired && donation.status === 'AVAILABLE' ? 'Expired' : donation.status}
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.45rem',
                color: 'var(--color-forest-dark)',
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {donation.foodName}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <Building2 size={14} color="var(--color-forest)" />
              <strong style={{ color: 'var(--color-forest-dark)' }}>{donation.messName}</strong>
              <span>• Chitkara University</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
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

        {/* Modal Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Key Portions Highlight */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              backgroundColor: 'var(--color-cream-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-cream-border)',
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Offered Batch Quantity
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1.1 }}>
                {donation.portions} <span style={{ fontSize: '1rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>portions</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Collection Deadline
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: isExpired ? '#A83B24' : 'var(--color-terracotta)', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 2 }}>
                <Clock size={15} />
                <span>
                  {new Date(donation.pickupDeadline).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} ({new Date(donation.pickupDeadline).toLocaleDateString()})
                </span>
              </div>
            </div>
          </div>

          {/* Warning / Incomplete Information Alert */}
          {hasIncompleteInfo && (
            <div
              style={{
                backgroundColor: '#FDECE8',
                border: '1.5px solid #F6B8A6',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.84rem',
                color: '#A83B24',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>
                Required collection location or deadline is incomplete. Claiming is temporarily restricted until details are provided.
              </span>
            </div>
          )}

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 22, fontSize: '0.86rem' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 2 }}>Source Dining Mess</div>
              <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{donation.messName}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 2 }}>Pickup Location</div>
              <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} color="var(--color-terracotta)" />
                <span>{donation.pickupLocation || 'Kitchen Dispatch Gate 1'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 2 }}>Preparation Date & Time</div>
              <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} color="var(--color-forest)" />
                <span>
                  {donation.preparationDateTime
                    ? new Date(donation.preparationDateTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recorded at meal dispatch'}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 2 }}>Thermal / Storage Condition</div>
              <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                {donation.storageConditions || 'Covered insulated food container'}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 2 }}>Reported Allergens</div>
              <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                {donation.allergens || 'None reported by mess chef'}
              </div>
            </div>
          </div>

          {/* Manager Declaration Notice */}
          <div
            style={{
              backgroundColor: 'var(--color-forest-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(24, 60, 50, 0.1)',
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: '0.82rem',
              color: 'var(--color-forest)',
              lineHeight: 1.45,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 3 }}>
              <ShieldCheck size={16} color="var(--color-forest)" />
              <span>Mess Manager Unserved Surplus Declaration</span>
            </div>
            <div>
              The mess manager declares this batch is pure unserved surplus held under safe kitchen conditions. Plate leftovers are strictly excluded.
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
              *Note: FoodLoop manager declarations provide operational verification, not independent third-party laboratory certification.
            </div>
          </div>

          {/* Claim Confirmation Panel (when clicked Claim) */}
          {confirmClaimOpen ? (
            <div
              style={{
                backgroundColor: 'var(--color-terracotta-light)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid rgba(201, 108, 75, 0.35)',
                padding: '16px 20px',
              }}
            >
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--color-terracotta-dark)', margin: '0 0 8px 0' }}>
                Confirm Full Donation Claim
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                You are claiming all <strong>{donation.portions} portions</strong> of {donation.foodName} from <strong>{donation.messName}</strong>.
              </p>

              {claimError && (
                <div style={{ color: '#A83B24', fontSize: '0.82rem', marginBottom: 10 }}>
                  {claimError}
                </div>
              )}

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: '0.82rem',
                  color: 'var(--color-forest-dark)',
                  cursor: 'pointer',
                  marginBottom: 16,
                }}
              >
                <input
                  type="checkbox"
                  checked={commitmentChecked}
                  onChange={(e) => setCommitmentChecked(e.target.checked)}
                  style={{ marginTop: 2, accentColor: 'var(--color-forest)' }}
                />
                <span>
                  I confirm our authorized NGO collection team will collect the complete batch of {donation.portions} portions from <strong>{donation.pickupLocation}</strong> before the deadline.
                </span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setConfirmClaimOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={claiming}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClaim}
                  className="btn btn-primary btn-sm"
                  disabled={claiming || !commitmentChecked}
                  style={{ backgroundColor: 'var(--color-terracotta)' }}
                >
                  {claiming ? 'Confirming Claim...' : 'Confirm & Schedule Pickup'}
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>

              {canClaim && isAvailable && !hasIncompleteInfo && (
                <button
                  type="button"
                  onClick={() => setConfirmClaimOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: 'var(--color-terracotta)' }}
                >
                  Claim Donation ({donation.portions} portions)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
