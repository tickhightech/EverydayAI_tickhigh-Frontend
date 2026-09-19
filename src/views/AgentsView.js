import { ApiService } from '../services/api.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { icons, getCategoryIcon, renderSmartIcon, CURATED_ICON_CATALOG } from '../components/icons.js';

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
          <p style="color: var(--text-secondary); font-size: 13px;">Manage global AI categories, visual icons, accent colors, and multi-lingual display names for subscriber portals</p>
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
          <span style="font-size: 11.5px; color: var(--text-muted);">Simulates category names & icons shown on subscriber screens</span>
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
      const transKeys = Object.keys(translations).filter(k => k !== '_meta' && Boolean(translations[k]));

      const meta = translations._meta || {};
      const catColor = meta.color || '#6366F1';
      const iconKey = meta.icon || item.slug || 'bot';

      const iconHtml = renderSmartIcon({
        icon: iconKey,
        color: catColor,
        size: 22,
      });

      return `
        <div class="card" style="padding: 18px; display: flex; flex-direction: column; min-height: 220px; transition: transform 0.15s ease, border-color 0.15s ease;">
          <!-- Card Header & Identity -->
          <div class="flex-between mb-3" style="align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: ${catColor}18; border: 1.5px solid ${catColor}44; display: flex; align-items: center; justify-content: center; color: ${catColor}; flex-shrink: 0;">
                ${iconHtml}
              </div>
              <div>
                <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">${displayTitle}</h3>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="badge badge-cyan" style="font-family: var(--font-mono); font-size: 11px;">${displaySub}</span>
                  <span style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono);">icon: ${meta.icon || 'auto'}</span>
                </div>
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
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 14px; font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
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
    const existingMeta = trans._meta || {};
    let selectedIcon = existingMeta.icon || 'utensils';
    let selectedColor = existingMeta.color || '#F97316';

    const colorSwatches = [
      '#F97316', '#10B981', '#3B82F6', '#8B5CF6',
      '#EC4899', '#EAB308', '#EF4444', '#06B6D4',
      '#6366F1', '#14B8A6', '#F59E0B', '#64748B'
    ];

    Modal.open({
      title: existing ? `Edit AI Category & Icon — ${existing.name}` : 'Create AI Category',
      maxWidth: '640px',
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

          <!-- Live Preview Banner -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div id="live-icon-badge" style="width: 44px; height: 44px; border-radius: var(--radius-md); background: ${selectedColor}1A; border: 1.5px solid ${selectedColor}44; display: flex; align-items: center; justify-content: center; color: ${selectedColor}; flex-shrink: 0; transition: all 0.2s ease;">
                ${renderSmartIcon({ icon: selectedIcon, color: selectedColor, size: 24 })}
              </div>
              <div>
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Live Card Preview</div>
                <div id="live-preview-title" style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${existing?.name || 'Category Name'}</div>
                <div id="live-preview-slug" style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">${existing?.slug || 'category-slug'}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <span id="live-preview-icon-name" class="badge badge-primary" style="font-family: var(--font-mono); font-size: 11px;">icon: ${selectedIcon}</span>
            </div>
          </div>

          <!-- Visual Icon Palette Picker -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div>
                <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">Curated Icon Palette</h4>
                <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">Click an icon to assign. Compatible with Lucide SVG & Subscriber Portal.</p>
              </div>
              <span id="selected-icon-label" class="badge badge-neutral" style="font-size: 11px; font-weight: 600;">Selected: ${selectedIcon}</span>
            </div>

            <!-- Category Filter Pills -->
            <div id="icon-cat-filter" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
              <button type="button" class="badge badge-primary icon-filter-btn" data-cat="all" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">All (22)</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Lifestyle" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Lifestyle</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Wellness" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Wellness</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Education" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Education</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Finance" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Finance</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Travel" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Travel</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Creative" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Creative</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Work" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Tech / Work</button>
            </div>

            <!-- Grid of Icons -->
            <div id="icon-picker-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 12px; max-height: 190px; overflow-y: auto; padding: 4px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--bg-surface);">
              ${CURATED_ICON_CATALOG.map(item => {
                const isSelected = item.id === selectedIcon;
                return `
                  <button type="button" class="icon-choice-btn" data-icon="${item.id}" data-cat="${item.category}" data-default-color="${item.color}" data-label="${item.label}" title="${item.label} (${item.category})" style="background: ${isSelected ? item.color + '1A' : 'transparent'}; border: 1.5px solid ${isSelected ? item.color : 'var(--border-subtle)'}; border-radius: var(--radius-sm); padding: 8px 4px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; color: ${isSelected ? item.color : 'var(--text-secondary)'}; font-size: 11px; transition: all 0.15s ease; box-shadow: ${isSelected ? `0 0 0 2px ${item.color}33` : 'none'};">
                    <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
                      ${renderSmartIcon({ icon: item.id, color: isSelected ? item.color : 'currentColor', size: 20 })}
                    </span>
                    <span style="font-size: 9.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${item.label.split('&')[0].trim()}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Custom Icon / Image URL fallback -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" id="custom-icon-input" class="form-input" placeholder="Or enter custom image URL (https://...) or Lucide icon name..." value="${selectedIcon.startsWith('http') || !CURATED_ICON_CATALOG.some(c => c.id === selectedIcon) ? selectedIcon : ''}" style="font-size: 12px; padding: 6px 10px;" />
                <button type="button" id="apply-custom-icon-btn" class="btn btn-secondary" style="font-size: 11.5px; white-space: nowrap; padding: 6px 12px;">Apply Custom</button>
              </div>
              <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">Supports external PNG/SVG URLs or any standard Lucide icon name.</div>
            </div>

            <!-- Theme Color Selector -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-inset); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <label class="form-label" style="margin: 0; font-size: 11.5px;">Theme Accent Color:</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="color" id="cat-color" value="${selectedColor}" style="width: 28px; height: 26px; border: none; border-radius: 4px; cursor: pointer; background: transparent;" />
                  <span id="cat-color-hex" style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-primary); font-weight: 600;">${selectedColor}</span>
                </div>
              </div>
              <div style="display: flex; gap: 5px; align-items: center;">
                ${colorSwatches.map(sw => `
                  <button type="button" class="color-swatch-btn" data-color="${sw}" style="width: 18px; height: 18px; border-radius: 50%; background: ${sw}; border: 1.5px solid ${sw === selectedColor ? '#fff' : 'transparent'}; cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></button>
                `).join('')}
              </div>
              <input type="hidden" id="selected-icon-id" value="${selectedIcon}" />
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
        const iconInput = overlay.querySelector('#selected-icon-id');
        const customIconInput = overlay.querySelector('#custom-icon-input');
        const applyCustomBtn = overlay.querySelector('#apply-custom-icon-btn');
        const colorInput = overlay.querySelector('#cat-color');
        const colorHex = overlay.querySelector('#cat-color-hex');
        const iconLabel = overlay.querySelector('#selected-icon-label');
        const liveIconBadge = overlay.querySelector('#live-icon-badge');
        const liveTitle = overlay.querySelector('#live-preview-title');
        const liveSlug = overlay.querySelector('#live-preview-slug');
        const liveIconName = overlay.querySelector('#live-preview-icon-name');

        const updateAllPreviews = (iconVal, colorVal) => {
          iconInput.value = iconVal;
          colorInput.value = colorVal;
          colorHex.textContent = colorVal;
          iconLabel.textContent = `Selected: ${iconVal}`;
          liveIconName.textContent = `icon: ${iconVal}`;

          // Update live preview badge
          liveIconBadge.style.background = `${colorVal}1A`;
          liveIconBadge.style.borderColor = `${colorVal}44`;
          liveIconBadge.style.color = colorVal;
          liveIconBadge.innerHTML = renderSmartIcon({ icon: iconVal, color: colorVal, size: 24 });

          // Update grid buttons active state
          overlay.querySelectorAll('.icon-choice-btn').forEach(b => {
            const isMatch = b.getAttribute('data-icon') === iconVal;
            b.style.borderColor = isMatch ? colorVal : 'var(--border-subtle)';
            b.style.background = isMatch ? `${colorVal}1A` : 'transparent';
            b.style.color = isMatch ? colorVal : 'var(--text-secondary)';
            b.style.boxShadow = isMatch ? `0 0 0 2px ${colorVal}33` : 'none';
          });
        };

        // Icon clicks from palette
        overlay.querySelectorAll('.icon-choice-btn').forEach(btn => {
          btn.onclick = () => {
            const iconId = btn.getAttribute('data-icon');
            const defaultColor = btn.getAttribute('data-default-color') || colorInput.value;
            customIconInput.value = '';
            updateAllPreviews(iconId, defaultColor);
          };
        });

        // Category filter chips
        overlay.querySelectorAll('.icon-filter-btn').forEach(btn => {
          btn.onclick = () => {
            const targetCat = btn.getAttribute('data-cat');
            overlay.querySelectorAll('.icon-filter-btn').forEach(b => {
              b.className = b === btn ? 'badge badge-primary icon-filter-btn' : 'badge badge-neutral icon-filter-btn';
            });
            overlay.querySelectorAll('.icon-choice-btn').forEach(choice => {
              if (targetCat === 'all' || choice.getAttribute('data-cat') === targetCat) {
                choice.style.display = 'flex';
              } else {
                choice.style.display = 'none';
              }
            });
          };
        });

        // Apply custom URL or icon name
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

        // Color input changes
        colorInput.oninput = () => {
          updateAllPreviews(iconInput.value, colorInput.value);
        };

        // Swatches clicks
        overlay.querySelectorAll('.color-swatch-btn').forEach(sw => {
          sw.onclick = () => {
            const picked = sw.getAttribute('data-color');
            updateAllPreviews(iconInput.value, picked);
          };
        });

        // Name and slug synchronization
        nameInput.addEventListener('input', () => {
          liveTitle.textContent = nameInput.value || 'Category Name';
          if (!existing) {
            const sl = this.slugify(nameInput.value);
            slugInput.value = sl;
            liveSlug.textContent = sl || 'category-slug';
          }
        });

        slugInput.addEventListener('input', () => {
          liveSlug.textContent = slugInput.value || 'category-slug';
        });

        const hiInput = overlay.querySelector('#trans-hi');
        const arInput = overlay.querySelector('#trans-ar');
        const frInput = overlay.querySelector('#trans-fr');
        const esInput = overlay.querySelector('#trans-es');
        const bnInput = overlay.querySelector('#trans-bn');
        const urInput = overlay.querySelector('#trans-ur');

        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = overlay.querySelector('#save-cat-btn');
          btn.disabled = true;
          btn.innerText = 'Saving...';

          const name = nameInput.value.trim();
          const slug = slugInput.value.trim().toLowerCase();

          const translations = {
            _meta: {
              icon: iconInput.value || 'bot',
              color: colorInput.value || '#6366F1',
            }
          };
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
              Toast.success('Category and icon updated successfully');
            } else {
              await ApiService.post('/api/v1/admin/ai/catalog', payload);
              Toast.success('New AI category created with icon & translations');
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
