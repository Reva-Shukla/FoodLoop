import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import {
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Calendar,
  AlertTriangle,
  X,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

export default function MyPickups() {
  const { user } = useAuth();
  const { pickups, completePickup, getMyPickups } = useFoodLoop();

  const ngoId = user?.id || 'user-ngo-01';

  const [activeTab, setActiveTab] = useState('SCHEDULED'); // 'SCHEDULED' | 'COMPLETED' | 'MISSED'
  const [pickupList, setPickupList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Confirm Collection
  const [confirmModalPickup, setConfirmModalPickup] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Close confirmation modal on Escape key
  useEffect(() => {
    if (!confirmModalPickup) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setConfirmModalPickup(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModalPickup]);

  useEffect(() => {
    let mounted = true;
    const fetchPickups = async () => {
      setLoading(true);
      const list = await getMyPickups(ngoId);
      if (mounted) {
        setPickupList(list);
        setLoading(false);
      }
    };

    fetchPickups();
    return () => {
      mounted = false;
    };
  }, [pickups, ngoId, getMyPickups]);

  // Derived pickups lists
  const { scheduled, completed, missed } = useMemo(() => {
    const now = new Date();
    const sched = [];
    const comp = [];
    const miss = [];

    pickupList.forEach((p) => {
      if (p.status === 'COMPLETED') {
        comp.push(p);
      } else {
        const isExpired = new Date(p.pickupDeadline) <= now;
        if (isExpired || p.status === 'MISSED') {
          miss.push(p);
        } else {
          sched.push(p);
        }
      }
    });

    return { scheduled: sched, completed: comp, missed: miss };
  }, [pickupList]);

  const currentList = activeTab === 'SCHEDULED' ? scheduled : activeTab === 'COMPLETED' ? completed : missed;

  const handleConfirmCollection = async () => {
    if (!confirmModalPickup) return;
    setCompleting(true);
    setConfirmError('');
    try {
      await completePickup(confirmModalPickup.id, ngoId);
      setSuccessMessage(
        `Successfully confirmed collection of ${confirmModalPickup.portions} portions from ${confirmModalPickup.messName}.`
      );
      setConfirmModalPickup(null);
      // Auto-switch to completed tab
      setActiveTab('COMPLETED');
    } catch (err) {
      setConfirmError(err.message || 'Failed to complete collection.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <DashboardLayout title="My Pickups">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div>
          <div className="kicker kicker-terracotta" style={{ marginBottom: 6 }}>
            <span>Collection Dispatch</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
              color: 'var(--color-forest-dark)',
              margin: '0 0 6px 0',
            }}
          >
            My Pickups
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
            Manage scheduled collections, verify pickup locations, and confirm handover upon arrival at campus messes.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div
            style={{
              backgroundColor: 'var(--color-sage-subtle)',
              border: '1.5px solid var(--color-sage)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--color-forest-dark)',
              fontSize: '0.88rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="var(--color-forest)" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-forest)' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1.5px solid var(--color-cream-border)', paddingBottom: 12 }}>
          {[
            { id: 'SCHEDULED', label: 'Scheduled Pickups', count: scheduled.length },
            { id: 'COMPLETED', label: 'Completed Collections', count: completed.length },
            { id: 'MISSED', label: 'Expired / Missed', count: missed.length },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: active ? '1.5px solid var(--color-forest)' : '1px solid var(--color-cream-border)',
                  backgroundColor: active ? 'var(--color-forest)' : '#FFFFFF',
                  color: active ? '#FFFFFF' : 'var(--color-forest-dark)',
                  fontSize: '0.84rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: active ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-cream-light)',
                    color: active ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Pickups Cards List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            Loading collections...
          </div>
        ) : currentList.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-cream-border)',
              padding: '56px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Package size={36} color="var(--color-cream-border)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: '0 0 6px 0' }}>
              No {activeTab === 'SCHEDULED' ? 'Scheduled' : activeTab === 'COMPLETED' ? 'Completed' : 'Missed'} Pickups
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 440, margin: '0 auto' }}>
              {activeTab === 'SCHEDULED'
                ? 'Your team does not have any pending collections. Browse available food to claim surplus batches.'
                : activeTab === 'COMPLETED'
                ? 'No collections completed yet. Once you collect scheduled food batches, they will appear here.'
                : 'No expired or missed collections on record.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {currentList.map((p) => {
              const isComp = p.status === 'COMPLETED';
              const isMiss = activeTab === 'MISSED';

              return (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-cream-border)',
                    padding: '22px 26px',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 18,
                  }}
                >
                  {/* Left Column: Food and Location */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor:
                            isComp
                              ? 'var(--color-sage-subtle)'
                              : isMiss
                              ? '#F5F5F5'
                              : 'var(--color-terracotta-light)',
                          color:
                            isComp
                              ? 'var(--color-forest)'
                              : isMiss
                              ? 'var(--text-muted)'
                              : 'var(--color-terracotta-dark)',
                        }}
                      >
                        {isComp ? 'Collected' : isMiss ? 'Expired / Missed' : 'Scheduled Pickup'}
                      </span>

                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Claim Ref: #{p.claimId || p.id}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                      {p.foodName}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.86rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                      <Building2 size={15} color="var(--color-forest)" />
                      <span>{p.messName}</span>
                    </div>

                    {/* Dispatch Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px 16px', marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={13} color="var(--color-terracotta)" />
                        <span>Dispatch: <strong>{p.pickupLocation || 'Kitchen Dispatch Gate 1'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color="var(--color-forest)" />
                        <span>
                          {isComp
                            ? `Collected: ${new Date(p.completedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                            : `Deadline: ${new Date(p.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${new Date(p.pickupDeadline).toLocaleDateString()})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quantity & Confirmation Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Batch Quantity
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1 }}>
                        {p.portions} <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-secondary)' }}>portions</span>
                      </div>
                    </div>

                    {activeTab === 'SCHEDULED' && (
                      <button
                        type="button"
                        onClick={() => setConfirmModalPickup(p)}
                        className="btn btn-primary btn-md"
                        style={{
                          backgroundColor: 'var(--color-forest)',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Check size={16} />
                        <span>Confirm Collection</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Simple Confirmation Dialog */}
        {confirmModalPickup && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(16, 41, 34, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setConfirmModalPickup(null)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 520,
                width: '100%',
                padding: '28px 30px',
                boxShadow: 'var(--shadow-xl)',
                border: '1.5px solid var(--color-cream-border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                  Confirm Food Collection
                </h3>
                <button
                  type="button"
                  onClick={() => setConfirmModalPickup(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                Confirming that your authorized NGO collection team has arrived at <strong>{confirmModalPickup.messName}</strong> ({confirmModalPickup.pickupLocation}) and successfully collected all <strong>{confirmModalPickup.portions} portions</strong> of {confirmModalPickup.foodName}.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-cream-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontSize: '0.82rem',
                  color: 'var(--color-forest-dark)',
                  marginBottom: 20,
                }}
              >
                <div>• Storage Container: {confirmModalPickup.storageConditions || 'Standard safe food container'}</div>
                <div>• Allergens Reported: {confirmModalPickup.allergens || 'None reported'}</div>
                <div>• No verification code or scan required. Handover is confirmed directly.</div>
              </div>

              {confirmError && (
                <div style={{ color: '#A83B24', fontSize: '0.82rem', marginBottom: 14 }}>
                  {confirmError}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setConfirmModalPickup(null)}
                  className="btn btn-secondary btn-sm"
                  disabled={completing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCollection}
                  className="btn btn-primary btn-sm"
                  disabled={completing}
                  style={{ backgroundColor: 'var(--color-forest)' }}
                >
                  {completing ? 'Completing Handover...' : 'Confirm Handover Complete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
