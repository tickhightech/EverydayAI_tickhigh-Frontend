import { ApiService } from './api.js';

export class AppState {
  static operators = [];
  static activeOperatorId = localStorage.getItem('tickhigh_active_op') || '';
  static listeners = [];

  static subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  static notify() {
    this.listeners.forEach(fn => fn({
      operators: this.operators,
      activeOperatorId: this.activeOperatorId,
      activeOperator: this.getActiveOperator(),
    }));
  }

  static async loadOperators() {
    try {
      const res = await ApiService.get('/api/v1/admin/operators');
      if (res.success && Array.isArray(res.data)) {
        this.operators = res.data;
        if (!this.activeOperatorId && this.operators.length > 0) {
          this.setActiveOperator(this.operators[0].id);
        } else {
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Failed to load operators:', err);
    }
  }

  static setActiveOperator(id) {
    if (this.activeOperatorId === id) return;
    this.activeOperatorId = id;
    localStorage.setItem('tickhigh_active_op', id);
    this.notify();
  }

  static setActiveOperatorId(id) {
    return this.setActiveOperator(id);
  }

  static getActiveOperator() {
    return this.operators.find(op => op.id === this.activeOperatorId) || null;
  }
}
