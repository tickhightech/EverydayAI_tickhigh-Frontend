import { ApiService } from '../services/api.js';
import { Toast } from '../components/Toast.js';
import { icons } from '../components/icons.js';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const screens = {
  introScreen: ['1. Intro / Home (Step 1)', {
    badge: 'Step 1 of 5',
    title: 'YOUR PERSONAL AI ASSISTANT.',
    subtitle: 'Learn, cook, stay healthy, manage money and explore the world — with one AI that truly understands you.',
    buttonText: 'Start My AI Journey ✦',
    secondaryButtonText: 'See Features',
    statsText: '6+ AI Modes · ∞ Chats · 24/7 Live'
  }],
  msisdnScreen: ['2. Mobile Number (Step 2)', {
    badge: 'Step 2 of 5',
    title: 'JUST YOUR NUMBER.',
    subtitle: 'A smarter you starts here.',
    inputPlaceholder: '98765 43210',
    buttonText: 'Continue →',
    footerText: 'Your everyday companion for a smarter tomorrow.'
  }],
  planScreen: ['3. Choose Plan Screen (Step 3)', {
    badge: 'Step 3 of 5',
    title: 'CHOOSE YOUR AI PLAN.',
    subtitle: 'More ways to learn, create, and get things done every day.',
    discountBadge: '13:07 Limited discount',
    buttonText: 'Unlock My AI',
    footerText: '🔒 Secure · Cancel anytime'
  }],
  otpScreen: ['4. Verify OTP (Step 4)', {
    badge: 'Step 4 of 5',
    title: 'Verify OTP',
    subtitle: 'We sent a verification code to your phone',
    buttonText: 'Verify & Proceed',
    resendText: 'Resend OTP'
  }],
  successScreen: ['5. Congratulations (Step 5)', {
    badge: 'Step 5 of 5',
    title: "CONGRATULATIONS! You're all set ✦",
    subtitle: 'You have unlocked AI for Everyday Life. Your personal assistant is ready to help you learn, cook, stay healthy and explore.',
    highlightText: 'Your AI journey starts now',
    buttonText: 'Enter Dashboard →'
  }],
  dashboardScreen: ['6. Dashboard', {
    welcomeTitle: 'Welcome to Everyday AI',
    subtitle: 'Your personal assistant is ready to help you learn, cook, stay healthy and explore.'
  }],
  chatScreen: ['7. AI Chat', {
    inputPlaceholder: 'Ask anything...',
    sendButtonText: 'Send'
  }],
  lowBalanceScreen: ['8. Low Balance', {
    badge: "Step 2 of 2",
    title: "Low Balance",
    subtitle: "Your balance is low. Recharge to continue your Everyday AI journey without interruption.",
    rechargeNote: "A little recharge goes a long way",
    benefit1Text: "Stay connected",
    benefit2Text: "Keep learning without breaks",
    benefit3Text: "Your smarter tomorrow awaits",
    buttonText: "Okay",
    footerText: "Powered by you for a smarter tomorrow",
  }],
  commonScreen: ['Common & Legal', {
    disclaimer: 'Powered by Everyday AI. Carrier billing applies.',
    termsNotice: 'Subscription renews automatically. Cancel anytime as per operator terms.',
    retryText: 'Try again',
    offlineText: 'You are offline'
  }],
  globalStrings: ['Global / Brand Copy', {
    title: 'Airtel India AI Studio',
    subtitle: 'Ask anything on your Airtel India connection',
    disclaimer: 'Powered by {{operator_name}}. Carrier billing applies.',
    termsNotice: 'Subscription renews automatically. Cancel anytime as per operator terms.'
  }],
};

