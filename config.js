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

  // Templates de playlists
  PLAYLIST_TEMPLATES: {
    'Workout': {
      mood: 'Énergique',
      icon: '💪'
    },
    'Study': {
      mood: 'Concentré',
      icon: '📚'
    },
    'Party': {
      mood: 'Festif',
      icon: '🎉'
    },
    'Chill': {
      mood: 'Détendu',
      icon: '😌'
    },
    'Road Trip': {
      mood: 'Aventureux',
      icon: '🚗'
    }
  },

  // Décennies disponibles
  DECADES: [
    { label: 'Années 60', value: '1960s', icon: '🎸' },
    { label: 'Années 70', value: '1970s', icon: '🎹' },
    { label: 'Années 80', value: '1980s', icon: '📻' },
    { label: 'Années 90', value: '1990s', icon: '💿' },
    { label: 'Années 2000', value: '2000s', icon: '📱' },
    { label: 'Années 2010', value: '2010s', icon: '🎧' },
    { label: 'Années 2020', value: '2020s', icon: '🎵' }
  ],

  // Humeurs disponibles
  MOODS: [
    { label: 'Énergique', value: 'energetic', icon: '⚡', color: '#ff6b6b' },
    { label: 'Relaxant', value: 'relaxing', icon: '🌊', color: '#4ecdc4' },
    { label: 'Mélancolique', value: 'melancholic', icon: '🌙', color: '#95a5a6' },
    { label: 'Festif', value: 'festive', icon: '🎊', color: '#feca57' },
    { label: 'Romantique', value: 'romantic', icon: '💕', color: '#ff9ff3' },
    { label: 'Motivant', value: 'motivational', icon: '🔥', color: '#ee5a6f' }
  ],

  // Durées disponibles
  DURATIONS: [
    { label: 'Courte (15-30 min)', value: 'short', icon: '⏱️' },
    { label: 'Moyenne (30-60 min)', value: 'medium', icon: '⏰' },
    { label: 'Longue (60+ min)', value: 'long', icon: '⏳' }
  ],

  // Pays d'origine disponibles
  COUNTRIES: [
    { label: 'Any Country', value: null, icon: '🌍', flag: '' },
    { label: 'France', value: 'FR', icon: '🇫🇷', flag: 'FR' },
    { label: 'Germany', value: 'GER', icon: '🇩🇪', flag: 'GER' },
    { label: 'United Kingdom', value: 'ENG', icon: '🇬🇧', flag: 'ENG' },
    { label: 'United States', value: 'US', icon: '🇺🇸', flag: 'US' },
    { label: 'Canada', value: 'CA', icon: '🇨🇦', flag: 'CA' },
    { label: 'Spain', value: 'ES', icon: '🇪🇸', flag: 'ES' },
    { label: 'Italy', value: 'IT', icon: '🇮🇹', flag: 'IT' },
    { label: 'Japan', value: 'JP', icon: '🇯🇵', flag: 'JP' },
    { label: 'South Korea', value: 'KR', icon: '🇰🇷', flag: 'KR' },
    { label: 'Brazil', value: 'BR', icon: '🇧🇷', flag: 'BR' },
    { label: 'Australia', value: 'AU', icon: '🇦🇺', flag: 'AU' }
  ],

  // Genres rares pour le mode Découverte
  DISCOVERY_GENRES: [
    'Post-Rock', 'Shoegaze', 'Krautrock', 'Noise Rock', 'Math Rock',
    'Dark Ambient', 'IDM', 'Glitch Hop', 'Neurofunk', 'Psytrance',
    'Avant-Garde Jazz', 'Free Jazz', 'Jazz Fusion', 'Progressive Rock',
    'Post-Punk', 'Gothic Rock', 'Industrial', 'EBM', 'Trip Hop',
    'World Music', 'Ethnic Fusion', 'Neofolk', 'Darkwave', 'Synthwave'
  ],

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

