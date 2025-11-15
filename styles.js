// Styles CSS globaux pour l'extension

function injectGlobalStyles() {
  const disabledButtonStyles = document.createElement('style');
  disabledButtonStyles.textContent = `
    .button-disabled {
      opacity: 0.3 !important;
      background: #333 !important;
      color: #999 !important;
      cursor: not-allowed !important;
      transform: none !important;
      box-shadow: none !important;
      pointer-events: none !important;
      border: 1px solid #555 !important;
      filter: grayscale(100%) !important;
    }
    
    .button-disabled:hover {
      background: #333 !important;
      color: #999 !important;
      transform: none !important;
      box-shadow: none !important;
      cursor: not-allowed !important;
      filter: grayscale(100%) !important;
    }
    
    .button-disabled:active {
      transform: none !important;
      box-shadow: none !important;
      background: #333 !important;
      color: #999 !important;
    }
    
    .button-disabled * {
      color: #999 !important;
    }

    /* Loading spinner styles */
    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff40;
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
    }

    .loading-spinner-small {
      width: 12px;
      height: 12px;
      border-width: 1.5px;
      margin-right: 6px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Loading button styles */
    .button-loading {
      position: relative;
      opacity: 0.8 !important;
      cursor: not-allowed !important;
    }

    .button-loading:hover {
      transform: none !important;
      box-shadow: none !important;
    }

    /* Pulse animation for loading states */
    @keyframes pulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.6; }
    }

    .button-pulse {
      animation: pulse 1.5s infinite;
    }
  `;
  document.head.appendChild(disabledButtonStyles);
}

// Exposer la fonction globalement pour utilisation dans content.js
window.injectGlobalStyles = injectGlobalStyles;

// Export pour utilisation dans d'autres modules (si Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { injectGlobalStyles };
}

