// Module de gestion de l'authentification Spotify

const EXTENSION_RELOAD_MSG =
  'Extension rechargée — actualisez la page Spotify (F5), puis réessayez.';

function isExtensionContextValid() {
  try {
    return Boolean(
      typeof chrome !== 'undefined' &&
      chrome.runtime &&
      chrome.runtime.id &&
      typeof chrome.runtime.sendMessage === 'function'
    );
  } catch (_) {
    return false;
  }
}

function mapAuthError(message) {
  const msg = String(message || '');
  if (
    msg.includes('Extension context') ||
    msg.includes('Extension context invalidated') ||
    msg.includes('context invalidated') ||
    msg.includes('Receiving end does not exist')
  ) {
    return EXTENSION_RELOAD_MSG;
  }
  return msg || 'Authentication failed';
}

// Get token from background (OAuth PKCE). Returns { accessToken, refreshToken } or throws.
function getSpotifyAccessToken() {
  return new Promise(function (resolve, reject) {
    if (!isExtensionContextValid()) {
      reject(new Error(EXTENSION_RELOAD_MSG));
      return;
    }

    chrome.runtime.sendMessage({ type: 'getSpotifyToken' }, function (response) {
      if (chrome.runtime.lastError) {
        reject(new Error(mapAuthError(chrome.runtime.lastError.message)));
        return;
      }
      if (response && response.error) {
        const errMsg = response.error;
        const parts = errMsg.split('|REDIRECT_URI|');
        reject(new Error(mapAuthError(parts[0])));
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

    const pendingPlaylistData = JSON.parse(sessionStorage.getItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA));
    if (!pendingPlaylistData) {
      throw new Error('No pending playlist data found');
    }

    if (typeof window.createSpotifyPlaylistAPI === 'function') {
      await window.createSpotifyPlaylistAPI(accessToken, pendingPlaylistData);
    } else if (typeof createSpotifyPlaylist === 'function') {
      await createSpotifyPlaylist(accessToken, pendingPlaylistData);
    } else {
      throw new Error('createSpotifyPlaylist function not available');
    }

    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
  } catch (error) {
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
    if (typeof showToast === 'function') {
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        message: mapAuthError(error.message),
        duration: 7000
      });
    } else {
      alert('Authentication failed: ' + mapAuthError(error.message));
    }
  }
}

function initAuthCallback() {
  if (sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS) === 'true') {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
      handleAuthCallback(code);
    } else if (error) {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
      if (typeof showToast === 'function') {
        showToast({
          type: 'error',
          title: 'Authentication Failed',
          message: error,
          duration: 7000
        });
      } else {
        alert('Authentication failed: ' + error);
      }
    } else {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_IN_PROGRESS);
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PLAYLIST_DATA);
    }
  }
}

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

window.getSpotifyAccessToken = getSpotifyAccessToken;
window.isExtensionContextValid = isExtensionContextValid;
window.handleAuthCallback = handleAuthCallback;
window.initAuthCallback = initAuthCallback;
window.setupAuthMessageListener = setupAuthMessageListener;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getSpotifyAccessToken,
    isExtensionContextValid,
    handleAuthCallback,
    initAuthCallback,
    setupAuthMessageListener,
  };
}
