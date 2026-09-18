import { icons } from '../components/icons.js';

export class ApiDocsView {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.height = 'calc(100vh - 80px)';

    const endpoints = [
      { method: 'GET', path: '/health', tag: 'System', desc: 'System & Database Health Check' },
      { method: 'POST', path: '/api/v1/admin/auth/login', tag: 'Auth', desc: 'Platform Super Admin Login' },
      { method: 'GET', path: '/api/v1/admin/auth/me', tag: 'Auth', desc: 'Active Session & Profile Info' },
      { method: 'GET', path: '/api/v1/admin/operators', tag: 'Operators', desc: 'List all onboarded operators' },
      { method: 'POST', path: '/api/v1/admin/operators', tag: 'Operators', desc: 'Onboard a new telecom carrier tenant' },
      { method: 'GET', path: '/api/v1/admin/operators/{id}', tag: 'Operators', desc: 'Get carrier profile & config' },
      { method: 'PUT', path: '/api/v1/admin/operators/{id}', tag: 'Operators', desc: 'Update carrier metadata & tiers' },
      { method: 'PUT', path: '/api/v1/admin/operators/{id}/status', tag: 'Operators', desc: 'Toggle active / maintenance / inactive' },
      { method: 'PUT', path: '/api/v1/admin/operators/{id}/settings', tag: 'Operators', desc: 'Update demo quotas & fraud rules' },
      { method: 'PUT', path: '/api/v1/admin/operators/{id}/theme', tag: 'Operators', desc: 'Update branding & design tokens' },
      { method: 'POST', path: '/api/v1/admin/operators/{id}/languages', tag: 'Operators', desc: 'Upsert localized language strings' },
      { method: 'GET', path: '/api/v1/admin/operators/{id}/agents', tag: 'Operators', desc: 'List AI categories assigned to carrier' },
      { method: 'POST', path: '/api/v1/admin/operators/{id}/agents', tag: 'Operators', desc: 'Assign/reorder AI categories for carrier' },
      { method: 'DELETE', path: '/api/v1/admin/operators/{id}/agents/{agentId}', tag: 'Operators', desc: 'Unassign AI category from carrier' },
      { method: 'GET', path: '/api/v1/admin/operators/{id}/analytics', tag: 'Analytics', desc: 'Carrier financial & subscriber metrics' },
      { method: 'GET', path: '/api/v1/admin/operators/{id}/subscribers', tag: 'Subscribers', desc: 'Carrier subscriber base explorer' },
      { method: 'GET', path: '/api/v1/admin/plans', tag: 'Plans', desc: 'List commercial subscription packs' },
      { method: 'POST', path: '/api/v1/admin/plans', tag: 'Plans', desc: 'Create new pricing pass & token quota' },
      { method: 'PUT', path: '/api/v1/admin/plans/{id}', tag: 'Plans', desc: 'Update existing pack pricing & limits' },
      { method: 'DELETE', path: '/api/v1/admin/plans/{id}', tag: 'Plans', desc: 'Deactivate / delete pricing pack' },
      { method: 'GET', path: '/api/v1/admin/providers/flow-types', tag: 'Providers', desc: 'List supported telecom flow adapters' },
      { method: 'POST', path: '/api/v1/admin/providers/test-connectivity', tag: 'Providers', desc: 'Live ping drill & gateway validation' },
      { method: 'POST', path: '/api/v1/admin/providers/{operatorId}/{type}/config', tag: 'Providers', desc: 'Store encrypted gateway config' },
      { method: 'GET', path: '/api/v1/admin/ai/catalog', tag: 'AI Categories', desc: 'List global AI category catalog' },
      { method: 'POST', path: '/api/v1/admin/ai/catalog', tag: 'AI Categories', desc: 'Create AI category in catalog' },
      { method: 'PUT', path: '/api/v1/admin/ai/catalog/{id}', tag: 'AI Categories', desc: 'Rename AI category in catalog' },
      { method: 'DELETE', path: '/api/v1/admin/ai/catalog/{id}', tag: 'AI Categories', desc: 'Delete AI category from catalog' },
      { method: 'POST', path: '/api/v1/admin/notifications/dispatch', tag: 'Broadcast', desc: 'Dispatch SMS / Push notification alert' },
      { method: 'GET', path: '/api/v1/admin/notifications/logs', tag: 'Broadcast', desc: 'Notification delivery receipts & audit log' },
    ];

    container.innerHTML = `
      <div class="flex-between mb-4">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h1 style="font-size: 22px; margin-bottom: 2px;">Portal Admin API Specification</h1>
            <span class="badge badge-success">21 Endpoints Active</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 13px;">
            Complete OpenAPI documentation, schemas, and live test harness under <code>/docs/portal-admin/</code>
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="/docs/portal-admin/" target="_blank" class="btn btn-primary">
            ${icons.externalLink} Open Swagger in New Window
          </a>
          <a href="/health" target="_blank" class="btn btn-secondary">
            ${icons.activity} Health API
          </a>
        </div>
      </div>

      <!-- Quick Endpoint Grid Drawer -->
      <details class="card mb-4" style="padding: 14px 18px;">
        <summary style="cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between;">
          <span>All Documented <code>/docs/portal-admin/</code> Endpoints (${endpoints.length})</span>
          <span style="font-size: 11px; color: var(--brand-cyan);">Click to expand / collapse</span>
        </summary>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 8px; margin-top: 14px; max-height: 260px; overflow-y: auto; padding-right: 6px;">
          ${endpoints.map(e => `
            <div style="padding: 8px 12px; background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 11.5px;">
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span class="badge ${e.method === 'GET' ? 'badge-primary' : (e.method === 'POST' ? 'badge-success' : (e.method === 'PUT' ? 'badge-warning' : 'badge-danger'))}" style="padding: 2px 6px; font-size: 9.5px;">
                  ${e.method}
                </span>
                <code style="font-family: var(--font-mono); color: var(--text-primary); font-size: 11px;">${e.path}</code>
              </div>
              <span style="font-size: 10px; color: var(--text-muted);">${e.tag}</span>
            </div>
          `).join('')}
        </div>
      </details>

      <!-- Embedded Interactive Swagger UI -->
      <div class="card" style="flex: 1; padding: 0; overflow: hidden; border-radius: var(--radius-md); display: flex; flex-direction: column;">
        <div style="padding: 10px 16px; background: rgba(0,0,0,0.3); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></div>
            <span style="font-weight: 600;">Interactive Swagger UI Sandbox</span>
            <span style="color: var(--text-muted);">— http://localhost:3000/docs/portal-admin/</span>
          </div>
          <button id="reload-iframe-btn" class="btn btn-secondary btn-sm" style="height: 26px; padding: 0 10px; font-size: 11px;">
            ${icons.refresh} Reload Sandbox
          </button>
        </div>
        <iframe id="swagger-iframe" src="/docs/portal-admin/" style="flex: 1; width: 100%; border: none; min-height: 500px; background: #ffffff;"></iframe>
      </div>
    `;

    const reloadBtn = container.querySelector('#reload-iframe-btn');
    const iframe = container.querySelector('#swagger-iframe');
    if (reloadBtn && iframe) {
      reloadBtn.onclick = () => {
        iframe.src = '/docs/portal-admin/';
      };
    }

    return container;
  }
}
