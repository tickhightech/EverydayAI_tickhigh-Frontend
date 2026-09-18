import { icons } from './icons.js';

export class Modal {
  static open({ title, contentHtml, onRender, maxWidth = '580px' }) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    // Remove any existing modal
    container.innerHTML = '';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: ${maxWidth};">
        <div class="modal-header">
          <h3 class="card-title">${title}</h3>
          <button class="btn btn-secondary btn-icon" id="modal-close-btn">${icons.close}</button>
        </div>
        <div class="modal-body">
          ${contentHtml}
        </div>
      </div>
    `;

    const close = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s';
      setTimeout(() => container.innerHTML = '', 200);
    };

    overlay.querySelector('#modal-close-btn').onclick = close;
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    container.appendChild(overlay);

    if (typeof onRender === 'function') {
      onRender(overlay, close);
    }
  }

  static close() {
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
  }
}
