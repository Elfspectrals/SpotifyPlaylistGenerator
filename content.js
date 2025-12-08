// Spotify AI Generator Playlist Extender
// Point d'entrée principal - utilise les modules config, styles, utils, api, buttons, auth

// Injecter les styles globaux (depuis styles.js)
injectGlobalStyles();

// Initialiser l'authentification (depuis auth.js)
initAuthCallback();
setupAuthMessageListener();

// Global function to add songs to existing playlist via API
async function addSongsToExistingPlaylist(accessToken, playlistData, playlistId, refreshToken = null) {
  try {
    console.log('🎵 Adding songs to existing playlist:', playlistId);

    // Disable all relevant buttons during API call with loading indicators
    toggleButtonsState(true, true);

    // Utiliser la fonction du module API
    const result = await window.addSongsToSpotifyPlaylist(accessToken, playlistId, playlistData, refreshToken);

    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      z-index: 10002;
      max-width: 400px;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <div style="font-size: 24px; margin-right: 10px;">🎵</div>
        <div style="font-weight: bold; font-size: 18px;">Songs Added!</div>
      </div>
      <div style="margin-bottom: 10px;">
        <strong>${result.tracksAdded}/${result.totalTracks}</strong> songs added to your playlist
      </div>
      <div style="margin-bottom: 15px;">
        <a href="${result.playlistUrl}" target="_blank" style="color: white; text-decoration: underline;">
          Open Playlist →
        </a>
      </div>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
      ">Close</button>
    `;

    document.body.appendChild(notification);

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);

    // Close the results modal after successful addition
    setTimeout(() => {
      const resultsModal = document.getElementById('playlist-results-modal');
      if (resultsModal && resultsModal.parentNode) {
        resultsModal.parentNode.removeChild(resultsModal);
      }
    }, 2000);

    // Re-enable all buttons after successful operation
    toggleButtonsState(false);

    // Specifically re-enable the main AI Playlist button
    reEnableMainAIButton();

  } catch (error) {
    alert('Error adding songs to playlist: ' + error.message);

    // Re-enable all relevant buttons after error
    toggleButtonsState(false);

    // Specifically re-enable the main AI Playlist button
    reEnableMainAIButton();
  }
}

// Function to create Spotify playlist with token refresh handling
async function createSpotifyPlaylist(accessToken, playlistData, refreshToken = null) {
  try {
    // Disable all relevant buttons during API call with loading indicators
    toggleButtonsState(true, true);

    // Utiliser la fonction du module API (appelée via window pour éviter conflit de nom)
    const result = await window.createSpotifyPlaylistAPI(accessToken, playlistData, refreshToken);

    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1db954, #1ed760);
      color: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(29, 185, 84, 0.3);
      z-index: 10002;
      max-width: 400px;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <div style="font-size: 24px; margin-right: 10px;">🎵</div>
        <div style="font-weight: bold; font-size: 18px;">Playlist Created!</div>
      </div>
      <div style="margin-bottom: 10px;">
        <strong>${result.tracksAdded}/${result.totalTracks}</strong> songs added
      </div>
      <div style="margin-bottom: 15px;">
        <a href="${result.playlistUrl}" target="_blank" style="color: white; text-decoration: underline;">
          Open in Spotify →
        </a>
      </div>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
      ">Close</button>
    `;

    document.body.appendChild(notification);

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);

    // Close the results modal after successful creation
    setTimeout(() => {
      const resultsModal = document.getElementById('playlist-results-modal');
      if (resultsModal && resultsModal.parentNode) {
        resultsModal.parentNode.removeChild(resultsModal);
      }
    }, 2000); // Close after 2 seconds to let user see the success notification

    // Re-enable all buttons after successful operation
    toggleButtonsState(false);

    // Specifically re-enable the main AI Playlist button
    reEnableMainAIButton();

  } catch (error) {
    alert('Error creating playlist: ' + error.message);

    // Re-enable all relevant buttons after error
    toggleButtonsState(false);

    // Specifically re-enable the main AI Playlist button
    reEnableMainAIButton();
  }
}

// Watch for page changes and retry adding the button
function watchForPageChangesWrapper() {
  return watchForPageChanges(() => {
    // Check if our button already exists
    const existingButton = document.querySelector(CONFIG.SELECTORS.AI_PLAYLIST_BUTTON);
    if (!existingButton) {
      console.log('🔄 MutationObserver: Re-adding AI Playlist button...');
      addAIPlaylistButton();
    }
  });
}

