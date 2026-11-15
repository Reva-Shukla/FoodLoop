/**
 * FoodLoop API Service
 * Communicates with the Core Java HTTP Server running on port 8080.
 */

const API_BASE = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('foodloop_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('foodloop_token');
      localStorage.removeItem('foodloop_donor');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?session=expired';
      }
    }
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    logout: () => request('/auth/logout', {
      method: 'POST'
    })
  },

  // Donor Profile & Dashboard
  donor: {
    getProfile: () => request('/donors/profile'),
    updateProfile: (profileData) => request('/donors/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
    changePassword: (passwordData) => request('/donors/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    }),
    getDashboard: () => request('/donors/dashboard')
  },

  // Donations Management
  donations: {
    create: (donationData) => request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData)
    }),
    getMy: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/donations/my${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/donations/${id}`),
    update: (id, updateData) => request(`/donations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }),
    cancel: (id) => request(`/donations/${id}/cancel`, {
      method: 'PUT'
    }),
    getHistory: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/donations/history${q ? `?${q}` : ''}`);
    },
    getExpiringSoon: () => request('/donations/expiring-soon'),
    getExportUrl: () => {
      const token = localStorage.getItem('foodloop_token');
      return `${API_BASE}/donations/export?token=${encodeURIComponent(token || '')}`;
    }
  },

  // Team Integration (Member 2 NGO module simulator/testing)
  integration: {
    getAvailable: () => request('/integration/donations/available'),
    claimByNgo: (id, ngoData) => request(`/integration/donations/${id}/claim`, {
      method: 'POST',
      body: JSON.stringify(ngoData)
    })
  }
};
