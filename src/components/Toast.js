export class Toast {
  static show(message, type = 'info', durationMs = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <div style="flex: 1; line-height: 1.4;">${message}</div>
      <button style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px;">&times;</button>
    `;

    toast.querySelector('button').onclick = () => toast.remove();

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, durationMs);
  }

  static success(msg) { this.show(msg, 'success'); }
  static error(msg) { this.show(msg, 'error', 6000); }
  static info(msg) { this.show(msg, 'info'); }
}