// Function to add "Choose Playlist" button
function addChoosePlaylistButton() {
  try {
    // Check if we're on a playlist page
    const currentUrl = window.location.href;
    const isPlaylistPage = currentUrl.includes('/playlist/');

    if (!isPlaylistPage) {
      return; // Only add the button on playlist pages
    }

    // Check if Choose Playlist button already exists to avoid duplicates
    const existingChooseButton = document.querySelector(CONFIG.SELECTORS.CHOOSE_PLAYLIST_BUTTON);
    if (existingChooseButton) {
      console.log('Choose Playlist button already exists, skipping...');
      return;
    }

    // Set up observer to watch for playlist changes
    setupPlaylistChangeObserver();

    // Wait a bit for the page to load
    setTimeout(() => {
      // Look for the action buttons container (where the play, shuffle, download buttons are)
      const actionButtonsContainer = document.querySelector('[data-testid="action-bar-row"]') ||
        document.querySelector('.main-actionBar-ActionBarRow') ||
        document.querySelector('[role="toolbar"]');

      if (actionButtonsContainer) {
        // Check if our button already exists
        const existingButton = actionButtonsContainer.querySelector('[aria-label="Choose Playlist"]');
        if (existingButton) {
          return; // Button already exists
        }

        // Create the "Choose Playlist" button
        const choosePlaylistButton = document.createElement('button');
        choosePlaylistButton.setAttribute('aria-label', 'Choose Playlist');
        choosePlaylistButton.setAttribute('data-testid', 'choose-playlist-button');
        choosePlaylistButton.style.cssText = `
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-left: 8px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        `;

        // Add the icon (checkmark or plus icon)
        choosePlaylistButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        `;

        // Add hover effects
        choosePlaylistButton.addEventListener('mouseenter', () => {
          choosePlaylistButton.style.transform = 'scale(1.1)';
          choosePlaylistButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        });

        choosePlaylistButton.addEventListener('mouseleave', () => {
          choosePlaylistButton.style.transform = 'scale(1)';
          choosePlaylistButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        });

        // Add click handler
        choosePlaylistButton.addEventListener('click', () => {
          saveCurrentPlaylist();
        });

        // Insert the button at the end of the action buttons
        actionButtonsContainer.appendChild(choosePlaylistButton);

        console.log('✅ Choose Playlist button added successfully');
      } else {
        console.log('⚠️ Action buttons container not found, retrying...');
        // Retry after a longer delay
        setTimeout(() => addChoosePlaylistButton(), 2000);
      }
    }, 1500);

  } catch (error) {
    console.log('Error adding Choose Playlist button:', error);
  }
}

// Function to set up observer for playlist changes
function setupPlaylistChangeObserver() {
  let currentPlaylistId = null;
  let saveTimeout = null;
  let buttonTimeout = null;

  // Get current playlist ID
  const currentUrl = window.location.href;
  const playlistMatch = currentUrl.match(/\/playlist\/([a-zA-Z0-9]+)/);
  if (playlistMatch) {
    currentPlaylistId = playlistMatch[1];
  }

  // Observer to watch for URL changes and page content changes
  const observer = new MutationObserver((mutations) => {
    // Check if URL has changed
    const newUrl = window.location.href;
    const newPlaylistMatch = newUrl.match(/\/playlist\/([a-zA-Z0-9]+)/);

    if (newPlaylistMatch) {
      const newPlaylistId = newPlaylistMatch[1];

      // If we're on a different playlist, update the selected playlist automatically
      // BUT only if the user has already selected a playlist before
      if (currentPlaylistId !== newPlaylistId) {
        console.log('Playlist changed from', currentPlaylistId, 'to', newPlaylistId);
        currentPlaylistId = newPlaylistId;

        // Only auto-save if user has previously selected a playlist
        const hasSelectedPlaylist = localStorage.getItem('selectedPlaylist');
        if (hasSelectedPlaylist) {
          // Clear existing timeout and set new one (debounce)
          if (saveTimeout) {
            clearTimeout(saveTimeout);
          }
          saveTimeout = setTimeout(() => {
            saveCurrentPlaylist(false); // Silent save, no notification
          }, 2000); // Wait 2 seconds to avoid spam
        }
      }
    }

    // Also watch for changes in the action buttons area (with debounce)
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if our button was removed and needs to be re-added
        const existingButton = document.querySelector(CONFIG.SELECTORS.CHOOSE_PLAYLIST_BUTTON);
        if (!existingButton && window.location.href.includes('/playlist/')) {
          // Clear existing timeout and set new one (debounce)
          if (buttonTimeout) {
            clearTimeout(buttonTimeout);
          }
          buttonTimeout = setTimeout(() => {
            // Double-check that button still doesn't exist before adding
            const stillNoButton = !document.querySelector(CONFIG.SELECTORS.CHOOSE_PLAYLIST_BUTTON);
            if (stillNoButton) {
              addChoosePlaylistButton();
            }
          }, 1000); // Wait 1 second to avoid spam
        }
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also listen for popstate events (back/forward navigation) with debounce
  let popstateTimeout = null;
  window.addEventListener('popstate', () => {
    // Clear existing timeout and set new one (debounce)
    if (popstateTimeout) {
      clearTimeout(popstateTimeout);
    }
    popstateTimeout = setTimeout(() => {
      if (window.location.href.includes('/playlist/')) {
        const newPlaylistMatch = window.location.href.match(/\/playlist\/([a-zA-Z0-9]+)/);
        if (newPlaylistMatch && newPlaylistMatch[1] !== currentPlaylistId) {
          currentPlaylistId = newPlaylistMatch[1];

          // Only auto-save if user has previously selected a playlist
          const hasSelectedPlaylist = localStorage.getItem('selectedPlaylist');
          if (hasSelectedPlaylist) {
            // Use the same debounced save function
            if (saveTimeout) {
              clearTimeout(saveTimeout);
            }
            saveTimeout = setTimeout(() => {
              saveCurrentPlaylist(false); // Silent save, no notification
            }, 2000);
          }
        }
      }
    }, 500); // Wait 500ms to avoid spam
  });

  console.log('Playlist change observer set up');
}

// Function to save current playlist
function saveCurrentPlaylist(showNotification = true) {
  try {
    const currentUrl = window.location.href;
    const playlistMatch = currentUrl.match(/\/playlist\/([a-zA-Z0-9]+)/);

    if (playlistMatch) {
      const playlistId = playlistMatch[1];

      // Get playlist name from the page - try multiple selectors for better reliability
      let playlistName = 'Selected Playlist';

      // Try different selectors to find the playlist name, prioritizing the main title
      const nameSelectors = [
        // Try to find the main playlist title in the header area first
        '[data-testid="entityTitle"] h1',
        '[data-testid="entityTitle"] .encore-text-headline-large',
        '.main-entityHeader h1',
        '.main-entityHeader .encore-text-body-large',
        '.main-entityHeader .encore-text-body-bold',
        '.main-entityHeader [data-testid="entityTitle"]',
        // Then try other selectors
        'h1[data-testid="entityTitle"]',
        'h1[class*="encore-text-body-large"]',
        'h1[class*="encore-text-body-bold"]',
        'h1[class*="encore-text-body"]',
        'h1',
        '[data-testid="playlist-name"]',
        // Look for the main title in the playlist header
        '.main-entityHeader .encore-text-body-small',
        '.encore-text-body-small'
      ];

      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent && element.textContent.trim()) {
          const text = element.textContent.trim();
          // Make sure it's not just "Bibliothèque" or other navigation text
          // Also avoid generic names like "Titre • [name]"
          if (text !== 'Bibliothèque' &&
            text !== 'Playlists' &&
            text.length > 3 &&
            !text.includes('Titre •') &&
            !text.includes('Playlist •')) {
            playlistName = text;
            console.log('Found playlist name:', text, 'using selector:', selector);
            break;
          }
        }
      }

      // If we still haven't found a good name, try to get it from the page title or URL
      if (playlistName === 'Selected Playlist' || playlistName === 'Bibliothèque') {
        // Try to get from page title
        const pageTitle = document.title;
        if (pageTitle && pageTitle.includes(' - ')) {
          const titleParts = pageTitle.split(' - ');
          if (titleParts.length > 1) {
            playlistName = titleParts[0].trim();
          }
        }
      }

      // Save to localStorage
      const playlistData = {
        id: playlistId,
        name: playlistName,
        url: currentUrl,
        savedAt: new Date().toISOString()
      };

      localStorage.setItem('selectedPlaylist', JSON.stringify(playlistData));

      // Refresh the modal if it's open to update the button text
      const existingModal = document.getElementById('ai-playlist-modal');
      if (existingModal) {
        // Close and reopen the modal to refresh the button
        existingModal.remove();
        reEnableMainAIButton();
        // Reopen the modal after a short delay
        setTimeout(() => {
          showMusicGenreModal();
        }, 300);
      }

      // Only show notification if explicitly requested
      if (showNotification) {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'playlist-saved-notification';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          z-index: 10002;
          max-width: 400px;
          animation: slideIn 0.3s ease;
        `;

        notification.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 24px; margin-right: 10px;">✅</div>
            <div style="font-weight: bold; font-size: 18px;">Playlist Selected!</div>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>${playlistName}</strong> has been saved
          </div>
          <div style="margin-bottom: 15px; font-size: 14px; opacity: 0.9;">
            You can now use this playlist in AI Playlist generator
          </div>
          <button onclick="this.parentElement.remove()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
          ">Close</button>
        `;

        document.body.appendChild(notification);

        // Auto-close after 4 seconds
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 4000);
      }

      console.log('✅ Playlist saved:', playlistData);
    } else {
      if (showNotification) {
        alert('No playlist detected on this page.');
      }
    }
  } catch (error) {
    console.error('Error saving playlist:', error);
    if (showNotification) {
      alert('Error saving playlist: ' + error.message);
    }
  }
}

// Function to show the Choose Playlist modal
function showChoosePlaylistModal() {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'choose-playlist-modal';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.cssText = `
    background: #1a1a1a;
    border-radius: 20px;
    padding: 40px;
    max-width: 600px;
    width: 95%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    border: 1px solid #333;
    max-height: 90vh;
    overflow-y: auto;
  `;

  // Get current playlist info
  const currentUrl = window.location.href;
  const playlistMatch = currentUrl.match(/\/playlist\/([a-zA-Z0-9]+)/);
  const playlistId = playlistMatch ? playlistMatch[1] : null;

  // Title
  const title = document.createElement('h2');
  title.textContent = 'Add AI Songs to This Playlist';
  title.style.cssText = `
    color: #667eea;
    font-size: 28px;
    margin-bottom: 20px;
    font-weight: bold;
  `;

  // Playlist info
  const playlistInfo = document.createElement('div');
  playlistInfo.style.cssText = `
    background: #2a2a2a;
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 30px;
    border: 1px solid #444;
  `;

  playlistInfo.innerHTML = `
    <div style="color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
      🎵 Current Playlist
    </div>
    <div style="color: #667eea; font-size: 16px; margin-bottom: 5px;">
      Playlist ID: ${playlistId}
    </div>
    <div style="color: #999; font-size: 14px;">
      AI-generated songs will be added to this playlist
    </div>
  `;

  // Song count selector
  const songCountContainer = document.createElement('div');
  songCountContainer.style.cssText = `
    margin: 20px 0;
    padding: 20px;
    background: #2a2a2a;
    border-radius: 15px;
    border: 1px solid #444;
    text-align: center;
  `;

  const songCountLabel = document.createElement('div');
  songCountLabel.textContent = 'Number of Songs to Add';
  songCountLabel.style.cssText = `
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  `;

  const songCountSelector = document.createElement('div');
  songCountSelector.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  `;

  // Create song count options
  const songCounts = CONFIG.DEFAULTS.SONG_COUNT_OPTIONS;
  let selectedSongCount = CONFIG.DEFAULTS.SONG_COUNT;

  songCounts.forEach(count => {
    const button = document.createElement('button');
    button.textContent = count.toString();
    button.style.cssText = `
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #667eea;
      background: ${count === 5 ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent'};
      color: ${count === 5 ? 'white' : '#667eea'};
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    button.addEventListener('click', () => {
      // Remove selection from all buttons
      songCountSelector.querySelectorAll('button').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = '#667eea';
      });

      // Select current button
      button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
      button.style.color = 'white';

      selectedSongCount = count;
    });

    songCountSelector.appendChild(button);
  });

  songCountContainer.appendChild(songCountLabel);
  songCountContainer.appendChild(songCountSelector);

  // Action buttons
  const actionButtons = document.createElement('div');
  actionButtons.style.cssText = `
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 30px;
  `;

  const generateButton = document.createElement('button');
  generateButton.textContent = 'Generate & Add Songs';
  generateButton.style.cssText = `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.cssText = `
    background: #666;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  // Event handlers
  generateButton.addEventListener('click', async () => {
    try {
      generateButton.textContent = '🤖 Generating...';
      generateButton.disabled = true;
      generateButton.style.opacity = '0.7';

      // Generate playlist with random genres for variety
      const randomGenres = [
        'Electronic', 'Hip-Hop', 'Rock', 'Pop', 'Jazz', 'Classical',
        'Metal', 'Folk', 'R&B', 'Blues', 'Reggae', 'World Music'
      ];

      // Select 2-3 random genres
      const selectedGenres = [];
      const numGenres = Math.floor(Math.random() * 2) + 2; // 2 or 3 genres
      for (let i = 0; i < numGenres; i++) {
        const randomGenre = randomGenres[Math.floor(Math.random() * randomGenres.length)];
        if (!selectedGenres.includes(randomGenre)) {
          selectedGenres.push(randomGenre);
        }
      }

      // Call the AI to generate songs (utilise le module API)
      const playlistData = await window.generatePlaylist(selectedGenres, selectedSongCount, selectedCountry);

      if (!playlistData || !playlistData.playlist) {
        throw new Error('Invalid server response format');
      }

      // Close the modal
      modalOverlay.remove();

      // Show the results and add to playlist
      showPlaylistResultsForAdding(playlistData, playlistId);

    } catch (error) {
      alert('Error generating songs: ' + error.message);
      generateButton.textContent = 'Generate & Add Songs';
      generateButton.disabled = false;
      generateButton.style.opacity = '1';
    }
  });

  cancelButton.addEventListener('click', () => {
    modalOverlay.remove();
  });

  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: #999;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  `;

  closeButton.addEventListener('click', () => {
    modalOverlay.remove();
  });

  // Assemble modal
  actionButtons.appendChild(cancelButton);
  actionButtons.appendChild(generateButton);

  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(playlistInfo);
  modalContent.appendChild(songCountContainer);
  modalContent.appendChild(actionButtons);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

// Function to show playlist results for adding to existing playlist
function showPlaylistResultsForAdding(playlistData, playlistId) {
  // Close all existing modals
  const existingModal = document.getElementById('ai-playlist-modal');
  const existingResultsModal = document.getElementById('playlist-results-modal');

  if (existingModal) {
    existingModal.remove();
  }
  if (existingResultsModal) {
    existingResultsModal.remove();
  }

  // Check if there's a selected playlist in localStorage (for display purposes)
  // But don't force playlistId - we want to show both options
  let selectedPlaylistData = null;
  if (!playlistId) {
    const selectedPlaylist = localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_PLAYLIST);
    if (selectedPlaylist) {
      try {
        selectedPlaylistData = JSON.parse(selectedPlaylist);
        playlistId = selectedPlaylistData.id; // Use it for the "Add to" button
      } catch (e) {
        console.log('Error parsing selected playlist:', e);
      }
    }
  } else {
    // If playlistId is provided, also get the name
    const selectedPlaylist = localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_PLAYLIST);
    if (selectedPlaylist) {
      try {
        selectedPlaylistData = JSON.parse(selectedPlaylist);
      } catch (e) {
        console.log('Error parsing selected playlist:', e);
      }
    }
  }

  // Create a new modal for results
  const resultsModal = document.createElement('div');
  resultsModal.id = 'playlist-results-modal';
  resultsModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
    backdrop-filter: blur(5px);
  `;

  const resultsContent = document.createElement('div');
  resultsContent.className = 'results-modal-content';
  resultsContent.style.cssText = `
    background: #1a1a1a;
    border-radius: 20px;
    padding: 40px;
    max-width: 800px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    border: 1px solid #333;
  `;

  // Add responsive styles for results modal
  const resultsResponsiveStyles = document.createElement('style');
  resultsResponsiveStyles.textContent = `
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
  `;
  document.head.appendChild(resultsResponsiveStyles);

  // Titre de la playlist
  const playlistTitle = document.createElement('h2');
  playlistTitle.textContent = playlistData.playlist.name;
  playlistTitle.style.cssText = `
    color: #1db954;
    font-size: 28px;
    margin-bottom: 15px;
    font-weight: bold;
  `;

  // Description
  const playlistDesc = document.createElement('p');
  playlistDesc.textContent = `Ready to add ${playlistData.playlist.songs.length} AI-generated songs to your playlist!`;
  playlistDesc.style.cssText = `
    color: #fff;
    font-size: 16px;
    margin-bottom: 30px;
    opacity: 0.8;
  `;

  // Liste des chansons
  const songsList = document.createElement('div');
  songsList.style.cssText = `
    text-align: left;
    margin-bottom: 30px;
  `;

  // Track selected songs (all selected by default)
  const selectedSongs = new Set(playlistData.playlist.songs.map((_, index) => index));

  // Select All / Deselect All controls
  const selectAllContainer = document.createElement('div');
  selectAllContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    background: #2a2a2a;
    border-radius: 10px;
  `;

  const selectAllLabel = document.createElement('label');
  selectAllLabel.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
  `;

  const selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = 'checkbox';
  selectAllCheckbox.checked = true;
  selectAllCheckbox.style.cssText = `
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #667eea;
  `;

  const selectedCount = document.createElement('span');
  selectedCount.textContent = `${selectedSongs.size} of ${playlistData.playlist.songs.length} selected`;
  selectedCount.style.cssText = `
    color: #667eea;
    font-size: 14px;
    font-weight: bold;
  `;

  selectAllLabel.appendChild(selectAllCheckbox);
  selectAllLabel.appendChild(document.createTextNode('Select All'));
  selectAllContainer.appendChild(selectAllLabel);
  selectAllContainer.appendChild(selectedCount);

  // Select All / Deselect All functionality
  selectAllCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    selectedSongs.clear();

    if (isChecked) {
      playlistData.playlist.songs.forEach((_, index) => selectedSongs.add(index));
    }

    // Update all checkboxes
    songsList.querySelectorAll('input[type="checkbox"][data-song-index]').forEach(checkbox => {
      checkbox.checked = isChecked;
      const songIndex = parseInt(checkbox.getAttribute('data-song-index'));
      const songItem = checkbox.closest('.song-item');
      if (isChecked) {
        songItem.style.opacity = '1';
        songItem.style.background = '';
      } else {
        songItem.style.opacity = '0.5';
        songItem.style.background = '#2a2a2a';
      }
    });

    selectedCount.textContent = `${selectedSongs.size} of ${playlistData.playlist.songs.length} selected`;
  });

  playlistData.playlist.songs.forEach((song, index) => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      margin-bottom: 10px;
      background: #2a2a2a;
      border-radius: 10px;
      border: 2px solid transparent;
      transition: all 0.2s ease;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.setAttribute('data-song-index', index);
    checkbox.style.cssText = `
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #667eea;
      flex-shrink: 0;
    `;

    checkbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
        selectedSongs.add(index);
        songItem.style.opacity = '1';
        songItem.style.background = '#2a2a2a';
      } else {
        selectedSongs.delete(index);
        songItem.style.opacity = '0.5';
        songItem.style.background = '#1a1a1a';
      }

      // Update select all checkbox
      selectAllCheckbox.checked = selectedSongs.size === playlistData.playlist.songs.length;
      selectedCount.textContent = `${selectedSongs.size} of ${playlistData.playlist.songs.length} selected`;
    });

    const songContent = document.createElement('div');
    songContent.style.cssText = 'flex: 1;';
    songContent.innerHTML = `
      <div class="song-item-container">
        <div class="song-item-content">
          <div class="song-title">
            ${song.title}
          </div>
          <div class="song-artist">
            ${song.artist}${song.year ? ` (${song.year})` : ''}
          </div>
          ${song.album ? `
          <div class="song-album">
            📀 ${song.album}
          </div>
          ` : ''}
          ${song.genre || song.description ? `
          <div class="song-genre">
            ${song.genre ? song.genre : ''}${song.genre && song.description ? ' • ' : ''}${song.description ? song.description : ''}
          </div>
          ` : ''}
          ${song.duration ? `
          <div class="song-duration">
            ⏱️ ${song.duration}
          </div>
          ` : ''}
        </div>
        <div class="song-number">
          #${index + 1}
        </div>
      </div>
    `;

    songItem.appendChild(checkbox);
    songItem.appendChild(songContent);
    songsList.appendChild(songItem);
  });

  // Boutons d'action
  const actionButtons = document.createElement('div');
  actionButtons.className = 'action-buttons';
  actionButtons.style.cssText = `
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 30px;
  `;

  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    background: #666;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s ease;
  `;

  closeButton.addEventListener('click', () => {
    const modal = document.getElementById('playlist-results-modal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    // Re-enable the main AI Playlist button when modal closes
    reEnableMainAIButton();
  });

  // Copy button
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy Playlist';
  copyButton.style.cssText = `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s ease;
  `;

  copyButton.addEventListener('click', () => {
    const selectedSongsList = playlistData.playlist.songs.filter((_, index) => selectedSongs.has(index));
    const playlistText = `${playlistData.playlist.name}\n\n${selectedSongsList.map((song, index) => {
      let line = `${index + 1}. ${song.title} - ${song.artist}`;
      if (song.year) line += ` (${song.year})`;
      if (song.album) line += ` [${song.album}]`;
      if (song.duration) line += ` - ${song.duration}`;
      return line;
    }).join('\n')}`;

    navigator.clipboard.writeText(playlistText).then(() => {
      alert('Selected songs copied to clipboard!');
    }).catch(() => {
      alert('Copy error');
    });
  });

  // Create New Playlist button (always show - user can always create a new playlist)
  const createPlaylistButton = document.createElement('button');
  createPlaylistButton.textContent = 'Create New Playlist';
  createPlaylistButton.style.cssText = `
      background: linear-gradient(135deg, #1db954, #1ed760);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

  createPlaylistButton.addEventListener('click', async () => {
    try {
      // Filter songs based on selection
      if (selectedSongs.size === 0) {
        alert('Please select at least one song to add to the playlist.');
        return;
      }

      const filteredPlaylistData = {
        ...playlistData,
        playlist: {
          ...playlistData.playlist,
          songs: playlistData.playlist.songs.filter((_, index) => selectedSongs.has(index))
        }
      };

      createPlaylistButton.textContent = '🔐 Connecting to Spotify...';
      createPlaylistButton.disabled = true;
      createPlaylistButton.style.opacity = '0.7';

      // Get auth URL and handle authentication (utilise le module API)
      const { authUrl } = await window.getSpotifyAuthUrl();

      // Store the filtered playlist data
      sessionStorage.setItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA, JSON.stringify(filteredPlaylistData));
      sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS, 'true');

      // Open auth window
      const authWindow = window.open(authUrl, 'spotify-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');

      // Listen for messages from the popup window
      const messageHandler = (event) => {
        if (event.data && event.data.success && event.data.accessToken) {
          window.removeEventListener('message', messageHandler);

          const { accessToken, refreshToken } = event.data;

          // Create new playlist with filtered songs
          createSpotifyPlaylist(accessToken, filteredPlaylistData, refreshToken);

          // Clean up
          sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
          sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);

          // Close the popup
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        } else if (event.data && event.data.success === false) {
          window.removeEventListener('message', messageHandler);
          alert('Authentication failed: ' + event.data.error);
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        }
      };

      window.addEventListener('message', messageHandler);

      // Timeout after configured time
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (!authWindow.closed) {
          authWindow.close();
          alert('Authentication timed out. Please try again.');
        }
      }, CONFIG.TIMEOUTS.AUTH_TIMEOUT);

    } catch (error) {
      alert('Error creating playlist: ' + error.message);
      createPlaylistButton.textContent = 'Create New Playlist';
      createPlaylistButton.disabled = false;
      createPlaylistButton.style.opacity = '1';
    }
  });

  // Add to Current Playlist button (show when playlistId is provided or selected playlist exists)
  let addToPlaylistButton = null;
  let selectedPlaylistName = null;

  if (playlistId && selectedPlaylistData) {
    selectedPlaylistName = selectedPlaylistData.name;

    addToPlaylistButton = document.createElement('button');
    addToPlaylistButton.textContent = `Add to Playlist: ${selectedPlaylistName}`;
    addToPlaylistButton.style.cssText = `
      background: linear-gradient(135deg, #1db954, #1ed760);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

    addToPlaylistButton.addEventListener('click', async () => {
      try {
        // Filter songs based on selection
        if (selectedSongs.size === 0) {
          alert('Please select at least one song to add to the playlist.');
          return;
        }

        const filteredPlaylistData = {
          ...playlistData,
          playlist: {
            ...playlistData.playlist,
            songs: playlistData.playlist.songs.filter((_, index) => selectedSongs.has(index))
          }
        };

        addToPlaylistButton.textContent = '🔐 Connecting to Spotify...';
        addToPlaylistButton.disabled = true;
        addToPlaylistButton.style.opacity = '0.7';

        // Get auth URL and handle authentication (utilise le module API)
        const { authUrl } = await window.getSpotifyAuthUrl();

        // Store the filtered playlist data and ID
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA, JSON.stringify(filteredPlaylistData));
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_ID, playlistId);
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS, 'true');

        // Open auth window
        const authWindow = window.open(authUrl, 'spotify-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');

        // Listen for messages from the popup window
        const messageHandler = (event) => {
          if (event.data && event.data.success && event.data.accessToken) {
            window.removeEventListener('message', messageHandler);

            const { accessToken, refreshToken } = event.data;

            // Add filtered songs to existing playlist
            addSongsToExistingPlaylist(accessToken, filteredPlaylistData, playlistId, refreshToken);

            // Clean up
            sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
            sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
            sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_ID);

            // Close the popup
            if (authWindow && !authWindow.closed) {
              authWindow.close();
            }
          } else if (event.data && event.data.success === false) {
            window.removeEventListener('message', messageHandler);
            alert('Authentication failed: ' + event.data.error);
            if (authWindow && !authWindow.closed) {
              authWindow.close();
            }
          }
        };

        window.addEventListener('message', messageHandler);

        // Timeout after configured time
        setTimeout(() => {
          window.removeEventListener('message', messageHandler);
          if (!authWindow.closed) {
            authWindow.close();
            alert('Authentication timed out. Please try again.');
          }
        }, CONFIG.TIMEOUTS.AUTH_TIMEOUT);

      } catch (error) {
        alert('Error adding to playlist: ' + error.message);
        addToPlaylistButton.textContent = selectedPlaylistName
          ? `Add to Playlist: ${selectedPlaylistName}`
          : 'Add to Current Playlist';
        addToPlaylistButton.disabled = false;
        addToPlaylistButton.style.opacity = '1';
      }
    });
  }

  // Assemble results modal
  resultsContent.appendChild(playlistTitle);
  resultsContent.appendChild(playlistDesc);
  resultsContent.appendChild(selectAllContainer);
  resultsContent.appendChild(songsList);
  actionButtons.appendChild(closeButton);
  actionButtons.appendChild(copyButton);

  // Always show Create New Playlist button
  actionButtons.appendChild(createPlaylistButton);

  // Show Add to Playlist button if a playlist is selected
  if (addToPlaylistButton) {
    actionButtons.appendChild(addToPlaylistButton);
  }

  resultsContent.appendChild(actionButtons);
  resultsModal.appendChild(resultsContent);
  document.body.appendChild(resultsModal);
}

// Create and inject the AI Playlist button
async function addAIPlaylistButton() {
  try {

    // Wait a moment for the page to fully load
    await new Promise(resolve => setTimeout(resolve, CONFIG.TIMEOUTS.PAGE_LOAD_DELAY));

    // Check if AI Playlist button already exists to avoid duplicates
    const existingAIButton = document.querySelector(CONFIG.SELECTORS.AI_PLAYLIST_BUTTON);
    if (existingAIButton) {
      console.log('AI Playlist button already exists, skipping...');
      return;
    }

    // Also check for buttons with the exact text content - but only check for Create buttons
    const existingButtons = document.querySelectorAll('button');
    for (let button of existingButtons) {
      if (button.textContent && button.textContent.includes('Create AI Playlist')) {
        console.log('Create AI Playlist button already exists, skipping...');
        return;
      }
    }

    // Add the "Choose Playlist" button for existing playlists
    addChoosePlaylistButton();

    // First, let's debug what buttons are available
    const allButtons = document.querySelectorAll('button');

    allButtons.forEach((button, index) => {
    });

    // Try multiple selectors for the Create button
    const possibleSelectors = [
      'button[aria-label="Create"]',
      'button[aria-label="Créer"]', // French version
      'button[aria-label="Create playlist"]',
      'button[aria-label="Créer une playlist"]', // French version
      'button[title="Create"]',
      'button[title="Créer"]',
      'button:contains("Create")',
      'button:contains("Créer")',
      '[data-testid*="create"]',
      '[data-testid*="playlist"]'
    ];

    let createButton = null;
    let usedSelector = '';

    for (const selector of possibleSelectors) {
      try {
        createButton = document.querySelector(selector);
        if (createButton) {
          usedSelector = selector;
          break;
        }
      } catch (e) {
      }
    }

    // If still not found, try to find any button with "create" in text or aria-label
    if (!createButton) {
      for (const button of allButtons) {
        const text = button.textContent?.toLowerCase() || '';
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        const title = button.getAttribute('title')?.toLowerCase() || '';

        if (text.includes('create') || text.includes('créer') ||
          ariaLabel.includes('create') || ariaLabel.includes('créer') ||
          title.includes('create') || title.includes('créer')) {
          createButton = button;
          usedSelector = 'text/aria-label search';
          break;
        }
      }
    }

    // If still not found, wait a bit and try again (page might still be loading)
    if (!createButton) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const allButtonsRetry = document.querySelectorAll('button');

      for (const button of allButtonsRetry) {
        const text = button.textContent?.toLowerCase() || '';
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        const title = button.getAttribute('title')?.toLowerCase() || '';

        if (text.includes('create') || text.includes('créer') ||
          ariaLabel.includes('create') || ariaLabel.includes('créer') ||
          title.includes('create') || title.includes('créer')) {
          createButton = button;
          usedSelector = 'text/aria-label search (retry)';
          break;
        }
      }
    }

    if (!createButton) {

      // Try to find any suitable container for our button
      const possibleContainers = [
        'nav[role="navigation"]',
        '[data-testid="left-sidebar"]',
        '.main-rootlist-rootlistContainer',
        '[role="navigation"]',
        'nav',
        '.main-navBar-navBar'
      ];

      let buttonContainer = null;
      for (const selector of possibleContainers) {
        const container = document.querySelector(selector);
        if (container) {
          buttonContainer = container;
          break;
        }
      }

      if (!buttonContainer) {
        // Last resort: use the body or a main container
        buttonContainer = document.querySelector('main') || document.body;
      }

      // Create the AI Playlist button without reference to Create button
      const aiPlaylistButton = document.createElement('button');
      aiPlaylistButton.type = 'button';
      aiPlaylistButton.className = 'UCyimCp8rEfL5nB8paBu LLlfyKiKbOd8gfCmHcZX HgSl1rNhQllYYZneaYji LNzflW6HN3b7upl8Pt7w G_xEAccmp3ulqXjuviWK Lau6kc9Au_87a19N7MRq v7brahHJw__K_QX72Un8';
      aiPlaylistButton.setAttribute('aria-label', 'AI Playlist');
      aiPlaylistButton.style.cssText = `
        margin: 8px;
        padding: 8px 16px;
        background: linear-gradient(135deg, #1db954, #1ed760);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
      `;

      // Add the plus icon
      const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconSvg.setAttribute('data-encore-id', 'icon');
      iconSvg.setAttribute('role', 'img');
      iconSvg.setAttribute('aria-hidden', 'true');
      iconSvg.setAttribute('class', 'e-91000-icon e-91000-baseline yoyv1_1LPucwCXYDe5AN');
      iconSvg.setAttribute('viewBox', '0 0 16 16');
      iconSvg.style.cssText = '--encore-icon-height: var(--encore-graphic-size-decorative-smaller); --encore-icon-width: var(--encore-graphic-size-decorative-smaller);';

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75');
      iconSvg.appendChild(path);

      // Add the text span
      const textSpan = document.createElement('span');
      textSpan.className = 'e-91000-text encore-text-body-small-bold encore-internal-color-text-base';
      textSpan.setAttribute('data-encore-id', 'tet');
      textSpan.textContent = 'AI Playlist';

      // Add click handler
      aiPlaylistButton.addEventListener('click', () => {
        showMusicGenreModal();
      });

      // Assemble the button
      aiPlaylistButton.appendChild(iconSvg);
      aiPlaylistButton.appendChild(textSpan);

      // Insert the button
      buttonContainer.appendChild(aiPlaylistButton);

      return;
    }


    // Find the parent container that holds the buttons
    const buttonContainer = createButton.parentElement;

    // Create the AI Playlist button
    const aiPlaylistButton = document.createElement('button');
    aiPlaylistButton.type = 'button';
    aiPlaylistButton.className = 'UCyimCp8rEfL5nB8paBu LLlfyKiKbOd8gfCmHcZX HgSl1rNhQllYYZneaYji LNzflW6HN3b7upl8Pt7w G_xEAccmp3ulqXjuviWK Lau6kc9Au_87a19N7MRq v7brahHJw__K_QX72Un8';
    aiPlaylistButton.setAttribute('aria-label', 'AI Playlist');
    aiPlaylistButton.style.marginLeft = '8px';

    // Add the plus icon (same as Create button)
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('data-encore-id', 'icon');
    iconSvg.setAttribute('role', 'img');
    iconSvg.setAttribute('aria-hidden', 'true');
    iconSvg.setAttribute('class', 'e-91000-icon e-91000-baseline yoyv1_1LPucwCXYDe5AN');
    iconSvg.setAttribute('viewBox', '0 0 16 16');
    iconSvg.style.cssText = '--encore-icon-height: var(--encore-graphic-size-decorative-smaller); --encore-icon-width: var(--encore-graphic-size-decorative-smaller);';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75');
    iconSvg.appendChild(path);

    // Add the text span
    const textSpan = document.createElement('span');
    textSpan.className = 'e-91000-text encore-text-body-small-bold encore-internal-color-text-base';
    textSpan.setAttribute('data-encore-id', 'tet');
    textSpan.textContent = 'AI Playlist';

    // Add click handler
    aiPlaylistButton.addEventListener('click', () => {
      showMusicGenreModal();
    });

    // Assemble the button
    aiPlaylistButton.appendChild(iconSvg);
    aiPlaylistButton.appendChild(textSpan);

    // Insert the button after the Create button
    buttonContainer.insertBefore(aiPlaylistButton, createButton.nextSibling);

  } catch (error) {
  }
}

// Music families and their subgenres
const musicFamilies = {
  'Rock': {
    icon: '🎸',
    color: '#ff6b6b',
    subgenres: [
      'Classic Rock', 'Alternative Rock', 'Indie Rock', 'Punk Rock',
      'Grunge', 'Progressive Rock', 'Psychedelic Rock', 'Hard Rock',
      'Soft Rock', 'Folk Rock', 'Blues Rock', 'Glam Rock',
      'Post-Rock', 'Math Rock', 'Shoegaze', 'Noise Rock', 'Garage Rock',
      'Surf Rock', 'Rockabilly', 'Southern Rock', 'Arena Rock', 'Art Rock',
      'Krautrock', 'Space Rock', 'Stoner Rock', 'Desert Rock',
      'Post-Punk', 'New Wave', 'Gothic Rock', 'Industrial Rock', 'Riot Grrrl'
    ]
  },
  'Electronic': {
    icon: '🎹',
    color: '#45b7d1',
    subgenres: [
      'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass',
      'Ambient', 'IDM', 'Synthwave', 'Future Bass', 'Breakbeat',
      'Electro', 'Minimal', 'Progressive House', 'Deep House',
      'Hardstyle', 'Hardcore', 'Drumstep', 'Neurofunk', 'Liquid DnB',
      'Psytrance', 'Goa Trance', 'Progressive Trance', 'Uplifting Trance',
      'Tech House', 'Deep Techno', 'Industrial', 'EBM', 'Dark Ambient',
      'Chillout', 'Downtempo', 'Trip Hop', 'Glitch Hop', 'Complextro',
      'Melodic Dubstep', 'Riddim', 'Trap', 'Future House', 'Big Room',
      'Electro House', 'Progressive Breaks', 'Acid House', 'Garage',
      'UK Garage', '2-Step', 'Dub Techno', 'Ambient House', 'Deep House'
    ]
  },
  'Jazz': {
    icon: '🎺',
    color: '#96ceb4',
    subgenres: [
      'Bebop', 'Swing', 'Fusion', 'Smooth Jazz', 'Free Jazz',
      'Hard Bop', 'Cool Jazz', 'Latin Jazz', 'Acid Jazz', 'Jazz Funk',
      'Modal Jazz', 'Post-Bop', 'Avant-Garde Jazz', 'Jazz Rock'
    ]
  },
  'Hip-Hop': {
    icon: '🎤',
    color: '#feca57',
    subgenres: [
      'Old School', 'Gangsta Rap', 'Conscious Rap', 'Trap',
      'Drill', 'Cloud Rap', 'Alternative Hip-Hop', 'Jazz Rap',
      'Boom Bap', 'Mumble Rap', 'East Coast', 'West Coast',
      'Southern Hip-Hop', 'UK Drill', 'Phonk', 'Memphis Rap',
      'Horrorcore', 'Political Rap', 'Underground Hip-Hop', 'Experimental Hip-Hop',
      'Trap Soul', 'R&B Trap', 'Melodic Rap', 'Emo Rap', 'SoundCloud Rap',
      'UK Grime', 'UK Drill', 'Afrobeat', 'Latin Trap', 'French Rap'
    ]
  },
  'Classical': {
    icon: '🎻',
    color: '#4ecdc4',
    subgenres: [
      'Baroque', 'Romantic', 'Modern Classical', 'Neoclassical',
      'Chamber Music', 'Symphony', 'Opera', 'Choral',
      'Minimalist', 'Contemporary Classical', 'Avant-Garde',
      'Impressionist', 'Expressionist', 'Serialism'
    ]
  },
  'Pop': {
    icon: '🎵',
    color: '#ff9ff3',
    subgenres: [
      'Pop Rock', 'Synthpop', 'Indie Pop', 'Electropop',
      'K-Pop', 'J-Pop', 'Latin Pop', 'Bubblegum Pop',
      'Teen Pop', 'Power Pop', 'Art Pop', 'Dream Pop',
      'Chamber Pop', 'Baroque Pop', 'Europop', 'Dance Pop',
      'Pop Punk', 'Emo Pop', 'Alternative Pop', 'Indie Pop',
      'Twee Pop', 'Jangle Pop', 'Sophisti-Pop', 'New Wave Pop'
    ]
  },
  'Blues': {
    icon: '🎷',
    color: '#8e44ad',
    subgenres: [
      'Delta Blues', 'Chicago Blues', 'Electric Blues', 'Acoustic Blues',
      'Blues Rock', 'Rhythm & Blues', 'Soul Blues', 'Country Blues',
      'Piedmont Blues', 'Texas Blues', 'Memphis Blues', 'West Coast Blues',
      'British Blues', 'Blues Revival'
    ]
  },
  'Country': {
    icon: '🪕',
    color: '#27ae60',
    subgenres: [
      'Honky Tonk', 'Bluegrass', 'Country Rock', 'Outlaw Country',
      'Nashville Sound', 'Bakersfield Sound', 'Country Pop', 'Alt-Country',
      'Progressive Country', 'Country Folk', 'Western', 'Red Dirt',
      'Country Rap', 'Bro-Country'
    ]
  },
  'R&B': {
    icon: '🎼',
    color: '#e74c3c',
    subgenres: [
      'Soul', 'Motown', 'Funk', 'Neo-Soul', 'Contemporary R&B',
      'Quiet Storm', 'New Jack Swing', 'Hip-Hop Soul', 'Alternative R&B',
      'PBR&B', 'Trap Soul', 'Gospel', 'Urban Contemporary'
    ]
  },
  'Folk': {
    icon: '🪗',
    color: '#e67e22',
    subgenres: [
      'Traditional Folk', 'Folk Rock', 'Indie Folk', 'Celtic Folk',
      'American Folk', 'British Folk', 'Protest Folk', 'Folk Punk',
      'Neo-Folk', 'Freak Folk', 'Anti-Folk', 'Psychedelic Folk',
      'World Folk', 'Folk Metal'
    ]
  },
  'Reggae': {
    icon: '🥁',
    color: '#f39c12',
    subgenres: [
      'Roots Reggae', 'Dancehall', 'Dub', 'Ska', 'Rocksteady',
      'Ragga', 'Lovers Rock', 'Digital Reggae', 'Reggaeton',
      'Dubstep Reggae', 'Reggae Fusion', 'One Drop', 'Steppers'
    ]
  },
  'Metal': {
    icon: '⚡',
    color: '#34495e',
    subgenres: [
      'Heavy Metal', 'Thrash Metal', 'Death Metal', 'Black Metal',
      'Power Metal', 'Progressive Metal', 'Doom Metal', 'Speed Metal',
      'Glam Metal', 'Nu Metal', 'Metalcore', 'Deathcore',
      'Folk Metal', 'Symphonic Metal', 'Industrial Metal', 'Alternative Metal',
      'Groove Metal', 'Melodic Death Metal', 'Technical Death Metal', 'Blackened Death Metal',
      'Viking Metal', 'Pagan Metal', 'Atmospheric Black Metal', 'Post-Metal',
      'Sludge Metal', 'Stoner Metal', 'Drone Metal', 'Grindcore'
    ]
  },
  'Hard Dance': {
    icon: '💥',
    color: '#e67e22',
    subgenres: [
      'Hardstyle', 'Hardcore', 'Hard Trance', 'Jumpstyle', 'Frenchcore',
      'Rawstyle', 'Euphoric Hardstyle', 'Reverse Bass', 'Hard Bass',
      'Gabber', 'Speedcore', 'Extratone', 'Crossbreed', 'Breakcore',
      'Industrial Hardcore', 'UK Hardcore', 'Happy Hardcore', 'Freeform',
      'Makina', 'Hard NRG', 'Hard Dance', 'Hard House', 'Bouncy Techno'
    ]
  },
  'Bass Music': {
    icon: '🔊',
    color: '#9b59b6',
    subgenres: [
      'Dubstep', 'Drumstep', 'Riddim', 'Melodic Dubstep', 'Future Bass',
      'Trap', 'Hybrid Trap', 'Future Trap', 'Wave', 'Phonk',
      'UK Bass', 'Bass House', 'G-House', 'Deep House', 'Future House',
      'Progressive House', 'Big Room', 'Electro House', 'Complextro',
      'Glitch Hop', 'Neurofunk', 'Liquid DnB', 'Jump Up', 'Darkstep',
      'Brostep', 'Chillstep', 'Post-Dubstep', 'Future Garage', 'UK Garage'
    ]
  },
  'World Music': {
    icon: '🌍',
    color: '#16a085',
    subgenres: [
      'Afrobeat', 'Highlife', 'Soukous', 'Mbalax', 'Kuduro',
      'Flamenco', 'Fado', 'Tango', 'Bossa Nova', 'Samba',
      'Bhangra', 'Qawwali', 'Carnatic', 'Hindustani', 'Bollywood',
      'Klezmer', 'Balkan', 'Gypsy', 'Celtic', 'Irish Folk',
      'Middle Eastern', 'Arabic', 'Turkish', 'Persian', 'Indian Classical',
      'African Traditional', 'Latin American Folk', 'European Folk', 'Asian Folk'
    ]
  },
  'Latin Music': {
    icon: '🎺',
    color: '#e74c3c',
    subgenres: [
      'Salsa', 'Merengue', 'Bachata', 'Cumbia', 'Reggaeton',
      'Latin Trap', 'Chicha', 'Nueva Canción', 'Mariachi', 'Ranchera',
      'Norteño', 'Tejano', 'Latin Pop', 'Latin Rock', 'Latin Jazz',
      'Bossa Nova', 'Samba', 'Tango', 'Flamenco', 'Rumba',
      'Son Cubano', 'Mambo', 'Cha-Cha-Cha', 'Bolero', 'Guaracha'
    ]
  },
  'Gospel & Spiritual': {
    icon: '⛪',
    color: '#f39c12',
    subgenres: [
      'Gospel', 'Spirituals', 'Contemporary Christian', 'Praise & Worship',
      'Christian Rock', 'Christian Hip-Hop', 'Christian Pop', 'Christian Metal',
      'Southern Gospel', 'Urban Gospel', 'Traditional Gospel', 'Contemporary Gospel',
      'Christian Country', 'Christian R&B', 'Worship Music', 'Hymns'
    ]
  },
  'New Age & Ambient': {
    icon: '🧘',
    color: '#8e44ad',
    subgenres: [
      'New Age', 'Ambient', 'Meditation Music', 'Nature Sounds',
      'Healing Music', 'Spa Music', 'Relaxation', 'Zen Music',
      'Ethereal', 'Atmospheric', 'Drone', 'Minimal Ambient',
      'Space Music', 'Celestial', 'Mystical', 'Transcendental'
    ]
  },
  'Modern Genres': {
    icon: '🚀',
    color: '#e91e63',
    subgenres: [
      'Lo-Fi Hip-Hop', 'Vaporwave', 'Synthwave', 'Retrowave', 'Outrun',
      'Hyperpop', 'PC Music', 'Digicore', 'Cloud Rap', 'Witch House',
      'Darkwave', 'Minimal Wave', 'Future Funk', 'Mallsoft', 'Vapor Trap',
      'Slowed & Reverb', 'Nightcore', 'Speedcore', 'Breakcore', 'Jungle',
      'Drumfunk', 'Liquid Funk', 'Neurofunk', 'Jump-Up', 'Rollers'
    ]
  },
  'Soundtrack': {
    icon: '🎬',
    color: '#34495e',
    subgenres: [
      'Film Score', 'Video Game Music', 'Anime Music', 'Orchestral',
      'Cinematic', 'Epic Music', 'Trailer Music', 'Documentary Music',
      'TV Theme Songs', 'Movie Soundtracks', 'Musical Theatre', 'Broadway',
      'Disney Music', 'Pixar Music', 'Studio Ghibli', 'Hans Zimmer Style'
    ]
  },
  'Experimental': {
    icon: '🧪',
    color: '#95a5a6',
    subgenres: [
      'Noise', 'Drone', 'Field Recordings', 'Musique Concrète',
      'Electroacoustic', 'Microsound', 'Glitch', 'Circuit Bending',
      'Sound Art', 'Installation Music', 'Performance Art', 'Avant-Garde',
      'Free Improvisation', 'Aleatoric', 'Stochastic', 'Spectral Music',
      'Post-Minimalism', 'Post-Rock', 'Math Rock', 'No Wave'
    ]
  }
};

// Music genre modal
function showMusicGenreModal() {
  // Ensure the main AI Playlist button stays visible
  const mainButton = document.querySelector(CONFIG.SELECTORS.AI_PLAYLIST_BUTTON);
  if (mainButton) {
    console.log('🔒 Protecting main AI Playlist button during modal...');
    mainButton.style.pointerEvents = 'none'; // Temporarily disable to prevent conflicts
  }

  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'ai-playlist-modal';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.cssText = `
    background: #1a1a1a;
    border-radius: 20px;
    padding: 40px;
    max-width: 800px;
    width: 95%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    border: 1px solid #333;
    max-height: 90vh;
    overflow-y: auto;
  `;

  // Title
  const title = document.createElement('h2');
  title.textContent = 'Choose Your Music Family';
  title.style.cssText = `
    color: #fff;
    font-size: 28px;
    margin-bottom: 20px;
    font-weight: bold;
  `;

  // Quick Actions Container (Random, Discovery, Templates)
  const quickActionsContainer = document.createElement('div');
  quickActionsContainer.style.cssText = `
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
  `;

  // Random Button Container
  const randomContainer = document.createElement('div');
  randomContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  `;

  // Random Button
  const randomButton = document.createElement('button');
  randomButton.textContent = '🎲 Random Playlist';
  randomButton.title = 'Generate a playlist with random popular genres (Rock, Pop, Electronic, etc.)';
  randomButton.style.cssText = `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  `;

  // Random Description
  const randomDesc = document.createElement('div');
  randomDesc.textContent = 'Popular genres';
  randomDesc.style.cssText = `
    color: #999;
    font-size: 11px;
    text-align: center;
    max-width: 150px;
  `;
  randomButton.addEventListener('mouseenter', () => {
    randomButton.style.transform = 'scale(1.05)';
    randomButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
  });
  randomButton.addEventListener('mouseleave', () => {
    randomButton.style.transform = 'scale(1)';
    randomButton.style.boxShadow = 'none';
  });
  randomButton.addEventListener('click', () => {
    // Clear previous selections
    selectedGenres = [];

    // Get random genres from all available subgenres
    const allSubgenres = [];
    Object.values(musicFamilies).forEach(family => {
      allSubgenres.push(...family.subgenres);
    });

    const numGenres = Math.floor(Math.random() * 2) + 2; // 2-3 genres
    const randomGenres = [];
    for (let i = 0; i < numGenres; i++) {
      const randomGenre = allSubgenres[Math.floor(Math.random() * allSubgenres.length)];
      if (!randomGenres.includes(randomGenre)) {
        randomGenres.push(randomGenre);
      }
    }

    // Add selected genres to the array
    selectedGenres.push(...randomGenres);

    // Update the display
    updateSelectedDisplay();

    // Reset to main family view to show all selections
    currentFamily = null;
    createFamilyButtons();

    // Scroll to selected display to show the user what was selected
    selectedDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Discovery Button Container
  const discoveryContainer = document.createElement('div');
  discoveryContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  `;

  // Discovery Button
  const discoveryButton = document.createElement('button');
  discoveryButton.textContent = '🔍 Discovery Mode';
  discoveryButton.title = 'Explore rare and niche genres (Post-Rock, Shoegaze, Krautrock, etc.)';
  discoveryButton.style.cssText = `
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  `;

  // Discovery Description
  const discoveryDesc = document.createElement('div');
  discoveryDesc.textContent = 'Rare & niche genres';
  discoveryDesc.style.cssText = `
    color: #999;
    font-size: 11px;
    text-align: center;
    max-width: 150px;
  `;
  discoveryButton.addEventListener('mouseenter', () => {
    discoveryButton.style.transform = 'scale(1.05)';
    discoveryButton.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.4)';
  });
  discoveryButton.addEventListener('mouseleave', () => {
    discoveryButton.style.transform = 'scale(1)';
    discoveryButton.style.boxShadow = 'none';
  });
  discoveryButton.addEventListener('click', () => {
    // Clear previous selections
    selectedGenres = [];

    // Get random genres from discovery genres
    const numGenres = Math.floor(Math.random() * 2) + 2; // 2-3 genres rares
    const discoveryGenres = [];
    for (let i = 0; i < numGenres; i++) {
      const randomGenre = CONFIG.DISCOVERY_GENRES[Math.floor(Math.random() * CONFIG.DISCOVERY_GENRES.length)];
      if (!discoveryGenres.includes(randomGenre)) {
        discoveryGenres.push(randomGenre);
      }
    }

    // Add selected genres to the array
    selectedGenres.push(...discoveryGenres);

    // Update the display
    updateSelectedDisplay();

    // Reset to main family view to show all selections
    currentFamily = null;
    createFamilyButtons();

    // Scroll to selected display to show the user what was selected
    selectedDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  randomContainer.appendChild(randomButton);
  randomContainer.appendChild(randomDesc);
  discoveryContainer.appendChild(discoveryButton);
  discoveryContainer.appendChild(discoveryDesc);

  quickActionsContainer.appendChild(randomContainer);
  quickActionsContainer.appendChild(discoveryContainer);

  // Templates Section
  const templatesSection = document.createElement('div');
  templatesSection.style.cssText = `
    margin-bottom: 20px;
    padding: 15px;
    background: #2a2a2a;
    border-radius: 15px;
    border: 1px solid #444;
  `;
  const templatesTitle = document.createElement('div');
  templatesTitle.textContent = '📋 Quick Templates';
  templatesTitle.style.cssText = `
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  `;
  const templatesContainer = document.createElement('div');
  templatesContainer.style.cssText = `
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  `;

  Object.keys(CONFIG.PLAYLIST_TEMPLATES).forEach(templateName => {
    const template = CONFIG.PLAYLIST_TEMPLATES[templateName];
    const templateButton = document.createElement('button');
    templateButton.innerHTML = `${template.icon} ${templateName}`;
    templateButton.style.cssText = `
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 15px;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    templateButton.addEventListener('mouseenter', () => {
      templateButton.style.transform = 'scale(1.05)';
    });
    templateButton.addEventListener('mouseleave', () => {
      templateButton.style.transform = 'scale(1)';
    });
    templateButton.addEventListener('click', () => {
      // Helper function to get random subgenres from a family
      function getRandomSubgenresFromFamily(familyName, count = 2) {
        if (!musicFamilies[familyName]) {
          // If it's not a family name, check if it's already a subgenre
          for (const [family, data] of Object.entries(musicFamilies)) {
            if (data.subgenres.includes(familyName)) {
              return [familyName]; // Already a subgenre, return it as is
            }
          }
          // If not found, return as is (might be a valid subgenre we don't know about)
          return [familyName];
        }

        // Get random subgenres from the family
        const subgenres = musicFamilies[familyName].subgenres;
        const shuffled = [...subgenres].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, subgenres.length));
      }

      // Clear previous selections
      selectedGenres = [];

      // Map template genres to random subgenres and add them
      template.genres.forEach(genre => {
        const subgenres = getRandomSubgenresFromFamily(genre, 2); // Get 2 random subgenres per family
        subgenres.forEach(subgenre => {
          if (!selectedGenres.includes(subgenre)) {
            selectedGenres.push(subgenre);
          }
        });
      });

      // Update the display
      updateSelectedDisplay();

      // If we're currently viewing subgenres, reload that view to show selected state
      if (currentFamily) {
        showSubgenres(currentFamily);
      } else {
        // Reset to main family view to show all selections
        createFamilyButtons();
      }

      // Scroll to selected display to show the user what was selected
      selectedDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    templatesContainer.appendChild(templateButton);
  });

  templatesSection.appendChild(templatesTitle);
  templatesSection.appendChild(templatesContainer);

  // Add responsive styles
  const responsiveStyles = document.createElement('style');
  responsiveStyles.textContent = `
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
      
      /* Grid layout for many subgenres */
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
      
      /* Search container mobile */
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
      
      /* Grid layout for very small screens */
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
      
      /* Search container for very small screens */
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
  `;
  document.head.appendChild(responsiveStyles);

  // Navigation breadcrumb
  const breadcrumb = document.createElement('div');
  breadcrumb.id = 'breadcrumb';
  breadcrumb.style.cssText = `
    color: #999;
    margin-bottom: 20px;
    font-size: 14px;
  `;
  breadcrumb.textContent = 'Main Categories';

  // Container for current view
  const viewContainer = document.createElement('div');
  viewContainer.id = 'view-container';
  viewContainer.style.cssText = `
    position: relative;
    width: 600px;
    height: 600px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  // Track selected genres and current view
  let selectedGenres = [];
  let currentFamily = null;

  // Function to create family buttons
  function createFamilyButtons() {
    viewContainer.innerHTML = '';
    const families = Object.keys(musicFamilies);
    const angleStep = 360 / families.length;

    families.forEach((familyName, index) => {
      const family = musicFamilies[familyName];
      const button = document.createElement('button');
      button.className = 'family-button';
      button.innerHTML = `
        <div style="font-size: 28px; margin-bottom: 5px;">${family.icon}</div>
        <div style="font-size: 11px; font-weight: bold; text-align: center; line-height: 1.1;">${familyName}</div>
      `;

      const angle = index * angleStep;
      // Responsive radius based on screen size
      const screenWidth = window.innerWidth;
      const radius = screenWidth <= 480 ? 120 : screenWidth <= 768 ? 150 : 200;
      const x = Math.cos(angle * Math.PI / 180) * radius;
      const y = Math.sin(angle * Math.PI / 180) * radius;

      button.style.cssText = `
        position: absolute;
        width: 90px;
        height: 90px;
        border-radius: 50%;
        border: 2px solid ${family.color};
        background: linear-gradient(135deg, ${family.color}20, ${family.color}40);
        color: #fff;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translate(${x}px, ${y}px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
        font-size: 12px;
        z-index: 1;
      `;

      button.addEventListener('mouseenter', () => {
        button.style.transform = `translate(${x}px, ${y}px) scale(1.3)`;
        button.style.boxShadow = `0 12px 35px ${family.color}80, 0 6px 20px rgba(0, 0, 0, 0.4)`;
        button.style.zIndex = '10';
        button.style.border = `3px solid ${family.color}`;
        button.style.background = `linear-gradient(135deg, ${family.color}40, ${family.color}60)`;
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        button.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.3)';
        button.style.zIndex = '1';
        button.style.border = `2px solid ${family.color}`;
        button.style.background = `linear-gradient(135deg, ${family.color}20, ${family.color}40)`;
      });

      button.addEventListener('click', () => {
        showSubgenres(familyName);
      });

      viewContainer.appendChild(button);
    });

    // Center AI icon
    const centerCircle = document.createElement('div');
    centerCircle.style.cssText = `
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 10;
    `;
    centerCircle.innerHTML = '🤖';
    viewContainer.appendChild(centerCircle);
  }

  // Function to show subgenres
  function showSubgenres(familyName) {
    currentFamily = familyName;
    const family = musicFamilies[familyName];
    viewContainer.innerHTML = '';

    // Update breadcrumb
    breadcrumb.innerHTML = `Main Categories > <span style="color: ${family.color}">${familyName}</span>`;

    // Get subgenres first
    const subgenres = family.subgenres;

    // Add search functionality for large subgenre lists
    if (subgenres.length > 20) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'search-container';
      searchContainer.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        right: 20px;
        height: 50px;
        display: flex;
        align-items: center;
        background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
        border-radius: 25px;
        border: 2px solid #333;
        padding: 0 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      `;

      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = `Search ${familyName} subgenres...`;
      searchInput.style.cssText = `
        flex: 1;
        background: transparent;
        border: none;
        color: #fff;
        font-size: 14px;
        outline: none;
        padding: 0 10px;
      `;

      const searchIcon = document.createElement('div');
      searchIcon.innerHTML = '🔍';
      searchIcon.style.cssText = `
        font-size: 18px;
        margin-right: 10px;
        opacity: 0.7;
      `;

      searchContainer.appendChild(searchIcon);
      searchContainer.appendChild(searchInput);
      viewContainer.appendChild(searchContainer);

      // Store reference to search input for filtering
      window.currentSearchInput = searchInput;
    }

    // Back button
    const backButton = document.createElement('button');
    backButton.innerHTML = '← Back';
    backButton.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: #333;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      z-index: 20;
    `;
    backButton.addEventListener('click', () => {
      currentFamily = null;
      breadcrumb.textContent = 'Main Categories';
      createFamilyButtons();
    });
    viewContainer.appendChild(backButton);

    // Create subgenre buttons with improved layout

    // If there are too many subgenres, use a grid layout instead of circular
    if (subgenres.length > 20) {
      // Create a scrollable grid container with improved styling
      const gridContainer = document.createElement('div');
      gridContainer.className = 'subgenre-grid-container';
      gridContainer.style.cssText = `
        position: absolute;
        top: 80px;
        left: 20px;
        right: 20px;
        bottom: 20px;
        overflow-y: auto;
        overflow-x: hidden;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
        padding: 20px;
        max-height: 450px;
        background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
        border-radius: 20px;
        border: 2px solid #333;
        box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3);
        scrollbar-width: thin;
        scrollbar-color: #666 #333;
        backdrop-filter: blur(10px);
      `;

      // Add custom scrollbar styling and animations
      const scrollbarStyle = document.createElement('style');
      scrollbarStyle.textContent = `
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
        
        /* Smooth animations for grid items */
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
        
        /* Staggered animation for grid items */
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
        
        /* Search container focus animation */
        .search-container:focus-within {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          border-color: #1db954;
        }
        
        /* Smooth search filtering */
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
      `;
      document.head.appendChild(scrollbarStyle);

      subgenres.forEach((subgenre) => {
        const button = document.createElement('button');
        button.className = 'subgenre-button subgenre-grid-button';
        button.innerHTML = `
          <div style="font-size: 12px; font-weight: bold; text-align: center; line-height: 1.2;">${subgenre}</div>
        `;

        // Check if this subgenre is already selected
        const isAlreadySelected = selectedGenres.includes(subgenre);

        button.style.cssText = `
          width: 100%;
          height: 70px;
          border-radius: 15px;
          border: ${isAlreadySelected ? '3px solid #fff' : `2px solid ${family.color}`};
          background: ${isAlreadySelected ? `linear-gradient(135deg, ${family.color}, ${family.color}dd)` : `linear-gradient(135deg, ${family.color}15, ${family.color}25)`};
          color: #fff;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          padding: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: ${isAlreadySelected ? `0 12px 30px ${family.color}80, 0 6px 15px rgba(0, 0, 0, 0.4)` : '0 4px 12px rgba(0, 0, 0, 0.2)'};
          transform: ${isAlreadySelected ? 'scale(1.05) translateY(-3px)' : 'scale(1) translateY(0)'};
        `;

        button.addEventListener('click', () => {
          // Toggle selection
          const isSelected = selectedGenres.includes(subgenre);

          if (isSelected) {
            // Remove from selection
            selectedGenres = selectedGenres.filter(g => g !== subgenre);
            button.style.background = `linear-gradient(135deg, ${family.color}15, ${family.color}25)`;
            button.style.border = `2px solid ${family.color}`;
            button.style.transform = 'scale(1) translateY(0)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            button.style.color = '#fff';
          } else {
            // Add to selection
            selectedGenres.push(subgenre);
            button.style.background = `linear-gradient(135deg, ${family.color}, ${family.color}dd)`;
            button.style.border = `3px solid #fff`;
            button.style.transform = 'scale(1.05) translateY(-3px)';
            button.style.boxShadow = `0 12px 30px ${family.color}80, 0 6px 15px rgba(0, 0, 0, 0.4)`;
            button.style.color = '#fff';
          }

          updateSelectedDisplay();
        });

        button.addEventListener('mouseenter', () => {
          if (!selectedGenres.includes(subgenre)) {
            button.style.transform = 'scale(1.08) translateY(-2px)';
            button.style.boxShadow = `0 8px 25px ${family.color}60, 0 4px 12px rgba(0, 0, 0, 0.3)`;
            button.style.background = `linear-gradient(135deg, ${family.color}30, ${family.color}50)`;
            button.style.border = `2px solid ${family.color}cc`;
          }
        });

        button.addEventListener('mouseleave', () => {
          if (!selectedGenres.includes(subgenre)) {
            button.style.transform = 'scale(1) translateY(0)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            button.style.background = `linear-gradient(135deg, ${family.color}15, ${family.color}25)`;
            button.style.border = `2px solid ${family.color}`;
          }
        });

        gridContainer.appendChild(button);
      });

      viewContainer.appendChild(gridContainer);

      // Add search functionality after grid is created
      if (window.currentSearchInput) {
        window.currentSearchInput.addEventListener('input', (e) => {
          const searchTerm = e.target.value.toLowerCase();
          const buttons = gridContainer.querySelectorAll('.subgenre-grid-button');

          buttons.forEach(button => {
            const subgenreText = button.textContent.toLowerCase();
            if (subgenreText.includes(searchTerm)) {
              button.classList.remove('hidden');
              button.classList.add('visible');
              button.style.display = 'flex';
            } else {
              button.classList.remove('visible');
              button.classList.add('hidden');
              setTimeout(() => {
                if (button.classList.contains('hidden')) {
                  button.style.display = 'none';
                }
              }, 300);
            }
          });
        });
      }
    } else {
      // Use circular layout for smaller numbers of subgenres
      const angleStep = 360 / subgenres.length;

      subgenres.forEach((subgenre, index) => {
        const button = document.createElement('button');
        button.className = 'subgenre-button';
        button.innerHTML = `
        <div style="font-size: 14px; font-weight: bold;">${subgenre}</div>
      `;

        const angle = index * angleStep;
        // Responsive radius for subgenres
        const screenWidth = window.innerWidth;
        const radius = screenWidth <= 480 ? 100 : screenWidth <= 768 ? 130 : 180;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;

        // Check if this subgenre is already selected
        const isAlreadySelected = selectedGenres.includes(subgenre);

        button.style.cssText = `
        position: absolute;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: ${isAlreadySelected ? '3px solid #fff' : `2px solid ${family.color}`};
        background: ${isAlreadySelected ? `linear-gradient(135deg, ${family.color}, ${family.color}cc)` : `linear-gradient(135deg, ${family.color}20, ${family.color}40)`};
        color: #fff;
        cursor: pointer;
        transition: all 0.3s ease;
        transform: translate(${x}px, ${y}px) ${isAlreadySelected ? 'scale(1.05)' : 'scale(1)'};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: ${isAlreadySelected ? `0 12px 30px ${family.color}80, 0 6px 15px rgba(0, 0, 0, 0.4)` : '0 4px 15px rgba(0, 0, 0, 0.3)'};
        font-size: 12px;
        text-align: center;
        padding: 5px;
      `;

        button.addEventListener('mouseenter', () => {
          if (!isAlreadySelected) {
            button.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
            button.style.boxShadow = `0 8px 25px ${family.color}50`;
          }
        });

        button.addEventListener('mouseleave', () => {
          if (!isAlreadySelected) {
            button.style.transform = `translate(${x}px, ${y}px) scale(1)`;
            button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
          } else {
            button.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
            button.style.boxShadow = `0 12px 30px ${family.color}80, 0 6px 15px rgba(0, 0, 0, 0.4)`;
          }
        });

        button.addEventListener('click', () => {
          // Toggle selection
          const isSelected = selectedGenres.includes(subgenre);

          if (isSelected) {
            // Remove from selection
            selectedGenres = selectedGenres.filter(g => g !== subgenre);
            button.style.background = `linear-gradient(135deg, ${family.color}20, ${family.color}40)`;
            button.style.border = `2px solid ${family.color}`;
            button.style.transform = `translate(${x}px, ${y}px) scale(1)`;
          } else {
            // Add to selection
            selectedGenres.push(subgenre);
            button.style.background = `linear-gradient(135deg, ${family.color}, ${family.color}cc)`;
            button.style.border = `2px solid #fff`;
            button.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
          }

          updateSelectedDisplay();
        });

        viewContainer.appendChild(button);
      });

      // Center family icon
      const centerCircle = document.createElement('div');
      centerCircle.style.cssText = `
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${family.color}, ${family.color}cc);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 10;
    `;
      centerCircle.innerHTML = family.icon;
      viewContainer.appendChild(centerCircle);
    }
  }

  // Initialize with family buttons
  createFamilyButtons();

  // Selected genres display
  const selectedDisplay = document.createElement('div');
  selectedDisplay.id = 'selected-genres-display';
  selectedDisplay.style.cssText = `
    margin-top: 30px;
    padding: 20px;
    background: #2a2a2a;
    border-radius: 15px;
    border: 1px solid #444;
    min-height: 60px;
  `;

  // Song count logic
  let selectedSongCount = 5; // Default song count

  // Create song count selector
  const songCountContainer = document.createElement('div');
  songCountContainer.id = 'song-count-container';
  songCountContainer.style.cssText = `
    margin: 20px 0;
    padding: 20px;
    background: #2a2a2a;
    border-radius: 15px;
    border: 1px solid #444;
    text-align: center;
  `;

  const songCountLabel = document.createElement('div');
  songCountLabel.textContent = 'Number of Songs';
  songCountLabel.style.cssText = `
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  `;

  const songCountSelector = document.createElement('div');
  songCountSelector.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  `;

  // Create song count options
  const songCounts = [3, 5, 8, 10, 15, 20];
  songCounts.forEach(count => {
    const button = document.createElement('button');
    button.textContent = count.toString();
    button.className = 'song-count-btn';
    button.style.cssText = `
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #1db954;
      background: ${count === 5 ? 'linear-gradient(135deg, #1db954, #1ed760)' : 'transparent'};
      color: ${count === 5 ? 'white' : '#1db954'};
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    button.addEventListener('click', () => {
      // Remove selection from all buttons
      songCountSelector.querySelectorAll('.song-count-btn').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = '#1db954';
      });

      // Select current button
      button.style.background = 'linear-gradient(135deg, #1db954, #1ed760)';
      button.style.color = 'white';

      selectedSongCount = count;
    });

    button.addEventListener('mouseenter', () => {
      if (button.style.background === 'transparent') {
        button.style.background = '#1db95420';
        button.style.color = '#1db954';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (button.style.background.includes('20')) {
        button.style.background = 'transparent';
        button.style.color = '#1db954';
      }
    });

    songCountSelector.appendChild(button);
  });

  songCountContainer.appendChild(songCountLabel);
  songCountContainer.appendChild(songCountSelector);

  // Advanced Filters Section
  const filtersSection = document.createElement('div');
  filtersSection.style.cssText = `
    margin: 20px 0;
    padding: 20px;
    background: #2a2a2a;
    border-radius: 15px;
    border: 1px solid #444;
  `;

  const filtersTitle = document.createElement('div');
  filtersTitle.textContent = '🎛️ Advanced Filters (Optional)';
  filtersTitle.style.cssText = `
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  `;

  // Track selected filters
  let selectedDecade = null;
  let selectedMood = null;
  let selectedDuration = null;
  let selectedCountry = null;

  // Decade Filter
  const decadeContainer = document.createElement('div');
  decadeContainer.style.cssText = `margin-bottom: 15px;`;
  const decadeLabel = document.createElement('div');
  decadeLabel.textContent = '📅 Decade:';
  decadeLabel.style.cssText = `color: #999; font-size: 14px; margin-bottom: 8px;`;
  const decadeButtons = document.createElement('div');
  decadeButtons.style.cssText = `display: flex; gap: 8px; flex-wrap: wrap;`;

  CONFIG.DECADES.forEach(decade => {
    const btn = document.createElement('button');
    btn.innerHTML = `${decade.icon} ${decade.label.split(' ')[1]}`;
    btn.style.cssText = `
      padding: 6px 12px;
      border-radius: 15px;
      border: 2px solid #555;
      background: transparent;
      color: #999;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    btn.addEventListener('click', () => {
      decadeButtons.querySelectorAll('button').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#999';
        b.style.borderColor = '#555';
      });
      btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
      btn.style.color = 'white';
      btn.style.borderColor = '#667eea';
      selectedDecade = decade.value;
    });
    decadeButtons.appendChild(btn);
  });
  decadeContainer.appendChild(decadeLabel);
  decadeContainer.appendChild(decadeButtons);

  // Mood Filter
  const moodContainer = document.createElement('div');
  moodContainer.style.cssText = `margin-bottom: 15px;`;
  const moodLabel = document.createElement('div');
  moodLabel.textContent = '😊 Mood:';
  moodLabel.style.cssText = `color: #999; font-size: 14px; margin-bottom: 8px;`;
  const moodButtons = document.createElement('div');
  moodButtons.style.cssText = `display: flex; gap: 8px; flex-wrap: wrap;`;

  CONFIG.MOODS.forEach(mood => {
    const btn = document.createElement('button');
    btn.innerHTML = `${mood.icon} ${mood.label}`;
    btn.style.cssText = `
      padding: 6px 12px;
      border-radius: 15px;
      border: 2px solid ${mood.color};
      background: transparent;
      color: ${mood.color};
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    btn.addEventListener('click', () => {
      moodButtons.querySelectorAll('button').forEach(b => {
        const originalMood = CONFIG.MOODS.find(m => b.textContent.includes(m.label));
        b.style.background = 'transparent';
        b.style.color = originalMood.color;
        b.style.borderColor = originalMood.color;
      });
      btn.style.background = mood.color;
      btn.style.color = 'white';
      btn.style.borderColor = mood.color;
      selectedMood = mood.value;
    });
    moodButtons.appendChild(btn);
  });
  moodContainer.appendChild(moodLabel);
  moodContainer.appendChild(moodButtons);

  // Duration Filter
  const durationContainer = document.createElement('div');
  const durationLabel = document.createElement('div');
  durationLabel.textContent = '⏱️ Duration:';
  durationLabel.style.cssText = `color: #999; font-size: 14px; margin-bottom: 8px;`;
  const durationButtons = document.createElement('div');
  durationButtons.style.cssText = `display: flex; gap: 8px; flex-wrap: wrap;`;

  CONFIG.DURATIONS.forEach(duration => {
    const btn = document.createElement('button');
    btn.innerHTML = `${duration.icon} ${duration.label.split(' ')[0]}`;
    btn.style.cssText = `
      padding: 6px 12px;
      border-radius: 15px;
      border: 2px solid #1db954;
      background: transparent;
      color: #1db954;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    btn.addEventListener('click', () => {
      durationButtons.querySelectorAll('button').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#1db954';
        b.style.borderColor = '#1db954';
      });
      btn.style.background = 'linear-gradient(135deg, #1db954, #1ed760)';
      btn.style.color = 'white';
      btn.style.borderColor = '#1db954';
      selectedDuration = duration.value;
      // Adjust song count based on duration
      if (duration.value === 'short') selectedSongCount = 5;
      else if (duration.value === 'medium') selectedSongCount = 10;
      else if (duration.value === 'long') selectedSongCount = 20;
    });
    durationButtons.appendChild(btn);
  });
  durationContainer.appendChild(durationLabel);
  durationContainer.appendChild(durationButtons);

  // Country Origin Filter
  const countryContainer = document.createElement('div');
  countryContainer.style.cssText = `margin-bottom: 15px;`;
  const countryLabel = document.createElement('div');
  countryLabel.textContent = '🌍 Country Origin:';
  countryLabel.style.cssText = `color: #999; font-size: 14px; margin-bottom: 8px;`;
  const countryButtons = document.createElement('div');
  countryButtons.style.cssText = `display: flex; gap: 8px; flex-wrap: wrap;`;

  CONFIG.COUNTRIES.forEach(country => {
    const btn = document.createElement('button');
    btn.innerHTML = `${country.icon} ${country.label}`;
    btn.style.cssText = `
      padding: 6px 12px;
      border-radius: 15px;
      border: 2px solid #667eea;
      background: ${country.value === null ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent'};
      color: ${country.value === null ? 'white' : '#667eea'};
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    btn.addEventListener('click', () => {
      countryButtons.querySelectorAll('button').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#667eea';
        b.style.borderColor = '#667eea';
      });
      btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
      btn.style.color = 'white';
      btn.style.borderColor = '#667eea';
      selectedCountry = country.value;
    });
    countryButtons.appendChild(btn);
  });
  countryContainer.appendChild(countryLabel);
  countryContainer.appendChild(countryButtons);

  filtersSection.appendChild(filtersTitle);
  filtersSection.appendChild(decadeContainer);
  filtersSection.appendChild(moodContainer);
  filtersSection.appendChild(durationContainer);
  filtersSection.appendChild(countryContainer);

  // Check if there's a selected playlist
  const selectedPlaylist = localStorage.getItem('selectedPlaylist');
  let selectedPlaylistData = null;
  if (selectedPlaylist) {
    try {
      selectedPlaylistData = JSON.parse(selectedPlaylist);
    } catch (e) {
      console.log('Error parsing selected playlist:', e);
    }
  }

  // Choose Playlist button (always visible)
  const choosePlaylistButton = document.createElement('button');
  choosePlaylistButton.textContent = selectedPlaylistData
    ? `📋 Change Selected Playlist (${selectedPlaylistData.name})`
    : '📋 Choose Playlist to Add Songs';
  choosePlaylistButton.style.cssText = `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 20px;
    transition: all 0.3s ease;
  `;

  choosePlaylistButton.addEventListener('mouseenter', () => {
    choosePlaylistButton.style.transform = 'scale(1.05)';
    choosePlaylistButton.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
  });

  choosePlaylistButton.addEventListener('mouseleave', () => {
    choosePlaylistButton.style.transform = 'scale(1)';
    choosePlaylistButton.style.boxShadow = 'none';
  });

  choosePlaylistButton.addEventListener('click', () => {
    // Close the current modal
    const modal = document.getElementById('ai-playlist-modal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    reEnableMainAIButton();

    // Show instructions to select a playlist
    const instructionModal = document.createElement('div');
    instructionModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
      backdrop-filter: blur(5px);
    `;

    const instructionContent = document.createElement('div');
    instructionContent.style.cssText = `
      background: #1a1a1a;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      border: 1px solid #333;
    `;

    instructionContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
      <h2 style="color: #667eea; font-size: 24px; margin-bottom: 20px; font-weight: bold;">
        Choose a Playlist
      </h2>
      <p style="color: #fff; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
        To add AI-generated songs to a playlist:<br><br>
        1. Navigate to the playlist you want to use<br>
        2. Click the <strong style="color: #667eea;">✓ Choose Playlist</strong> button on that playlist page<br>
        3. Then open the AI Playlist Generator again
      </p>
      <button id="close-instruction-modal" style="
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      ">Got it!</button>
    `;

    instructionModal.appendChild(instructionContent);
    document.body.appendChild(instructionModal);

    // Close button handler
    document.getElementById('close-instruction-modal').addEventListener('click', () => {
      instructionModal.remove();
    });

    // Close on overlay click
    instructionModal.addEventListener('click', (e) => {
      if (e.target === instructionModal) {
        instructionModal.remove();
      }
    });
  });

  // Create button
  const createButton = document.createElement('button');
  createButton.textContent = 'Create AI Playlist';
  createButton.style.cssText = `
    background: linear-gradient(135deg, #1db954, #1ed760);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 20px;
    transition: all 0.3s ease;
    opacity: 0.5;
    pointer-events: none;
  `;

  // Use Selected Playlist button (only show if there's a selected playlist)
  let useSelectedPlaylistButton = null;
  if (selectedPlaylistData) {
    useSelectedPlaylistButton = document.createElement('button');
    useSelectedPlaylistButton.textContent = `Use Selected Playlist: ${selectedPlaylistData.name}`;
    useSelectedPlaylistButton.style.cssText = `
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
      transition: all 0.3s ease;
      opacity: 0.5;
      pointer-events: none;
    `;
  }

  // Add event listener for Use Selected Playlist button
  if (useSelectedPlaylistButton) {
    useSelectedPlaylistButton.addEventListener('mouseenter', () => {
      if (selectedGenres.length > 0) {
        useSelectedPlaylistButton.style.transform = 'scale(1.05)';
        useSelectedPlaylistButton.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
      }
    });

    useSelectedPlaylistButton.addEventListener('mouseleave', () => {
      useSelectedPlaylistButton.style.transform = 'scale(1)';
      useSelectedPlaylistButton.style.boxShadow = 'none';
    });

    useSelectedPlaylistButton.addEventListener('click', async () => {
      if (selectedGenres.length > 0) {
        // Show loading state
        useSelectedPlaylistButton.textContent = '🤖 AI Generation...';
        toggleButtonsState(true, true);

        // Add animation
        useSelectedPlaylistButton.style.animation = 'pulse 1.5s infinite';
        const pulseStyle = document.createElement('style');
        pulseStyle.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(pulseStyle);

        try {
          // Call the AI to generate songs (utilise le module API)
          const playlistData = await window.generatePlaylist(selectedGenres, selectedSongCount, selectedCountry);

          if (!playlistData || !playlistData.playlist) {
            throw new Error('Invalid server response format');
          }

          // Close the modal
          const modal = document.getElementById('ai-playlist-modal');
          if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
          }
          // Re-enable the main AI Playlist button when modal closes
          reEnableMainAIButton();

          // Show the results and add to selected playlist
          showPlaylistResultsForAdding(playlistData, selectedPlaylistData.id);

        } catch (error) {
          if (error.message.includes('Failed to fetch')) {
            alert(`Server connection error. Please check that the server is running on ${CONFIG.API_BASE_URL}`);
          } else if (error.message.includes('Tous les modèles Gemini sont indisponibles') || error.message.includes('models/gemini-1.5-pro is not found')) {
            alert('🚫 We got a problem with our AI service. Please come back later when our AI models are available again. Sorry for the inconvenience!');
          } else {
            alert(`Error generating playlist: ${error.message}`);
          }
        } finally {
          // Restore button
          useSelectedPlaylistButton.textContent = `Use Selected Playlist: ${selectedPlaylistData.name}`;
          useSelectedPlaylistButton.disabled = false;
          useSelectedPlaylistButton.style.opacity = '1';
          useSelectedPlaylistButton.style.animation = 'none';
        }
      } else {
        alert('Please select at least one music style to create a playlist.');
      }
    });
  }

  createButton.addEventListener('mouseenter', () => {
    if (selectedGenres.length > 0) {
      createButton.style.transform = 'scale(1.05)';
      createButton.style.boxShadow = '0 8px 25px rgba(29, 185, 84, 0.4)';
    }
  });

  createButton.addEventListener('mouseleave', () => {
    createButton.style.transform = 'scale(1)';
    createButton.style.boxShadow = 'none';
  });

  createButton.addEventListener('click', async () => {
    if (selectedGenres.length > 0) {

      // Afficher un loader avec animation
      createButton.textContent = '🤖 AI Generation...';
      createButton.disabled = true;
      createButton.style.opacity = '0.7';

      // Ajouter une animation de pulsation
      createButton.style.animation = 'pulse 1.5s infinite';
      const pulseStyle = document.createElement('style');
      pulseStyle.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(pulseStyle);

      try {
        // Appel au serveur AI pour générer la playlist (utilise le module API)
        const playlistData = await window.generatePlaylist(selectedGenres, selectedSongCount, selectedCountry);

        // Vérifier que la réponse contient les données attendues
        if (!playlistData || !playlistData.playlist) {
          throw new Error('Invalid server response format');
        }


        // S'assurer que la structure de données est correcte pour Spotify
        const spotifyPlaylistData = {
          name: playlistData.playlist.name || 'AI Generated Playlist',
          description: playlistData.playlist.description || 'Generated by AI',
          songs: (playlistData.playlist.songs || []).map(song => ({
            title: song.title,
            artist: song.artist
          }))
        };


        // Afficher les résultats
        showPlaylistResults(playlistData);

      } catch (error) {
        if (error.message.includes('Failed to fetch')) {
          alert('Server connection error. Please check that the server is running on https://gemini.niperiusland.fr:4005');
        } else if (error.message.includes('Tous les modèles Gemini sont indisponibles') || error.message.includes('models/gemini-1.5-pro is not found')) {
          alert('🚫 We got a problem with our AI service. Please come back later when our AI models are available again. Sorry for the inconvenience!');
        } else {
          alert(`Error generating playlist: ${error.message}`);
        }
      } finally {
        // Restaurer le bouton
        createButton.textContent = 'Create AI Playlist';
        createButton.disabled = false;
        createButton.style.opacity = '1';
        createButton.style.animation = 'none';
      }
    } else {
      alert('Please select at least one music style to create a playlist.');
    }
  });


  // Function to update the visual state of a subgenre button when removed
  function updateSubgenreButtonVisualState(genreToRemove) {
    // Only update if we're currently viewing subgenres (not the main family view)
    if (!currentFamily) {
      return; // We're on the main family view, no subgenre buttons to update
    }

    // Find the subgenre button in the current view
    const subgenreButtons = viewContainer.querySelectorAll('.subgenre-button');
    subgenreButtons.forEach(button => {
      const buttonText = button.textContent.trim();
      if (buttonText === genreToRemove) {
        // Reset the button to unselected state
        const isSelected = selectedGenres.includes(genreToRemove);

        if (!isSelected) {
          // Find the family data for this genre
          let familyData = null;
          for (const [family, data] of Object.entries(musicFamilies)) {
            if (data.subgenres.includes(genreToRemove)) {
              familyData = data;
              break;
            }
          }

          if (familyData) {
            // Reset to unselected state
            button.style.background = `linear-gradient(135deg, ${familyData.color}20, ${familyData.color}40)`;
            button.style.border = `2px solid ${familyData.color}`;
            button.style.transform = button.style.transform.replace('scale(1.05)', 'scale(1)');
          }
        }
      }
    });
  }

  // Function to update selected display
  function updateSelectedDisplay() {
    if (selectedGenres.length === 0) {
      selectedDisplay.innerHTML = `
        <div style="color: #999; text-align: center; font-style: italic;">
          Select one or more music styles to create your AI playlist
        </div>
      `;
      createButton.style.opacity = '0.5';
      createButton.style.pointerEvents = 'none';
    } else {
      const genreElements = selectedGenres.map(genre => {
        // Find which family this genre belongs to
        let familyData = null;
        let familyName = '';

        for (const [family, data] of Object.entries(musicFamilies)) {
          if (data.subgenres.includes(genre)) {
            familyData = data;
            familyName = family;
            break;
          }
        }

        if (familyData) {
          return `
            <div style="
              display: inline-flex;
              align-items: center;
              background: ${familyData.color}20;
              color: ${familyData.color};
              padding: 8px 15px;
              margin: 5px;
              border-radius: 20px;
              border: 1px solid ${familyData.color};
              font-size: 14px;
              font-weight: bold;
              position: relative;
            ">
              <span>${familyData.icon} ${genre}</span>
              <button class="remove-genre-btn" data-genre="${genre}" style="
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                margin-left: 8px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
              " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">×</button>
            </div>
          `;
        } else {
          // Fallback for unknown genres
          return `
            <div style="
              display: inline-flex;
              align-items: center;
              background: #66620;
              color: #666;
              padding: 8px 15px;
              margin: 5px;
              border-radius: 20px;
              border: 1px solid #666;
              font-size: 14px;
              font-weight: bold;
              position: relative;
            ">
              <span>🎵 ${genre}</span>
              <button class="remove-genre-btn" data-genre="${genre}" style="
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                margin-left: 8px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
              " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">×</button>
            </div>
          `;
        }
      }).join('');

      selectedDisplay.innerHTML = `
        <div style="color: #fff; margin-bottom: 10px; font-weight: bold;">
          Selected Styles (${selectedGenres.length}):
        </div>
        <div>${genreElements}</div>
      `;

      // Add event listeners to remove buttons
      selectedDisplay.querySelectorAll('.remove-genre-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const genreToRemove = button.getAttribute('data-genre');
          selectedGenres = selectedGenres.filter(genre => genre !== genreToRemove);

          // Update the visual state of the subgenre button in the circle
          updateSubgenreButtonVisualState(genreToRemove);

          updateSelectedDisplay();
        });
      });

      createButton.style.opacity = '1';
      createButton.style.pointerEvents = 'auto';

      // Also enable the Use Selected Playlist button if it exists
      if (useSelectedPlaylistButton) {
        useSelectedPlaylistButton.style.opacity = '1';
        useSelectedPlaylistButton.style.pointerEvents = 'auto';
      }
    }
  }

  // Function to show playlist results
  function showPlaylistResults(playlistData) {
    // Close all existing modals
    const existingModal = document.getElementById('ai-playlist-modal');
    const existingResultsModal = document.getElementById('playlist-results-modal');

    if (existingModal) {
      existingModal.remove();
    }
    if (existingResultsModal) {
      existingResultsModal.remove();
    }

    // Create a new modal for results
    const resultsModal = document.createElement('div');
    resultsModal.id = 'playlist-results-modal';
    resultsModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
      backdrop-filter: blur(5px);
    `;

    const resultsContent = document.createElement('div');
    resultsContent.className = 'results-modal-content';
    resultsContent.style.cssText = `
      background: #1a1a1a;
      border-radius: 20px;
      padding: 40px;
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      border: 1px solid #333;
    `;

    // Add responsive styles for results modal
    const resultsResponsiveStyles = document.createElement('style');
    resultsResponsiveStyles.textContent = `
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
    `;
    document.head.appendChild(resultsResponsiveStyles);

    // Titre de la playlist
    const playlistTitle = document.createElement('h2');
    playlistTitle.textContent = playlistData.playlist.name;
    playlistTitle.style.cssText = `
      color: #1db954;
      font-size: 28px;
      margin-bottom: 15px;
      font-weight: bold;
    `;

    // Description
    const playlistDesc = document.createElement('p');
    playlistDesc.textContent = playlistData.playlist.description;
    playlistDesc.style.cssText = `
      color: #fff;
      font-size: 16px;
      margin-bottom: 30px;
      opacity: 0.8;
    `;

    // Liste des chansons
    const songsList = document.createElement('div');
    songsList.style.cssText = `
      text-align: left;
      margin-bottom: 30px;
    `;

    // Track selected songs (all selected by default)
    const selectedSongs = new Set(playlistData.playlist.songs.map((_, index) => index));

    // Select All / Deselect All controls
    const selectAllContainer = document.createElement('div');
    selectAllContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding: 10px;
      background: #2a2a2a;
      border-radius: 10px;
    `;

    const selectAllLabel = document.createElement('label');
    selectAllLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
    `;

    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.checked = true;
    selectAllCheckbox.style.cssText = `
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #667eea;
    `;

    const selectedCount = document.createElement('span');
    selectedCount.textContent = `${selectedSongs.size} of ${playlistData.playlist.songs.length} selected`;
    selectedCount.style.cssText = `
      color: #667eea;
      font-size: 14px;
      font-weight: bold;
    `;

    selectAllLabel.appendChild(selectAllCheckbox);
    selectAllLabel.appendChild(document.createTextNode('Select All'));
    selectAllContainer.appendChild(selectAllLabel);
    selectAllContainer.appendChild(selectedCount);

    // Select All / Deselect All functionality
    selectAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      selectedSongs.clear();

      if (isChecked) {
        playlistData.playlist.songs.forEach((_, index) => selectedSongs.add(index));
      }

      // Update all checkboxes
      songsList.querySelectorAll('input[type="checkbox"][data-song-index]').forEach(checkbox => {
        checkbox.checked = isChecked;
        const songIndex = parseInt(checkbox.getAttribute('data-song-index'));
        const songItem = checkbox.closest('.song-item');
        if (isChecked) {
          songItem.style.opacity = '1';
          songItem.style.background = '';
        } else {
          songItem.style.opacity = '0.5';
          songItem.style.background = '#2a2a2a';
        }
      });

      selectedCount.textContent = `${selectedSongs.size} of ${playlistData.playlist.songs.length} selected`;
    });

    playlistData.playlist.songs.forEach((song, index) => {
      const songItem = document.createElement('div');
      songItem.className = 'song-item';
      songItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        margin-bottom: 10px;
        background: #2a2a2a;
        border-radius: 10px;
        border: 2px solid transparent;
        transition: all 0.2s ease;
      `;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.setAttribute('data-song-index', index);
      checkbox.style.cssText = `
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #667eea;
        flex-shrink: 0;
      `;

      checkbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
          selectedSongs.add(index);
          songItem.style.opacity = '1';
          songItem.style.background = '#2a2a2a';
        } else {
          selectedSongs.delete(index);
          songItem.style.opacity = '0.5';
          songItem.style.background = '#1a1a1a';
        }

        // Update select all checkbox
        selectAllCheckbox.checked = selectedSongs.size === playlistData.playlist.songs.length;
        selectedCount.textContent = `${selectedSongs.size} of ${playlistData.playlist.songs.length} selected`;
      });

      const songContent = document.createElement('div');
      songContent.style.cssText = 'flex: 1;';
      songContent.innerHTML = `
        <div class="song-item-container">
          <div class="song-item-content">
            <div class="song-title">
              ${song.title}
            </div>
            <div class="song-artist">
              ${song.artist}${song.year ? ` (${song.year})` : ''}
            </div>
            ${song.album ? `
            <div class="song-album">
              📀 ${song.album}
            </div>
            ` : ''}
            ${song.genre || song.description ? `
            <div class="song-genre">
              ${song.genre ? song.genre : ''}${song.genre && song.description ? ' • ' : ''}${song.description ? song.description : ''}
            </div>
            ` : ''}
            ${song.duration ? `
            <div class="song-duration">
              ⏱️ ${song.duration}
            </div>
            ` : ''}
          </div>
          <div class="song-number">
            #${index + 1}
          </div>
        </div>
      `;

      songItem.appendChild(checkbox);
      songItem.appendChild(songContent);
      songsList.appendChild(songItem);
    });

    // Boutons d'action
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    actionButtons.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
      background: #666;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy JSON';
    copyButton.style.cssText = `
      background: #666;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

    const spotifyButton = document.createElement('button');
    spotifyButton.textContent = 'Create New Playlist';
    spotifyButton.style.cssText = `
      background: linear-gradient(135deg, #1db954, #1ed760);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

    // Add to existing playlist button
    const addToPlaylistButton = document.createElement('button');
    addToPlaylistButton.textContent = 'Add to Current Playlist';
    addToPlaylistButton.style.cssText = `
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

    closeButton.addEventListener('click', () => {
      const modal = document.getElementById('playlist-results-modal');
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      // Re-enable the main AI Playlist button when modal closes
      reEnableMainAIButton();
    });

    copyButton.addEventListener('click', () => {
      const filteredPlaylistData = {
        ...playlistData,
        playlist: {
          ...playlistData.playlist,
          songs: playlistData.playlist.songs.filter((_, index) => selectedSongs.has(index))
        }
      };
      navigator.clipboard.writeText(JSON.stringify(filteredPlaylistData, null, 2))
        .then(() => {
          copyButton.textContent = 'Copié!';
          setTimeout(() => {
            copyButton.textContent = 'Copy JSON';
          }, 2000);
        })
        .catch(err => {
          alert('Copy error');
        });
    });


    // Function to get current playlist ID from URL
    function getCurrentPlaylistId() {
      const currentUrl = window.location.href;
      const playlistMatch = currentUrl.match(/\/playlist\/([a-zA-Z0-9]+)/);
      return playlistMatch ? playlistMatch[1] : null;
    }

    // Function to add songs to existing playlist
    async function addToExistingPlaylist(playlistData) {
      try {
        const playlistId = getCurrentPlaylistId();

        if (!playlistId) {
          alert('No playlist detected. Please make sure you are on a Spotify playlist page.');
          return;
        }

        addToPlaylistButton.textContent = '🔐 Connecting to Spotify...';
        addToPlaylistButton.disabled = true;
        addToPlaylistButton.style.opacity = '0.7';

        // Get auth URL and handle authentication
        const authResponse = await fetch('https://gemini.niperiusland.fr:4005/spotify-auth');
        const { authUrl } = await authResponse.json();

        // Store the current playlist data and ID
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA, JSON.stringify(playlistData));
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_ID, playlistId);
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS, 'true');

        // Show instructions to the user
        const authInstructions = document.createElement('div');
        authInstructions.id = 'auth-instructions';
        authInstructions.className = 'auth-instructions-modal';
        authInstructions.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #1a1a1a;
          color: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
          z-index: 10003;
          max-width: 500px;
          text-align: center;
        `;

        authInstructions.innerHTML = `
          <h3 style="margin-bottom: 20px; color: #667eea;">🎵 Add to Current Playlist</h3>
          <p style="margin-bottom: 20px;">Ready to add AI-generated songs to your current playlist!</p>
          
          <div style="background: #2a2a2a; padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 14px;">
            <p style="margin-bottom: 10px; color: #667eea; font-weight: bold;">📝 Playlist Details:</p>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #ccc;">Current Playlist ID:</label>
              <input type="text" value="${playlistId}" readonly style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #555;
                border-radius: 5px;
                background: #333;
                color: white;
                font-size: 14px;
              " />
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #ccc;">Songs to Add:</label>
              <div style="color: #1db954; font-weight: bold;">${playlistData.playlist.songs.length} AI-generated songs</div>
            </div>
          </div>
          
          <div style="background: #2a2a2a; padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 14px;">
            <p style="margin-bottom: 10px; color: #667eea; font-weight: bold;">📋 What will happen:</p>
            <ul style="margin: 0; padding-left: 20px; color: #ccc;">
              <li>AI-generated songs will be added to your current playlist</li>
              <li>All songs will be searched and matched on Spotify</li>
              <li>You'll get a confirmation of how many songs were added</li>
              <li>Modal will close automatically after completion</li>
            </ul>
          </div>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="auth-complete-btn" style="
              background: #667eea;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 20px;
              cursor: pointer;
              font-weight: bold;
            ">Add Songs to Playlist</button>
            <button id="auth-cancel-btn" style="
              background: #666;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 20px;
              cursor: pointer;
              font-weight: bold;
            ">Cancel</button>
          </div>
        `;

        document.body.appendChild(authInstructions);

        // Handle auth completion
        document.getElementById('auth-complete-btn').addEventListener('click', async () => {
          try {
            // Step 1: Get auth URL from server
            const authResponse = await fetch('https://gemini.niperiusland.fr:4005/spotify-auth');
            if (!authResponse.ok) {
              throw new Error('Failed to get auth URL');
            }
            const { authUrl } = await authResponse.json();

            // Step 2: Open auth window
            const authWindow = window.open(authUrl, 'spotify-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');

            // Step 3: Listen for messages from the popup window
            const messageHandler = (event) => {
              if (event.data && event.data.success && event.data.accessToken) {
                window.removeEventListener('message', messageHandler);

                const { accessToken, refreshToken } = event.data;

                // Remove instructions
                document.getElementById('auth-instructions').remove();

                // Add songs to existing playlist
                addSongsToExistingPlaylist(accessToken, playlistData, playlistId, refreshToken);

                // Clean up
                sessionStorage.removeItem('authInProgress');
                sessionStorage.removeItem('pendingPlaylistData');
                sessionStorage.removeItem('pendingPlaylistId');

                // Close the popup
                if (authWindow && !authWindow.closed) {
                  authWindow.close();
                }
              } else if (event.data && event.data.success === false) {
                window.removeEventListener('message', messageHandler);
                alert('Authentication failed: ' + event.data.error);
                if (authWindow && !authWindow.closed) {
                  authWindow.close();
                }
              }
            };

            window.addEventListener('message', messageHandler);

            // Timeout after 5 minutes
            setTimeout(() => {
              window.removeEventListener('message', messageHandler);
              if (!authWindow.closed) {
                authWindow.close();
                alert('Authentication timed out. Please try again.');
              }
            }, CONFIG.TIMEOUTS.AUTH_TIMEOUT);

          } catch (error) {
            alert('Authentication failed: ' + error.message);
          }
        });

        // Handle cancel
        document.getElementById('auth-cancel-btn').addEventListener('click', () => {
          document.getElementById('auth-instructions').remove();
          sessionStorage.removeItem('authInProgress');
          sessionStorage.removeItem('pendingPlaylistData');
          sessionStorage.removeItem('pendingPlaylistId');
        });

      } catch (error) {
        alert('Error adding to playlist: ' + error.message);
        addToPlaylistButton.textContent = 'Add to Current Playlist';
        addToPlaylistButton.disabled = false;
        addToPlaylistButton.style.opacity = '1';
      }
    }

    // Function to add songs to existing playlist
    async function addSongsToExistingPlaylist(accessToken, playlistData, playlistId, refreshToken = null) {
      try {
        // Format data for Spotify
        const spotifyPlaylistData = {
          name: playlistData.playlist.name || 'AI Generated Playlist',
          description: playlistData.playlist.description || 'Generated by AI',
          songs: (playlistData.playlist.songs || []).map(song => ({
            title: song.title,
            artist: song.artist
          }))
        };

        // Utiliser la fonction du module API
        const result = await window.addSongsToSpotifyPlaylist(accessToken, playlistId, playlistData, refreshToken);

        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          z-index: 10002;
          max-width: 400px;
        `;

        notification.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 24px; margin-right: 10px;">🎵</div>
            <div style="font-weight: bold; font-size: 18px;">Songs Added!</div>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>${result.tracksAdded}/${result.totalTracks}</strong> songs added to your playlist
          </div>
          <div style="margin-bottom: 15px;">
            <a href="${result.playlistUrl}" target="_blank" style="color: white; text-decoration: underline;">
              Open Playlist →
            </a>
          </div>
          <button onclick="this.parentElement.remove()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
          ">Close</button>
        `;

        document.body.appendChild(notification);

        // Auto-close after 5 seconds
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 5000);

        // Close the results modal after successful addition
        setTimeout(() => {
          const resultsModal = document.getElementById('playlist-results-modal');
          if (resultsModal && resultsModal.parentNode) {
            resultsModal.parentNode.removeChild(resultsModal);
          }
        }, 2000);

      } catch (error) {
        alert('Error adding songs to playlist: ' + error.message);
      }
    }

    // Add event listener for add to playlist button
    addToPlaylistButton.addEventListener('click', () => {
      // Filter songs based on selection
      if (selectedSongs.size === 0) {
        alert('Please select at least one song to add to the playlist.');
        return;
      }

      const filteredPlaylistData = {
        ...playlistData,
        playlist: {
          ...playlistData.playlist,
          songs: playlistData.playlist.songs.filter((_, index) => selectedSongs.has(index))
        }
      };
      addToExistingPlaylist(filteredPlaylistData);
    });

    spotifyButton.addEventListener('click', async () => {
      try {
        // Filter songs based on selection
        if (selectedSongs.size === 0) {
          alert('Please select at least one song to create the playlist.');
          return;
        }

        const filteredPlaylistData = {
          ...playlistData,
          playlist: {
            ...playlistData.playlist,
            songs: playlistData.playlist.songs.filter((_, index) => selectedSongs.has(index))
          }
        };

        spotifyButton.textContent = '🔐 Connecting to Spotify...';
        spotifyButton.disabled = true;
        spotifyButton.style.opacity = '0.7';

        // Obtenir l'URL d'authentification
        const authResponse = await fetch('https://gemini.niperiusland.fr:4005/spotify-auth');
        const { authUrl } = await authResponse.json();

        // Use a simple approach - show the auth URL to the user


        // Store the filtered playlist data in sessionStorage
        sessionStorage.setItem('pendingPlaylistData', JSON.stringify(filteredPlaylistData));
        sessionStorage.setItem('authInProgress', 'true');

        // Show instructions to the user
        const authInstructions = document.createElement('div');
        authInstructions.id = 'auth-instructions';
        authInstructions.className = 'auth-instructions-modal';
        authInstructions.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #1a1a1a;
          color: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
          z-index: 10003;
          max-width: 500px;
          text-align: center;
        `;

        authInstructions.innerHTML = `
          <h3 style="margin-bottom: 20px; color: #1db954;">🎵 Create Spotify Playlist</h3>
          <p style="margin-bottom: 20px;">Ready to create your AI-generated playlist on Spotify!</p>
          
          <div style="background: #2a2a2a; padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 14px;">
            <p style="margin-bottom: 10px; color: #1db954; font-weight: bold;">📝 Playlist Details:</p>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #ccc;">Playlist Name:</label>
              <input type="text" id="playlist-name-input" value="${filteredPlaylistData.playlist.name}" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #555;
                border-radius: 5px;
                background: #333;
                color: white;
                font-size: 14px;
              " />
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #ccc;">Description:</label>
              <textarea id="playlist-desc-input" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #555;
                border-radius: 5px;
                background: #333;
                color: white;
                font-size: 14px;
                height: 60px;
                resize: vertical;
              ">${filteredPlaylistData.playlist.description}</textarea>
            </div>
          </div>
          
          <div style="background: #2a2a2a; padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 14px;">
            <p style="margin-bottom: 10px; color: #1db954; font-weight: bold;">📋 What will happen:</p>
            <ul style="margin: 0; padding-left: 20px; color: #ccc;">
              <li>Your playlist will be created on Spotify</li>
              <li>All the AI-generated songs will be added</li>
              <li>You'll get a link to open the playlist</li>
              <li>Modal will close automatically after creation</li>
            </ul>
          </div>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="auth-complete-btn" style="
              background: #1db954;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 20px;
              cursor: pointer;
              font-weight: bold;
            ">Create Playlist</button>
            <button id="auth-cancel-btn" style="
              background: #666;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 20px;
              cursor: pointer;
              font-weight: bold;
            ">Cancel</button>
          </div>
        `;

        document.body.appendChild(authInstructions);

        // Handle auth completion
        document.getElementById('auth-complete-btn').addEventListener('click', async () => {

          // Get the modified playlist name and description
          const playlistName = document.getElementById('playlist-name-input').value.trim() || filteredPlaylistData.playlist.name;
          const playlistDescription = document.getElementById('playlist-desc-input').value.trim() || filteredPlaylistData.playlist.description;


          try {
            // Step 1: Get auth URL from server
            const authResponse = await fetch('https://gemini.niperiusland.fr:4005/spotify-auth');
            if (!authResponse.ok) {
              throw new Error('Failed to get auth URL');
            }
            const { authUrl } = await authResponse.json();

            // Step 2: Open auth window
            const authWindow = window.open(authUrl, 'spotify-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');

            // Step 3: Listen for messages from the popup window
            const messageHandler = (event) => {

              if (event.data && event.data.success && event.data.accessToken) {
                window.removeEventListener('message', messageHandler);

                const { accessToken, refreshToken } = event.data;

                // Remove instructions
                document.getElementById('auth-instructions').remove();

                // Create modified playlist data with user's changes
                const modifiedPlaylistData = {
                  ...filteredPlaylistData,
                  playlist: {
                    ...filteredPlaylistData.playlist,
                    name: playlistName,
                    description: playlistDescription
                  }
                };

                // Create playlist with fresh token
                createSpotifyPlaylist(accessToken, modifiedPlaylistData, refreshToken);

                // Clean up
                sessionStorage.removeItem('authInProgress');
                sessionStorage.removeItem('pendingPlaylistData');

                // Close the popup
                if (authWindow && !authWindow.closed) {
                  authWindow.close();
                }
              } else if (event.data && event.data.success === false) {
                window.removeEventListener('message', messageHandler);
                alert('Authentication failed: ' + event.data.error);
                if (authWindow && !authWindow.closed) {
                  authWindow.close();
                }
              }
            };

            window.addEventListener('message', messageHandler);

            // Timeout after 5 minutes
            setTimeout(() => {
              window.removeEventListener('message', messageHandler);
              if (!authWindow.closed) {
                authWindow.close();
                alert('Authentication timed out. Please try again.');
              }
            }, CONFIG.TIMEOUTS.AUTH_TIMEOUT);

          } catch (error) {
            alert('Authentication failed: ' + error.message);
          }
        });

        // Handle cancel
        document.getElementById('auth-cancel-btn').addEventListener('click', () => {
          document.getElementById('auth-instructions').remove();
          sessionStorage.removeItem('authInProgress');
          sessionStorage.removeItem('pendingPlaylistData');
        });

      } catch (error) {

        // Notification d'erreur plus belle
        const errorNotification = document.createElement('div');
        errorNotification.className = 'error-notification';
        errorNotification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(231, 76, 60, 0.3);
          z-index: 10002;
          max-width: 400px;
          animation: slideIn 0.3s ease;
        `;

        errorNotification.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 24px; margin-right: 10px;">❌</div>
            <div style="font-weight: bold; font-size: 18px;">Error</div>
          </div>
          <div style="margin-bottom: 15px;">
            ${error.message}
          </div>
          <button onclick="this.parentElement.remove()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
          ">Close</button>
        `;

        document.body.appendChild(errorNotification);

        spotifyButton.textContent = 'Create on Spotify';
        spotifyButton.disabled = false;
        spotifyButton.style.opacity = '1';
      }
    });

    // Assemble results modal
    resultsContent.appendChild(playlistTitle);
    resultsContent.appendChild(playlistDesc);
    resultsContent.appendChild(selectAllContainer);
    resultsContent.appendChild(songsList);
    actionButtons.appendChild(closeButton);
    actionButtons.appendChild(copyButton);
    actionButtons.appendChild(spotifyButton);
    actionButtons.appendChild(addToPlaylistButton);
    resultsContent.appendChild(actionButtons);
    resultsModal.appendChild(resultsContent);
    document.body.appendChild(resultsModal);


  }

  // Initialize display
  updateSelectedDisplay();

  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: #999;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  `;

  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = '#333';
    closeButton.style.color = '#fff';
  });

  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = 'none';
    closeButton.style.color = '#999';
  });

  closeButton.addEventListener('click', closeModal);

  // Close modal function
  function closeModal() {
    const modal = document.getElementById('ai-playlist-modal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    // Re-enable the main AI Playlist button when modal closes
    reEnableMainAIButton();

    // Restore the main AI Playlist button functionality
    const mainButton = document.querySelector(CONFIG.SELECTORS.AI_PLAYLIST_BUTTON);
    if (mainButton) {
      console.log('🔓 Restoring main AI Playlist button functionality...');
      mainButton.style.pointerEvents = 'auto'; // Re-enable interactions
    }
  }

  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Escape key to close
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Assemble modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(quickActionsContainer);
  modalContent.appendChild(templatesSection);
  modalContent.appendChild(breadcrumb);
  modalContent.appendChild(viewContainer);
  modalContent.appendChild(selectedDisplay);
  modalContent.appendChild(filtersSection);
  modalContent.appendChild(songCountContainer);

  // Add buttons in order
  modalContent.appendChild(choosePlaylistButton);
  if (useSelectedPlaylistButton) {
    modalContent.appendChild(useSelectedPlaylistButton);
  }
  modalContent.appendChild(createButton);

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
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
  const chooseButtons = document.querySelectorAll(CONFIG.SELECTORS.CHOOSE_PLAYLIST_BUTTON);
  if (chooseButtons.length > 1) {
    console.log(`Found ${chooseButtons.length} Choose Playlist buttons, removing ${chooseButtons.length - 1} duplicates...`);
    for (let i = 1; i < chooseButtons.length; i++) {
      chooseButtons[i].remove();
    }
  }

  // Check if main AI Playlist button is missing and restore it
  const mainAIButton = document.querySelector(CONFIG.SELECTORS.AI_PLAYLIST_BUTTON);
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
    addAIPlaylistButton();
  } else if (window.location.href.includes('/playlist/') && hasCreateButton) {
    console.log('✅ Create AI Playlist button found, no restoration needed');
  }

  // Ensure main AI Playlist button is always enabled
  if (mainAIButton && mainAIButton.disabled) {
    console.log('🔓 Re-enabling disabled main AI Playlist button...');
    reEnableMainAIButton();
  }

  console.log('✅ Duplicate cleanup completed');
}

// Start the injection when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    cleanupDuplicateButtons();
    addAIPlaylistButton();
    watchForPageChangesWrapper();

    // Periodic cleanup to prevent duplicates
    setInterval(cleanupDuplicateButtons, CONFIG.TIMEOUTS.CLEANUP_INTERVAL);
  });
} else {
  cleanupDuplicateButtons();
  addAIPlaylistButton();
  watchForPageChanges();

  // Periodic cleanup to prevent duplicates
  setInterval(cleanupDuplicateButtons, 5000); // Every 5 seconds
}