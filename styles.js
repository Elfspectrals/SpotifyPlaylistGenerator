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

    /* Results modal responsive styles */
    @media (max-width: 768px) {
      .results-modal-content {
        padding: 20px !important;
        margin: 10px !important;
        width: calc(100% - 20px) !important;
        max-height: 90vh !important;
      }
      
      .results-modal-content h2 {
        font-size: 24px !important;
        margin-bottom: 15px !important;
      }
      
      .results-modal-content p {
        font-size: 14px !important;
        margin-bottom: 20px !important;
      }
      
      .song-item {
        padding: 12px !important;
        margin-bottom: 8px !important;
      }
      
      .song-item div:first-child {
        font-size: 16px !important;
      }
      
      .song-item div:nth-child(2) {
        font-size: 14px !important;
      }
      
      .song-item div:nth-child(3) {
        font-size: 12px !important;
      }
      
      .action-buttons {
        flex-direction: column !important;
        gap: 10px !important;
      }
      
      .action-buttons button {
        width: 100% !important;
        padding: 10px 20px !important;
        font-size: 14px !important;
      }
    }
    
    @media (max-width: 480px) {
      .results-modal-content {
        padding: 15px !important;
        margin: 5px !important;
        width: calc(100% - 10px) !important;
      }
      
      .results-modal-content h2 {
        font-size: 20px !important;
      }
      
      .song-item {
        padding: 10px !important;
      }
      
      .song-item div:first-child {
        font-size: 14px !important;
      }
      
      .song-item div:nth-child(2) {
        font-size: 12px !important;
      }
      
      .song-item div:nth-child(3) {
        font-size: 11px !important;
      }
    }

    /* AI Playlist Modal responsive styles */
    @media (max-width: 768px) {
      #ai-playlist-modal .modal-content {
        padding: 20px;
        margin: 10px;
        width: calc(100% - 20px);
        max-height: 95vh;
      }
      
      #ai-playlist-modal h2 {
        font-size: 24px;
        margin-bottom: 20px;
      }
      
      #view-container {
        width: 100% !important;
        height: 400px !important;
        max-width: 350px;
      }
      
      .family-button {
        width: 70px !important;
        height: 70px !important;
        font-size: 10px !important;
      }
      
      .family-button div:first-child {
        font-size: 20px !important;
        margin-bottom: 3px !important;
      }
      
      .family-button div:last-child {
        font-size: 9px !important;
        line-height: 1.0 !important;
      }
      
      .subgenre-button {
        width: 60px !important;
        height: 60px !important;
        font-size: 10px !important;
        padding: 2px !important;
      }
      
      .subgenre-grid-container {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
        gap: 12px !important;
        padding: 15px !important;
        max-height: 350px !important;
      }
      
      .subgenre-grid-button {
        height: 60px !important;
        font-size: 11px !important;
        padding: 5px !important;
        border-radius: 12px !important;
      }
      
      .search-container {
        height: 45px !important;
        padding: 0 15px !important;
        border-radius: 22px !important;
      }
      
      .search-container input {
        font-size: 13px !important;
      }
      
      #selected-genres-display {
        padding: 15px !important;
        margin-top: 20px !important;
      }
      
      #selected-genres-display div {
        font-size: 12px !important;
        padding: 6px 12px !important;
        margin: 3px !important;
      }
      
      #selected-genres-display button {
        width: 16px !important;
        height: 16px !important;
        font-size: 10px !important;
        margin-left: 6px !important;
      }
      
      #song-count-container {
        padding: 15px !important;
        margin: 15px 0 !important;
      }
      
      #song-count-container div:first-child {
        font-size: 14px !important;
        margin-bottom: 10px !important;
      }
      
      .song-count-btn {
        width: 40px !important;
        height: 40px !important;
        font-size: 14px !important;
      }
      
      button[style*="padding: 15px 30px"] {
        padding: 12px 24px !important;
        font-size: 14px !important;
      }
    }
    
    @media (max-width: 480px) {
      #ai-playlist-modal .modal-content {
        padding: 15px;
        margin: 5px;
        width: calc(100% - 10px);
      }
      
      #view-container {
        height: 300px !important;
        max-width: 280px;
      }
      
      .family-button {
        width: 50px !important;
        height: 50px !important;
        font-size: 9px !important;
      }
      
      .family-button div:first-child {
        font-size: 16px !important;
        margin-bottom: 2px !important;
      }
      
      .family-button div:last-child {
        font-size: 8px !important;
        line-height: 1.0 !important;
      }
      
      .subgenre-button {
        width: 50px !important;
        height: 50px !important;
        font-size: 9px !important;
      }
      
      #selected-genres-display div {
        font-size: 11px !important;
        padding: 4px 8px !important;
      }
      
      #selected-genres-display button {
        width: 14px !important;
        height: 14px !important;
        font-size: 9px !important;
        margin-left: 4px !important;
      }
      
      #song-count-container {
        padding: 12px !important;
        margin: 12px 0 !important;
      }
      
      #song-count-container div:first-child {
        font-size: 13px !important;
        margin-bottom: 8px !important;
      }
      
      .song-count-btn {
        width: 35px !important;
        height: 35px !important;
        font-size: 12px !important;
      }
      
      .subgenre-grid-container {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)) !important;
        gap: 8px !important;
        padding: 10px !important;
        max-height: 300px !important;
      }
      
      .subgenre-grid-button {
        height: 55px !important;
        font-size: 10px !important;
        padding: 4px !important;
        border-radius: 10px !important;
      }
      
      .search-container {
        height: 40px !important;
        padding: 0 12px !important;
        border-radius: 20px !important;
      }
      
      .search-container input {
        font-size: 12px !important;
      }
      
      .search-container div {
        font-size: 14px !important;
        margin-right: 8px !important;
      }
    }

    /* Notification responsive styles */
    @media (max-width: 768px) {
      .success-notification,
      .error-notification {
        top: 10px !important;
        right: 10px !important;
        left: 10px !important;
        max-width: none !important;
        padding: 15px !important;
        font-size: 14px !important;
      }
      
      .success-notification div:first-child,
      .error-notification div:first-child {
        font-size: 20px !important;
        margin-right: 8px !important;
      }
      
      .success-notification div:nth-child(2),
      .error-notification div:nth-child(2) {
        font-size: 16px !important;
      }
    }
    
    @media (max-width: 480px) {
      .success-notification,
      .error-notification {
        padding: 12px !important;
        font-size: 13px !important;
      }
      
      .success-notification div:first-child,
      .error-notification div:first-child {
        font-size: 18px !important;
        margin-right: 6px !important;
      }
      
      .success-notification div:nth-child(2),
      .error-notification div:nth-child(2) {
        font-size: 14px !important;
      }
    }

    /* Auth modal responsive styles */
    @media (max-width: 768px) {
      .auth-instructions-modal {
        width: 90% !important;
        max-width: none !important;
        padding: 20px !important;
        margin: 10px !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
      }
      
      .auth-instructions-modal h3 {
        font-size: 20px !important;
        margin-bottom: 15px !important;
      }
      
      .auth-instructions-modal p {
        font-size: 14px !important;
        margin-bottom: 15px !important;
      }
      
      .auth-instructions-modal input,
      .auth-instructions-modal textarea {
        font-size: 14px !important;
        padding: 6px 10px !important;
      }
      
      .auth-instructions-modal button {
        padding: 8px 16px !important;
        font-size: 14px !important;
      }
    }
    
    @media (max-width: 480px) {
      .auth-instructions-modal {
        width: 95% !important;
        padding: 15px !important;
        margin: 5px !important;
      }
      
      .auth-instructions-modal h3 {
        font-size: 18px !important;
        margin-bottom: 12px !important;
      }
      
      .auth-instructions-modal p {
        font-size: 13px !important;
        margin-bottom: 12px !important;
      }
      
      .auth-instructions-modal input,
      .auth-instructions-modal textarea {
        font-size: 13px !important;
        padding: 5px 8px !important;
      }
      
      .auth-instructions-modal button {
        padding: 6px 12px !important;
        font-size: 13px !important;
      }
    }

    /* Subgenre grid scrollbar and animations */
    .subgenre-grid-container::-webkit-scrollbar {
      width: 8px;
    }
    .subgenre-grid-container::-webkit-scrollbar-track {
      background: #333;
      border-radius: 4px;
    }
    .subgenre-grid-container::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #666, #888);
      border-radius: 4px;
      border: 1px solid #444;
      transition: all 0.3s ease;
    }
    .subgenre-grid-container::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #888, #aaa);
      transform: scale(1.1);
    }
    
    .subgenre-grid-button {
      animation: fadeInUp 0.5s ease forwards;
      opacity: 0;
      transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .subgenre-grid-button:nth-child(1) { animation-delay: 0.1s; }
    .subgenre-grid-button:nth-child(2) { animation-delay: 0.15s; }
    .subgenre-grid-button:nth-child(3) { animation-delay: 0.2s; }
    .subgenre-grid-button:nth-child(4) { animation-delay: 0.25s; }
    .subgenre-grid-button:nth-child(5) { animation-delay: 0.3s; }
    .subgenre-grid-button:nth-child(6) { animation-delay: 0.35s; }
    .subgenre-grid-button:nth-child(7) { animation-delay: 0.4s; }
    .subgenre-grid-button:nth-child(8) { animation-delay: 0.45s; }
    .subgenre-grid-button:nth-child(9) { animation-delay: 0.5s; }
    .subgenre-grid-button:nth-child(10) { animation-delay: 0.55s; }
    .subgenre-grid-button:nth-child(n+11) { animation-delay: 0.6s; }
    
    .search-container:focus-within {
      transform: scale(1.02);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
      border-color: #1db954;
    }
    
    .subgenre-grid-button.hidden {
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.3s ease;
    }
    
    .subgenre-grid-button.visible {
      opacity: 1;
      transform: scale(1);
      transition: all 0.3s ease;
    }

    /* Pulse animation for buttons */
    @keyframes pulse-scale {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
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

