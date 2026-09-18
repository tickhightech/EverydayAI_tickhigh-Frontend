import { ApiService } from '../services/api.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons, getCategoryIcon } from '../components/icons.js';

export class AgentsView {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.agents = [];
  }

  formatModelName(rawModel = '') {
    if (rawModel.includes('llama-3-8b') || rawModel.includes('llama-3')) return 'Llama 3 8B';
    if (rawModel.includes('claude-3-haiku') || rawModel.includes('haiku')) return 'Claude 3 Haiku';
    if (rawModel.includes('gpt-4o-mini') || rawModel.includes('4o-mini')) return 'GPT-4o Mini';
    return rawModel.split('/').pop() || rawModel;
  }

  async render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">AI Agent Studio & Prompt Engineering</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Manage system prompts, model hyper-parameters, token budgets, and operator distribution</p>
        </div>
        <button id="create-agent-btn" class="btn btn-primary">
          ${icons.plus} Create AI Assistant
        </button>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4">
          <div style="display: flex; gap: 10px; flex: 1; max-width: 360px;">
            <input type="text" id="agent-search-input" class="form-input" placeholder="Search by name, role, or category..." />
          </div>
          <button id="agent-refresh-btn" class="btn btn-secondary">
            ${icons.refresh} Refresh Catalog
          </button>
        </div>

        <div id="agents-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
            Loading AI agent catalog...
          </div>
        </div>
      </div>
    `;

    const createBtn = container.querySelector('#create-agent-btn');
    const refreshBtn = container.querySelector('#agent-refresh-btn');
    const searchInput = container.querySelector('#agent-search-input');

    createBtn.onclick = () => this.openAgentModal(container);
    refreshBtn.onclick = () => this.loadAgents(container);
    searchInput.oninput = () => this.filterAgents(container, searchInput.value);

    setTimeout(() => this.loadAgents(container), 0);

    return container;
  }

  async loadAgents(container) {
    try {
      const res = await ApiService.get('/api/v1/admin/ai/catalog');
      if (res.success && Array.isArray(res.data)) {
        this.agents = res.data;
        this.renderGrid(container, this.agents);
      }
    } catch (err) {
      Toast.error(err.message || 'Failed to fetch AI agent catalog');
    }
  }

  filterAgents(container, query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.renderGrid(container, this.agents);
      return;
    }
    const filtered = this.agents.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.model?.toLowerCase().includes(q)
    );
    this.renderGrid(container, filtered);
  }

  renderGrid(container, list) {
    const grid = container.querySelector('#agents-grid');
    if (!grid) return;

    if (!list || list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
          No AI agents found in the platform catalog.
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(agent => {
      const categoryIcon = getCategoryIcon(agent.category);
      const friendlyModel = this.formatModelName(agent.model);

      return `
        <div class="card" style="min-height: 280px; padding: 18px; display: flex; flex-direction: column;">
          <!-- Card Top Meta Row -->
          <div class="flex-between mb-3" style="align-items: center;">
            <span class="badge badge-primary">${agent.category || 'General'}</span>
            <span class="badge badge-cyan" title="${agent.model}">${friendlyModel}</span>
          </div>

          <!-- Card Header & Identity -->
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 38px; height: 38px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0;">
              ${categoryIcon}
            </div>
            <div style="overflow: hidden;">
              <h3 style="font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${agent.name}</h3>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${agent.slug || 'agent'}</div>
            </div>
          </div>

          <!-- Card Body Description -->
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px;">
            ${agent.systemPrompt || 'Expert telecom assistant ready to assist subscribers.'}
          </div>

          <!-- Parameters Metadata Bar -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Temperature</span>
              <strong style="color: var(--text-primary); font-family: var(--font-mono);">${agent.temperature || 0.7}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Max Tokens</span>
              <strong style="color: var(--text-primary); font-family: var(--font-mono);">${(agent.maxTokens || 1024).toLocaleString()}</strong>
            </div>
          </div>

          <!-- Card Pinned Footer Actions (Aligned Bottom) -->
          <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-secondary edit-agent-btn" data-id="${agent.id}" style="flex: 1; font-size: 12px; height: 32px;">
              ${icons.edit} Edit Persona
            </button>
            <button class="btn btn-danger btn-icon delete-agent-btn" data-id="${agent.id}" title="Remove Agent" style="width: 32px; height: 32px; flex-shrink: 0;">
              ${icons.trash}
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.edit-agent-btn').forEach(btn => {
      btn.onclick = () => this.openAgentModal(container, btn.getAttribute('data-id'));
    });

    grid.querySelectorAll('.delete-agent-btn').forEach(btn => {
      btn.onclick = () => this.deleteAgent(container, btn.getAttribute('data-id'));
    });
  }

  openAgentModal(container, editId = null) {
    const existing = editId ? this.agents.find(a => a.id === editId) : null;

    Modal.open({
      title: existing ? `Edit Assistant — ${existing.name}` : 'Create AI Assistant',
      maxWidth: '620px',
      contentHtml: `
        <form id="agent-form">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Assistant Name *</label>
              <input type="text" id="agent-name" class="form-input" placeholder="e.g. Health Advisor" required value="${existing?.name || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">Category *</label>
              <select id="agent-cat" class="form-select">
                <option value="health" ${existing?.category === 'health' ? 'selected' : ''}>Health & Wellness</option>
                <option value="education" ${existing?.category === 'education' ? 'selected' : ''}>Education & Tutor</option>
                <option value="recipes" ${existing?.category === 'recipes' ? 'selected' : ''}>Culinary & Recipes</option>
                <option value="finance" ${existing?.category === 'finance' ? 'selected' : ''}>Finance & Budget</option>
                <option value="travel" ${existing?.category === 'travel' ? 'selected' : ''}>Travel & Culture</option>
                <option value="fitness" ${existing?.category === 'fitness' ? 'selected' : ''}>Fitness & Gym</option>
                <option value="creative" ${existing?.category === 'creative' ? 'selected' : ''}>Creative Writing</option>
                <option value="general" ${existing?.category === 'general' ? 'selected' : ''}>General Assistant</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Model Endpoint</label>
              <select id="agent-model" class="form-select">
                <option value="meta-llama/llama-3-8b-instruct" ${existing?.model?.includes('llama-3-8b') ? 'selected' : ''}>Llama 3 8B (Fast)</option>
                <option value="anthropic/claude-3-haiku" ${existing?.model?.includes('haiku') ? 'selected' : ''}>Claude 3 Haiku</option>
                <option value="openai/gpt-4o-mini" ${existing?.model?.includes('4o-mini') ? 'selected' : ''}>GPT-4o Mini</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Temperature</label>
              <input type="number" id="agent-temp" class="form-input" step="0.1" min="0" max="1" value="${existing?.temperature || 0.7}" />
            </div>

            <div class="form-group">
              <label class="form-label">Max Tokens</label>
              <input type="number" id="agent-tokens" class="form-input" min="100" max="4096" value="${existing?.maxTokens || 1024}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">System Prompt & Persona *</label>
            <textarea id="agent-prompt" class="form-textarea" rows="5" required placeholder="You are a professional assistant...">${existing?.systemPrompt || ''}</textarea>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-agent-btn" class="btn btn-primary">
              ${existing ? 'Update Assistant' : 'Publish to Catalog'}
            </button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#agent-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-agent-btn');
          btn.disabled = true;
          btn.innerText = 'Saving...';

          const payload = {
            name: overlay.querySelector('#agent-name').value.trim(),
            category: overlay.querySelector('#agent-cat').value,
            model: overlay.querySelector('#agent-model').value,
            temperature: parseFloat(overlay.querySelector('#agent-temp').value),
            maxTokens: parseInt(overlay.querySelector('#agent-tokens').value, 10),
            systemPrompt: overlay.querySelector('#agent-prompt').value.trim(),
          };

          try {
            if (editId) {
              await ApiService.put(`/api/v1/admin/ai/catalog/${editId}`, payload);
              Toast.success('AI agent updated successfully');
            } else {
              await ApiService.post('/api/v1/admin/ai/catalog', payload);
              Toast.success('New AI assistant published to catalog');
            }
            close();
            this.loadAgents(container);
          } catch (err) {
            Toast.error(err.message || 'Failed to save AI agent');
            btn.disabled = false;
            btn.innerText = editId ? 'Update Assistant' : 'Publish to Catalog';
          }
        };
      }
    });
  }

  async deleteAgent(container, agentId) {
    if (!confirm('Are you sure you want to delete this AI Agent from the catalog?')) return;
    try {
      await ApiService.delete(`/api/v1/admin/ai/catalog/${agentId}`);
      Toast.success('AI agent deleted from catalog');
      this.loadAgents(container);
    } catch (err) {
      Toast.error(err.message || 'Failed to delete agent');
    }
  }
}
