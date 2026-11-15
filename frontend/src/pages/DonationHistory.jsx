import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DonationDetailModal from '../components/DonationDetailModal';
import { 
  Download, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Award, 
  Layers, 
  CheckCircle2, 
  Clock, 
  FileText 
} from 'lucide-react';

export default function DonationHistory() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC');

  // Selected Detail Modal
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchHistoryAndStats = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (sortBy) params.sortBy = sortBy;

      const [histRes, dashRes] = await Promise.all([
        api.donations.getHistory(params),
        api.donor.getDashboard()
      ]);

      setHistory(histRes.data || []);
      setStats(dashRes.data?.stats || null);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load donation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndStats();
  }, [statusFilter, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistoryAndStats();
  };

  return (
    <div>
      {/* Header & Export */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', color: 'var(--primary)', marginBottom: 4 }}>
            Donation History & Impact Log
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Comprehensive audit log of all surplus food redirected to recipient communities.
          </p>
        </div>

        <a
          href={api.donations.getExportUrl()}
          className="btn btn-primary btn-sm"
          download
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Download size={15} />
          <span>Export History (CSV Report)</span>
        </a>
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

      {/* Impact Counters */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL LISTINGS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
            {stats?.totalDonations ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--sage)' }}>All recorded donations</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #16A34A' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>FOOD SAVED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A', marginTop: 2 }}>
            {stats?.totalFoodQuantity ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Plates / units distributed</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPLETED PICKUPS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', marginTop: 2 }}>
            {stats?.completedDonations ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Delivered to recipients</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPIRED (AUTOMATED)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
            {stats?.expiredDonations ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Passed safety deadline</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: '1 1 260px', maxWidth: 400 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Filter by food item or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 34, fontSize: '0.9rem' }}
              />
              <Search
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Filter</button>
          </form>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
            >
              <option value="DATE_DESC">Newest Date</option>
              <option value="QTY_DESC">Highest Quantity</option>
              <option value="FOOD_NAME">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Retrieving history from database...
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No donation history matches the selected filter.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Food Type</th>
                  <th>Date Posted</th>
                  <th>Expiry Date</th>
                  <th>Current Status</th>
                  <th>Recipient / NGO Info</th>
                  <th style={{ textAlign: 'right' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {history.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.foodName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{d.category}</div>
                    </td>
                    <td>
                      <strong>{d.quantity}</strong> {d.quantityUnit}
                    </td>
                    <td>
                      {d.foodType}
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>
                      <span style={{ color: d.isExpired ? '#DC2626' : 'inherit', fontWeight: d.isExpired ? 700 : 500 }}>
                        {d.expiryDatetime ? new Date(d.expiryDatetime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td>
                      {d.ngoName ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E40AF', fontSize: '0.88rem' }}>{d.ngoName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.ngoPhone || 'Verified Partner'}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedDonation(d)}
                        className="btn btn-secondary btn-sm"
                        title="View Full Record"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDonation && (
        <DonationDetailModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      )}
    </div>
  );
}
