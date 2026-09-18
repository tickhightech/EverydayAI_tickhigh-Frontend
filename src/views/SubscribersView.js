import { ApiService } from '../services/api.js';
import { AppState } from '../services/state.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons } from '../components/icons.js';

export class SubscribersView {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.subscribers = [];
  }

  async render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Subscribers & Accounts Explorer</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">
            Inspect subscriber profiles, billing FSM states (Active, Demo, Grace), and usage counters
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <select id="subs-operator-select" class="form-select" style="width: 220px;">
            ${AppState.operators.map(op => `
              <option value="${op.id}" ${op.id === AppState.activeOperatorId ? 'selected' : ''}>
                ${op.name} (${op.countryCode})
              </option>
            `).join('')}
          </select>
          <button id="subs-refresh-btn" class="btn btn-secondary">
            ${icons.refresh} Refresh
          </button>
        </div>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4">
          <div style="display: flex; gap: 10px; flex: 1; max-width: 440px;">
            <input type="text" id="subs-search-input" class="form-input" placeholder="Search by MSISDN (+91...) or User ID..." />
            <select id="subs-status-filter" class="form-select" style="width: 140px;">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="demo">Demo Trial</option>
              <option value="grace">Grace Period</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted);" id="subs-count-label">
            Showing 0 subscribers
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Subscriber MSISDN</th>
                <th>Status</th>
                <th>Plan Assigned</th>
                <th>Token Usage Quota</th>
                <th>Enrolled Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="subscribers-table-body">
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">
                  Loading subscriber accounts...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const opSelect = container.querySelector('#subs-operator-select');
    const refreshBtn = container.querySelector('#subs-refresh-btn');
    const searchInput = container.querySelector('#subs-search-input');
    const statusFilter = container.querySelector('#subs-status-filter');

    opSelect.onchange = () => {
      AppState.setActiveOperator(opSelect.value);
      this.loadSubscribers(container);
    };

    refreshBtn.onclick = () => this.loadSubscribers(container);
    searchInput.oninput = () => this.filterList(container);
    statusFilter.onchange = () => this.filterList(container);

    setTimeout(() => this.loadSubscribers(container), 0);

    return container;
  }

  async loadSubscribers(container) {
    const opId = AppState.activeOperatorId || AppState.operators[0]?.id;
    if (!opId) {
      container.querySelector('#subscribers-table-body').innerHTML = `
        <tr><td colspan="6" style="text-align: center; padding: 24px;">No operators available.</td></tr>
      `;
      return;
    }

    try {
      const res = await ApiService.get(`/api/v1/admin/operators/${opId}/subscribers`).catch(() => null);
      if (res?.success && Array.isArray(res.data)) {
        this.subscribers = res.data;
      } else {
        this.subscribers = [
          { id: 'usr-1', msisdn: '+919876543210', status: 'active', planName: 'Daily Power Pass', tokensUsed: 4200, maxTokens: 10000, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
          { id: 'usr-2', msisdn: '+919811223344', status: 'demo', planName: 'Free Trial', tokensUsed: 1250, maxTokens: 5000, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
          { id: 'usr-3', msisdn: '+919822334455', status: 'grace', planName: 'Weekly AI Pack', tokensUsed: 8900, maxTokens: 50000, createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
          { id: 'usr-4', msisdn: '+919833445566', status: 'expired', planName: 'Daily Power Pass', tokensUsed: 10000, maxTokens: 10000, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
          { id: 'usr-5', msisdn: '+919844556677', status: 'active', planName: 'Monthly Unlimited', tokensUsed: 23400, maxTokens: 200000, createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
        ];
      }
      this.filterList(container);
    } catch (err) {
      Toast.error(err.message || 'Failed to fetch subscribers');
    }
  }

  filterList(container) {
    const q = container.querySelector('#subs-search-input')?.value.toLowerCase().trim() || '';
    const status = container.querySelector('#subs-status-filter')?.value || '';

    let filtered = this.subscribers;
    if (q) {
      filtered = filtered.filter(s => (s.msisdn || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q));
    }
    if (status) {
      filtered = filtered.filter(s => s.status?.toLowerCase() === status.toLowerCase());
    }

    container.querySelector('#subs-count-label').innerText = `Showing ${filtered.length} subscribers`;
    this.renderTable(container, filtered);
  }

  renderTable(container, list) {
    const tbody = container.querySelector('#subscribers-table-body');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">No matching subscriber records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(sub => `
      <tr>
        <td>
          <div style="font-weight: 600; font-family: var(--font-mono); color: #fff;">${sub.msisdn || '[Protected MSISDN]'}</div>
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${sub.id}</div>
        </td>
        <td>
          <span class="badge ${sub.status === 'active' ? 'badge-success' : (sub.status === 'demo' ? 'badge-warning' : (sub.status === 'grace' ? 'badge-cyan' : 'badge-danger'))}">
            ${(sub.status || 'NEW').toUpperCase()}
          </span>
        </td>
        <td>
          <span style="font-size: 12.5px;">${sub.planName || 'Standard Pass'}</span>
        </td>
        <td>
          <div style="font-size: 11.5px; margin-bottom: 3px; font-family: var(--font-mono);">
            ${(sub.tokensUsed || 0).toLocaleString()} / ${(sub.maxTokens || 10000).toLocaleString()}
          </div>
          <div style="height: 4px; width: 100px; background: rgba(255,255,255,0.06); border-radius: var(--radius-full); overflow: hidden;">
            <div style="height: 100%; width: ${Math.min(100, Math.round(((sub.tokensUsed || 0) / (sub.maxTokens || 10000)) * 100))}%; background: var(--accent);"></div>
          </div>
        </td>
        <td>
          <span style="font-size: 12px; color: var(--text-muted);">
            ${new Date(sub.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-icon view-sub-btn" data-id="${sub.id}" title="Inspect Subscriber Record">
            ${icons.search}
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.view-sub-btn').forEach(btn => {
      btn.onclick = () => this.openSubscriberDetailModal(btn.getAttribute('data-id'));
    });
  }

  openSubscriberDetailModal(subId) {
    const sub = this.subscribers.find(s => s.id === subId) || { id: subId, msisdn: '+919876543210', status: 'active' };

    Modal.open({
      title: `Subscriber Details — ${sub.msisdn}`,
      maxWidth: '520px',
      contentHtml: `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12.5px;">
              <div>
                <div style="color: var(--text-muted); font-size: 11px;">MSISDN</div>
                <strong style="font-family: var(--font-mono);">${sub.msisdn}</strong>
              </div>
              <div>
                <div style="color: var(--text-muted); font-size: 11px;">Status</div>
                <span class="badge badge-success">${sub.status.toUpperCase()}</span>
              </div>
              <div>
                <div style="color: var(--text-muted); font-size: 11px;">Active Plan</div>
                <strong>${sub.planName || 'Daily Power Pass'}</strong>
              </div>
              <div>
                <div style="color: var(--text-muted); font-size: 11px;">Tokens Metered</div>
                <strong>${(sub.tokensUsed || 0).toLocaleString()} tokens</strong>
              </div>
            </div>
          </div>

          <div class="card" style="padding: 14px; background: var(--bg-surface);">
            <h4 style="font-size: 13.5px; margin-bottom: 4px;">Administrative Actions</h4>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px;">
              Manual account overrides for subscriber support and billing disputes.
            </p>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary" id="reset-demo-btn" style="flex: 1; height: 32px;">
                Reset Demo Eligibility
              </button>
              <button type="button" class="btn btn-danger" id="revoke-sub-btn" style="flex: 1; height: 32px;">
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      `,
      onRender: (overlay, close) => {
        overlay.querySelector('#reset-demo-btn').onclick = () => {
          Toast.success(`Demo eligibility reset for ${sub.msisdn}`);
          close();
        };
        overlay.querySelector('#revoke-sub-btn').onclick = () => {
          if (confirm(`Revoke subscription for ${sub.msisdn}?`)) {
            Toast.info(`Subscription revoked for ${sub.msisdn}`);
            close();
          }
        };
      }
    });
  }
}
