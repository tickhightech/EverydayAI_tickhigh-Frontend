import { ApiService } from '../services/api.js';
import { AppState } from '../services/state.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons, getCategoryIcon } from '../components/icons.js';

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
            <div class="view-op-detail-btn" data-id="${op.id}" style="width: 34px; height: 34px; border-radius: var(--radius-sm); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent); flex-shrink: 0; cursor: pointer;" title="View Details">
              ${op.name?.charAt(0) || 'O'}
            </div>
            <div>
              <div class="view-op-detail-btn" data-id="${op.id}" style="font-weight: 600; color: var(--text-primary); cursor: pointer;" title="View Details">${op.name}</div>
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
          <div style="display: inline-flex; gap: 6px; align-items: center;">
            <button class="btn btn-primary btn-sm view-op-detail-btn" data-id="${op.id}" title="View Operator Detail Screen" style="padding: 4px 10px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              <span>Detail View</span> &rarr;
            </button>
            <button class="btn btn-secondary btn-icon edit-op-btn" data-id="${op.id}" title="Edit Operator Profile & Status">
              ${icons.edit}
            </button>
            <button class="btn btn-secondary btn-icon edit-theme-btn" data-id="${op.id}" title="Branding Theme & SDUI Screens">
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

    tbody.querySelectorAll('.view-op-detail-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        this.onNavigate(`operator-detail?id=${id}`);
      };
    });
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
    const initialBg = theme.backgroundColor || '#0A0A0A';
    const initialText = theme.textColor || '#FFFFFF';
    const initialCardBg = theme.cardBgColor || '#1A1A2E';
    const initialFont = theme.fontFamily || 'Inter';
    const initialRadius = theme.borderRadius || '14px';
    const initialLogo = theme.logoUrl || '';
    const initialFavicon = theme.faviconUrl || '';
    const initialHero = theme.heroImageUrl || '';
    const initialCss = theme.customCss || '';

    const flowScreens = theme.flowScreens || {};
    const msisdnScreen = flowScreens.msisdnScreen || {};
    const planScreen = flowScreens.planScreen || {};
    const otpScreen = flowScreens.otpScreen || {};
    const dashboardScreen = flowScreens.dashboardScreen || {};

    Modal.open({
      title: `Theme & Subscription Flow Screens — ${operator.name}`,
      maxWidth: '720px',
      contentHtml: `
        <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
          <button type="button" id="tab-btn-branding" class="btn btn-primary btn-sm" style="font-size: 12px;">🎨 Brand & Colors</button>
          <button type="button" id="tab-btn-flows" class="btn btn-secondary btn-sm" style="font-size: 12px;">📱 Subscription Flow Screens (SDUI)</button>
        </div>

        <form id="theme-editor-form">
          <!-- TAB 1: BRANDING & COLORS -->
          <div id="tab-pane-branding">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
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

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Background Color</label>
                <input type="text" id="theme-bg" class="form-input" value="${initialBg}" placeholder="#0A0A0A" />
              </div>
              <div class="form-group">
                <label class="form-label">Text Color</label>
                <input type="text" id="theme-text" class="form-input" value="${initialText}" placeholder="#FFFFFF" />
              </div>
              <div class="form-group">
                <label class="form-label">Card Background</label>
                <input type="text" id="theme-card-bg" class="form-input" value="${initialCardBg}" placeholder="#1A1A2E" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
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
                  <option value="12px" ${initialRadius === '12px' ? 'selected' : ''}>12px (Standard)</option>
                  <option value="14px" ${initialRadius === '14px' ? 'selected' : ''}>14px (Modern Soft)</option>
                  <option value="20px" ${initialRadius === '20px' ? 'selected' : ''}>20px (Rounded)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Operator Logo URL</label>
                <input type="url" id="theme-logo" class="form-input" placeholder="https://assets.tickhigh.com/logos/airtel.svg" value="${initialLogo}" />
              </div>
              <div class="form-group">
                <label class="form-label">Favicon URL</label>
                <input type="url" id="theme-favicon" class="form-input" placeholder="https://assets.tickhigh.com/logos/favicon.ico" value="${initialFavicon}" />
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Hero Illustration / Banner URL</label>
              <input type="url" id="theme-hero" class="form-input" placeholder="https://assets.tickhigh.com/hero-banner.webp" value="${initialHero}" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Custom CSS Overrides</label>
              <textarea id="theme-css" class="form-textarea" rows="2" style="font-family: var(--font-mono); font-size: 11px;" placeholder=".btn-brand { font-weight: 700; }">${initialCss}</textarea>
            </div>
          </div>

          <!-- TAB 2: FLOW SCREENS (SDUI) -->
          <div id="tab-pane-flows" style="display: none; max-height: 420px; overflow-y: auto; padding-right: 6px;">
            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--brand-cyan); margin-bottom: 8px;">1. Mobile Number Entry Screen (MSISDN)</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Screen Title</label>
                  <input type="text" id="flow-msisdn-title" class="form-input" style="font-size: 12px;" value="${msisdnScreen.title || 'Enter your mobile number'}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Continue Button Text</label>
                  <input type="text" id="flow-msisdn-btn" class="form-input" style="font-size: 12px;" value="${msisdnScreen.buttonText || 'Continue'}" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 11px;">Subtitle</label>
                <input type="text" id="flow-msisdn-subtitle" class="form-input" style="font-size: 12px;" value="${msisdnScreen.subtitle || 'Get instant access to AI Assistants'}" />
              </div>
            </div>

            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--brand-cyan); margin-bottom: 8px;">2. Plan Selection Screen</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Screen Title</label>
                  <input type="text" id="flow-plan-title" class="form-input" style="font-size: 12px;" value="${planScreen.title || 'Choose your AI Plan'}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Subscribe Button Text</label>
                  <input type="text" id="flow-plan-btn" class="form-input" style="font-size: 12px;" value="${planScreen.buttonText || 'Subscribe Now'}" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 11px;">Subtitle</label>
                <input type="text" id="flow-plan-subtitle" class="form-input" style="font-size: 12px;" value="${planScreen.subtitle || 'Billed directly to your mobile carrier'}" />
              </div>
            </div>

            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--brand-cyan); margin-bottom: 8px;">3. OTP Verification Screen</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Screen Title</label>
                  <input type="text" id="flow-otp-title" class="form-input" style="font-size: 12px;" value="${otpScreen.title || 'Verify OTP'}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Verify Button Text</label>
                  <input type="text" id="flow-otp-btn" class="form-input" style="font-size: 12px;" value="${otpScreen.buttonText || 'Confirm & Enter'}" />
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Subtitle</label>
                  <input type="text" id="flow-otp-subtitle" class="form-input" style="font-size: 12px;" value="${otpScreen.subtitle || 'Enter the 4-digit code sent via SMS'}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Resend Text</label>
                  <input type="text" id="flow-otp-resend" class="form-input" style="font-size: 12px;" value="${otpScreen.resendText || 'Resend OTP in 60s'}" />
                </div>
              </div>
            </div>

            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 13px; font-weight: 600; color: var(--brand-cyan); margin-bottom: 8px;">4. Dashboard Screen</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Welcome Title</label>
                  <input type="text" id="flow-dash-title" class="form-input" style="font-size: 12px;" value="${dashboardScreen.welcomeTitle || 'Ask Any Question'}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Subtitle</label>
                  <input type="text" id="flow-dash-subtitle" class="form-input" style="font-size: 12px;" value="${dashboardScreen.subtitle || 'Ask questions to specialized assistants'}" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-theme-btn" class="btn btn-primary">Save Theme & Screens</button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const tabBranding = overlay.querySelector('#tab-btn-branding');
        const tabFlows = overlay.querySelector('#tab-btn-flows');
        const paneBranding = overlay.querySelector('#tab-pane-branding');
        const paneFlows = overlay.querySelector('#tab-pane-flows');

        tabBranding.onclick = () => {
          tabBranding.className = 'btn btn-primary btn-sm';
          tabFlows.className = 'btn btn-secondary btn-sm';
          paneBranding.style.display = 'block';
          paneFlows.style.display = 'none';
        };

        tabFlows.onclick = () => {
          tabFlows.className = 'btn btn-primary btn-sm';
          tabBranding.className = 'btn btn-secondary btn-sm';
          paneBranding.style.display = 'none';
          paneFlows.style.display = 'block';
        };

        const pColor = overlay.querySelector('#theme-primary');
        const pText = overlay.querySelector('#theme-primary-text');
        const sColor = overlay.querySelector('#theme-secondary');
        const sText = overlay.querySelector('#theme-secondary-text');
        const fontSelect = overlay.querySelector('#theme-font');
        const radiusSelect = overlay.querySelector('#theme-radius');

        pColor.oninput = () => { pText.value = pColor.value; };
        pText.oninput = () => {
          if (/^#[0-9A-Fa-f]{6}$/.test(pText.value)) pColor.value = pText.value;
        };

        sColor.oninput = () => { sText.value = sColor.value; };
        sText.oninput = () => {
          if (/^#[0-9A-Fa-f]{6}$/.test(sText.value)) sColor.value = sText.value;
        };

        const form = overlay.querySelector('#theme-editor-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-theme-btn');
          btn.disabled = true;
          btn.innerText = 'Saving...';

          try {
            const payload = {
              primaryColor: pColor.value,
              secondaryColor: sColor.value,
              backgroundColor: overlay.querySelector('#theme-bg').value.trim() || '#0A0A0A',
              textColor: overlay.querySelector('#theme-text').value.trim() || '#FFFFFF',
              cardBgColor: overlay.querySelector('#theme-card-bg').value.trim() || '#1A1A2E',
              fontFamily: fontSelect.value,
              borderRadius: radiusSelect.value,
              logoUrl: overlay.querySelector('#theme-logo').value.trim() || undefined,
              faviconUrl: overlay.querySelector('#theme-favicon').value.trim() || undefined,
              heroImageUrl: overlay.querySelector('#theme-hero').value.trim() || undefined,
              customCss: overlay.querySelector('#theme-css').value.trim() || undefined,
              flowScreens: {
                msisdnScreen: {
                  title: overlay.querySelector('#flow-msisdn-title').value.trim() || undefined,
                  subtitle: overlay.querySelector('#flow-msisdn-subtitle').value.trim() || undefined,
                  buttonText: overlay.querySelector('#flow-msisdn-btn').value.trim() || undefined,
                },
                planScreen: {
                  title: overlay.querySelector('#flow-plan-title').value.trim() || undefined,
                  subtitle: overlay.querySelector('#flow-plan-subtitle').value.trim() || undefined,
                  buttonText: overlay.querySelector('#flow-plan-btn').value.trim() || undefined,
                },
                otpScreen: {
                  title: overlay.querySelector('#flow-otp-title').value.trim() || undefined,
                  subtitle: overlay.querySelector('#flow-otp-subtitle').value.trim() || undefined,
                  buttonText: overlay.querySelector('#flow-otp-btn').value.trim() || undefined,
                  resendText: overlay.querySelector('#flow-otp-resend').value.trim() || undefined,
                },
                dashboardScreen: {
                  welcomeTitle: overlay.querySelector('#flow-dash-title').value.trim() || undefined,
                  subtitle: overlay.querySelector('#flow-dash-subtitle').value.trim() || undefined,
                }
              }
            };

            await ApiService.put(`/api/v1/admin/operators/${operatorId}/theme`, payload);
            Toast.success('Branding theme and subscription flow screens updated');
            close();
            await AppState.loadOperators();
            if (container) {
              this.loadOperators(container);
            }
          } catch (err) {
            Toast.error(err.message || 'Failed to update theme');
            btn.disabled = false;
            btn.innerText = 'Save Theme & Screens';
          }
        };
      }
    });
  }

  openSettingsModal(operatorId) {
    const operator = AppState.operators.find(o => o.id === operatorId);
    if (!operator) return;

    const settings = operator.settings || {};

    Modal.open({
      title: `Platform Policy & Settings — ${operator.name}`,
      maxWidth: '560px',
      contentHtml: `
        <form id="settings-editor-form">
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="setting-seamless-login" ${settings.seamlessLoginEnabled !== false ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--brand-primary);" />
              <div>
                <strong style="font-size: 13px; color: var(--text-primary);">Enable Instant Seamless Login</strong>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                  Active subscribers skip OTP and log in instantly upon entering MSISDN.
                </div>
              </div>
            </label>
          </div>

          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="setting-demo-enabled" ${settings.demoEnabled !== false ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--brand-primary);" />
              <div>
                <strong style="font-size: 13px; color: var(--text-primary);">Enable Free Demo Trial</strong>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                  Allows prospective subscribers to try AI questions before charging airtime.
                </div>
              </div>
            </label>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
            <div class="form-group">
              <label class="form-label">Demo Max Messages</label>
              <input type="number" id="setting-demo-msg" class="form-input" value="${settings.demoMaxMessages || 10}" min="1" max="100" />
            </div>

            <div class="form-group">
              <label class="form-label">Demo Max Tokens</label>
              <input type="number" id="setting-demo-tokens" class="form-input" value="${settings.demoMaxTokens || 5000}" min="100" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Trial Duration (Hours)</label>
              <input type="number" id="setting-demo-hours" class="form-input" value="${settings.demoDurationHours || 48}" min="1" max="168" />
            </div>

            <div class="form-group">
              <label class="form-label">Grace Period (Days)</label>
              <input type="number" id="setting-grace-days" class="form-input" value="${settings.gracePeriodDays || 3}" min="0" max="30" />
            </div>
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
              seamlessLoginEnabled: overlay.querySelector('#setting-seamless-login').checked,
              demoEnabled: overlay.querySelector('#setting-demo-enabled').checked,
              demoMaxMessages: parseInt(overlay.querySelector('#setting-demo-msg').value, 10),
              demoMaxTokens: parseInt(overlay.querySelector('#setting-demo-tokens').value, 10),
              demoDurationHours: parseInt(overlay.querySelector('#setting-demo-hours').value, 10),
              gracePeriodDays: parseInt(overlay.querySelector('#setting-grace-days').value, 10),
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
      title: `Assigned AI Categories — ${operator.name}`,
      maxWidth: '680px',
      contentHtml: `
        <div style="margin-bottom: 14px; font-size: 13px; color: var(--text-secondary);">
          Enable, reorder, and configure AI categories offered on the <strong>${operator.name}</strong> subscriber portal.
        </div>
        <div id="operator-agents-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; padding-right: 4px;">
          <div style="text-align: center; color: var(--text-muted); padding: 24px;">Loading catalog and assignments...</div>
        </div>
        <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
          <button type="button" id="save-operator-agents-btn" class="btn btn-primary">Save All Assignments</button>
        </div>
      `,
      onRender: async (overlay, close) => {
        const listEl = overlay.querySelector('#operator-agents-list');
        const saveBtn = overlay.querySelector('#save-operator-agents-btn');

        try {
          const [catalogRes, assignedRes] = await Promise.all([
            ApiService.get('/api/v1/admin/ai/catalog'),
            ApiService.get(`/api/v1/admin/operators/${operatorId}/agents`).catch(() => ({ data: [] })),
          ]);

          const catalog = catalogRes?.data || [];
          const assignedList = assignedRes?.data || [];
          const assignedMap = new Map();
          assignedList.forEach((a, idx) => {
            const key = a.agentId || a.id;
            assignedMap.set(key, {
              displayOrder: a.displayOrder ?? (idx + 1),
              customName: a.customName || a.name || '',
              minPlan: a.minPlan || '',
              isLockedUi: Boolean(a.isLockedUi),
            });
          });

          if (catalog.length === 0) {
            listEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 24px;">No categories found in global catalog. Create categories in AI Categories first.</div>';
            saveBtn.disabled = true;
            return;
          }

          listEl.innerHTML = catalog.map((cat, idx) => {
            const isAssigned = assignedMap.has(cat.id);
            const data = assignedMap.get(cat.id) || {
              displayOrder: idx + 1,
              customName: '',
              minPlan: '',
              isLockedUi: false,
            };

            return `
              <div class="card agent-item-row" data-id="${cat.id}" style="padding: 12px 14px; background: var(--bg-inset); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="checkbox" class="agent-enable-check" ${isAssigned ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--brand-primary); cursor: pointer;" />
                    <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(99,102,241,0.15); color: var(--brand-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                      ${(cat.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style="font-size: 13.5px; font-weight: 600; color: var(--text-primary);">${cat.name}</div>
                      <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${cat.slug}</div>
                    </div>
                  </div>
                  <span class="badge ${isAssigned ? 'badge-success' : 'badge-neutral'} agent-status-badge">
                    ${isAssigned ? 'Assigned' : 'Disabled'}
                  </span>
                </div>

                <div class="agent-extra-fields" style="display: ${isAssigned ? 'grid' : 'none'}; grid-template-columns: 80px 1fr 1fr auto; gap: 8px; align-items: center; margin-top: 4px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
                  <div>
                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Order</label>
                    <input type="number" class="form-input agent-order-input" style="padding: 4px 6px; font-size: 12px; height: 30px;" min="1" value="${data.displayOrder}" />
                  </div>
                  <div>
                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Custom Name</label>
                    <input type="text" class="form-input agent-custom-name-input" style="padding: 4px 6px; font-size: 12px; height: 30px;" placeholder="${cat.name}" value="${data.customName}" />
                  </div>
                  <div>
                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Min Plan</label>
                    <input type="text" class="form-input agent-min-plan-input" style="padding: 4px 6px; font-size: 12px; height: 30px;" placeholder="e.g. weekly-pack" value="${data.minPlan}" />
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Lock UI</label>
                    <input type="checkbox" class="agent-lock-ui-check" ${data.isLockedUi ? 'checked' : ''} style="margin-top: 6px; width: 16px; height: 16px; accent-color: var(--brand-primary); cursor: pointer;" title="Show lock badge if subscriber plan is insufficient" />
                  </div>
                </div>
              </div>
            `;
          }).join('');

          listEl.querySelectorAll('.agent-item-row').forEach(row => {
            const check = row.querySelector('.agent-enable-check');
            const fields = row.querySelector('.agent-extra-fields');
            const badge = row.querySelector('.agent-status-badge');

            check.onchange = () => {
              fields.style.display = check.checked ? 'grid' : 'none';
              badge.innerText = check.checked ? 'Assigned' : 'Disabled';
              badge.className = `badge ${check.checked ? 'badge-success' : 'badge-neutral'} agent-status-badge`;
            };
          });

          saveBtn.onclick = async () => {
            saveBtn.disabled = true;
            saveBtn.innerText = 'Saving Assignments...';

            const payloadAgents = [];
            listEl.querySelectorAll('.agent-item-row').forEach(row => {
              const check = row.querySelector('.agent-enable-check');
              if (check.checked) {
                const agentId = row.getAttribute('data-id');
                const displayOrder = parseInt(row.querySelector('.agent-order-input').value, 10) || 1;
                const customName = row.querySelector('.agent-custom-name-input').value.trim() || null;
                const minPlan = row.querySelector('.agent-min-plan-input').value.trim() || null;
                const isLockedUi = row.querySelector('.agent-lock-ui-check').checked;

                payloadAgents.push({
                  agentId,
                  displayOrder,
                  customName,
                  minPlan,
                  isLockedUi,
                  isActive: true,
                });
              }
            });

            try {
              await ApiService.post(`/api/v1/admin/operators/${operatorId}/agents`, { agents: payloadAgents });
              Toast.success('Operator category assignments updated successfully');
              close();
            } catch (err) {
              Toast.error(err.message || 'Failed to update category assignments');
              saveBtn.disabled = false;
              saveBtn.innerText = 'Save All Assignments';
            }
          };
        } catch (err) {
          listEl.innerHTML = `<div style="color: #fb7185; padding: 14px;">Failed to load categories: ${err.message}</div>`;
        }
      }
    });
  }
}
