import { ApiService } from './api.js';

export class AuthService {
  static currentUser = null;

  static isAuthenticated() {
    return !!ApiService.getToken();
  }

  static async login(email, password) {
    const res = await ApiService.post('/api/v1/admin/auth/login', { email, password });
    if (res.success && res.data?.token) {
      ApiService.setToken(res.data.token);
      this.currentUser = res.data.admin;
      return res.data;
    }
    throw new Error('Login failed: Invalid credentials or token missing');
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
    ApiService.setToken('');
    this.currentUser = null;
    window.location.reload();
  }
}
