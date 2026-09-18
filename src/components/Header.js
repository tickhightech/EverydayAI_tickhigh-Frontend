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

    let cleanTitle = (this.currentTitle || 'Overview').split('?')[0].replace(/-/g, ' ');
    if (cleanTitle === 'operator detail') {
      cleanTitle = 'Operator Studio';
    }

    headerEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; min-width: 0; overflow: hidden;">
        <h2 style="font-size: 17px; font-weight: 700; color: var(--text-primary); text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${cleanTitle}
        </h2>
        ${activeOp ? `
          <div class="badge badge-primary" style="font-size: 11px; white-space: nowrap; flex-shrink: 0;">
            ${activeOp.name} (${activeOp.subdomain || activeOp.code})
          </div>
        ` : `
          <div class="badge badge-cyan" style="font-size: 11px; white-space: nowrap; flex-shrink: 0;">
            Platform Root Scope
          </div>
        `}
      </div>

      <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-full);">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #ec4899); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white;">
            ${user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style="font-size: 12.5px; font-weight: 500; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${user?.email || 'admin@tickhigh.com'}
          </div>
          <span class="badge badge-success" style="font-size: 9px; padding: 1px 6px;">
            ${user?.role || 'SUPER ADMIN'}
          </span>
        </div>

        <button id="header-logout-btn" class="btn btn-secondary btn-icon" title="Log Out" style="width: 32px; height: 32px;">
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
