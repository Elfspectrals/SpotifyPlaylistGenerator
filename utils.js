// Fonctions utilitaires pour l'extension

// Utility function to show specific loading messages
function showLoadingMessage(button, message) {
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }
  
  const spinner = document.createElement('span');
  spinner.className = 'loading-spinner';
  button.innerHTML = '';
  button.appendChild(spinner);
  button.appendChild(document.createTextNode(' ' + message));
  button.classList.add('button-loading', 'button-pulse');
}

// Utility function to restore button to original state
function restoreButton(button) {
  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
  button.classList.remove('button-loading', 'button-pulse');
  button.disabled = false;
  button.style.opacity = '1';
  button.style.cursor = 'pointer';
  button.style.transform = '';
  button.style.boxShadow = '';
  button.style.filter = 'none';
  button.style.border = '';
}

// Utility function to re-enable the main AI Playlist button
function reEnableMainAIButton() {
  const mainAIButton = document.querySelector('button[aria-label="AI Playlist"]');
  if (mainAIButton) {
    restoreButton(mainAIButton);
  } else {
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatUserFacingError(error) {
  const raw = typeof error === 'string' ? error : (error?.message || 'Something went wrong. Please try again.');

  let message = raw
    .replace(/^Error adding songs to playlist:\s*/i, '')
    .replace(/^Error creating playlist:\s*/i, '')
    .replace(/^Spotify addition failed:\s*/i, '')
    .replace(/^Spotify creation failed:\s*\d+\s*-\s*/i, '')
    .replace(/^Spotify addition failed:\s*\d+\s*-\s*/i, '')
    .trim();

  const jsonStart = message.search(/\{"/);
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(message.slice(jsonStart));
      if (parsed.details) {
        const details = typeof parsed.details === 'string'
          ? parsed.details
          : JSON.stringify(parsed.details);
        if (details && details !== '[object Object]') {
          message = details;
        }
      } else if (typeof parsed.error === 'string') {
        message = parsed.error;
      } else if (parsed.error?.message) {
        message = parsed.error.message;
      }
    } catch (_) {
      // Keep original message
    }
  }

  if (/invalid access token|token expired|401/i.test(message)) {
    return 'Your Spotify session expired. Click the button again to sign in.';
  }
  if (/no songs were found|aucune chanson/i.test(message)) {
    return 'None of the selected songs were found on Spotify. Try regenerating or pick different tracks.';
  }
  if (/cannot modify|forbidden|403|insufficient client scope/i.test(message)) {
    return 'You can only add songs to playlists you own or can edit.';
  }
  if (/playlist.*not found|404/i.test(message)) {
    return 'Playlist not found. Open your playlist on Spotify and try again.';
  }
  if (/failed to fetch|network|connection/i.test(message)) {
    return 'Connection error. Check your internet and try again.';
  }
  if (/Erreur lors de l'ajout des chansons/i.test(message)) {
    return 'Could not add songs to the playlist. Make sure you own the playlist and are signed in to Spotify.';
  }
  if (/Erreur lors de la création/i.test(message)) {
    return 'Could not create the playlist. Please sign in to Spotify and try again.';
  }

  return message;
}

function showToast({ type = 'info', title, message, duration = 5000, link = null, linkLabel = 'Open' }) {
  const styles = {
    success: {
      icon: '🎵',
      gradient: 'linear-gradient(135deg, #1db954, #1ed760)',
      className: 'success-notification'
    },
    error: {
      icon: '❌',
      gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      className: 'error-notification'
    },
    warning: {
      icon: '⚠️',
      gradient: 'linear-gradient(135deg, #f39c12, #e67e22)',
      className: 'warning-notification'
    },
    info: {
      icon: 'ℹ️',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      className: 'info-notification'
    }
  };

  const config = styles[type] || styles.info;
  const safeTitle = escapeHtml(title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice'));
  const safeMessage = escapeHtml(formatUserFacingError(message));

  const toast = document.createElement('div');
  toast.className = `ai-toast ${config.className}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${config.gradient};
    color: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    z-index: 10002;
    max-width: 400px;
    animation: toastSlideIn 0.3s ease;
  `;

  const linkHtml = link
    ? `<div style="margin-bottom: 15px;"><a href="${escapeHtml(link)}" target="_blank" rel="noopener" style="color: white; text-decoration: underline;">${escapeHtml(linkLabel)} →</a></div>`
    : '';

  toast.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <div style="font-size: 24px; margin-right: 10px;">${config.icon}</div>
      <div style="font-weight: bold; font-size: 18px;">${safeTitle}</div>
    </div>
    <div style="margin-bottom: 15px; line-height: 1.4;">${safeMessage}</div>
    ${linkHtml}
    <button type="button" class="ai-toast-close" style="
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
    ">Close</button>
  `;

  toast.querySelector('.ai-toast-close').addEventListener('click', () => toast.remove());
  document.body.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);
  }

  return toast;
}

function showGenerationError(error) {
  let title = 'Generation Failed';
  let message = error?.message || 'Something went wrong. Please try again.';

  if (message.includes('Failed to fetch')) {
    title = 'Server Unreachable';
    message = `Cannot reach the AI server. Check your connection or try again later.`;
  } else if (
    message.includes('Tous les modèles Gemini sont indisponibles') ||
    message.includes('models/gemini-1.5-pro is not found')
  ) {
    title = 'AI Service Unavailable';
    message = 'Our AI models are temporarily unavailable. Please try again later.';
  }

  showToast({ type: 'error', title, message, duration: 7000 });
}

// Wait for an element to appear in the DOM
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Watch for page changes and retry adding the button
function watchForPageChanges(callback) {
  const observer = new MutationObserver((mutations) => {
    let shouldRetry = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any new buttons were added, but ignore modal elements
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Ignore modal elements to prevent conflicts
            if (node.id && (node.id.includes('modal') || node.id.includes('ai-playlist'))) {
              return; // Skip modal elements
            }
            
            if (node.tagName === 'BUTTON' || node.querySelector && node.querySelector('button')) {
              shouldRetry = true;
            }
          }
        });
      }
    });
    
    if (shouldRetry && callback) {
      setTimeout(() => {
        callback();
      }, 1000);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// Exposer les fonctions globalement pour utilisation dans content.js
window.showLoadingMessage = showLoadingMessage;
window.restoreButton = restoreButton;
window.reEnableMainAIButton = reEnableMainAIButton;
window.waitForElement = waitForElement;
window.watchForPageChanges = watchForPageChanges;
window.showToast = showToast;
window.formatUserFacingError = formatUserFacingError;
window.showGenerationError = showGenerationError;

// Export pour utilisation dans d'autres modules (si Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showLoadingMessage,
    restoreButton,
    reEnableMainAIButton,
    waitForElement,
    watchForPageChanges
  };
}

