import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  PlusCircle, 
  Download, 
  RefreshCw,
  ArrowRight,
  Flame,
  Truck
} from 'lucide-react';

export default function Dashboard() {
  const { donor } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await api.donor.getDashboard();
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = data?.stats || {};
  const recent = data?.recentActivity || [];
  const expiringSoon = data?.expiringSoon || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        marginBottom: 28
      }}>
        <div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--sage)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Donor Dashboard
          </span>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: 2 }}>
            Welcome, {donor?.businessName || 'Food Partner'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {donor?.donorTypeLabel || 'Donor'} • {donor?.city || 'Bengaluru'} • Ready to redirect surplus meals
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={fetchDashboard}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
            title="Refresh Data from Java Backend"
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <a
            href={api.donations.getExportUrl()}
            className="btn btn-secondary btn-sm"
            download
            title="Export CSV via Java File I/O"
          >
            <Download size={15} />
            <span>Download CSV</span>
          </a>

          <Link to="/add-donation" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>Add New Donation</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#B91C1C',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20
        }}>
          {error}
        </div>
      )}

      {/* KPI Statistic Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {/* Total Posted */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Package size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              TOTAL POSTED
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {stats.totalDonations ?? 0}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--sage)' }}>
              Lifetime donation listings
            </div>
          </div>
        </div>

        {/* Pending Match */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#B45309'
          }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              PENDING MATCH
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309', lineHeight: 1.1 }}>
              {stats.pendingDonations ?? 0}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Available for NGOs
            </div>
          </div>
        </div>

        {/* Accepted & In Progress */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundColor: '#DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1E40AF'
          }}>
            <Truck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              ACTIVE PICKUPS
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E40AF', lineHeight: 1.1 }}>
              {(stats.acceptedDonations || 0) + (stats.inProgressDonations || 0)}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Claimed by partner NGOs
            </div>
          </div>
        </div>

        {/* Total Quantity Donated */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundColor: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#15803D'
          }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              FOOD REDIRECTED
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803D', lineHeight: 1.1 }}>
              {stats.totalFoodQuantity ?? 0}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Plates / units saved
            </div>
          </div>
        </div>
      </div>

      {/* PriorityQueue Expiring Soon Banner (Java Collections demonstration) */}
      {expiringSoon.length > 0 && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: 14,
          padding: '18px 24px',
          marginBottom: 28
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#B45309',
            fontWeight: 700,
            fontSize: '0.95rem',
            marginBottom: 12
          }}>
            <Flame size={18} color="#D97706" />
            <span>Urgent: Donations Expiring Soon (Java PriorityQueue)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {expiringSoon.map((d) => (
              <div
                key={d.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {d.foodName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {d.quantity} {d.quantityUnit} • {d.foodType}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={d.status} />
                  <div style={{ fontSize: '0.72rem', color: '#B45309', marginTop: 4, fontWeight: 600 }}>
                    Expires: {d.expiryDatetime ? new Date(d.expiryDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>Recent Donation Activity</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real-time records synchronized with MySQL database
            </p>
          </div>
          <Link to="/manage-donations" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--primary)'
          }}>
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Package size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No donation activity recorded yet.</p>
            <Link to="/add-donation" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
              Post Your First Donation
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Type & Category</th>
                  <th>Status</th>
                  <th>Recipient NGO</th>
                  <th>Expiry Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.foodName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{d.id}</div>
                    </td>
                    <td>
                      <strong>{d.quantity}</strong> {d.quantityUnit}
                    </td>
                    <td>
                      <div>{d.foodType}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.category}</div>
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td>
                      {d.ngoName ? (
                        <span style={{ color: '#1E40AF', fontWeight: 600 }}>{d.ngoName}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Awaiting claim</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: d.isExpired ? '#B91C1C' : 'inherit' }}>
                        {d.expiryDatetime ? new Date(d.expiryDatetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
