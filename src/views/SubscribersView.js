import { ApiService } from '../services/api.js';
import { AppState } from '../services/state.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons } from '../components/icons.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class SubscribersView {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.subscribers = [];
    this.loadVersion = 0;
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

    const version = ++this.loadVersion;
    this.container = container;
    this.subscribers = [];
    container.querySelector('#subs-count-label').innerText = 'Loading subscribers…';
    container.querySelector('#subscribers-table-body').innerHTML = '<tr><td colspan="6">Loading subscribers…</td></tr>';
    try {
      const rows = [];
      for (let offset = 0; ; offset += 100) {
        const res = await ApiService.get(`/api/v1/admin/operators/${opId}/subscribers`, { limit: 100, offset });
        if (version !== this.loadVersion) return;
        if (!res?.success || !Array.isArray(res.data)) throw new Error('Invalid subscriber response');
        rows.push(...res.data);
        if (res.data.length < 100) break;
      }
      this.subscribers = rows;
      this.filterList(container);
    } catch (err) {
      if (version !== this.loadVersion) return;
      container.querySelector('#subs-count-label').innerText = 'Unable to load subscribers';
      container.querySelector('#subscribers-table-body').innerHTML = `<tr><td colspan="6">${escapeHtml(err.message)} — use Refresh to retry.</td></tr>`;
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
          <div style="font-weight: 600; font-family: var(--font-mono); color: #fff;">${escapeHtml(sub.msisdn || 'MSISDN unavailable')}</div>
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(sub.id)}</div>
        </td>
        <td>
          <span class="badge ${sub.status === 'active' ? 'badge-success' : (sub.status === 'demo' ? 'badge-warning' : (sub.status === 'grace' ? 'badge-cyan' : 'badge-danger'))}">
            ${escapeHtml((sub.status || 'NEW').toUpperCase())}
          </span>
        </td>
        <td>
          <span style="font-size: 12.5px;">${escapeHtml(sub.planName || 'No plan assigned')}</span>
        </td>
        <td>
          <div style="font-size: 11.5px; margin-bottom: 3px; font-family: var(--font-mono);">
            ${(sub.tokensUsed || 0).toLocaleString()} / ${sub.maxTokens == null ? 'Unlimited' : sub.maxTokens.toLocaleString()}
          </div>
          <div style="height: 4px; width: 100px; background: rgba(255,255,255,0.06); border-radius: var(--radius-full); overflow: hidden;">
            <div style="height: 100%; width: ${(sub.maxTokens > 0 ? Math.min(100, Math.round((sub.tokensUsed / sub.maxTokens) * 100)) : 0)}%; background: var(--accent);"></div>
          </div>
        </td>
        <td>
          <span style="font-size: 12px; color: var(--text-muted);">
            ${sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary view-sub-btn" data-id="${escapeHtml(sub.id)}" title="Inspect Subscriber Record">
            ${icons.search} Details & Tokens
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.view-sub-btn').forEach(btn => {
      btn.onclick = () => this.openSubscriberDetailModal(btn.getAttribute('data-id'));
    });
  }

  openSubscriberDetailModal(subId) {
    const sub = this.subscribers.find(s => s.id === subId);
    if (!sub) return;
    const fields = {
      'MSISDN': sub.msisdn ?? 'Unavailable — stored number could not be decoded',
      'User ID': sub.id, 'Name': sub.displayName, 'Country': sub.countryCode,
      'Language': sub.preferredLanguage, 'Account status': sub.accountStatus,
      'Subscription state': sub.subscription?.state ?? 'No subscription',
      'Plan': sub.planName ?? 'No plan assigned', 'Login count': sub.loginCount,
      'First login': sub.firstLoginAt, 'Last login': sub.lastLoginAt,
      'Created': sub.createdAt, 'Updated': sub.updatedAt,
      'Tokens used': sub.tokensUsed, 'Messages used': sub.messagesUsed,
      'Effective token limit': sub.maxTokens ?? 'Unlimited',
      'Usage period': sub.periodType, 'Period start': sub.periodStart,
    };
    Modal.open({
      title: `Subscriber — ${escapeHtml(sub.msisdn || sub.id)}`,
      maxWidth: '820px',
      contentHtml: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;overflow-wrap:anywhere;">
          ${Object.entries(fields).map(([key, value]) => `<div><div style="color:var(--text-muted);font-size:11px;">${escapeHtml(key)}</div><strong>${escapeHtml(value ?? '—')}</strong></div>`).join('')}
        </div>
        <form id="token-form" class="card" style="padding:16px;margin-bottom:20px;">
          <h4>Manage token quota</h4>
          <p style="color:var(--text-secondary);margin:8px 0;">Set this subscriber's token limit per usage period. Blank restores the plan/demo default; 0 blocks token usage. Existing usage is retained.</p>
          <label for="token-limit">Token limit override</label>
          <input id="token-limit" class="form-input" type="number" min="0" max="2147483647" step="1" value="${sub.tokenLimit ?? ''}" placeholder="Use plan/demo default" />
          <label for="token-reason">Reason for change</label>
          <input id="token-reason" class="form-input" minlength="3" maxlength="500" required placeholder="e.g. Customer support credit" />
          <p id="token-error" role="alert" style="color:var(--danger);"></p>
          <button type="submit" class="btn btn-primary" style="margin-top:12px;">Save token limit</button>
        </form>
        <h4>Complete subscriber record</h4>
        <p style="color:var(--text-secondary);">Profile, subscription, plan, demo counters and all recorded usage periods.</p>
        <pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;max-height:400px;overflow:auto;padding:12px;background:var(--bg-inset);">${escapeHtml(JSON.stringify(sub, null, 2))}</pre>
      `,
      onRender: (overlay, close) => {
        overlay.querySelector('#token-form').onsubmit = async event => {
          event.preventDefault();
          const button = overlay.querySelector('button[type="submit"]');
          const raw = overlay.querySelector('#token-limit').value.trim();
          const tokenLimit = raw === '' ? null : Number(raw);
          const reason = overlay.querySelector('#token-reason').value.trim();
          const error = overlay.querySelector('#token-error');
          if ((tokenLimit !== null && (!Number.isInteger(tokenLimit) || tokenLimit < 0 || tokenLimit > 2147483647)) || reason.length < 3) {
            error.textContent = 'Enter a whole token limit of 0 or more, and a reason (at least 3 characters).';
            return;
          }
          button.disabled = true;
          error.textContent = '';
          try {
            await ApiService.put(`/api/v1/admin/operators/${sub.operatorId}/subscribers/${sub.id}/tokens`, { tokenLimit, reason });
            Toast.success('Subscriber token limit saved');
            close();
            await this.loadSubscribers(this.container);
          } catch (err) {
            error.textContent = err.message || 'Could not save token limit';
            button.disabled = false;
          }
        };
      },
    });
  }
}
