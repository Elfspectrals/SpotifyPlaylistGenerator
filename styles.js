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

    /* Song item styles */
    .song-item {
      background: #2a2a2a;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid #1db954;
      transition: all 0.3s ease;
    }

    .song-item:hover {
      background: #333;
      transform: translateX(5px);
    }

    .song-item-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .song-item-content {
      flex: 1;
    }

    .song-title {
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .song-artist {
      color: #1db954;
      font-size: 16px;
      margin-bottom: 5px;
    }

    .song-album {
      color: #888;
      font-size: 14px;
      margin-bottom: 3px;
      font-style: italic;
    }

    .song-genre {
      color: #999;
      font-size: 14px;
    }

    .song-duration {
      color: #666;
      font-size: 12px;
      margin-top: 3px;
    }

    .song-number {
      color: #666;
      font-size: 14px;
      margin-left: 15px;
    }

    /* Tooltip styles for quick action buttons */
    button[title] {
      position: relative;
    }

    button[title]:hover::after {
      content: attr(title);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10001;
      margin-bottom: 5px;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    button[title]:hover::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.9);
      z-index: 10001;
      margin-bottom: -5px;
      pointer-events: none;
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

