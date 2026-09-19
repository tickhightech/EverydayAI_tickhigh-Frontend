export class ApiService {
  static getBaseUrl() {
    return ''; // Relative path, proxy handles /api
  }

  // ── Access Token ──────────────────────────────────────────────────────────
  static getToken() {
    return localStorage.getItem('tickhigh_admin_token') || '';
  }

  static setToken(token) {
    if (token) {
      localStorage.setItem('tickhigh_admin_token', token);
    } else {
      localStorage.removeItem('tickhigh_admin_token');
    }
  }

  // ── Refresh Token ─────────────────────────────────────────────────────────
  static getRefreshToken() {
    return localStorage.getItem('tickhigh_admin_refresh_token') || '';
  }

  static setRefreshToken(token) {
    if (token) {
      localStorage.setItem('tickhigh_admin_refresh_token', token);
    } else {
      localStorage.removeItem('tickhigh_admin_refresh_token');
    }
  }

  // ── Token Refresh (internal, with lock to prevent concurrent refresh storms) ──
  static _refreshPromise = null;

  static async _doRefresh() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/v1/admin/auth/token/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Token refresh failed');
    }

    const { accessToken, token, refreshToken: newRefreshToken } = data.data || {};
    const newAccessToken = accessToken || token;

    if (!newAccessToken) {
      throw new Error('No access token in refresh response');
    }

    this.setToken(newAccessToken);
    if (newRefreshToken) {
      this.setRefreshToken(newRefreshToken);
    }

    return newAccessToken;
  }

  /**
   * Refresh the access token. Concurrent callers share the same in-flight promise
   * to avoid refresh-token rotation races.
   */
  static async refreshAccessToken() {
    if (!this._refreshPromise) {
      this._refreshPromise = this._doRefresh().finally(() => {
        this._refreshPromise = null;
      });
    }
    return this._refreshPromise;
  }

  // ── Core Request ──────────────────────────────────────────────────────────
  static async request(endpoint, options = {}, _isRetry = false) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err) {
      console.error(`API Network Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }

    // ── Auto-Refresh on 401 ─────────────────────────────────────────────────
    if (
      response.status === 401 &&
      !_isRetry &&
      !endpoint.includes('/login') &&
      !endpoint.includes('/token/refresh') &&
      this.getRefreshToken()
    ) {
      try {
        // A slower 401 may arrive after another request already refreshed.
        if (this.getToken() === token) await this.refreshAccessToken();
        // Retry the original request once with the new access token
        return this.request(endpoint, options, true);
      } catch (refreshErr) {
        // Refresh failed — clear tokens and signal session expiry
        this.setToken('');
        this.setRefreshToken('');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new Error('Session expired. Please log in again.');
      }
    }

    // ── Hard 401 (refresh itself failed or no refresh token) ────────────────
    if (response.status === 401 && !endpoint.includes('/login')) {
      this.setToken('');
      this.setRefreshToken('');
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = data?.error?.message || data?.message || `Request failed with status ${response.status}`;

      // Enhance Zod 422 validation errors with readable details
      if (response.status === 422 && data?.error?.details) {
        const detailStrings = data.error.details.map(d => {
          const field = d.path?.join('.') || (d.keys ? d.keys.join(', ') : 'root');
          return `${field}: ${d.message || 'Invalid value'}`;
        });
        errorMessage = `Validation error: ${detailStrings.join(' | ')}`;
      }

      const err = new Error(errorMessage);
      err.status = response.status;
      err.details = data?.error?.details;
      throw err;
    }

    return data;
  }

  // Share concurrent GETs only. Completed responses are never cached.
  static _pendingGets = new Map();

  static get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;
    const key = JSON.stringify([this.getToken(), fullEndpoint]);
    let pending = this._pendingGets.get(key);
    if (!pending) {
      pending = this.request(fullEndpoint, { method: 'GET' }).finally(() => {
        if (this._pendingGets.get(key) === pending) this._pendingGets.delete(key);
      });
      this._pendingGets.set(key, pending);
    }
    // Callers may edit their data; do not share mutable response objects.
    return pending.then(data => structuredClone(data));
  }

  static post(endpoint, body = {}) {
    this._pendingGets.clear();
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }).finally(() => this._pendingGets.clear());
  }

  static put(endpoint, body = {}) {
    this._pendingGets.clear();
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }).finally(() => this._pendingGets.clear());
  }

  static delete(endpoint) {
    this._pendingGets.clear();
    return this.request(endpoint, { method: 'DELETE' }).finally(() => this._pendingGets.clear());
  }
}
