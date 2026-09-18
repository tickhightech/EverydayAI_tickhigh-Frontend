import { ApiService } from '../services/api.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons } from '../components/icons.js';

export class AgentsView {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.categories = [];
    this.activeLang = 'en';
  }

  slugify(text) {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">AI Category Catalog</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Manage global AI categories, topics, and multi-lingual display names for subscriber portals</p>
        </div>
        <button id="create-category-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px;">
          ${icons.plus} Create AI Category
        </button>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4" style="flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; gap: 10px; flex: 1; min-width: 260px; max-width: 360px;">
            <input type="text" id="category-search-input" class="form-input" placeholder="Search categories by name or slug..." />
          </div>
          <button id="category-refresh-btn" class="btn btn-secondary">
            ${icons.refresh} Refresh Catalog
          </button>
        </div>

        <!-- Multi-Language Display Preview Selector -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding: 10px 14px; background: var(--bg-inset); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Subscriber Portal Language Preview:</span>
            <div id="category-lang-pills" style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="badge ${this.activeLang === 'en' ? 'badge-primary' : 'badge-neutral'} lang-pill-btn" data-lang="en" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇬🇧 English (en)</button>
              <button class="badge ${this.activeLang === 'hi' ? 'badge-primary' : 'badge-neutral'} lang-pill-btn" data-lang="hi" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇮🇳 हिन्दी (hi)</button>
              <button class="badge ${this.activeLang === 'ar' ? 'badge-primary' : 'badge-neutral'} lang-pill-btn" data-lang="ar" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇸🇦 العربية (ar)</button>
              <button class="badge ${this.activeLang === 'fr' ? 'badge-primary' : 'badge-neutral'} lang-pill-btn" data-lang="fr" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇫🇷 Français (fr)</button>
              <button class="badge ${this.activeLang === 'es' ? 'badge-primary' : 'badge-neutral'} lang-pill-btn" data-lang="es" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇪🇸 Español (es)</button>
            </div>
          </div>
          <span style="font-size: 11.5px; color: var(--text-muted);">Simulates category names shown on subscriber screens</span>
        </div>

        <div id="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
            Loading category catalog...
          </div>
        </div>
      </div>
    `;

    const createBtn = container.querySelector('#create-category-btn');
    const refreshBtn = container.querySelector('#category-refresh-btn');
    const searchInput = container.querySelector('#category-search-input');

    createBtn.onclick = () => this.openCategoryModal(container);
    refreshBtn.onclick = () => this.loadCategories(container);
    searchInput.oninput = () => this.filterCategories(container, searchInput.value);

    // Language Preview Pills
    container.querySelectorAll('.lang-pill-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeLang = btn.getAttribute('data-lang');
        container.querySelectorAll('.lang-pill-btn').forEach(b => {
          const isActive = b.getAttribute('data-lang') === this.activeLang;
          b.className = `badge ${isActive ? 'badge-primary' : 'badge-neutral'} lang-pill-btn`;
        });
        this.renderGrid(container, this.categories);
      };
    });

    setTimeout(() => this.loadCategories(container), 0);

    return container;
  }

  async loadCategories(container) {
    try {
      const res = await ApiService.get('/api/v1/admin/ai/catalog');
      if (res.success && Array.isArray(res.data)) {
        this.categories = res.data;
        this.renderGrid(container, this.categories);
      }
    } catch (err) {
      Toast.error(err.message || 'Failed to fetch category catalog');
    }
  }

  filterCategories(container, query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.renderGrid(container, this.categories);
      return;
    }
    const filtered = this.categories.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q)
    );
    this.renderGrid(container, filtered);
  }

  renderGrid(container, list) {
    const grid = container.querySelector('#categories-grid');
    if (!grid) return;

    if (!list || list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
          No AI categories found in the catalog. Click "Create AI Category" to add one.
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => {
      const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
      const translations = item.translations || {};

      let displayTitle = item.name;
      let displaySub = item.slug;

      if (this.activeLang !== 'en') {
        const trans = translations[this.activeLang];
        if (trans) {
          displayTitle = trans;
          displaySub = `EN: ${item.name} • ${item.slug}`;
        } else {
          displaySub = `${item.slug} • (No ${this.activeLang.toUpperCase()} localized name)`;
        }
      }

      // Count active translations
      const transKeys = Object.keys(translations).filter(k => Boolean(translations[k]));

      return `
        <div class="card" style="padding: 18px; display: flex; flex-direction: column; min-height: 220px;">
          <!-- Card Header & Identity -->
          <div class="flex-between mb-3" style="align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); display: flex; align-items: center; justify-content: center; color: var(--brand-primary); font-weight: 700; font-size: 17px; flex-shrink: 0;">
                ${(displayTitle || 'AI').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">${displayTitle}</h3>
                <span class="badge badge-cyan" style="font-family: var(--font-mono); font-size: 11px;">${displaySub}</span>
              </div>
            </div>
            <span class="badge badge-neutral" style="font-size: 10px;">${formattedDate}</span>
          </div>

          <!-- Multi-language Badges -->
          <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px;">
            <span class="badge badge-primary" style="font-size: 10px; padding: 2px 7px;">🇬🇧 EN: ${item.name}</span>
            ${translations.hi ? `<span class="badge badge-success" style="font-size: 10px; padding: 2px 7px;">🇮🇳 HI: ${translations.hi}</span>` : ''}
            ${translations.ar ? `<span class="badge badge-purple" style="font-size: 10px; padding: 2px 7px;">🇸🇦 AR: ${translations.ar}</span>` : ''}
            ${translations.fr ? `<span class="badge badge-warning" style="font-size: 10px; padding: 2px 7px;">🇫🇷 FR: ${translations.fr}</span>` : ''}
            ${translations.es ? `<span class="badge badge-cyan" style="font-size: 10px; padding: 2px 7px;">🇪🇸 ES: ${translations.es}</span>` : ''}
            ${translations.bn ? `<span class="badge badge-neutral" style="font-size: 10px; padding: 2px 7px;">🇧🇩 BN: ${translations.bn}</span>` : ''}
            ${translations.ur ? `<span class="badge badge-neutral" style="font-size: 10px; padding: 2px 7px;">🇵🇰 UR: ${translations.ur}</span>` : ''}
            ${transKeys.length === 0 ? `<span style="font-size: 10px; color: var(--text-muted); font-style: italic;">No translations yet</span>` : ''}
          </div>

          <!-- Metadata Box -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 14px; font-size: 11px; display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Languages Configured</span>
            <span style="color: var(--text-primary); font-weight: 600;">${transKeys.length + 1} language${transKeys.length > 0 ? 's' : ''}</span>
          </div>

          <!-- Card Actions -->
          <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-secondary edit-category-btn" data-id="${item.id}" style="flex: 1; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; gap: 5px;">
              ${icons.edit} Edit & Localize
            </button>
            <button class="btn btn-danger btn-icon delete-category-btn" data-id="${item.id}" title="Remove Category" style="width: 32px; height: 32px; flex-shrink: 0;">
              ${icons.trash}
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.edit-category-btn').forEach(btn => {
      btn.onclick = () => this.openCategoryModal(container, btn.getAttribute('data-id'));
    });

    grid.querySelectorAll('.delete-category-btn').forEach(btn => {
      btn.onclick = () => this.deleteCategory(container, btn.getAttribute('data-id'));
    });
  }

  openCategoryModal(container, editId = null) {
    const existing = editId ? this.categories.find(c => c.id === editId) : null;
    const trans = existing?.translations || {};

    Modal.open({
      title: existing ? `Edit AI Category & Translations — ${existing.name}` : 'Create AI Category',
      maxWidth: '560px',
      contentHtml: `
        <form id="category-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Category Name (English / Default) *</label>
              <input type="text" id="cat-name" class="form-input" placeholder="e.g. Technology & Coding" required value="${existing?.name || ''}" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">Primary display name for this AI category.</div>
            </div>

            <div class="form-group">
              <label class="form-label">Category Slug *</label>
              <input type="text" id="cat-slug" class="form-input" placeholder="e.g. technology" required value="${existing?.slug || ''}" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">Lowercase identifier sent to external AI gateway.</div>
            </div>
          </div>

          <!-- Multi-Language Translations Section -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary);">Multi-Language Display Names (User Portal)</h4>
              <span style="font-size: 11px; color: var(--text-muted);">Auto-adapts on user language switch</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇮🇳 Hindi (hi)
                </label>
                <input type="text" id="trans-hi" class="form-input" placeholder="e.g. तकनीक और कोडिंग" value="${trans.hi || ''}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇸🇦 Arabic (ar)
                </label>
                <input type="text" id="trans-ar" dir="rtl" class="form-input" placeholder="e.g. التكنولوجيا والبرمجة" value="${trans.ar || ''}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇫🇷 French (fr)
                </label>
                <input type="text" id="trans-fr" class="form-input" placeholder="e.g. Technologie et Codage" value="${trans.fr || ''}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇪🇸 Spanish (es)
                </label>
                <input type="text" id="trans-es" class="form-input" placeholder="e.g. Tecnología y Programación" value="${trans.es || ''}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇧🇩 Bengali (bn)
                </label>
                <input type="text" id="trans-bn" class="form-input" placeholder="e.g. প্রযুক্তি ও কোডিং" value="${trans.bn || ''}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇵🇰 Urdu (ur)
                </label>
                <input type="text" id="trans-ur" dir="rtl" class="form-input" placeholder="e.g. ٹیکنالوجی اور کوڈنگ" value="${trans.ur || ''}" />
              </div>
            </div>
          </div>

          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 11.5px; color: var(--text-secondary); margin-bottom: 16px;">
            ℹ️ <strong>Subscriber Multi-Language:</strong> When a user switches language on the subscriber portal, categories will automatically display in that language.
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-cat-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px;">
              ${icons.check} ${existing ? 'Save Category & Translations' : 'Create Category'}
            </button>
          </div>
        </form>
      `,
      onRender: (overlay, close) => {
        const form = overlay.querySelector('#category-form');
        const nameInput = overlay.querySelector('#cat-name');
        const slugInput = overlay.querySelector('#cat-slug');

        const hiInput = overlay.querySelector('#trans-hi');
        const arInput = overlay.querySelector('#trans-ar');
        const frInput = overlay.querySelector('#trans-fr');
        const esInput = overlay.querySelector('#trans-es');
        const bnInput = overlay.querySelector('#trans-bn');
        const urInput = overlay.querySelector('#trans-ur');

        if (!existing) {
          nameInput.addEventListener('input', () => {
            slugInput.value = this.slugify(nameInput.value);
          });
        }

        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-cat-btn');
          btn.disabled = true;
          btn.innerText = 'Saving...';

          const name = nameInput.value.trim();
          const slug = slugInput.value.trim().toLowerCase();

          const translations = {};
          if (hiInput.value.trim()) translations.hi = hiInput.value.trim();
          if (arInput.value.trim()) translations.ar = arInput.value.trim();
          if (frInput.value.trim()) translations.fr = frInput.value.trim();
          if (esInput.value.trim()) translations.es = esInput.value.trim();
          if (bnInput.value.trim()) translations.bn = bnInput.value.trim();
          if (urInput.value.trim()) translations.ur = urInput.value.trim();

          const payload = { name, slug, translations };

          try {
            if (editId) {
              await ApiService.put(`/api/v1/admin/ai/catalog/${editId}`, payload);
              Toast.success('Category and translations updated successfully');
            } else {
              await ApiService.post('/api/v1/admin/ai/catalog', payload);
              Toast.success('New AI category created with translations');
            }
            close();
            this.loadCategories(container);
          } catch (err) {
            Toast.error(err.message || 'Failed to save category');
            btn.disabled = false;
            btn.innerHTML = `${icons.check} ${editId ? 'Save Changes' : 'Create Category'}`;
          }
        };
      }
    });
  }

  async deleteCategory(container, categoryId) {
    if (!confirm('Are you sure you want to remove this category from the platform catalog?')) return;
    try {
      await ApiService.delete(`/api/v1/admin/ai/catalog/${categoryId}`);
      Toast.success('Category deleted successfully');
      this.loadCategories(container);
    } catch (err) {
      Toast.error(err.message || 'Failed to delete category');
    }
  }
}