function initialDraft(view, language) {
  const draft = {};
  const langCode = (language.languageCode || '').trim();
  const defaultLang = (view.languages || []).find(l => l.isDefault) || view.languages?.[0];
  const isDefault = Boolean(language.isDefault || langCode === (defaultLang?.languageCode || '').trim());

  // 1. Copy already saved strings from language.strings
  for (const [oldKey, val] of Object.entries(language.strings || {})) {
    if (typeof val === 'string' && !oldKey.endsWith('Url') && !oldKey.endsWith('Banner')) {
      if (!['enterPhonePrompt', 'verifyOtpPrompt', 'ctaSubscribe'].includes(oldKey)) {
        draft[oldKey] = val;
      }
    }
  }

  // 2. Pre-populate planScreen headers if missing
  const planScreenDefaults = screens.planScreen?.[1] || {};
  for (const [fKey, defVal] of Object.entries(planScreenDefaults)) {
    const key = `planScreen.${fKey}`;
    if (!draft[key]) {
      draft[key] = isDefault ? defVal : (defaultLang?.strings?.[key] || defVal);
    }
  }

  // 3. Pre-populate AI Categories
  (view.catalog || []).forEach(c => {
    const key = `category.${c.id}.name`;
    if (!draft[key]) {
      const savedTrans = c.translations?.[langCode];
      draft[key] = savedTrans || (isDefault ? c.name : (c.translations?.['en'] || c.name || ''));
    }
  });

  // 4. Pre-populate Plans
  const plansList = (view.plans && view.plans.length > 0) ? view.plans : [
    { id: 'daily-pack', name: 'Daily Power Pass', slug: 'daily-pack', periodType: 'daily', price: '5', currencyCode: 'INR', isHighlighted: true, highlightBadge: 'Most Popular', maxTokens: 10000 },
    { id: 'weekly-pack', name: 'Weekly AI Pro', slug: 'weekly-pack', periodType: 'weekly', price: '25', currencyCode: 'INR', isHighlighted: false, highlightBadge: 'Best Value', maxTokens: 80000 },
    { id: 'monthly-pack', name: 'Monthly Unlimited', slug: 'monthly-pack', periodType: 'monthly', price: '79', currencyCode: 'INR', isHighlighted: false, highlightBadge: 'Power User', maxTokens: 400000 },
  ];

  plansList.forEach(p => {
    const defaultPeriod = p.periodType || 'daily';
    const defaultFeatures = (Array.isArray(p.features) && p.features.length > 0)
      ? p.features.join('\n')
      : (typeof p.features === 'string' && p.features.trim()
        ? p.features
        : `${(p.maxTokens || 10000).toLocaleString()} AI Tokens per ${defaultPeriod}\nDirect Carrier Billing (SIM)\nUltra-fast AI models\nUnlimited 24/7 AI chat`);

    const nameKey = `plan.${p.id}.name`;
    const badgeKey = `plan.${p.id}.highlightBadge`;
    const periodKey = `plan.${p.id}.periodLabel`;
    const subtitleKey = `plan.${p.id}.subtitle`;
    const featuresKey = `plan.${p.id}.features`;
    const btnKey = `plan.${p.id}.buttonText`;

    const slugNameKey = `plan.${p.slug}.name`;
    const slugBadgeKey = `plan.${p.slug}.highlightBadge`;
    const slugPeriodKey = `plan.${p.slug}.periodLabel`;
    const slugSubtitleKey = `plan.${p.slug}.subtitle`;
    const slugFeaturesKey = `plan.${p.slug}.features`;
    const slugBtnKey = `plan.${p.slug}.buttonText`;

    if (!draft[nameKey]) {
      draft[nameKey] = draft[slugNameKey] || language.strings?.[slugNameKey] || (isDefault ? p.name : (defaultLang?.strings?.[nameKey] || defaultLang?.strings?.[slugNameKey] || p.name));
    }
    if (!draft[badgeKey]) {
      const b = draft[slugBadgeKey] || language.strings?.[slugBadgeKey] || (isDefault ? (p.highlightBadge || '') : (defaultLang?.strings?.[badgeKey] || defaultLang?.strings?.[slugBadgeKey] || p.highlightBadge || ''));
      if (b) draft[badgeKey] = b;
    }
    if (!draft[periodKey]) {
      draft[periodKey] = draft[slugPeriodKey] || language.strings?.[slugPeriodKey] || (isDefault ? defaultPeriod : (defaultLang?.strings?.[periodKey] || defaultLang?.strings?.[slugPeriodKey] || defaultPeriod));
    }
    if (!draft[subtitleKey]) {
      const sub = draft[slugSubtitleKey] || language.strings?.[slugSubtitleKey] || (isDefault ? '' : (defaultLang?.strings?.[subtitleKey] || defaultLang?.strings?.[slugSubtitleKey] || ''));
      if (sub) draft[subtitleKey] = sub;
    }
    if (!draft[featuresKey]) {
      draft[featuresKey] = draft[slugFeaturesKey] || language.strings?.[slugFeaturesKey] || (isDefault ? defaultFeatures : (defaultLang?.strings?.[featuresKey] || defaultLang?.strings?.[slugFeaturesKey] || defaultFeatures));
    }
    if (!draft[btnKey]) {
      const btn = draft[slugBtnKey] || language.strings?.[slugBtnKey] || (isDefault ? '' : (defaultLang?.strings?.[btnKey] || defaultLang?.strings?.[slugBtnKey] || ''));
      if (btn) draft[btnKey] = btn;
    }
  });

  // 5. Pre-populate standard screens for default language
  if (isDefault) {
    for (const [sKey, [, schema]] of Object.entries(screens)) {
      for (const [fKey, defVal] of Object.entries(schema)) {
        const fullKey = sKey === 'globalStrings' ? fKey : `${sKey}.${fKey}`;
        if (draft[fullKey] === undefined) {
          draft[fullKey] = defVal;
        }
      }
    }
  }

  return draft;
}

