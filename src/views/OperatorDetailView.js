import { mountLanguageStudio, escapeHtml } from './LanguageStudio.js';
import { PlansView } from './PlansView.js';
import { ApiService } from '../services/api.js';
import { AppState } from '../services/state.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons, getCategoryIcon, renderSmartIcon, CURATED_ICON_CATALOG } from '../components/icons.js';

export class OperatorDetailView {
  constructor(onNavigate, operatorId) {
    this.onNavigate = onNavigate;
    this.operatorId = operatorId || AppState.activeOperatorId || (AppState.operators[0]?.id);
    this.activeTab = 'tab-theme';
    this.selectedLanguage = '';
    this.languageDrafts = {};
    this.selectedScreen = 'msisdnScreen';
    this.operator = null;
    this.theme = {};
    this.settings = {};
    this.languages = [];
    this.agents = [];
    this.catalog = [];
    this.plans = [];
    this.analytics = {};
    this.flowConfig = null;
  }

  async render() {
    const container = document.createElement('div');
    container.className = 'view-container';
    container.style.paddingBottom = '60px';

    // Show initial loading skeleton
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
        <div style="width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
        <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">Loading Operator Management Studio...</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Fetching live branding tokens, SDUI screens, carrier quotas & telemetry</div>
      </div>
    `;

    // Fetch data asynchronously and mount
    this.loadDataAndRender(container);
    return container;
  }

  async loadDataAndRender(container) {
    if (!this.operatorId) {
      if (AppState.operators.length > 0) {
        this.operatorId = AppState.operators[0].id;
      } else {
        await AppState.loadOperators();
        this.operatorId = AppState.operators[0]?.id;
      }
    }

    if (!this.operatorId) {
      container.innerHTML = `
        <div class="card" style="padding: 40px; text-align: center;">
          <h3 style="color: #fb7185; margin-bottom: 8px;">No Operator Found</h3>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">Please select an operator from the carriers directory.</p>
          <button class="btn btn-primary" id="back-to-ops-btn">← Back to Operators</button>
        </div>
      `;
      container.querySelector('#back-to-ops-btn')?.addEventListener('click', () => this.onNavigate('operators'));
      return;
    }

    try {
      const [opRes, agentsRes, catalogRes, plansRes, analyticsRes, flowConfigRes, otpRes, checksubRes, dcbRes] = await Promise.all([
        ApiService.get(`/api/v1/admin/operators/${this.operatorId}`),
        ApiService.get(`/api/v1/admin/operators/${this.operatorId}/agents`).catch(() => ({ success: true, data: [] })),
        ApiService.get('/api/v1/admin/ai/catalog').catch(() => ({ success: true, data: [] })),
        ApiService.get(`/api/v1/admin/plans?operatorId=${this.operatorId}`).catch(() => ({ success: true, data: [] })),
        ApiService.get(`/api/v1/admin/operators/${this.operatorId}/analytics`).catch(() => ({ success: true, data: {} })),
        ApiService.get(`/api/v1/admin/operators/${this.operatorId}/flow-config`).catch(() => ({ success: true, data: null })),
        ApiService.get(`/api/v1/admin/providers/${this.operatorId}/otp/config`).catch(() => ({ success: true, data: null })),
        ApiService.get(`/api/v1/admin/providers/${this.operatorId}/checksub/config`).catch(() => ({ success: true, data: null })),
        ApiService.get(`/api/v1/admin/providers/${this.operatorId}/dcb/config`).catch(() => ({ success: true, data: null })),
      ]);

      if (!opRes.success || !opRes.data) {
        throw new Error(opRes.error?.message || 'Operator details not found');
      }

      this.operator = opRes.data;
      this.theme = this.operator.theme || {};
      this.settings = this.operator.settings || {};
      this.languages = (this.operator.languages || []).map(l => ({...l, languageCode:l.languageCode.trim()}));
      this.operator.defaultLanguage = this.operator.defaultLanguage?.trim();
      this.agents = agentsRes.data || [];
      this.catalog = catalogRes.data || [];
      this.plans = plansRes.data || [];
      this.analytics = analyticsRes.data || {};
      this.flowConfig = flowConfigRes.data || {
        authFlow: 'simple_otp',
        checksubEnabled: false,
        showPackSelection: false,
        otpIncludesPlanId: false,
        otpPlanIdFieldName: 'planId',
        autoSubscribeOnVerify: false,
      };
      this.otpConfig = otpRes?.data || null;
      this.checksubConfig = checksubRes?.data || null;
      this.dcbConfig = dcbRes?.data || null;

      // Sync active operator in global state
      if (AppState.activeOperatorId !== this.operator.id) {
        AppState.setActiveOperator(this.operator.id);
      }

      this.renderFullPage(container);
    } catch (err) {
      container.innerHTML = `
        <div class="card" style="padding: 40px; text-align: center; border-color: #fb7185;">
          <h3 style="color: #fb7185; margin-bottom: 8px;">Failed to Load Operator</h3>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">${err.message}</p>
          <button class="btn btn-secondary" id="back-to-ops-err-btn">← Back to Carriers Directory</button>
        </div>
      `;
      container.querySelector('#back-to-ops-err-btn')?.addEventListener('click', () => this.onNavigate('operators'));
    }
  }

  renderFullPage(container) {
    const op = this.operator;
    const theme = this.theme;
    const settings = this.settings;
    container.innerHTML = `
      <!-- TOP BREADCRUMB & HEADER -->
      <div class="flex-between mb-4" style="flex-wrap: wrap; gap: 12px; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap;">
          <button id="back-to-carriers-btn" class="btn btn-secondary btn-sm" style="gap: 6px; font-weight: 600; flex-shrink: 0;">
            ← Back to Carriers
          </button>
          <div style="color: var(--border-medium);">/</div>
          <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
            <span style="font-size: 13.5px; font-weight: 500; color: var(--text-secondary); white-space: nowrap;">Operator Studio</span>
            <div style="color: var(--border-medium);">/</div>
            <span style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); font-family: var(--font-display); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${op.name}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 4px 10px; border-radius: var(--radius-sm);">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">STATUS:</span>
            <select id="quick-status-select" class="form-select" style="padding: 2px 8px; font-size: 11px; height: 26px; border-radius: 4px; font-weight: 600;">
              <option value="active" ${op.status === 'active' ? 'selected' : ''}>Active (Live Portal)</option>
              <option value="maintenance" ${op.status === 'maintenance' ? 'selected' : ''}>Maintenance Mode</option>
              <option value="inactive" ${op.status === 'inactive' ? 'selected' : ''}>Inactive / Suspended</option>
            </select>
          </div>

          <a href="http://${op.subdomain}.localhost:3000/portal" target="_blank" class="btn btn-secondary btn-sm" style="gap: 6px;" title="Open live telecom subscriber portal in new tab">
            ${icons.globe} Live Portal ↗
          </a>
        </div>
      </div>

      <!-- HERO TENANT BANNER -->
      <div class="card mb-6" style="padding: 20px; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); position: relative; overflow: hidden; min-width: 0;">
        <div style="position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: ${theme.primaryColor || 'var(--accent)'}; opacity: 0.08; filter: blur(40px); pointer-events: none;"></div>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; position: relative; z-index: 1;">
          <div style="display: flex; align-items: center; gap: 16px; min-width: 0; flex: 1 1 300px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: ${theme.primaryColor || 'var(--accent)'}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 6px 20px ${theme.primaryColor ? theme.primaryColor + '50' : 'rgba(99,102,241,0.4)'}; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2);">
              ${op.name?.charAt(0) || 'O'}
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                <h1 style="font-size: 21px; font-weight: 700; margin: 0; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${op.name}</h1>
                <span class="badge ${op.status === 'active' ? 'badge-success' : 'badge-warning'}" style="font-size: 10px; padding: 2px 7px;">
                  ${(op.status || 'ACTIVE').toUpperCase()}
                </span>
                <span class="badge badge-cyan" style="font-size: 10px; padding: 2px 7px;">
                  ${op.countryCode || 'IN'}
                </span>
                <span class="badge" style="background: rgba(147,51,234,0.15); color: #c084fc; border: 1px solid rgba(147,51,234,0.3); font-weight: 700; font-size: 10px; padding: 2px 7px;">
                  ${(op.platformTier || 'ENTERPRISE').toUpperCase()}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap;">
                <div>Carrier: <code style="font-family: var(--font-mono); color: var(--text-primary); font-weight: 600;">${op.code}</code></div>
                <div style="color: var(--border-medium);">•</div>
                <div>Host: <span style="color: var(--brand-cyan); font-weight: 600;">${op.subdomain}.tickhigh.com</span></div>
                <div style="color: var(--border-medium);">•</div>
                <div>Ops: <span style="color: var(--text-primary);">${op.contactEmail || 'ops@carrier.com'}</span></div>
                <div style="color: var(--border-medium);">•</div>
                <div>TZ: <span style="color: var(--text-primary);">${op.timezone || 'UTC'}</span></div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-shrink: 0;">
            <button id="refresh-detail-btn" class="btn btn-secondary btn-sm" style="gap: 6px;">
              ${icons.refresh} Refresh Data
            </button>
          </div>
        </div>
      </div>

