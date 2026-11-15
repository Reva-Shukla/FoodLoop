import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DonationDetailModal from '../components/DonationDetailModal';
import EditDonationModal from '../components/EditDonationModal';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle,
  Package
} from 'lucide-react';

export default function ManageDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC');

  // Modals
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [editingDonation, setEditingDonation] = useState(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.donations.getMy(params);
      setDonations(res.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleCancel = async (donation) => {
    if (!donation.isEligibleForCancel) {
      alert(`Donation #${donation.id} is in status '${donation.status}' and cannot be cancelled.`);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel the donation for "${donation.foodName}"?`
    );
    if (!confirmed) return;

    try {
      await api.donations.cancel(donation.id);
      setMessage(`Donation #${donation.id} (${donation.foodName}) has been cancelled.`);
      fetchDonations();
    } catch (err) {
      setError(err.message || 'Could not cancel donation.');
    }
  };

  const handleSaveEdit = async (donationId, updatedData) => {
    await api.donations.update(donationId, updatedData);
    setMessage(`Donation #${donationId} updated successfully.`);
    fetchDonations();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.9rem', color: 'var(--primary)', marginBottom: 4 }}>
          Manage Donations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Inspect active listings, update details, and monitor recipient pickup progress.
        </p>
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

      {message && (
        <div style={{
          backgroundColor: '#DCFCE7',
          border: '1px solid #86EFAC',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20
        }}>
          {message}
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: '1 1 280px', maxWidth: 420 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search food item, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>

          {/* Filters & Sorting */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={15} color="var(--primary)" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="ACCEPTED">Accepted Only</option>
                <option value="PICKUP_IN_PROGRESS">Pickup In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpDown size={15} color="var(--primary)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
              >
                <option value="DATE_DESC">Newest First</option>
                <option value="EXPIRY_ASC">Expiring Soonest</option>
                <option value="QTY_DESC">Quantity (High to Low)</option>
                <option value="FOOD_NAME">Food Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Status Rule Info Note */}
      <div style={{
        backgroundColor: 'var(--sage-light)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 16px',
        marginBottom: 20,
        fontSize: '0.82rem',
        color: 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <HelpCircle size={16} color="var(--primary)" />
        <span>
          <strong>Team Architecture Note:</strong> Pending donations can be modified or cancelled. Accepted donations are locked to allow Member 2 (NGO Module) to manage pickup logistics.
        </span>
      </div>

      {/* Donations Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading donations from Java backend...
          </div>
        ) : donations.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={42} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No donations matched your criteria.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Type & Category</th>
                  <th>Status</th>
                  <th>Expiry Deadline</th>
                  <th>Recipient NGO</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      #{d.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.foodName}</div>
                      {d.instructions && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {d.instructions.slice(0, 40)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{d.quantity}</strong> {d.quantityUnit}
                    </td>
                    <td>
                      <div>{d.foodType}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{d.category}</div>
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.85rem',
                        color: d.isExpired ? '#B91C1C' : 'inherit',
                        fontWeight: d.isExpired ? 700 : 500
                      }}>
                        {d.expiryDatetime ? new Date(d.expiryDatetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      {d.ngoName ? (
                        <span style={{ color: '#1E40AF', fontWeight: 600 }}>{d.ngoName}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Unclaimed</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setSelectedDonation(d)}
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: 6 }}
                        title="View Full Details"
                      >
                        <Eye size={13} />
                      </button>

                      {d.isEligibleForEdit ? (
                        <button
                          onClick={() => setEditingDonation(d)}
                          className="btn btn-outline btn-sm"
                          style={{ marginRight: 6 }}
                          title="Edit Pending Donation"
                        >
                          <Edit3 size={13} />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="btn btn-sm"
                          style={{ marginRight: 6, opacity: 0.3, cursor: 'not-allowed', backgroundColor: '#eee' }}
                          title="Locked: Can only edit PENDING donations"
                        >
                          <Edit3 size={13} />
                        </button>
                      )}

                      {d.isEligibleForCancel ? (
                        <button
                          onClick={() => handleCancel(d)}
                          className="btn btn-danger btn-sm"
                          title="Cancel Donation"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="btn btn-sm"
                          style={{ opacity: 0.3, cursor: 'not-allowed', backgroundColor: '#eee' }}
                          title="Cannot cancel non-pending donations"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedDonation && (
        <DonationDetailModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      )}

      {editingDonation && (
        <EditDonationModal
          donation={editingDonation}
          onSave={handleSaveEdit}
          onClose={() => setEditingDonation(null)}
        />
      )}
    </div>
  );
}
