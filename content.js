// Spotify AI Generator Playlist Extender
// Point d'entrée principal - utilise les modules config, styles, utils, api, buttons, auth

// Injecter les styles globaux (depuis styles.js)
injectGlobalStyles();

// Initialiser l'authentification (depuis auth.js)
initAuthCallback();
setupAuthMessageListener();

function errorMessage(error) {
  return String((error && error.message) || error || '');
}

function normalizePlaylistSongs(playlistData) {
  if (!playlistData || !playlistData.playlist) return null;
  if (!Array.isArray(playlistData.playlist.songs)) {
    playlistData.playlist.songs = [];
  }
  return playlistData;
}

function isSpotifyEditorialPlaylistId(playlistId) {
  return typeof playlistId === 'string' && playlistId.startsWith('37i9');
}

function appendTextRow(parent, className, text) {
  if (!text) return;
  const row = document.createElement('div');
  row.className = className;
  row.textContent = text;
  parent.appendChild(row);
}

function renderSongDetails(song) {
  const wrap = document.createElement('div');
  wrap.className = 'song-item-container';
  const content = document.createElement('div');
  content.className = 'song-item-content';
  appendTextRow(content, 'song-title', song.title || '');
  const artistLine = [song.artist, song.year ? `(${song.year})` : ''].filter(Boolean).join(' ');
  appendTextRow(content, 'song-artist', artistLine);
  if (song.album) appendTextRow(content, 'song-album', `📀 ${song.album}`);
  const genreLine = [song.genre, song.description].filter(Boolean).join(' • ');
  if (genreLine) appendTextRow(content, 'song-genre', genreLine);
  if (song.duration) appendTextRow(content, 'song-duration', `⏱️ ${song.duration}`);
  wrap.appendChild(content);
  return wrap;
}

// Global function to add songs to existing playlist via API
async function addSongsToExistingPlaylist(accessToken, playlistData, playlistId, refreshToken = null) {
  try {

    // Disable all relevant buttons during API call with loading indicators
    toggleButtonsState(true, true);

    // Utiliser la fonction du module API
    const result = await window.addSongsToSpotifyPlaylist(accessToken, playlistId, playlistData, refreshToken);

    // Show success notification (centralized component)
    window.spgNotify({
      type: 'success',
      title: result.tracksAdded === result.totalTracks ? 'Songs Added!' : 'Partial add',
      body: `${result.tracksAdded}/${result.totalTracks} songs added to your playlist`,
      link: { href: result.playlistUrl, label: 'Open Playlist \u2192' },
      autoClose: result.tracksAdded === result.totalTracks ? 5000 : 0,
    });

  } catch (error) {
    alert('Error adding songs to playlist: ' + errorMessage(error));
  } finally {
    toggleButtonsState(false);
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

    // Show success notification (centralized component)
    window.spgNotify({
      type: 'success',
      title: result.tracksAdded === result.totalTracks ? 'Playlist Created!' : 'Playlist created with missing tracks',
      body: `${result.tracksAdded}/${result.totalTracks} songs added`,
      link: { href: result.playlistUrl, label: 'Open in Spotify \u2192' },
      autoClose: result.tracksAdded === result.totalTracks ? 5000 : 0,
    });

  } catch (error) {
    alert('Error creating playlist: ' + errorMessage(error));
  } finally {
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
          background: linear-gradient(135deg, #1db954, #1ed760);
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
          box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
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
          choosePlaylistButton.style.boxShadow = '0 6px 20px rgba(29, 185, 84, 0.4)';
        });

        choosePlaylistButton.addEventListener('mouseleave', () => {
          choosePlaylistButton.style.transform = 'scale(1)';
          choosePlaylistButton.style.boxShadow = '0 4px 12px rgba(29, 185, 84, 0.3)';
        });

        // Add click handler
        choosePlaylistButton.addEventListener('click', () => {
          saveCurrentPlaylist();
        });

        // Insert the button at the end of the action buttons
        actionButtonsContainer.appendChild(choosePlaylistButton);

      } else {
        // Retry after a longer delay
        setTimeout(() => addChoosePlaylistButton(), 2000);
      }
    }, 1500);

  } catch (error) {
  }
}

let playlistChangeObserverStarted = false;

// Function to set up observer for playlist changes
function setupPlaylistChangeObserver() {
  if (playlistChangeObserverStarted) {
    return;
  }
  playlistChangeObserverStarted = true;

  let currentPlaylistId = null;
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

      if (currentPlaylistId !== newPlaylistId) {
        currentPlaylistId = newPlaylistId;
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
        }
      }
    }, 500); // Wait 500ms to avoid spam
  });

}

