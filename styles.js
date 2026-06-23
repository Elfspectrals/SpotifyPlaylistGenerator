// Styles CSS globaux pour l'extension

function injectGlobalStyles() {
  const disabledButtonStyles = document.createElement('style');
  disabledButtonStyles.textContent = `
    /* ============================================================
       SPOTIFY AI — DESIGN SYSTEM (design tokens & base)
       Single source of truth for the extension's look & feel.
       ============================================================ */
    :root {
      --spg-bg:          #121212;
      --spg-surface:     #181818;
      --spg-surface-2:   #282828;
      --spg-surface-3:   #3a3a3a;
      --spg-border:      rgba(255, 255, 255, 0.10);
      --spg-text:        #ffffff;
      --spg-text-soft:   #d4d4d4;   /* lisible (remplace les #999/#888 trop faibles) */
      --spg-text-mute:   #a7a7a7;
      --spg-green:       #1db954;
      --spg-green-hover: #1ed760;
      --spg-pink:        #f037a5;
      --spg-danger:      #e74c3c;
      --spg-radius:      14px;
      --spg-radius-pill: 9999px;
      --spg-shadow:      0 16px 40px rgba(0, 0, 0, 0.55);
      --spg-ring:        0 0 0 2px rgba(29, 185, 84, 0.65);
      --spg-ease:        cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Modal entrance animations */
    @keyframes spgOverlayIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spgModalIn {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    #ai-playlist-modal { animation: spgOverlayIn 0.22s var(--spg-ease); }
    #ai-playlist-modal .modal-content {
      animation: spgModalIn 0.32s var(--spg-ease);
      scrollbar-width: thin;
      scrollbar-color: var(--spg-surface-3) transparent;
    }
    #ai-playlist-modal .modal-content::-webkit-scrollbar { width: 10px; }
    #ai-playlist-modal .modal-content::-webkit-scrollbar-thumb {
      background: var(--spg-surface-3);
      border-radius: 8px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    #ai-playlist-modal .modal-content::-webkit-scrollbar-thumb:hover { background: #555; }

    /* Keyboard-accessible focus ring on every control inside the modal */
    #ai-playlist-modal button:focus-visible,
    #ai-playlist-modal input:focus-visible,
    .results-modal-content button:focus-visible,
    .auth-instructions-modal button:focus-visible,
    .auth-instructions-modal input:focus-visible {
      outline: none !important;
      box-shadow: var(--spg-ring) !important;
    }

    /* Respect the user's reduced-motion preference (extension UI only) */
    @media (prefers-reduced-motion: reduce) {
      #ai-playlist-modal, #ai-playlist-modal *,
      .results-modal-content, .results-modal-content *,
      .auth-instructions-modal, .auth-instructions-modal *,
      .success-notification, .error-notification,
      .spg-ai-playlist-btn, .song-item, .subgenre-grid-button {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
    }

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

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(24px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .ai-toast.warning-notification,
    .ai-toast.info-notification {
      top: 20px;
      right: 20px;
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
      .error-notification,
      .warning-notification,
      .info-notification,
      .ai-toast {
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
      .error-notification,
      .warning-notification,
      .info-notification,
      .ai-toast {
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

    /* Bouton principal « AI Playlist » — glass dark + accent vert */
    button.spg-ai-playlist-btn[aria-label="AI Playlist"] {
      box-sizing: border-box;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-height: 36px;
      padding: 8px 14px 8px 12px !important;
      margin: 0 0 0 8px;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      letter-spacing: 0.01em;
      color: #1ed760 !important;
      background: rgba(12, 12, 12, 0.88) !important;
      background-image: none !important;
      border: 1px solid rgba(29, 185, 84, 0.45) !important;
      border-radius: 9999px !important;
      cursor: pointer;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.04) inset,
        0 4px 18px rgba(0, 0, 0, 0.35);
      transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease, color 0.18s ease;
      flex-shrink: 0;
      z-index: 10000;
    }

    button.spg-ai-playlist-btn[aria-label="AI Playlist"]:hover:not(:disabled):not(.button-disabled) {
      color: #fff !important;
      background: rgba(29, 185, 84, 0.22) !important;
      border-color: rgba(30, 215, 96, 0.75) !important;
      box-shadow:
        0 0 0 1px rgba(30, 215, 96, 0.15) inset,
        0 0 20px rgba(29, 185, 84, 0.25),
        0 6px 22px rgba(0, 0, 0, 0.4);
      transform: translateY(-1px);
    }

    button.spg-ai-playlist-btn[aria-label="AI Playlist"]:active:not(:disabled):not(.button-disabled) {
      transform: translateY(0) scale(0.98);
    }

    button.spg-ai-playlist-btn[aria-label="AI Playlist"]:disabled,
    button.spg-ai-playlist-btn[aria-label="AI Playlist"].button-disabled {
      opacity: 0.45 !important;
      cursor: not-allowed !important;
      pointer-events: none !important;
    }

    button.spg-ai-playlist-btn[aria-label="AI Playlist"]:focus-visible {
      outline: 2px solid #1ed760 !important;
      outline-offset: 3px;
    }

    button.spg-ai-playlist-btn[aria-label="AI Playlist"] .spg-ai-playlist-btn__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      line-height: 0;
    }

    button.spg-ai-playlist-btn[aria-label="AI Playlist"] .spg-ai-playlist-btn__icon svg {
      display: block;
    }

    button.spg-ai-playlist-btn[aria-label="AI Playlist"] .spg-ai-playlist-btn__label {
      color: inherit !important;
      white-space: nowrap;
    }

    button.spg-ai-playlist-btn.spg-ai-playlist-btn--floating[aria-label="AI Playlist"] {
      position: fixed !important;
      top: 16px !important;
      right: 16px !important;
      margin: 0 !important;
      z-index: 100000 !important;
      padding: 10px 16px 10px 14px !important;
      min-height: 40px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.05) inset,
        0 8px 28px rgba(0, 0, 0, 0.5),
        0 0 24px rgba(29, 185, 84, 0.12);
    }

    @media (max-width: 768px) {
      button.spg-ai-playlist-btn.spg-ai-playlist-btn--floating[aria-label="AI Playlist"] {
        top: auto !important;
        bottom: 20px !important;
        right: 16px !important;
      }
    }

    /* ============================================================
       SPOTIFY AI — COMPONENT LIBRARY
       Reusable classes built on the design tokens above.
       Used by ui.js factories and the modals.
       ============================================================ */

    /* --- Modal shell --- */
    .spg-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(6px);
      z-index: 10000;
      animation: spgOverlayIn 0.22s var(--spg-ease);
      padding: 20px;
    }
    .spg-modal {
      background: var(--spg-surface);
      border: 1px solid var(--spg-border);
      border-radius: var(--spg-radius);
      box-shadow: var(--spg-shadow);
      max-width: 760px;
      width: 100%;
      max-height: 88vh;
      overflow-y: auto;
      position: relative;
      animation: spgModalIn 0.32s var(--spg-ease);
      scrollbar-width: thin;
      scrollbar-color: var(--spg-surface-3) transparent;
    }
    .spg-modal::-webkit-scrollbar { width: 10px; }
    .spg-modal::-webkit-scrollbar-thumb {
      background: var(--spg-surface-3);
      border-radius: 8px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    .spg-modal__header {
      position: sticky;
      top: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 22px 28px 16px;
      background: linear-gradient(180deg, var(--spg-surface) 70%, transparent);
    }
    .spg-modal__title {
      margin: 0;
      color: var(--spg-text);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.01em;
    }
    .spg-modal__subtitle {
      color: var(--spg-text-soft);
      font-size: 13px;
      margin: 4px 0 0;
    }
    .spg-modal__body { padding: 4px 28px 28px; }
    .spg-modal__footer {
      position: sticky;
      bottom: 0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      flex-wrap: wrap;
      padding: 16px 28px 22px;
      background: linear-gradient(0deg, var(--spg-surface) 70%, transparent);
    }

    /* --- Close button --- */
    .spg-close {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 50%;
      background: var(--spg-surface-2);
      color: var(--spg-text-soft);
      font-size: 18px;
      cursor: pointer;
      transition: background 0.15s var(--spg-ease), color 0.15s var(--spg-ease), transform 0.12s var(--spg-ease);
    }
    .spg-close:hover { background: var(--spg-surface-3); color: var(--spg-text); transform: rotate(90deg); }

    /* --- Buttons --- */
    .spg-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 42px;
      padding: 11px 22px;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 700;
      line-height: 1;
      border: 1px solid transparent;
      border-radius: var(--spg-radius-pill);
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s var(--spg-ease), transform 0.12s var(--spg-ease),
                  box-shadow 0.15s var(--spg-ease), border-color 0.15s var(--spg-ease);
    }
    .spg-btn:active { transform: scale(0.97); }
    .spg-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    .spg-btn--primary { background: var(--spg-green); color: #000; }
    .spg-btn--primary:hover:not(:disabled) {
      background: var(--spg-green-hover);
      box-shadow: 0 6px 22px rgba(29, 185, 84, 0.35);
      transform: translateY(-1px);
    }
    .spg-btn--secondary {
      background: var(--spg-surface-2);
      color: var(--spg-text);
      border-color: var(--spg-border);
    }
    .spg-btn--secondary:hover:not(:disabled) { background: var(--spg-surface-3); }
    .spg-btn--ghost { background: transparent; color: var(--spg-text-soft); }
    .spg-btn--ghost:hover:not(:disabled) { background: var(--spg-surface-2); color: var(--spg-text); }
    .spg-btn--accent { background: var(--spg-pink); color: #fff; }
    .spg-btn--accent:hover:not(:disabled) {
      background: #ff4fb6;
      box-shadow: 0 6px 22px rgba(240, 55, 165, 0.35);
      transform: translateY(-1px);
    }
    .spg-btn--danger { background: var(--spg-danger); color: #fff; }
    .spg-btn--danger:hover:not(:disabled) { background: #ff5b4c; }
    .spg-btn--block { width: 100%; }

    /* --- Chips --- */
    .spg-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      background: var(--spg-surface-2);
      color: var(--spg-text);
      border: 1px solid var(--spg-border);
      border-radius: var(--spg-radius-pill);
      font-size: 13px;
      font-weight: 600;
    }
    .spg-chip__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      color: var(--spg-text);
      font-size: 11px;
      cursor: pointer;
      transition: background 0.15s var(--spg-ease);
    }
    .spg-chip__remove:hover { background: var(--spg-danger); }

    /* --- Toast / notification --- */
    .spg-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 380px;
      background: var(--spg-surface-2);
      color: var(--spg-text);
      border: 1px solid var(--spg-border);
      border-left: 4px solid var(--spg-green);
      border-radius: 12px;
      padding: 16px 18px;
      box-shadow: var(--spg-shadow);
      z-index: 10010;
      animation: spgToastIn 0.3s var(--spg-ease);
    }
    .spg-toast--error { border-left-color: var(--spg-danger); }
    .spg-toast__head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
      font-weight: 800;
      font-size: 16px;
    }
    .spg-toast__icon { font-size: 22px; line-height: 1; }
    .spg-toast__body { font-size: 14px; color: var(--spg-text-soft); }
    .spg-toast__body strong { color: var(--spg-text); }
    .spg-toast__link {
      display: inline-block;
      margin-top: 10px;
      color: var(--spg-green-hover);
      font-weight: 700;
      text-decoration: none;
    }
    .spg-toast__link:hover { text-decoration: underline; }
    .spg-toast__close {
      margin-top: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: var(--spg-text);
      padding: 7px 14px;
      border-radius: var(--spg-radius-pill);
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }
    .spg-toast__close:hover { background: rgba(255, 255, 255, 0.18); }

    @keyframes spgToastIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* --- Wizard (stepper + panels + nav) --- */
    .spg-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 0 0 22px;
    }
    .spg-step {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--spg-text-mute);
      font-size: 13px;
      font-weight: 700;
    }
    .spg-step--active { color: var(--spg-text); }
    .spg-step__dot {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--spg-surface-2);
      border: 1px solid var(--spg-border);
      color: var(--spg-text-mute);
      font-size: 13px;
      transition: background 0.2s var(--spg-ease), color 0.2s var(--spg-ease), border-color 0.2s var(--spg-ease);
    }
    .spg-step--active .spg-step__dot {
      background: var(--spg-green);
      color: #000;
      border-color: var(--spg-green);
    }
    .spg-step__bar {
      width: 40px;
      height: 2px;
      background: var(--spg-surface-3);
      border-radius: 2px;
    }
    .spg-wizard-panel { animation: spgModalIn 0.25s var(--spg-ease); }
    .spg-wizard-panel--hidden { display: none !important; }
    .spg-wizard-nav {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--spg-border);
    }
    .spg-wizard-nav__right {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }

    /* ============================================================
       SPOTIFY AI — RADIO ENGINE UI
       ============================================================ */
    /* Expandable radio cards (Random / Discovery) */
    .spg-radiocard {
      border: 1px solid var(--spg-border);
      border-radius: 14px;
      background: var(--spg-surface-2);
      overflow: hidden;
      transition: border-color 0.2s var(--spg-ease);
    }
    .spg-radiocard:hover { border-color: rgba(255, 255, 255, 0.22); }
    .spg-radiocard__header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: transparent;
      border: none;
      color: var(--spg-text);
      cursor: pointer;
      text-align: left;
      font-family: inherit;
    }
    .spg-radiocard__header:hover { background: var(--spg-surface-3); }
    .spg-radiocard__icon { font-size: 24px; line-height: 1; }
    .spg-radiocard__text { display: flex; flex-direction: column; flex: 1; gap: 2px; }
    .spg-radiocard__title { font-size: 15px; font-weight: 800; }
    .spg-radiocard__desc { font-size: 12px; color: var(--spg-text-mute); }
    .spg-radiocard__chev {
      color: var(--spg-text-mute);
      font-size: 14px;
      transition: transform 0.2s var(--spg-ease);
    }
    .spg-radiocard__header--open .spg-radiocard__chev { transform: rotate(180deg); }
    .spg-radiocard__body {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 4px 16px 16px;
    }
    .spg-radiocard__body--collapsed { display: none; }

    .spg-radio { display: flex; flex-direction: column; gap: 14px; }
    .spg-radio__title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--spg-green-hover);
      margin-top: 6px;
    }
    .spg-radio__row { display: flex; gap: 10px; flex-wrap: wrap; }

    .spg-field { display: flex; flex-direction: column; gap: 8px; }
    .spg-field__head { display: flex; align-items: center; justify-content: space-between; }
    .spg-field__label { color: var(--spg-text); font-size: 14px; font-weight: 700; }
    .spg-field__value {
      min-width: 42px;
      text-align: center;
      padding: 2px 8px;
      border-radius: var(--spg-radius-pill);
      background: var(--spg-surface-2);
      color: var(--spg-green-hover);
      font-size: 12px;
      font-weight: 700;
    }
    .spg-field__hint { color: var(--spg-text-mute); font-size: 12px; }

    /* Range slider */
    .spg-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 999px;
      background: var(--spg-surface-3);
      outline: none;
      cursor: pointer;
    }
    .spg-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--spg-green);
      border: 2px solid #0a0a0a;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
      transition: transform 0.12s var(--spg-ease);
    }
    .spg-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
    .spg-slider::-moz-range-thumb {
      width: 18px; height: 18px; border-radius: 50%;
      background: var(--spg-green); border: 2px solid #0a0a0a; cursor: pointer;
    }

    /* Pills (mood / duration) */
    .spg-pillrow { display: flex; gap: 8px; flex-wrap: wrap; }
    .spg-pill {
      padding: 7px 13px;
      border-radius: var(--spg-radius-pill);
      border: 1px solid var(--spg-border);
      background: var(--spg-surface-2);
      color: var(--spg-text-soft);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s var(--spg-ease), color 0.15s var(--spg-ease), border-color 0.15s var(--spg-ease);
    }
    .spg-pill:hover { background: var(--spg-surface-3); color: var(--spg-text); }
    .spg-pill--active { background: var(--spg-green); color: #000; border-color: var(--spg-green); }

    /* Inputs */
    .spg-input, .spg-textarea {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--spg-border);
      background: var(--spg-surface-2);
      color: var(--spg-text);
      font-size: 14px;
      font-family: inherit;
    }
    .spg-input:focus, .spg-textarea:focus { outline: none; border-color: var(--spg-green); }
    .spg-textarea { resize: vertical; min-height: 56px; }

    /* Preset grid */
    .spg-preset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 10px;
    }
    .spg-preset {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 14px 8px;
      border-radius: 12px;
      border: 1px solid var(--spg-border);
      background: var(--spg-surface-2);
      color: var(--spg-text);
      cursor: pointer;
      transition: transform 0.12s var(--spg-ease), background 0.15s var(--spg-ease), border-color 0.15s var(--spg-ease);
    }
    .spg-preset:hover { background: var(--spg-surface-3); border-color: var(--spg-green); transform: translateY(-2px); }
    .spg-preset--custom { border-color: rgba(240, 55, 165, 0.45); }
    .spg-preset--custom:hover { border-color: var(--spg-pink); }
    .spg-preset__icon { font-size: 24px; line-height: 1; }
    .spg-preset__label { font-size: 12px; font-weight: 700; text-align: center; word-break: break-word; }
    .spg-preset__del {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--spg-pink);
      color: #fff;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      opacity: 0;
      transition: opacity 0.15s var(--spg-ease);
    }
    .spg-preset:hover .spg-preset__del,
    .spg-preset__del:hover { opacity: 1; }
    .spg-preset-save { display: flex; gap: 8px; align-items: center; }
    .spg-preset-save .spg-input { flex: 1; }

    /* Fusion */
    .spg-fusion { display: flex; flex-direction: column; gap: 10px; }
    .spg-fusion__row { display: flex; align-items: center; gap: 10px; }
    .spg-fusion__x { color: var(--spg-text-mute); font-weight: 800; font-size: 18px; }

    /* Toggle */
    .spg-toggle {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--spg-text);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .spg-toggle input { width: 18px; height: 18px; accent-color: var(--spg-green); cursor: pointer; }

    /* Step 2 settings cards */
    .spg-settings { display: flex; flex-direction: column; gap: 14px; }
    .spg-settings__card {
      border: 1px solid var(--spg-border);
      border-radius: 14px;
      background: var(--spg-surface-2);
      padding: 16px;
    }
    .spg-settings__head {
      margin: 0 0 12px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--spg-green-hover);
    }
    .spg-settings__body { display: flex; flex-direction: column; gap: 14px; }
    .spg-settings__sliders { display: flex; flex-direction: column; gap: 12px; }

    /* Era — decade chips + year inputs */
    .spg-era-pills .spg-pillrow { gap: 6px; }
    .spg-year-range {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .spg-year-range--hidden { display: none; }
    .spg-year-range__label { color: var(--spg-text-mute); font-size: 13px; font-weight: 600; }
    .spg-year-range__sep { color: var(--spg-text-mute); font-size: 14px; }
    .spg-input--year { width: 88px; text-align: center; padding: 8px 10px; }

    /* Country selector */
    .spg-locale .spg-country { margin-top: 4px; }
    .spg-locale .spg-country + .spg-country {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--spg-border);
    }
    .spg-country { display: flex; flex-direction: column; gap: 10px; }
    .spg-country__chips { display: flex; flex-wrap: wrap; gap: 8px; min-height: 30px; }
    .spg-country__empty { color: var(--spg-text-mute); font-size: 13px; }
    .spg-country__list {
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid var(--spg-border);
      border-radius: 12px;
      padding: 10px;
      scrollbar-width: thin;
    }
    .spg-country__list::-webkit-scrollbar { width: 8px; }
    .spg-country__list::-webkit-scrollbar-thumb { background: var(--spg-surface-3); border-radius: 6px; }
    .spg-country__group {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--spg-text-mute);
      margin: 12px 4px 8px;
    }
    .spg-country__group:first-child { margin-top: 2px; }
    .spg-country__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
    }
    .spg-country__item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 9px;
      border: 1px solid var(--spg-border);
      background: var(--spg-surface-2);
      color: var(--spg-text);
      font-size: 13px;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s var(--spg-ease), border-color 0.15s var(--spg-ease);
    }
    .spg-country__item:hover { background: var(--spg-surface-3); }
    .spg-country__item--active { border-color: var(--spg-green); background: rgba(29, 185, 84, 0.15); }
  `;
  document.head.appendChild(disabledButtonStyles);
}

// Exposer la fonction globalement pour utilisation dans content.js
window.injectGlobalStyles = injectGlobalStyles;

// Export pour utilisation dans d'autres modules (si Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { injectGlobalStyles };
}

