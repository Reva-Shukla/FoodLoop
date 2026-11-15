import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export default function EditDonationModal({ donation, onSave, onClose }) {
  if (!donation) return null;

  const [formData, setFormData] = useState({
    foodName: donation.foodName || '',
    description: donation.description || '',
    quantity: donation.quantity || 1,
    quantityUnit: donation.quantityUnit || 'plates',
    category: donation.categoryCode || donation.category || 'Vegetarian',
    foodType: donation.foodTypeCode || donation.foodType || 'COOKED',
    expiryDatetime: donation.expiryDatetime ? donation.expiryDatetime.slice(0, 16) : '',
    pickupAddress: donation.pickupAddress || '',
    pickupTime: donation.pickupTime || '',
    instructions: donation.instructions || ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.foodName.trim()) {
      setError('Food item name is required.');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }
    if (!formData.expiryDatetime) {
      setError('Expiry date and time is required.');
      return;
    }

    const expiryDate = new Date(formData.expiryDatetime);
    if (expiryDate <= new Date()) {
      setError('Expiry date and time must be later than now.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(donation.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update donation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>
            Edit Donation #{donation.id}
          </h2>
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

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.88rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label>Food Item Name *</label>
            <input
              type="text"
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div>
              <label>Quantity *</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label>Unit</label>
              <select
                value={formData.quantityUnit}
                onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
              >
                <option value="plates">Plates</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="packets">Packets</option>
                <option value="boxes">Boxes</option>
                <option value="meals">Meals</option>
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div>
              <label>Food Type</label>
              <select
                value={formData.foodType}
                onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              >
                <option value="COOKED">Cooked</option>
                <option value="FRESH">Fresh</option>
                <option value="PACKAGED">Packaged</option>
              </select>
            </div>
            <div>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="VEGAN">Vegan</option>
                <option value="BAKERY">Bakery & Breads</option>
                <option value="DAIRY">Dairy</option>
                <option value="GRAINS_AND_STAPLES">Grains & Staples</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>Expiry Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.expiryDatetime}
              onChange={(e) => setFormData({ ...formData, expiryDatetime: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>Pickup Availability Time *</label>
            <input
              type="text"
              value={formData.pickupTime}
              onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>Pickup Address *</label>
            <input
              type="text"
              value={formData.pickupAddress}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
