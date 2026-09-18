import { AuthService } from '../services/auth.js';
import { Toast } from '../components/Toast.js';

export class LoginView {
  constructor(onLoginSuccess) {
    this.onLoginSuccess = onLoginSuccess;
  }

  render() {
    const container = document.createElement('div');
    container.style.cssText = `
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
    `;

    container.innerHTML = `
      <div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15), transparent 60%); pointer-events: none;"></div>

      <div class="card" style="width: 100%; max-width: 440px; padding: 36px; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg), 0 0 40px rgba(99,102,241,0.2); position: relative; z-index: 10;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="width: 48px; height: 48px; margin: 0 auto 16px; border-radius: var(--radius-md); background: linear-gradient(135deg, #6366f1, #06b6d4); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.4);">
            TH
          </div>
          <h1 style="font-size: 24px; margin-bottom: 6px;">TickHigh Platform</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Telecom VAS Multi-Operator Admin Console</p>
        </div>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="login-email" class="form-input" placeholder="admin@tickhigh.com" required value="admin@tickhigh.com" />
          </div>

          <div class="form-group mb-6">
            <label class="form-label">Admin Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" required value="Admin@123456" />
          </div>

          <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 14px;">
            Sign In to Console
          </button>

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle); text-align: center;">
            <button type="button" id="demo-fill-btn" class="btn btn-secondary" style="width: 100%; font-size: 12px; padding: 8px;">
              ⚡ Fill Default Admin Credentials
            </button>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
              Super Admin: <code>admin@tickhigh.com</code> / <code>Admin@123456</code>
            </div>
          </div>
        </form>
      </div>
    `;

    const form = container.querySelector('#login-form');
    const emailInput = container.querySelector('#login-email');
    const passInput = container.querySelector('#login-password');
    const submitBtn = container.querySelector('#login-submit-btn');
    const fillBtn = container.querySelector('#demo-fill-btn');

    fillBtn.onclick = () => {
      emailInput.value = 'admin@tickhigh.com';
      passInput.value = 'Admin@123456';
      Toast.info('Default credentials inserted');
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerText = 'Verifying Session...';

      try {
        await AuthService.login(emailInput.value.trim(), passInput.value);
        Toast.success('Welcome back, Super Admin!');
        this.onLoginSuccess();
      } catch (err) {
        Toast.error(err.message || 'Login failed');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Sign In to Console';
      }
    };

    return container;
  }
}
