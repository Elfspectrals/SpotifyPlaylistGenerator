// Module de gestion des boutons

// Utility function to disable/enable all relevant buttons with loading indicators
function toggleButtonsState(disabled = true, showLoading = true) {
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(button => {
    if (button.textContent && (
      button.textContent.includes('Add to Current Playlist') ||
      button.textContent.includes('Create AI Playlist') ||
      button.textContent.includes('Use Selected Playlist') ||
      button.textContent.includes('Generate') ||
      button.textContent.includes('Connecting to Spotify') ||
      button.textContent.includes('AI Generation') ||
      button.textContent.includes('🤖 AI Generation') ||
      button.textContent.includes('🤖 Generating') ||
      button.textContent.includes('AI Playlist')
    )) {
      button.disabled = disabled;
      
      if (disabled) {
        // Store original text for restoration
        if (!button.dataset.originalText) {
          button.dataset.originalText = button.textContent;
        }
        
        // Add loading indicator if requested
        if (showLoading) {
          const spinner = document.createElement('span');
          spinner.className = 'loading-spinner';
          button.innerHTML = '';
          button.appendChild(spinner);
          
          // Add appropriate loading text based on button type
          if (button.dataset.originalText.includes('Add to Current Playlist')) {
            button.appendChild(document.createTextNode(' Adding to Playlist...'));
          } else if (button.dataset.originalText.includes('Create AI Playlist')) {
            button.appendChild(document.createTextNode(' Creating Playlist...'));
          } else if (button.dataset.originalText.includes('Use Selected Playlist')) {
            button.appendChild(document.createTextNode(' Generating...'));
          } else if (button.dataset.originalText.includes('Generate')) {
            button.appendChild(document.createTextNode(' Generating...'));
          } else {
            button.appendChild(document.createTextNode(' Loading...'));
          }
          
          // Add loading classes
          button.classList.add('button-loading', 'button-pulse');
        } else {
          // Style pour boutons désactivés - plus visible
          button.style.opacity = '0.3';
          button.style.background = '#333';
          button.style.color = '#999';
          button.style.cursor = 'not-allowed';
          button.style.transform = 'none';
          button.style.boxShadow = 'none';
          button.style.border = '1px solid #555';
          button.style.filter = 'grayscale(100%)';
          
          // Ajouter une classe CSS pour le style désactivé
          button.classList.add('button-disabled');
        }
      } else {
        // Restore original text
        if (button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
          delete button.dataset.originalText;
        }
        
        // Remove loading classes
        button.classList.remove('button-loading', 'button-pulse');
        
        // Restaurer le style normal
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.style.transform = '';
        button.style.boxShadow = '';
        button.style.filter = 'none';
        button.style.border = '';
        
        // Restaurer les couleurs originales selon le type de bouton
        if (button.textContent.includes('Create AI Playlist')) {
          button.style.background = 'linear-gradient(135deg, #1db954, #1ed760)';
          button.style.color = 'white';
        } else if (button.textContent.includes('Add to Current Playlist')) {
          button.style.background = 'linear-gradient(135deg, #1db954, #1ed760)';
          button.style.color = 'white';
        } else if (button.textContent.includes('Use Selected Playlist')) {
          button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
          button.style.color = 'white';
        } else if (button.textContent.includes('Generate') || button.textContent.includes('AI Generation')) {
          button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
          button.style.color = 'white';
        }
        
        // Supprimer la classe désactivée
        button.classList.remove('button-disabled');
      }
    }
  });
}

// Function to clean up duplicate buttons
function cleanupDuplicateButtons() {
  console.log('🧹 Cleaning up duplicate buttons...');
  
  // Remove duplicate AI Playlist buttons (by aria-label)
  const aiButtons = document.querySelectorAll('button[aria-label="AI Playlist"]');
  if (aiButtons.length > 1) {
    console.log(`Found ${aiButtons.length} AI Playlist buttons, removing ${aiButtons.length - 1} duplicates...`);
    for (let i = 1; i < aiButtons.length; i++) {
      aiButtons[i].remove();
    }
  }
  
  // Remove duplicate AI Playlist buttons (by text content) - but distinguish between different types
  const allButtons = document.querySelectorAll('button');
  const createButtons = [];
  const addButtons = [];
  
  allButtons.forEach(button => {
    if (button.textContent) {
      if (button.textContent.includes('Create AI Playlist')) {
        createButtons.push(button);
      } else if (button.textContent.includes('Add to Current Playlist')) {
        addButtons.push(button);
      }
    }
  });
  
  // Only remove duplicates of the same type
  if (createButtons.length > 1) {
    console.log(`Found ${createButtons.length} Create AI Playlist buttons, removing ${createButtons.length - 1} duplicates...`);
    for (let i = 1; i < createButtons.length; i++) {
      createButtons[i].remove();
    }
  }
  
  if (addButtons.length > 1) {
    console.log(`Found ${addButtons.length} Add to Current Playlist buttons, removing ${addButtons.length - 1} duplicates...`);
    for (let i = 1; i < addButtons.length; i++) {
      addButtons[i].remove();
    }
  }
  
  // Remove duplicate Choose Playlist buttons
  const chooseButtons = document.querySelectorAll('button[aria-label="Choose Playlist"]');
  if (chooseButtons.length > 1) {
    console.log(`Found ${chooseButtons.length} Choose Playlist buttons, removing ${chooseButtons.length - 1} duplicates...`);
    for (let i = 1; i < chooseButtons.length; i++) {
      chooseButtons[i].remove();
    }
  }
  
  // Check if main AI Playlist button is missing and restore it
  const mainAIButton = document.querySelector('button[aria-label="AI Playlist"]');
  let hasCreateButton = false;
  let hasAddButton = false;

  document.querySelectorAll('button').forEach(button => {
    if (button.textContent) {
      if (button.textContent.includes('Create AI Playlist')) {
        hasCreateButton = true;
      }
      if (button.textContent.includes('Add to Current Playlist')) {
        hasAddButton = true;
      }
    }
  });
  
  // Only restore if we're on a playlist page AND no Create button exists
  if (window.location.href.includes('/playlist/') && !mainAIButton && !hasCreateButton) {
    console.log('⚠️ No Create AI Playlist button found, attempting to restore...');
    // Note: addAIPlaylistButton will be called from content.js
  } else if (window.location.href.includes('/playlist/') && hasCreateButton) {
    console.log('✅ Create AI Playlist button found, no restoration needed');
  }
  
  // Ensure main AI Playlist button is always enabled
  if (mainAIButton && mainAIButton.disabled) {
    console.log('🔓 Re-enabling disabled main AI Playlist button...');
    if (typeof reEnableMainAIButton === 'function') {
      reEnableMainAIButton();
    }
  }
  
  console.log('✅ Duplicate cleanup completed');
}

// Exposer les fonctions globalement pour utilisation dans content.js
window.toggleButtonsState = toggleButtonsState;
window.cleanupDuplicateButtons = cleanupDuplicateButtons;

// Export pour utilisation dans d'autres modules (si Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleButtonsState,
    cleanupDuplicateButtons
  };
}

