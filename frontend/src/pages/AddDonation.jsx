import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Store, 
  Utensils, 
  Heart,
  History
} from 'lucide-react';

export default function AddDonation() {
  const { donor } = useAuth();

  // Form State
  const [foodName, setFoodName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('plates');
  const [category, setCategory] = useState('VEGETARIAN');
  const [foodType, setFoodType] = useState('COOKED');
  const [preparationDatetime, setPreparationDatetime] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  });
  const [expiryDatetime, setExpiryDatetime] = useState(() => {
    const d = new Date(Date.now() + 6 * 3600 * 1000); // 6 hours from now
    return d.toISOString().slice(0, 16);
  });
  const [pickupAddress, setPickupAddress] = useState(donor?.address || '');
  const [pickupTime, setPickupTime] = useState('Ready for pickup today until 8:00 PM');
  const [instructions, setInstructions] = useState('');
  const [isUnservedSurplus, setIsUnservedSurplus] = useState(true);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Compact History Table below form (matching Image 5 reference!)
  const [recentDonations, setRecentDonations] = useState([]);

  const fetchRecentHistory = async () => {
    try {
      const res = await api.donations.getMy({ sortBy: 'DATE_DESC' });
      setRecentDonations((res.data || []).slice(0, 8));
    } catch (e) {
      console.warn('Failed to fetch recent history:', e);
    }
  };

  useEffect(() => {
    fetchRecentHistory();
    if (donor?.address && !pickupAddress) {
      setPickupAddress(donor.address);
    }
  }, [donor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field Validations
    if (!foodName.trim()) {
      setError('Food item name is required.');
      return;
    }

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be a positive number greater than zero.');
      return;
    }

    if (!expiryDatetime) {
      setError('Expiry date and time is required.');
      return;
    }

    const expiryDate = new Date(expiryDatetime);
    if (expiryDate <= new Date()) {
      setError('Expiry date and time must be in the future.');
      return;
    }

    if (!isUnservedSurplus) {
      setError('Food safety rule: FoodLoop only accepts unserved surplus food. Plate leftovers cannot be redistributed.');
      return;
    }

    const payload = {
      foodName: foodName.trim(),
      description: description.trim(),
      quantity: qtyNum,
      quantityUnit,
      category,
      foodType,
      isUnservedSurplus: true,
      preparationDatetime,
      expiryDatetime,
      pickupAddress: pickupAddress.trim(),
      pickupTime: pickupTime.trim(),
      instructions: instructions.trim()
    };

    try {
      setLoading(true);
      const res = await api.donations.create(payload);
      setSuccess(res.message || 'Donation added successfully! Status is PENDING.');

      // Reset form
      setFoodName('');
      setDescription('');
      setQuantity('');
      setInstructions('');

      // Refresh table below
      fetchRecentHistory();
    } catch (err) {
      setError(err.message || 'Failed to add donation. Please verify all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.9rem', color: 'var(--primary)', marginBottom: 4 }}>
          Post Surplus Food Donation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          List freshly prepared or packaged unserved meals for verified NGOs to discover and claim.
        </p>
      </div>

      {/* Main Donation Card (matching Image 5 reference design) */}
      <div className="card" style={{ padding: '32px 36px', marginBottom: 36 }}>
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
          {/* Restaurant / Entity Name */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🏢</span> Restaurant / Donor Name
            </label>
            <input
              type="text"
              value={donor?.businessName || ''}
              readOnly
              style={{ backgroundColor: 'var(--cream-bg)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
            />
          </div>

          {/* Food Item */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🍲</span> Food Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Biryani, Sandwiches, Mixed Veg Curry"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 18 }}>
            <label>Description & Contents</label>
            <textarea
              rows={2}
              placeholder="e.g. Prepared for lunch buffet, stored in hot cases. Rice with carrots, beans, and aromatic spices."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid-2" style={{ marginBottom: 18 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📦</span> Quantity *
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                placeholder="e.g. 25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Quantity Unit *</label>
              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
              >
                <option value="plates">Plates</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="packets">Packets</option>
                <option value="boxes">Boxes</option>
                <option value="meals">Meals</option>
              </select>
            </div>
          </div>

          {/* Food Type & Dietary Category */}
          <div className="grid-2" style={{ marginBottom: 18 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🥗</span> Food Type *
              </label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
              >
                <option value="COOKED">Cooked</option>
                <option value="FRESH">Fresh</option>
                <option value="PACKAGED">Packaged</option>
              </select>
            </div>
            <div>
              <label>Dietary Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="VEGAN">Vegan</option>
                <option value="BAKERY">Bakery & Breads</option>
                <option value="DAIRY">Dairy & Desserts</option>
                <option value="GRAINS_AND_STAPLES">Grains & Staples</option>
                <option value="BEVERAGES">Beverages</option>
              </select>
            </div>
          </div>

          {/* Schedule: Preparation & Expiry */}
          <div className="grid-2" style={{ marginBottom: 18 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} color="var(--primary)" /> Preparation Time
              </label>
              <input
                type="datetime-local"
                value={preparationDatetime}
                onChange={(e) => setPreparationDatetime(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} color="#DC2626" /> Expiry Deadline *
              </label>
              <input
                type="datetime-local"
                value={expiryDatetime}
                onChange={(e) => setExpiryDatetime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Pickup Address & Window */}
          <div className="grid-2" style={{ marginBottom: 18 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={15} color="var(--primary)" /> Pickup Address *
              </label>
              <input
                type="text"
                placeholder="e.g. 45 Indiranagar, Back Door Kitchen"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Pickup Availability Time *</label>
              <input
                type="text"
                placeholder="e.g. Ready immediately until 7:30 PM"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: 20 }}>
            <label>Packaging & Handling Instructions</label>
            <input
              type="text"
              placeholder="e.g. Packed in foil boxes; bring thermal carry bags."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          {/* Status Field Display (As in Reference Image 5) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⏱</span> Initial Status
            </label>
            <input
              type="text"
              value="Pending (Open for NGO discovery)"
              readOnly
              style={{ backgroundColor: 'var(--cream-bg)', cursor: 'not-allowed', color: '#B45309', fontWeight: 600 }}
            />
          </div>

          {/* Food Safety Rule Certification */}
          <div style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 24
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: 4
            }}>
              <input
                type="checkbox"
                checked={isUnservedSurplus}
                onChange={(e) => setIsUnservedSurplus(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer' }}
                required
              />
              <span>
                Food Safety Rule: I certify this food is 100% unserved surplus food, prepared in hygienic conditions, and not plate leftovers.
              </span>
            </label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 28 }}>
              Notice: FoodLoop facilitates matching and does not certify food safety. Donors are responsible for initial safety and accurate expiry deadlines.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 700 }}
          >
            <PlusCircle size={18} />
            <span>{loading ? 'Submitting to FoodLoop...' : 'Add Donation'}</span>
          </button>
        </form>
      </div>

      {/* "Your Donation History" Table Section (Exactly as in Reference Image 5!) */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{
            fontSize: '1.45rem',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <History size={20} /> Your Donation History
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Summary of your latest posted donations
          </p>
        </div>

        {recentDonations.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
            No past donations yet. Fill the form above to add your first!
          </p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>
                      {donor?.businessName || d.donorBusinessName || 'My Entity'}
                    </td>
                    <td>
                      <strong>{d.foodName}</strong>
                    </td>
                    <td>
                      {d.quantity} {d.quantityUnit}
                    </td>
                    <td>
                      {d.foodType}
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Quote Banner (As in Reference Image 5) */}
      <div className="quote-banner">
        <Heart size={16} fill="#2C5E3B" color="#2C5E3B" />
        <span>"Every meal shared is a smile created." – FoodLoop</span>
      </div>
    </div>
  );
}
