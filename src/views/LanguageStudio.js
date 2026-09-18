import { ApiService } from '../services/api.js';
import { Toast } from '../components/Toast.js';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const screens = {
  msisdnScreen: ['Login', {title:'Welcome', subtitle:'Enter your mobile number', inputLabel:'Mobile number', inputPlaceholder:'Enter mobile number', buttonText:'Continue', termsText:'Terms and conditions', invalidPhoneText:'Enter a valid mobile number', loadingText:'Please wait…'}],
  otpScreen: ['OTP verification', {title:'Verify OTP', subtitle:'Enter the code sent to your phone', inputPlaceholder:'Verification code', buttonText:'Verify & continue', resendText:'Resend OTP', changeNumberText:'Change number', invalidOtpText:'Invalid code', expiredOtpText:'Code expired', loadingText:'Verifying…'}],
  planScreen: ['Plans & pricing', {title:'Choose your plan', subtitle:'Select a subscription', buttonText:'Subscribe now', backText:'Back', popularText:'Popular', tokensLabel:'AI tokens', messagesLabel:'Messages', durationLabel:'Duration', termsText:'Subscription terms', emptyText:'No plans available', successText:'Subscription activated', errorText:'Subscription failed'}],
  dashboardScreen: ['Dashboard', {welcomeTitle:'Welcome', subtitle:'How can we help?', categoriesTitle:'AI categories', searchPlaceholder:'Search categories', startChatText:'Start chat', lockedText:'Upgrade to unlock', plansButtonText:'View plans', profileText:'My account', logoutText:'Log out', emptyText:'No categories available', quotaLabel:'Messages remaining'}],
  chatScreen: ['AI chat', {title:'AI assistant', subtitle:'Ask a question', inputPlaceholder:'Type your message…', sendButtonText:'Send', sendingText:'Sending…', backText:'Back to AI categories', stopButtonText:'Stop generating', retryText:'Try again', copyText:'Copy', copiedText:'Copied', emptyText:'How can I help you?', errorText:'Something went wrong', quotaExceededText:'You have reached your limit', upgradeText:'Upgrade plan', disclaimerText:'AI can make mistakes'}],
  commonScreen: ['Common & account', {loadingText:'Loading…', errorText:'Something went wrong', retryText:'Try again', cancelText:'Cancel', saveText:'Save', confirmText:'Confirm', languageLabel:'Language', offlineText:'You are offline', sessionExpiredText:'Please log in again', accountTitle:'My account', subscriptionTitle:'My subscription', cancelSubscriptionText:'Cancel subscription'}],
};
function initialDraft(view, language) {
  const draft = {};
  if (language.languageCode === view.operator.defaultLanguage) {
    for (const [screen, fields] of Object.entries(view.theme.flowScreens || {})) {
      for (const [field, value] of Object.entries(fields)) if (typeof value === 'string') draft[`${screen}.${field}`] = value;
    }
  }
  const aliases = {title:'msisdnScreen.title', subtitle:'msisdnScreen.subtitle', enterPhonePrompt:'msisdnScreen.inputPlaceholder', termsNotice:'msisdnScreen.termsText', ctaSubscribe:'planScreen.buttonText', verifyOtpPrompt:'otpScreen.subtitle', resendText:'otpScreen.resendText', welcomeTitle:'dashboardScreen.welcomeTitle'};
  for (const [oldKey, key] of Object.entries(aliases)) if (language.strings?.[oldKey] !== undefined && draft[key] === undefined) draft[key] = language.strings[oldKey];
  return {...draft, ...language.strings};
}
export function mountLanguageStudio(view, container) {
  const host = container.querySelector('#language-studio');
  const language = view.languages.find(l => l.languageCode === view.selectedLanguage);
  const draft = language ? (view.languageDrafts[language.languageCode] ||= initialDraft(view, language)) : {};
  host.innerHTML = `<div class="studio-toolbar"><div><h3>Subscriber screens & language content</h3><p>Choose a language to edit subscriber content. Users select an AI category on the dashboard and chat directly; conversations are not saved.</p></div><label>Content language<select id="studio-language" class="form-select"><option value="">Choose a language…</option>${view.languages.map(l => `<option value="${escapeHtml(l.languageCode)}" ${l === language ? 'selected' : ''}>${escapeHtml(l.languageCode.toUpperCase())}${l.isDefault ? ' · Default' : ''}</option>`).join('')}</select></label><button class="btn btn-secondary" id="studio-create">Create language</button></div>
  ${language ? `<div class="studio-toolbar"><span class="badge badge-primary">Editing ${escapeHtml(language.languageCode.toUpperCase())} · ${language.direction.toUpperCase()}</span><span id="studio-status" role="status">Changes apply only to this language.</span><button class="btn btn-primary" id="studio-save">Save language content</button></div><div class="studio-layout"><div><label class="form-label">Screen<select id="studio-screen" class="form-select">${Object.entries(screens).map(([key,[label]])=>`<option value="${key}" ${view.selectedScreen === key ? 'selected' : ''}>${label}</option>`).join('')}<option value="categories" ${view.selectedScreen === 'categories' ? 'selected' : ''}>AI category names</option><option value="plans" ${view.selectedScreen === 'plans' ? 'selected' : ''}>Plan names & badges</option></select></label><div id="studio-fields"></div></div><aside><h4>Subscriber preview</h4><p>Unsaved content preview · ${escapeHtml(language.languageCode.toUpperCase())}</p><div id="studio-preview" class="studio-phone" dir="${language.direction}"></div></aside></div>` : `<div class="studio-empty">Choose a language above, or create one to start configuring login, OTP, plans, dashboard and chat.</div>`}`;
  host.querySelector('#studio-create').onclick = () => view.openLanguageModal(container);
  host.querySelector('#studio-language').onchange = e => {view.selectedLanguage = e.target.value; mountLanguageStudio(view, container);};
  if (!language) return;
  const draw = () => {
    const screen = view.selectedScreen || 'msisdnScreen';
    let fields;
    if (screen === 'categories') fields = view.catalog.map(c => [`category.${c.id}.name`, c.name, c.translations?.[language.languageCode] || c.name]);
    else if (screen === 'plans') fields = view.plans.flatMap(p => [[`plan.${p.id}.name`, `${p.name} · Display name`, p.name], [`plan.${p.id}.highlightBadge`, `${p.name} · Badge`, p.highlightBadge || '']]);
    else fields = Object.entries(screens[screen][1]).map(([key, sample]) => [`${screen}.${key}`, key.replace(/([A-Z])/g, ' $1'), sample]);
    host.querySelector('#studio-fields').innerHTML = `<p>Enter the exact text subscribers should see. Sample text is a placeholder, not a translation.</p>${screen === 'categories' ? `<div class="table-container"><table><thead><tr><th>AI category</th><th>Language</th><th>Localized name</th></tr></thead><tbody>${fields.map(([key,label,sample])=>`<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(language.languageCode)}</td><td><input class="form-input" data-copy="${key}" value="${escapeHtml(draft[key] ?? '')}" placeholder="${escapeHtml(sample)}"></td></tr>`).join('')}</tbody></table></div>` : fields.map(([key,label,sample])=>`<label class="form-label studio-field">${escapeHtml(label)}<input class="form-input" data-copy="${key}" value="${escapeHtml(draft[key] ?? '')}" placeholder="${escapeHtml(sample)}"></label>`).join('')}`;
    const preview = () => {
      host.querySelector('#studio-preview').innerHTML = `<small>${escapeHtml(view.operator.name)} · ${escapeHtml(language.languageCode.toUpperCase())}</small>${fields.map(([key,label])=>`<div class="studio-preview-item"><small>${escapeHtml(label)}</small><div ${/button|sendButton|cta/i.test(key) ? 'class="studio-preview-button"' : ''}>${escapeHtml(draft[key] ?? '—')}</div></div>`).join('')}`;
      host.querySelector('#studio-preview').style.fontFamily = language.fontFamily;
    };
    host.querySelectorAll('[data-copy]').forEach(input => input.oninput = () => {draft[input.dataset.copy] = input.value; host.querySelector('#studio-status').textContent = 'Unsaved changes'; preview();});
    preview();
  };
  host.querySelector('#studio-screen').onchange = e => {view.selectedScreen = e.target.value; draw();};
  host.querySelector('#studio-save').onclick = async e => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      const strings = {...draft};
      await ApiService.post(`/api/v1/admin/operators/${view.operatorId}/languages`, {languageCode:language.languageCode, direction:language.direction, fontFamily:language.fontFamily, isDefault:language.isDefault, strings});
      language.strings = strings;
      host.querySelector('#studio-status').textContent = 'Language content saved';
      Toast.success(`${language.languageCode.toUpperCase()} content saved`);
    } catch (err) {Toast.error(err.message);} finally {btn.disabled = false;}
  };
  draw();
}
