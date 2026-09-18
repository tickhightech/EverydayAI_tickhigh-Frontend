import { ApiService } from './api.js';

export class AuthService {
  static currentUser = null;

  static isAuthenticated() {
    return !!ApiService.getToken();
  }

  static async login(email, password) {
    const res = await ApiService.post('/api/v1/admin/auth/login', { email, password });
    if (res.success && res.data) {
      const { accessToken, token, refreshToken } = res.data;
      // Store access token (prefer explicit accessToken field, fall back to token alias)
      ApiService.setToken(accessToken || token);
      // Store refresh token for silent re-auth
      if (refreshToken) {
        ApiService.setRefreshToken(refreshToken);
      }
      this.currentUser = res.data.admin || res.data.user || null;
      return res.data;
    }
    throw new Error('Login failed: Invalid credentials or token missing');
  }

  /**
   * Manually refresh the admin session and return the new token pair.
   * @returns {Promise<{ accessToken: string, refreshToken: string }|null>}
   */
  static async refreshToken() {
    try {
      const newAccessToken = await ApiService.refreshAccessToken();
      return newAccessToken;
    } catch {
      this.logout();
      return null;
    }
  }

  static async fetchMe() {
    if (!this.isAuthenticated()) return null;
    try {
      const res = await ApiService.get('/api/v1/admin/auth/me');
      if (res.success && res.data) {
        this.currentUser = res.data;
        return res.data;
      }
    } catch {
      this.logout();
    }
    return null;
  }

  static logout() {
    // Best-effort server-side revocation (fire and forget)
    if (ApiService.getToken()) {
      ApiService.post('/api/v1/admin/auth/logout').catch(() => {});
    }
    ApiService.setToken('');
    ApiService.setRefreshToken('');
    this.currentUser = null;
    window.location.reload();
  }
}
