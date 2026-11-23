/**
 * Central FoodLoop API Client
 *
 * Provides standardized fetch operations connecting the React frontend to the
 * Java HttpServer backend running on port 8080 (via Vite proxy /api).
 *
 * Features:
 * - Credentials included on all requests for HTTP-only session cookies.
 * - CSRF defense header ('X-Requested-With: XMLHttpRequest').
 * - Standardized error formatting (401, 403, 404, 409, 500).
 * - Explicit database unavailability detection without silent fallbacks.
 */

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isDatabaseError =
      status === 500 &&
      Boolean(
        data?.error?.toLowerCase().includes('database') ||
        data?.error?.toLowerCase().includes('communications link') ||
        data?.message?.toLowerCase().includes('database')
      );
    this.isAuthError = status === 401;
    this.isForbidden = status === 403;
    this.isConflict = status === 409;
    this.isNotFound = status === 404;
    this.isNetworkError = status === 503;
  }
}

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;

  const defaultHeaders = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Satisfies backend AuthUtil CSRF protection
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    credentials: 'include', // Dispatches and accepts HTTP-only session cookies
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    throw new ApiError(
      'Unable to connect to the FoodLoop Java backend. Please verify the ApiServer is running on port 8080.',
      503,
      { originalError: netErr.message }
    );
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage =
      data?.error ||
      data?.message ||
      `HTTP error ${response.status}: ${response.statusText}`;

    if (response.status === 500 && typeof errorMessage === 'string') {
      if (
        errorMessage.toLowerCase().includes('database') ||
        errorMessage.toLowerCase().includes('communications link')
      ) {
        errorMessage =
          'The database service is currently unavailable. Live database records cannot be queried or updated at this time.';
      }
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};
