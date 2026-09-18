import { icons } from './icons.js';
import { AppState } from '../services/state.js';

export class Sidebar {
  constructor(activeRoute, onNavigate) {
    this.activeRoute = activeRoute;
    this.onNavigate = onNavigate;
  }

  render() {
    const navItems = [
      { id: 'overview', label: 'Overview', icon: icons.dashboard },
      { id: 'operators', label: 'Operators', icon: icons.operators },
      { id: 'agents', label: 'AI Categories', icon: icons.agents },
      { id: 'providers', label: 'Gateways & Flows', icon: icons.providers },
      { id: 'subscribers', label: 'Subscribers', icon: icons.subscribers },
      { id: 'notifications', label: 'Broadcast & Audit', icon: icons.notifications },
      { id: 'api-docs', label: 'Portal Admin APIs', icon: icons.swagger },
    ];

    const sidebarEl = document.createElement('aside');
    sidebarEl.className = 'sidebar';

    sidebarEl.innerHTML = `
      <div style="padding: 24px 20px 16px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: linear-gradient(135deg, #6366f1, #06b6d4); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3);">
          TH
        </div>
        <div>
          <div style="font-family: var(--font-display); font-weight: 700; font-size: 16px; letter-spacing: -0.01em;">TickHigh</div>
          <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Portal Admin</div>
        </div>
      </div>

      <nav style="flex: 1; padding: 12px 0; overflow-y: auto;">
        ${navItems.map(item => `
          <a href="#${item.id}" class="nav-item ${this.activeRoute === item.id || (item.id === 'operators' && this.activeRoute.startsWith('operator-detail')) ? 'active' : ''}" data-route="${item.id}">
            ${item.icon}
            <span>${item.label}</span>
          </a>
        `).join('')}

        <div style="margin: 16px 16px 8px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 8px;">
            Developer Resources
          </div>
          <a href="/docs/portal-admin/" target="_blank" class="nav-item" style="color: var(--accent-cyan);">
            ${icons.swagger}
            <span>Portal Admin Swagger</span>
          </a>
          <a href="/health" target="_blank" class="nav-item" style="font-size: 12px;">
            <div class="pulse-dot" style="margin-right: -4px;"></div>
            <span>System Health API</span>
          </a>
        </div>
      </nav>

      <div style="padding: 16px 20px; border-top: 1px solid var(--border-subtle); background: rgba(0,0,0,0.2); font-size: 12px; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
        <span>v1.0.0 Enterprise</span>
        <span class="badge badge-success" style="font-size: 10px;">Connected</span>
      </div>
    `;

    // Bind navigation clicks
    sidebarEl.querySelectorAll('a[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.onNavigate(route);
      });
    });

    // Bind operator switcher
    const opSelect = sidebarEl.querySelector('#sidebar-operator-select');
    if (opSelect) {
      opSelect.addEventListener('change', (e) => {
        AppState.setActiveOperator(e.target.value);
      });
    }

    return sidebarEl;
  }
}
