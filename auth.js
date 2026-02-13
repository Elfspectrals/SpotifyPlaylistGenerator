// Module de gestion de l'authentification Spotify

// BYO: get token from background (OAuth with user's Client ID). Returns { accessToken, refreshToken } or throws / returns needSettings.
function getSpotifyAccessToken() {
  return new Promise(function (resolve, reject) {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
      reject(new Error('Extension context not available'));
      return;
    }
    chrome.runtime.sendMessage({ type: 'getSpotifyToken' }, function (response) {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message || 'Failed to get token'));
        return;
      }
      if (response && response.needSettings) {
        if (typeof window !== 'undefined' && window.open) {
          window.open(chrome.runtime.getURL('options.html'), '_blank');
        }
        reject(new Error('Please set your Spotify Client ID in extension settings (options).'));
        return;
      }
      if (response && response.error) {
        const errMsg = response.error;
        const parts = errMsg.split('|REDIRECT_URI|');
        const hint = parts.length > 1
          ? ' Use this exact Redirect URI in your Spotify app: ' + parts[1]
          : ' In Spotify Dashboard → Your app → Settings → Redirect URIs, add the exact URL from extension options (Copy button).';
        reject(new Error(parts[0] + hint));
        return;
      }
      if (response && response.accessToken) {
        resolve({ accessToken: response.accessToken, refreshToken: response.refreshToken || null });
        return;
      }
      reject(new Error('Invalid token response'));
    });
  });
}

// Function to handle auth callback
async function handleAuthCallback(code) {
  try {
    const { accessToken } = await window.exchangeCodeForToken(code);
    
    // Get the pending playlist data
    const pendingPlaylistData = JSON.parse(sessionStorage.getItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA));
    if (!pendingPlaylistData) {
      throw new Error('No pending playlist data found');
    }
    
    // Import createSpotifyPlaylist from api module
    if (typeof window.createSpotifyPlaylistAPI === 'function') {
      await window.createSpotifyPlaylistAPI(accessToken, pendingPlaylistData);
    } else if (typeof createSpotifyPlaylist === 'function') {
      await createSpotifyPlaylist(accessToken, pendingPlaylistData);
    } else {
      throw new Error('createSpotifyPlaylist function not available');
    }
    
    // Clean up
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
    
  } catch (error) {
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
    alert('Authentication failed: ' + error.message);
  }
}

// Initialize auth callback handler if returning from Spotify auth
function initAuthCallback() {
  if (sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS) === 'true') {
    // Check if we have auth parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (code) {
      handleAuthCallback(code);
    } else if (error) {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
      alert('Authentication failed: ' + error);
    } else {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
    }
  }
}

// Listen for messages from auth window (fallback)
function setupAuthMessageListener() {
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
      const { accessToken, playlistData } = event.data;
      if (typeof window.createSpotifyPlaylistAPI === 'function') {
        await window.createSpotifyPlaylistAPI(accessToken, playlistData);
      } else if (typeof createSpotifyPlaylist === 'function') {
        await createSpotifyPlaylist(accessToken, playlistData);
      }
    }
  });
}

// Exposer les fonctions globalement pour utilisation dans content.js
window.getSpotifyAccessToken = getSpotifyAccessToken;
window.handleAuthCallback = handleAuthCallback;
window.initAuthCallback = initAuthCallback;
window.setupAuthMessageListener = setupAuthMessageListener;

// Export pour utilisation dans d'autres modules (si Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleAuthCallback,
    initAuthCallback,
    setupAuthMessageListener
  };
}

