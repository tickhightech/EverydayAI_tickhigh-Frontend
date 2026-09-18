import { icons } from './icons.js';
import { AuthService } from '../services/auth.js';
import { AppState } from '../services/state.js';

export class Header {
  constructor(currentTitle) {
    this.currentTitle = currentTitle;
  }

  render() {
    const headerEl = document.createElement('header');
    headerEl.className = 'top-header';

    const user = AuthService.currentUser;
    const activeOp = AppState.getActiveOperator();

    headerEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        <h2 style="font-size: 18px; font-weight: 700; color: var(--text-primary); text-transform: capitalize;">
          ${this.currentTitle}
        </h2>
        ${activeOp ? `
          <div class="badge badge-primary" style="font-size: 11px;">
            ${activeOp.name} (${activeOp.subdomain || activeOp.code})
          </div>
        ` : `
          <div class="badge badge-cyan" style="font-size: 11px;">
            Platform Root Scope
          </div>
        `}
      </div>

      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 10px; padding: 5px 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-full);">
          <div style="width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #ec4899); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white;">
            ${user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style="font-size: 13px; font-weight: 500;">
            ${user?.email || 'admin@tickhigh.com'}
          </div>
          <span class="badge badge-success" style="font-size: 9px; padding: 1px 6px;">
            ${user?.role || 'SUPER ADMIN'}
          </span>
        </div>

        <button id="header-logout-btn" class="btn btn-secondary btn-icon" title="Log Out">
          ${icons.logout}
        </button>
      </div>
    `;

    headerEl.querySelector('#header-logout-btn').onclick = () => {
      if (confirm('Are you sure you want to log out?')) {
        AuthService.logout();
      }
    };

    return headerEl;
  }
}
