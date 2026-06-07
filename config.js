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

  // Pays d'origine disponibles (recherche + multi-sélection côté UI).
  // `value` = nom anglais envoyé au backend (utilisé dans le prompt IA).
  COUNTRIES: [
    // North America
    { label: 'United States', value: 'United States', flag: '🇺🇸', region: 'North America' },
    { label: 'Canada', value: 'Canada', flag: '🇨🇦', region: 'North America' },
    { label: 'Mexico', value: 'Mexico', flag: '🇲🇽', region: 'North America' },
    // Latin America
    { label: 'Brazil', value: 'Brazil', flag: '🇧🇷', region: 'Latin America' },
    { label: 'Argentina', value: 'Argentina', flag: '🇦🇷', region: 'Latin America' },
    { label: 'Chile', value: 'Chile', flag: '🇨🇱', region: 'Latin America' },
    { label: 'Colombia', value: 'Colombia', flag: '🇨🇴', region: 'Latin America' },
    { label: 'Peru', value: 'Peru', flag: '🇵🇪', region: 'Latin America' },
    { label: 'Cuba', value: 'Cuba', flag: '🇨🇺', region: 'Latin America' },
    { label: 'Puerto Rico', value: 'Puerto Rico', flag: '🇵🇷', region: 'Latin America' },
    { label: 'Jamaica', value: 'Jamaica', flag: '🇯🇲', region: 'Latin America' },
    { label: 'Uruguay', value: 'Uruguay', flag: '🇺🇾', region: 'Latin America' },
    { label: 'Venezuela', value: 'Venezuela', flag: '🇻🇪', region: 'Latin America' },
    // Western Europe
    { label: 'United Kingdom', value: 'United Kingdom', flag: '🇬🇧', region: 'Western Europe' },
    { label: 'Ireland', value: 'Ireland', flag: '🇮🇪', region: 'Western Europe' },
    { label: 'France', value: 'France', flag: '🇫🇷', region: 'Western Europe' },
    { label: 'Germany', value: 'Germany', flag: '🇩🇪', region: 'Western Europe' },
    { label: 'Spain', value: 'Spain', flag: '🇪🇸', region: 'Western Europe' },
    { label: 'Portugal', value: 'Portugal', flag: '🇵🇹', region: 'Western Europe' },
    { label: 'Italy', value: 'Italy', flag: '🇮🇹', region: 'Western Europe' },
    { label: 'Netherlands', value: 'Netherlands', flag: '🇳🇱', region: 'Western Europe' },
    { label: 'Belgium', value: 'Belgium', flag: '🇧🇪', region: 'Western Europe' },
    { label: 'Switzerland', value: 'Switzerland', flag: '🇨🇭', region: 'Western Europe' },
    { label: 'Austria', value: 'Austria', flag: '🇦🇹', region: 'Western Europe' },
    // Nordics
    { label: 'Sweden', value: 'Sweden', flag: '🇸🇪', region: 'Nordics' },
    { label: 'Norway', value: 'Norway', flag: '🇳🇴', region: 'Nordics' },
    { label: 'Denmark', value: 'Denmark', flag: '🇩🇰', region: 'Nordics' },
    { label: 'Finland', value: 'Finland', flag: '🇫🇮', region: 'Nordics' },
    { label: 'Iceland', value: 'Iceland', flag: '🇮🇸', region: 'Nordics' },
    // Eastern Europe
    { label: 'Poland', value: 'Poland', flag: '🇵🇱', region: 'Eastern Europe' },
    { label: 'Russia', value: 'Russia', flag: '🇷🇺', region: 'Eastern Europe' },
    { label: 'Ukraine', value: 'Ukraine', flag: '🇺🇦', region: 'Eastern Europe' },
    { label: 'Czechia', value: 'Czechia', flag: '🇨🇿', region: 'Eastern Europe' },
    { label: 'Hungary', value: 'Hungary', flag: '🇭🇺', region: 'Eastern Europe' },
    { label: 'Romania', value: 'Romania', flag: '🇷🇴', region: 'Eastern Europe' },
    { label: 'Greece', value: 'Greece', flag: '🇬🇷', region: 'Eastern Europe' },
    { label: 'Croatia', value: 'Croatia', flag: '🇭🇷', region: 'Eastern Europe' },
    { label: 'Serbia', value: 'Serbia', flag: '🇷🇸', region: 'Eastern Europe' },
    // Middle East & North Africa
    { label: 'Turkey', value: 'Turkey', flag: '🇹🇷', region: 'Middle East & North Africa' },
    { label: 'Israel', value: 'Israel', flag: '🇮🇱', region: 'Middle East & North Africa' },
    { label: 'Egypt', value: 'Egypt', flag: '🇪🇬', region: 'Middle East & North Africa' },
    { label: 'Morocco', value: 'Morocco', flag: '🇲🇦', region: 'Middle East & North Africa' },
    { label: 'Algeria', value: 'Algeria', flag: '🇩🇿', region: 'Middle East & North Africa' },
    { label: 'Tunisia', value: 'Tunisia', flag: '🇹🇳', region: 'Middle East & North Africa' },
    { label: 'Lebanon', value: 'Lebanon', flag: '🇱🇧', region: 'Middle East & North Africa' },
    { label: 'Saudi Arabia', value: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East & North Africa' },
    { label: 'United Arab Emirates', value: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East & North Africa' },
    { label: 'Iran', value: 'Iran', flag: '🇮🇷', region: 'Middle East & North Africa' },
    // Sub-Saharan Africa
    { label: 'Nigeria', value: 'Nigeria', flag: '🇳🇬', region: 'Sub-Saharan Africa' },
    { label: 'South Africa', value: 'South Africa', flag: '🇿🇦', region: 'Sub-Saharan Africa' },
    { label: 'Ghana', value: 'Ghana', flag: '🇬🇭', region: 'Sub-Saharan Africa' },
    { label: 'Senegal', value: 'Senegal', flag: '🇸🇳', region: 'Sub-Saharan Africa' },
    { label: 'Kenya', value: 'Kenya', flag: '🇰🇪', region: 'Sub-Saharan Africa' },
    { label: 'Ethiopia', value: 'Ethiopia', flag: '🇪🇹', region: 'Sub-Saharan Africa' },
    { label: 'Mali', value: 'Mali', flag: '🇲🇱', region: 'Sub-Saharan Africa' },
    { label: 'Ivory Coast', value: 'Ivory Coast', flag: '🇨🇮', region: 'Sub-Saharan Africa' },
    { label: 'Congo (DRC)', value: 'Democratic Republic of the Congo', flag: '🇨🇩', region: 'Sub-Saharan Africa' },
    { label: 'Angola', value: 'Angola', flag: '🇦🇴', region: 'Sub-Saharan Africa' },
    // East Asia
    { label: 'Japan', value: 'Japan', flag: '🇯🇵', region: 'East Asia' },
    { label: 'South Korea', value: 'South Korea', flag: '🇰🇷', region: 'East Asia' },
    { label: 'China', value: 'China', flag: '🇨🇳', region: 'East Asia' },
    { label: 'Taiwan', value: 'Taiwan', flag: '🇹🇼', region: 'East Asia' },
    { label: 'Hong Kong', value: 'Hong Kong', flag: '🇭🇰', region: 'East Asia' },
    { label: 'Mongolia', value: 'Mongolia', flag: '🇲🇳', region: 'East Asia' },
    // South & Southeast Asia
    { label: 'India', value: 'India', flag: '🇮🇳', region: 'South & Southeast Asia' },
    { label: 'Pakistan', value: 'Pakistan', flag: '🇵🇰', region: 'South & Southeast Asia' },
    { label: 'Bangladesh', value: 'Bangladesh', flag: '🇧🇩', region: 'South & Southeast Asia' },
    { label: 'Indonesia', value: 'Indonesia', flag: '🇮🇩', region: 'South & Southeast Asia' },
    { label: 'Philippines', value: 'Philippines', flag: '🇵🇭', region: 'South & Southeast Asia' },
    { label: 'Thailand', value: 'Thailand', flag: '🇹🇭', region: 'South & Southeast Asia' },
    { label: 'Vietnam', value: 'Vietnam', flag: '🇻🇳', region: 'South & Southeast Asia' },
    { label: 'Malaysia', value: 'Malaysia', flag: '🇲🇾', region: 'South & Southeast Asia' },
    { label: 'Singapore', value: 'Singapore', flag: '🇸🇬', region: 'South & Southeast Asia' },
    // Oceania
    { label: 'Australia', value: 'Australia', flag: '🇦🇺', region: 'Oceania' },
    { label: 'New Zealand', value: 'New Zealand', flag: '🇳🇿', region: 'Oceania' }
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
    CUSTOM_TEMPLATES: 'customPlaylistTemplates'
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

