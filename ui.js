// UI component factory — single source of truth for the extension's reusable
// DOM components. Built on the CSS classes defined in styles.js.
// Loaded before content.js so every module can use window.SPG_UI / window.spg*.

(function () {
  // Create an element with class, text/html, attributes and event listeners.
  function el(tag, options = {}) {
    const node = document.createElement(tag);
    if (options.className) node.className = options.className;
    if (options.text != null) node.textContent = options.text;
    if (options.html != null) node.innerHTML = options.html;
    if (options.attrs) {
      Object.entries(options.attrs).forEach(([k, v]) => node.setAttribute(k, v));
    }
    if (options.style) node.style.cssText = options.style;
    if (options.on) {
      Object.entries(options.on).forEach(([evt, fn]) => node.addEventListener(evt, fn));
    }
    if (options.children) {
      options.children.filter(Boolean).forEach((c) => node.appendChild(c));
    }
    return node;
  }

  // Button factory. variant: primary | secondary | ghost | accent | danger
  function button(label, { variant = 'secondary', icon = '', onClick, block = false, attrs } = {}) {
    const classes = ['spg-btn', `spg-btn--${variant}`];
    if (block) classes.push('spg-btn--block');
    return el('button', {
      className: classes.join(' '),
      html: (icon ? `<span aria-hidden="true">${icon}</span>` : '') + `<span>${label}</span>`,
      attrs: { type: 'button', ...(attrs || {}) },
      on: onClick ? { click: onClick } : undefined,
    });
  }

  function closeButton(onClick) {
    return el('button', {
      className: 'spg-close',
      html: '&times;',
      attrs: { type: 'button', 'aria-label': 'Close' },
      on: { click: onClick },
    });
  }

  // Toast / notification. type: success | error
  function notify({ type = 'success', icon, title, body = '', link, autoClose = 5000 } = {}) {
    const defaultIcon = type === 'error' ? '\u26A0\uFE0F' : '\uD83C\uDFB5';
    const toast = el('div', { className: `spg-toast${type === 'error' ? ' spg-toast--error' : ''}` });

    const head = el('div', {
      className: 'spg-toast__head',
      children: [
        el('span', { className: 'spg-toast__icon', text: icon || defaultIcon }),
        el('span', { text: title || (type === 'error' ? 'Something went wrong' : 'Done') }),
      ],
    });
    toast.appendChild(head);

    if (body) toast.appendChild(el('div', { className: 'spg-toast__body', text: String(body).replace(/<[^>]+>/g, '') }));

    if (link && link.href) {
      toast.appendChild(el('a', {
        className: 'spg-toast__link',
        text: link.label || 'Open \u2192',
        attrs: { href: link.href, target: '_blank', rel: 'noopener' },
      }));
    }

    const close = el('button', {
      className: 'spg-toast__close',
      text: 'Close',
      attrs: { type: 'button' },
      on: { click: () => toast.remove() },
    });
    toast.appendChild(close);

    document.body.appendChild(toast);
    if (autoClose) {
      setTimeout(() => { if (toast.parentElement) toast.remove(); }, autoClose);
    }
    return toast;
  }

  // Modal shell with overlay, header (title + close), body, footer.
  // Returns { overlay, modal, header, body, footer, close } and wires
  // Escape + overlay-click to close.
  function modal({ id, title, subtitle, onClose } = {}) {
    const overlay = el('div', { className: 'spg-overlay' });
    if (id) overlay.id = id;

    const modalEl = el('div', { className: 'spg-modal', attrs: { role: 'dialog', 'aria-modal': 'true' } });
    const body = el('div', { className: 'spg-modal__body' });
    const footer = el('div', { className: 'spg-modal__footer' });

    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener('keydown', onKey);
      if (typeof onClose === 'function') onClose();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    const closeBtn = closeButton(close);
    const titleBlock = el('div', {
      children: [
        title ? el('h2', { className: 'spg-modal__title', text: title }) : null,
        subtitle ? el('p', { className: 'spg-modal__subtitle', text: subtitle }) : null,
      ],
    });
    const header = el('div', { className: 'spg-modal__header', children: [titleBlock, closeBtn] });

    modalEl.appendChild(header);
    modalEl.appendChild(body);
    modalEl.appendChild(footer);
    overlay.appendChild(modalEl);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);

    return { overlay, modal: modalEl, header, body, footer, close };
  }

  const SPG_UI = { el, button, closeButton, notify, modal };
  window.SPG_UI = SPG_UI;
  window.spgNotify = notify;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SPG_UI;
  }
})();