export function mountLanguageStudio(view, container) {
  const host = container.querySelector('#language-studio');
  if (!host) return;

  const language = view.languages.find(l => l.languageCode.trim() === (view.selectedLanguage || '').trim());
  const langCode = language ? language.languageCode.trim() : '';
  const draft = language ? (view.languageDrafts[langCode] ||= initialDraft(view, language)) : {};
  if (language) {
    const init = initialDraft(view, language);
    for (const [k, v] of Object.entries(init)) {
      if (draft[k] === undefined) {
        draft[k] = v;
      }
    }
  }

  host.innerHTML = `
    <div class="studio-toolbar">
      <div>
        <h3>Subscriber screens &amp; language content</h3>
        <p>Configure copy for the 5-step subscriber journey (Intro → Phone → Plan → OTP → Success → Dashboard &amp; Chat), the Low Balance screen, or customize individual plan offerings.</p>
      </div>
      <label>Content language
        <select id="studio-language" class="form-select">
          <option value="">Choose a language…</option>
          ${view.languages.map(l => `<option value="${escapeHtml(l.languageCode.trim())}" ${l === language ? 'selected' : ''}>${escapeHtml(l.languageCode.trim().toUpperCase())}${l.isDefault ? ' · Default' : ''}</option>`).join('')}
        </select>
      </label>
      <button class="btn btn-secondary" id="studio-create">Create language</button>
    </div>

    ${language ? `
      <div class="studio-toolbar">
        <span class="badge badge-primary">Editing ${escapeHtml(langCode.toUpperCase())} · ${language.direction.toUpperCase()}</span>
        <span id="studio-status" role="status">Changes apply only to this language.</span>
        <button class="btn btn-primary" id="studio-save">Save language content</button>
      </div>

      <div class="studio-layout">
        <div>
          <label class="form-label">Screen or Section
            <select id="studio-screen" class="form-select">
              ${Object.entries(screens).map(([key, [label]]) => `<option value="${key}" ${view.selectedScreen === key ? 'selected' : ''}>${label}</option>`).join('')}
              <option value="plans" ${view.selectedScreen === 'plans' ? 'selected' : ''}>★ Plan names, badges &amp; benefits (Plan-wise)</option>
              <option value="categories" ${view.selectedScreen === 'categories' ? 'selected' : ''}>AI category names</option>
            </select>
          </label>
          <div id="studio-fields"></div>
        </div>

        <aside>
          <h4>Subscriber preview</h4>
          <p>Unsaved content preview · ${escapeHtml(langCode.toUpperCase())}</p>
          <div id="studio-preview" class="studio-phone" dir="${language.direction}"></div>
        </aside>
      </div>
    ` : `
      <div class="studio-empty">Choose a language above, or create one to start configuring screens and copy.</div>
    `}
  `;

  host.querySelector('#studio-create').onclick = () => view.openLanguageModal(container);
  host.querySelector('#studio-language').onchange = e => {
    view.selectedLanguage = e.target.value.trim();
    mountLanguageStudio(view, container);
  };

  if (!language) return;

  const defaultLang = (view.languages || []).find(l => l.isDefault) || view.languages?.[0];
  const isDefault = Boolean(language.isDefault || langCode === (defaultLang?.languageCode || '').trim());

  const draw = () => {
    const screen = view.selectedScreen || 'introScreen';

    // 1. AI CATEGORIES SECTION
    if (screen === 'categories') {
      const standardFields = (view.catalog || []).map(c => {
        const key = `category.${c.id}.name`;
        const transVal = draft[key] || c.translations?.[langCode] || (isDefault ? c.name : (c.translations?.['en'] || c.name));
        draft[key] = transVal;
        return [key, c.name, transVal];
      });

      host.querySelector('#studio-fields').innerHTML = `
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Localize AI category names shown across the portal for subscribers.</p>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>AI category</th><th>Language</th><th>Localized name</th></tr>
            </thead>
            <tbody>
              ${standardFields.map(([key, label, currentVal]) => `
                <tr>
                  <td>${escapeHtml(label)}</td>
                  <td>${escapeHtml(langCode.toUpperCase())}</td>
                  <td><input class="form-input" data-copy="${escapeHtml(key)}" value="${escapeHtml(currentVal)}" placeholder="${escapeHtml(label)}"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // 2. SUBSCRIPTION PLANS & BENEFITS (PLAN-WISE SECTION)
    else if (screen === 'plans') {
      const plansList = (view.plans && view.plans.length > 0) ? view.plans : [
        { id: 'daily-pack', name: 'Daily Power Pass', slug: 'daily-pack', periodType: 'daily', price: '5', currencyCode: 'INR', isHighlighted: true, highlightBadge: 'Most Popular', maxTokens: 10000 },
        { id: 'weekly-pack', name: 'Weekly AI Pro', slug: 'weekly-pack', periodType: 'weekly', price: '25', currencyCode: 'INR', isHighlighted: false, highlightBadge: 'Best Value', maxTokens: 80000 },
        { id: 'monthly-pack', name: 'Monthly Unlimited', slug: 'monthly-pack', periodType: 'monthly', price: '79', currencyCode: 'INR', isHighlighted: false, highlightBadge: 'Power User', maxTokens: 400000 },
      ];

      const planScreenDefaults = screens.planScreen?.[1] || {};
      const planTitle = draft['planScreen.title'] || (isDefault ? planScreenDefaults.title : (defaultLang?.strings?.['planScreen.title'] || planScreenDefaults.title || 'CHOOSE YOUR AI PLAN.'));
      const planSubtitle = draft['planScreen.subtitle'] || (isDefault ? planScreenDefaults.subtitle : (defaultLang?.strings?.['planScreen.subtitle'] || planScreenDefaults.subtitle || 'More ways to learn, create, and get things done every day.'));
      const planDiscount = draft['planScreen.discountBadge'] || (isDefault ? planScreenDefaults.discountBadge : (defaultLang?.strings?.['planScreen.discountBadge'] || planScreenDefaults.discountBadge || '13:07 Limited discount'));
      const planBtn = draft['planScreen.buttonText'] || (isDefault ? planScreenDefaults.buttonText : (defaultLang?.strings?.['planScreen.buttonText'] || planScreenDefaults.buttonText || 'Unlock My AI / Subscribe Now'));
      const planFooter = draft['planScreen.footerText'] || (isDefault ? planScreenDefaults.footerText : (defaultLang?.strings?.['planScreen.footerText'] || planScreenDefaults.footerText || '🔒 Secure · Cancel anytime'));

      draft['planScreen.title'] = planTitle;
      draft['planScreen.subtitle'] = planSubtitle;
      draft['planScreen.discountBadge'] = planDiscount;
      draft['planScreen.buttonText'] = planBtn;
      draft['planScreen.footerText'] = planFooter;

      host.querySelector('#studio-fields').innerHTML = `
        <div style="margin-bottom: 16px;">
          <div class="flex-between" style="align-items: flex-start; margin-bottom: 12px;">
            <div>
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0;">Subscription Plans &amp; Badges Localizations</h4>
              <p style="font-size: 11.5px; color: var(--text-secondary); margin: 0;">Customize plan names, highlight tags, billing period labels, and bullet benefits plan-by-plan for <strong>${escapeHtml(langCode.toUpperCase())}</strong>.</p>
            </div>
          </div>

          <!-- Plan Filter Pills -->
          <div id="plan-filter-pills" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
            <button type="button" class="badge badge-primary plan-filter-pill" data-plan-target="all" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 10px;">All Plans (${plansList.length})</button>
            ${plansList.map(p => `
              <button type="button" class="badge badge-neutral plan-filter-pill" data-plan-target="${p.id}" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 10px;">${escapeHtml(draft[`plan.${p.id}.name`] || draft[`plan.${p.slug}.name`] || p.name)}</button>
            `).join('')}
          </div>

          <!-- General Plan Screen Copy Box -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>📱 Plan Screen General Headers &amp; Buttons</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Screen Title</label>
                <input class="form-input" data-copy="planScreen.title" value="${escapeHtml(planTitle)}" placeholder="CHOOSE YOUR AI PLAN.">
              </div>
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Screen Subtitle</label>
                <input class="form-input" data-copy="planScreen.subtitle" value="${escapeHtml(planSubtitle)}" placeholder="More ways to learn, create, and get things done every day.">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Discount / Promo Badge</label>
                <input class="form-input" data-copy="planScreen.discountBadge" value="${escapeHtml(planDiscount)}" placeholder="13:07 Limited discount">
              </div>
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Main Subscribe Button CTA</label>
                <input class="form-input" data-copy="planScreen.buttonText" value="${escapeHtml(planBtn)}" placeholder="Unlock My AI / Subscribe Now">
              </div>
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Footer Security Notice</label>
                <input class="form-input" data-copy="planScreen.footerText" value="${escapeHtml(planFooter)}" placeholder="🔒 Secure · Cancel anytime">
              </div>
            </div>
          </div>

          <!-- Plan-by-Plan Cards Container -->
          <div id="plan-cards-container">
            ${plansList.map(p => {
              const nameKey = `plan.${p.id}.name`;
              const badgeKey = `plan.${p.id}.highlightBadge`;
              const periodKey = `plan.${p.id}.periodLabel`;
              const subtitleKey = `plan.${p.id}.subtitle`;
              const featuresKey = `plan.${p.id}.features`;
              const btnKey = `plan.${p.id}.buttonText`;

              const slugNameKey = `plan.${p.slug}.name`;
              const slugBadgeKey = `plan.${p.slug}.highlightBadge`;
              const slugPeriodKey = `plan.${p.slug}.periodLabel`;
              const slugSubtitleKey = `plan.${p.slug}.subtitle`;
              const slugFeaturesKey = `plan.${p.slug}.features`;
              const slugBtnKey = `plan.${p.slug}.buttonText`;

              const defaultPeriod = p.periodType || 'day';
              const defaultPrice = `${p.currencyCode === 'INR' || !p.currencyCode ? '₹' : '$'}${parseFloat(p.price)}`;
              const defaultFeatures = (Array.isArray(p.features) && p.features.length > 0)
                ? p.features.join('\n')
                : (typeof p.features === 'string' && p.features.trim()
                  ? p.features
                  : `${(p.maxTokens || 10000).toLocaleString()} AI Tokens per ${defaultPeriod}\nDirect Carrier Billing (SIM)\nUltra-fast AI models\nUnlimited 24/7 AI chat`);

              const currentName = draft[nameKey] || draft[slugNameKey] || language.strings?.[nameKey] || language.strings?.[slugNameKey] || (isDefault ? p.name : (defaultLang?.strings?.[nameKey] || defaultLang?.strings?.[slugNameKey] || p.name));
              const currentBadge = draft[badgeKey] || draft[slugBadgeKey] || language.strings?.[badgeKey] || language.strings?.[slugBadgeKey] || (isDefault ? (p.highlightBadge || '') : (defaultLang?.strings?.[badgeKey] || defaultLang?.strings?.[slugBadgeKey] || p.highlightBadge || ''));
              const currentPeriod = draft[periodKey] || draft[slugPeriodKey] || language.strings?.[periodKey] || language.strings?.[slugPeriodKey] || (isDefault ? defaultPeriod : (defaultLang?.strings?.[periodKey] || defaultLang?.strings?.[slugPeriodKey] || defaultPeriod));
              const currentSubtitle = draft[subtitleKey] || draft[slugSubtitleKey] || language.strings?.[subtitleKey] || language.strings?.[slugSubtitleKey] || (isDefault ? '' : (defaultLang?.strings?.[subtitleKey] || defaultLang?.strings?.[slugSubtitleKey] || ''));
              const currentFeatures = draft[featuresKey] || draft[slugFeaturesKey] || language.strings?.[featuresKey] || language.strings?.[slugFeaturesKey] || (isDefault ? defaultFeatures : (defaultLang?.strings?.[featuresKey] || defaultLang?.strings?.[slugFeaturesKey] || defaultFeatures));
              const currentBtn = draft[btnKey] || draft[slugBtnKey] || language.strings?.[btnKey] || language.strings?.[slugBtnKey] || (isDefault ? '' : (defaultLang?.strings?.[btnKey] || defaultLang?.strings?.[slugBtnKey] || ''));

              draft[nameKey] = currentName;
              if (currentBadge) draft[badgeKey] = currentBadge;
              draft[periodKey] = currentPeriod;
              if (currentSubtitle) draft[subtitleKey] = currentSubtitle;
              draft[featuresKey] = currentFeatures;
              if (currentBtn) draft[btnKey] = currentBtn;

              return `
                <div class="plan-edit-card card mb-4" data-plan-id="${p.id}" style="padding: 16px; background: var(--bg-card); border: 1.5px solid ${p.isHighlighted ? 'var(--primary, #6C5CE7)' : 'var(--border-subtle)'}; border-radius: var(--radius-md);">
                  <!-- Plan Card Header -->
                  <div class="flex-between mb-3" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--primary-subtle, rgba(108,92,231,0.15)); border: 1px solid var(--primary, #6C5CE7); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary, #6C5CE7); font-size: 13px;">
                        ${defaultPrice.charAt(0)}
                      </div>
                      <div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <strong style="font-size: 14px; color: var(--text-primary);">${escapeHtml(p.name)}</strong>
                          <span class="badge badge-cyan" style="font-family: var(--font-mono); font-size: 10px;">${escapeHtml(p.slug)}</span>
                          ${p.isHighlighted ? '<span class="badge badge-primary" style="font-size: 9.5px;">★ Highlighted Plan</span>' : ''}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">
                          Default pricing: <strong>${escapeHtml(defaultPrice)} / ${escapeHtml(defaultPeriod)}</strong> · ${(p.maxTokens || 10000).toLocaleString()} Tokens
                        </div>
                      </div>
                    </div>
                    <div>
                      <span class="badge badge-neutral" style="font-family: var(--font-mono); font-size: 10px;">ID: ${p.id.slice(0, 8)}...</span>
                    </div>
                  </div>

                  <!-- Row 1: Localized Name & Badge -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                        Plan Display Name (${escapeHtml(langCode.toUpperCase())}) *
                      </label>
                      <input class="form-input" data-copy="${escapeHtml(nameKey)}" value="${escapeHtml(currentName)}" placeholder="${escapeHtml(p.name)}" style="font-size: 12.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Primary name displayed on the card (e.g. डेली पावर पास)</div>
                    </div>

                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                        Highlight Tag / Badge
                      </label>
                      <input class="form-input" data-copy="${escapeHtml(badgeKey)}" value="${escapeHtml(currentBadge)}" placeholder="${escapeHtml(p.highlightBadge || 'e.g. Most Popular / सबसे लोकप्रिय')}" style="font-size: 12.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Corner promotional ribbon (e.g. Best Value, 50% OFF)</div>
                    </div>
                  </div>

                  <!-- Row 2: Period Unit Label & Subtitle -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                        Period Unit Label (e.g. दिन, सप्ताह, माह, daily)
                      </label>
                      <input class="form-input" data-copy="${escapeHtml(periodKey)}" value="${escapeHtml(currentPeriod)}" placeholder="${escapeHtml(defaultPeriod)}" style="font-size: 12.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Suffix after price, e.g. ₹5 / [दिन]</div>
                    </div>

                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                        Plan Tagline / Subtitle (Optional)
                      </label>
                      <input class="form-input" data-copy="${escapeHtml(subtitleKey)}" value="${escapeHtml(currentSubtitle)}" placeholder="e.g. Unlimited AI queries &amp; everyday help" style="font-size: 12.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Short tagline shown under plan name</div>
                    </div>
                  </div>

                  <!-- Row 3: Bullet Features List -->
                  <div class="form-group" style="margin-bottom: 10px;">
                    <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px; display: flex; justify-content: space-between;">
                      <span>Bullet Features &amp; Inclusions (One feature per line)</span>
                      <span style="color: var(--text-muted); font-size: 10px;">Newline = separate bullet</span>
                    </label>
                    <textarea class="form-input" data-copy="${escapeHtml(featuresKey)}" rows="3" placeholder="${(p.maxTokens || 10000).toLocaleString()} AI Tokens per ${defaultPeriod}&#10;Direct Carrier Billing (SIM)&#10;Ultra-fast AI models&#10;Unlimited 24/7 AI chat" style="font-size: 12px; line-height: 1.45; resize: vertical;">${escapeHtml(currentFeatures)}</textarea>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Each line becomes a green checkmark feature bullet on the subscriber portal.</div>
                  </div>

                  <!-- Row 4: Plan-specific Button Text -->
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                      Plan CTA Button Text (Optional Override)
                    </label>
                    <input class="form-input" data-copy="${escapeHtml(btnKey)}" value="${escapeHtml(currentBtn)}" placeholder="e.g. Choose ${escapeHtml(p.name)} / अभी सब्सक्राइब करें" style="font-size: 12.5px;">
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // Filter pills behavior
      host.querySelectorAll('.plan-filter-pill').forEach(btn => {
        btn.onclick = () => {
          const target = btn.getAttribute('data-plan-target');
          host.querySelectorAll('.plan-filter-pill').forEach(b => {
            b.className = b === btn ? 'badge badge-primary plan-filter-pill' : 'badge badge-neutral plan-filter-pill';
          });
          host.querySelectorAll('.plan-edit-card').forEach(card => {
            if (target === 'all' || card.getAttribute('data-plan-id') === target) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        };
      });
    }

    // 3. GLOBAL STRINGS & OTHER SCREENS
    else {
      let standardFields = [];
      let customFields = [];

      if (screen === 'globalStrings') {
        standardFields = Object.entries(screens.globalStrings[1]).map(([key, sample]) => [
          key,
          key.replace(/([A-Z])/g, ' $1'),
          sample,
        ]);
        const stdKeys = new Set(Object.keys(screens.globalStrings[1]));
        for (const [k, val] of Object.entries(draft)) {
          if (!k.includes('.') && !stdKeys.has(k) && typeof val === 'string') {
            customFields.push([k, k]);
          }
        }
      } else {
        const screenSchema = screens[screen]?.[1] || {};
        standardFields = Object.entries(screenSchema).map(([key, sample]) => [
          `${screen}.${key}`,
          key.replace(/([A-Z])/g, ' $1'),
          sample,
        ]);
        const prefix = `${screen}.`;
        for (const [k, val] of Object.entries(draft)) {
          if (k.startsWith(prefix)) {
            const fieldName = k.slice(prefix.length);
            if (!screenSchema[fieldName] && typeof val === 'string') {
              customFields.push([k, fieldName]);
            }
          }
        }
      }

      host.querySelector('#studio-fields').innerHTML = `
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Default text for this screen. Leave empty to use system default.</p>
        ${standardFields.map(([key, label, sample]) => `
          <label class="form-label studio-field" style="margin-bottom: 10px;">
            <span style="font-size: 11.5px; font-weight: 600; text-transform: capitalize;">${escapeHtml(label)}</span>
            <input class="form-input" data-copy="${escapeHtml(key)}" value="${escapeHtml(draft[key] ?? '')}" placeholder="${escapeHtml(sample)}">
          </label>
        `).join('')}

        <!-- Custom / Dynamic Extra Fields Section -->
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin: 0;">Extra / Custom Fields for this Screen</h4>
            <span style="font-size: 10.5px; color: var(--text-muted);">${customFields.length} custom key${customFields.length === 1 ? '' : 's'}</span>
          </div>

          ${customFields.length > 0 ? customFields.map(([key, fieldName]) => `
            <div style="display: flex; align-items: flex-end; gap: 8px; margin-bottom: 8px;">
              <div style="flex: 1;">
                <label class="form-label" style="font-size: 11px; margin-bottom: 3px;">
                  <span class="badge badge-primary" style="font-family: var(--font-mono); font-size: 10px;">${escapeHtml(fieldName)}</span>
                </label>
                <input class="form-input" data-copy="${escapeHtml(key)}" value="${escapeHtml(draft[key] ?? '')}" placeholder="Enter text...">
              </div>
              <button type="button" class="btn btn-danger btn-icon delete-custom-field-btn" data-del-key="${escapeHtml(key)}" title="Remove field" style="width: 34px; height: 34px; flex-shrink: 0;">
                ${icons.trash || '✕'}
              </button>
            </div>
          `).join('') : '<p style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-bottom: 8px;">No extra custom fields added yet.</p>'}

          <!-- Add Key-Value Box -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 10px;">
            <label style="font-size: 11.5px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 6px;">+ Add New Key-Value Pair (Extra UI Text)</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="custom-field-key" class="form-input" placeholder="Field name (e.g. promoNotice, heroNote)" style="flex: 1; font-size: 12px;" />
              <input type="text" id="custom-field-val" class="form-input" placeholder="Field text value" style="flex: 1.5; font-size: 12px;" />
              <button type="button" id="add-custom-field-btn" class="btn btn-secondary" style="flex-shrink: 0; font-size: 12px; padding: 0 12px;">+ Add Key</button>
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 5px;">
              This key will be automatically sent in <code>screens.${screen}</code> to the subscriber UI.
            </div>
          </div>
        </div>
      `;

      const addBtn = host.querySelector('#add-custom-field-btn');
      if (addBtn) {
        addBtn.onclick = () => {
          const keyInput = host.querySelector('#custom-field-key');
          const valInput = host.querySelector('#custom-field-val');
          let rawKey = keyInput?.value?.trim() || '';
          const val = valInput?.value?.trim() || '';

          if (!rawKey) {
            Toast.error('Please enter a field name');
            return;
          }
          rawKey = rawKey.replace(/[^a-zA-Z0-9_]/g, '');
          if (!/^[a-zA-Z]/.test(rawKey)) {
            Toast.error('Field name must start with a letter');
            return;
          }

          const fullKey = screen === 'globalStrings' ? rawKey : `${screen}.${rawKey}`;
          draft[fullKey] = val;
          host.querySelector('#studio-status').textContent = 'Unsaved changes';
          draw();
          Toast.success(`Field "${rawKey}" added! Click "Save language content" to persist.`);
        };
      }

      host.querySelectorAll('.delete-custom-field-btn').forEach(btn => {
        btn.onclick = () => {
          const delKey = btn.getAttribute('data-del-key');
          delete draft[delKey];
          host.querySelector('#studio-status').textContent = 'Unsaved changes';
          draw();
          Toast.success('Custom field removed');
        };
      });
    }

    // 4. PREVIEW MOCKUP RENDERER
    const preview = () => {
      const screen = view.selectedScreen || 'introScreen';

      if (screen === 'plans' || screen === 'planScreen') {
        const plansList = (view.plans && view.plans.length > 0) ? view.plans : [
          { id: 'daily-pack', name: 'Daily Power Pass', slug: 'daily-pack', periodType: 'daily', price: '5', currencyCode: 'INR', isHighlighted: true, highlightBadge: 'Most Popular', maxTokens: 10000 },
          { id: 'weekly-pack', name: 'Weekly AI Pro', slug: 'weekly-pack', periodType: 'weekly', price: '25', currencyCode: 'INR', isHighlighted: false, highlightBadge: 'Best Value', maxTokens: 80000 },
          { id: 'monthly-pack', name: 'Monthly Unlimited', slug: 'monthly-pack', periodType: 'monthly', price: '79', currencyCode: 'INR', isHighlighted: false, highlightBadge: 'Power User', maxTokens: 400000 },
        ];

        const planCardsPreview = plansList.map(p => {
          const name = draft[`plan.${p.id}.name`] || p.name;
          const badge = draft[`plan.${p.id}.highlightBadge`] || p.highlightBadge || '';
          const period = draft[`plan.${p.id}.periodLabel`] || p.periodType;
          const subtitle = draft[`plan.${p.id}.subtitle`] || '';
          const rawFeatures = draft[`plan.${p.id}.features`] || '';
          const features = rawFeatures ? rawFeatures.split('\n').map(s => s.trim()).filter(Boolean) : [
            `${(p.maxTokens || 10000).toLocaleString()} AI Tokens per ${period}`,
            'Direct Carrier Billing (SIM)',
            'Ultra-fast AI models'
          ];
          const isHigh = p.isHighlighted;
          const curr = (p.currencyCode === 'INR' || !p.currencyCode) ? '₹' : '$';

          return `
            <div style="background: ${isHigh ? 'var(--primary-subtle, #251B4E)' : 'var(--bg-card, #1A1A2E)'}; border: 1.5px solid ${isHigh ? 'var(--primary, #6C5CE7)' : 'var(--border-subtle, #333)'}; border-radius: 10px; padding: 10px; margin-bottom: 10px; position: relative;">
              ${badge ? `<span style="position: absolute; top: -8px; right: 10px; background: var(--primary, #6C5CE7); color: #fff; font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 10px;">${escapeHtml(badge)}</span>` : ''}
              <div style="font-size: 12px; font-weight: 700; color: #fff;">${escapeHtml(name)}</div>
              ${subtitle ? `<div style="font-size: 9.5px; color: #aaa; margin-top: 1px;">${escapeHtml(subtitle)}</div>` : ''}
              <div style="font-size: 15px; font-weight: 800; color: var(--primary, #6C5CE7); margin: 4px 0;">${escapeHtml(curr)}${parseFloat(p.price)} <span style="font-size: 10px; font-weight: normal; color: #aaa;">/ ${escapeHtml(period)}</span></div>
              <ul style="margin: 4px 0 0 0; padding-left: 14px; font-size: 10px; color: #bbb; line-height: 1.35;">
                ${features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
              </ul>
            </div>
          `;
        }).join('');

        host.querySelector('#studio-preview').innerHTML = `
          <small>${escapeHtml(view.operator?.name || 'Everyday AI')} · ${escapeHtml(langCode.toUpperCase())}</small>
          <div style="margin-top: 8px;">
            ${draft['planScreen.discountBadge'] ? `<span style="display: inline-block; background: rgba(235, 77, 75, 0.2); color: #ff7979; border: 1px solid rgba(235, 77, 75, 0.4); font-size: 9.5px; padding: 2px 7px; border-radius: 4px; margin-bottom: 6px;">${escapeHtml(draft['planScreen.discountBadge'])}</span>` : ''}
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #fff; margin-bottom: 3px;">${escapeHtml(draft['planScreen.title'] || 'CHOOSE YOUR PLAN')}</div>
            <div style="font-size: 10px; color: #aaa; margin-bottom: 10px;">${escapeHtml(draft['planScreen.subtitle'] || 'Select a pack for unlimited AI queries')}</div>
            ${planCardsPreview}
            <div class="studio-preview-button" style="margin-top: 8px;">${escapeHtml(draft['planScreen.buttonText'] || 'Subscribe Now')}</div>
            ${draft['planScreen.footerText'] ? `<div style="font-size: 9px; color: #888; text-align: center; margin-top: 8px;">${escapeHtml(draft['planScreen.footerText'])}</div>` : ''}
          </div>
        `;
        host.querySelector('#studio-preview').style.fontFamily = language.fontFamily || 'Inter';
        return;
      }

      const screenSchema = screens[screen]?.[1] || {};
      const allFields = Object.entries(screenSchema).map(([key, sample]) => [`${screen}.${key}`, key.replace(/([A-Z])/g, ' $1'), sample]);
      for (const [k, val] of Object.entries(draft)) {
        if (k.startsWith(`${screen}.`) && !screenSchema[k.slice(screen.length + 1)] && typeof val === 'string') {
          allFields.push([k, k.slice(screen.length + 1)]);
        }
      }

      host.querySelector('#studio-preview').innerHTML = `
        <small>${escapeHtml(view.operator?.name || 'Everyday AI')} · ${escapeHtml(langCode.toUpperCase())}</small>
        ${allFields.map(([key, label]) => `
          <div class="studio-preview-item">
            <small>${escapeHtml(label)}</small>
            <div ${/button|sendButton|cta/i.test(key) ? 'class="studio-preview-button"' : ''}>
              ${escapeHtml(draft[key] ?? '—')}
            </div>
          </div>
        `).join('')}
      `;
      host.querySelector('#studio-preview').style.fontFamily = language.fontFamily || 'Inter';
    };

    // 5. ATTACH REAL-TIME DATA BINDING TO ALL INPUTS & TEXTAREAS
    host.querySelectorAll('[data-copy]').forEach(input => {
      input.oninput = () => {
        draft[input.dataset.copy] = input.value;
        host.querySelector('#studio-status').textContent = 'Unsaved changes';
        preview();
      };
    });

    preview();
  };

  host.querySelector('#studio-screen').onchange = e => {
    view.selectedScreen = e.target.value;
    draw();
  };

  host.querySelector('#studio-save').onclick = async e => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerText = 'Saving Content...';

    try {
      const strings = {};
      for (const [k, v] of Object.entries(draft)) {
        if (typeof v === 'string' && v.trim() && !k.endsWith('Url') && !k.endsWith('Banner')) {
          if (!['enterPhonePrompt', 'verifyOtpPrompt', 'ctaSubscribe'].includes(k)) {
            strings[k] = v.trim();
          }
        }
      }

      await ApiService.post(`/api/v1/admin/operators/${view.operatorId}/languages`, {
        languageCode: langCode,
        direction: language.direction,
        fontFamily: language.fontFamily,
        isDefault: language.isDefault,
        strings,
      });

      language.strings = strings;
      host.querySelector('#studio-status').textContent = 'Language content saved';
      Toast.success(`${langCode.toUpperCase()} plan & screen content saved successfully`);
    } catch (err) {
      Toast.error(err.message || 'Failed to save language content');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Save language content';
    }
  };

  draw();
}
