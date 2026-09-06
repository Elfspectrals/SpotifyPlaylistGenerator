// Module API - Tous les appels API vers le serveur backend

// Import de la configuration (sera disponible via script tag dans le navigateur)
// const { CONFIG, getApiUrl } = require('./config.js');

// Fonction helper pour faire des requêtes avec gestion d'erreur
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Générer une playlist avec l'IA.
// Le 3e argument accepte un objet d'options Radio: { energy, popularity,
// surprise, era, mood, duration, fusion, vibePrompt, journey, languages }.
// countries / countryOrigin are always sent as "" (origin UI removed).
async function generatePlaylist(selectedGenres, songCount, optionsOrCountry = null) {
  const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.GENERATE_PLAYLIST}`;

  const options = (optionsOrCountry && typeof optionsOrCountry === 'object' && !Array.isArray(optionsOrCountry))
    ? optionsOrCountry
    : {};

  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      selectedGenres,
      songCount,
      countries: '',
      countryOrigin: '',
      languages: '',
      ...options
    }),
    mode: 'cors',
    credentials: 'omit'
  });
}

// Obtenir l'URL d'authentification Spotify
async function getSpotifyAuthUrl() {
  const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.SPOTIFY_AUTH}`;
  const response = await fetch(url);
  const data = await response.json();
  
  // Handle SpotAPI mode
  if (data.mode === 'spotapi') {
    if (data.requiresCredentials) {
      // Need to set credentials - return setup URL
      return { authUrl: data.setupUrl || data.authUrl };
    } else {
      // Credentials already set - return success (no OAuth needed)
      return { 
        success: true, 
        mode: 'spotapi',
        authUrl: null,
        accessToken: 'spotapi-authenticated' // Dummy token for compatibility
      };
    }
  }
  
  // OAuth mode (legacy)
  return data;
}

// Échanger le code d'authentification contre un token
async function exchangeCodeForToken(code) {
  const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.SPOTIFY_TOKEN}`;
  
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

// Rafraîchir un token Spotify expiré
async function refreshSpotifyToken(refreshToken) {
  const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.REFRESH_SPOTIFY_TOKEN}`;
  
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
}

function sendExtensionMessage(payload) {
  return new Promise((resolve, reject) => {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
      reject(new Error('Extension context not available'));
      return;
    }
    chrome.runtime.sendMessage(payload, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response) {
        reject(new Error('Empty extension response'));
        return;
      }
      if (response.error) {
        reject(new Error(response.error));
        return;
      }
      resolve(response);
    });
  });
}

// Créer une nouvelle playlist Spotify from the extension worker (token never leaves the browser).
async function createSpotifyPlaylistAPI(_accessToken, playlistData) {
  return sendExtensionMessage({
    type: 'createSpotifyPlaylist',
    playlistData
  });
}

// Ajouter des chansons à une playlist Spotify existante from the extension worker.
async function addSongsToSpotifyPlaylist(_accessToken, playlistId, playlistData) {
  return sendExtensionMessage({
    type: 'addToSpotifyPlaylist',
    playlistId,
    playlistData
  });
}

// Exposer les fonctions globalement pour utilisation dans content.js
window.generatePlaylist = generatePlaylist;
window.getSpotifyAuthUrl = getSpotifyAuthUrl;
window.exchangeCodeForToken = exchangeCodeForToken;
window.refreshSpotifyToken = refreshSpotifyToken;
window.createSpotifyPlaylistAPI = createSpotifyPlaylistAPI;
window.addSongsToSpotifyPlaylist = addSongsToSpotifyPlaylist;

// Export pour utilisation dans d'autres modules (si Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generatePlaylist,
    getSpotifyAuthUrl,
    exchangeCodeForToken,
    refreshSpotifyToken,
    createSpotifyPlaylist: createSpotifyPlaylistAPI,
    addSongsToSpotifyPlaylist
  };
}