      <!-- BENTO KPI METRICS GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 20px;">
        <div class="card" style="padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Active Subscribers</span>
            <div style="color: var(--status-success); flex-shrink: 0;">${icons.users}</div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; line-height: 1.2;">
            ${(this.analytics.subscribers?.active || 0).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            Demo: <b style="color: var(--text-primary);">${this.analytics.subscribers?.demo || 0}</b> · Grace: <b style="color: var(--text-primary);">${this.analytics.subscribers?.grace || 0}</b>
          </div>
        </div>

        <div class="card" style="padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">30D AI Token Quota</span>
            <div style="color: #c084fc; flex-shrink: 0;">${icons.zap}</div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; line-height: 1.2;">
            ${(this.analytics.aiUsage?.totalTokens || 0).toLocaleString()}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            In: ${(this.analytics.aiUsage?.tokensIn || 0).toLocaleString()} · Out: ${(this.analytics.aiUsage?.tokensOut || 0).toLocaleString()}
          </div>
        </div>

        <div class="card" style="padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">AI Categories</span>
            <div style="color: var(--brand-cyan); flex-shrink: 0;">${icons.agents}</div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; line-height: 1.2;">
            ${this.agents.length} Assistants
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${this.agents.filter(a => a.isActive).length} Active · ${this.agents.filter(a => a.isLockedUi).length} Locked
          </div>
        </div>

        <div class="card" style="padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">DCB Billing</span>
            <div style="color: #38bdf8; flex-shrink: 0;">${icons.creditCard}</div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; line-height: 1.2;">
            ${this.plans.length} Pricing Tiers
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${this.plans.map(p => `${p.currencyCode} ${Number(p.price).toFixed(0)}`).join(', ') || 'No plans'}
          </div>
        </div>
      </div>

      <!-- FULLPAGE SECTION NAVIGATION TABS -->
      <div class="card mb-6" style="padding: 0; background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-md); overflow: hidden; min-width: 0;">
        <div style="display: flex; border-bottom: 1px solid var(--border-subtle); background: var(--bg-inset); overflow-x: auto; scrollbar-width: thin; -webkit-overflow-scrolling: touch; width: 100%; box-sizing: border-box; min-width: 0;">
          <button class="fullpage-tab-btn ${this.activeTab === 'tab-theme' ? 'active' : ''}" data-tab="tab-theme" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab === 'tab-theme' ? 'var(--text-primary)' : 'var(--text-secondary)'}; border-bottom: 2.5px solid ${this.activeTab === 'tab-theme' ? 'var(--accent)' : 'transparent'}; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${icons.palette} <span>SDUI Screens & Theme</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab === 'tab-policies' ? 'active' : ''}" data-tab="tab-policies" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab === 'tab-policies' ? 'var(--text-secondary)' : 'var(--text-secondary)'}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${icons.settings} <span>Carrier Policies</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab === 'tab-agents' ? 'active' : ''}" data-tab="tab-agents" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab === 'tab-agents' ? 'var(--text-secondary)' : 'var(--text-secondary)'}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${icons.agents} <span>AI Categories (${this.agents.length})</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab === 'tab-profile' ? 'active' : ''}" data-tab="tab-profile" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab === 'tab-profile' ? 'var(--text-secondary)' : 'var(--text-secondary)'}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${icons.edit} <span>Carrier Profile</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab === 'tab-plans' ? 'active' : ''}" data-tab="tab-plans" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab === 'tab-plans' ? 'var(--text-secondary)' : 'var(--text-secondary)'}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${icons.creditCard} <span>Plans & Pricing (${this.plans.length})</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab === 'tab-languages' ? 'active' : ''}" data-tab="tab-languages" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab === 'tab-languages' ? 'var(--text-secondary)' : 'var(--text-secondary)'}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${icons.globe} <span>Languages (${this.languages.length})</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab === 'tab-flow' ? 'active' : ''}" data-tab="tab-flow" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab === 'tab-flow' ? 'var(--accent)' : 'var(--text-secondary)'}; border-bottom: 2.5px solid ${this.activeTab === 'tab-flow' ? 'var(--accent)' : 'transparent'}; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${icons.zap || '⚡'} <span>Auth Flow Config</span>
          </button>
        </div>

        <div style="padding: 24px;">
          <!-- TAB 1: SDUI BRANDING & FLOW SCREENS -->
          <div id="fullpage-tab-theme" class="tab-panel" style="display: ${this.activeTab === 'tab-theme' ? 'block' : 'none'};">
            <div id="language-studio"></div>
            <details style="margin-top:28px"><summary>Shared operator branding (all languages)</summary><form id="shared-branding" style="margin-top:16px">
              ${['primaryColor','secondaryColor','backgroundColor','textColor','cardBgColor','borderRadius','logoUrl','heroImageUrl'].map(key => `<label class="form-label studio-field">${key}<input class="form-input" name="${key}" value="${escapeHtml(theme[key] || '')}" ${key.endsWith('Color') ? 'pattern="#[0-9a-fA-F]{6}" required' : ''}></label>`).join('')}
              <button class="btn btn-primary" style="margin-top:16px">Save shared branding</button>
            </form></details>
          </div>

          <div id="fullpage-tab-policies" class="tab-panel" style="display: ${this.activeTab === 'tab-policies' ? 'block' : 'none'};">
            <form id="carrier-policies-form">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Carrier Network Policies & Subscriber Quotas</h3>
                  <p style="font-size: 12.5px; color: var(--text-secondary);">Configure cellular header enrichment, trial quotas, grace periods, and brand safety filters.</p>
                </div>
                <button type="submit" id="save-policies-btn" class="btn btn-primary" style="gap: 8px; font-weight: 600;">
                  ${icons.check} Save Carrier Policies
                </button>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
                <!-- 1. Seamless Login -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary);">Seamless MSISDN Login</div>
                    <input type="checkbox" id="policy-seamless-check" ${settings.seamlessLoginEnabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent);" />
                  </div>
                  <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px;">
                    Carrier Network Header Enrichment (HE) auto-detects phone numbers on mobile data, enabling instant access without SMS OTP.
                  </p>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Checksub Cache TTL (Minutes)</label>
                    <input type="number" id="policy-cache-ttl" class="form-input" value="${settings.checksubCacheTtlMinutes || 30}" min="1" max="1440" />
                  </div>
                </div>

                <!-- 2. Free Demo Trial -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary);">Free Demo Trial Policy</div>
                    <input type="checkbox" id="policy-demo-check" ${settings.demoEnabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent);" />
                  </div>
                  <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px;">
                    Allows unsubscribed visitors to test AI assistants within strict message and token limits.
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Hrs</label>
                      <input type="number" id="policy-demo-hours" class="form-input" value="${settings.demoDurationHours || 48}" min="1" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Msgs</label>
                      <input type="number" id="policy-demo-msgs" class="form-input" value="${settings.demoMaxMessages || 10}" min="1" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Tokens</label>
                      <input type="number" id="policy-demo-tokens" class="form-input" value="${settings.demoMaxTokens || 5000}" min="100" />
                    </div>
                  </div>
                </div>

                <!-- 3. Grace Period -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Billing Grace Period</div>
                  <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px;">
                    Recovery window for prepaid subscribers with insufficient balance before blocking access.
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Grace Days</label>
                      <input type="number" id="policy-grace-days" class="form-input" value="${settings.gracePeriodDays || 3}" min="0" max="30" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Access Level</label>
                      <select id="policy-grace-access" class="form-select">
                        <option value="limited" ${settings.graceAccessLevel === 'limited' ? 'selected' : ''}>Limited</option>
                        <option value="full" ${settings.graceAccessLevel === 'full' ? 'selected' : ''}>Full</option>
                        <option value="blocked" ${settings.graceAccessLevel === 'blocked' ? 'selected' : ''}>Blocked</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- 4. Security & Guardrails -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Security & Safety Controls</div>
                  <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px;">
                    Automated rate limiting and telecom carrier brand safety filters.
                  </p>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                      <input type="checkbox" id="policy-fraud-check" ${settings.fraudBlockEnabled ? 'checked' : ''} style="accent-color: var(--accent);" />
                      <span>SIM Farm & Fraud Shield</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                      <input type="checkbox" id="policy-content-check" ${settings.contentModEnabled ? 'checked' : ''} style="accent-color: var(--accent);" />
                      <span>Brand Safety & Moderation</span>
                    </label>
                    <div class="form-group" style="margin-top: 4px; margin-bottom: 0;">
                      <label class="form-label">Max Concurrent Sessions</label>
                      <input type="number" id="policy-max-sessions" class="form-input" value="${settings.maxSessionsPerUser || 3}" min="1" max="10" />
                    </div>
                  </div>
                </div>

                <!-- 5. Legal URLs -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); grid-column: 1 / -1; min-width: 0;">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Legal & Compliance URLs</div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Terms URL</label>
                      <input type="url" id="policy-terms-url" class="form-input" value="${settings.termsUrl || ''}" placeholder="https://carrier.com/terms" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Privacy URL</label>
                      <input type="url" id="policy-privacy-url" class="form-input" value="${settings.privacyUrl || ''}" placeholder="https://carrier.com/privacy" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Support Email</label>
                      <input type="email" id="policy-support-email" class="form-input" value="${settings.supportEmail || op.contactEmail || ''}" placeholder="support@carrier.com" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- TAB 3: ASSIGNED AI CATEGORIES CATALOG -->
          <div id="fullpage-tab-agents" class="tab-panel" style="display: ${this.activeTab === 'tab-agents' ? 'block' : 'none'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">AI Category Catalog Assignments</h3>
                <p style="font-size: 12.5px; color: var(--text-secondary);">Enable or disable categories for this carrier, assign custom display titles, and lock premium tiers.</p>
              </div>
              <button type="button" id="save-agents-catalog-btn" class="btn btn-primary" style="gap: 8px; font-weight: 600;">
                ${icons.check} Save Category Assignments
              </button>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 50px;">Enable</th>
                    <th style="min-width: 220px;">Category &amp; Visual Icon</th>
                    <th>Custom Carrier Title</th><th>Language names</th>
                    <th style="width: 100px;">Order</th>
                    <th>Min Subscription Plan</th>
                    <th>UI Lock</th>
                  </tr>
                </thead>
                <tbody id="operator-agents-table-body">
                  ${this.catalog.map(cat => {
                    const assigned = this.agents.find(a => a.agentId === cat.id || a.slug === cat.slug);
                    const isChecked = Boolean(assigned);
                    const customName = assigned?.customName ?? (assigned?.name !== cat.name ? assigned?.name || '' : '');
                    const order = assigned?.displayOrder || 1;
                    const minPlan = assigned?.minPlan || '';
                    const isLocked = Boolean(assigned?.isLockedUi);
                    const catMeta = cat.translations?._meta || {};
                    const catColor = catMeta.color || '#6366F1';
                    const catIconKey = catMeta.icon || cat.slug || 'bot';

                    return `
                      <tr class="catalog-agent-row" data-id="${cat.id}">
                        <td>
                          <input type="checkbox" class="cat-enable-check" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer;" />
                        </td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <button type="button" class="btn-change-cat-icon cat-icon-btn" data-id="${cat.id}" title="Click to change visual icon & theme color" style="position: relative; width: 36px; height: 36px; border-radius: var(--radius-sm); background: ${catColor}1A; border: 1.5px solid ${catColor}44; display: flex; align-items: center; justify-content: center; color: ${catColor}; flex-shrink: 0; cursor: pointer; padding: 0; transition: all 0.15s ease;">
                              <span class="cat-icon-render">
                                ${renderSmartIcon({ icon: catIconKey, color: catColor, size: 18 })}
                              </span>
                              <span class="icon-edit-badge" style="position: absolute; bottom: -3px; right: -3px; width: 13px; height: 13px; border-radius: 50%; background: var(--bg-surface); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-size: 7.5px; color: var(--text-secondary); box-shadow: 0 1px 2px rgba(0,0,0,0.3);">✏️</span>
                            </button>
                            <div>
                              <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${cat.name}</span>
                                <button type="button" class="btn-change-cat-icon" data-id="${cat.id}" title="Change visual icon or color" style="background: transparent; border: none; padding: 0; font-size: 10.5px; color: var(--accent); cursor: pointer; display: inline-flex; align-items: center; gap: 2px; text-decoration: underline;">
                                  Edit Icon
                                </button>
                              </div>
                              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${cat.slug}</span>
                                <span class="badge badge-neutral cat-icon-name-badge" style="font-size: 9.5px; padding: 1px 5px; font-family: var(--font-mono);">${catIconKey}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <input type="text" class="form-input cat-custom-name" value="${customName}" placeholder="${cat.name}" style="padding: 6px 10px; font-size: 12px;" />
                        </td>
                        <td>${this.languages.map(l => `<div style="font-size:11px;margin-bottom:5px"><b>${escapeHtml(l.languageCode.toUpperCase())}</b>: ${escapeHtml(l.strings?.[`category.${cat.id}.name`] ?? cat.translations?.[l.languageCode] ?? 'Not configured')}</div>`).join('')}<button type="button" class="btn btn-secondary localize-category">Edit language names</button></td>
                        <td>
                          <input type="number" class="form-input cat-order" value="${order}" min="1" max="99" style="padding: 6px 10px; font-size: 12px;" />
                        </td>
                        <td>
                          <select class="form-select cat-min-plan" style="padding: 6px 10px; font-size: 12px;">
                            <option value="" ${!minPlan ? 'selected' : ''}>Free (All Subscribers)</option>
                            <option value="daily-pack" ${minPlan === 'daily-pack' ? 'selected' : ''}>Daily Pack+</option>
                            <option value="weekly-pack" ${minPlan === 'weekly-pack' ? 'selected' : ''}>Weekly Pack+</option>
                            <option value="monthly-pack" ${minPlan === 'monthly-pack' ? 'selected' : ''}>Monthly Pro Only</option>
                          </select>
                        </td>
                        <td>
                          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;">
                            <input type="checkbox" class="cat-lock-check" ${isLocked ? 'checked' : ''} style="accent-color: var(--status-warning);" />
                            <span>${isLocked ? '🔒 Locked' : 'Unlocked'}</span>
                          </label>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 4: CARRIER PROFILE & SUBDOMAIN -->
          <div id="fullpage-tab-profile" class="tab-panel" style="display: ${this.activeTab === 'tab-profile' ? 'block' : 'none'};">
            <form id="carrier-profile-form">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Carrier Profile & Subdomain Routing</h3>
                  <p style="font-size: 12.5px; color: var(--text-secondary);">Manage official commercial tenant profile, hosting subdomain, and operational contact details.</p>
                </div>
                <button type="submit" id="save-profile-btn" class="btn btn-primary" style="gap: 8px; font-weight: 600;">
                  ${icons.check} Save Carrier Profile
                </button>
              </div>

              <div class="card" style="padding: 20px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">Operator Commercial Name *</label>
                    <input type="text" id="prof-name" class="form-input" value="${op.name || ''}" required minlength="2" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Operator Status *</label>
                    <select id="prof-status" class="form-select">
                      <option value="active" ${op.status === 'active' ? 'selected' : ''}>Active (Live Portal & Charging)</option>
                      <option value="maintenance" ${op.status === 'maintenance' ? 'selected' : ''}>Maintenance Mode</option>
                      <option value="inactive" ${op.status === 'inactive' ? 'selected' : ''}>Inactive / Suspended</option>
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">Operator Slug Code (Immutable)</label>
                    <input type="text" class="form-input" value="${op.code || ''}" readonly style="background: rgba(255,255,255,0.03); color: var(--text-muted); cursor: not-allowed;" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Subdomain (Portal Host Identifier)</label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="text" class="form-input" value="${op.subdomain || ''}" readonly style="background: rgba(255,255,255,0.03); color: var(--brand-cyan); font-weight: 600; cursor: not-allowed;" />
                      <span style="color: var(--text-muted); font-size: 12px; white-space: nowrap;">.tickhigh.com</span>
                    </div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">Country Code (ISO 2-char) *</label>
                    <input type="text" id="prof-country" class="form-input" value="${op.countryCode || 'IN'}" maxlength="2" required style="text-transform: uppercase;" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Country Phone Code (e.g. +91)</label>
                    <input type="text" id="prof-phone-code" class="form-input" value="${op.countryPhoneCode || op.phoneCode || '+91'}" maxlength="10" placeholder="+91" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Platform Licensing Tier</label>
                    <select id="prof-tier" class="form-select">
                      <option value="starter" ${op.platformTier === 'starter' ? 'selected' : ''}>Starter</option>
                      <option value="growth" ${op.platformTier === 'growth' ? 'selected' : ''}>Growth Tier</option>
                      <option value="enterprise" ${op.platformTier === 'enterprise' ? 'selected' : ''}>Enterprise Telco</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Timezone</label>
                    <input type="text" id="prof-timezone" class="form-input" value="${op.timezone || 'Asia/Kolkata'}" />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
                  <div class="form-group">
                    <label class="form-label">Operations Contact Email *</label>
                    <input type="email" id="prof-email" class="form-input" value="${op.contactEmail || ''}" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Contact Person Name</label>
                    <input type="text" id="prof-contact-name" class="form-input" value="${op.contactName || ''}" placeholder="e.g. Telecom VAS Operations" />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- TAB 5: DCB PRICING PACKS -->
          <div id="fullpage-tab-plans" class="tab-panel" style="display: ${this.activeTab === 'tab-plans' ? 'block' : 'none'};"></div>

          <!-- TAB 6: REGIONAL LANGUAGES -->
          <div id="fullpage-tab-languages" class="tab-panel" style="display: ${this.activeTab === 'tab-languages' ? 'block' : 'none'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Regional Language Dictionaries</h3>
                <p style="font-size: 12.5px; color: var(--text-secondary);">Add, edit and manage multi-lingual localized copy dictionaries and typography for subscriber portal.</p>
              </div>
              <button id="add-regional-lang-btn" class="btn btn-primary" style="font-size: 13px; height: 38px; display: flex; align-items: center; gap: 8px; font-weight: 600;">
                ${icons.plus} Add Regional Language
              </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              ${this.languages.length === 0 ? `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-inset); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
                  No regional languages configured yet. Click "Add Regional Language" above.
                </div>
              ` : this.languages.map(l => `
                <div class="card" style="padding: 18px; background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); min-width: 0; display: flex; flex-direction: column;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="badge badge-cyan" style="font-size: 11px; text-transform: uppercase; font-weight: 700;">${l.languageCode}</span>
                      <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${l.direction?.toUpperCase() || 'LTR'}</span>
                      <span style="font-size: 11px; color: var(--text-muted);">${l.direction === 'rtl' ? 'Right-to-Left' : 'Left-to-Right'}</span>
                    </div>
                    ${l.isDefault ? `<span class="badge badge-success" style="font-size: 10px;">DEFAULT</span>` : ''}
                  </div>

                  <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
                    Font Family: <b style="color: var(--text-primary);">${l.fontFamily || 'Inter'}</b>
                  </div>

                  <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; font-size: 12px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; flex: 1;">
                    <div><b>Title:</b> <span style="color: var(--text-primary);">${l.strings?.title || '—'}</span></div>
                    <div><b>Subtitle:</b> <span style="color: var(--text-primary);">${l.strings?.subtitle || '—'}</span></div>
                    <div><b>CTA Button:</b> <span style="color: var(--text-primary);">${l.strings?.ctaSubscribe || '—'}</span></div>
                    <div><b>Phone Prompt:</b> <span style="color: var(--text-primary);">${l.strings?.enterPhonePrompt || '—'}</span></div>
                    <div><b>OTP Prompt:</b> <span style="color: var(--text-primary);">${l.strings?.verifyOtpPrompt || '—'}</span></div>
                  </div>

                  <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; gap: 8px;">
                    <button class="btn btn-secondary edit-language-dict-btn" data-code="${l.languageCode}" style="flex: 1; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                      ${icons.edit} Edit Dictionary & Copy
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

          <!-- TAB 7: AUTH FLOW CONFIGURATION -->
          <div id="fullpage-tab-flow" class="tab-panel" style="display: ${this.activeTab === 'tab-flow' ? 'block' : 'none'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Subscriber Auth &amp; Subscription Flow</h3>
                <p style="font-size: 12.5px; color: var(--text-secondary); max-width: 560px;">Configure the exact journey a subscriber takes — from entering their number to becoming active. Different operators have different API handshakes with their platform.</p>
              </div>
            </div>

            <!-- Flow Type Selector Cards -->
            <div style="margin-bottom: 24px;">
              <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); display: block; margin-bottom: 12px;">Select Subscriber Journey Strategy</label>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;" id="flow-type-cards">

                <div class="flow-type-card" data-flow="simple_otp" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${(!this.flowConfig?.flowStrategy || this.flowConfig?.flowStrategy === 'simple_otp') ? 'var(--accent)' : 'var(--border-subtle)'}; background: ${(!this.flowConfig?.flowStrategy || this.flowConfig?.flowStrategy === 'simple_otp') ? 'rgba(99,102,241,0.08)' : 'var(--bg-inset)'}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">📱</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Standard Simple OTP</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">Number → OTP → Verify</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Standard telco SMS OTP without upfront packs or checksub.</div>
                </div>

                <div class="flow-type-card" data-flow="checksub_first_sync" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${this.flowConfig?.flowStrategy === 'checksub_first_sync' || this.flowConfig?.authFlow === 'checksub_then_otp' ? 'var(--accent)' : 'var(--border-subtle)'}; background: ${this.flowConfig?.flowStrategy === 'checksub_first_sync' || this.flowConfig?.authFlow === 'checksub_then_otp' ? 'rgba(99,102,241,0.08)' : 'var(--bg-inset)'}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">⚡</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">CheckSub + Engine Sync</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">CheckSub → [OTP if inactive] → Sync Engine</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Orange BF pattern: Active bypasses OTP. Post-verify calls Subs_Engine sync.</div>
                </div>

                <div class="flow-type-card" data-flow="pack_first_dcb_pin" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${this.flowConfig?.flowStrategy === 'pack_first_dcb_pin' || this.flowConfig?.authFlow === 'pack_first_otp' ? 'var(--accent)' : 'var(--border-subtle)'}; background: ${this.flowConfig?.flowStrategy === 'pack_first_dcb_pin' || this.flowConfig?.authFlow === 'pack_first_otp' ? 'rgba(99,102,241,0.08)' : 'var(--bg-inset)'}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">📦</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Pack Selection + DCB PIN</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">Select Pack → Request PIN → Confirm → Polling</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Universe DCB pattern: Injects purchaseTypeId, saves request ID & polls status.</div>
                </div>

                <div class="flow-type-card" data-flow="query_param_token" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${this.flowConfig?.flowStrategy === 'query_param_token' ? 'var(--accent)' : 'var(--border-subtle)'}; background: ${this.flowConfig?.flowStrategy === 'query_param_token' ? 'rgba(99,102,241,0.08)' : 'var(--bg-inset)'}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">🔗</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Macro URL Query Param</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">GET Query Substitution (#MSISDN#, #ANDROIDID#)</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Etisalat UAE pattern: URL template query strings with transaction tracking.</div>
                </div>

                <div class="flow-type-card" data-flow="header_enrichment" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${this.flowConfig?.flowStrategy === 'header_enrichment' ? 'var(--accent)' : 'var(--border-subtle)'}; background: ${this.flowConfig?.flowStrategy === 'header_enrichment' ? 'rgba(99,102,241,0.08)' : 'var(--bg-inset)'}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">📶</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Zero-Click Cellular (HE)</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">Network Header Enrichment → Direct Login / Packs</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Carrier 3G/4G/5G header detects MSISDN automatically. Zero OTP typing required.</div>
                </div>

              </div>
            </div>

            <!-- Conditional Options Form -->
            <form id="flow-config-form">
              <input type="hidden" id="flow-auth-flow" name="authFlow" value="${this.flowConfig?.flowStrategy || this.flowConfig?.authFlow || 'simple_otp'}">

              <!-- Carrier Global Identifiers Box -->
              <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <h4 style="font-size: 13px; font-weight: 700; color: #a5b4fc; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">🌐 Carrier Global Identifiers (From Spec / MD)</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
                  <div>
                    <label class="form-label" style="font-size: 11px;">Carrier Service ID (serviceId)</label>
                    <input type="text" id="flow-global-service-id" name="globalServiceId" class="form-input" value="${this.flowConfig?.globalServiceId || ''}" placeholder="e.g. 581 or Health Portal Livliness" style="font-family: var(--font-mono); font-size: 12px;">
                  </div>
                  <div>
                    <label class="form-label" style="font-size: 11px;">Merchant / Content Provider ID (merchantId / cpId)</label>
                    <input type="text" id="flow-global-merchant-id" name="globalMerchantId" class="form-input" value="${this.flowConfig?.globalMerchantId || ''}" placeholder="e.g. 169 or 100" style="font-family: var(--font-mono); font-size: 12px;">
                  </div>
                  <div>
                    <label class="form-label" style="font-size: 11px;">Carrier Operator Code (operator)</label>
                    <input type="text" id="flow-global-operator-code" name="globalOperatorCode" class="form-input" value="${this.flowConfig?.globalOperatorCode || ''}" placeholder="e.g. WM, ORG, ETISALAT" style="font-family: var(--font-mono); font-size: 12px;">
                  </div>
                </div>
              </div>

              <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">⚙️ Flow Step Options</h4>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">

                  <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="flow-checksub" name="checksubEnabled" ${this.flowConfig?.checksubEnabled ? 'checked' : ''} style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0;">
                    <div>
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Enable Checksub API Call</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">Call the carrier's checksub endpoint before OTP. If user is active, log them in directly (seamless login).</div>
                    </div>
                  </label>

                  <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="flow-show-packs" name="showPackSelection" ${this.flowConfig?.showPackSelection ? 'checked' : ''} style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0;">
                    <div>
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Show Plan / Pack Selection</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">Display available subscription packs/plans to the user before sending OTP.</div>
                    </div>
                  </label>

                  <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="flow-otp-plan-id" name="otpIncludesPlanId" ${this.flowConfig?.otpIncludesPlanId ? 'checked' : ''} style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0;">
                    <div>
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Inject Plan ID into OTP Request</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">Pass the selected pack/plan ID as a field in the OTP send API request body.</div>
                    </div>
                  </label>

                  <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="flow-auto-sub" name="autoSubscribeOnVerify" ${this.flowConfig?.autoSubscribeOnVerify ? 'checked' : ''} style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0;">
                    <div>
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Auto-Subscribe / Engine Sync on Verify</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">Trigger DCB charge or Subs_Engine /sync automatically after successful OTP verification.</div>
                    </div>
                  </label>

                </div>

                <div style="margin-top: 16px; display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 200px;">
                    <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 6px;">OTP Plan ID Field Name</label>
                    <input type="text" id="flow-plan-field" name="otpPlanIdFieldName" class="form-input" value="${this.flowConfig?.otpPlanIdFieldName || 'planId'}" placeholder="e.g. serviceId, packCode, purchaseTypeId" style="font-family: var(--font-mono); font-size: 12px;">
                    <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 4px;">The JSON field key injected into the OTP send request template (e.g. &quot;purchaseTypeId&quot;: 3)</div>
                  </div>
                </div>
              <!-- Live Gateway API Endpoints (Direct Integration) -->
              <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <h4 style="font-size: 13.5px; font-weight: 700; color: #38bdf8; margin: 0 0 3px 0; display: flex; align-items: center; gap: 8px;">
                      📡 Carrier Gateway Endpoints (Direct Integration)
                    </h4>
                    <p style="font-size: 11.5px; color: var(--text-secondary); margin: 0;">These endpoints adapt dynamically to your selected Strategy Flow above.</p>
                  </div>
                  <span class="badge badge-cyan" style="font-size: 10.5px;">LIVE TELCO APIS</span>
                </div>

                <!-- Active Strategy Context Guidance Banner -->
                <div id="flow-strategy-active-banner" style="margin-bottom: 16px; padding: 10px 14px; background: rgba(56,189,248,0.06); border-left: 3px solid #38bdf8; border-radius: var(--radius-xs); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;"></div>

                <!-- Available Dynamic Macros Quick Bar -->
                <div style="background: rgba(99,102,241,0.06); border: 1px dashed rgba(99,102,241,0.3); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 16px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                  <div style="color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px;">💡</span>
                    <span><strong style="color: var(--text-primary);">Dynamic Macro Variables:</strong> URLs ya Templates me ye placeholders daalein — platform inhein subscriber &amp; pack values se runtime par replace karega:</span>
                  </div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{msisdn}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{otp}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{requestId}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{planCode}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{serviceId}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #a855f7; font-family: var(--font-mono); font-size: 11px;">#MSISDN#</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #a855f7; font-family: var(--font-mono); font-size: 11px;">#OTP#</span>
                  </div>
                </div>

                <!-- Shared Credentials Header -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
                  <div>
                    <label class="form-label" style="font-size: 11px;">Carrier Gateway Secret / API Token</label>
                    <input type="password" id="flow-gw-secret" class="form-input" placeholder="Bearer token or carrier secret key" value="carrier_secret_sample_key" style="font-size: 12px;">
                  </div>
                  <div>
                    <label class="form-label" style="font-size: 11px;">Authentication Scheme</label>
                    <select id="flow-gw-auth-type" class="form-select" style="font-size: 12px;">
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="api_key">X-API-Key Header</option>
                      <option value="none">None / Query Param</option>
                    </select>
                  </div>
                </div>

                <!-- Endpoints Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;" id="flow-gw-endpoints-grid">

                  <!-- 1. Send OTP Endpoint -->
                  <div id="flow-gw-card-otp-send" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #818cf8;">📱 Send OTP API</span>
                      <select id="flow-gw-otp-send-method" class="form-select" style="width: auto; padding: 2px 6px; font-size: 11px; height: 24px;">
                        <option value="POST" ${this.otpConfig?.sendMethod === 'POST' ? 'selected' : ''}>POST</option>
                        <option value="GET" ${this.otpConfig?.sendMethod === 'GET' ? 'selected' : ''}>GET</option>
                      </select>
                    </div>
                    <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Endpoint URL</label>
                    <input type="url" id="flow-gw-otp-send-endpoint" class="form-input" placeholder="https://api.carrier.com/v1/otp/send" value="${this.otpConfig?.sendEndpoint || ''}" style="font-family: var(--font-mono); font-size: 11.5px; margin-bottom: 8px;">
                    <label class="form-label" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px;">Send Request Template (JSON / Query Body)</label>
                    <textarea id="flow-gw-otp-send-template" class="form-textarea" rows="3" style="font-family: var(--font-mono); font-size: 11px;" placeholder='{\n  "msisdn": "{{msisdn}}",\n  "purchaseTypeId": {{planCode}},\n  "serviceId": "{{serviceId}}"\n}'>${typeof this.otpConfig?.sendRequestTemplate === 'string' ? this.otpConfig.sendRequestTemplate : this.otpConfig?.sendRequestTemplate ? JSON.stringify(this.otpConfig.sendRequestTemplate, null, 2) : ''}</textarea>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Available: <code>{{msisdn}}</code>, <code>{{planCode}}</code>, <code>{{serviceId}}</code></div>
                  </div>

                  <!-- 2. Verify OTP API -->
                  <div id="flow-gw-card-otp-verify" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #818cf8;">🔑 Verify OTP API</span>
                      <select id="flow-gw-otp-verify-method" class="form-select" style="width: auto; padding: 2px 6px; font-size: 11px; height: 24px;">
                        <option value="POST" ${this.otpConfig?.verifyMethod === 'POST' ? 'selected' : ''}>POST</option>
                        <option value="GET" ${this.otpConfig?.verifyMethod === 'GET' ? 'selected' : ''}>GET</option>
                      </select>
                    </div>
                    <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Endpoint URL</label>
                    <input type="url" id="flow-gw-otp-verify-endpoint" class="form-input" placeholder="https://api.carrier.com/v1/otp/verify" value="${this.otpConfig?.verifyEndpoint || ''}" style="font-family: var(--font-mono); font-size: 11.5px; margin-bottom: 8px;">
                    <label class="form-label" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px;">Verify Request Template (JSON / Query Body)</label>
                    <textarea id="flow-gw-otp-verify-template" class="form-textarea" rows="3" style="font-family: var(--font-mono); font-size: 11px;" placeholder='{\n  "msisdn": "{{msisdn}}",\n  "otp": "{{otp}}",\n  "requestId": "{{requestId}}"\n}'>${typeof this.otpConfig?.verifyRequestTemplate === 'string' ? this.otpConfig.verifyRequestTemplate : this.otpConfig?.verifyRequestTemplate ? JSON.stringify(this.otpConfig.verifyRequestTemplate, null, 2) : ''}</textarea>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Available: <code>{{msisdn}}</code>, <code>{{otp}}</code>, <code>{{requestId}}</code>, <code>{{planCode}}</code></div>
                  </div>

                  <!-- 3. CheckSub Endpoint -->
                  <div id="flow-gw-card-checksub" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #fbbf24;">🔍 CheckSub API</span>
                      <select id="flow-gw-checksub-method" class="form-select" style="width: auto; padding: 2px 6px; font-size: 11px; height: 24px;">
                        <option value="GET" ${this.checksubConfig?.httpMethod === 'GET' ? 'selected' : ''}>GET</option>
                        <option value="POST" ${this.checksubConfig?.httpMethod === 'POST' ? 'selected' : ''}>POST</option>
                      </select>
                    </div>
                    <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Checksub URL</label>
                    <input type="url" id="flow-gw-checksub-endpoint" class="form-input" placeholder="https://api.carrier.com/checksub?msisdn={{msisdn}}" value="${this.checksubConfig?.endpoint || ''}" style="font-family: var(--font-mono); font-size: 11.5px; margin-bottom: 8px;">
                    <label class="form-label" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px;">Query / Body Template (Optional)</label>
                    <textarea id="flow-gw-checksub-template" class="form-textarea" rows="3" style="font-family: var(--font-mono); font-size: 11px;" placeholder='{\n  "msisdn": "{{msisdn}}",\n  "serviceId": "{{serviceId}}"\n}'>${typeof this.checksubConfig?.requestTemplate === 'string' ? this.checksubConfig.requestTemplate : this.checksubConfig?.requestTemplate ? JSON.stringify(this.checksubConfig.requestTemplate, null, 2) : ''}</textarea>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Supports query params or JSON body with <code>{{msisdn}}</code></div>
                  </div>

                  <!-- 4. DCB Charge & Subs_Engine Sync Endpoint -->
                  <div id="flow-gw-card-dcb" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #22d3ee;">💳 DCB &amp; Sync Engine</span>
                      <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">BILLING SYNC</span>
                    </div>

                    <div id="flow-gw-dcb-charge-group" style="margin-bottom: 8px;">
                      <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">DCB Charge / PIN URL</label>
                      <input type="url" id="flow-gw-dcb-charge-endpoint" class="form-input" placeholder="https://api.carrier.com/v1/dcb/charge?msisdn={{msisdn}}" value="${this.dcbConfig?.chargeEndpoint || this.dcbConfig?.endpoint || ''}" style="font-family: var(--font-mono); font-size: 11.5px;">
                    </div>
                    
                    <div id="flow-gw-dcb-sync-group">
                      <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Subs_Engine Sync URL (e.g. Orange BF)</label>
                      <input type="url" id="flow-gw-dcb-sync-endpoint" class="form-input" placeholder="http://domain.com:8080/Subs_Engine/subscription/sync?msisdn={{msisdn}}&amp;plan={{planCode}}" value="${this.dcbConfig?.syncEndpoint || ''}" style="font-family: var(--font-mono); font-size: 11.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Triggered after OTP verification to activate billing engine.</div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Live Flow Diagram -->
              <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;" id="flow-diagram-container">
                <h4 style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.06em;">Live Flow Preview</h4>
                <div id="flow-diagram" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; font-weight: 600;"></div>
              </div>

              <button type="submit" id="save-flow-config-btn" class="btn btn-primary" style="height: 40px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;">
                💾 Save Flow Configuration
              </button>
            </form>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container);
    mountLanguageStudio(this, container);
    const pricing = new PlansView(this.onNavigate, this.operatorId);
    pricing.onPlansLoaded = plans => { this.plans = plans; mountLanguageStudio(this, container); };
    pricing.render().then(el => {
      const languageButton = document.createElement('button');
      languageButton.className = 'btn btn-secondary';
      languageButton.style.marginBottom = '20px';
      languageButton.textContent = 'Edit plan page text & localized plan names';
      languageButton.onclick = () => {
        this.selectedScreen = 'plans';
        container.querySelector('[data-tab="tab-theme"]').click();
        mountLanguageStudio(this, container);
      };
      el.prepend(languageButton);
      container.querySelector('#fullpage-tab-plans').replaceChildren(el);
    });
    container.querySelector('#shared-branding').onsubmit = async e => {
      e.preventDefault();
      const button = e.currentTarget.querySelector('button');
      const payload = Object.fromEntries(new FormData(e.currentTarget));
      payload.fontFamily = this.theme.fontFamily || 'Inter';
      for (const key of ['logoUrl', 'heroImageUrl']) if (!payload[key]) payload[key] = null;
      button.disabled = true;
      try {
        await ApiService.put(`/api/v1/admin/operators/${this.operatorId}/theme`, payload);
        Object.assign(this.theme, payload);
        Toast.success('Shared branding saved');
      } catch (err) { Toast.error(err.message); } finally { button.disabled = false; }
    };
  }

  openCategoryIconModal(cat, rowElement) {
    const trans = cat.translations || {};
    const meta = trans._meta || {};
    let selectedIcon = meta.icon || cat.slug || 'bot';
    let selectedColor = meta.color || '#6366F1';

    const colorSwatches = [
      '#F97316', '#10B981', '#3B82F6', '#8B5CF6',
      '#EC4899', '#EAB308', '#EF4444', '#06B6D4',
      '#6366F1', '#14B8A6', '#F59E0B', '#64748B'
    ];

    Modal.open({
      title: `Update Visual Icon & Theme — ${cat.name}`,
      maxWidth: '620px',
      contentHtml: `
        <form id="cat-icon-quick-form">
          <!-- Live Preview Banner -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div id="modal-icon-badge" style="width: 44px; height: 44px; border-radius: var(--radius-md); background: ${selectedColor}1A; border: 1.5px solid ${selectedColor}44; display: flex; align-items: center; justify-content: center; color: ${selectedColor}; flex-shrink: 0; transition: all 0.2s ease;">
                ${renderSmartIcon({ icon: selectedIcon, color: selectedColor, size: 24 })}
              </div>
              <div>
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Live Card Preview</div>
                <div id="modal-preview-title" style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${cat.name}</div>
                <div style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">${cat.slug}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <span id="modal-preview-icon-name" class="badge badge-primary" style="font-family: var(--font-mono); font-size: 11px;">icon: ${selectedIcon}</span>
            </div>
          </div>

          <!-- Curated Icon Palette -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div>
                <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0;">Curated Icon Palette</h4>
                <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">Click an icon to assign. Compatible with subscriber portals.</p>
              </div>
              <span id="modal-selected-icon-label" class="badge badge-neutral" style="font-size: 11px; font-weight: 600;">Selected: ${selectedIcon}</span>
            </div>

            <!-- Category Filter Tabs -->
            <div id="modal-icon-cat-filter" style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px;">
              <button type="button" class="badge badge-primary modal-icon-filter-btn" data-cat="all" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">All (22)</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Lifestyle" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Lifestyle</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Wellness" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Wellness</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Education" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Education</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Finance" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Finance</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Travel" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Travel</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Creative" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Creative</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Work" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Tech / Work</button>
            </div>

            <!-- Icons Grid -->
            <div id="modal-icon-picker-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-bottom: 12px; max-height: 180px; overflow-y: auto; padding: 4px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--bg-surface);">
              ${CURATED_ICON_CATALOG.map(item => {
                const isSelected = item.id === selectedIcon;
                return `
                  <button type="button" class="modal-icon-choice-btn" data-icon="${item.id}" data-cat="${item.category}" data-default-color="${item.color}" data-label="${item.label}" title="${item.label}" style="background: ${isSelected ? item.color + '1A' : 'transparent'}; border: 1.5px solid ${isSelected ? item.color : 'var(--border-subtle)'}; border-radius: var(--radius-sm); padding: 6px 3px; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; color: ${isSelected ? item.color : 'var(--text-secondary)'}; font-size: 11px; transition: all 0.15s ease; box-shadow: ${isSelected ? `0 0 0 2px ${item.color}33` : 'none'};">
                    <span style="display: flex; align-items: center; justify-content: center; width: 22px; height: 22px;">
                      ${renderSmartIcon({ icon: item.id, color: isSelected ? item.color : 'currentColor', size: 18 })}
                    </span>
                    <span style="font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${item.label.split('&')[0].trim()}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Custom Image URL or Lucide Name -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; gap: 6px; align-items: center;">
                <input type="text" id="modal-custom-icon-input" class="form-input" placeholder="Or enter custom image URL (https://...) or Lucide icon name..." value="${selectedIcon.startsWith('http') || !CURATED_ICON_CATALOG.some(c => c.id === selectedIcon) ? selectedIcon : ''}" style="font-size: 11.5px; padding: 6px 10px;" />
                <button type="button" id="modal-apply-custom-icon-btn" class="btn btn-secondary" style="font-size: 11px; white-space: nowrap; padding: 6px 10px;">Apply</button>
              </div>
              <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">Supports custom external image/SVG URLs or Lucide icon names.</div>
            </div>

            <!-- Theme Accent Color -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-inset); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <label class="form-label" style="margin: 0; font-size: 11.5px;">Theme Accent Color:</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="color" id="modal-cat-color" value="${selectedColor}" style="width: 28px; height: 26px; border: none; border-radius: 4px; cursor: pointer; background: transparent;" />
                  <span id="modal-cat-color-hex" style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-primary); font-weight: 600;">${selectedColor}</span>
                </div>
              </div>
              <div style="display: flex; gap: 4px; align-items: center;">
                ${colorSwatches.map(sw => `
                  <button type="button" class="modal-color-swatch-btn" data-color="${sw}" style="width: 17px; height: 17px; border-radius: 50%; background: ${sw}; border: 1.5px solid ${sw === selectedColor ? '#fff' : 'transparent'}; cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></button>
                `).join('')}
              </div>
              <input type="hidden" id="modal-selected-icon-id" value="${selectedIcon}" />
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 12px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-cat-icon-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px;">
              ${icons.check} Save Icon &amp; Theme
            </button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#cat-icon-quick-form');
        const iconInput = overlay.querySelector('#modal-selected-icon-id');
        const customIconInput = overlay.querySelector('#modal-custom-icon-input');
        const applyCustomBtn = overlay.querySelector('#modal-apply-custom-icon-btn');
        const colorInput = overlay.querySelector('#modal-cat-color');
        const colorHex = overlay.querySelector('#modal-cat-color-hex');
        const iconLabel = overlay.querySelector('#modal-selected-icon-label');
        const liveIconBadge = overlay.querySelector('#modal-icon-badge');
        const liveIconName = overlay.querySelector('#modal-preview-icon-name');

        const updateAllPreviews = (iconVal, colorVal) => {
          selectedIcon = iconVal;
          selectedColor = colorVal;
          iconInput.value = iconVal;
          colorInput.value = colorVal;
          colorHex.textContent = colorVal;
          iconLabel.textContent = `Selected: ${iconVal}`;
          liveIconName.textContent = `icon: ${iconVal}`;

          liveIconBadge.style.background = `${colorVal}1A`;
          liveIconBadge.style.borderColor = `${colorVal}44`;
          liveIconBadge.style.color = colorVal;
          liveIconBadge.innerHTML = renderSmartIcon({ icon: iconVal, color: colorVal, size: 24 });

          overlay.querySelectorAll('.modal-icon-choice-btn').forEach(b => {
            const isMatch = b.getAttribute('data-icon') === iconVal;
            b.style.borderColor = isMatch ? colorVal : 'var(--border-subtle)';
            b.style.background = isMatch ? `${colorVal}1A` : 'transparent';
            b.style.color = isMatch ? colorVal : 'var(--text-secondary)';
            b.style.boxShadow = isMatch ? `0 0 0 2px ${colorVal}33` : 'none';
          });
        };

        overlay.querySelectorAll('.modal-icon-choice-btn').forEach(btn => {
          btn.onclick = () => {
            const iconId = btn.getAttribute('data-icon');
            const defaultColor = btn.getAttribute('data-default-color') || colorInput.value;
            customIconInput.value = '';
            updateAllPreviews(iconId, defaultColor);
          };
        });

        overlay.querySelectorAll('.modal-icon-filter-btn').forEach(btn => {
          btn.onclick = () => {
            const targetCat = btn.getAttribute('data-cat');
            overlay.querySelectorAll('.modal-icon-filter-btn').forEach(b => {
              b.className = b === btn ? 'badge badge-primary modal-icon-filter-btn' : 'badge badge-neutral modal-icon-filter-btn';
            });
            overlay.querySelectorAll('.modal-icon-choice-btn').forEach(choice => {
              if (targetCat === 'all' || choice.getAttribute('data-cat') === targetCat) {
                choice.style.display = 'flex';
              } else {
                choice.style.display = 'none';
              }
            });
          };
        });

        applyCustomBtn.onclick = () => {
          const val = customIconInput.value.trim();
          if (val) {
            updateAllPreviews(val, colorInput.value);
          }
        };

        customIconInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            applyCustomBtn.click();
          }
        });

        colorInput.oninput = () => {
          updateAllPreviews(iconInput.value, colorInput.value);
        };

        overlay.querySelectorAll('.modal-color-swatch-btn').forEach(sw => {
          sw.onclick = () => {
            const picked = sw.getAttribute('data-color');
            updateAllPreviews(iconInput.value, picked);
          };
        });

        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-cat-icon-btn');
          btn.disabled = true;
          btn.innerText = 'Saving...';

          const updatedTranslations = {
            ...(cat.translations || {}),
            _meta: {
              icon: selectedIcon,
              color: selectedColor,
            },
          };

          try {
            await ApiService.put(`/api/v1/admin/ai/catalog/${cat.id}`, {
              translations: updatedTranslations,
            });

            cat.translations = updatedTranslations;

            if (rowElement) {
              const iconBox = rowElement.querySelector('.cat-icon-btn');
              if (iconBox) {
                iconBox.style.background = `${selectedColor}1A`;
                iconBox.style.borderColor = `${selectedColor}44`;
                iconBox.style.color = selectedColor;
              }
              const iconRender = rowElement.querySelector('.cat-icon-render');
              if (iconRender) {
                iconRender.innerHTML = renderSmartIcon({ icon: selectedIcon, color: selectedColor, size: 18 });
              }
              const nameBadge = rowElement.querySelector('.cat-icon-name-badge');
              if (nameBadge) {
                nameBadge.textContent = selectedIcon;
              }
            }

            Toast.success(`Icon and color for "${cat.name}" updated successfully!`);
            close();
          } catch (err) {
            Toast.error(err.message || 'Failed to update category icon');
            btn.disabled = false;
            btn.innerHTML = `${icons.check} Save Icon &amp; Theme`;
          }
        };
      },
    });
  }

  bindEvents(container) {
    const op = this.operator;
    container.querySelectorAll('.localize-category').forEach(btn => btn.onclick = () => {
      this.selectedScreen = 'categories';
      container.querySelector('[data-tab="tab-theme"]').click();
      mountLanguageStudio(this, container);
    });

    // Icon change modal for AI categories
    container.querySelectorAll('.btn-change-cat-icon').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const catId = btn.getAttribute('data-id');
        const cat = this.catalog.find(c => c.id === catId);
        const row = btn.closest('.catalog-agent-row');
        if (cat) {
          this.openCategoryIconModal(cat, row);
        }
      };
    });

    // Back to Carriers button
    container.querySelector('#back-to-carriers-btn')?.addEventListener('click', () => {
      this.onNavigate('operators');
    });

    // Refresh Data button
    container.querySelector('#refresh-detail-btn')?.addEventListener('click', () => {
      this.loadDataAndRender(container);
    });

    // Quick Status Select
    const quickStatus = container.querySelector('#quick-status-select');
    if (quickStatus) {
      quickStatus.onchange = async () => {
        const newStatus = quickStatus.value;
        try {
          await ApiService.put(`/api/v1/admin/operators/${op.id}`, { status: newStatus });
          Toast.success(`Operator status updated to ${newStatus.toUpperCase()}`);
          await AppState.loadOperators();
        } catch (err) {
          Toast.error(err.message || 'Failed to update status');
          quickStatus.value = op.status;
        }
      };
    }

    // Fullpage Tab Switching
    const tabBtns = container.querySelectorAll('.fullpage-tab-btn');
    const tabPanels = container.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const targetTab = btn.getAttribute('data-tab');
        this.activeTab = targetTab;

        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.style.color = 'var(--text-secondary)';
          b.style.borderBottomColor = 'transparent';
        });
        btn.classList.add('active');
        btn.style.color = 'var(--text-primary)';
        btn.style.borderBottomColor = 'var(--accent)';

        tabPanels.forEach(p => p.style.display = 'none');
        const activePanel = container.querySelector(`#fullpage-${targetTab}`);
        if (activePanel) activePanel.style.display = 'block';
      };
    });

    // 2. SAVE CARRIER POLICIES
    const policiesForm = container.querySelector('#carrier-policies-form');
    if (policiesForm) {
      policiesForm.onsubmit = async (e) => {
        e.preventDefault();
        const saveBtn = container.querySelector('#save-policies-btn');
        saveBtn.disabled = true;
        saveBtn.innerText = 'Saving Policies...';

        const payload = {
          seamlessLoginEnabled: container.querySelector('#policy-seamless-check').checked,
          checksubCacheTtlMinutes: parseInt(container.querySelector('#policy-cache-ttl').value, 10) || 30,
          demoEnabled: container.querySelector('#policy-demo-check').checked,
          demoDurationHours: parseInt(container.querySelector('#policy-demo-hours').value, 10) || 48,
          demoMaxMessages: parseInt(container.querySelector('#policy-demo-msgs').value, 10) || 10,
          demoMaxTokens: parseInt(container.querySelector('#policy-demo-tokens').value, 10) || 5000,
          gracePeriodDays: parseInt(container.querySelector('#policy-grace-days').value, 10) || 3,
          graceAccessLevel: container.querySelector('#policy-grace-access').value,
          fraudBlockEnabled: container.querySelector('#policy-fraud-check').checked,
          contentModEnabled: container.querySelector('#policy-content-check').checked,
          maxSessionsPerUser: parseInt(container.querySelector('#policy-max-sessions').value, 10) || 3,
          termsUrl: container.querySelector('#policy-terms-url').value.trim() || undefined,
          privacyUrl: container.querySelector('#policy-privacy-url').value.trim() || undefined,
          supportEmail: container.querySelector('#policy-support-email').value.trim() || undefined,
        };

        try {
          await ApiService.put(`/api/v1/admin/operators/${op.id}/settings`, payload);
          Toast.success('Carrier network policies and quotas updated successfully!');
          saveBtn.disabled = false;
          saveBtn.innerHTML = `${icons.check} Save Carrier Policies`;
        } catch (err) {
          Toast.error(err.message || 'Failed to update policies');
          saveBtn.disabled = false;
          saveBtn.innerHTML = `${icons.check} Save Carrier Policies`;
        }
      };
    }

    // 3. SAVE AI CATEGORIES CATALOG
    const saveAgentsBtn = container.querySelector('#save-agents-catalog-btn');
    if (saveAgentsBtn) {
      saveAgentsBtn.onclick = async () => {
        saveAgentsBtn.disabled = true;
        saveAgentsBtn.innerText = 'Saving Assignments...';

        const payloadAgents = [];
        container.querySelectorAll('.catalog-agent-row').forEach(row => {
          const check = row.querySelector('.cat-enable-check');
          if (check && check.checked) {
            const agentId = row.getAttribute('data-id');
            const displayOrder = parseInt(row.querySelector('.cat-order').value, 10) || 1;
            const customName = row.querySelector('.cat-custom-name').value.trim() || null;
            const minPlan = row.querySelector('.cat-min-plan').value.trim() || null;
            const isLockedUi = row.querySelector('.cat-lock-check').checked;

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
          await ApiService.post(`/api/v1/admin/operators/${op.id}/agents`, { agents: payloadAgents });
          Toast.success(`Assigned ${payloadAgents.length} AI categories to ${op.name}!`);
          saveAgentsBtn.disabled = false;
          saveAgentsBtn.innerHTML = `${icons.check} Save Category Assignments`;
        } catch (err) {
          Toast.error(err.message || 'Failed to update categories');
          saveAgentsBtn.disabled = false;
          saveAgentsBtn.innerHTML = `${icons.check} Save Category Assignments`;
        }
      };
    }

    // 4. SAVE CARRIER PROFILE
    const profileForm = container.querySelector('#carrier-profile-form');
    if (profileForm) {
      profileForm.onsubmit = async (e) => {
        e.preventDefault();
        const saveBtn = container.querySelector('#save-profile-btn');
        saveBtn.disabled = true;
        saveBtn.innerText = 'Updating Profile...';

        const payload = {
          name: container.querySelector('#prof-name').value.trim(),
          status: container.querySelector('#prof-status').value,
          countryCode: container.querySelector('#prof-country').value.trim().toUpperCase(),
          countryPhoneCode: container.querySelector('#prof-phone-code').value.trim() || undefined,
          platformTier: container.querySelector('#prof-tier').value,
          timezone: container.querySelector('#prof-timezone').value.trim(),
          contactEmail: container.querySelector('#prof-email').value.trim(),
          contactName: container.querySelector('#prof-contact-name').value.trim() || undefined,
        };

        try {
          await ApiService.put(`/api/v1/admin/operators/${op.id}`, payload);
          Toast.success('Carrier profile and commercial settings updated!');
          saveBtn.disabled = false;
          saveBtn.innerHTML = `${icons.check} Save Carrier Profile`;
          await AppState.loadOperators();
        } catch (err) {
          Toast.error(err.message || 'Failed to update profile');
          saveBtn.disabled = false;
          saveBtn.innerHTML = `${icons.check} Save Carrier Profile`;
        }
      };
    }

    // 5. REGIONAL LANGUAGES ACTIONS
    const addLangBtn = container.querySelector('#add-regional-lang-btn');
    if (addLangBtn) {
      addLangBtn.onclick = () => this.openLanguageModal(container);
    }

    container.querySelectorAll('.edit-language-dict-btn').forEach(btn => {
      btn.onclick = () => {
        const code = btn.getAttribute('data-code');
        this.openLanguageModal(container, code);
      };
    });

    // 6. AUTH FLOW CONFIG ACTIONS
    const flowForm = container.querySelector('#flow-config-form');
    if (flowForm) {
      // Helper: render the live flow diagram based on current selections
      const renderFlowDiagram = () => {
        const diagram = container.querySelector('#flow-diagram');
        if (!diagram) return;

        const flow = container.querySelector('#flow-auth-flow')?.value || 'simple_otp';
        const checksub = container.querySelector('#flow-checksub')?.checked;
        const showPacks = container.querySelector('#flow-show-packs')?.checked;
        const otpPlanId = container.querySelector('#flow-otp-plan-id')?.checked;
        const autoSub = container.querySelector('#flow-auto-sub')?.checked;
        const fieldName = container.querySelector('#flow-plan-field')?.value || 'planId';

        const step = (label, color = 'var(--accent)') =>
          `<div style="padding: 6px 12px; border-radius: 20px; background: ${color}22; border: 1.5px solid ${color}; color: var(--text-primary); font-size: 11.5px; font-weight: 600;">${label}</div>`;
        const arrow = `<span style="color: var(--text-muted); font-size: 16px; font-weight: 400;">→</span>`;

        let steps = [];

        if (flow === 'pack_first_dcb_pin') {
          steps = [
            step('📱 MSISDN & 📦 Pack Selection', '#10b981'),
            arrow,
            step(`🔐 Request PIN (+ ${fieldName || 'purchaseTypeId'})`, '#6366f1'),
            arrow,
            step('🔑 Confirm PIN', '#6366f1'),
            arrow,
            step('⏳ Async Status Polling', '#f59e0b'),
            arrow,
            step('🎉 Subscription Active', '#22c55e')
          ];
        } else if (flow === 'checksub_first_sync') {
          steps = [
            step('📱 Enter Number', '#6366f1'),
            arrow,
            step('🔍 CheckSub Query', '#f59e0b'),
            arrow,
            step('⚡ Active? Seamless Bypass', '#10b981'),
            arrow,
            step('📨 [If Inactive] Auth OTP', '#6366f1'),
            arrow,
            step('✅ Validate OTP', '#6366f1'),
            arrow,
            step('🔄 Subs_Engine Sync', '#22d3ee'),
            arrow,
            step('🎉 Logged In', '#22c55e')
          ];
        } else if (flow === 'query_param_token') {
          steps = [
            step('🌐 Macro Query URL', '#3b82f6'),
            arrow,
            step('🔄 Sub #MSISDN# / #ANDID#', '#a855f7'),
            arrow,
            step('📨 Send OTP Query', '#6366f1'),
            arrow,
            step('✅ Verify with Token/OTP', '#6366f1'),
            arrow,
            step('🎉 Access Granted', '#22c55e')
          ];
        } else if (flow === 'header_enrichment') {
          steps = [
            step('📶 Cellular 4G/5G Request', '#3b82f6'),
            arrow,
            step('🔍 Carrier Header Enrichment', '#a855f7'),
            arrow,
            step('⚡ Auto-Extract MSISDN', '#10b981'),
            arrow,
            step('📦 Direct Packs / Auto-Sub', '#22d3ee'),
            arrow,
            step('🎉 Logged In (Zero OTP)', '#22c55e')
          ];
        } else {
          // Standard / custom
          steps = [step('📱 Enter Number', '#6366f1')];
          if (checksub) {
            steps.push(arrow, step('🔍 Checksub API', '#f59e0b'));
          }
          if (showPacks) {
            steps.push(arrow, step('📦 Select Pack', '#10b981'));
          }
          const otpLabel = otpPlanId ? `📨 OTP (+ ${fieldName})` : '📨 Send OTP';
          steps.push(arrow, step(otpLabel, '#6366f1'));
          steps.push(arrow, step('✅ Verify OTP', '#6366f1'));
          if (autoSub) {
            steps.push(arrow, step('💳 DCB Auto-Subscribe', '#22d3ee'));
          }
          steps.push(arrow, step('🎉 Logged In', '#22c55e'));
        }

        diagram.innerHTML = steps.join(' ');
      };

      // Helper: dynamically show/hide gateway endpoint cards based on selected strategy flow
      const updateGatewayVisibility = (flow) => {
        const cardOtpSend = container.querySelector('#flow-gw-card-otp-send');
        const cardOtpVerify = container.querySelector('#flow-gw-card-otp-verify');
        const cardChecksub = container.querySelector('#flow-gw-card-checksub');
        const cardDcb = container.querySelector('#flow-gw-card-dcb');
        const dcbChargeGroup = container.querySelector('#flow-gw-dcb-charge-group');
        const dcbSyncGroup = container.querySelector('#flow-gw-dcb-sync-group');
        const strategyBanner = container.querySelector('#flow-strategy-active-banner');

        if (!cardOtpSend) return;

        if (flow === 'simple_otp') {
          cardOtpSend.style.display = 'block';
          cardOtpVerify.style.display = 'block';
          cardChecksub.style.display = 'none';
          cardDcb.style.display = 'none';
          if (strategyBanner) {
            strategyBanner.innerHTML = `
              <span class="badge badge-primary">ACTIVE: Standard Simple OTP</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;">Standard SMS OTP flow. Only <b>Send OTP</b> and <b>Verify OTP</b> endpoints are needed below.</span>
            `;
          }
        } else if (flow === 'checksub_first_sync') {
          cardOtpSend.style.display = 'block';
          cardOtpVerify.style.display = 'block';
          cardChecksub.style.display = 'block';
          cardDcb.style.display = 'block';
          if (dcbChargeGroup) dcbChargeGroup.style.display = 'none';
          if (dcbSyncGroup) dcbSyncGroup.style.display = 'block';
          if (strategyBanner) {
            strategyBanner.innerHTML = `
              <span class="badge badge-warning">ACTIVE: CheckSub + Engine Sync (Orange BF)</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;"><b>CheckSub</b> runs first (active users bypass OTP). Inactive users receive <b>Auth OTP</b>, followed by <b>Subs_Engine Sync</b> call.</span>
            `;
          }
        } else if (flow === 'pack_first_dcb_pin') {
          cardOtpSend.style.display = 'block';
          cardOtpVerify.style.display = 'block';
          cardChecksub.style.display = 'none';
          cardDcb.style.display = 'block';
          if (dcbChargeGroup) dcbChargeGroup.style.display = 'block';
          if (dcbSyncGroup) dcbSyncGroup.style.display = 'none';
          if (strategyBanner) {
            strategyBanner.innerHTML = `
              <span class="badge badge-success">ACTIVE: Pack Selection + DCB PIN (Universe DCB)</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;">Pack selected first. <b>Send OTP</b> acts as PIN Request with <code>purchaseTypeId</code>, followed by <b>Verify PIN</b> and <b>DCB Polling</b>.</span>
            `;
          }
        } else if (flow === 'query_param_token') {
          cardOtpSend.style.display = 'block';
          cardOtpVerify.style.display = 'block';
          cardChecksub.style.display = 'none';
          cardDcb.style.display = 'none';
          if (strategyBanner) {
            strategyBanner.innerHTML = `
              <span class="badge badge-cyan">ACTIVE: Macro URL Query Param (Etisalat)</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;">Macro URL substitutions for <code>#MSISDN#</code> and <code>#OTP#</code>.</span>
            `;
          }
        } else if (flow === 'header_enrichment') {
          cardOtpSend.style.display = 'none';
          cardOtpVerify.style.display = 'none';
          cardChecksub.style.display = 'block';
          cardDcb.style.display = 'block';
          if (dcbChargeGroup) dcbChargeGroup.style.display = 'block';
          if (dcbSyncGroup) dcbSyncGroup.style.display = 'none';
          if (strategyBanner) {
            strategyBanner.innerHTML = `
              <span class="badge" style="background: rgba(147,51,234,0.15); color: #c084fc; border: 1px solid rgba(147,51,234,0.3); font-weight: 700;">ACTIVE: Zero-Click Cellular (HE)</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;"><b>Zero OTP!</b> Phone number is auto-extracted from cellular headers or redirect URL. Configure <b>CheckSub</b> &amp; <b>DCB Direct Charge</b> only.</span>
            `;
          }
        }
      };

      // Render initial diagram & gateway endpoint visibility
      renderFlowDiagram();
      const initialFlow = container.querySelector('#flow-auth-flow')?.value || 'simple_otp';
      updateGatewayVisibility(initialFlow);

      // Flow type card click — update hidden input + re-style cards
      container.querySelectorAll('.flow-type-card').forEach(card => {
        card.addEventListener('click', () => {
          const flow = card.getAttribute('data-flow');
          container.querySelector('#flow-auth-flow').value = flow;

          // Update visual selection state
          container.querySelectorAll('.flow-type-card').forEach(c => {
            const isSelected = c.getAttribute('data-flow') === flow;
            c.style.borderColor = isSelected ? 'var(--accent)' : 'var(--border-subtle)';
            c.style.background = isSelected ? 'rgba(99,102,241,0.08)' : 'var(--bg-inset)';
          });

          // Auto-set recommended options based on flow type
          if (flow === 'simple_otp') {
            container.querySelector('#flow-checksub').checked = false;
            container.querySelector('#flow-show-packs').checked = false;
            container.querySelector('#flow-otp-plan-id').checked = false;
            container.querySelector('#flow-auto-sub').checked = false;
            container.querySelector('#flow-plan-field').value = 'planId';
          } else if (flow === 'checksub_first_sync') {
            container.querySelector('#flow-checksub').checked = true;
            container.querySelector('#flow-show-packs').checked = true;
            container.querySelector('#flow-otp-plan-id').checked = true;
            container.querySelector('#flow-auto-sub').checked = true;
            container.querySelector('#flow-plan-field').value = 'serviceId';
          } else if (flow === 'pack_first_dcb_pin') {
            container.querySelector('#flow-checksub').checked = false;
            container.querySelector('#flow-show-packs').checked = true;
            container.querySelector('#flow-otp-plan-id').checked = true;
            container.querySelector('#flow-auto-sub').checked = true;
            container.querySelector('#flow-plan-field').value = 'purchaseTypeId';
          } else if (flow === 'query_param_token') {
            container.querySelector('#flow-checksub').checked = false;
            container.querySelector('#flow-show-packs').checked = false;
            container.querySelector('#flow-otp-plan-id').checked = true;
            container.querySelector('#flow-auto-sub').checked = false;
            container.querySelector('#flow-plan-field').value = 'cmpid';
          } else if (flow === 'header_enrichment') {
            container.querySelector('#flow-checksub').checked = true;
            container.querySelector('#flow-show-packs').checked = true;
            container.querySelector('#flow-otp-plan-id').checked = false;
            container.querySelector('#flow-auto-sub').checked = true;
            container.querySelector('#flow-plan-field').value = 'planId';
          }

          renderFlowDiagram();
          updateGatewayVisibility(flow);
        });
      });

      // Re-render diagram on any checkbox/input change
      flowForm.querySelectorAll('input[type="checkbox"], input[type="text"]').forEach(input => {
        input.addEventListener('change', renderFlowDiagram);
        input.addEventListener('input', renderFlowDiagram);
      });

      // Form submit — save flow config
      flowForm.onsubmit = async (e) => {
        e.preventDefault();
        const saveBtn = container.querySelector('#save-flow-config-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '⏳ Saving...';

        const flowValue = container.querySelector('#flow-auth-flow').value;
        let compatAuthFlow = 'simple_otp';
        if (flowValue === 'checksub_first_sync' || flowValue === 'checksub_then_otp') compatAuthFlow = 'checksub_then_otp';
        else if (flowValue === 'pack_first_dcb_pin' || flowValue === 'pack_first_otp') compatAuthFlow = 'pack_first_otp';

        const payload = {
          authFlow: compatAuthFlow,
          flowStrategy: flowValue,
          checksubEnabled: container.querySelector('#flow-checksub').checked,
          showPackSelection: container.querySelector('#flow-show-packs').checked,
          otpIncludesPlanId: container.querySelector('#flow-otp-plan-id').checked,
          otpPlanIdFieldName: container.querySelector('#flow-plan-field').value.trim() || 'planId',
          autoSubscribeOnVerify: container.querySelector('#flow-auto-sub').checked,
          globalServiceId: container.querySelector('#flow-global-service-id')?.value.trim() || null,
          globalMerchantId: container.querySelector('#flow-global-merchant-id')?.value.trim() || null,
          globalOperatorCode: container.querySelector('#flow-global-operator-code')?.value.trim() || null,
        };

        try {
          const res = await ApiService.put(`/api/v1/admin/operators/${this.operatorId}/flow-config`, payload);
          if (res.success) {
            this.flowConfig = res.data;
          }

          // Also save Gateway Endpoints if provided
          const secret = container.querySelector('#flow-gw-secret')?.value.trim() || 'carrier_secret';
          const authType = container.querySelector('#flow-gw-auth-type')?.value || 'bearer';

          const otpSend = container.querySelector('#flow-gw-otp-send-endpoint')?.value.trim();
          const otpVerify = container.querySelector('#flow-gw-otp-verify-endpoint')?.value.trim();
          const otpTemplate = container.querySelector('#flow-gw-otp-send-template')?.value.trim();
          const otpVerifyTemplate = container.querySelector('#flow-gw-otp-verify-template')?.value.trim();
          const otpMethod = container.querySelector('#flow-gw-otp-send-method')?.value || 'POST';
          const otpVerifyMethod = container.querySelector('#flow-gw-otp-verify-method')?.value || 'POST';

          const checksubUrl = container.querySelector('#flow-gw-checksub-endpoint')?.value.trim();
          const checksubMethod = container.querySelector('#flow-gw-checksub-method')?.value || 'GET';
          const checksubTemplate = container.querySelector('#flow-gw-checksub-template')?.value.trim();

          const dcbCharge = container.querySelector('#flow-gw-dcb-charge-endpoint')?.value.trim();
          const dcbSync = container.querySelector('#flow-gw-dcb-sync-endpoint')?.value.trim();

          const providerSaves = [];

          if (otpSend || otpVerify) {
            providerSaves.push(
              ApiService.post(`/api/v1/admin/providers/${this.operatorId}/otp/config`, {
                flowType: 'operator_api',
                sendEndpoint: otpSend || otpVerify,
                sendMethod: otpMethod,
                verifyEndpoint: otpVerify || null,
                verifyMethod: otpVerifyMethod,
                authType,
                credentials: { secret },
                sendRequestTemplate: otpTemplate || null,
                verifyRequestTemplate: otpVerifyTemplate || null,
              })
            );
          }

          if (checksubUrl) {
            providerSaves.push(
              ApiService.post(`/api/v1/admin/providers/${this.operatorId}/checksub/config`, {
                flowType: 'operator_api',
                endpoint: checksubUrl,
                httpMethod: checksubMethod,
                authType,
                credentials: { secret },
                requestTemplate: checksubTemplate || null,
              })
            );
          }

          if (dcbCharge || dcbSync) {
            providerSaves.push(
              ApiService.post(`/api/v1/admin/providers/${this.operatorId}/dcb/config`, {
                flowType: 'direct_charge',
                chargeEndpoint: dcbCharge || dcbSync,
                syncEndpoint: dcbSync || null,
                authType,
                credentials: { secret },
              })
            );
          }

          if (providerSaves.length > 0) {
            await Promise.all(providerSaves);
          }

          Toast.success('✅ Auth Flow & Gateway Endpoints saved successfully!');
        } catch (err) {
          Toast.error(err.message || 'Failed to save configuration');
        } finally {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '💾 Save Flow Configuration';
        }
      };
    }

  }

  openLanguageModal(container, code = null) {
    const existing = this.languages.find(l => l.languageCode === code);
    Modal.open({
      title: existing ? 'Language settings' : 'Create a content language',
      maxWidth: '520px',
      contentHtml: `<form id="language-create-form"><p>Create the language first, then enter its screen content in the editor.</p>
        <label class="form-label studio-field">Language code<input name="languageCode" class="form-input" placeholder="en, hi, ar" pattern="[a-z]{2}" maxlength="2" required value="${escapeHtml(code || '')}" ${existing ? 'readonly' : ''}></label>
        <label class="form-label studio-field">Direction<select name="direction" class="form-select"><option value="ltr">Left to right</option><option value="rtl" ${existing?.direction === 'rtl' ? 'selected' : ''}>Right to left</option></select></label>
        <label class="form-label studio-field">Font family<input name="fontFamily" class="form-input" value="${escapeHtml(existing?.fontFamily || 'Inter')}" required></label>
        <div class="modal-footer"><button class="btn btn-primary">${existing ? 'Save settings' : 'Create language'}</button></div></form>`,
      onRender: (overlay, close) => {
        overlay.querySelector('form').onsubmit = async e => {
          e.preventDefault();
          const form = e.currentTarget;
          const payload = Object.fromEntries(new FormData(form));
          if (!existing && this.languages.some(l => l.languageCode === payload.languageCode)) { Toast.error('Language already exists. Select it in the editor.'); return; }
          const button = form.querySelector('button');
          button.disabled = true;
          try {
            await ApiService.post(`/api/v1/admin/operators/${this.operatorId}/languages`, {...payload, strings: this.languageDrafts[code] || existing?.strings || {}, isDefault: existing?.isDefault || false});
            this.selectedLanguage = payload.languageCode;
            this.activeTab = 'tab-theme';
            close();
            await this.loadDataAndRender(container);
            Toast.success('Language ready. Enter its screen content below.');
          } catch (err) { Toast.error(err.message); button.disabled = false; }
        };
      },
    });
  }
}
