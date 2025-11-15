// Configuration centralisée pour l'extension Spotify AI Playlist Generator

const CONFIG = {
  // URL du serveur backend
  API_BASE_URL: 'https://gemini.niperiusland.fr:4005',
  
  // Endpoints API
  ENDPOINTS: {
    GENERATE_PLAYLIST: '/generate-playlist',
    CREATE_SPOTIFY_PLAYLIST: '/create-spotify-playlist',
    ADD_TO_SPOTIFY_PLAYLIST: '/add-to-spotify-playlist',
    SPOTIFY_AUTH: '/spotify-auth',
    SPOTIFY_TOKEN: '/spotify-token',
    REFRESH_SPOTIFY_TOKEN: '/refresh-spotify-token'
  },
  
  // Timeouts et délais
  TIMEOUTS: {
    ELEMENT_WAIT: 10000, // 10 secondes
    AUTH_TIMEOUT: 300000, // 5 minutes
    CLEANUP_INTERVAL: 5000, // 5 secondes
    PAGE_LOAD_DELAY: 1000, // 1 seconde
    RETRY_DELAY: 2000 // 2 secondes
  },
  
  // Options par défaut
  DEFAULTS: {
    SONG_COUNT: 5,
    SONG_COUNT_OPTIONS: [3, 5, 8, 10, 15]
  },
  
  // Clés de stockage
  STORAGE_KEYS: {
    AUTH_IN_PROGRESS: 'authInProgress',
    PENDING_PLAYLIST_DATA: 'pendingPlaylistData',
    PENDING_PLAYLIST_ID: 'pendingPlaylistId',
    SELECTED_PLAYLIST: 'selectedPlaylist'
  },
  
  // Sélecteurs DOM
  SELECTORS: {
    AI_PLAYLIST_BUTTON: 'button[aria-label="AI Playlist"]',
    CHOOSE_PLAYLIST_BUTTON: 'button[aria-label="Choose Playlist"]',
    CREATE_BUTTON: [
      'button[aria-label="Create"]',
      'button[aria-label="Créer"]',
      'button[aria-label="Create playlist"]',
      'button[aria-label="Créer une playlist"]'
    ]
  }
};

// Fonction helper pour construire une URL complète
function getApiUrl(endpoint) {
  return `${CONFIG.API_BASE_URL}${endpoint}`;
}

// Exposer CONFIG globalement pour utilisation dans tous les modules
window.CONFIG = CONFIG;
window.getApiUrl = getApiUrl;

// Export pour utilisation dans d'autres modules (si Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, getApiUrl };
}

