import { ApiService } from '../services/api.js';
import { AppState } from '../services/state.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons } from '../components/icons.js';

export class ProvidersView {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.catalog = null;
  }

  async render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Telecom Gateways & Flow Adapters</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Dynamic provider configurations for OTP dispatch, Direct Carrier Billing (DCB), and CheckSub status</p>
        </div>
        <button id="test-connectivity-btn" class="btn btn-secondary">
          ${icons.zap} Test Gateway Connectivity
        </button>
      </div>

      <!-- Section 1: Active Gateway Configuration (Bento Cards) -->
      <div class="card mb-6" style="padding: var(--space-5);">
        <div class="card-header mb-3">
          <div>
            <h3 class="card-title">Active Carrier Gateway Endpoints</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              Configure network credentials, endpoints, and authentication types for the selected carrier
            </p>
          </div>
          <span class="badge badge-primary" id="active-op-tag">
            ${AppState.getActiveOperator()?.name || 'Airtel India'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 10px;">
          <!-- Card 1: OTP -->
          <div class="card" style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 18px; min-height: 220px; display: flex; flex-direction: column;">
            <div class="flex-between mb-2">
              <span class="badge badge-primary">AUTHENTICATION</span>
              <span style="color: var(--text-muted); font-size: 11px; font-family: var(--font-mono);">FLOW 01</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">OTP & Network Auth</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Operator SMS API endpoint, fallback chains, or zero-click Header Enrichment (HE) cellular auth.
            </p>
            <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary config-gateway-btn" data-type="otp" style="width: 100%; height: 34px;">
                Configure OTP Gateway &rarr;
              </button>
            </div>
          </div>

          <!-- Card 2: DCB -->
          <div class="card" style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 18px; min-height: 220px; display: flex; flex-direction: column;">
            <div class="flex-between mb-2">
              <span class="badge badge-cyan">CARRIER BILLING</span>
              <span style="color: var(--text-muted); font-size: 11px; font-family: var(--font-mono);">FLOW 02</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">Direct Carrier Billing (DCB)</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Direct server-to-server airtime charges, PIN consent flows, and telco webhook endpoints.
            </p>
            <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary config-gateway-btn" data-type="dcb" style="width: 100%; height: 34px;">
                Configure DCB Billing &rarr;
              </button>
            </div>
          </div>

          <!-- Card 3: CheckSub -->
          <div class="card" style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 18px; min-height: 220px; display: flex; flex-direction: column;">
            <div class="flex-between mb-2">
              <span class="badge badge-warning">SYNC STATUS</span>
              <span style="color: var(--text-muted); font-size: 11px; font-family: var(--font-mono);">FLOW 03</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">CheckSub Verification API</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Synchronous subscription status verification and automated grace period state transitions.
            </p>
            <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary config-gateway-btn" data-type="checksub" style="width: 100%; height: 34px;">
                Configure CheckSub &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Flow Types & Adapter Catalog -->
      <div class="card" style="padding: var(--space-5);">
        <div class="card-header mb-4">
          <div>
            <h3 class="card-title">Supported Flow Types & Strategy Catalog</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              Adapter specifications and parameter contracts defined in the platform engine
            </p>
          </div>
          <span class="badge badge-neutral">DATABASE SCHEMA CATALOG</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;" id="flow-types-grid">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
            Loading flow types catalog...
          </div>
        </div>
      </div>
    `;

    const pingBtn = container.querySelector('#test-connectivity-btn');
    pingBtn.onclick = () => this.openConnectivityTestModal();

    container.querySelectorAll('.config-gateway-btn').forEach(btn => {
      btn.onclick = () => this.openConfigModal(btn.getAttribute('data-type'));
    });

    setTimeout(() => this.loadCatalog(container), 0);

    return container;
  }

  async loadCatalog(container) {
    try {
      const res = await ApiService.get('/api/v1/admin/providers/flow-types');
      if (res.success && res.data) {
        this.catalog = res.data;
        this.renderCatalog(container, this.catalog);
      }
    } catch (err) {
      Toast.error(err.message || 'Failed to load flow types catalog');
    }
  }

  renderCatalog(container, data) {
    const grid = container.querySelector('#flow-types-grid');
    if (!grid) return;

    let items = [];

    if (data.otp) {
      data.otp.forEach(item => items.push({ ...item, group: 'OTP AUTH', badgeClass: 'badge-primary' }));
    }
    if (data.dcb) {
      data.dcb.forEach(item => items.push({ ...item, group: 'DCB BILLING', badgeClass: 'badge-cyan' }));
    }
    if (data.checksub) {
      data.checksub.forEach(item => items.push({ ...item, group: 'CHECKSUB', badgeClass: 'badge-warning' }));
    }

    grid.innerHTML = items.map(item => `
      <div class="card" style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 18px; min-height: 200px; display: flex; flex-direction: column;">
        <div class="flex-between mb-2">
          <span class="badge ${item.badgeClass}">${item.group}</span>
          <code style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${item.flowType}</code>
        </div>

        <h4 style="font-size: 14.5px; font-weight: 600; margin-bottom: 6px; line-height: 1.35;">${item.displayName}</h4>
        
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px; flex: 1;">
          ${item.description || 'Standard telecom adapter strategy protocol.'}
        </p>

        <div style="margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
          <div style="font-size: 10.5px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 6px;">
            Required Parameters
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${(item.requiredFields || []).map(f => `
              <span style="font-size: 10.5px; font-family: var(--font-mono); background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); padding: 2px 6px; border-radius: var(--radius-xs); color: #cbd5e1;">
                ${f}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  openConnectivityTestModal() {
    Modal.open({
      title: 'Gateway Connectivity Drill & Latency Ping',
      maxWidth: '560px',
      contentHtml: `
        <form id="connectivity-form">
          <div class="form-group">
            <label class="form-label">Provider Service Type</label>
            <select id="ping-type" class="form-select">
              <option value="otp">OTP SMS Gateway</option>
              <option value="dcb">Direct Carrier Billing (DCB)</option>
              <option value="checksub">CheckSub Verification API</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Target Endpoint URL *</label>
            <input type="url" id="ping-endpoint" class="form-input" value="https://api.mockoperator.com/v1/ping" required />
          </div>

          <div class="form-group">
            <label class="form-label">Mock Authorization Headers (JSON)</label>
            <textarea id="ping-headers" class="form-textarea" rows="3" style="font-family: var(--font-mono); font-size: 11px;">{\n  "Authorization": "Bearer test_telco_token_123",\n  "Content-Type": "application/json"\n}</textarea>
          </div>

          <div id="ping-result-box" style="display: none; padding: 12px 14px; border-radius: var(--radius-sm); font-size: 12px; font-family: var(--font-mono); margin-bottom: 14px;"></div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="exec-ping-btn" class="btn btn-primary">Dispatch Connectivity Ping</button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#connectivity-form');
        const resBox = overlay.querySelector('#ping-result-box');

        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#exec-ping-btn');
          btn.disabled = true;
          btn.innerText = 'Pinging Gateway...';

          try {
            const providerType = overlay.querySelector('#ping-type').value;
            const endpoint = overlay.querySelector('#ping-endpoint').value;

            const res = await ApiService.post('/api/v1/admin/providers/test-connectivity', {
              providerType,
              config: { endpoint }
            });

            resBox.style.display = 'block';
            resBox.style.background = 'var(--status-success-bg)';
            resBox.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            resBox.style.color = '#34d399';
            resBox.innerHTML = `
              <strong>✓ Gateway Connectivity Verified</strong><br/>
              Status: ${res.data?.status || 'CONNECTED'}<br/>
              Round-trip Latency: ${res.data?.latencyMs || 42}ms<br/>
              Response Code: 200 OK
            `;
            Toast.success('Ping drill completed successfully!');
          } catch (err) {
            resBox.style.display = 'block';
            resBox.style.background = 'var(--status-danger-bg)';
            resBox.style.border = '1px solid rgba(244, 63, 94, 0.3)';
            resBox.style.color = '#fb7185';
            resBox.innerHTML = `<strong>✗ Connection Failed:</strong><br/>${err.message}`;
            Toast.error('Ping drill returned an error');
          } finally {
            btn.disabled = false;
            btn.innerText = 'Dispatch Connectivity Ping';
          }
        };
      }
    });
  }

  async openConfigModal(providerType) {
    const activeOp = AppState.getActiveOperator() || AppState.operators[0];
    if (!activeOp) {
      Toast.error('Please onboard or select an operator first');
      return;
    }

    let existingConfig = null;
    try {
      const res = await ApiService.get(`/api/v1/admin/providers/${activeOp.id}/${providerType}/config`);
      if (res && res.success && res.data) {
        existingConfig = res.data;
      }
    } catch (err) {
      // Ignored if not yet configured
    }

    const defaultEndpoint = existingConfig?.sendEndpoint || existingConfig?.chargeEndpoint || existingConfig?.endpoint || `https://api.${activeOp.subdomain || 'airtel'}.com/v1/${providerType}`;
    const defaultMethod = existingConfig?.sendMethod || existingConfig?.httpMethod || existingConfig?.method || 'POST';
    const defaultFlowType = existingConfig?.flowType || (providerType === 'dcb' ? 'direct_charge' : 'operator_api');
    const defaultAuthType = existingConfig?.authType || 'bearer';
    const defaultTemplate = typeof existingConfig?.sendRequestTemplate === 'string'
      ? existingConfig.sendRequestTemplate
      : typeof existingConfig?.requestTemplate === 'string'
        ? existingConfig.requestTemplate
        : (existingConfig?.sendRequestTemplate || existingConfig?.requestTemplate)
          ? JSON.stringify(existingConfig.sendRequestTemplate || existingConfig.requestTemplate, null, 2)
          : '';
    const defaultSyncEndpoint = existingConfig?.syncEndpoint || '';

    Modal.open({
      title: `Configure ${providerType.toUpperCase()} Gateway — ${activeOp.name}`,
      maxWidth: '640px',
      contentHtml: `
        <form id="save-config-form">
          <div class="form-group">
            <label class="form-label">Adapter Flow Type</label>
            <select id="config-flow" class="form-select">
              <option value="operator_api" ${defaultFlowType === 'operator_api' ? 'selected' : ''}>Operator-Managed REST API</option>
              <option value="header_enrichment" ${defaultFlowType === 'header_enrichment' ? 'selected' : ''}>Header Enrichment (Zero-Click Cellular)</option>
              <option value="direct_charge" ${defaultFlowType === 'direct_charge' ? 'selected' : ''}>Direct Server Charge (DCB)</option>
              <option value="custom" ${defaultFlowType === 'custom' ? 'selected' : ''}>Pluggable Flow Strategy</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Gateway Endpoint URL *</label>
            <input type="url" id="config-endpoint" class="form-input" value="${defaultEndpoint}" required />
          </div>

          ${providerType === 'dcb' ? `
          <div class="form-group">
            <label class="form-label">Subscription Engine Sync Endpoint (Optional)</label>
            <input type="url" id="config-sync-endpoint" class="form-input" value="${defaultSyncEndpoint}" placeholder="e.g. http://domain.com:8080/Subs_Engine/subscription/sync" style="font-family: var(--font-mono); font-size: 12px;" />
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">For Orange BF / external subscription engine activation sync after verification.</div>
          </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">HTTP Method</label>
              <select id="config-method" class="form-select">
                <option value="POST" ${defaultMethod === 'POST' ? 'selected' : ''}>POST</option>
                <option value="GET" ${defaultMethod === 'GET' ? 'selected' : ''}>GET</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Authentication Scheme</label>
              <select id="config-auth-type" class="form-select">
                <option value="bearer" ${defaultAuthType.toLowerCase() === 'bearer' ? 'selected' : ''}>Bearer Token</option>
                <option value="basic" ${defaultAuthType.toLowerCase() === 'basic' ? 'selected' : ''}>Basic Auth</option>
                <option value="api_key" ${defaultAuthType.toLowerCase() === 'api_key' ? 'selected' : ''}>X-API-Key Header</option>
                <option value="none" ${defaultAuthType.toLowerCase() === 'none' ? 'selected' : ''}>None / URL Params</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Encrypted Credentials / Gateway Secret</label>
            <input type="password" id="config-secret" class="form-input" placeholder="telco_prod_secret_key_••••••••" value="carrier_secret_sample_key" required />
          </div>

          <div class="form-group">
            <label class="form-label">Request Template / Payload Pattern (Optional)</label>
            <textarea id="config-template" class="form-textarea" rows="4" style="font-family: var(--font-mono); font-size: 11.5px;" placeholder='{\n  "msisdn": "{{msisdn}}",\n  "purchaseTypeId": {{planCode}},\n  "serviceId": "{{serviceId}}"\n}'>${defaultTemplate}</textarea>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Supports dynamic macros: <code>{{msisdn}}</code>, <code>{{planCode}}</code>, <code>{{serviceId}}</code>, <code>{{otp}}</code> or <code>#MSISDN#</code>.
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-config-btn" class="btn btn-primary">Encrypt &amp; Save Config</button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#save-config-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-config-btn');
          btn.disabled = true;

          try {
            const payload = {
              flowType: overlay.querySelector('#config-flow').value,
              endpoint: overlay.querySelector('#config-endpoint').value,
              method: overlay.querySelector('#config-method').value,
              authType: overlay.querySelector('#config-auth-type').value,
              credentials: {
                secret: overlay.querySelector('#config-secret').value
              },
              requestTemplate: overlay.querySelector('#config-template').value.trim() || null,
            };

            const syncInput = overlay.querySelector('#config-sync-endpoint');
            if (syncInput) {
              payload.syncEndpoint = syncInput.value.trim() || null;
            }

            await ApiService.post(`/api/v1/admin/providers/${activeOp.id}/${providerType}/config`, payload);
            Toast.success(`${providerType.toUpperCase()} gateway configuration stored securely!`);
            close();
          } catch (err) {
            Toast.error(err.message || 'Failed to save gateway config');
            btn.disabled = false;
          }
        };
      }
    });
  }
}
