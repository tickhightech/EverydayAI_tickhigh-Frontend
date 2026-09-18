export class ApiService {
  static getBaseUrl() {
    return ''; // Relative path, proxy handles /api
  }

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

  static async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && !endpoint.includes('/login')) {
        this.setToken('');
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
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  }

  static get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;
    return this.request(fullEndpoint, { method: 'GET' });
  }

  static post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
