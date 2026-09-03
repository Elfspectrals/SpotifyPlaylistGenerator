// Configuration centralisée pour l'extension Spotify AI Playlist Generator

const CONFIG = {
  // URL du serveur backend
  API_BASE_URL: 'https://polar-ravine-64133-f97528c41675.herokuapp.com',

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

  // Langues de chant principales (lyrics / vocals).
  LANGUAGES: [
    { label: 'English', value: 'English', flag: '🇬🇧', region: 'Western' },
    { label: 'French', value: 'French', flag: '🇫🇷', region: 'Western' },
    { label: 'Spanish', value: 'Spanish', flag: '🇪🇸', region: 'Western' },
    { label: 'Portuguese', value: 'Portuguese', flag: '🇵🇹', region: 'Western' },
    { label: 'German', value: 'German', flag: '🇩🇪', region: 'Western' },
    { label: 'Italian', value: 'Italian', flag: '🇮🇹', region: 'Western' },
    { label: 'Russian', value: 'Russian', flag: '🇷🇺', region: 'Western' },
    { label: 'Dutch', value: 'Dutch', flag: '🇳🇱', region: 'Western' },
    { label: 'Polish', value: 'Polish', flag: '🇵🇱', region: 'Western' },
    { label: 'Turkish', value: 'Turkish', flag: '🇹🇷', region: 'Western' },
    { label: 'Chinese', value: 'Chinese', flag: '🇨🇳', region: 'Asian' },
    { label: 'Japanese', value: 'Japanese', flag: '🇯🇵', region: 'Asian' },
    { label: 'Korean', value: 'Korean', flag: '🇰🇷', region: 'Asian' },
    { label: 'Arabic', value: 'Arabic', flag: '🇸🇦', region: 'Asian' },
    { label: 'Hindi', value: 'Hindi', flag: '🇮🇳', region: 'Asian' },
    { label: 'Indonesian', value: 'Indonesian', flag: '🇮🇩', region: 'Asian' },
    { label: 'Instrumental', value: 'Instrumental', flag: '🎻', region: 'Other' }
  ],

  // Tempo / BPM hints (optional, used by the Radio panel)
  TEMPOS: [
    { label: 'Any', value: null },
    { label: 'Slow', value: 'slow' },
    { label: 'Mid', value: 'mid' },
    { label: 'Fast', value: 'fast' }
  ],

  // Curated vibe presets (one click sets genres + radio knobs)
  VIBE_PRESETS: [
    { label: '3 A.M. Drive', icon: '🌃', genres: ['Synthwave', 'Trip Hop', 'Lo-Fi'], energy: 35, popularity: 45, surprise: 55, mood: 'relaxing' },
    { label: 'Boss Fight', icon: '🎮', genres: ['Metal', 'Electronic', 'Industrial'], energy: 95, popularity: 50, surprise: 60, mood: 'energetic' },
    { label: 'Sunday Café', icon: '☕', genres: ['Jazz', 'Bossa Nova', 'Soul'], energy: 25, popularity: 55, surprise: 40, mood: 'relaxing' },
    { label: 'Heartbreak', icon: '💔', genres: ['Indie', 'Singer-Songwriter', 'Soul'], energy: 30, popularity: 50, surprise: 45, mood: 'melancholic' },
    { label: 'Workout Beast', icon: '💪', genres: ['Hip Hop', 'EDM', 'Trap'], energy: 90, popularity: 70, surprise: 35, mood: 'motivational' },
    { label: 'Festival Peak', icon: '🎉', genres: ['House', 'Pop', 'Dance'], energy: 85, popularity: 80, surprise: 40, mood: 'festive' },
    { label: 'Deep Focus', icon: '🧠', genres: ['Ambient', 'Classical', 'IDM'], energy: 20, popularity: 35, surprise: 50, mood: 'relaxing' },
    { label: 'Rebel Yell', icon: '🤘', genres: ['Punk', 'Garage Rock', 'Post-Punk'], energy: 88, popularity: 40, surprise: 65, mood: 'energetic' }
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
    SELECTED_PLAYLIST: 'selectedPlaylist',
    CUSTOM_PRESETS: 'spgCustomVibePresets'
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

