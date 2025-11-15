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
    console.log('✅ Main AI Playlist button re-enabled');
  } else {
    console.log('⚠️ Main AI Playlist button not found for re-enabling');
  }
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

