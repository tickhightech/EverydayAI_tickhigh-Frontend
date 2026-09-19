# Operator language studio

Open Operators → an operator → SDUI Screens & Theme. Select an existing language or create its two-letter code and typography first. Screen fields save to that operator's language dictionary; switching languages keeps in-progress drafts. Blank placeholders are examples, not generated translations.

Editable sections include login, OTP, plans, dashboard, AI chat, low balance, common/account text, AI category names and plan names/badges. Category assignments also display names per language. Shared branding applies across languages. Plans & Pricing is embedded in operator detail, with operator scope fixed for all plan actions. There is one portal per operator and no campaign entity. Subscriber flow: dashboard AI category list → select an AI → chat page. Messages are not stored as chat history. There are no saved conversations, history, new-conversation, or delete-conversation controls.

## Subscriber API contract

`GET /api/v1/portal/init?lang=hi` and `GET /api/v1/portal/strings?lang=hi` return resolved `screens`, localized `plans`, and localized `agents`. Existing flat dictionary keys are retained. New keys use these forms:

- `msisdnScreen.title`, `otpScreen.resendText`, `dashboardScreen.welcomeTitle`
- `chatScreen.sendButtonText`, `chatScreen.inputPlaceholder`, `commonScreen.retryText`
- `category.<agent UUID>.name`
- `plan.<plan UUID>.name`, `plan.<plan UUID>.highlightBadge`

Subscriber clients should render the returned screen fields and refresh screens, plans and agents together when changing language. Legacy shared screen copy applies only to the default language. Explicit language values, including empty strings, override defaults. Missing values keep existing API fallbacks. The existing `agents.translations` JSON column supplies global category translations; operator-specific overrides are stored in `operator_languages.strings`. No new campaign or translation migration is required.

## Low Balance screen

Choose **8. Low Balance** in the screen selector for any configured language. Edit the step badge, title, subtitle, recharge note, three benefit texts, Okay button, and footer independently for each language, then save language content. Existing draft switching, preview, typography, and RTL direction apply.

Keys: `lowBalanceScreen.badge`, `.title`, `.subtitle`, `.rechargeNote`, `.benefit1Text`, `.benefit2Text`, `.benefit3Text`, `.buttonText`, and `.footerText`. Portal init and language-switch responses expose these under `screens.lowBalanceScreen`. Defaults are available in English, Hindi, Arabic, Tamil, and Urdu; other languages use the existing English fallback until configured. Subscriber clients should render this screen when the access decision is `low_balance`. The reference artwork is not embedded in translated copy.
