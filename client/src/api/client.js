/**
 * Centralized API Client with Cookie and Bearer support
 */

const BASE_URL = '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('cybernexus_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Crucial: Transmit HTTP-Only cookies
    });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = { message: await res.text() };
    }

    if (!res.ok) {
      const errorMsg =
        data?.message ||
        (data?.errors && data.errors.map((e) => e.message).join(', ')) ||
        `Request failed with status ${res.status}`;
      return { ok: false, status: res.status, data, error: errorMsg };
    }

    return { ok: true, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Network connection error. Please ensure the backend server is running.',
    };
  }
};