// Function to save current playlist
function saveCurrentPlaylist(showNotification = true) {
  try {
    const currentUrl = window.location.href;
    const playlistMatch = currentUrl.match(/\/playlist\/([a-zA-Z0-9]+)/);

    if (playlistMatch) {
      const playlistId = playlistMatch[1];
      if (isSpotifyEditorialPlaylistId(playlistId)) {
        alert('This Spotify playlist cannot be modified. Choose one of your own playlists.');
        return;
      }

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
        window.spgNotify({
          type: 'success',
          icon: '\u2705',
          title: 'Playlist Selected!',
          body: `<strong>${playlistName}</strong> has been saved<br>You can now use this playlist in AI Playlist generator`,
          autoClose: 4000,
        });
      }

    } else {
      if (showNotification) {
        alert('No playlist detected on this page.');
      }
    }
  } catch (error) {
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
    color: #1db954;
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

  const infoTitle = document.createElement('div');
  infoTitle.style.cssText = 'color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 10px;';
  infoTitle.textContent = '🎵 Current Playlist';
  const infoId = document.createElement('div');
  infoId.style.cssText = 'color: #1db954; font-size: 16px; margin-bottom: 5px;';
  infoId.textContent = `Playlist ID: ${playlistId || ''}`;
  const infoHint = document.createElement('div');
  infoHint.style.cssText = 'color: #999; font-size: 14px;';
  infoHint.textContent = 'AI-generated songs will be added to this playlist';
  playlistInfo.appendChild(infoTitle);
  playlistInfo.appendChild(infoId);
  playlistInfo.appendChild(infoHint);

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
      songCountSelector.querySelectorAll('button').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = '#1db954';
      });

      // Select current button
      button.style.background = 'linear-gradient(135deg, #1db954, #1ed760)';
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
    background: linear-gradient(135deg, #1db954, #1ed760);
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
      const playlistData = await window.generatePlaylist(selectedGenres, selectedSongCount, null);

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
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '✕';
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
  playlistData = normalizePlaylistSongs(playlistData);
  if (!playlistData) {
    alert('No playlist data received.');
    return;
  }
  if (playlistData.playlist.songs.length === 0) {
    alert('No songs found. Try different filters or generate again.');
    return;
  }

  // Close all existing modals
  const existingModal = document.getElementById('ai-playlist-modal');
  const existingResultsModal = document.getElementById('playlist-results-modal');

  if (existingModal) {
    existingModal.remove();
  }
  if (existingResultsModal) {
    existingResultsModal.remove();
  }
  reEnableMainAIButton();

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
      }
    }
  } else {
    // If playlistId is provided, also get the name
    const selectedPlaylist = localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_PLAYLIST);
    if (selectedPlaylist) {
      try {
        selectedPlaylistData = JSON.parse(selectedPlaylist);
      } catch (e) {
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

  // Responsive styles are now in styles.js

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
    accent-color: #1db954;
  `;

  const selectedCount = document.createElement('span');
  selectedCount.textContent = `${selectedSongs.size} of ${playlistData.playlist.songs.length} selected`;
  selectedCount.style.cssText = `
    color: #1db954;
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
      accent-color: #1db954;
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
    songContent.appendChild(renderSongDetails(song));
    const songNumber = document.createElement('div');
    songNumber.className = 'song-number';
    songNumber.textContent = `#${index + 1}`;
    songContent.firstChild.appendChild(songNumber);

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
  closeButton.className = 'spg-btn spg-btn--secondary';

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
  copyButton.className = 'spg-btn spg-btn--secondary';

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
  createPlaylistButton.className = 'spg-btn spg-btn--primary';

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

      const { accessToken, refreshToken } = await window.getSpotifyAccessToken();
      await createSpotifyPlaylist(accessToken, filteredPlaylistData, refreshToken);

    } catch (error) {
      alert(errorMessage(error) || 'Error creating playlist');
    } finally {
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
    addToPlaylistButton.className = 'spg-btn spg-btn--primary';

    addToPlaylistButton.addEventListener('click', async () => {
      try {
        // Filter songs based on selection
        if (selectedSongs.size === 0) {
          alert('Please select at least one song to add to the playlist.');
          return;
        }
        if (!window.confirm(`Add ${selectedSongs.size} song(s) to "${selectedPlaylistName}"? This cannot be undone from the extension.`)) {
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

        const { accessToken, refreshToken } = await window.getSpotifyAccessToken();
        await addSongsToExistingPlaylist(accessToken, filteredPlaylistData, playlistId, refreshToken);

      } catch (error) {
        alert(errorMessage(error) || 'Error adding to playlist');
      } finally {
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

function createAIPlaylistButton({ floating = false } = {}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'spg-ai-playlist-btn' + (floating ? ' spg-ai-playlist-btn--floating' : '');
  btn.setAttribute('aria-label', 'AI Playlist');
  btn.innerHTML = '<span class="spg-ai-playlist-btn__icon" aria-hidden="true">'
    + '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">'
    + '<path d="M12 2l1.2 4.2L17 8l-3.8 1.8L12 14l-1.2-4.2L7 8l3.8-1.8L12 2z"/>'
    + '<path d="M5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14z"/>'
    + '<path d="M18 15l.5 1.7L20 17l-1.5.3L18 19l-.5-1.7L16 17l1.5-.3L18 15z"/>'
    + '</svg></span>'
    + '<span class="spg-ai-playlist-btn__label">AI Playlist</span>';
  btn.addEventListener('click', () => showMusicGenreModal());
  return btn;
}

// Create and inject the AI Playlist button
async function addAIPlaylistButton() {
  try {

    // Wait a moment for the page to fully load
    await new Promise(resolve => setTimeout(resolve, CONFIG.TIMEOUTS.PAGE_LOAD_DELAY));

    // Check if AI Playlist button already exists to avoid duplicates
    const existingAIButton = document.querySelector(CONFIG.SELECTORS.AI_PLAYLIST_BUTTON);
    if (existingAIButton) {
      return;
    }

    // Also check for buttons with the exact text content - but only check for Create buttons
    const existingButtons = document.querySelectorAll('button');
    for (let button of existingButtons) {
      if (button.textContent && button.textContent.includes('Create AI Playlist')) {
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

      buttonContainer.appendChild(createAIPlaylistButton({ floating: true }));

      return;
    }


    // Find the parent container that holds the buttons
    const buttonContainer = createButton.parentElement;

    buttonContainer.insertBefore(createAIPlaylistButton(), createButton.nextSibling);

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
    mainButton.style.pointerEvents = 'none'; // Temporarily disable to prevent conflicts
  }

  // Fresh Radio settings for each modal open
  if (window.SPG_RADIO && typeof window.SPG_RADIO.reset === 'function') {
    window.SPG_RADIO.reset();
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
    position: relative;
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

  // Quick Actions Container — Random + Discovery radios (expandable cards)
  const quickActionsContainer = document.createElement('div');
  quickActionsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  `;

  // Commit picked genres + radio knobs, then refresh the selection UI.
  function applyRadioSpin(picked, knobs) {
    selectedGenres = Array.isArray(picked) ? picked.slice() : [];
    updateSelectedDisplay();
    currentFamily = null;
    createFamilyButtons();
    const st = window.SPG_RADIO.state;
    st.energy = knobs.energy;
    st.popularity = knobs.popularity;
    st.surprise = knobs.surprise;
    st.mood = knobs.mood;
    if (radioCtx) {
      if (typeof radioCtx.refreshSettings === 'function') radioCtx.refreshSettings();
      else if (typeof radioCtx.refreshSliders === 'function') radioCtx.refreshSliders();
    }
    selectedDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Pick `count` unique entries at random from a pool.
  function pickFromPool(pool, count) {
    const picks = [];
    let guard = 0;
    while (picks.length < count && guard < 500) {
      const g = pool[Math.floor(Math.random() * pool.length)];
      if (g && !picks.includes(g)) picks.push(g);
      guard++;
    }
    return picks;
  }

  const randomCard = window.SPG_RADIO.buildRadioCard({
    icon: '🎲',
    title: 'Random Radio',
    description: 'Popular genres, tuned your way',
    accent: 'primary',
    popLabel: 'Popularity',
    popInverse: false,
    defaults: { count: 3, energy: 55, pop: 65, surprise: 40 },
    actionLabel: 'Spin',
    onSpin: (knobs) => {
      const pool = [];
      Object.values(musicFamilies).forEach((f) => {
        if (f && Array.isArray(f.subgenres)) pool.push(...f.subgenres);
      });
      applyRadioSpin(pickFromPool(pool, knobs.count), knobs);
    },
  });

  const discoveryCard = window.SPG_RADIO.buildRadioCard({
    icon: '🔭',
    title: 'Discovery Radio',
    description: 'Rare & niche gems to explore',
    accent: 'accent',
    popLabel: 'Rarity',
    popInverse: true,
    defaults: { count: 3, energy: 50, pop: 75, surprise: 80 },
    actionLabel: 'Explore',
    onSpin: (knobs) => {
      const pool = (window.CONFIG && CONFIG.DISCOVERY_GENRES) || [];
      applyRadioSpin(pickFromPool(pool, knobs.count), knobs);
    },
  });

  quickActionsContainer.appendChild(randomCard);
  quickActionsContainer.appendChild(discoveryCard);


  // Add responsive styles
  // Responsive styles are now in styles.js

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

  function setFamilyGridLayout() {
    viewContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 12px;
      width: 100%;
      max-width: 640px;
      height: auto;
      margin: 0 auto;
      position: relative;
    `;
  }

  function setSubgenreLayout() {
    viewContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 640px;
      height: auto;
      margin: 0 auto;
      position: relative;
    `;
  }

  setFamilyGridLayout();

  // Track selected genres and current view
  let selectedGenres = [];
  let currentFamily = null;

  // Function to create family buttons
  function createFamilyButtons() {
    setFamilyGridLayout();
    viewContainer.innerHTML = '';
    const families = Object.keys(musicFamilies);

    families.forEach((familyName) => {
      const family = musicFamilies[familyName];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'family-button';
      button.title = familyName;

      const icon = document.createElement('div');
      icon.style.cssText = 'font-size: 22px; margin-bottom: 6px;';
      icon.textContent = family.icon;
      const label = document.createElement('div');
      label.style.cssText = 'font-size: 12px; font-weight: bold; text-align: center; line-height: 1.2;';
      label.textContent = familyName;
      button.appendChild(icon);
      button.appendChild(label);

      button.style.cssText = `
        width: 100%;
        min-height: 88px;
        border-radius: 14px;
        border: 2px solid ${family.color};
        background: linear-gradient(135deg, ${family.color}20, ${family.color}40);
        color: #fff;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 8px;
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
      `;

      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = `0 8px 20px ${family.color}66`;
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'none';
        button.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.3)';
      });

      button.addEventListener('click', () => {
        showSubgenres(familyName);
      });

      viewContainer.appendChild(button);
    });
  }

  // Function to show subgenres
  function showSubgenres(familyName) {
    currentFamily = familyName;
    const family = musicFamilies[familyName];
    setSubgenreLayout();
    viewContainer.innerHTML = '';

    breadcrumb.textContent = '';
    breadcrumb.appendChild(document.createTextNode('Main Categories > '));
    const familyLabel = document.createElement('span');
    familyLabel.style.color = family.color;
    familyLabel.textContent = familyName;
    breadcrumb.appendChild(familyLabel);

    const subgenres = family.subgenres;

    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    `;

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.textContent = '← Back';
    backButton.style.cssText = `
      flex-shrink: 0;
      background: #333;
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
    `;
    backButton.addEventListener('click', () => {
      currentFamily = null;
      breadcrumb.textContent = 'Main Categories';
      createFamilyButtons();
    });
    toolbar.appendChild(backButton);

    let searchInput = null;
    if (subgenres.length > 20) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'search-container';
      searchContainer.style.cssText = `
        flex: 1;
        height: 44px;
        display: flex;
        align-items: center;
        background: #2a2a2a;
        border-radius: 22px;
        border: 2px solid #333;
        padding: 0 14px;
      `;

      searchInput = document.createElement('input');
      searchInput.type = 'search';
      searchInput.placeholder = `Search ${familyName}...`;
      searchInput.style.cssText = `
        flex: 1;
        background: transparent;
        border: none;
        color: #fff;
        font-size: 14px;
        outline: none;
      `;
      searchContainer.appendChild(searchInput);
      toolbar.appendChild(searchContainer);
    }

    viewContainer.appendChild(toolbar);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'subgenre-grid-container';
    gridContainer.style.cssText = `
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      padding: 12px;
      max-height: 380px;
      background: #1a1a1a;
      border-radius: 14px;
      border: 1px solid #333;
    `;

    subgenres.forEach((subgenre) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'subgenre-button subgenre-grid-button';
        button.textContent = subgenre;

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

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const buttons = gridContainer.querySelectorAll('.subgenre-grid-button');
        let visibleCount = 0;
        buttons.forEach((button) => {
          const match = button.textContent.toLowerCase().includes(searchTerm);
          button.style.display = match ? 'flex' : 'none';
          if (match) visibleCount += 1;
        });
        let empty = gridContainer.querySelector('[data-spg-empty-search]');
        if (visibleCount === 0) {
          if (!empty) {
            empty = document.createElement('div');
            empty.dataset.spgEmptySearch = '1';
            empty.style.cssText = 'grid-column: 1 / -1; color: #a7a7a7; text-align: center; padding: 20px;';
            empty.textContent = 'No matching styles';
            gridContainer.appendChild(empty);
          }
        } else if (empty) {
          empty.remove();
        }
      });
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
  let selectedSongCount = CONFIG.DEFAULTS.SONG_COUNT;

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
  const songCounts = CONFIG.DEFAULTS.SONG_COUNT_OPTIONS;
  songCounts.forEach(count => {
    const button = document.createElement('button');
    button.textContent = count.toString();
    button.className = 'song-count-btn';
    button.style.cssText = `
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #1db954;
      background: ${count === CONFIG.DEFAULTS.SONG_COUNT ? 'linear-gradient(135deg, #1db954, #1ed760)' : 'transparent'};
      color: ${count === CONFIG.DEFAULTS.SONG_COUNT ? 'white' : '#1db954'};
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

  // Check if there's a selected playlist
  const selectedPlaylist = localStorage.getItem('selectedPlaylist');
  let selectedPlaylistData = null;
  if (selectedPlaylist) {
    try {
      selectedPlaylistData = JSON.parse(selectedPlaylist);
    } catch (e) {
    }
  }

  // Choose Playlist button (always visible)
  const choosePlaylistButton = document.createElement('button');
  choosePlaylistButton.textContent = selectedPlaylistData
    ? `📋 Change Selected Playlist (${selectedPlaylistData.name})`
    : '📋 Choose Playlist to Add Songs';
  choosePlaylistButton.style.cssText = `
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
  `;

  choosePlaylistButton.addEventListener('mouseenter', () => {
    choosePlaylistButton.style.transform = 'scale(1.05)';
    choosePlaylistButton.style.boxShadow = '0 8px 25px rgba(29, 185, 84, 0.4)';
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
      <h2 style="color: #1db954; font-size: 24px; margin-bottom: 20px; font-weight: bold;">
        Choose a Playlist
      </h2>
      <p style="color: #fff; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
        To add AI-generated songs to a playlist:<br><br>
        1. Navigate to the playlist you want to use<br>
        2. Click the <strong style="color: #1db954;">✓ Choose Playlist</strong> button on that playlist page<br>
        3. Then open the AI Playlist Generator again
      </p>
      <button id="close-instruction-modal" style="
        background: linear-gradient(135deg, #1db954, #1ed760);
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
  }

  // Add event listener for Use Selected Playlist button
  if (useSelectedPlaylistButton) {
    useSelectedPlaylistButton.addEventListener('mouseenter', () => {
      if (selectedGenres.length > 0) {
        useSelectedPlaylistButton.style.transform = 'scale(1.05)';
        useSelectedPlaylistButton.style.boxShadow = '0 8px 25px rgba(29, 185, 84, 0.4)';
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
        useSelectedPlaylistButton.style.animation = 'pulse-scale 1.5s infinite';

        try {
          // Call the AI to generate songs (utilise le module API)
          const playlistData = await window.generatePlaylist(selectedGenres, selectedSongCount, window.SPG_RADIO.getOptions());

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
          const errMsg = errorMessage(error);
          if (errMsg.includes('Failed to fetch')) {
            alert(`Server connection error. Please check that the server is running on ${CONFIG.API_BASE_URL}`);
          } else if (errMsg.includes('Tous les modèles Gemini sont indisponibles') || errMsg.includes('models/gemini-1.5-pro is not found')) {
            alert('🚫 We got a problem with our AI service. Please come back later when our AI models are available again. Sorry for the inconvenience!');
          } else {
            alert(`Error generating playlist: ${errMsg}`);
          }
        } finally {
          toggleButtonsState(false);
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
      createButton.style.animation = 'pulse-scale 1.5s infinite';

      try {
        // Appel au serveur AI pour générer la playlist (utilise le module API)
        const playlistData = await window.generatePlaylist(selectedGenres, selectedSongCount, window.SPG_RADIO.getOptions());

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
            artist: song.artist,
            spotifyUri: song.spotifyUri || null
          }))
        };


        // Afficher les résultats
        showPlaylistResults(playlistData);

      } catch (error) {
        const errMsg = errorMessage(error);
        if (errMsg.includes('Failed to fetch')) {
          alert('Server connection error. Please check that the server is running on https://polar-ravine-64133-f97528c41675.herokuapp.com');
        } else if (errMsg.includes('Tous les modèles Gemini sont indisponibles') || errMsg.includes('models/gemini-1.5-pro is not found')) {
          alert('🚫 We got a problem with our AI service. Please come back later when our AI models are available again. Sorry for the inconvenience!');
        } else {
          alert(`Error generating playlist: ${errMsg}`);
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
      selectedDisplay.textContent = '';
      const emptyHint = document.createElement('div');
      emptyHint.style.cssText = 'color: #999; text-align: center; font-style: italic;';
      emptyHint.textContent = 'Select one or more music styles to create your AI playlist';
      selectedDisplay.appendChild(emptyHint);
      createButton.style.opacity = '0.5';
      createButton.style.pointerEvents = 'none';
    } else {
      selectedDisplay.textContent = '';
      const heading = document.createElement('div');
      heading.style.cssText = 'color: #fff; margin-bottom: 10px; font-weight: bold;';
      heading.textContent = `Selected Styles (${selectedGenres.length}):`;
      const chips = document.createElement('div');

      selectedGenres.forEach((genre) => {
        let familyData = null;
        for (const data of Object.values(musicFamilies)) {
          if (data.subgenres.includes(genre)) {
            familyData = data;
            break;
          }
        }

        const chip = document.createElement('div');
        const color = familyData ? familyData.color : '#666';
        chip.style.cssText = `
          display: inline-flex;
          align-items: center;
          background: ${color}20;
          color: ${color};
          padding: 8px 15px;
          margin: 5px;
          border-radius: 20px;
          border: 1px solid ${color};
          font-size: 14px;
          font-weight: bold;
        `;
        const label = document.createElement('span');
        label.textContent = `${familyData ? familyData.icon : '🎵'} ${genre}`;
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-genre-btn';
        removeBtn.setAttribute('aria-label', `Remove ${genre}`);
        removeBtn.textContent = '×';
        removeBtn.style.cssText = `
          background: #e74c3c;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          margin-left: 8px;
          cursor: pointer;
          font-size: 12px;
        `;
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          selectedGenres = selectedGenres.filter((item) => item !== genre);
          updateSubgenreButtonVisualState(genre);
          updateSelectedDisplay();
        });
        chip.appendChild(label);
        chip.appendChild(removeBtn);
        chips.appendChild(chip);
      });

      selectedDisplay.appendChild(heading);
      selectedDisplay.appendChild(chips);

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
    playlistData = normalizePlaylistSongs(playlistData);
    if (!playlistData) {
      alert('No playlist data received.');
      return;
    }
    if (playlistData.playlist.songs.length === 0) {
      alert('No songs found. Try different filters or generate again.');
      return;
    }

    // Close all existing modals
    const existingModal = document.getElementById('ai-playlist-modal');
    const existingResultsModal = document.getElementById('playlist-results-modal');

    if (existingModal) {
      existingModal.remove();
    }
    if (existingResultsModal) {
      existingResultsModal.remove();
    }
    reEnableMainAIButton();

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
    // Responsive styles are now in styles.js

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
      accent-color: #1db954;
    `;

    const selectedCount = document.createElement('span');
    selectedCount.textContent = `${selectedSongs.size} of ${playlistData.playlist.songs.length} selected`;
    selectedCount.style.cssText = `
      color: #1db954;
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
        accent-color: #1db954;
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
      songContent.appendChild(renderSongDetails(song));
      const songNumber = document.createElement('div');
      songNumber.className = 'song-number';
      songNumber.textContent = `#${index + 1}`;
      songContent.firstChild.appendChild(songNumber);

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
      const playlistId = getCurrentPlaylistId();
      if (!playlistId) {
        alert('No playlist detected. Please make sure you are on a Spotify playlist page.');
        return;
      }

      try {
        addToPlaylistButton.textContent = '🔐 Connecting to Spotify...';
        addToPlaylistButton.disabled = true;
        addToPlaylistButton.style.opacity = '0.7';

        const { accessToken, refreshToken } = await window.getSpotifyAccessToken();
        await addSongsToExistingPlaylist(accessToken, playlistData, playlistId, refreshToken);
      } catch (error) {
        alert(error.message || 'Error adding to playlist');
      } finally {
        addToPlaylistButton.textContent = 'Add to Current Playlist';
        addToPlaylistButton.disabled = false;
        addToPlaylistButton.style.opacity = '1';
      }
    }

    // Function to add songs to existing playlist via API
    async function addSongsToExistingPlaylist(accessToken, playlistData, playlistId, refreshToken = null) {
      try {
        // Format data for Spotify
        const spotifyPlaylistData = {
          name: playlistData.playlist.name || 'AI Generated Playlist',
          description: playlistData.playlist.description || 'Generated by AI',
          songs: (playlistData.playlist.songs || []).map(song => ({
            title: song.title,
            artist: song.artist,
            spotifyUri: song.spotifyUri || null
          }))
        };

        // Utiliser la fonction du module API
        const result = await window.addSongsToSpotifyPlaylist(accessToken, playlistId, playlistData, refreshToken);

        // Show success notification (centralized component)
        window.spgNotify({
          type: 'success',
          title: result.tracksAdded === result.totalTracks ? 'Songs Added!' : 'Partial add',
          body: `${result.tracksAdded}/${result.totalTracks} songs added to your playlist`,
          link: { href: result.playlistUrl, label: 'Open Playlist \u2192' },
          autoClose: result.tracksAdded === result.totalTracks ? 5000 : 0,
        });

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
      if (!window.confirm(`Add ${selectedSongs.size} song(s) to the current playlist? This cannot be undone from the extension.`)) {
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

      try {
        spotifyButton.textContent = '🔐 Connecting to Spotify...';
        spotifyButton.disabled = true;
        spotifyButton.style.opacity = '0.7';

        const { accessToken, refreshToken } = await window.getSpotifyAccessToken();
        await createSpotifyPlaylist(accessToken, filteredPlaylistData, refreshToken);
      } catch (error) {
        alert(errorMessage(error) || 'Authentication failed');
      } finally {
        spotifyButton.textContent = 'Create New Playlist';
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
    if (getCurrentPlaylistId()) {
      actionButtons.appendChild(addToPlaylistButton);
    }
    resultsContent.appendChild(actionButtons);
    resultsModal.appendChild(resultsContent);
    document.body.appendChild(resultsModal);


  }

  // Initialize display
  updateSelectedDisplay();

  // Close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '✕';
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

  // Assemble modal as a 2-step wizard.
  // Step 1 = pick the music, Step 2 = settings & generate.
  // All section/button logic above is reused untouched; only the layout changes.
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);

  // Stepper indicator
  const stepper = document.createElement('div');
  stepper.className = 'spg-steps';
  stepper.innerHTML = `
    <div class="spg-step spg-step--active" data-step-indicator="1"><span class="spg-step__dot">1</span><span>Music</span></div>
    <div class="spg-step__bar"></div>
    <div class="spg-step" data-step-indicator="2"><span class="spg-step__dot">2</span><span>Settings</span></div>
  `;
  modalContent.appendChild(stepper);

  // Radio engine context: lets presets / roulette populate the genre selection.
  const allSubgenres = [];
  Object.values(musicFamilies).forEach((fam) => {
    if (fam && Array.isArray(fam.subgenres)) allSubgenres.push(...fam.subgenres);
  });
  const radioCtx = {
    allSubgenres,
    getSelectedGenres: () => selectedGenres.slice(),
    onSetGenres: (arr) => {
      selectedGenres = Array.isArray(arr) ? arr.slice() : [];
      updateSelectedDisplay();
      currentFamily = null;
      createFamilyButtons();
    },
    onSettingsChanged: () => {
      if (radioCtx.refreshSettings) radioCtx.refreshSettings();
      else if (radioCtx.refreshSliders) radioCtx.refreshSliders();
    },
    onDurationPick: (duration) => {
      if (duration === 'short') selectedSongCount = 5;
      else if (duration === 'medium') selectedSongCount = 10;
      else if (duration === 'long') selectedSongCount = 15;
      songCountSelector.querySelectorAll('.song-count-btn').forEach((btn) => {
        const count = parseInt(btn.textContent, 10);
        const active = count === selectedSongCount;
        btn.style.background = active ? 'linear-gradient(135deg, #1db954, #1ed760)' : 'transparent';
        btn.style.color = active ? 'white' : '#1db954';
      });
    },
  };
  const radioSettingsPanel = window.SPG_RADIO.buildSettingsPanel(radioCtx);
  const radioQuickPanel = window.SPG_RADIO.buildQuickPanel(radioCtx);
  const languagePanel = window.SPG_RADIO.buildLanguagePanel();

  // Step 1 panel — choose the music
  const step1Panel = document.createElement('div');
  step1Panel.className = 'spg-wizard-panel';
  step1Panel.appendChild(quickActionsContainer);
  step1Panel.appendChild(radioQuickPanel);
  step1Panel.appendChild(breadcrumb);
  step1Panel.appendChild(viewContainer);
  step1Panel.appendChild(selectedDisplay);

  // Step 2 panel — settings & generation
  const step2Panel = document.createElement('div');
  step2Panel.className = 'spg-wizard-panel spg-wizard-panel--hidden';
  step2Panel.appendChild(radioSettingsPanel);
  step2Panel.appendChild(languagePanel);
  step2Panel.appendChild(songCountContainer);
  step2Panel.appendChild(choosePlaylistButton);

  modalContent.appendChild(step1Panel);
  modalContent.appendChild(step2Panel);

  // Wizard navigation (Back on the left, actions on the right)
  const wizardNav = document.createElement('div');
  wizardNav.className = 'spg-wizard-nav';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'spg-btn spg-btn--ghost';
  backBtn.textContent = '\u2190 Back';
  backBtn.style.visibility = 'hidden';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'spg-btn spg-btn--primary';
  nextBtn.textContent = 'Next \u2192';

  const navRight = document.createElement('div');
  navRight.className = 'spg-wizard-nav__right';
  navRight.appendChild(nextBtn);
  if (useSelectedPlaylistButton) {
    navRight.appendChild(useSelectedPlaylistButton);
  }
  navRight.appendChild(createButton);

  wizardNav.appendChild(backBtn);
  wizardNav.appendChild(navRight);
  modalContent.appendChild(wizardNav);

  function goToStep(step) {
    const onStep2 = step === 2;
    step1Panel.classList.toggle('spg-wizard-panel--hidden', onStep2);
    step2Panel.classList.toggle('spg-wizard-panel--hidden', !onStep2);
    backBtn.style.visibility = onStep2 ? 'visible' : 'hidden';
    nextBtn.style.display = onStep2 ? 'none' : '';
    createButton.style.display = onStep2 ? '' : 'none';
    if (useSelectedPlaylistButton) {
      useSelectedPlaylistButton.style.display = onStep2 ? '' : 'none';
    }
    const ind1 = stepper.querySelector('[data-step-indicator="1"]');
    const ind2 = stepper.querySelector('[data-step-indicator="2"]');
    if (ind1) ind1.classList.toggle('spg-step--active', !onStep2);
    if (ind2) ind2.classList.toggle('spg-step--active', onStep2);
    modalContent.scrollTop = 0;
  }

  nextBtn.addEventListener('click', () => {
    if (selectedGenres.length === 0) {
      alert('Please select at least one music style first.');
      return;
    }
    if (radioCtx.refreshSettings) radioCtx.refreshSettings();
    goToStep(2);
  });
  backBtn.addEventListener('click', () => goToStep(1));

  goToStep(1);

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

// Function to clean up duplicate buttons
function cleanupDuplicateButtons() {

  // Remove duplicate AI Playlist buttons (by aria-label)
  const aiButtons = document.querySelectorAll('button[aria-label="AI Playlist"]');
  if (aiButtons.length > 1) {
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
    for (let i = 1; i < createButtons.length; i++) {
      createButtons[i].remove();
    }
  }

  if (addButtons.length > 1) {
    for (let i = 1; i < addButtons.length; i++) {
      addButtons[i].remove();
    }
  }

  // Remove duplicate Choose Playlist buttons
  const chooseButtons = document.querySelectorAll(CONFIG.SELECTORS.CHOOSE_PLAYLIST_BUTTON);
  if (chooseButtons.length > 1) {
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

  if (!mainAIButton && !hasCreateButton) {
    addAIPlaylistButton();
  }

  // Ensure main AI Playlist button is always enabled
  if (mainAIButton && mainAIButton.disabled) {
    reEnableMainAIButton();
  }

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
  watchForPageChangesWrapper();

  // Periodic cleanup to prevent duplicates
  setInterval(cleanupDuplicateButtons, CONFIG.TIMEOUTS.CLEANUP_INTERVAL);
}