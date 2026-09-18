import { ApiService } from '../services/api.js';
import { AppState } from '../services/state.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons } from '../components/icons.js';

export class PlansView {
  constructor(onNavigate, operatorId = null) {
    this.operatorId = operatorId;
    this.onNavigate = onNavigate;
    this.plans = [];
  }

  async render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Subscription Plans & DCB Pricing</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Configure Daily, Weekly, and Monthly subscriber packs, local currencies, and token quotas</p>
        </div>
        <button id="create-plan-btn" class="btn btn-primary">
          ${icons.plus} Create Subscription Pack
        </button>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4">
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Filter by Carrier:</span>
            <select id="plans-operator-filter" class="form-select" style="width: 220px;">
              <option value="">All Operators</option>
              ${AppState.operators.map(op => `
                <option value="${op.id}" ${op.id === AppState.activeOperatorId ? 'selected' : ''}>
                  ${op.name} (${op.countryCode})
                </option>
              `).join('')}
            </select>
          </div>
          <button id="plans-refresh-btn" class="btn btn-secondary">
            ${icons.refresh} Refresh
          </button>
        </div>

        <div id="plans-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 16px;">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
            Loading subscription plans...
          </div>
        </div>
      </div>
    `;

    const createBtn = container.querySelector('#create-plan-btn');
    const refreshBtn = container.querySelector('#plans-refresh-btn');
    const filterSelect = container.querySelector('#plans-operator-filter');

    createBtn.onclick = () => this.openPlanModal(container);
    refreshBtn.onclick = () => this.loadPlans(container);
    if (this.operatorId) {
      filterSelect.value = this.operatorId;
      filterSelect.closest('.flex-between').querySelector('div').style.display = 'none';
    }
    filterSelect.onchange = () => {
      AppState.setActiveOperator(filterSelect.value);
    };

    setTimeout(() => this.loadPlans(container), 0);

    return container;
  }

  async loadPlans(container) {
    const filterOp = this.operatorId || container.querySelector('#plans-operator-filter')?.value;
    const params = filterOp ? { operatorId: filterOp } : {};

    try {
      const res = await ApiService.get('/api/v1/admin/plans', params);
      if (res.success && Array.isArray(res.data)) {
        this.plans = res.data;
        this.onPlansLoaded?.(this.plans);
        this.renderPlans(container, this.plans);
      }
    } catch (err) {
      Toast.error(err.message || 'Failed to fetch subscription plans');
    }
  }

  renderPlans(container, plans) {
    const grid = container.querySelector('#plans-grid');
    if (!grid) return;

    if (!plans || plans.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
          No subscription packs configured for this carrier. Click "Create Subscription Pack" to add one.
        </div>
      `;
      return;
    }

    grid.innerHTML = plans.map(plan => {
      const isHighlighted = plan.isHighlighted;
      const currencySymbol = plan.currencyCode === 'INR' ? '₹' : (plan.currencyCode === 'SAR' ? 'SAR ' : '$');
      const operator = AppState.operators.find(o => o.id === plan.operatorId);

      return `
        <div class="card" style="min-height: 290px; padding: 18px; display: flex; flex-direction: column; ${isHighlighted ? 'border-color: var(--accent);' : ''}">
          <!-- Card Top Meta Row -->
          <div class="flex-between mb-3" style="align-items: center;">
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <span class="badge ${plan.periodType === 'daily' ? 'badge-primary' : (plan.periodType === 'weekly' ? 'badge-cyan' : 'badge-warning')}">
                ${(plan.periodType || 'DAILY').toUpperCase()} PASS
              </span>
              ${isHighlighted ? `
                <span class="badge badge-primary" style="background: rgba(99, 102, 241, 0.25); color: #c7d2fe;">
                  ${plan.highlightBadge || 'POPULAR'}
                </span>
              ` : ''}
              ${operator ? `
                <span class="badge badge-secondary" style="font-size: 10px; background: rgba(255,255,255,0.06);">
                  ${operator.name}
                </span>
              ` : ''}
              ${plan.operatorPlanCode ? `
                <span class="badge" style="font-size: 10px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-family: var(--font-mono);" title="Carrier purchaseTypeId">
                  CODE: ${plan.operatorPlanCode}
                </span>
              ` : ''}
              ${plan.operatorSubServiceId ? `
                <span class="badge" style="font-size: 10px; background: rgba(14, 165, 233, 0.15); color: #38bdf8; font-family: var(--font-mono);" title="${plan.operatorSubServiceId}">
                  SUB-SVC: ${plan.operatorSubServiceId.slice(0, 14)}...
                </span>
              ` : ''}
            </div>
            <span class="badge ${plan.isActive ? 'badge-success' : 'badge-danger'}">
              ${plan.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          <!-- Title & Identifier -->
          <div style="margin-bottom: 12px;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">${plan.name}</h3>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${plan.slug}</div>
          </div>

          <!-- Price Typography -->
          <div style="margin-bottom: 14px; display: flex; align-items: baseline; gap: 4px;">
            <span style="font-size: 26px; font-weight: 700; font-family: var(--font-display); color: var(--text-primary); font-variant-numeric: tabular-nums;">
              ${currencySymbol}${parseFloat(plan.price || '0').toFixed(2)}
            </span>
            <span style="font-size: 12px; color: var(--text-secondary);"> / ${plan.periodDays} days</span>
          </div>

          <!-- Entitlements & Quotas Box -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 14px; font-size: 11.5px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">AI Token Quota:</span>
              <strong style="color: var(--brand-cyan); font-family: var(--font-mono);">${(plan.maxTokens || 0).toLocaleString()} tokens</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Daily Messages:</span>
              <strong style="color: var(--text-primary);">${plan.maxMessages ? `${plan.maxMessages} msgs` : 'Unlimited'}</strong>
            </div>
          </div>

          <!-- Pinned Actions -->
          <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-secondary edit-plan-btn" data-id="${plan.id}" style="flex: 1; font-size: 12px; height: 32px;">
              ${icons.edit} Edit Pack
            </button>
            <button class="btn btn-danger btn-icon delete-plan-btn" data-id="${plan.id}" title="Deactivate Pack" style="width: 32px; height: 32px; flex-shrink: 0;">
              ${icons.trash}
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.edit-plan-btn').forEach(btn => {
      btn.onclick = () => this.openPlanModal(container, btn.getAttribute('data-id'));
    });

    grid.querySelectorAll('.delete-plan-btn').forEach(btn => {
      btn.onclick = () => this.deletePlan(container, btn.getAttribute('data-id'));
    });
  }

  openPlanModal(container, editId = null) {
    const existing = editId ? this.plans.find(p => p.id === editId) : null;
    const filterOp = this.operatorId || container.querySelector('#plans-operator-filter')?.value;
    const defaultOpId = this.operatorId || AppState.activeOperatorId || AppState.operators[0]?.id;

    Modal.open({
      title: existing ? `Edit Pricing Pack — ${existing.name}` : 'Create Subscription Pack',
      maxWidth: '600px',
      contentHtml: `
        <form id="plan-form">
          <div class="form-group">
            <label class="form-label">Assigned Carrier Operator *</label>
            <select id="plan-operator" class="form-select" ${existing || this.operatorId ? 'disabled' : ''}>
              ${AppState.operators.map(op => `
                <option value="${op.id}" ${(existing ? existing.operatorId === op.id : (filterOp === op.id || op.id === defaultOpId)) ? 'selected' : ''}>
                  ${op.name} (${op.countryCode})
                </option>
              `).join('')}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Default / Internal Plan Name *</label>
              <input type="text" id="plan-name" class="form-input" placeholder="e.g. Daily Power Pass" required value="${existing?.name || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">Unique Slug *</label>
              <input type="text" id="plan-slug" class="form-input" placeholder="e.g. daily-power" required value="${existing?.slug || ''}" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Billing Period *</label>
              <select id="plan-period" class="form-select">
                <option value="daily" ${existing?.periodType === 'daily' ? 'selected' : ''}>Daily</option>
                <option value="weekly" ${existing?.periodType === 'weekly' ? 'selected' : ''}>Weekly</option>
                <option value="monthly" ${existing?.periodType === 'monthly' ? 'selected' : ''}>Monthly</option>
                <option value="yearly" ${existing?.periodType === 'yearly' ? 'selected' : ''}>Yearly</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Duration (Days) *</label>
              <input type="number" id="plan-days" class="form-input" min="1" max="365" value="${existing?.periodDays || 1}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Price (DCB Amount) *</label>
              <input type="text" id="plan-price" class="form-input" placeholder="5.0000" value="${existing?.price || '5.0000'}" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Currency Code *</label>
              <input type="text" id="plan-currency" class="form-input" placeholder="INR" maxlength="3" style="text-transform: uppercase;" value="${existing?.currencyCode || 'INR'}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Max Token Quota *</label>
              <input type="number" id="plan-tokens" class="form-input" min="1000" step="1000" value="${existing?.maxTokens || 10000}" required />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <label class="form-label">Message quota<input id="plan-messages" class="form-input" type="number" min="1" value="${existing?.maxMessages ?? ''}" placeholder="No message limit"></label>
            <label class="form-label">Quota mode<select id="plan-quota-mode" class="form-select">${['tokens','messages','combined','unlimited'].map(v => `<option ${v === (existing?.quotaMode || 'tokens') ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
            <label class="form-label">Quota reset<select id="plan-quota-reset" class="form-select">${['daily','period','never'].map(v => `<option ${v === (existing?.quotaResetPeriod || 'daily') ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
            <label class="form-label">Display order<input id="plan-order" class="form-input" type="number" value="${existing?.displayOrder ?? 0}"></label>
            <label><input id="plan-active" type="checkbox" ${existing?.isActive !== false ? 'checked' : ''}> Available to subscribers</label>
          </div>

          <!-- Carrier Pack Mapping Section -->
          <div style="background: rgba(99, 102, 241, 0.06); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-sm); padding: 12px; margin: 12px 0;">
            <div style="font-size: 12px; font-weight: 600; color: #a5b4fc; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>📡 Carrier Gateway Pack Mapping (Optional)</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="form-label" style="font-size: 11px;">Operator Pack Code / purchaseTypeId</label>
                <input type="text" id="plan-op-code" class="form-input" style="font-family: var(--font-mono); font-size: 11.5px;" placeholder="e.g. 2, 3, 4, daily" value="${existing?.operatorPlanCode || ''}" />
                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 3px;">Used for Universe DCB (e.g. 3 for weekly)</span>
              </div>
              <div>
                <label class="form-label" style="font-size: 11px;">Sub-Service Identifier (subServiceId)</label>
                <input type="text" id="plan-sub-service" class="form-input" style="font-family: var(--font-mono); font-size: 11.5px;" placeholder="e.g. Health Portal pass jour" value="${existing?.operatorSubServiceId || ''}" />
                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 3px;">Used for Orange BF / Subs_Engine</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 16px; align-items: center; margin: 8px 0 14px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12.5px;">
              <input type="checkbox" id="plan-highlight" ${existing?.isHighlighted ? 'checked' : ''} />
              <span>Highlight as "Popular" Pack</span>
            </label>
            <input type="text" id="plan-badge-text" class="form-input" style="width: 140px; padding: 6px 10px; font-size: 12px;" placeholder="Best Value" value="${existing?.highlightBadge || 'Popular'}" />
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-plan-btn" class="btn btn-primary">
              ${existing ? 'Update Pack' : 'Create Pricing Pack'}
            </button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#plan-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-plan-btn');
          btn.disabled = true;
          btn.innerText = 'Saving Pack...';

          const selectedOpId = this.operatorId || existing?.operatorId || overlay.querySelector('#plan-operator')?.value || defaultOpId;

          const payload = {
            name: overlay.querySelector('#plan-name').value.trim(),
            slug: overlay.querySelector('#plan-slug').value.trim().toLowerCase(),
            periodType: overlay.querySelector('#plan-period').value,
            periodDays: parseInt(overlay.querySelector('#plan-days').value, 10),
            price: overlay.querySelector('#plan-price').value.trim(),
            currencyCode: overlay.querySelector('#plan-currency').value.trim().toUpperCase(),
            maxTokens: parseInt(overlay.querySelector('#plan-tokens').value, 10),
            maxMessages: Number(overlay.querySelector('#plan-messages').value) || null,
            quotaMode: overlay.querySelector('#plan-quota-mode').value,
            quotaResetPeriod: overlay.querySelector('#plan-quota-reset').value,
            displayOrder: Number(overlay.querySelector('#plan-order').value),
            isActive: overlay.querySelector('#plan-active').checked,
            isHighlighted: overlay.querySelector('#plan-highlight').checked,
            highlightBadge: overlay.querySelector('#plan-badge-text').value.trim() || undefined,
            operatorPlanCode: overlay.querySelector('#plan-op-code')?.value.trim() || null,
            operatorSubServiceId: overlay.querySelector('#plan-sub-service')?.value.trim() || null,
            operatorId: selectedOpId || undefined,
          };

          try {
            if (editId) {
              await ApiService.put(`/api/v1/admin/plans/${editId}`, payload);
              Toast.success('Subscription pack updated successfully');
            } else {
              await ApiService.post('/api/v1/admin/plans', payload);
              Toast.success('New subscription pack created');
            }
            close();
            this.loadPlans(container);
          } catch (err) {
            Toast.error(err.message || 'Failed to save subscription pack');
            btn.disabled = false;
            btn.innerText = editId ? 'Update Pack' : 'Create Pricing Pack';
          }
        };
      }
    });
  }

  async deletePlan(container, planId) {
    if (!confirm('Are you sure you want to delete or deactivate this subscription pack?')) return;
    try {
      await ApiService.delete(`/api/v1/admin/plans/${planId}`);
      Toast.success('Subscription plan removed');
      this.loadPlans(container);
    } catch (err) {
      Toast.error(err.message || 'Failed to delete plan');
    }
  }
}
