import { ApiService } from '../services/api.js';
import { AppState } from '../services/state.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons } from '../components/icons.js';

export class OperatorsView {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
  }

  async render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Telecom Carrier Management</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Provision new carriers, customize branding tokens, and configure language dictionaries</p>
        </div>
        <button id="onboard-operator-btn" class="btn btn-primary">
          ${icons.plus} Onboard Carrier
        </button>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4">
          <div style="display: flex; gap: 10px; flex: 1; max-width: 380px;">
            <input type="text" id="op-search-input" class="form-input" placeholder="Search by operator name, code, or country..." />
          </div>
          <button id="op-refresh-btn" class="btn btn-secondary">
            ${icons.refresh} Refresh
          </button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Operator Name</th>
                <th>Code / Subdomain</th>
                <th>Country</th>
                <th>Status</th>
                <th>Operations Contact</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="operators-table-body">
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 28px;">
                  Loading operator records...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const onboardBtn = container.querySelector('#onboard-operator-btn');
    const refreshBtn = container.querySelector('#op-refresh-btn');
    const searchInput = container.querySelector('#op-search-input');

    onboardBtn.onclick = () => this.openOnboardModal(container);
    refreshBtn.onclick = () => this.loadOperators(container);
    searchInput.oninput = () => this.filterOperators(container, searchInput.value);

    setTimeout(() => this.loadOperators(container), 0);

    return container;
  }

  async loadOperators(container) {
    try {
      await AppState.loadOperators();
      this.renderTable(container, AppState.operators);
    } catch (err) {
      Toast.error(err.message || 'Failed to load operators');
    }
  }

  filterOperators(container, query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.renderTable(container, AppState.operators);
      return;
    }
    const filtered = AppState.operators.filter(op =>
      op.name?.toLowerCase().includes(q) ||
      op.code?.toLowerCase().includes(q) ||
      op.subdomain?.toLowerCase().includes(q) ||
      op.countryCode?.toLowerCase().includes(q)
    );
    this.renderTable(container, filtered);
  }

  renderTable(container, operators) {
    const tbody = container.querySelector('#operators-table-body');
    if (!tbody) return;

    if (!operators || operators.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">
            No telecom operators found matching the criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = operators.map(op => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent); flex-shrink: 0;">
              ${op.name?.charAt(0) || 'O'}
            </div>
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${op.name}</div>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${op.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div><code style="font-family: var(--font-mono);">${op.code}</code></div>
          <div style="font-size: 11px; color: var(--brand-cyan);">${op.subdomain}.tickhigh.com</div>
        </td>
        <td><span class="badge badge-cyan">${op.countryCode || 'IN'}</span></td>
        <td><span class="badge ${op.status === 'active' ? 'badge-success' : 'badge-warning'}">${op.status}</span></td>
        <td><span style="font-size: 12px; color: var(--text-secondary);">${op.contactEmail || 'ops@carrier.com'}</span></td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 4px;">
            <button class="btn btn-secondary btn-icon edit-op-btn" data-id="${op.id}" title="Edit Operator Profile & Status">
              ${icons.edit}
            </button>
            <button class="btn btn-secondary btn-icon edit-theme-btn" data-id="${op.id}" title="Branding Theme">
              ${icons.palette}
            </button>
            <button class="btn btn-secondary btn-icon edit-settings-btn" data-id="${op.id}" title="Carrier Settings">
              ${icons.settings}
            </button>
            <button class="btn btn-secondary btn-icon edit-agents-btn" data-id="${op.id}" title="Assigned AI Assistants">
              ${icons.agents}
            </button>
            <button class="btn btn-secondary btn-icon edit-lang-btn" data-id="${op.id}" title="Localization">
              ${icons.globe}
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-op-btn').forEach(btn => {
      btn.onclick = () => this.openEditOperatorModal(btn.getAttribute('data-id'), container);
    });
    tbody.querySelectorAll('.edit-theme-btn').forEach(btn => {
      btn.onclick = () => this.openThemeModal(btn.getAttribute('data-id'), container);
    });
    tbody.querySelectorAll('.edit-settings-btn').forEach(btn => {
      btn.onclick = () => this.openSettingsModal(btn.getAttribute('data-id'));
    });
    tbody.querySelectorAll('.edit-agents-btn').forEach(btn => {
      btn.onclick = () => this.openAssignedAgentsModal(btn.getAttribute('data-id'));
    });
    tbody.querySelectorAll('.edit-lang-btn').forEach(btn => {
      btn.onclick = () => this.openLanguagesModal(btn.getAttribute('data-id'));
    });
  }

  openOnboardModal(container) {
    Modal.open({
      title: 'Onboard New Telecom Operator',
      contentHtml: `
        <form id="onboard-op-form">
          <div class="form-group">
            <label class="form-label">Operator Display Name *</label>
            <input type="text" id="new-op-name" class="form-input" placeholder="e.g. STC Saudi Arabia" required minlength="2" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Operator Code *</label>
              <input type="text" id="new-op-code" class="form-input" placeholder="e.g. stc_sa" required pattern="^[a-z0-9_]{3,30}$" />
              <span style="font-size: 10px; color: var(--text-muted);">Lowercase letters, numbers, underscore</span>
            </div>

            <div class="form-group">
              <label class="form-label">Subdomain *</label>
              <input type="text" id="new-op-subdomain" class="form-input" placeholder="e.g. stc" required pattern="^[a-z0-9-]{2,30}$" />
              <span style="font-size: 10px; color: var(--text-muted);">Tenant host subdomain</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Country Code (2-char) *</label>
              <input type="text" id="new-op-country" class="form-input" placeholder="e.g. SA" required maxlength="2" minlength="2" style="text-transform: uppercase;" />
            </div>

            <div class="form-group">
              <label class="form-label">Operations Email *</label>
              <input type="email" id="new-op-email" class="form-input" placeholder="ops@carrier.com" required />
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="onboard-submit-btn" class="btn btn-primary">Provision Operator</button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#onboard-op-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const submitBtn = overlay.querySelector('#onboard-submit-btn');
          submitBtn.disabled = true;
          submitBtn.innerText = 'Creating Tenant...';

          const payload = {
            name: overlay.querySelector('#new-op-name').value.trim(),
            code: overlay.querySelector('#new-op-code').value.trim().toLowerCase(),
            subdomain: overlay.querySelector('#new-op-subdomain').value.trim().toLowerCase(),
            countryCode: overlay.querySelector('#new-op-country').value.trim().toUpperCase(),
            contactEmail: overlay.querySelector('#new-op-email').value.trim(),
          };

          try {
            const res = await ApiService.post('/api/v1/admin/operators', payload);
            if (res.success) {
              Toast.success(`Operator ${payload.name} onboarded successfully`);
              close();
              this.loadOperators(container);
            }
          } catch (err) {
            Toast.error(err.message || 'Failed to onboard operator');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Provision Operator';
          }
        };
      }
    });
  }

  async openThemeModal(operatorId, container) {
    let operator = AppState.operators.find(o => o.id === operatorId);
    if (!operator) return;

    // Fetch fresh operator details with theme from backend
    try {
      const res = await ApiService.get(`/api/v1/admin/operators/${operatorId}`);
      if (res.success && res.data) {
        operator = res.data;
      }
    } catch (e) {
      console.warn('Could not fetch fresh operator detail, using cached:', e);
    }

    const theme = operator.theme || {};
    const initialPrimary = theme.primaryColor || '#6C5CE7';
    const initialSecondary = theme.secondaryColor || '#00B894';
    const initialFont = theme.fontFamily || 'Inter';
    const initialRadius = theme.borderRadius || '14px';
    const initialLogo = theme.logoUrl || '';

    Modal.open({
      title: `Branding & Theme Tokens — ${operator.name}`,
      maxWidth: '620px',
      contentHtml: `
        <form id="theme-editor-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Primary Brand Color</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="theme-primary" value="${initialPrimary}" style="height: 34px; width: 40px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); background: none; cursor: pointer;" />
                <input type="text" id="theme-primary-text" class="form-input" value="${initialPrimary}" placeholder="#hex" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Secondary / Accent Color</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="theme-secondary" value="${initialSecondary}" style="height: 34px; width: 40px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); background: none; cursor: pointer;" />
                <input type="text" id="theme-secondary-text" class="form-input" value="${initialSecondary}" placeholder="#hex" />
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Font Family</label>
              <select id="theme-font" class="form-select">
                <option value="Inter" ${initialFont === 'Inter' ? 'selected' : ''}>Inter (Clean Modern)</option>
                <option value="Outfit" ${initialFont === 'Outfit' ? 'selected' : ''}>Outfit (Display Rounded)</option>
                <option value="Roboto" ${initialFont === 'Roboto' ? 'selected' : ''}>Roboto (Classic)</option>
                <option value="Cairo" ${initialFont === 'Cairo' ? 'selected' : ''}>Cairo (Arabic / RTL)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Card Border Radius</label>
              <select id="theme-radius" class="form-select">
                <option value="8px" ${initialRadius === '8px' ? 'selected' : ''}>8px (Compact)</option>
                <option value="14px" ${initialRadius === '14px' ? 'selected' : ''}>14px (Modern Soft)</option>
                <option value="20px" ${initialRadius === '20px' ? 'selected' : ''}>20px (Rounded)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Operator Logo SVG/PNG URL</label>
            <input type="url" id="theme-logo" class="form-input" placeholder="https://assets.tickhigh.com/logos/airtel.svg" value="${initialLogo}" />
          </div>

          <!-- Live Theme Preview Sandbox -->
          <div style="margin-top: 14px; padding: 12px; border-radius: var(--radius-md); background: var(--bg-inset); border: 1px solid var(--border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 10.5px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">
                Live Subscriber Theme Preview
              </span>
              <span id="preview-secondary-badge" style="font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; background: ${initialSecondary}22; color: ${initialSecondary}; border: 1px solid ${initialSecondary}55;">
                Accent Color Active
              </span>
            </div>
            <div id="theme-preview-box" style="padding: 14px; border-radius: ${initialRadius}; border: 1px solid rgba(255,255,255,0.08); background: var(--bg-surface); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <h4 id="preview-title" style="color: #fff; margin-bottom: 2px; font-size: 14px; font-family: ${initialFont};">${operator.name} AI Pass</h4>
                <div style="font-size: 11px; color: var(--text-muted);">₹5 / day with direct carrier billing</div>
              </div>
              <button type="button" id="preview-btn" class="btn" style="background: ${initialPrimary}; color: white; height: 32px; padding: 0 16px; border-radius: 6px;">
                Subscribe
              </button>
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-theme-btn" class="btn btn-primary">Save Theme</button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const pColor = overlay.querySelector('#theme-primary');
        const pText = overlay.querySelector('#theme-primary-text');
        const sColor = overlay.querySelector('#theme-secondary');
        const sText = overlay.querySelector('#theme-secondary-text');
        const fontSelect = overlay.querySelector('#theme-font');
        const radiusSelect = overlay.querySelector('#theme-radius');
        const previewBtn = overlay.querySelector('#preview-btn');
        const previewBadge = overlay.querySelector('#preview-secondary-badge');
        const previewBox = overlay.querySelector('#theme-preview-box');
        const previewTitle = overlay.querySelector('#preview-title');

        const updatePreview = () => {
          previewBtn.style.background = pColor.value;
          pText.value = pColor.value;
          sText.value = sColor.value;
          previewBadge.style.background = `${sColor.value}22`;
          previewBadge.style.color = sColor.value;
          previewBadge.style.borderColor = `${sColor.value}55`;
          previewBox.style.borderRadius = radiusSelect.value;
          previewTitle.style.fontFamily = fontSelect.value;
        };

        pColor.oninput = updatePreview;
        pText.oninput = () => {
          if (/^#[0-9A-Fa-f]{6}$/.test(pText.value)) {
            pColor.value = pText.value;
          }
          previewBtn.style.background = pText.value;
        };

        sColor.oninput = updatePreview;
        sText.oninput = () => {
          if (/^#[0-9A-Fa-f]{6}$/.test(sText.value)) {
            sColor.value = sText.value;
          }
          previewBadge.style.background = `${sText.value}22`;
          previewBadge.style.color = sText.value;
          previewBadge.style.borderColor = `${sText.value}55`;
        };

        fontSelect.onchange = updatePreview;
        radiusSelect.onchange = updatePreview;

        const form = overlay.querySelector('#theme-editor-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-theme-btn');
          btn.disabled = true;
          btn.innerText = 'Saving...';

          try {
            await ApiService.put(`/api/v1/admin/operators/${operatorId}/theme`, {
              primaryColor: pColor.value,
              secondaryColor: sColor.value,
              fontFamily: fontSelect.value,
              borderRadius: radiusSelect.value,
              logoUrl: overlay.querySelector('#theme-logo').value || undefined,
            });
            Toast.success('Branding theme updated successfully');
            close();
            await AppState.loadOperators();
            if (container) {
              this.loadOperators(container);
            }
          } catch (err) {
            Toast.error(err.message || 'Failed to update theme');
            btn.disabled = false;
            btn.innerText = 'Save Theme';
          }
        };
      }
    });
  }

  openSettingsModal(operatorId) {
    const operator = AppState.operators.find(o => o.id === operatorId);
    if (!operator) return;

    Modal.open({
      title: `Policy & Settings — ${operator.name}`,
      contentHtml: `
        <form id="settings-editor-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Demo Max Messages</label>
              <input type="number" id="setting-demo-msg" class="form-input" value="10" min="1" max="100" />
            </div>

            <div class="form-group">
              <label class="form-label">Demo Max Tokens</label>
              <input type="number" id="setting-demo-tokens" class="form-input" value="5000" min="100" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Grace Period (Days)</label>
              <input type="number" id="setting-grace-days" class="form-input" value="3" min="0" max="30" />
            </div>

            <div class="form-group">
              <label class="form-label">Trial Duration (Hours)</label>
              <input type="number" id="setting-trial-hours" class="form-input" value="48" min="1" max="168" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Terms & Conditions URL</label>
            <input type="url" id="setting-terms" class="form-input" value="https://${operator.subdomain || 'airtel'}.tickhigh.com/terms" />
          </div>

          <div class="form-group">
            <label class="form-label">Operations Support Email</label>
            <input type="email" id="setting-support-email" class="form-input" value="support@${operator.subdomain || 'carrier'}.com" />
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-settings-btn" class="btn btn-primary">Save Settings</button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#settings-editor-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-settings-btn');
          btn.disabled = true;

          try {
            await ApiService.put(`/api/v1/admin/operators/${operatorId}/settings`, {
              demoMaxMessages: parseInt(overlay.querySelector('#setting-demo-msg').value, 10),
              demoMaxTokens: parseInt(overlay.querySelector('#setting-demo-tokens').value, 10),
              gracePeriodDays: parseInt(overlay.querySelector('#setting-grace-days').value, 10),
              trialDurationHours: parseInt(overlay.querySelector('#setting-trial-hours').value, 10),
              termsUrl: overlay.querySelector('#setting-terms').value,
              supportEmail: overlay.querySelector('#setting-support-email').value,
            });
            Toast.success('Operator policy settings updated');
            close();
          } catch (err) {
            Toast.error(err.message || 'Failed to update settings');
            btn.disabled = false;
          }
        };
      }
    });
  }

  openLanguagesModal(operatorId) {
    const operator = AppState.operators.find(o => o.id === operatorId);
    if (!operator) return;

    Modal.open({
      title: `Localization Strings — ${operator.name}`,
      maxWidth: '580px',
      contentHtml: `
        <form id="lang-editor-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Language Code</label>
              <select id="lang-code" class="form-select">
                <option value="en">English (en)</option>
                <option value="hi">Hindi (hi)</option>
                <option value="ar">Arabic (ar - RTL)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Layout Direction</label>
              <select id="lang-dir" class="form-select">
                <option value="ltr">Left to Right (LTR)</option>
                <option value="rtl">Right to Left (RTL)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Portal Main Heading</label>
            <input type="text" id="str-title" class="form-input" value="${operator.name} AI Studio" required />
          </div>

          <div class="form-group">
            <label class="form-label">Subheading Description</label>
            <input type="text" id="str-subtitle" class="form-input" value="Experience cutting-edge conversational AI on your phone" required />
          </div>

          <div class="form-group">
            <label class="form-label">CTA Button Label</label>
            <input type="text" id="str-cta" class="form-input" value="Get Instant Access" required />
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-lang-btn" class="btn btn-primary">Save Strings</button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const langCode = overlay.querySelector('#lang-code');
        const langDir = overlay.querySelector('#lang-dir');
        langCode.onchange = () => {
          langDir.value = langCode.value === 'ar' ? 'rtl' : 'ltr';
        };

        const form = overlay.querySelector('#lang-editor-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-lang-btn');
          btn.disabled = true;

          try {
            await ApiService.post(`/api/v1/admin/operators/${operatorId}/languages`, {
              languageCode: langCode.value,
              direction: langDir.value,
              strings: {
                title: overlay.querySelector('#str-title').value,
                subtitle: overlay.querySelector('#str-subtitle').value,
                ctaSubscribe: overlay.querySelector('#str-cta').value,
              }
            });
            Toast.success(`Language bundle '${langCode.value}' saved`);
            close();
          } catch (err) {
            Toast.error(err.message || 'Failed to save strings');
            btn.disabled = false;
          }
        };
      }
    });
  }

  async openEditOperatorModal(operatorId, container) {
    let operator = AppState.operators.find(o => o.id === operatorId);
    if (!operator) return;

    try {
      const res = await ApiService.get(`/api/v1/admin/operators/${operatorId}`);
      if (res.success && res.data) {
        operator = res.data;
      }
    } catch (e) {
      console.warn('Could not fetch fresh operator detail:', e);
    }

    Modal.open({
      title: `Edit Carrier Tenant — ${operator.name}`,
      maxWidth: '600px',
      contentHtml: `
        <form id="edit-op-form">
          <div class="form-group">
            <label class="form-label">Operator Display Name *</label>
            <input type="text" id="edit-op-name" class="form-input" value="${operator.name || ''}" required minlength="2" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Operator Status *</label>
              <select id="edit-op-status" class="form-select">
                <option value="active" ${operator.status === 'active' ? 'selected' : ''}>Active (Live Portal)</option>
                <option value="maintenance" ${operator.status === 'maintenance' ? 'selected' : ''}>Maintenance Mode</option>
                <option value="inactive" ${operator.status === 'inactive' ? 'selected' : ''}>Inactive / Suspended</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Platform Tier</label>
              <select id="edit-op-tier" class="form-select">
                <option value="starter" ${operator.platformTier === 'starter' ? 'selected' : ''}>Starter</option>
                <option value="growth" ${operator.platformTier === 'growth' ? 'selected' : ''}>Growth Tier</option>
                <option value="enterprise" ${operator.platformTier === 'enterprise' ? 'selected' : ''}>Enterprise Telco</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Operations Contact Email *</label>
              <input type="email" id="edit-op-email" class="form-input" value="${operator.contactEmail || ''}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Contact Person Name</label>
              <input type="text" id="edit-op-contact-name" class="form-input" value="${operator.contactName || ''}" placeholder="e.g. Rahul Sharma" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Timezone</label>
              <input type="text" id="edit-op-timezone" class="form-input" value="${operator.timezone || 'Asia/Kolkata'}" />
            </div>

            <div class="form-group">
              <label class="form-label">Default Language</label>
              <select id="edit-op-lang" class="form-select">
                <option value="en" ${operator.defaultLanguage === 'en' ? 'selected' : ''}>English (en)</option>
                <option value="hi" ${operator.defaultLanguage === 'hi' ? 'selected' : ''}>Hindi (hi)</option>
                <option value="ar" ${operator.defaultLanguage === 'ar' ? 'selected' : ''}>Arabic (ar)</option>
              </select>
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-op-btn" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#edit-op-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-op-btn');
          btn.disabled = true;
          btn.innerText = 'Updating...';

          const newStatus = overlay.querySelector('#edit-op-status').value;
          const payload = {
            name: overlay.querySelector('#edit-op-name').value.trim(),
            contactEmail: overlay.querySelector('#edit-op-email').value.trim(),
            contactName: overlay.querySelector('#edit-op-contact-name').value.trim() || undefined,
            timezone: overlay.querySelector('#edit-op-timezone').value.trim(),
            defaultLanguage: overlay.querySelector('#edit-op-lang').value,
            platformTier: overlay.querySelector('#edit-op-tier').value,
          };

          try {
            await ApiService.put(`/api/v1/admin/operators/${operatorId}`, payload);
            if (newStatus !== operator.status) {
              await ApiService.put(`/api/v1/admin/operators/${operatorId}/status`, { status: newStatus });
            }
            Toast.success('Operator profile & status updated successfully');
            close();
            await AppState.loadOperators();
            if (container) {
              this.loadOperators(container);
            }
          } catch (err) {
            Toast.error(err.message || 'Failed to update operator');
            btn.disabled = false;
            btn.innerText = 'Save Changes';
          }
        };
      }
    });
  }

  async openAssignedAgentsModal(operatorId) {
    const operator = AppState.operators.find(o => o.id === operatorId);
    if (!operator) return;

    Modal.open({
      title: `Assigned AI Assistants — ${operator.name}`,
      maxWidth: '650px',
      contentHtml: `
        <div style="margin-bottom: 14px; font-size: 13px; color: var(--text-secondary);">
          Enable or disable which AI Assistants are offered on the <strong>${operator.name}</strong> subscriber portal.
        </div>
        <div id="operator-agents-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto; padding-right: 4px;">
          <div style="text-align: center; color: var(--text-muted); padding: 24px;">Loading assigned AI models...</div>
        </div>
        <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
          <button type="button" class="btn btn-primary" onclick="document.getElementById('modal-close-btn').click()">Done</button>
        </div>
      `,
      onRender: async (overlay) => {
        const listEl = overlay.querySelector('#operator-agents-list');
        try {
          const [catalogRes, assignedRes] = await Promise.all([
            ApiService.get('/api/v1/admin/ai/catalog'),
            ApiService.get(`/api/v1/admin/operators/${operatorId}/agents`).catch(() => ({ data: [] })),
          ]);

          const catalog = catalogRes?.data || [];
          const assignedIds = new Set((assignedRes?.data || []).map(a => a.agentId || a.id));

          if (catalog.length === 0) {
            listEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 24px;">No agents found in global catalog.</div>';
            return;
          }

          listEl.innerHTML = catalog.map(agent => {
            const isAssigned = assignedIds.has(agent.id);
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--radius-sm); background: var(--bg-inset); border: 1px solid var(--border-subtle);">
                <div style="display: flex; gap: 10px; align-items: center;">
                  <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(99,102,241,0.15); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                    ${(agent.name || 'AI').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${agent.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${agent.model || 'Model'} • ${agent.category || 'General'}</div>
                  </div>
                </div>
                <button class="btn btn-sm ${isAssigned ? 'btn-danger' : 'btn-secondary'} toggle-agent-btn" data-id="${agent.id}" data-assigned="${isAssigned}">
                  ${isAssigned ? 'Unassign / Remove' : '+ Enable for Carrier'}
                </button>
              </div>
            `;
          }).join('');

          listEl.querySelectorAll('.toggle-agent-btn').forEach(btn => {
            btn.onclick = async () => {
              const agentId = btn.getAttribute('data-id');
              const isAssigned = btn.getAttribute('data-assigned') === 'true';
              btn.disabled = true;

              try {
                if (isAssigned) {
                  await ApiService.delete(`/api/v1/admin/operators/${operatorId}/agents/${agentId}`);
                  Toast.success('Agent removed from carrier portal');
                  btn.setAttribute('data-assigned', 'false');
                  btn.className = 'btn btn-sm btn-secondary toggle-agent-btn';
                  btn.innerText = '+ Enable for Carrier';
                } else {
                  await ApiService.post(`/api/v1/admin/operators/${operatorId}/agents`, { agentIds: [agentId] });
                  Toast.success('Agent assigned to carrier portal');
                  btn.setAttribute('data-assigned', 'true');
                  btn.className = 'btn btn-sm btn-danger toggle-agent-btn';
                  btn.innerText = 'Unassign / Remove';
                }
              } catch (err) {
                Toast.error(err.message || 'Operation failed');
              } finally {
                btn.disabled = false;
              }
            };
          });
        } catch (err) {
          listEl.innerHTML = `<div style="color: #fb7185; padding: 14px;">Failed to load agents: ${err.message}</div>`;
        }
      }
    });
  }
}
